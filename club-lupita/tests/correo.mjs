import assert from 'node:assert/strict'
import { preparar } from './soporte.mjs'
const t=await preparar();let enviado;let deliveries=0
const call=(path,body)=>t.request('/api/auth/correo/'+path,body,'')
try {
 assert.equal((await call('codigo',{correo:'cliente@example.com'})).status,503)
 t.env.ACCESO_CORREO='true';t.env.EMAIL_FROM='acceso@app.labellalupita.com'
 t.env.EMAIL={send:async mensaje=>{enviado=mensaje;deliveries++;return {messageId:'local-test'}}}
 assert.equal((await call('codigo',{correo:'malo'})).status,422)
 let r=await call('codigo',{correo:' Cliente@Example.com '});assert.equal(r.status,200)
 assert.equal(r.body.codigo,undefined);assert.equal(enviado.to,'cliente@example.com')
 const solicitud=r.body.solicitud,codigo=enviado.text.match(/es (\d{6})/)[1]
 assert.equal((await call('codigo',{correo:'cliente@example.com'})).status,429)
 assert.equal((await call('registro',{solicitud,registro:'x'.repeat(72),nombre:'Intruso',telefono:'88887777'})).status,410)
 assert.equal((await call('verificar',{correo:'otro@example.com',solicitud,codigo})).status,410)
 r=await call('verificar',{correo:'cliente@example.com',solicitud,codigo});assert.equal(r.status,200);assert.equal(r.body.requierePerfil,true)
 const registro=r.body.registro
 assert.equal((await call('verificar',{correo:'cliente@example.com',solicitud,codigo})).status,410)
 assert.equal((await call('registro',{solicitud,registro,nombre:'Cliente',telefono:'000'})).status,422)
 assert.equal((await call('registro',{solicitud,registro,nombre:'Cliente',telefono:'87442005'})).status,422)
 assert.equal((await call('registro',{solicitud,registro,nombre:'Cliente',telefono:'50500000002'})).status,409)
 assert.equal((await call('registro',{solicitud,registro,nombre:'',telefono:'88887777'})).status,422)
 r=await call('registro',{solicitud,registro,nombre:'Cliente de correo',telefono:'88887777'});assert.equal(r.status,200,JSON.stringify(r.body))
 assert.ok(r.body.token)
 assert.equal((await t.request('/api/yo',undefined,r.body.token)).body.socio.nombre,'Cliente de correo')
 assert.equal((await call('registro',{solicitud,registro,nombre:'Cliente',telefono:'88887777'})).status,410)
 const socio=(await t.db.query("SELECT correo,correo_verificado,promociones_correo,promociones_aceptadas FROM socio WHERE telefono='50588887777'")).rows[0]
 assert.equal(socio.correo,'cliente@example.com');assert.ok(socio.correo_verificado);assert.equal(socio.promociones_correo,false);assert.equal(socio.promociones_aceptadas,null)
 await t.db.query("UPDATE codigo_correo SET creado=now()-interval '2 minutes' WHERE correo='cliente@example.com'")
 r=await call('codigo',{correo:'cliente@example.com'});const login=r.body.solicitud,otp=enviado.text.match(/es (\d{6})/)[1]
 r=await call('verificar',{correo:'cliente@example.com',solicitud:login,codigo:otp,telefono:'50500000002'});assert.equal(r.status,200);assert.equal(r.body.socio.telefono,'50588887777')
 r=await call('codigo',{correo:'limite@example.com'});const limitado=r.body.solicitud,mal=enviado.text.includes('000000')?'111111':'000000'
 for(let i=0;i<5;i++)assert.equal((await call('verificar',{correo:'limite@example.com',solicitud:limitado,codigo:mal})).status,401)
 assert.equal((await call('verificar',{correo:'limite@example.com',solicitud:limitado,codigo:enviado.text.match(/es (\d{6})/)[1]})).status,429)
 r=await call('codigo',{correo:'vence@example.com'});const vencido=r.body.solicitud,codVence=enviado.text.match(/es (\d{6})/)[1]
 await t.db.query('UPDATE codigo_correo SET vence=now()-interval \'1 minute\' WHERE id=$1',[vencido])
 assert.equal((await call('verificar',{correo:'vence@example.com',solicitud:vencido,codigo:codVence})).status,410)
 r=await call('codigo',{correo:'reenvio@example.com'});const viejo=r.body.solicitud,codViejo=enviado.text.match(/es (\d{6})/)[1]
 await t.db.query("UPDATE codigo_correo SET creado=now()-interval '2 minutes' WHERE correo='reenvio@example.com'")
 assert.equal((await call('codigo',{correo:'reenvio@example.com'})).status,200)
 assert.equal((await call('verificar',{correo:'reenvio@example.com',solicitud:viejo,codigo:codViejo})).status,410)
 t.env.EMAIL={send:async()=>{throw Error('No enviado')}}
 assert.equal((await call('codigo',{correo:'fallo@example.com'})).status,503)
 assert.equal((await t.db.query("SELECT count(*)::int AS n FROM codigo_correo WHERE correo='fallo@example.com' AND usado IS NULL")).rows[0].n,0)
 assert.equal((await t.db.query("SELECT count(*)::int AS n FROM socio WHERE correo IS NOT NULL")).rows[0].n,1)
 console.log('OK Registro por correo: alta, reingreso, contacto obligatorio, cuenta existente protegida, OTP privado, expiración, cinco intentos, reenvío, uso único y fallo de entrega. Correos simulados: '+deliveries)
}finally{await t.db.close()}
