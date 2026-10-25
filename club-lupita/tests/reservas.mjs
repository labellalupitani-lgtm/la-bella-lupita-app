import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { preparar } from './soporte-perfiles-equipo.mjs'
const t = await preparar({reservasConfiguradas:false})
const dia = n => new Date(Date.now() - 21600000 + n * 86400000).toISOString().slice(0, 10)
const visita = (n = 2, extra = {}) => ({ zona: 'terraza', cuando: dia(n) + 'T12:00:00-06:00', horas: 2, personas: 2, referencia: crypto.randomUUID(), ...extra })
const ok = (r, status = 200) => { assert.equal(r.status, status, JSON.stringify(r.body)); return r.body }
try {
  let cfg = ok(await t.request('/api/reservas/configuracion', undefined, null))
  assert.ok(cfg.zonas.every(z => z.mesas.length === 0))
  ok(await t.request('/api/reserva', visita()), 409)
  assert.equal(ok(await t.request('/api/reservas/disponibilidad?dia=' + dia(2) + '&personas=2&horas=2', undefined, null)).zonas.terraza.configurada, false)
  cfg.zonas.forEach(z => { z.mesas = z.id === 'vip' ? [{ id: 'salon', plazas: 12 }] : [{ id: 'a', plazas: 2 }, { id: 'b', plazas: 4 }]; z.combinaciones = z.id === 'vip' ? [] : [['a', 'b']] })
  assert.match(cfg.politica.cancelacion,/devuelve íntegramente/);assert.match(cfg.politica.inasistencia,/devuelve íntegramente/)
  ok(await t.request('/api/operacion/reservas-configuracion', {...cfg,politica:{...cfg.politica,cancelacion:'No reembolsable'}}, t.staff),422)
  ok(await t.request('/api/operacion/reservas-configuracion', cfg), 403)
  cfg = ok(await t.request('/api/operacion/reservas-configuracion', cfg, t.staff))
  cfg=ok(await t.request('/api/operacion/reservas-configuracion',{...cfg,cierres:[{dia:dia(12),zona:'terraza',desde:11,hasta:15,motivo:'Cierre sintético por lluvia.'}]},t.staff))
  const porZona=ok(await t.request('/api/reservas/disponibilidad?dia='+dia(12)+'&personas=2&horas=2',undefined,null))
  assert.ok(!porZona.zonas.terraza.horas.includes(12));assert.ok(porZona.zonas.barra.horas.includes(12));assert.ok(porZona.zonas.terraza.horas.includes(15))
  ok(await t.request('/api/reserva',visita(12)),409)
  ok(await t.request('/api/operacion/reservas-configuracion', { ...cfg, version: 1 }, t.staff), 409)
  for (const cuando of ['2026-11-31T12:00:00-06:00', dia(2) + 'T12:00:01-06:00', dia(2) + 'T12:30:00-06:00', dia(2) + 'T25:00:00-06:00']) ok(await t.request('/api/reserva', visita(2, { cuando })), 422)
  const intento = visita(), primera = ok(await t.request('/api/reserva', intento))
  assert.equal(primera.reserva.estado, 'confirmada'); assert.deepEqual(primera.reserva.mesas, ['a'])
  assert.equal(t.worker.reciboReservaValido(primera),true)
  const calendario=t.worker.calendarioReserva(primera.reserva)
  for(const campo of ['DTSTAMP','DTSTART','DTEND'])assert.match(calendario,new RegExp(campo+':\\d{8}T\\d{6}Z\\r\\n'))
  for(const invalida of [{},{reserva:null},{...primera,reserva:{...primera.reserva,id:''}},{...primera,reserva:{...primera.reserva,cuando:'2026-11-31T12:00:00Z'}},{...primera,reserva:{...primera.reserva,personas:'2'}},{...primera,reserva:{...primera.reserva,politica:{tipo:'anticipo',importe:50000}}}])assert.equal(t.worker.reciboReservaValido(invalida),false)
  assert.equal(t.worker.disponibilidadReservasValida({dia:dia(2),zonas:{}}),false)
  assert.equal(t.worker.disponibilidadReservasValida(porZona,dia(12)),true)
  assert.equal(t.worker.disponibilidadReservasValida(porZona,dia(13)),false)
  for(const zonas of [null,[null,null,null,null,null],[{id:'terraza'}]])assert.equal(t.worker.configuracionReservasValida({...cfg,zonas}),false)
  assert.equal(ok(await t.request('/api/reserva', intento)).reserva.id, primera.reserva.id)
  ok(await t.request('/api/reserva', { ...intento, personas: 3 }), 409)
  ok(await t.request('/api/reserva', visita(2, { zona: 'barra' })), 409)
  assert.equal(ok(await t.request('/api/reservas/intento/' + intento.referencia)).reserva.id, primera.reserva.id)
  ok(await t.request('/api/reservas/intento/' + intento.referencia, undefined, t.otroToken), 404)
  const otra = ok(await t.request('/api/reserva', visita(2, { personas: 4 }), t.otroToken))
  assert.deepEqual(otra.reserva.mesas, ['b'])
  assert.ok(!ok(await t.request('/api/reservas/disponibilidad?dia=' + dia(2) + '&personas=2&horas=2', undefined, null)).zonas.terraza.horas.includes(12))
  ok(await t.request('/api/reservas/' + primera.reserva.id + '/cambiar', { version: 1, cuando: dia(2) + 'T12:00:00-06:00', horas: 2, personas: 6 }), 409)
  assert.equal(ok(await t.request('/api/reservas/intento/' + intento.referencia)).reserva.personas, 2)
  const cambiada = ok(await t.request('/api/reservas/' + primera.reserva.id + '/cambiar', { version: 1, cuando: dia(3) + 'T14:00:00-06:00', horas: 2, personas: 6 })).reserva
  assert.deepEqual(cambiada.mesas, ['a', 'b']); assert.equal(cambiada.version, 2)
  ok(await t.request('/api/reservas/' + cambiada.id + '/cancelar', { version: 1 }), 409)
  ok(await t.request('/api/reservas/' + cambiada.id + '/cancelar', { version: 2 }, t.otroToken), 404)
  const cancelada = ok(await t.request('/api/reservas/' + cambiada.id + '/cancelar', { version: 2 })).reserva
  assert.equal(cancelada.estado, 'cancelada')
  assert.equal(ok(await t.request('/api/operacion/reservas?dia='+dia(3),undefined,t.staff)).reservas[0].estado,'cancelada')
  ok(await t.request('/api/operacion/reservas?dia='+dia(3)),403)
  ok(await t.request('/api/reservas/'+primera.reserva.id+'/disponibilidad?dia='+dia(3)+'&personas=2&horas=2',undefined,t.otroToken),404)
  assert.equal(ok(await t.request('/api/reserva', intento)).reserva.estado, 'cancelada')
  assert.equal(ok(await t.request('/api/reservas/' + cambiada.id + '/cancelar', { version: 2 })).repetido, true)
  const antes = ok(await t.request('/api/yo')).saldo
  const caja=await t.crearEmpleado({permiso:'caja'})
  ok(await t.request('/api/operacion/reservas', {...visita(15,{zona:'vip',configuracion:cfg.version}),telefono:t.tel,motivo:'Alta manual de visita sintética.'}, t.staff),422)
  ok(await t.request('/api/operacion/reservas', {...visita(15),telefono:t.tel,motivo:'Excepción sintética no autorizada.',excepcionGrupo:true}, caja.auth),403)
  const vipIntento = visita(4, { zona: 'vip', configuracion:cfg.version }), vip = ok(await t.request('/api/reserva', vipIntento)).reserva
  assert.equal(vip.deposito, 50000); assert.equal(vip.politica.tipo, 'anticipo')
  assert.equal(ok(await t.request('/api/reserva', vipIntento)).cobrado, 0)
  ok(await t.request('/api/operacion/reservas/'+vip.id,{version:1,accion:'devolver',motivo:'Caja no autoriza devoluciones.'},caja.auth),403)
  ok(await t.request('/api/operacion/reservas/' + vip.id, { version: 1, accion: 'devolver', motivo: 'Devolución acordada para prueba.' }), 403)
  const reembolso = ok(await t.request('/api/operacion/reservas/' + vip.id, { version: 1, accion: 'devolver', motivo: 'Devolución acordada para prueba.' }, t.staff)).reserva
  assert.equal(reembolso.anticipo_devuelto, 50000)
  ok(await t.request('/api/operacion/reservas/' + vip.id, { version: 2, accion: 'devolver', motivo: 'Reintento de devolución acordada.' }, t.staff), 409)
  assert.deepEqual(ok(await t.request('/api/yo')).saldo, antes)
  assert.equal((await t.db.query("SELECT count(*)::int AS n FROM asiento WHERE ref_externa=$1", ['reserva-anticipo:' + vip.id])).rows[0].n, 1)
  assert.equal((await t.db.query('SELECT count(*)::int AS n FROM reserva_evento WHERE reserva_id=$1', [vip.id])).rows[0].n, 2)
  ok(await t.request('/api/operacion/reservas/' + vip.id, { version: 2, accion: 'no_asistio', motivo: 'No debe marcarse antes de la visita.' }, t.staff), 409)
  ok(await t.request('/api/operacion/reservas-configuracion', { ...cfg, zonas: cfg.zonas.map(z => z.id === 'terraza' ? { ...z, mesas: [], combinaciones: [] } : z) }, t.staff), 409)
  const metric = {evento:'revision',referencia:crypto.randomUUID()}
  ok(await t.request('/api/reservas/evento',metric));ok(await t.request('/api/reservas/evento',metric))
  assert.equal((await t.db.query("SELECT cantidad FROM reserva_metrica WHERE evento='revision'")).rows[0].cantidad,1)
  ok(await t.request('/api/reservas/evento',{...metric,telefono:'50512345678'}),422)
  // Aplicación a un consumo real del mismo titular: no se cobra dos veces.
  const aplicada = ok(await t.request('/api/reserva',visita(6,{zona:'vip',configuracion:cfg.version}))).reserva
  await t.db.query("UPDATE reserva SET cuando=now()-interval '30 minutes',termina=now()+interval '90 minutes',estado='llego' WHERE id=$1",[aplicada.id])
  const {rows:[pedido]} = await t.db.query("INSERT INTO pedido(socio_id,referencia,lineas,total,estado) VALUES($1,'consumo-visita-prueba','[]',60000,'entregado') RETURNING id",[t.id])
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES($1,-60000,'consumo','Consumo de prueba','pedido:consumo-visita-prueba')",[t.id])
  const despuesPedido=ok(await t.request('/api/yo')).saldo.total
  const aplicacion=ok(await t.request('/api/operacion/reservas/'+aplicada.id,{accion:'aplicar',version:1,motivo:'Consumo de la visita verificado.',pedido:pedido.id},t.staff)).reserva
  assert.equal(aplicacion.anticipo_aplicado,50000)
  assert.equal(ok(await t.request('/api/yo')).saldo.total,despuesPedido+50000)
  ok(await t.request('/api/operacion/reservas/'+aplicada.id,{accion:'devolver',version:2,motivo:'No debe devolverse otra vez.'},t.staff),409)
  const punto=await t.db.query("SELECT COALESCE(SUM(p.puntos),0)::int AS n FROM punto p LEFT JOIN asiento a ON p.origen_id=a.id::text WHERE (a.ref_externa=$1 OR p.origen_id=$2)",['dep:'+aplicada.id,'reserva-anticipo:'+aplicada.id]);assert.equal(punto.rows[0].n,0)
  // El anticipo paga directamente: cero saldo disponible no exige recargarlo otra vez.
  await t.db.query("UPDATE reserva SET estado='finalizada' WHERE id=$1",[aplicada.id])
  const parcial=ok(await t.request('/api/reserva',visita(8,{zona:'vip',configuracion:cfg.version}))).reserva
  await t.db.query("UPDATE reserva SET cuando=now()-interval '30 minutes',termina=now()+interval '90 minutes',estado='llego' WHERE id=$1",[parcial.id])
  // La anterior ya terminó: la exclusión VIP no admite dos visitas simultáneas.
  const disponible=ok(await t.request('/api/yo')).saldo.total
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES($1,$2,'consumo','Agotar saldo sólo en prueba','prueba-saldo-cero')",[t.id,-disponible])
  const puntosAntes=(await t.db.query('SELECT COALESCE(sum(puntos),0)::int n FROM punto WHERE socio_id=$1',[t.id])).rows[0].n
  const operar={accion:'aplicar',version:1,motivo:'Consumo de caja verificado en prueba.',consumo:60000,comprobante:'CAJA-PRUEBA-0001'}
  ok(await t.request('/api/operacion/reservas/'+parcial.id,operar,t.staff),409)
  assert.equal(ok(await t.request('/api/yo')).saldo.total,0)
  const parte=ok(await t.request('/api/operacion/reservas/'+parcial.id,{...operar,consumo:30000},caja.auth)).reserva
  assert.equal(parte.anticipo_aplicado,30000);assert.equal(parte.anticipo_devuelto,0)
  assert.equal(ok(await t.request('/api/yo')).saldo.total,0)
  ok(await t.request('/api/operacion/reservas/'+parcial.id,{...operar,consumo:30000},t.staff),409)
  ok(await t.request('/api/operacion/reservas/'+parcial.id,{...operar,consumo:30000,version:2},t.staff),409)
  const resto=ok(await t.request('/api/operacion/reservas/'+parcial.id,{accion:'devolver',version:2,motivo:'Devolución del remanente autorizada.'},t.staff)).reserva
  assert.equal(resto.anticipo_aplicado,30000);assert.equal(resto.anticipo_devuelto,20000)
  assert.equal(ok(await t.request('/api/yo')).saldo.total,20000)
  assert.equal((await t.db.query('SELECT COALESCE(sum(puntos),0)::int n FROM punto WHERE socio_id=$1',[t.id])).rows[0].n,puntosAntes+30)
  // Un remanente conserva la composición del libro: consumir primero bono no lo convierte en dinero pagado.
  await t.db.query("UPDATE reserva SET estado='finalizada' WHERE id=$1",[parcial.id])
  const saldoOtro=ok(await t.request('/api/yo',undefined,t.otroToken)).saldo.total
  if(saldoOtro)await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'consumo','Vaciar saldo sintético')",[t.otro,-saldoOtro])
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,30000,'recarga','Recarga sintética'),($1,20000,'bono','Bono sintético')",[t.otro])
  const mixto=ok(await t.request('/api/operacion/reservas',{...visita(20,{zona:'vip',configuracion:cfg.version}),telefono:'50500000002',autorizacionVip:true,motivo:'Titular sintético autorizó el anticipo.'},t.staff)).reserva
  await t.db.query("UPDATE reserva SET cuando=now()-interval '30 minutes',termina=now()+interval '90 minutes',estado='llego' WHERE id=$1",[mixto.id])
  ok(await t.request('/api/operacion/reservas/'+mixto.id,{accion:'aplicar',version:1,consumo:30000,comprobante:'CAJA-MIXTO-0001',motivo:'Aplicación parcial sintética con bono.'},caja.auth))
  assert.deepEqual(ok(await t.request('/api/yo',undefined,t.otroToken)).saldo,{pagado:0,bono:0,total:0})
  ok(await t.request('/api/operacion/reservas/'+mixto.id,{accion:'devolver',version:2,motivo:'Devolver remanente sintético autorizado.'},t.staff))
  assert.deepEqual(ok(await t.request('/api/yo',undefined,t.otroToken)).saldo,{pagado:20000,bono:0,total:20000})
  // La migración se puede repetir sin volver a mover dinero ni versiones.
  const dineroAntes=JSON.stringify((await t.db.query('SELECT * FROM asiento ORDER BY id')).rows)
  await t.db.exec(readFileSync('db/027_reservas.sql','utf8'));await t.db.exec(readFileSync('db/027_reservas.sql','utf8'))
  assert.equal(JSON.stringify((await t.db.query('SELECT * FROM asiento ORDER BY id')).rows),dineroAntes)
  // Transporte externo simulado: ninguna dirección ni mensaje sale de este proceso.
  await t.db.query("UPDATE socio SET correo='reservas@example.invalid',correo_verificado=now() WHERE id=$1",[t.id])
  const enviados=[], fetchOriginal=globalThis.fetch
  globalThis.fetch=async(url,init)=>{assert.equal(url,'https://api.resend.com/emails');enviados.push({clave:init.headers['Idempotency-Key'],datos:JSON.parse(init.body)});return new Response(JSON.stringify({id:'simulado-'+enviados.length}),{status:200})}
  try{
    const correoEnv={...t.env,RESERVAS_CORREO:'true',RESEND_API_KEY:'simulada',EMAIL_FROM:'prueba@example.invalid'}
    await t.worker.procesarCorreosReservas(correoEnv,20)
    const numero=enviados.length;assert.ok(numero>0);await t.worker.procesarCorreosReservas(correoEnv,20);assert.equal(enviados.length,numero)
    assert.equal(new Set(enviados.map(e=>e.clave)).size,enviados.length)
    assert.ok(enviados.every(e=>e.datos.to[0]==='reservas@example.invalid'))
    assert.equal((await t.db.query("SELECT count(*)::int n FROM reserva_correo WHERE reserva_id=$1 AND version=1 AND enviado IS NOT NULL",[cambiada.id])).rows[0].n,0)
  }finally{globalThis.fetch=fetchOriginal}
  writeFileSync('entregables/reservas-2026-10-10/pruebas-reservas.json',JSON.stringify({fecha:new Date().toISOString(),correcto:true,entorno:'PGlite aislado, todas las cuentas y correos sintéticos',casos:['configuración pendiente y revisiones','fechas imposibles y precisión','contratos de respuesta inválidos','capacidad y combinaciones','solapes por titular','idempotencia y recuperación privada','cambio atómico y versiones','cancelación y reintento canónico','anticipo único y devolución exacta','aplicación a consumo y puntos','migración repetible','avisos deduplicados y obsoletos descartados','métricas sin campos personales y deduplicadas']},null,2))
  console.log('Reservas: configuración, fechas estrictas, inventario por grupo, solapes, reintentos, recuperación, propiedad, cambios atómicos, revisiones y devolución verificados.')
} finally { await t.close() }
