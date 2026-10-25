import type { Hono } from 'hono'
import { Client, neon, neonConfig } from '@neondatabase/serverless'
import type { Env, Vars } from './index'
import { idBigintPositivo } from './validacion'
import { pedidoParaCocina } from './pedido-publico'
import { consultarReposicion, entregarReposicion } from './club-reposiciones'

export async function transaccion<T>(env:Env, trabajo:(cli:Client)=>Promise<T>):Promise<T> {
  neonConfig.webSocketConstructor=globalThis.WebSocket
  const cli=new Client(env.DATABASE_URL)
  await cli.connect()
  try { await cli.query('BEGIN'); await cli.query("SET LOCAL statement_timeout='8s'"); const r=await trabajo(cli); await cli.query('COMMIT'); return r }
  catch(e){await cli.query('ROLLBACK').catch(()=>{});throw e}
  finally{await cli.end()}
}
const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s)

export function registrarOperacion(app:Hono<{Bindings:Env;Variables:Vars}>) {
  app.post('/api/operacion/beneficios/consultar',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')==='cocina')return c.json({error:'La entrega la confirma caja.'},403)
    const r=await c.req.json().catch(()=>null)
    if(!r||typeof r.codigo!=='string'||!/^[A-F0-9]{12}$/.test(r.codigo))return c.json({error:'Código inválido.'},422)
    const sql=neon(c.env.DATABASE_URL)
    const [beneficio]=await sql`SELECT s.nombre,b.clase,b.vence,b.entregado,m.contrato_version,b.ventana,(SELECT cafe_detalle FROM club_config WHERE id=true) AS cafe_detalle,
      (b.entregado IS NULL AND b.vence>now() AND m.hasta>now() AND m.estado IN ('activa','en_gracia')
      AND b.ventana=club_ventana(m.id,b.clase)
      AND NOT club_beneficio_usado(b.membresia_id,b.clase)) AS vigente
      FROM operativo_beneficio_solicitud b JOIN operativo_socio s ON s.id=b.socio_id JOIN operativo_membresia m ON m.id=b.membresia_id WHERE codigo=${r.codigo}`
    if(!beneficio){const reposicion=await consultarReposicion(c.env.DATABASE_URL,r.codigo);return reposicion?c.json(reposicion):c.json({error:'Código no encontrado.'},404)}
    return c.json(beneficio)
  })
  app.get('/api/compras',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const sql=neon(c.env.DATABASE_URL), tel=c.get('sesion').tel
    const pagina=Number(c.req.query('pagina')??0)
    if(!Number.isInteger(pagina)||pagina<0||pagina>10000)return c.json({error:'Página inválida.'},422)
    const filas=await sql`WITH miembro AS (SELECT id FROM operativo_socio WHERE telefono=${tel} AND baja IS NULL), compras AS (
      SELECT 'pedido:'||p.id AS id,'pedido' AS tipo,p.creado, jsonb_build_object('numero',p.numero,'estado',p.estado,'total',p.total,'lineas',p.lineas,'empaque',p.empaque,'restriccion_confirmada',p.restriccion_confirmada,'motivo',p.motivo,'actualizado',p.actualizado) AS detalle FROM operativo_pedido p JOIN miembro m ON m.id=p.socio_id
      UNION ALL SELECT 'reserva:'||r.id,'reserva',r.creada,jsonb_build_object('zona',r.zona,'cuando',r.cuando,'personas',r.personas,'fin',r.termina,'deposito',r.deposito,'cancelada',r.cancelada,'estado',r.estado) FROM operativo_reserva r JOIN miembro m ON m.id=r.socio_id
      UNION ALL SELECT 'bolsa:'||r.id,'bolsa',r.creada,jsonb_build_object('numero',r.numero,'generacion',r.generacion,'total',r.total,'entregada',r.entregada,'estado',r.estado,'lista',r.lista,'reembolsada',r.reembolsada,'motivo',r.motivo,'cotizacion',r.cotizacion) FROM operativo_compra_bolsa r JOIN miembro m ON m.id=r.socio_id
      UNION ALL SELECT 'experiencia:'||a.id,'experiencia',a.comprado,jsonb_build_object('nombre',e.nombre,'cuando',e.cuando,'butaca',a.butaca,'total',CASE WHEN a.socio_id=m.id THEN a.pagado ELSE 0 END,'asistencia',a.asistencia,'cedida',a.cedido_a IS NOT NULL AND a.socio_id=m.id,'recibida',a.cedido_a=m.id,'titular',COALESCE(a.cedido_a,a.socio_id)=m.id,'puede_ceder',a.socio_id=m.id AND a.cedido_a IS NULL AND a.asistencia IS NULL AND e.cuando>now() AND e.cancelada IS NULL,'cancelada',e.cancelada,'reembolsada',a.reembolsada,'lugar',e.lugar,'duracion_minutos',e.duracion_minutos,'incluye',e.incluye,'condiciones',e.condiciones) FROM operativo_asiento_experiencia a JOIN experiencia e ON e.id=a.experiencia_id JOIN miembro m ON (m.id=a.socio_id OR m.id=a.cedido_a)
    ) SELECT * FROM compras ORDER BY creado DESC,id DESC LIMIT 21 OFFSET ${pagina*20}`
    return c.json({compras:filas.slice(0,20),hayMas:filas.length>20})
  })
  app.get('/api/avisos',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const sql=neon(c.env.DATABASE_URL)
    return c.json({avisos:await sql`SELECT a.id,a.texto,a.creado,a.leido FROM operativo_aviso_cliente a JOIN operativo_socio s ON s.id=a.socio_id WHERE s.telefono=${c.get('sesion').tel} ORDER BY a.id DESC LIMIT 50`})
  })
  app.post('/api/avisos/:id/leido',async c=>{
    if(c.get('sesion').rol!=='socio'||!idBigintPositivo(c.req.param('id')))return c.json({error:'Aviso no encontrado.'},404)
    const sql=neon(c.env.DATABASE_URL)
    await sql`UPDATE operativo_aviso_cliente SET leido=COALESCE(leido,now()) WHERE id=${c.req.param('id')}::bigint AND socio_id=(SELECT id FROM operativo_socio WHERE telefono=${c.get('sesion').tel})`
    return c.json({leido:true})
  })
  app.get('/api/operacion/pedidos',async c=>{
    if(c.get('sesion').rol!=='casa')return c.json({error:'Acceso exclusivo del personal.'},403)
    const sql=neon(c.env.DATABASE_URL)
    const pedidos=await sql`SELECT p.id,p.numero,p.estado,p.total,p.lineas,p.creado,p.motivo,p.restriccion_confirmada,p.empaque,p.estimacion_minutos,s.nombre FROM operativo_pedido p JOIN operativo_socio s ON s.id=p.socio_id WHERE p.estado NOT IN ('entregado','cancelado') ORDER BY p.creado LIMIT 100`
    return c.json({pedidos:c.get('permiso')==='cocina'?pedidos.map(pedidoParaCocina):pedidos})
  })
  app.post('/api/operacion/pedidos/:id/estado',async c=>{
    if(c.get('sesion').rol!=='casa')return c.json({error:'Acceso exclusivo del personal.'},403)
    const id=c.req.param('id'),r=await c.req.json().catch(()=>null)
    if(!uuid(id)||!r||!['aceptado','preparando','listo','entregado','cancelado'].includes(r.estado))return c.json({error:'Estado inválido.'},422)
    const permiso=c.get('permiso')??'encargado'
    if(permiso==='cocina'&&!['preparando','listo'].includes(r.estado))return c.json({error:'La cocina solo actualiza la preparación.'},403)
    if(r.estado==='cancelado'&&(typeof r.motivo!=='string'||r.motivo.trim().length<3||r.motivo.length>240))return c.json({error:'Escribí el motivo de cancelación.'},422)
    return transaccion(c.env,async cli=>{
      const {rows:dueno}=await cli.query('SELECT socio_id FROM operativo_pedido WHERE id=$1',[id])
      if(!dueno.length)return c.json({error:'Pedido no encontrado.'},404)
      await cli.query('SELECT id FROM operativo_socio WHERE id=$1 FOR UPDATE',[dueno[0].socio_id])
      const {rows:[p]}=await cli.query('SELECT * FROM operativo_pedido WHERE id=$1 FOR UPDATE',[id])
      if(p.estado===r.estado)return c.json({estado:p.estado,repetido:true})
      const pasos:Record<string,string[]>= {recibido:['aceptado','cancelado'],aceptado:['preparando','cancelado'],preparando:['listo'],listo:['entregado'],entregado:[],cancelado:[]}
      const excepcion=r.estado==='cancelado'&&r.excepcional===true&&['preparando','listo'].includes(p.estado)
      if(excepcion&&!['propietario','encargado'].includes(permiso))return c.json({error:'La cancelación excepcional la autoriza administración.'},403)
      if(!pasos[p.estado]?.includes(r.estado)&&!excepcion)return c.json({error:'El pedido cambió o ese paso no corresponde. Actualizá la bandeja.'},409)
      if(r.estado==='preparando'&&p.restriccion_confirmada&&r.restriccionReconocida!==true)return c.json({error:'Leé la restricción y confirmá con el equipo cómo atenderla antes de comenzar.'},422)
      const quien=c.get('sesion').empleado??'propietario',motivo=r.estado==='cancelado'?r.motivo.trim():null
      if(r.estado==='cancelado') {
        const devolucion=await cli.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa,quien,nota,devolucion_de) SELECT $1,$2,'ajuste',$3,$4,$5,$6,id FROM operativo_asiento WHERE socio_id=$1 AND ref_externa=$7 AND monto=-$2::integer RETURNING id",[p.socio_id,p.total,'Devolución · pedido '+p.numero,'devolucion-pedido:'+p.id,quien,motivo,'pedido:'+p.referencia])
        if(devolucion.rows.length!==1)throw Error('No se pudo verificar el cobro original para devolverlo.')
        // Devuelve exactamente los puntos de este cobro; no los estima con otra regla.
        await cli.query("INSERT INTO punto(socio_id,puntos,motivo,origen_id,concepto) SELECT $1,-p.puntos,'ajuste',$2,$3 FROM operativo_punto p JOIN operativo_asiento a ON p.origen_id=a.id::text WHERE a.socio_id=$1 AND a.ref_externa=$4 AND p.motivo='consumo' ON CONFLICT DO NOTHING",[p.socio_id,'devolucion-pedido:'+p.id,'Devolución · pedido '+p.numero,'pedido:'+p.referencia])
      }
      await cli.query('UPDATE operativo_pedido SET estado=$2,motivo=$3,actualizado=now() WHERE id=$1',[id,r.estado,motivo])
      await cli.query('INSERT INTO pedido_evento(pedido_id,estado,quien,motivo) VALUES($1,$2,$3,$4)',[id,r.estado,quien,motivo])
      await cli.query('INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,$2,$3,$4::jsonb)',[quien,'pedido_estado',p.socio_id,JSON.stringify({pedido:id,estado:r.estado,motivo,...(r.estado==='preparando'&&p.restriccion_confirmada?{restriccion_reconocida:true}:{})})])
      await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[p.socio_id,'pedido:'+id+':'+r.estado,'Pedido #'+p.numero+': '+r.estado+(motivo?' · '+motivo:'')])
      return c.json({estado:r.estado})
    })
  })
  app.post('/api/beneficios/solicitar',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const r=await c.req.json().catch(()=>null)
    if(!r||!['bebida_dia','bolsa_mes'].includes(r.clase))return c.json({error:'Beneficio inválido.'},422)
    return transaccion(c.env,async cli=>{
      const {rows:[s]}=await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE',[c.get('sesion').tel])
      if(!s)return c.json({error:'Cuenta no encontrada.'},404)
      await cli.query('SELECT mantener_membresia($1)',[s.id])
      const {rows:[m]}=await cli.query("SELECT id FROM operativo_membresia WHERE socio_id=$1 AND estado IN ('activa','en_gracia') AND hasta>now() FOR UPDATE",[s.id])
      if(!m)return c.json({error:'No tenés una membresía vigente.'},403)
      const {rows:[v]}=await cli.query('SELECT club_ventana($1,$2) AS ventana',[m.id,r.clase])
      const {rows:[uso]}=await cli.query('SELECT club_beneficio_usado($1,$2) AS usado',[m.id,r.clase])
      if(uso.usado)return c.json({error:'Este beneficio ya fue entregado en el período actual.'},409)
      const codigo=crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase()
      const {rows:[solicitud]}=await cli.query(`INSERT INTO beneficio_solicitud(socio_id,membresia_id,clase,ventana,codigo) VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(membresia_id,clase,ventana) DO UPDATE SET codigo=CASE WHEN beneficio_solicitud.vence<=now() THEN EXCLUDED.codigo ELSE beneficio_solicitud.codigo END,vence=CASE WHEN beneficio_solicitud.vence<=now() THEN EXCLUDED.vence ELSE beneficio_solicitud.vence END RETURNING codigo,vence`,[s.id,m.id,r.clase,v.ventana,codigo])
      return c.json({...solicitud,ahora:new Date().toISOString()})
    })
  })
  app.post('/api/operacion/beneficios/entregar',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')==='cocina')return c.json({error:'La entrega la confirma caja.'},403)
    const r=await c.req.json().catch(()=>null)
    if(!r||typeof r.codigo!=='string'||!/^[A-F0-9]{12}$/.test(r.codigo))return c.json({error:'Código inválido.'},422)
    return transaccion(c.env,async cli=>{
      const titular=await cli.query('SELECT id FROM operativo_socio WHERE id IN (SELECT socio_id FROM operativo_beneficio_solicitud WHERE codigo=$1 UNION SELECT socio_id FROM club_reposicion WHERE codigo=$1) AND baja IS NULL FOR UPDATE',[r.codigo])
      if(!titular.rows.length)return c.json({error:'Código no encontrado en una cuenta activa.'},404)
      const {rows:[b]}=await cli.query('SELECT * FROM operativo_beneficio_solicitud WHERE codigo=$1 FOR UPDATE',[r.codigo])
      if(!b){const rep=await entregarReposicion(cli,r.codigo,c.get('sesion').empleado??'propietario');return !rep?c.json({error:'Código no encontrado.'},404):'error'in rep?c.json(rep,409):c.json(rep)}
      if(b.entregado)return c.json({error:'Este beneficio ya fue entregado.'},409)
      const {rows:[vigencia]}=await cli.query("SELECT id FROM operativo_membresia WHERE id=$1 AND hasta>now() AND estado IN ('activa','en_gracia') AND $2::timestamptz>now() AND $3::date=club_ventana(id,$4) AND NOT club_beneficio_usado(id,$4) FOR UPDATE",[b.membresia_id,b.vence,b.ventana,b.clase])
      if(!vigencia)return c.json({error:'El código o la membresía venció. Pedí al cliente que actualice su beneficio.'},409)
      const {rows:uso}=await cli.query('INSERT INTO beneficio_uso(membresia_id,clase) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id',[b.membresia_id,b.clase])
      if(!uso.length)return c.json({error:'El beneficio ya se utilizó.'},409)
      const quien=c.get('sesion').empleado??'propietario'
      await cli.query('UPDATE operativo_beneficio_solicitud SET entregado=now(),entregado_por=$2 WHERE id=$1',[b.id,quien])
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'entrega_beneficio',$2,$3::jsonb)",[quien,b.socio_id,JSON.stringify({solicitud:b.id,clase:b.clase})])
      return c.json({entregado:true,clase:b.clase})
    })
  })
}



