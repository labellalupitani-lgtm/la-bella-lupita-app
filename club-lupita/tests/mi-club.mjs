import assert from 'node:assert/strict'
import {writeFileSync,mkdirSync} from 'node:fs'
import {preparar} from './soporte.mjs'
const t=await preparar(),{db,request,id,tel,staff}=t,resultados=[]
const caso=async(nombre,fn)=>{await fn();resultados.push({nombre,correcto:true});console.log('PASA '+nombre)}
const alta={ref:'club-alta-prueba-001',version:'fundadora-2026-10',configVersion:1,acepto:true}
try{
 await caso('GET cuenta, catálogo, cupos y club no renuevan ni cobran',async()=>{
  await db.query("UPDATE membresia SET autorenueva=true,renovacion_consentida=now() WHERE socio_id=$1",[id])
  const antes=(await db.query('SELECT count(*)::int n FROM asiento')).rows[0].n
  for(const ruta of ['/api/yo','/api/catalogo','/api/cupos','/api/club'])assert.equal((await request(ruta)).status,200,ruta)
  assert.equal((await db.query('SELECT count(*)::int n FROM asiento')).rows[0].n,antes)
  assert.equal((await request('/api/yo')).body.membresia,null)
 })
 await caso('renovación explícita idempotente conserva versión anterior y emite recibo',async()=>{
  assert.equal((await request('/api/club/sincronizar',{})).status,200)
  assert.equal((await request('/api/club/sincronizar',{})).status,200)
  const yo=(await request('/api/yo')).body
  assert.equal(yo.membresia.contrato_version,'anterior')
  assert.equal((await db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'renovacion:%'")).rows[0].n,1)
  assert.ok((await request('/api/club')).body.eventos.some(e=>e.evento==='renovacion'))
 })
 await caso('nueva contratación requiere consentimiento, referencia y contrato actual; un solo cobro',async()=>{
  await request('/api/membresia/cancelar',{})
  await db.query("UPDATE membresia SET desde=now()-interval '32 days',hasta=now()-interval '1 day' WHERE socio_id=$1",[id])
  assert.equal((await request('/api/membresia/apartar',{})).status,422)
  const a=await request('/api/membresia/apartar',alta);assert.equal(a.status,200,JSON.stringify(a.body))
  const b=await request('/api/membresia/apartar',alta);assert.equal(b.status,200);assert.equal(b.body.repetido,true)
  assert.equal((await request('/api/yo')).body.membresia.contrato_version,'fundadora-2026-10')
  assert.equal((await db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'mem:%'")).rows[0].n,1)
 })
 await caso('alta de A no cobra renovación consentida de B',async()=>{
  await db.query("INSERT INTO membresia(socio_id,numero,cuota,desde,hasta,autorenueva,renovacion_consentida,periodo_inicio) VALUES($1,2,95000,now()-interval '31 days',now()-interval '1 day',true,now(),now()-interval '31 days')",[t.otro])
  const antes=(await db.query('SELECT total FROM saldo_de($1)',[t.otro])).rows[0].total
  await request('/api/membresia/apartar',{...alta,ref:'club-alta-prueba-002'})
  assert.equal((await db.query('SELECT total FROM saldo_de($1)',[t.otro])).rows[0].total,antes)
 })
 await caso('bolsa: consulta, emisión y entrega usan el mismo período pagado; no se reinicia al cambiar mes',async()=>{
  const m=(await db.query("SELECT * FROM membresia WHERE socio_id=$1 AND estado='activa'",[id])).rows[0]
  const ventana=(await db.query("SELECT club_ventana($1,'bolsa_mes',now())::text a,club_ventana($1,'bolsa_mes',now()+interval '1 month')::text b",[m.id])).rows[0];assert.equal(ventana.a,ventana.b)
  const a=await request('/api/beneficios/solicitar',{clase:'bolsa_mes'});assert.equal(a.status,200,JSON.stringify(a.body))
  assert.equal((await request('/api/operacion/beneficios/consultar',{codigo:a.body.codigo},staff)).body.vigente,true)
  assert.equal((await request('/api/operacion/beneficios/entregar',{codigo:a.body.codigo},staff)).status,200)
  assert.equal((await request('/api/yo')).body.bolsaDelMes,ventana.a)
  assert.equal((await request('/api/beneficios/solicitar',{clase:'bolsa_mes'})).status,409)
  assert.equal((await request('/api/operacion/beneficios/entregar',{codigo:a.body.codigo},staff)).status,409)
 })
 await caso('un código reutilizado conserva vencimiento real y puede regenerarse',async()=>{
  const a=await request('/api/beneficios/solicitar',{clase:'bebida_dia'});assert.equal(a.status,200)
  await db.query("UPDATE beneficio_solicitud SET vence=now()+interval '30 seconds' WHERE codigo=$1",[a.body.codigo])
  const b=await request('/api/beneficios/solicitar',{clase:'bebida_dia'});assert.equal(b.body.codigo,a.body.codigo);assert.ok(Date.parse(b.body.vence)-Date.parse(b.body.ahora)<=30000)
  await db.query("UPDATE beneficio_solicitud SET vence=now()-interval '1 second' WHERE codigo=$1",[a.body.codigo])
  const nuevo=await request('/api/beneficios/solicitar',{clase:'bebida_dia'});assert.notEqual(nuevo.body.codigo,a.body.codigo)
 })
 await caso('consentimiento y cancelación repetidos no duplican eventos ni cambian fecha',async()=>{
  await request('/api/membresia/cancelar',{});await request('/api/membresia/cancelar',{})
  const n=(await db.query("SELECT count(*)::int n FROM club_evento WHERE socio_id=$1 AND evento='cancelacion_renovacion'",[id])).rows[0].n;assert.equal(n,2)
  await request('/api/membresia/renovacion',{});const a=(await db.query("SELECT renovacion_consentida FROM membresia WHERE socio_id=$1 AND estado='activa'",[id])).rows[0]
  await request('/api/membresia/renovacion',{});assert.deepEqual((await db.query("SELECT renovacion_consentida FROM membresia WHERE socio_id=$1 AND estado='activa'",[id])).rows[0],a)
 })
 await caso('ticket con espacios y mayúsculas es un solo sello y no puede ir a otra cuenta',async()=>{
  const a=await request('/api/tanda/sellar',{telefono:tel,ticket:'  Ticket-Club-01  '},staff);assert.equal(a.status,200)
  const b=await request('/api/tanda/sellar',{telefono:tel,ticket:'ticket-club-01'},staff);assert.equal(b.status,200);assert.equal(b.body.nuevo,null)
  assert.equal((await db.query("SELECT count(*)::int n FROM sello WHERE ref_externa='TICKET-CLUB-01'")).rows[0].n,1)
  assert.equal((await request('/api/tanda/sellar',{telefono:'50500000002',ticket:'Ticket-Club-01'},staff)).status,409)
 })
 await caso('ventana exclusiva de 48 horas se exige en servidor',async()=>{
  await db.exec("UPDATE experiencia SET abre_socios=now()-interval '1 hour',abre_publico=now()+interval '47 hours'")
  const oferta=(await request('/api/catalogo')).body.experiencias.find(e=>e.id==='mesa-tostador').oferta
  const a=await request('/api/experiencia/mesa-tostador/apartar',{ref:'club-entrada-0001',oferta});assert.equal(a.status,200)
  assert.equal((await request('/api/experiencia/mesa-tostador/apartar',{ref:'club-entrada-0002',oferta},t.otroToken)).status,409)
  assert.equal((await request('/api/experiencia/mesa-tostador/apartar',{ref:'club-entrada-0001',oferta})).body.butaca,a.body.butaca)
 })
 await caso('cesión transfiere derecho, conserva comprobante financiero y no duplica entrada',async()=>{
  const a=(await db.query('SELECT id FROM asiento_experiencia WHERE socio_id=$1',[id])).rows[0]
  const destino=(await request('/api/yo',undefined,t.otroToken)).body.socio.codigo_club
  const r=await request('/api/club/entrada/'+a.id+'/ceder',{codigo:destino,confirmo:true});assert.equal(r.status,200,JSON.stringify(r.body))
  assert.equal((await request('/api/club/entrada/'+a.id+'/ceder',{codigo:destino,confirmo:true})).body.repetido,true)
  const origen=(await request('/api/compras')).body.compras.find(c=>c.id==='experiencia:'+a.id)
  const recibida=(await request('/api/compras',undefined,t.otroToken)).body.compras.find(c=>c.id==='experiencia:'+a.id)
  assert.equal(origen.detalle.titular,false);assert.equal(origen.detalle.total,85000);assert.equal(recibida.detalle.titular,true);assert.equal(recibida.detalle.total,0)
 })
 await caso('pase sin teléfono permite buscar en caja, con permisos',async()=>{
  const codigo=(await request('/api/yo')).body.socio.codigo_club
  assert.equal((await request('/api/operacion/cliente',{telefono:codigo},staff)).body.telefono,tel)
  assert.equal((await request('/api/operacion/cliente',{telefono:codigo})).status,403)
 })
 await caso('espera exige consentimiento, conserva orden y permite retirarse',async()=>{
  assert.equal((await request('/api/club/espera',{})).status,422)
  await request('/api/club/espera',{acepto:true});const a=(await request('/api/club')).body.espera
  await request('/api/club/espera',{acepto:true});assert.equal((await request('/api/club')).body.espera.creada,a.creada)
  await request('/api/club/espera',{acepto:false});assert.equal((await request('/api/club')).body.espera,null)
 })
 await caso('métricas sin datos personales y panel solo para administración',async()=>{
  assert.equal((await request('/api/club/evento',{evento:'vista',dispositivo:'movil',telefono:tel})).status,422)
  assert.equal((await request('/api/club/evento',{evento:'vista',dispositivo:'movil'})).status,200)
  assert.equal((await request('/api/operacion/club/panel')).status,403)
  const r=await request('/api/operacion/club/panel',undefined,staff);assert.equal(r.status,200);assert.equal(r.body.metricas[0].cantidad,1)
 })
 await caso('configuración guarda solo datos verificados y rechaza una revisión vieja',async()=>{
  const config=(await request('/api/operacion/club/panel',undefined,staff)).body.config
  const a=await request('/api/operacion/club/configuracion',{...config,cafe_detalle:'Café sintético para la prueba'},staff)
  assert.equal(a.status,200,JSON.stringify(a.body));assert.equal(a.body.config.version,config.version+1)
  assert.equal((await request('/api/operacion/club/configuracion',config,staff)).status,409)
  assert.equal((await request('/api/operacion/club/configuracion',a.body.config,staff)).status,200)
 })
 await caso('cancelación por la casa devuelve al comprador una vez, revoca entrada cedida y asistencia',async()=>{
  const entrada=(await db.query('SELECT id FROM asiento_experiencia WHERE socio_id=$1',[id])).rows[0].id
  const antes=(await db.query('SELECT total FROM saldo_de($1)',[id])).rows[0].total
  const cuerpo={motivo:'Cancelación sintética de pruebas',confirmo:true}
  const a=await request('/api/operacion/club/experiencias/mesa-tostador/cancelar',cuerpo,staff);assert.equal(a.status,200,JSON.stringify(a.body));assert.equal(a.body.devueltas,1);assert.equal(a.body.pendientes,0)
  assert.equal((await request('/api/operacion/club/experiencias/mesa-tostador/cancelar',cuerpo,staff)).body.devueltas,0)
  assert.equal((await db.query('SELECT total FROM saldo_de($1)',[id])).rows[0].total,antes+85000)
  assert.equal((await request('/api/operacion/entregas/experiencia/'+entrada,{},staff)).status,409)
  assert.equal((await request('/api/experiencia/mesa-tostador/apartar',{ref:'club-evento-cancelado'})).status,409)
  const d=(await request('/api/compras',undefined,t.otroToken)).body.compras.find(c=>c.id==='experiencia:'+entrada).detalle
  assert.ok(d.cancelada&&d.reembolsada)
 })
 await caso('Carta aplica 15% solo a productos confirmados; perder vigencia exige revisar el precio',async()=>{
  const config=(await request('/api/operacion/club/panel',undefined,staff)).body.config
  assert.equal((await request('/api/operacion/club/configuracion',{...config,reposteria:['cheesecake-cafe']},staff)).status,200)
  await db.exec(`UPDATE carta_configuracion SET valor=jsonb_set(valor,'{horario}','${JSON.stringify(Array.from({length:7},()=>({abre:'00:00',cierra:'23:59'})))}'::jsonb)`)
  const cuerpo={lineas:[{id:'cheesecake-cafe',cuanto:2}],ref:'club-descuento-0001'}
  const q=await request('/api/carta/cotizar',cuerpo);assert.equal(q.status,200,JSON.stringify(q.body));assert.equal(q.body.lineas[0].precioAntes,24000);assert.equal(q.body.lineas[0].precio,20400);assert.equal(q.body.lineas[0].descuentoClub,15)
  await db.query("UPDATE membresia SET hasta=now()-interval '1 second',desde=now()-interval '31 days' WHERE socio_id=$1 AND estado='activa'",[id])
  assert.equal((await request('/api/cuenta/cobrar',{...cuerpo,cotizacionId:q.body.id})).status,409)
  await db.query("UPDATE membresia SET hasta=now()+interval '30 days' WHERE socio_id=$1 AND estado='activa'",[id])
  const cobro=await request('/api/cuenta/cobrar',{...cuerpo,cotizacionId:q.body.id});assert.equal(cobro.status,200,JSON.stringify(cobro.body));assert.equal(cobro.body.cobrado,44800)
 })

 await caso('reposición exige administración, motivo y titular; entrega única conserva el original',async()=>{
  const uso=(await db.query("SELECT id::text FROM beneficio_uso WHERE clase='bolsa_mes' ORDER BY id LIMIT 1")).rows[0].id
  const caja=(await t.crearEmpleado({permiso:'caja'})).auth
  const cuerpo={uso,motivo:'Producto defectuoso en ensayo',confirmo:true}
  assert.equal((await request('/api/operacion/club/reposiciones',cuerpo)).status,403)
  assert.equal((await request('/api/operacion/club/reposiciones',cuerpo,caja)).status,403)
  assert.equal((await request('/api/operacion/club/reposiciones',{...cuerpo,motivo:'a'},staff)).status,422)
  const a=await request('/api/operacion/club/reposiciones',cuerpo,staff);assert.equal(a.status,200,JSON.stringify(a.body))
  assert.equal((await request('/api/operacion/club/reposiciones',cuerpo,staff)).body.id,a.body.id)
  assert.equal((await request('/api/operacion/club/reposiciones',{...cuerpo,motivo:'Otro motivo diferente'},staff)).status,409)
  const ruta='/api/club/reposiciones/'+a.body.id+'/codigo'
  assert.equal((await request(ruta,{},t.otroToken)).status,404)
  const vale=await request(ruta,{});assert.equal(vale.status,200,JSON.stringify(vale.body))
  assert.equal((await request(ruta,{})).body.codigo,vale.body.codigo)
  await db.query("UPDATE club_reposicion SET vence=now()-interval '1 second' WHERE id=$1",[a.body.id])
  assert.equal((await request('/api/operacion/beneficios/entregar',{codigo:vale.body.codigo},caja)).status,409)
  const nuevo=await request(ruta,{});assert.notEqual(nuevo.body.codigo,vale.body.codigo)
  const consulta=await request('/api/operacion/beneficios/consultar',{codigo:nuevo.body.codigo},caja);assert.equal(consulta.body.reposicion,true);assert.equal(consulta.body.vigente,true)
  assert.equal((await request('/api/operacion/beneficios/entregar',{codigo:nuevo.body.codigo},caja)).status,200)
  assert.equal((await request('/api/operacion/beneficios/entregar',{codigo:nuevo.body.codigo},caja)).status,409)
  assert.equal((await request(ruta,{})).status,409)
  assert.equal((await db.query('SELECT count(*)::int n FROM beneficio_uso WHERE id=$1',[uso])).rows[0].n,1)
  assert.ok((await request('/api/club')).body.reposiciones.find(r=>r.id===a.body.id).entregada)
 })
 await caso('beneficio antes del cron renueva una vez y reingresar no duplica café diario',async()=>{
  await db.query("UPDATE membresia SET hasta=now()-interval '1 second',desde=now()-interval '31 days' WHERE socio_id=$1 AND estado='activa'",[id])
  const a=await request('/api/beneficios/solicitar',{clase:'bebida_dia'});assert.equal(a.status,200,JSON.stringify(a.body))
  const m=(await request('/api/yo')).body.membresia;assert.ok(m)
  assert.equal((await request('/api/operacion/beneficios/entregar',{codigo:a.body.codigo},staff)).status,200)
  await request('/api/membresia/cancelar',{})
  await db.query("UPDATE membresia SET hasta=now()-interval '1 second',desde=now()-interval '31 days' WHERE id=$1",[m.id])
  const config=(await request('/api/club')).body.config
  const nueva=await request('/api/membresia/apartar',{...alta,configVersion:config.version,ref:'club-reingreso-0001'});assert.equal(nueva.status,200,JSON.stringify(nueva.body))
  assert.ok((await request('/api/yo')).body.bebidaDelDia)
  assert.equal((await request('/api/beneficios/solicitar',{clase:'bebida_dia'})).status,409)
  assert.equal((await request('/api/beneficios/solicitar',{clase:'bolsa_mes'})).status,200)
 })
 await caso('ventanas cruzan meses y medianoche de Managua sin cambiar derechos',async()=>{
  const nueva=(await db.query("SELECT id FROM membresia WHERE socio_id=$1 AND contrato_version='fundadora-2026-10' ORDER BY desde DESC LIMIT 1",[id])).rows[0].id
  const vieja=(await db.query("SELECT id FROM membresia WHERE socio_id=$1 AND contrato_version='anterior' ORDER BY desde LIMIT 1",[id])).rows[0].id
  for(const fecha of ['2028-02-28','2028-02-29','2028-03-30','2028-03-31']){
   const a=(await db.query("SELECT club_ventana($1,'bolsa_mes',$3::timestamptz)::text nuevo,club_ventana($2,'bolsa_mes',$3::timestamptz)::text anterior",[nueva,vieja,fecha+'T12:00:00Z'])).rows[0]
   const periodo=(await db.query("SELECT (periodo_inicio AT TIME ZONE 'America/Managua')::date::text fecha FROM membresia WHERE id=$1",[nueva])).rows[0].fecha
   assert.equal(a.nuevo,periodo);assert.equal(a.anterior,fecha.slice(0,8)+'01')
  }
  const dia=(await db.query("SELECT club_ventana($1,'bebida_dia','2028-03-01T05:59:59Z')::text antes,club_ventana($1,'bebida_dia','2028-03-01T06:00:00Z')::text despues",[nueva])).rows[0]
  assert.equal(dia.antes,'2028-02-29');assert.equal(dia.despues,'2028-03-01')
 })
 await caso('recibo recuperable y condiciones aceptadas resisten nuevas configuraciones',async()=>{
  const r=await request('/api/club/compra/club-reingreso-0001');assert.equal(r.body.estado,'confirmado');assert.equal(r.body.recibo.cobrado,95000)
  assert.equal((await request('/api/club/compra/club-reingreso-0001',undefined,t.otroToken)).body.estado,'sin_cobro')
  const antes=(await request('/api/club')).body.ultima.contrato_detalle
  assert.deepEqual(antes.operacion.reposteria_productos,['Cheesecake de Café'])
  const config=(await request('/api/operacion/club/panel',undefined,staff)).body.config
  await request('/api/operacion/club/configuracion',{...config,cafe_detalle:'Otra definición sintética'},staff)
  assert.deepEqual((await request('/api/club')).body.ultima.contrato_detalle,antes)
  await assert.rejects(db.query("UPDATE club_evento SET evento='borrado' WHERE socio_id=$1",[id]))
  await assert.rejects(db.query('DELETE FROM club_periodo'))
 })

 await caso('cron aísla una cuenta defectuosa y confirma renovaciones sanas',async()=>{
  await db.query("UPDATE membresia SET hasta=now()-interval '1 second',desde=now()-interval '31 days',autorenueva=true,renovacion_consentida=now() WHERE socio_id=$1 AND estado='activa'",[id])
  await db.exec(`CREATE FUNCTION fallo_club_prueba() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.socio_id='${t.otro}' AND NEW.ref_externa LIKE 'renovacion:%' THEN RAISE EXCEPTION 'Fallo sintético de una cuenta'; END IF; RETURN NEW; END $$; CREATE TRIGGER fallo_club_prueba BEFORE INSERT ON asiento FOR EACH ROW EXECUTE FUNCTION fallo_club_prueba()`)
  await assert.rejects(t.worker.mantenerMembresias(t.env),/pendientes de revisión/)
  assert.ok((await request('/api/yo')).body.membresia)
  assert.equal((await request('/api/yo',undefined,t.otroToken)).body.membresia,null)
  await db.exec('DROP TRIGGER fallo_club_prueba ON asiento; DROP FUNCTION fallo_club_prueba()')
  await t.worker.mantenerMembresias(t.env)
  assert.ok((await request('/api/yo',undefined,t.otroToken)).body.membresia)
 })

 await caso('panel distingue renovación voluntaria, vencimiento y descuento real de Carta',async()=>{
  const r=await request('/api/operacion/club/panel',undefined,staff);assert.equal(r.status,200,JSON.stringify(r.body))
  assert.ok(r.body.retencion.find(x=>x.causa==='renovacion').cantidad>=1)
  assert.ok(r.body.retencion.find(x=>x.causa==='cancelacion_renovacion').cantidad>=1)
  assert.ok(r.body.retencion.find(x=>x.causa==='fin_renovacion_desactivada').cantidad>=1)
  assert.equal(Number(r.body.operacion.descuentos_carta),7200)
  assert.equal(r.body.operacion.bolsas,2,'Cuenta entrega original y reposición física')
 })
}finally{mkdirSync('entregables/mejoras-mi-club-2026-10-09/evidencia',{recursive:true});writeFileSync('entregables/mejoras-mi-club-2026-10-09/evidencia/servidor.json',JSON.stringify({resultados},null,2));await db.close()}
