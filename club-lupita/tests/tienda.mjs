import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {preparar} from './soporte-perfiles-equipo.mjs'
import {habilitarTienda,cotizarTienda,fichaPrueba} from './tienda-fixture.mjs'
const t=await preparar(),r=t.request,resultados=[]
const caso=async(nombre,fn)=>{await fn();resultados.push({nombre,ok:true});console.log('PASA '+nombre)}
const bolsas=async()=>Number((await t.db.query('SELECT count(*)::int n FROM compra_bolsa')).rows[0].n)
const saldo=async()=>Number((await t.db.query('SELECT total FROM saldo_de($1)',[t.id])).rows[0].total)
try{
 await caso('migración repetible, preventa incompleta cerrada y contrato antiguo sin consentimiento rechazado',async()=>{
  await t.db.exec(readFileSync('db/023_tienda.sql','utf8'));assert.equal((await r('/api/tienda')).body.disponible,false)
  assert.equal((await r('/api/tienda/cotizar',{ref:'sin-ficha-001'})).status,409)
  assert.equal((await r('/api/reserva-cosecha/apartar',{ref:'sin-cotizar-001'})).status,409);assert.equal(await bolsas(),0)
 })
 await caso('solo propietario configura; exige fuente, condiciones y control de revisión',async()=>{
  const o=(await r('/api/tienda')).body
  assert.equal((await r('/api/operacion/tienda/lote',{generacion:o.generacion,revision:o.revision,ficha:fichaPrueba})).status,403)
  assert.equal((await r('/api/operacion/tienda/lote',{generacion:o.generacion,revision:o.revision,ficha:{...fichaPrueba,lugar:''}},t.staff)).status,422)
  assert.equal((await r('/api/operacion/tienda/lote',{generacion:o.generacion,revision:o.revision,ficha:fichaPrueba},t.staff)).status,200)
  assert.equal((await r('/api/operacion/tienda/lote',{generacion:o.generacion,revision:o.revision,ficha:fichaPrueba},t.staff)).status,409)
  assert.equal((await r('/api/tienda')).body.disponible,true)
 })
 await caso('cambio de precio no cobra de más; cotización vencida y ajena rechazadas',async()=>{
  const q=await cotizarTienda(t,'precio-prueba-001'),antes=await saldo()
  await t.db.exec('UPDATE reserva_cosecha SET precio=99000')
  assert.equal((await r('/api/reserva-cosecha/apartar',q)).status,409);assert.equal(await saldo(),antes);assert.equal(await bolsas(),0)
  await t.db.exec('UPDATE reserva_cosecha SET precio=89000')
  assert.equal((await r('/api/reserva-cosecha/apartar',q,t.otroToken)).status,409)
  await t.db.query("UPDATE tienda_intento SET cotizacion=jsonb_set(cotizacion,'{vence}',to_jsonb('2000-01-01T00:00:00Z'::text)) WHERE referencia=$1",[q.ref])
  assert.equal((await r('/api/reserva-cosecha/apartar',q)).status,409)
 })
 let pagada
 await caso('compra con saldo exacto y última unidad; recuperación y replay sin segundo cargo',async()=>{
  await t.db.exec('DELETE FROM reserva_cosecha WHERE numero<>1')
  const actual=await saldo();await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'consumo','Preparación de saldo exacto')",[t.id,89000-actual])
  const q=await cotizarTienda(t,'ultima-bolsa-001');pagada=(await r('/api/reserva-cosecha/apartar',q)).body
  assert.equal(pagada.cobrado,89000);assert.equal(pagada.saldo.total,0);assert.equal(pagada.cotizacion.oferta.total,1);assert.ok(pagada.compra)
  assert.equal((await r('/api/tienda')).body.quedan,0)
  const recuperada=await r('/api/tienda/intento/'+q.ref);assert.equal(recuperada.body.estado,'confirmado');assert.equal(recuperada.body.recibo.compra,pagada.compra)
  assert.equal((await r('/api/reserva-cosecha/apartar',{ref:q.ref})).body.repetido,true);assert.equal(await bolsas(),1)
  assert.equal((await r('/api/tienda/intento/'+q.ref,undefined,t.otroToken)).body.estado,'ausente')
  const listado=(await r('/api/compras')).body.compras.find(c=>c.tipo==='bolsa');assert.equal(listado.detalle.cotizacion.oferta.ficha.lugar,fichaPrueba.lugar)
 })
 await caso('cierre serializado no descarta compra confirmada; saldo del recibo es histórico',async()=>{
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,30000,'recarga','Recarga posterior')",[t.id])
  const cerrado=await r('/api/tienda/intento/ultima-bolsa-001/cerrar',{});assert.equal(cerrado.body.estado,'confirmado');assert.equal(cerrado.body.recibo.saldo.total,0);assert.equal(await saldo(),30000)
  assert.equal((await r('/api/tienda/intento/ultima-bolsa-001/cerrar',{confirmado:true})).body.estado,'cerrado')
  assert.ok(!(await r('/api/tienda/recuperacion')).body.intentos.some(i=>i.referencia==='ultima-bolsa-001'))
  assert.equal((await r('/api/tienda/intento/ausente-cerrado-001/cerrar',{})).body.estado,'cerrado')
  assert.equal((await r('/api/reserva-cosecha/apartar',{ref:'ausente-cerrado-001'})).status,409)
 })
 await caso('entrega exige preparación; devolución exacta idempotente y sin reventa del número',async()=>{
  const ruta='/api/operacion/tienda/compra/'+pagada.compra
  assert.equal((await r(ruta,{estado:'lista'})).status,403)
  assert.equal((await r('/api/operacion/entregas/bolsa/'+pagada.compra,{},t.staff)).status,409)
  assert.equal((await r(ruta,{estado:'lista'},t.staff)).status,200)
  assert.equal((await r(ruta,{estado:'lista'},t.staff)).body.repetido,true)
  assert.equal((await r(ruta,{estado:'reembolsada',motivo:'Demora de prueba'},t.staff)).status,200)
  assert.equal(await saldo(),119000)
  assert.equal((await r(ruta,{estado:'reembolsada',motivo:'Demora de prueba'},t.staff)).body.repetido,true);assert.equal(await saldo(),119000)
  assert.equal((await r('/api/operacion/entregas/bolsa/'+pagada.compra,{},t.staff)).status,409)
  assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'devolucion-bolsa:%'")).rows[0].n,1)
  assert.equal((await r('/api/tienda')).body.quedan,0)
  assert.ok(!(await r('/api/operacion/entregas',undefined,t.staff)).body.entregas.some(x=>x.id===pagada.compra))
  assert.ok(!(await r('/api/operacion/listas/entregas?estado=pendientes',undefined,t.staff)).body.filas.some(x=>x.id===pagada.compra))
 })
 await caso('lote nuevo no hereda condiciones; preparación y entrega permanente sobreviven al inventario',async()=>{
  await t.db.exec('UPDATE reserva_cosecha SET generacion=generacion+1,socio_id=NULL,apartada=NULL')
  assert.equal((await r('/api/tienda')).body.disponible,false)
  const o=(await r('/api/tienda')).body;assert.equal((await r('/api/operacion/tienda/lote',{generacion:o.generacion,revision:o.revision,ficha:fichaPrueba},t.staff)).status,200)
  const q=await cotizarTienda(t,'segundo-lote-001'),b=(await r('/api/reserva-cosecha/apartar',q)).body
  assert.equal(b.numero,1);assert.notEqual(b.compra,pagada.compra)
  assert.equal((await r('/api/operacion/tienda/compra/'+b.compra,{estado:'lista'},t.staff)).status,200)
  assert.equal((await r('/api/operacion/entregas/bolsa/'+b.compra,{},t.staff)).status,200)
  assert.equal((await r('/api/operacion/entregas/bolsa/'+b.compra,{},t.staff)).body.repetido,true)
  assert.equal((await r('/api/operacion/tienda/compra/'+b.compra,{estado:'reembolsada',motivo:'Ya entregada'},t.staff)).status,409)
  assert.equal(await bolsas(),2)
 })
 await caso('métricas agregadas validadas y restringidas a administración',async()=>{
  assert.equal((await r('/api/tienda/evento',{evento:'vista',dispositivo:'movil',telefono:'dato'})).status,422)
  assert.equal((await r('/api/tienda/evento',{evento:'vista',dispositivo:'movil'})).status,200)
  assert.equal((await r('/api/operacion/metricas-tienda')).status,403)
  const m=await r('/api/operacion/metricas-tienda',undefined,t.staff);assert.equal(m.body.eventos[0].cantidad,1);assert.equal(m.body.estados.length,2)
 })
 await caso('migración enlaza cobros históricos solo con evidencia transaccional exacta',async()=>{
  await t.db.exec('BEGIN')
  await t.db.query("INSERT INTO compra_bolsa(socio_id,numero,generacion,total) VALUES($1,100,80,12000),($1,101,80,12000)",[t.otro])
  for(const [numero,ref] of [[100,'sol:historica-exacta'],[101,'sol:historica-distinta']]){
   await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES($1,-12000,'consumo','Fixture histórico',$2)",[t.otro,ref])
   await t.db.query("INSERT INTO solicitud_compra(socio_id,referencia,operacion,huella,respuesta,creada) VALUES($1,$2,'bolsa','bolsa',$3::jsonb,now()+$4::int*interval '1 second')",[t.otro,ref,JSON.stringify({numero,cobrado:12000,saldo:{pagado:0,bono:0,total:0}}),numero===100?0:1])
  }
  await t.db.exec('COMMIT');await t.db.exec(readFileSync('db/023_tienda.sql','utf8'))
  const rows=(await t.db.query('SELECT numero,referencia FROM compra_bolsa WHERE generacion=80 ORDER BY numero')).rows
  assert.equal(rows[0].referencia,'historica-exacta');assert.equal(rows[1].referencia,null)
 })
}finally{mkdirSync('entregables/mejoras-tienda-2026-10-09/evidencia',{recursive:true});writeFileSync('entregables/mejoras-tienda-2026-10-09/evidencia/api.json',JSON.stringify(resultados,null,2));await t.db.close()}
