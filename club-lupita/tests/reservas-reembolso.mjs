import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { preparar } from './soporte-perfiles-equipo.mjs'
const t = await preparar()
const ok = (r, status=200) => { assert.equal(r.status,status,JSON.stringify(r.body)); return r.body }
const casos=[]
try {
  const cfg=ok(await t.request('/api/reservas/configuracion',undefined,null))
  const caja=await t.crearEmpleado({permiso:'caja'})
  const saldo=async()=>ok(await t.request('/api/yo')).saldo
  const puntos=async()=>(await t.db.query('SELECT COALESCE(sum(puntos),0)::int n FROM punto WHERE socio_id=$1',[t.id])).rows[0].n
  const anterior=await saldo()
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'consumo','Vaciar cuenta sintética'),($1,30000,'recarga','Recarga sintética'),($1,20000,'bono','Bono sintético')",[t.id,-anterior.total])
  const base=await saldo(),puntosBase=await puntos()
  const crear=async(n=2)=>ok(await t.request('/api/reserva',{zona:'vip',cuando:new Date(Date.now()-21600000+n*86400000).toISOString().slice(0,10)+'T12:00:00-06:00',personas:2,horas:2,referencia:crypto.randomUUID(),configuracion:cfg.version})).reserva
  const cancelar=async(r,version=r.version)=>t.request('/api/reservas/'+r.id+'/cancelar',{version})
  const asientoDevuelto=async(id)=>(await t.db.query('SELECT count(*)::int n FROM asiento WHERE ref_externa=$1',['reserva-anticipo:'+id])).rows[0].n

  const r=await crear()
  assert.equal(await puntos(),puntosBase,'El anticipo no debe generar puntos canjeables antes del consumo')
  assert.deepEqual(await saldo(),{pagado:0,bono:0,total:0})
  const cancelada=ok(await cancelar(r)).reserva
  assert.equal(cancelada.estado,'cancelada');assert.equal(cancelada.anticipo_devuelto,50000)
  assert.deepEqual(await saldo(),base);assert.equal(await puntos(),puntosBase)
  const repetida=ok(await cancelar(r));assert.equal(repetida.repetido,true);assert.deepEqual(repetida.reserva,cancelada)
  assert.equal(await asientoDevuelto(r.id),1)
  assert.equal((await t.db.query('SELECT count(*)::int n FROM reserva_evento WHERE reserva_id=$1',[r.id])).rows[0].n,2)
  casos.push('El anticipo no acredita puntos; cancelar devuelve C$500 una sola vez y restaura pagado/bono')

  const tarde=await crear(3)
  await t.db.query("UPDATE reserva SET cuando=now()-interval '30 minutes',termina=now()+interval '90 minutes' WHERE id=$1",[tarde.id])
  assert.equal(ok(await cancelar(tarde)).reserva.anticipo_devuelto,50000)
  assert.deepEqual(await saldo(),base)
  casos.push('No se impone un plazo de cancelación: el titular puede cancelar una visita todavía sin atender')

  const ausente=await crear(4)
  const falta={accion:'no_asistio',version:1,motivo:'Inasistencia verificada en escenario sintético.'}
  ok(await t.request('/api/operacion/reservas/'+ausente.id,falta,caja.auth),409)
  assert.equal(await asientoDevuelto(ausente.id),0)
  await t.db.query("UPDATE reserva SET cuando=now()-interval '3 hours',termina=now()-interval '1 hour' WHERE id=$1",[ausente.id])
  ok(await t.request('/api/operacion/reservas/'+ausente.id,falta),403)
  const inasistencia=ok(await t.request('/api/operacion/reservas/'+ausente.id,falta,caja.auth)).reserva
  assert.equal(inasistencia.estado,'no_asistio');assert.equal(inasistencia.anticipo_devuelto,50000)
  assert.equal(ok(await t.request('/api/operacion/reservas/'+ausente.id,falta,caja.auth)).repetido,true)
  assert.equal(await asientoDevuelto(ausente.id),1);assert.deepEqual(await saldo(),base);assert.equal(await puntos(),puntosBase)
  casos.push('Inasistencia requiere personal y fin de visita; el registro y sus reintentos reintegran solo una vez')

  const parcial=await crear(5)
  await t.db.query("UPDATE reserva SET cuando=now()-interval '30 minutes',termina=now()+interval '90 minutes',estado='llego' WHERE id=$1",[parcial.id])
  ok(await t.request('/api/operacion/reservas/'+parcial.id,{accion:'aplicar',version:1,motivo:'Consumo sintético de prueba.',consumo:30000,comprobante:'CAJA-REEMBOLSO-001'},caja.auth))
  const parcialCancelada=ok(await cancelar(parcial,2)).reserva
  assert.equal(parcialCancelada.anticipo_aplicado,30000);assert.equal(parcialCancelada.anticipo_devuelto,20000)
  assert.deepEqual(await saldo(),{pagado:20000,bono:0,total:20000});assert.equal(await puntos(),puntosBase+30)
  ok(await t.request('/api/operacion/reservas/'+parcial.id,{accion:'devolver',version:3,motivo:'No duplicar devolución sintética.'},t.staff),409)
  casos.push('Tras consumo de C$300, cancelar devuelve solo C$200 y conserva únicamente los puntos del consumo')

  const historica=crypto.randomUUID(),puntosHistoricos=await puntos()
  await t.db.query("INSERT INTO reserva(id,socio_id,zona,cuando,termina,personas,deposito) VALUES($1,$2,'vip',now()+interval '9 days',now()+interval '9 days 2 hours',2,10000)",[historica,t.id])
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES($1,-10000,'consumo','Anticipo histórico sintético',$2)",[t.id,'dep:'+historica])
  assert.equal(await puntos(),puntosHistoricos+10)
  assert.equal(ok(await cancelar({id:historica,version:1})).reserva.anticipo_devuelto,10000)
  assert.equal(await puntos(),puntosHistoricos);assert.deepEqual(await saldo(),{pagado:20000,bono:0,total:20000})
  casos.push('Un anticipo histórico puntuado conserva su devolución y compensa sus puntos exactamente')

  const id=crypto.randomUUID()
  await t.db.query("INSERT INTO reserva(id,socio_id,zona,cuando,termina,personas,deposito) VALUES($1,$2,'vip',now()+interval '8 days',now()+interval '8 days 2 hours',2,50000)",[id,t.id])
  ok(await cancelar({id,version:1}),500)
  const sinOrigen=(await t.db.query('SELECT estado,cancelada,version,anticipo_devuelto FROM reserva WHERE id=$1',[id])).rows[0]
  assert.deepEqual(sinOrigen,{estado:'confirmada',cancelada:null,version:1,anticipo_devuelto:0})
  assert.equal(await asientoDevuelto(id),0);assert.deepEqual(await saldo(),{pagado:20000,bono:0,total:20000})
  casos.push('Sin cargo original verificable, toda la cancelación revierte y no inventa saldo ni éxito')

  const libro=JSON.stringify((await t.db.query('SELECT * FROM asiento ORDER BY id')).rows)
  const comprobantes=JSON.stringify((await t.db.query('SELECT id,politica FROM reserva ORDER BY id')).rows)
  const vieja={...cfg,politica:{...cfg.politica,cancelacion:'Anterior',inasistencia:'Anterior'}}
  await t.db.query('UPDATE reserva_config SET datos=$1::jsonb WHERE id=true',[JSON.stringify(vieja)])
  const migracion=readFileSync('db/028_reservas_reembolso.sql','utf8')
  await t.db.exec(migracion);const actualizada=ok(await t.request('/api/reservas/configuracion',undefined,null))
  assert.equal(actualizada.version,cfg.version+1);assert.equal(actualizada.politica.version,cfg.politica.version+1)
  assert.deepEqual(actualizada.zonas,cfg.zonas);assert.equal(actualizada.politica.cancelacion,cfg.politica.cancelacion)
  await t.db.exec(migracion);assert.deepEqual(ok(await t.request('/api/reservas/configuracion',undefined,null)),actualizada)
  assert.equal(JSON.stringify((await t.db.query('SELECT * FROM asiento ORDER BY id')).rows),libro)
  assert.equal(JSON.stringify((await t.db.query('SELECT id,politica FROM reserva ORDER BY id')).rows),comprobantes)
  casos.push('Migración repetible actualiza la política y su versión, preserva inventario, comprobantes y libro histórico')
  writeFileSync('entregables/reservas-2026-10-10/reembolsos.json',JSON.stringify({fecha:new Date().toISOString(),correcto:true,entorno:'PGlite aislado, datos sintéticos',casos},null,2))
  console.log('PASA devolución VIP: '+casos.length+' escenarios financieros y de política.')
} finally { await t.close() }
