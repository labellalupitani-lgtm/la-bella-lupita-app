import type {Hono} from 'hono'
import {neon} from '@neondatabase/serverless'
import type {Env,Vars} from './index'
import {transaccion} from './operacion'
import {REGLAS_CLUB} from '../compartido/reglas-club'
import {errorFechaReserva,zonaCerrada} from '../compartido/reservas'
import {leerConfiguracionReservas} from './reservas'
import {CARTA} from '../data/menu'

const vigente="EXISTS(SELECT 1 FROM operativo_membresia m WHERE m.socio_id=w.socio_id AND m.estado IN ('activa','en_gracia') AND m.hasta>now())"
const uuid=(s:string)=>/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(s)
export function registrarReglasClub(app:Hono<{Bindings:Env;Variables:Vars}>){
  app.get('/api/operacion/reglas-club',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')==='cocina')return c.json({error:'Acceso exclusivo de caja.'},403)
    const sql=neon(c.env.DATABASE_URL),[config]=await sql`SELECT reglas_version,version,validacion_operativa FROM club_config WHERE id=true`
    return c.json({activa:config.reglas_version===REGLAS_CLUB.version,config,propuesta:REGLAS_CLUB,bebidas:CARTA.filter(p=>REGLAS_CLUB.bebidas.some(id=>id===p.id)).map(p=>({id:p.id,nombre:p.nombre}))})
  })
  app.post('/api/operacion/club/activar-reglas',async c=>{
    if(c.get('permiso')!=='propietario')return c.json({error:'Solo el propietario activa estas condiciones.'},403)
    const r=await c.req.json()
    if(r.confirmo!==true||!Number.isInteger(r.version)||typeof r.evidencia!=='string'||r.evidencia.trim().length<30||r.evidencia.length>1500)return c.json({error:'Registrá la comprobación de vasos, presentaciones, costos, inventario VIP y ensayo de cola antes de activar.'},422)
    const reservas=await leerConfiguracionReservas(c.env)
    if(!reservas.zonas.find(z=>z.id==='vip')?.mesas.length)return c.json({error:'Falta configurar y verificar el inventario real del Salón VIP en Reservas.'},409)
    return transaccion(c.env,async cli=>{
      const {rows:[actual]}=await cli.query('SELECT * FROM club_config WHERE id=true FOR UPDATE')
      if(actual.reglas_version===REGLAS_CLUB.version)return c.json({activada:true,repetido:true})
      if(actual.version!==r.version)return c.json({error:'La configuración cambió. Actualizá antes de activar.'},409)
      if(['costo_cafe','costo_bolsa','costo_fijo_periodo'].some(k=>actual[k]===null))return c.json({error:'Registrá los costos reales de café, bolsa y período antes de activar.'},409)
      await cli.query(`UPDATE club_config SET reglas_version=$1,validacion_operativa=$2,version=version+1,cafe_detalle=$3,sellos_regla=$4,premio_detalle=$5,vip_regla=$6,reposteria=$7::jsonb WHERE id=true`,[REGLAS_CLUB.version,r.evidencia.trim(),REGLAS_CLUB.cafe_detalle,REGLAS_CLUB.sellos_regla,REGLAS_CLUB.premio_detalle,REGLAS_CLUB.vip_regla,JSON.stringify(REGLAS_CLUB.reposteria)])
      await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'club_reglas_activadas',$2::jsonb)",[c.get('sesion').empleado,JSON.stringify({version:REGLAS_CLUB.version,evidencia:r.evidencia.trim()})])
      return c.json({activada:true})
    })
  })
  app.get('/api/club/vip-espera',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Ingresá con tu cuenta.'},403)
    const sql=neon(c.env.DATABASE_URL),[config]=await sql`SELECT reglas_version FROM club_config WHERE id=true`
    const solicitudes=await sql`SELECT w.id,w.cuando,w.horas,w.personas,w.creada,w.ofrecida,w.version FROM club_vip_espera w JOIN operativo_socio s ON s.id=w.socio_id WHERE s.telefono=${c.get('sesion').tel} AND w.cerrada IS NULL AND w.cuando>now() ORDER BY w.cuando`
    return c.json({activa:config.reglas_version===REGLAS_CLUB.version,solicitudes})
  })
  app.post('/api/club/vip-espera',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Ingresá con tu cuenta.'},403)
    const r=await c.req.json(),cfg=await leerConfiguracionReservas(c.env)
    const error=errorFechaReserva(cfg,r.cuando,r.horas,r.personas)
    if(error)return c.json({error},422)
    if(r.acepto!==true||!cfg.zonas.find(z=>z.id==='vip')?.mesas.length||zonaCerrada(cfg,'vip',r.cuando,r.horas))return c.json({error:'Confirmá las condiciones y una fecha habilitada para el Salón VIP.'},409)
    return transaccion(c.env,async cli=>{
      const {rows:[s]}=await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE',[c.get('sesion').tel])
      if(!s)return c.json({error:'Cuenta no encontrada.'},404)
      const {rows:[config]}=await cli.query('SELECT reglas_version FROM club_config WHERE id=true FOR SHARE')
      if(config.reglas_version!==REGLAS_CLUB.version)return c.json({error:'La lista VIP todavía no está habilitada.'},409)
      const {rows:previas}=await cli.query('SELECT * FROM club_vip_espera WHERE socio_id=$1 AND cerrada IS NULL AND cuando>now()',[s.id])
      const anterior=previas.find(p=>Date.parse(p.cuando)===Date.parse(r.cuando)&&p.horas===r.horas&&p.personas===r.personas)
      if(anterior)return c.json({registrada:true,repetido:true,id:anterior.id})
      if(previas.length>=3)return c.json({error:'Podés mantener hasta tres solicitudes VIP. Cancelá una antes de agregar otra.'},409)
      const {rows:[w]}=await cli.query('INSERT INTO club_vip_espera(socio_id,cuando,horas,personas) VALUES($1,$2,$3,$4) RETURNING id',[s.id,r.cuando,r.horas,r.personas])
      return c.json({registrada:true,id:w.id})
    })
  })
  app.post('/api/club/vip-espera/:id/cancelar',async c=>{
    if(c.get('sesion').rol!=='socio'||!uuid(c.req.param('id')))return c.json({error:'Solicitud no encontrada.'},404)
    return transaccion(c.env,async cli=>{
      const {rows:[w]}=await cli.query("UPDATE club_vip_espera w SET cerrada=now(),motivo='Cancelada por su titular',version=w.version+1 FROM operativo_socio s WHERE s.id=w.socio_id AND s.telefono=$1 AND w.id=$2 AND w.cerrada IS NULL RETURNING w.id",[c.get('sesion').tel,c.req.param('id')])
      return w?c.json({cancelada:true}):c.json({error:'Solicitud no encontrada o ya cerrada.'},404)
    })
  })
  app.get('/api/operacion/club/vip-espera',async c=>{
    if(c.get('sesion').rol!=='casa'||!['propietario','encargado'].includes(c.get('permiso')))return c.json({error:'Acceso de administración.'},403)
    return transaccion(c.env,async cli=>{
      const {rows}=await cli.query(`SELECT w.*,s.nombre,s.codigo_club,${vigente} AS miembro FROM club_vip_espera w JOIN operativo_socio s ON s.id=w.socio_id WHERE w.cerrada IS NULL AND w.cuando>now() AND s.baja IS NULL ORDER BY w.cuando,w.horas,w.personas,miembro DESC,w.creada,w.id LIMIT 100`)
      return c.json({solicitudes:rows})
    })
  })
  app.post('/api/operacion/club/vip-espera/:id/:accion',async c=>{
    const id=c.req.param('id'),accion=c.req.param('accion'),r=await c.req.json()
    if(!['propietario','encargado'].includes(c.get('permiso')))return c.json({error:'Acceso de administración.'},403)
    if(!uuid(id)||!['ofrecer','cerrar'].includes(accion)||!Number.isInteger(r.version)||typeof r.motivo!=='string'||r.motivo.trim().length<5||r.motivo.length>500)return c.json({error:'Revisá la solicitud e indicá el resultado de la gestión.'},422)
    return transaccion(c.env,async cli=>{
      await cli.query("SELECT pg_advisory_xact_lock(hashtext('club-vip-espera'))")
      const {rows:[w]}=await cli.query('SELECT * FROM club_vip_espera WHERE id=$1 AND cerrada IS NULL AND cuando>now() FOR UPDATE',[id])
      if(!w||w.version!==r.version)return c.json({error:'La solicitud cambió. Actualizá la lista.'},409)
      if(accion==='ofrecer'){
        const {rows:[primera]}=await cli.query(`SELECT w.id FROM club_vip_espera w JOIN operativo_socio s ON s.id=w.socio_id WHERE w.cuando=$1 AND w.horas=$2 AND w.personas=$3 AND w.cerrada IS NULL AND s.baja IS NULL ORDER BY (w.ofrecida IS NOT NULL) DESC,${vigente} DESC,w.creada,w.id LIMIT 1`,[w.cuando,w.horas,w.personas])
        if(primera?.id!==id)return c.json({error:'Atendé primero la solicitud con prioridad o resolvé la oferta pendiente para este horario y grupo.'},409)
        if(w.ofrecida)return c.json({ofrecida:true,repetido:true})
        await cli.query('UPDATE club_vip_espera SET ofrecida=now(),motivo=$2,version=version+1 WHERE id=$1',[id,r.motivo.trim()])
      }else await cli.query('UPDATE club_vip_espera SET cerrada=now(),motivo=$2,version=version+1 WHERE id=$1',[id,r.motivo.trim()])
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'club_vip_gestion',$2,$3::jsonb)",[c.get('sesion').empleado,w.socio_id,JSON.stringify({id,accion,motivo:r.motivo.trim()})])
      return c.json({gestionada:true})
    })
  })
}
