import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {preparar} from './soporte.mjs'
const t=await preparar(),{db,request,id,otro,otroToken,tel,staff}=t,resultados=[]
const caso=async(nombre,fn)=>{await fn();resultados.push({nombre,correcto:true});console.log('PASA '+nombre)}
const v='operacion-2026-10-12',evidencia='Ensayo sintético local: vaso, presentaciones, costos e inventario de prueba; no habilita producción.'
const activar=()=>request('/api/operacion/club/activar-reglas',{version:1,confirmo:true,evidencia},staff)
try{
 await caso('migración repetible; reglas aprobadas permanecen inactivas hasta validación',async()=>{
  await db.exec(readFileSync('db/029_reglas_club.sql','utf8'))
  assert.equal((await request('/api/operacion/reglas-club',undefined,staff)).body.activa,false)
  assert.equal((await request('/api/operacion/club/activar-reglas',{version:1,confirmo:true,evidencia})).status,403)
  assert.equal((await activar()).status,409)
  assert.equal((await request('/api/club/informacion',undefined,null)).body.config.reglas_version,null)
 })
 await caso('activación exige evidencia, costos e inventario y publica reglas consistentes una vez',async()=>{
  assert.equal((await request('/api/operacion/club/activar-reglas',{version:1,confirmo:true,evidencia:'inventado'},staff)).status,422)
  await db.exec('UPDATE club_config SET costo_cafe=1000,costo_bolsa=15000,costo_fijo_periodo=5000')
  const antes=(await db.query('SELECT datos FROM reserva_config')).rows[0].datos
  await db.query('UPDATE reserva_config SET datos=$1::jsonb',[JSON.stringify({...antes,zonas:antes.zonas.map(z=>z.id==='vip'?{...z,mesas:[]}:z)})])
  assert.equal((await activar()).status,409)
  await db.query('UPDATE reserva_config SET datos=$1::jsonb',[JSON.stringify(antes)])
  assert.equal((await activar()).status,200);assert.equal((await activar()).body.repetido,true)
  const r=(await request('/api/club/informacion',undefined,null)).body
  assert.equal(r.config.reglas_version,v);assert.equal(r.config.reposteria_productos.length,8);assert.match(r.config.cafe_detalle,/8 oz/)
  assert.match(r.config.sellos_regla,/C\$100/);assert.equal('validacion_operativa' in r.config,false)
  const config=(await request('/api/operacion/club/panel',undefined,staff)).body.config
  assert.equal((await request('/api/operacion/club/configuracion',{...config,sellos_regla:'Otro importe sin versión'},staff)).status,409)
 })
 await caso('ticket exige neto elegible y confirmación; duplicado conserva un sello',async()=>{
  const sellar=c=>request('/api/tanda/sellar',{telefono:tel,ticket:'REGLAS-TICKET-0001',...c},staff)
  assert.equal((await sellar({})).status,422)
  assert.equal((await sellar({netoElegible:9999,confirmoElegible:true})).status,422)
  assert.equal((await sellar({netoElegible:10000,confirmoElegible:false})).status,422)
  const correcto=await sellar({netoElegible:10000,confirmoElegible:true});assert.equal(correcto.status,200);assert.equal(correcto.body.nuevo,9)
  assert.equal((await sellar({})).body.nuevo,null)
  assert.equal((await request('/api/tanda/sellar',{telefono:'50500000002',ticket:'REGLAS-TICKET-0001',netoElegible:10000,confirmoElegible:true},staff)).status,409)
  assert.equal((await db.query('SELECT count(*)::int n FROM club_ticket_validacion')).rows[0].n,1)
 })
 await caso('premio anterior conserva derechos; nueva tanda exige selección de bebida válida',async()=>{
  const viejo=(await request('/api/tanda/canjear',{})).body.codigo
  assert.equal((await request('/api/vale/quemar',{codigo:viejo},staff)).status,200)
  for(let n=1;n<=9;n++)assert.equal((await request('/api/tanda/sellar',{telefono:tel,ticket:'REGLAS-NUEVA-'+n,netoElegible:10000,confirmoElegible:true},staff)).status,200)
  const nuevo=(await request('/api/tanda/canjear',{})).body.codigo
  const detalle=await request('/api/operacion/vale/consultar',{codigo:nuevo},staff);assert.equal(detalle.body.reglas_version,v)
  assert.equal((await request('/api/vale/quemar',{codigo:nuevo},staff)).status,422)
  assert.equal((await request('/api/vale/quemar',{codigo:nuevo,bebida:'mocha'},staff)).status,422)
  assert.equal((await request('/api/vale/quemar',{codigo:nuevo,bebida:'latte'},staff)).status,200)
  assert.equal((await db.query('SELECT bebida FROM club_premio_entrega')).rows[0].bebida,'latte')
 })
 await caso('espera VIP valida consentimiento, fecha y pertenencia; no cobra ni reserva',async()=>{
  const cuando=new Date(Date.now()+3*86400000).toISOString().slice(0,10)+'T15:00:00-06:00'
  t.visita={cuando,horas:2,personas:4,acepto:true}
  assert.equal((await request('/api/club/vip-espera',{...t.visita,acepto:false})).status,409)
  assert.equal((await request('/api/club/vip-espera',{...t.visita,cuando:'2020-01-01T15:00:00-06:00'})).status,422)
  const gratis=await request('/api/club/vip-espera',t.visita,otroToken);assert.equal(gratis.status,200);t.gratis=gratis.body.id
  assert.equal((await request('/api/club/vip-espera',t.visita,otroToken)).body.id,t.gratis)
  const m=await request('/api/club/vip-espera',t.visita);assert.equal(m.status,200);t.miembro=m.body.id
  assert.equal((await request('/api/club/vip-espera/'+t.gratis+'/cancelar',{})).status,404)
  assert.equal((await request('/api/club/vip-espera')).body.solicitudes.length,1)
 })
 await caso('miembro vigente recibe preferencia; dos ofertas del mismo grupo se serializan',async()=>{
  await db.query("UPDATE membresia SET hasta=now()+interval '20 days',estado='activa' WHERE socio_id=$1",[id])
  const lista=(await request('/api/operacion/club/vip-espera',undefined,staff)).body.solicitudes
  assert.equal(lista[0].id,t.miembro);assert.equal(lista[0].miembro,true)
  const ofrecer=id=>request('/api/operacion/club/vip-espera/'+id+'/ofrecer',{version:1,motivo:'Disponibilidad verificada en ensayo'},staff)
  assert.equal((await ofrecer(t.gratis)).status,409)
  assert.equal((await ofrecer(t.miembro)).status,200)
  assert.equal((await ofrecer(t.gratis)).status,409)
  assert.equal((await request('/api/operacion/club/vip-espera/'+t.miembro+'/cerrar',{version:1,motivo:'Versión vieja'},staff)).status,409)
  assert.equal((await request('/api/operacion/club/vip-espera/'+t.miembro+'/cerrar',{version:2,motivo:'Titular desistió en este ensayo'},staff)).status,200)
  assert.equal((await ofrecer(t.gratis)).status,200)
  assert.equal((await request('/api/club/vip-espera/'+t.gratis+'/cancelar',{},otroToken)).status,200)
  assert.equal((await db.query('SELECT count(*)::int n FROM reserva')).rows[0].n,0)
  assert.equal((await db.query("SELECT count(*)::int n FROM asiento WHERE tipo='deposito'")).rows[0].n,0)
 })
}finally{await db.close();mkdirSync('entregables/conoce-tu-club-2026-10-12/evidencia',{recursive:true});writeFileSync('entregables/conoce-tu-club-2026-10-12/evidencia/reglas.json',JSON.stringify({resultados},null,2))}
