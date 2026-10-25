import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { preparar } from './soporte-perfiles-equipo.mjs'
const t=await preparar(),original=globalThis.fetch,env={...t.env,RESERVAS_CORREO:'true',RESEND_API_KEY:'simulada',EMAIL_FROM:'prueba@example.invalid'},enviados=[]
const procesar=e=>t.worker.procesarCorreosReservas(e,1)
let falla=true
globalThis.fetch=async(url,init)=>{assert.equal(url,'https://api.resend.com/emails');enviados.push({clave:init.headers['Idempotency-Key'],mensaje:JSON.parse(init.body)});return new Response(JSON.stringify(falla?{error:'fallo simulado'}:{id:'aceptado-simulado'}),{status:falla?503:200})}
try{
  await t.db.query("UPDATE socio SET correo='reserva@example.invalid',correo_verificado=now() WHERE id=$1",[t.id])
  const crear=async(n)=>{const r=await t.request('/api/reserva',{zona:'terraza',cuando:new Date(Date.now()-21600000+n*86400000).toISOString().slice(0,10)+'T12:00:00-06:00',horas:2,personas:2,referencia:crypto.randomUUID()});assert.equal(r.status,200);return r.body.reserva}
  const cola=async(r)=>(await t.db.query("SELECT * FROM reserva_correo WHERE reserva_id=$1 AND tipo='confirmada'",[r.id])).rows[0]
  const habilitar=async(r)=>t.db.query("UPDATE reserva_correo SET disponible=now() WHERE reserva_id=$1 AND tipo='confirmada'",[r.id])
  const primera=await crear(3)
  for(const e of [{...env,RESERVAS_CORREO:'false'},{...env,RESEND_API_KEY:undefined},{...env,EMAIL_FROM:undefined},{...env,DEMO_DATABASE_URL:env.DATABASE_URL}])await procesar(e)
  assert.equal(enviados.length,0);assert.equal((await cola(primera)).intentos,0)
  await procesar(env)
  assert.equal((await cola(primera)).error,'envio_pendiente');assert.equal((await cola(primera)).intentos,1)
  assert.equal((await t.request('/api/reservas/mias')).body.reservas[0].estado,'confirmada')
  await procesar(env);assert.equal(enviados.length,1)
  await habilitar(primera);falla=false;await procesar({...env,EMAIL_FROM:'remitente-nuevo@example.invalid'})
  assert.deepEqual(enviados[1],enviados[0]);assert.ok((await cola(primera)).enviado);assert.equal((await cola(primera)).mensaje,null)
  await procesar(env);assert.equal(enviados.length,2)
  const segunda=await crear(4);falla=true;await procesar(env)
  const numero=enviados.length
  await t.db.query("UPDATE socio SET correo='nuevo@example.invalid' WHERE id=$1",[t.id]);await habilitar(segunda);await procesar(env)
  assert.equal(enviados.length,numero);assert.equal((await cola(segunda)).error,'destinatario_cambio');assert.ok((await cola(segunda)).descartado)
  const tercera=await crear(5);await procesar(env);const antesVencer=enviados.length
  await t.db.query("UPDATE reserva_correo SET iniciado=now()-interval '24 hours',disponible=now() WHERE reserva_id=$1 AND tipo='confirmada'",[tercera.id]);await procesar(env)
  assert.equal(enviados.length,antesVencer);assert.equal((await cola(tercera)).error,'requiere_revision')
  writeFileSync('entregables/reservas-2026-10-10/correo.json',JSON.stringify({fecha:new Date().toISOString(),correcto:true,transporte:'Simulado; no se enviaron mensajes reales',casos:['Canal incompleto o deshabilitado no consume intentos','Capacitación no envía','503 no cancela reserva','Reintento respeta espera, clave y contenido estable','Aceptación elimina contenido temporal y evita otro envío','Cambio de destinatario descarta el intento anterior','Ventana vencida exige conciliación, sin envío automático']},null,2))
  console.log('PASA correo de reservas: fallos, reintentos, destinatarios y ventana de idempotencia.')
}finally{globalThis.fetch=original;await t.close()}
