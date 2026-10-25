import type { Hono, Context } from 'hono'
import { neon, type Client } from '@neondatabase/serverless'
import type { Env, Vars, enTransaccion } from './index'
import { transaccion } from './operacion'
import { digest, uuid } from './equipo-sesion'
import { FICHA_TIENDA, EVENTOS_TIENDA, fichaValida, faltantesFicha, type OfertaTienda, type CotizacionTienda } from '../compartido/tienda'
type C = Context<{ Bindings: Env; Variables: Vars }>
const fallo = (error: string, status = 422) => Response.json({ error }, { status })
const refValida = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(v)
const equipo = (c: C) => c.get('sesion').rol === 'casa' && ['propietario','encargado','caja'].includes(c.get('permiso'))
const admin = (c: C) => equipo(c) && ['propietario','encargado'].includes(c.get('permiso'))
const publica = (o: OfertaTienda): OfertaTienda => ({...o,ficha:{...o.ficha,fuente:''}})
async function miembro(cli: Client, tel: string) {
  const { rows: [s] } = await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE', [tel])
  return s?.id as string | undefined
}
async function oferta(cli: Client, bloquear = false): Promise<OfertaTienda> {
  // Mismo orden de bloqueo para configuración y compra. El lote no se interpreta como un año.
  const { rows: [l] } = await cli.query('SELECT generacion,ficha,revision FROM tienda_lote WHERE generacion=(SELECT max(generacion) FROM reserva_cosecha)' + (bloquear ? ' FOR UPDATE' : ''))
  const { rows: [n] } = await cli.query(`SELECT COALESCE(max(generacion),0)::int AS generacion,COALESCE(min(precio),0)::int AS precio,COALESCE(max(precio),0)::int AS maximo,
    count(*)::int AS total,count(*) FILTER(WHERE apartada IS NULL)::int AS quedan,(now() AT TIME ZONE 'America/Managua')::date::text AS hoy
    FROM reserva_cosecha WHERE generacion=(SELECT max(generacion) FROM reserva_cosecha)`)
  const ficha = l?.ficha ?? FICHA_TIENDA
  const motivo = !l || !fichaValida(ficha) || !ficha.habilitada || faltantesFicha(ficha).length ? 'Estamos confirmando la presentación y las condiciones de retiro. Consultá con la casa.'
    : ficha.retiroHasta < n.hoy ? 'La ventana de retiro de este lote terminó. Consultá por el próximo lote.'
    : n.precio <= 0 || n.precio !== n.maximo ? 'Estamos actualizando el precio del lote. Volvé a consultar.'
    : n.quedan === 0 ? 'Este lote está apartado. Consultá por el próximo lote.' : ''
  return { generacion: n.generacion, revision: l?.revision ?? 0, precio: n.precio, quedan: n.quedan, total: n.total, ficha, disponible: !motivo, motivo }
}
async function recibo(cli: Client, socio: string, ref: string) {
  const { rows: [r] } = await cli.query("SELECT respuesta FROM operativo_solicitud_compra WHERE socio_id=$1 AND referencia=$2 AND operacion='bolsa'", [socio, 'sol:' + ref])
  return r?.respuesta
}
export async function cambiarBolsa(c: C, id: string, estado: unknown, motivo: unknown = ''): Promise<Response> {
  if (!equipo(c)) return fallo('Acceso exclusivo del equipo de atención.',403)
  if (!uuid(id) || !['lista','entregada','reembolsada'].includes(String(estado))) return fallo('Revisá el comprobante y el estado.')
  if (estado === 'reembolsada' && !admin(c)) return fallo('La devolución requiere administración.',403)
  if (typeof motivo !== 'string' || motivo.length > 500 || estado === 'reembolsada' && motivo.trim().length < 5) return fallo('Escribí el motivo de la devolución (5 a 500 caracteres).')
  return transaccion(c.env, async cli => {
    const { rows: [dueño] } = await cli.query('SELECT socio_id FROM operativo_compra_bolsa WHERE id=$1', [id])
    if (!dueño) return fallo('Comprobante no encontrado.',404)
    await cli.query('SELECT id FROM operativo_socio WHERE id=$1 FOR UPDATE', [dueño.socio_id])
    const { rows: [b] } = await cli.query('SELECT * FROM operativo_compra_bolsa WHERE id=$1 FOR UPDATE', [id])
    if (b.estado === estado) return c.json({ registrado: true, repetido: true, estado })
    if (['entregada','reembolsada'].includes(b.estado)) return fallo('Esta bolsa ya está cerrada. Revisá su historial.',409)
    if (estado === 'entregada' && b.estado !== 'lista') return fallo('Primero marcá la bolsa como lista en Tienda del equipo.',409)
    const quien = c.get('sesion').empleado ?? 'propietario'
    if (estado === 'reembolsada') {
      if (!b.referencia) return fallo('Compra histórica sin vínculo al cobro. Administración debe conciliar el asiento original antes de devolverla.',409)
      const { rows } = await cli.query(`INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa,quien,nota,devolucion_de)
        SELECT $1,$2,'ajuste',$3,$4,$5,$6,id FROM operativo_asiento WHERE socio_id=$1 AND ref_externa=$7 AND monto=-$2::integer RETURNING id`,
        [b.socio_id,b.total,'Devolución · bolsa '+b.numero,'devolucion-bolsa:'+id,quien,motivo,'sol:'+b.referencia])
      if (rows.length !== 1) throw Error('tienda-devolucion-sin-asiento-original')
      await cli.query(`INSERT INTO punto(socio_id,puntos,motivo,origen_id,concepto)
        SELECT $1,-p.puntos,'ajuste',$2,$3 FROM operativo_punto p JOIN operativo_asiento a ON p.origen_id=a.id::text
        WHERE a.socio_id=$1 AND a.ref_externa=$4 AND p.motivo='consumo' ON CONFLICT DO NOTHING`,
        [b.socio_id,'devolucion-bolsa:'+id,'Devolución · bolsa '+b.numero,'sol:'+b.referencia])
    }
    await cli.query(`UPDATE compra_bolsa SET estado=$2,lista=CASE WHEN $2='lista' THEN now() ELSE lista END,
      entregada=CASE WHEN $2='entregada' THEN now() ELSE entregada END,entregada_por=CASE WHEN $2='entregada' THEN $3 ELSE entregada_por END,
      reembolsada=CASE WHEN $2='reembolsada' THEN now() ELSE reembolsada END,motivo=CASE WHEN $2='reembolsada' THEN $4 ELSE motivo END WHERE id=$1`,[id,estado,quien,motivo])
    await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'tienda_estado',$2,$3::jsonb)",[quien,b.socio_id,JSON.stringify({compra:id,anterior:b.estado,estado,motivo})])
    const texto = estado === 'lista' ? `Tu bolsa ${b.numero}, lote ${b.generacion}, está lista. Consultá las condiciones en Mis compras y reservas.` : estado === 'reembolsada' ? `Devolvimos el importe de la bolsa ${b.numero} a tu Cuenta de Casa. Motivo: ${motivo}` : `Registramos la entrega de tu bolsa ${b.numero}, lote ${b.generacion}.`
    await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3)',[b.socio_id,'bolsa:'+id+':'+estado,texto])
    // Un número devuelto no se reasigna: el comprobante histórico sigue identificando una sola bolsa.
    return c.json({ registrado:true, estado })
  })
}

