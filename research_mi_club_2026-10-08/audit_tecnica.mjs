// Auditoría reproducible: PGlite en memoria, sin credenciales, red ni datos reales.
import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { preparar } from '../club-lupita/tests/soporte-perfiles-equipo.mjs'
const t = await preparar()
const evidencia = []
let secuencia = 0
const clean = r => ({ status: r.status, body: r.body })
async function caso(nombre, trabajo) {
  try { const datos = await trabajo(); evidencia.push({ nombre, verificado: true, datos }); console.log('VERIFICADO ' + nombre) }
  catch (e) { evidencia.push({ nombre, verificado: false, error: String(e.stack ?? e) }); console.log('ERROR ' + nombre + ': ' + e.message) }
}
async function socio(saldo = 1000000) {
  const tel = '5056900' + String(++secuencia).padStart(4, '0')
  const { rows: [s] } = await t.db.query("INSERT INTO socio(telefono,nombre) VALUES($1,'Cliente sintético Club') RETURNING id", [tel])
  if (saldo) await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'recarga','Prueba aislada Club')", [s.id,saldo])
  const token = await t.firmar(t.env.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+3600000})
  return { id:s.id,tel,token,call:(path,body)=>t.request(path,body,token) }
}
async function membresia(s, { vencida = false, renueva = true } = {}) {
  return (await t.db.query(`INSERT INTO membresia(socio_id,numero,cuota,desde,hasta,autorenueva,renovacion_consentida)
    SELECT $1,n,95000,now()-interval '31 days',now()+CASE WHEN $2 THEN interval '-1 second' ELSE interval '30 days' END,$3,now()-interval '31 days'
    FROM generate_series(1,100) n WHERE NOT EXISTS(SELECT 1 FROM membresia m WHERE m.numero=n AND m.estado IN ('activa','en_gracia')) ORDER BY n LIMIT 1 RETURNING id`,[s.id,vencida,renueva])).rows[0]
}
const balance = async s => (await t.db.query('SELECT total FROM saldo_de($1)',[s.id])).rows[0].total
try {
  await caso('T01: GET /yo renueva y cobra exactamente una vez', async () => {
    const s=await socio(); await membresia(s,{vencida:true}); const antes=await balance(s)
    const primera=await s.call('/api/yo'),despues=await balance(s),segunda=await s.call('/api/yo')
    assert.equal(primera.status,200);assert.equal(antes-despues,95000);assert.equal(await balance(s),despues)
    return {antes,despues,debito:antes-despues,segundaConsultaNoDuplica:segunda.body.saldo.total===despues}
  })
  await caso('T02: beneficio rechaza membresía renovable hasta consultar /yo',async()=>{
    const s=await socio();await membresia(s,{vencida:true})
    const antes=await s.call('/api/beneficios/solicitar',{clase:'bebida_dia'})
    const yo=await s.call('/api/yo'),despues=await s.call('/api/beneficios/solicitar',{clase:'bebida_dia'})
    assert.equal(antes.status,403);assert.equal(yo.status,200);assert.equal(despues.status,200)
    return {antes:clean(antes),despues:clean(despues)}
  })
  await caso('T03: reingreso: /yo dice bolsa usada y API entrega segunda bolsa del mismo mes',async()=>{
    const s=await socio();const m=await membresia(s)
    const primera=await s.call('/api/beneficios/solicitar',{clase:'bolsa_mes'})
    assert.equal((await t.request('/api/operacion/beneficios/entregar',{codigo:primera.body.codigo},t.staff)).status,200)
    // Simula el tiempo: el período anterior terminó después de usar una bolsa en el mes actual.
    await t.db.query("UPDATE membresia SET hasta=now()-interval '1 second',autorenueva=false WHERE id=$1",[m.id])
    const reingreso=await s.call('/api/membresia/apartar',{})
    assert.equal(reingreso.status,200)
    const yo=await s.call('/api/yo'),segunda=await s.call('/api/beneficios/solicitar',{clase:'bolsa_mes'})
    const entrega=await t.request('/api/operacion/beneficios/entregar',{codigo:segunda.body.codigo},t.staff)
    const usos=(await t.db.query("SELECT b.ventana::text,count(*)::int n FROM beneficio_uso b JOIN membresia m ON m.id=b.membresia_id WHERE m.socio_id=$1 AND b.clase='bolsa_mes' GROUP BY b.ventana",[s.id])).rows
    assert.ok(yo.body.bolsaDelMes);assert.equal(segunda.status,200);assert.equal(entrega.status,200);assert.equal(usos[0].n,2)
    return {reingreso:clean(reingreso),bolsaDelMesEnYo:yo.body.bolsaDelMes,segunda:clean(segunda),entrega:clean(entrega),usos}
  })
  await caso('T04: reactivaciones de nueva membresía vuelven a sumar 500 puntos',async()=>{
    const s=await socio();await s.call('/api/membresia/apartar',{})
    await t.db.query("UPDATE membresia SET desde=now()-interval '31 days',hasta=now()-interval '1 second',autorenueva=false WHERE socio_id=$1",[s.id])
    assert.equal((await s.call('/api/membresia/apartar',{})).status,200)
    const puntos=(await t.db.query("SELECT count(*)::int activaciones,sum(puntos)::int puntos FROM punto WHERE socio_id=$1 AND motivo='membresia'",[s.id])).rows[0]
    assert.equal(puntos.puntos,1000);return puntos
  })
  await caso('T05: experiencia recién creada accesible inmediatamente a no miembro',async()=>{
    const s=await socio()
    await t.db.query("INSERT INTO experiencia(id,nombre,cuando,cupos,precio) VALUES('audit-nueva','Nueva experiencia auditada',now()+interval '7 days',12,10000)")
    const catalogo=await t.request('/api/catalogo',undefined,null),compra=await s.call('/api/experiencia/audit-nueva/apartar',{ref:'audit-no-miembro-001'})
    assert.ok(catalogo.body.experiencias.some(e=>e.id==='audit-nueva'));assert.equal(compra.status,200)
    return {publica:true,sinMembresia:true,compra:clean(compra)}
  })
  await caso('T06: entrada cedida no aparece en compras del destinatario',async()=>{
    const comprador=await socio(),destino=await socio()
    const compra=await comprador.call('/api/experiencia/audit-nueva/apartar',{ref:'audit-cesion-001'});assert.equal(compra.status,200)
    await t.db.query('UPDATE asiento_experiencia SET cedido_a=$1 WHERE socio_id=$2',[destino.id,comprador.id])
    const origen=await comprador.call('/api/compras'),receptor=await destino.call('/api/compras')
    assert.ok(origen.body.compras.some(c=>c.detalle.cedida));assert.equal(receptor.body.compras.length,0)
    return {comprador:origen.body.compras,destinatario:receptor.body.compras}
  })
  await caso('T07: cancelar y activar renovación no registran evento de auditoría ni aviso',async()=>{
    const s=await socio();await membresia(s)
    const cancelar=await s.call('/api/membresia/cancelar',{}),activar=await s.call('/api/membresia/renovacion',{})
    const logs=(await t.db.query('SELECT accion FROM auditoria WHERE socio_id=$1',[s.id])).rows
    const avisos=(await t.db.query('SELECT texto FROM aviso_cliente WHERE socio_id=$1',[s.id])).rows
    assert.equal(cancelar.status,200);assert.equal(activar.status,200);assert.equal(logs.length,0);assert.equal(avisos.length,0)
    return {cancelar:clean(cancelar),activar:clean(activar),logs,avisos}
  })
  await caso('T08: sin saldo pasa a vencida sin gracia ni aviso y no se recupera al recargar',async()=>{
    const s=await socio(90000);await membresia(s,{vencida:true})
    await s.call('/api/yo')
    const estado=(await t.db.query('SELECT estado FROM membresia WHERE socio_id=$1',[s.id])).rows[0].estado
    await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,10000,'recarga','Recarga sintética tras vencimiento')",[s.id])
    const yo=await s.call('/api/yo'),avisos=(await s.call('/api/avisos')).body.avisos
    assert.equal(estado,'vencida');assert.equal(yo.body.membresia,null);assert.equal(avisos.length,0)
    return {estado,saldoTrasRecarga:yo.body.saldo.total,membresia:yo.body.membresia,avisos}
  })
  await caso('T09: reabrir código activo no renueva diez minutos de vigencia',async()=>{
    const s=await socio();await membresia(s)
    const primero=await s.call('/api/beneficios/solicitar',{clase:'bebida_dia'})
    await t.db.query("UPDATE beneficio_solicitud SET vence=now()+interval '30 seconds' WHERE codigo=$1",[primero.body.codigo])
    const segundo=await s.call('/api/beneficios/solicitar',{clase:'bebida_dia'})
    const segundos=(Date.parse(segundo.body.vence)-Date.now())/1000
    assert.equal(segundo.body.codigo,primero.body.codigo);assert.ok(segundos>0&&segundos<31)
    return {mismoCodigo:true,segundosRestantesAproximados:segundos,vence:segundo.body.vence}
  })
  await caso('T10: otra cuenta repite ticket y recibe 200 sin sello ni conflicto explícito',async()=>{
    const uno=await socio(),dos=await socio()
    const a=await t.request('/api/tanda/sellar',{telefono:uno.tel,ticket:'auditoria-ticket-001'},t.staff)
    const b=await t.request('/api/tanda/sellar',{telefono:dos.tel,ticket:'auditoria-ticket-001'},t.staff)
    const c=await t.request('/api/tanda/sellar',{telefono:uno.tel,ticket:' auditoria-ticket-001 '},t.staff)
    assert.equal(a.status,200);assert.equal(b.status,200);assert.equal(b.body.nuevo,null);assert.equal(c.body.nuevo,2)
    return {original:clean(a),otroCliente:clean(b),mismoTicketConEspacios:clean(c)}
  })
  await caso('T11: controles de autenticación, titularidad, entrega única y referencia de compra',async()=>{
    const s=await socio(),otro=await socio();await membresia(s)
    assert.equal((await t.request('/api/yo',undefined,null)).status,401)
    assert.equal((await s.call('/api/operacion/beneficios/entregar',{codigo:'012345ABCDEF'})).status,403)
    const ben=await s.call('/api/beneficios/solicitar',{clase:'bebida_dia'})
    const entregado=await t.request('/api/operacion/beneficios/entregar',{codigo:ben.body.codigo},t.staff)
    const repetido=await t.request('/api/operacion/beneficios/entregar',{codigo:ben.body.codigo},t.staff)
    assert.equal(entregado.status,200);assert.equal(repetido.status,409)
    const c1=await s.call('/api/experiencia/audit-nueva/apartar',{ref:'audit-idempotencia-001'}),c2=await s.call('/api/experiencia/audit-nueva/apartar',{ref:'audit-idempotencia-001'})
    assert.equal(c1.status,200);assert.equal(c2.body.repetido,true);assert.equal(c1.body.butaca,c2.body.butaca)
    assert.equal((await otro.call('/api/compras')).body.compras.length,0)
    return {sinSesion:401,socioNoEntrega:403,entregaUnica:[entregado.status,repetido.status],reintentoMismaButaca:c2.body.butaca,datosOtroClienteNoExpuestos:true}
  })
  await caso('T12: alta de cliente A renueva y cobra también a cliente B',async()=>{
    const a=await socio(),b=await socio();await membresia(b,{vencida:true});const antes=await balance(b)
    const alta=await a.call('/api/membresia/apartar',{}),despues=await balance(b)
    assert.equal(alta.status,200);assert.equal(antes-despues,95000)
    return {altaA:alta.status,debitoAB:antes-despues,consentimientoPrevioB:true}
  })
  await caso('T13: topes diarios y mensuales toman hora de Managua',async()=>{
    const datos=(await t.db.query(`SELECT dia_managua('2026-10-09T01:00:00Z'::timestamptz)::text AS dia,
      mes_managua('2026-11-01T01:00:00Z'::timestamptz)::text AS mes,
      dia_managua('2026-10-09T06:00:00Z'::timestamptz)::text AS medianoche`)).rows[0]
    assert.deepEqual(datos,{dia:'2026-10-08',mes:'2026-10-01',medianoche:'2026-10-09'});return datos
  })
  await caso('T14: no hay sobreventa secuencial de experiencias y saldo insuficiente no cobra',async()=>{
    await t.db.query("INSERT INTO experiencia(id,nombre,cuando,cupos,precio) VALUES('audit-tope','Una butaca sintética',now()+interval '3 days',1,10000)")
    const s=await socio(),otro=await socio(),pobre=await socio(1),antes=await balance(pobre)
    const baja=await pobre.call('/api/experiencia/audit-tope/apartar',{ref:'audit-saldo-001'})
    assert.equal(baja.status,409);assert.equal(await balance(pobre),antes)
    assert.equal((await s.call('/api/experiencia/audit-tope/apartar',{ref:'audit-tope-001'})).status,200)
    const lleno=await otro.call('/api/experiencia/audit-tope/apartar',{ref:'audit-tope-002'})
    assert.equal(lleno.status,409)
    return {sinSaldo:baja.status,sinCargo:await balance(pobre)===antes,lleno:lleno.status}
  })
} finally {
  writeFileSync(new URL('./evidencia_tecnica.json',import.meta.url),JSON.stringify({fecha:'2026-10-08 America/Managua',entorno:'PGlite en memoria; sin red; pruebas secuenciales, no prueban concurrencia PostgreSQL multiusuario',resultados:evidencia},null,2))
  await t.close()
}
if(evidencia.some(e=>!e.verificado))process.exitCode=1
