import assert from 'node:assert/strict'
import { preparar } from './soporte.mjs'
const t=await preparar(), originalFetch=globalThis.fetch
let enviados=0, falla=false
Object.assign(t.env,{ACCESO_CORREO:'true',EMAIL_FROM:'acceso@labellalupita.com',RESEND_API_KEY:'prueba-local'})
globalThis.fetch=async(url,opciones)=>{
 assert.equal(url,'https://api.resend.com/emails')
 assert.equal(opciones.headers.Authorization,'Bearer prueba-local')
 assert.match(opciones.headers['Idempotency-Key'],/^club-lupita-acceso-/)
 const mensaje=JSON.parse(opciones.body)
 assert.equal(mensaje.from,'La Bella Lupita <acceso@labellalupita.com>')
 assert.match(mensaje.text,/\d{6}/)
 assert.equal(mensaje.telefono,undefined)
 enviados++
 return Response.json(falla?{message:'fallo simulado'}:{id:'envio-local'},{status:falla?429:200})
}
const pedir=correo=>t.request('/api/auth/correo/codigo',{correo},'')
const sembrar=async(n,edad)=>t.db.query("INSERT INTO codigo_correo(id,correo,huella,creado) SELECT gen_random_uuid(),'reserva-'||n||'@example.com','sintetica',now()-$2::interval FROM generate_series(1,$1::int) n",[n,edad])
try{
 await sembrar(99,'0 seconds')
 let r=await pedir('ultimo@example.com')
 assert.equal(r.status,200);assert.equal(enviados,1)
 assert.equal(r.body.codigo,undefined)
 assert.equal(JSON.stringify(r.body).includes('prueba-local'),false)
 assert.equal((await pedir('exceso@example.com')).status,429);assert.equal(enviados,1)
 await t.db.query("UPDATE codigo_correo SET creado=now()-interval '1 day'")
 assert.equal((await pedir('nuevo-dia@example.com')).status,200);assert.equal(enviados,2)
 await sembrar(2899,'2 days')
 assert.equal((await pedir('exceso-mes@example.com')).status,429);assert.equal(enviados,2)
 await t.db.query("UPDATE codigo_correo SET creado=now()-interval '32 days'")
 assert.equal((await pedir('nuevo-mes@example.com')).status,200);assert.equal(enviados,3)
 falla=true
 assert.equal((await pedir('fallo-resend@example.com')).status,503)
 assert.equal((await t.db.query("SELECT count(*)::int AS n FROM codigo_correo WHERE correo='fallo-resend@example.com' AND usado IS NULL")).rows[0].n,0)
 console.log('OK Resend: transporte privado, reserva 100 permitida/101 bloqueada, límite 3000, reinicio diario y ventana mensual, fallo del proveedor invalida código.')
}finally{globalThis.fetch=originalFetch;await t.db.close()}
