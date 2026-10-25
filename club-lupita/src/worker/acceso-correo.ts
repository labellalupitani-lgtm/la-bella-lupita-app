import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import type { Env, Vars } from './index'
import { codigoDeSeis, firmar, huella, igualEnTiempoConstante } from './sesion'
import { transaccion } from './operacion'
import { telefonoNormalizado } from './acceso'
import { enviarCodigo } from './correo'

const correoNormalizado = (v: unknown) => typeof v === 'string' ? v.trim().toLowerCase() : ''
const correoValido = (v: string) => v.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(v)
const uuid = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(v)
export const correoHabilitado = (env: Env) => env.ACCESO_CORREO === 'true' && (!!env.RESEND_API_KEY || !!env.EMAIL) && !!env.EMAIL_FROM

export function registrarAccesoCorreo(app: Hono<{Bindings: Env; Variables: Vars}>) {
  app.use('/api/auth/correo/*', async (c, next) => {
    c.header('Cache-Control', 'no-store')
    if (!correoHabilitado(c.env)) return c.json({error:'El acceso por correo todavía no está disponible. Intentá de nuevo más tarde.'},503)
    await next()
  })

  app.post('/api/auth/correo/codigo', async c => {
    const cuerpo = await c.req.json().catch(() => null)
    const correo = correoNormalizado(cuerpo?.correo)
    if (!correoValido(correo)) return c.json({error:'Revisá tu dirección de correo.'},422)
    const codigo = codigoDeSeis(), id = crypto.randomUUID()
    const firma = await huella(c.env.SESION_SECRETO, `${correo}:${id}:${codigo}`)
    const ip = await huella(c.env.SESION_SECRETO, 'correo-ip:'+(c.req.header('cf-connecting-ip') ?? 'local'))
    const claveCorreo = await huella(c.env.SESION_SECRETO, 'correo-envio:'+correo)
    const emitido = await transaccion(c.env, async cli => {
      await cli.query('SELECT pg_advisory_xact_lock(hashtext($1))',['correo:'+correo])
      const {rows:[limite]} = await cli.query('SELECT limitar_acceso($1,20,3600) AND limitar_acceso($2,5,3600) AS ok',[ip,claveCorreo])
      if (!limite.ok) return 'limite'
      const {rows} = await cli.query("SELECT id FROM codigo_correo WHERE correo=$1 AND creado>now()-interval '60 seconds' LIMIT 1",[correo])
      if (rows.length) return 'espera'
      // Reserva atómica ANTES del envío. Los fallos también consumen una
      // reserva por prudencia; ninguna carrera puede sobrepasar la cuota.
      // 31 días móviles protege cualquier ciclo mensual del proveedor.
      await cli.query('SELECT pg_advisory_xact_lock(hashtext($1))',['cuota-global-correo'])
      const {rows:[cuota]} = await cli.query("SELECT count(*) FILTER (WHERE creado >= date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')::int AS dia, count(*)::int AS mes FROM codigo_correo WHERE creado>now()-interval '31 days'")
      if (cuota.dia>=100||cuota.mes>=3000) return 'cuota'
      await cli.query('UPDATE codigo_correo SET usado=coalesce(usado,now()),registro_usado=now() WHERE correo=$1',[correo])
      await cli.query('INSERT INTO codigo_correo(id,correo,huella) VALUES($1,$2,$3)',[id,correo,firma])
      return 'ok'
    })
    if (emitido !== 'ok') return c.json({error:emitido==='cuota'?'Alcanzamos el límite de correos disponibles. Intentá más tarde; si ya tenés una sesión abierta, podés seguir usándola.':emitido==='espera'?'Esperá un minuto antes de pedir otro código.':'Pediste varios códigos. Esperá una hora antes de intentar otra vez.'},429)
    try {
      await enviarCodigo(c.env,correo,codigo,id)
    } catch {
      const sql = neon(c.env.DATABASE_URL)
      await sql`UPDATE codigo_correo SET usado=now(),registro_usado=now() WHERE id=${id}`
      return c.json({error:'No pudimos enviar el correo. Intentá de nuevo más tarde.'},503)
    }
    return c.json({enviado:true,solicitud:id})
  })

  app.post('/api/auth/correo/verificar', async c => {
    const r = await c.req.json().catch(() => null), correo = correoNormalizado(r?.correo)
    if (!correoValido(correo)||!uuid(r?.solicitud)||typeof r?.codigo!=='string'||!/^\d{6}$/.test(r.codigo)) return c.json({error:'Revisá el correo y los seis dígitos del código.'},422)
    const firma = await huella(c.env.SESION_SECRETO,`${correo}:${r.solicitud}:${r.codigo}`)
    return transaccion(c.env, async cli => {
      await cli.query('SELECT pg_advisory_xact_lock(hashtext($1))',['correo:'+correo])
      const {rows:[codigo]} = await cli.query('SELECT *,vence>now() AS vigente FROM codigo_correo WHERE id=$1 AND correo=$2 FOR UPDATE',[r.solicitud,correo])
      if (!codigo||codigo.usado||!codigo.vigente) return c.json({error:'El código venció o ya se usó. Pedí otro.'},410)
      if (codigo.intentos>=5) return c.json({error:'Demasiados intentos. Pedí un código nuevo.'},429)
      if (!igualEnTiempoConstante(firma,codigo.huella)) {
        await cli.query('UPDATE codigo_correo SET intentos=intentos+1 WHERE id=$1',[codigo.id])
        return c.json({error:'El código no coincide. Revisalo e intentá de nuevo.'},401)
      }
      await cli.query('UPDATE codigo_correo SET usado=now() WHERE id=$1',[codigo.id])
      const {rows:[socio]} = await cli.query('SELECT telefono,nombre,baja FROM operativo_socio WHERE lower(correo)=$1',[correo])
      if (socio?.baja) return c.json({error:'Esta cuenta no está activa. Consultá en la casa.'},403)
      if (socio) {
        const token = await firmar(c.env.SESION_SECRETO,{tel:socio.telefono,rol:'socio',exp:Date.now()+30*24*3600000})
        return c.json({token,socio:{nombre:socio.nombre,telefono:socio.telefono}})
      }
      const registro = crypto.randomUUID()+crypto.randomUUID()
      await cli.query("UPDATE codigo_correo SET registro_huella=$2,registro_vence=now()+interval '10 minutes' WHERE id=$1",[codigo.id,await huella(c.env.SESION_SECRETO,registro)])
      return c.json({requierePerfil:true,registro})
    })
  })

  app.post('/api/auth/correo/registro', async c => {
    const r = await c.req.json().catch(() => null)
    if (r?.promociones !== undefined && typeof r.promociones !== 'boolean') return c.json({error:'Revisá tu preferencia de promociones.'},422)
    const promociones = r?.promociones === true
    const nombre = typeof r?.nombre==='string'?r.nombre.trim():''
    const telefono = telefonoNormalizado(r?.telefono)
    if (!uuid(r?.solicitud)||typeof r?.registro!=='string'||r.registro.length!==72) return c.json({error:'Verificá tu correo nuevamente para continuar.'},422)
    if (nombre.length<2||nombre.length>80||/[\u0000-\u001f]/.test(nombre)) return c.json({error:'Escribí tu nombre, de 2 a 80 caracteres.'},422)
    if (!/^[1-9]\d{7,14}$/.test(telefono)) return c.json({error:'Revisá el teléfono, incluido el código de país.'},422)
    if (telefono==='50587442005') return c.json({error:'Usá tu número personal. Este número está reservado para la cuenta de muestra.'},422)
    const firma = await huella(c.env.SESION_SECRETO,r.registro)
    return transaccion(c.env, async cli => {
      const {rows:[codigo]} = await cli.query('SELECT *,registro_vence>now() AS vigente FROM codigo_correo WHERE id=$1 FOR UPDATE',[r.solicitud])
      if (!codigo?.registro_huella||!codigo.usado||codigo.registro_usado||!codigo.vigente||!igualEnTiempoConstante(firma,codigo.registro_huella)) return c.json({error:'La verificación venció o ya se usó. Verificá tu correo nuevamente.'},410)
      // Compartir un teléfono NO demuestra propiedad de una cuenta anterior.
      // Nunca vinculamos ni recuperamos saldos a partir de un contacto declarado.
      await cli.query('SELECT pg_advisory_xact_lock(hashtext($1))',['acceso:'+telefono])
      const {rows:existentes} = await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 OR lower(correo)=$2',[telefono,codigo.correo])
      if (existentes.length) return c.json({error:'No podemos crear la cuenta con estos datos. Si ya tenés cuenta, entrá con tu correo o consultá en la casa para vincularla.'},409)
      const {rows:[socio]} = await cli.query("INSERT INTO socio(telefono,nombre,correo,correo_verificado,promociones_correo,promociones_aceptadas,promociones_version,origen) VALUES($1,$2,$3,now(),$4,CASE WHEN $4 THEN now() ELSE NULL END,CASE WHEN $4 THEN 'registro-correo-v1' ELSE NULL END,'correo') RETURNING id",[telefono,nombre,codigo.correo,promociones])
      const {rows:[tanda]} = await cli.query('INSERT INTO tanda(socio_id) VALUES($1) RETURNING id',[socio.id])
      await cli.query("INSERT INTO sello(tanda_id,n,motivo,ref_externa) VALUES($1,1,'De parte de la casa',$2),($1,2,'De parte de la casa',$3)",[tanda.id,'regalo-1-'+socio.id,'regalo-2-'+socio.id])
      await cli.query('UPDATE codigo_correo SET registro_usado=now() WHERE id=$1',[codigo.id])
      const token = await firmar(c.env.SESION_SECRETO,{tel:telefono,rol:'socio',exp:Date.now()+30*24*3600000})
      return c.json({token,socio:{nombre,telefono}})
    })
  })
}