export function registrarTienda(app: Hono<{ Bindings: Env; Variables: Vars }>, cobrar: typeof enTransaccion) {
  app.get('/api/tienda', c => transaccion(c.env, async cli => c.json(publica(await oferta(cli)))))
  app.post('/api/tienda/cotizar', async c => {
    if (c.get('sesion').rol !== 'socio') return fallo('Entrá con tu cuenta.',403)
    const { ref } = await c.req.json()
    if (!refValida(ref)) return fallo('Referencia inválida.')
    return transaccion(c.env, async cli => {
      const s = await miembro(cli,c.get('sesion').tel)
      if (!s) return fallo('Cuenta no encontrada.',404)
      if (await recibo(cli,s,ref)) return fallo('Este intento ya fue cobrado. Consultá su resultado.',409)
      const { rows: [limite] } = await cli.query('SELECT limitar_acceso($1,30,60) AS ok',['tienda-cotizar:'+s])
      if (!limite.ok) return fallo('Esperá un minuto para volver a consultar el precio.',429)
      const o = await oferta(cli)
      if (!o.disponible) return fallo(o.motivo,409)
      const q: CotizacionTienda = { id:crypto.randomUUID(),referencia:ref,vence:new Date(Date.now()+600000).toISOString(),oferta:publica(o) }
      const { rows } = await cli.query(`INSERT INTO tienda_intento(socio_id,referencia,cotizacion) VALUES($1,$2,$3::jsonb)
        ON CONFLICT(socio_id,referencia) DO UPDATE SET cotizacion=EXCLUDED.cotizacion,actualizado=now() WHERE NOT tienda_intento.cerrado RETURNING referencia`,[s,ref,JSON.stringify(q)])
      return rows.length ? c.json(q) : fallo('Ese intento está cerrado. Iniciá otro.',409)
    })
  })
  app.get('/api/tienda/recuperacion', async c => {
    if (c.get('sesion').rol !== 'socio') return fallo('Entrá con tu cuenta.',403)
    const sql=neon(c.env.DATABASE_URL)
    const intentos=await sql`SELECT i.referencia,i.creado FROM tienda_intento i JOIN operativo_socio s ON s.id=i.socio_id WHERE s.telefono=${c.get('sesion').tel} AND NOT i.cerrado ORDER BY i.creado DESC LIMIT 20`
    return c.json({intentos})
  })
  for (const cerrar of [false,true]) {
    const consultar = async (c: C) => {
      if (c.get('sesion').rol !== 'socio') return fallo('Entrá con tu cuenta.',403)
      const ref=c.req.param('ref')
      if (!refValida(ref)) return fallo('Referencia inválida.')
      const entrada=cerrar?await c.req.json():{}
      return transaccion(c.env,async cli=>{
        // Espera al cobro concurrente antes de declarar que no hubo cargo.
        const s=await miembro(cli,c.get('sesion').tel)
        if(!s)return fallo('Cuenta no encontrada.',404)
        const r=await recibo(cli,s,ref)
        if(r&&(!cerrar||entrada.confirmado!==true))return c.json({estado:'confirmado',recibo:r})
        if(cerrar){
          await cli.query(`INSERT INTO tienda_intento(socio_id,referencia,cerrado) VALUES($1,$2,true)
            ON CONFLICT(socio_id,referencia) DO UPDATE SET cerrado=true,actualizado=now()`,[s,ref])
          return c.json({estado:'cerrado'})
        }
        const {rows:[i]}=await cli.query('SELECT cotizacion,cerrado FROM tienda_intento WHERE socio_id=$1 AND referencia=$2',[s,ref])
        return c.json({estado:i?.cerrado?'cerrado':i?'sin_cobro':'ausente',cotizacion:i?.cerrado?null:i?.cotizacion??null})
      })
    }
    if(cerrar)app.post('/api/tienda/intento/:ref/cerrar',consultar)
    else app.get('/api/tienda/intento/:ref',consultar)
  }
  app.post('/api/reserva-cosecha/apartar',async c=>{
    if(c.get('sesion').rol!=='socio')return fallo('Entrá con tu cuenta.',403)
    const r=await c.req.json()
    if(!refValida(r.ref))return fallo('Falta una referencia válida de la compra.')
    const resultado=await cobrar(c,c.get('sesion').tel,async(cli,socioId,saldo)=>{
      const {rows:[i]}=await cli.query('SELECT cotizacion,cerrado FROM tienda_intento WHERE socio_id=$1 AND referencia=$2',[socioId,r.ref])
      const q=i?.cotizacion as CotizacionTienda|undefined
      if(i?.cerrado)return fallo('El intento está cerrado. Iniciá otro.',409)
      if(!q||!uuid(r.cotizacionId)||q.id!==r.cotizacionId)return fallo('Revisá y aceptá el precio y las condiciones antes de pagar.',409)
      const o=await oferta(cli,true)
      if(!o.disponible)return fallo(o.motivo,409)
      if(Date.parse(q.vence)<=Date.now()||q.oferta.revision!==o.revision||q.oferta.generacion!==o.generacion||q.oferta.precio!==o.precio)return fallo('El precio o las condiciones cambiaron, o venció la cotización. Revisá el nuevo total antes de pagar.',409)
      if(saldo<o.precio)return fallo('El saldo no alcanza. Recargá en caja y actualizá tu saldo; conservamos el intento.',409)
      const {rows:[b]}=await cli.query('SELECT numero,precio,generacion FROM reserva_cosecha WHERE generacion=$1 AND apartada IS NULL ORDER BY numero LIMIT 1 FOR UPDATE',[o.generacion])
      if(!b)return fallo('Este lote está apartado. Consultá por el próximo lote.',409)
      if(b.precio!==q.oferta.precio)return fallo('El precio cambió. Actualizá la cotización antes de pagar.',409)
      await cli.query('UPDATE reserva_cosecha SET socio_id=$1,apartada=now() WHERE numero=$2',[socioId,b.numero])
      const {rows:[compra]}=await cli.query('INSERT INTO compra_bolsa(socio_id,numero,generacion,total,referencia,cotizacion) VALUES($1,$2,$3,$4,$5,$6::jsonb) RETURNING id',[socioId,b.numero,b.generacion,b.precio,r.ref,JSON.stringify(q)])
      await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3)',[socioId,'bolsa:'+compra.id+':pagada',`Tu bolsa ${b.numero}, lote ${b.generacion}, está apartada. El comprobante está en Mis compras y reservas.`])
      return {monto:b.precio,concepto:'Reserva de Cosecha · bolsa '+b.numero,ref:'sol:'+r.ref,datos:{numero:b.numero,compra:compra.id,cotizacion:q,quedan:o.quedan-1,total:o.total}}
    },{referencia:'sol:'+r.ref,operacion:'bolsa',huella:'bolsa'})
    console.info(JSON.stringify({evento:'tienda_cobro',intento:await digest(r.ref),estado:resultado.status}))
    return resultado
  })
  app.get('/api/operacion/tienda',async c=>{
    if(!equipo(c))return fallo('Acceso exclusivo del equipo.',403)
    const pagina=Number(c.req.query('pagina')??0),estado=c.req.query('estado')??'activas'
    if(!Number.isInteger(pagina)||pagina<0||pagina>10000||!['activas','todas','reembolsada','entregada'].includes(estado))return fallo('Filtro inválido.')
    return transaccion(c.env,async cli=>{
      const o=await oferta(cli)
      const {rows:compras}=await cli.query(`SELECT b.*,s.nombre FROM operativo_compra_bolsa b JOIN operativo_socio s ON s.id=b.socio_id
        WHERE $1='todas' OR ($1='activas' AND b.estado IN ('pagada','lista')) OR b.estado=$1 ORDER BY b.creada DESC,b.id LIMIT 21 OFFSET $2`,[estado,pagina*20])
      return c.json({oferta:o,compras:compras.slice(0,20),hayMas:compras.length>20,pagina})
    })
  })
  app.post('/api/operacion/tienda/lote',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')!=='propietario')return fallo('El propietario confirma la ficha y las condiciones.',403)
    const r=await c.req.json()
    if(!fichaValida(r.ficha)||!Number.isInteger(r.revision)||!Number.isInteger(r.generacion))return fallo('Revisá los campos de la ficha.')
    if(r.ficha.habilitada&&faltantesFicha(r.ficha).length)return fallo('Completá nombre, presentación, origen, retiro, política y fuente antes de habilitar la venta.')
    if(r.ficha.foto){
      const imagen=await c.env.ASSETS?.fetch(new Request(new URL(r.ficha.foto,c.req.url),{method:'HEAD'}))
      if(!imagen?.ok||!/^image\/(png|jpeg|webp)/.test(imagen.headers.get('content-type')??''))return fallo('La fotografía debe existir entre los archivos publicados de la app.')
    }
    return transaccion(c.env,async cli=>{
      // Bloquear la configuración serializa también las compras de este lote.
      await cli.query('INSERT INTO tienda_lote(generacion,ficha) SELECT $1::integer,$2::jsonb WHERE EXISTS(SELECT 1 FROM reserva_cosecha WHERE generacion=$1::integer) ON CONFLICT DO NOTHING',[r.generacion,JSON.stringify(FICHA_TIENDA)])
      const {rows:[antes]}=await cli.query('SELECT ficha,revision FROM tienda_lote WHERE generacion=$1 FOR UPDATE',[r.generacion])
      if(!antes||antes.revision!==Math.max(1,r.revision))return fallo('El lote cambió. Actualizá antes de guardar.',409)
      const quien=c.get('sesion').empleado??'propietario'
      await cli.query('UPDATE tienda_lote SET ficha=$2::jsonb,revision=revision+1,responsable=$3,actualizado=now() WHERE generacion=$1',[r.generacion,JSON.stringify(r.ficha),quien])
      await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'tienda_lote',$2::jsonb)",[quien,JSON.stringify({generacion:r.generacion,anterior:antes.ficha,ficha:r.ficha})])
      return c.json({guardado:true})
    })
  })
  app.post('/api/operacion/tienda/compra/:id',async c=>{const r=await c.req.json();return cambiarBolsa(c,c.req.param('id'),r.estado,r.motivo??'')})
  app.post('/api/tienda/evento',async c=>{
    if(c.get('sesion').rol!=='socio')return fallo('Entrá con tu cuenta.',403)
    const r=await c.req.json()
    if(Object.keys(r).some(k=>!['evento','dispositivo'].includes(k))||!EVENTOS_TIENDA.includes(r.evento)||!['movil','tableta','escritorio'].includes(r.dispositivo))return fallo('Medición inválida.')
    const sql=neon(c.env.DATABASE_URL),clave=await digest('tienda-metrica:'+c.get('sesion').tel)
    const [limite]=await sql`SELECT limitar_acceso(${clave},120,60) AS ok`
    if(!limite.ok)return fallo('Límite de medición.',429)
    await sql`INSERT INTO tienda_metrica(evento,dispositivo) VALUES(${r.evento},${r.dispositivo}) ON CONFLICT(dia,evento,dispositivo) DO UPDATE SET cantidad=tienda_metrica.cantidad+1`
    return c.json({registrado:true})
  })
  app.get('/api/operacion/metricas-tienda',async c=>{
    if(!admin(c))return fallo('Acceso exclusivo de administración.',403)
    const sql=neon(c.env.DATABASE_URL)
    const eventos=await sql`SELECT evento,dispositivo,sum(cantidad)::int AS cantidad FROM tienda_metrica WHERE dia>=(now() AT TIME ZONE 'America/Managua')::date-29 GROUP BY evento,dispositivo ORDER BY evento,dispositivo`
    const estados=await sql`SELECT estado,count(*)::int AS cantidad,COALESCE(sum(total),0)::bigint AS total FROM operativo_compra_bolsa GROUP BY estado ORDER BY estado`
    const [alertas]=await sql`SELECT count(*)::int AS vencidas FROM operativo_compra_bolsa WHERE estado IN ('pagada','lista') AND cotizacion->'oferta'->'ficha'->>'retiroHasta'<(now() AT TIME ZONE 'America/Managua')::date::text`
    const [entrega]=await sql`SELECT count(*)::int AS muestras,round(avg(EXTRACT(EPOCH FROM (entregada-creada))/86400)::numeric,1) AS dias_promedio FROM operativo_compra_bolsa WHERE estado='entregada' AND entregada>=creada`
    return c.json({eventos,estados,alertas,entrega,dias:30})
  })
}
