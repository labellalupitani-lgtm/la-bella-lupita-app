import {habilitarTienda,cotizarTienda} from './tienda-fixture.mjs'
import assert from 'node:assert/strict';
import { preparar } from './soporte.mjs';
const t=await preparar();
const {db,request,id,otro,tel,staff,otroToken}=t;
let count=0;
const prueba=async(name,fn)=>{await fn();console.log('PASA '+name);count++;};
try {
await prueba('migración de puntos con historial y consumo posterior',async()=>{
  assert.equal((await db.query("SELECT puntos FROM punto WHERE motivo='consumo'")).rows[0].puntos,10);
  await db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES ($1,-20000,'consumo','Nuevo consumo')",[id]);
  assert.equal((await db.query("SELECT sum(puntos)::int n FROM punto WHERE motivo='consumo'")).rows[0].n,30);
});
await prueba('permisos y aislamiento de cuenta',async()=>{
  assert.equal((await request('/api/yo',undefined,null)).status,401);
  assert.equal((await request('/api/tanda/sellar',{telefono:tel,ticket:'sellar-000'})).status,403);
  assert.equal((await request('/api/cuenta/recargar',{telefono:tel,monto:20000,ref:'recarga-000'})).status,403);
  assert.equal((await request('/api/yo?telefono='+tel,undefined,otroToken)).body.socio.id,otro);
});
await prueba('cobro de caja al socio indicado e idempotencia',async()=>{
  const payload={telefono:tel,monto:10000,ref:'caja-0001'};
  assert.equal((await request('/api/cuenta/cobrar',payload,staff)).status,200);
  assert.equal((await request('/api/cuenta/cobrar',payload,staff)).body.repetido,true);
  assert.equal((await request('/api/cuenta/cobrar',{...payload,monto:30000},staff)).status,409);
  assert.equal((await db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa='pedido:caja-0001'")).rows[0].n,1);
});
await prueba('membresía vencida no concede beneficios ni cargos sin consentimiento',async()=>{
  assert.equal((await request('/api/beneficio/bebida_dia',{})).status,403);
  assert.equal((await request('/api/yo')).body.membresia,null);
  assert.equal((await db.query("SELECT count(*)::int n FROM asiento WHERE concepto LIKE '%renovación%'")).rows[0].n,0);
});
await prueba('noveno sello conserva un premio pendiente y permite renovarlo',async()=>{
  assert.equal((await request('/api/tanda/sellar',{telefono:tel,ticket:'sellar-009'},staff)).body.cerrada,true);
  assert.equal((await request('/api/yo')).body.premiosPendientes,1);
  const a=await request('/api/tanda/canjear',{});assert.equal(a.status,200);
  const same=await request('/api/tanda/canjear',{});assert.equal(same.body.codigo,a.body.codigo);
  await db.exec("UPDATE vale SET emitido=now()-interval '2 minutes',vence=now()-interval '1 second'");
  const b=await request('/api/tanda/canjear',{});assert.equal(b.status,200);assert.notEqual(a.body.codigo,b.body.codigo);
  assert.equal((await request('/api/vale/quemar',{codigo:a.body.codigo},staff)).status,409);
  assert.equal((await request('/api/vale/quemar',{codigo:b.body.codigo},staff)).status,200);
  assert.equal((await request('/api/vale/quemar',{codigo:b.body.codigo},staff)).status,409);
  assert.equal((await request('/api/yo')).body.premiosPendientes,0);
});
await prueba('reserva válida, duplicada y cierre con minutos',async()=>{
  const dia=new Date(Date.now()+86400000).toISOString().slice(0,10);
  const payload={zona:'terraza',cuando:dia+'T15:00:00-06:00',personas:2,horas:2};
  const a=await request('/api/reserva',payload);assert.equal(a.status,200);
  const b=await request('/api/reserva',payload);assert.equal(b.body.yaEstaba,true);assert.equal(b.body.reserva.id,a.body.reserva.id);
  assert.equal((await request('/api/reserva',{...payload,cuando:dia+'T20:30:00-06:00',horas:1})).status,422);
});
await prueba('reintento recupera bolsa y recibo antes de comprobar saldo o inventario',async()=>{
  await habilitarTienda(t);const cotizacionBolsa=await cotizarTienda(t,'bolsa-00001');
  const a=await request('/api/reserva-cosecha/apartar',cotizacionBolsa);assert.equal(a.status,200);
  const b=await request('/api/reserva-cosecha/apartar',{ref:'bolsa-00001'});assert.equal(b.status,200);
  assert.equal(b.body.repetido,true);assert.equal(a.body.numero,b.body.numero);
  assert.equal((await db.query("SELECT count(*)::int n FROM reserva_cosecha WHERE socio_id=$1",[id])).rows[0].n,1);
  assert.equal((await request('/api/experiencia/mesa-tostador/apartar',{ref:'bolsa-00001'})).status,409);
});
await prueba('reintento de experiencia devuelve la misma butaca',async()=>{
  const oferta=(await request('/api/catalogo')).body.experiencias.find(e=>e.id==='mesa-tostador').oferta;
  const a=await request('/api/experiencia/mesa-tostador/apartar',{ref:'butaca-0001',oferta});assert.equal(a.status,200);
  const b=await request('/api/experiencia/mesa-tostador/apartar',{ref:'butaca-0001',oferta});assert.equal(b.status,200);assert.equal(a.body.butaca,b.body.butaca);
});
await prueba('recarga y bono son una operación inseparable',async()=>{
  const payload={telefono:tel,monto:20000,ref:'recarga-00001'};
  assert.equal((await request('/api/cuenta/recargar',payload,staff)).status,200);
  assert.equal((await request('/api/cuenta/recargar',{...payload,monto:200000},staff)).status,409);
  assert.equal((await request('/api/cuenta/recargar',payload,staff)).body.repetido,true);
  assert.equal((await db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa='recarga:recarga-00001:bono'")).rows[0].n,0);
});
await prueba('reciclaje de plaza, cancelación visible y renovación consentida',async()=>{
  const alta=await request('/api/membresia/apartar',{ref:'alta-regresion-01',version:'fundadora-2026-10',configVersion:1,acepto:true});assert.equal(alta.status,200);assert.equal(alta.body.numero,1);
  assert.equal((await request('/api/yo')).body.membresia.autorenueva,true);
  assert.equal((await request('/api/membresia/cancelar',{})).status,200);
  assert.equal((await request('/api/yo')).body.membresia.autorenueva,false);
  assert.equal((await request('/api/membresia/renovacion',{})).status,200);
  await db.query("UPDATE membresia SET desde=now()-interval '31 days',hasta=now()-interval '1 minute' WHERE socio_id=$1 AND estado='activa'",[id]);
  await t.worker.mantenerMembresias(t.env);
  assert.equal((await request('/api/yo')).body.membresia.autorenueva,true);
  await t.worker.mantenerMembresias(t.env);
  assert.equal((await db.query("SELECT count(*)::int n FROM asiento WHERE concepto LIKE '%renovación%'")).rows[0].n,1);
});
await prueba('saldo y puntos llegan por API, el libro mayor no se modifica',async()=>{
  const yo=await request('/api/yo');assert.ok(yo.body.puntaje.puntos>0);assert.ok(yo.body.saldo.total>=0);
  await assert.rejects(()=>db.exec('UPDATE asiento SET monto=1 WHERE id=1'));
});
await prueba('ochenta membresías vencidas sin agotar subpeticiones del Worker',async()=>{
  await db.exec("INSERT INTO socio(telefono,nombre) SELECT '505990000'||lpad(n::text,2,'0'),'Historial sintético' FROM generate_series(2,81)n; INSERT INTO membresia(socio_id,numero,cuota,desde,hasta) SELECT s.id,n,95000,now()-interval '40 days',now()-interval '10 days' FROM generate_series(2,81)n JOIN socio s ON s.telefono='505990000'||lpad(n::text,2,'0')");
  globalThis.__testHttpCalls=0;await t.worker.mantenerMembresias(t.env);
  assert.equal(globalThis.__testHttpCalls,1);
  assert.equal((await db.query("SELECT count(*)::int n FROM membresia WHERE estado='activa' AND hasta<=now()")).rows[0].n,0);
  delete globalThis.__testHttpCalls;
});
console.log(`${count} grupos de regresión correctos.`);
} finally {await db.close();}

