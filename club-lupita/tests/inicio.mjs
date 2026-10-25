import assert from 'node:assert/strict'
import {preparar} from './soporte.mjs'
const t=await preparar(),{db,request,id,tel,staff}=t
let n=0
async function caso(nombre,fn){await fn();n++;console.log('PASA '+nombre)}
try{
 await caso('catálogo y cupos excluyen fechas pasadas y muestran capacidad real',async()=>{
  await db.exec("UPDATE experiencia SET cuando=now()-interval '1 day'")
  assert.equal((await request('/api/cupos')).body.mesaTostador,0)
  assert.equal((await request('/api/catalogo')).body.experiencias.length,0)
  await db.exec("UPDATE experiencia SET cuando=now()+interval '1 day',cupos=20")
  const cat=(await request('/api/catalogo')).body,cu=(await request('/api/cupos')).body
  assert.equal(cat.experiencias[0].cupos,20);assert.equal(cu.mesaTostador,20)
  await db.exec('DELETE FROM reserva_cosecha WHERE numero>125')
  assert.equal((await request('/api/catalogo')).body.bolsa.total,125)
 })
 await caso('contexto privado priorizable, sin limitarse a compras recientes',async()=>{
  assert.equal((await request('/api/inicio/contexto',undefined,null)).status,401)
  assert.deepEqual((await request('/api/inicio/contexto')).body.pedido,null)
  await db.query("INSERT INTO pedido(socio_id,referencia,lineas,total,estado,creado) VALUES($1,'inicio-antiguo','[]',10000,'listo',now()-interval '30 days')",[id])
  await db.query("INSERT INTO pedido(socio_id,referencia,lineas,total,estado) SELECT $1,'inicio-finalizado-'||n,'[]',10000,'entregado' FROM generate_series(1,30) n",[id])
  const actual=(await request('/api/inicio/contexto')).body
  assert.equal(actual.pedido.estado,'listo')
  assert.equal((await request('/api/inicio/contexto',undefined,t.otroToken)).body.pedido,null)
 })
 await caso('premio conserva derecho, código idempotente y hora de referencia',async()=>{
  await request('/api/tanda/sellar',{telefono:tel,ticket:'inicio-noveno'},staff)
  const a=(await request('/api/tanda/canjear',{})).body,b=(await request('/api/tanda/canjear',{})).body
  assert.equal(a.codigo,b.codigo);assert.ok(Number.isFinite(Date.parse(a.ahora)));assert.ok(a.vence>0&&a.vence<=90)
  await db.exec("UPDATE vale SET emitido=now()-interval '2 minutes',vence=now()-interval '1 second'")
  const yo=(await request('/api/yo')).body;assert.equal(yo.vale,null);assert.equal(yo.premiosPendientes,1)
  assert.ok((await request('/api/tanda/canjear',{})).body.codigo!==a.codigo)
 })
 await caso('métricas sólo aceptan campos y eventos permitidos y administración puede leerlas',async()=>{
  assert.equal((await request('/api/inicio/evento',{evento:'vista',dispositivo:'movil',duracion:0,telefono:tel})).status,422)
  assert.equal((await request('/api/inicio/evento',{evento:'codigo:SECRETO',duracion:0})).status,422)
  assert.equal((await request('/api/inicio/evento',{evento:'vista',dispositivo:'movil',duracion:0})).status,200)
  assert.equal((await request('/api/operacion/metricas-inicio')).status,403)
  const a=await request('/api/operacion/metricas-inicio?dias=30',undefined,staff)
  assert.equal(a.status,200);assert.equal(a.body.eventos[0].cantidad,1)
  assert.deepEqual(Object.keys(a.body.eventos[0]).sort(),['cantidad','duracion_ms','evento'])
 })
 await caso('migración a cookie, revocación del bearer, CSRF y cierre revocable',async()=>{
  const origin='https://localhost'
  async function raw(path,{cookie,csrf,body,authorization,origen=origin}={}){
   const r=await t.worker.app.request(origin+path,{method:body?'POST':'GET',headers:{'x-cliente-solicitud':'1',origin:origen,'content-type':'application/json',...(cookie?{cookie}:{}),...(csrf?{'x-cliente-csrf':csrf}:{}),...(authorization?{authorization:'Bearer '+authorization}:{})},...(body?{body:JSON.stringify(body)}:{})},t.env,t.ctx)
   return {status:r.status,body:await r.json(),headers:r.headers}
  }
  assert.equal((await raw('/api/auth/sesion/migrar',{body:{},authorization:t.token,origen:'https://ajeno.example'})).status,403)
  const m=await raw('/api/auth/sesion/migrar',{body:{},authorization:t.token})
  assert.equal(m.status,200);assert.equal(m.body.token,undefined)
  const cookies=m.headers.getSetCookie();const auth=cookies.find(c=>c.startsWith('__Host-lupita-cliente='))
  assert.match(auth,/HttpOnly/i);assert.match(auth,/Secure/i);assert.match(auth,/SameSite=Strict/i);assert.match(auth,/Path=\//)
  const cookie=cookies.map(c=>c.split(';')[0]).join('; '),csrf=cookies.find(c=>c.startsWith('__Host-lupita-cliente-csrf=')).split(';')[0].split('=')[1]
  assert.equal((await raw('/api/yo',{cookie})).body.socio.id,id)
  assert.equal((await request('/api/yo')).status,401)
  assert.equal((await raw('/api/tanda/canjear',{body:{},cookie})).status,403)
  assert.equal((await raw('/api/tanda/canjear',{body:{},cookie,csrf,origen:'https://ajeno.example'})).status,403)
  assert.equal((await raw('/api/tanda/canjear',{body:{},cookie,csrf})).status,200)
  assert.equal((await raw('/api/sesion/salir',{body:{},cookie,csrf})).status,200)
  assert.equal((await raw('/api/yo',{cookie})).status,401)
  const codigo=await raw('/api/auth/codigo',{body:{telefono:tel}})
  const nuevo=await raw('/api/auth/entrar',{body:{telefono:tel,codigo:codigo.body.codigoDemo}})
  assert.equal(nuevo.status,200);assert.equal(nuevo.body.autenticado,true);assert.equal(nuevo.body.token,undefined)
  const cookieNueva=nuevo.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')
  assert.equal((await raw('/api/yo',{cookie:cookieNueva+'; '+staff.cookie})).body.socio.id,id)
  const equipo=await t.worker.app.request(origin+'/api/personal/yo',{headers:{cookie:cookieNueva+'; '+staff.cookie,'x-equipo-solicitud':'1',origin}},t.env,t.ctx)
  assert.equal(equipo.status,200)
  await db.exec("UPDATE sesion_cliente SET vence=now()-interval '1 second'")
  assert.equal((await raw('/api/yo',{cookie:cookieNueva})).status,401)
 })
 console.log(`${n} grupos de Inicio correctos.`)
}finally{await db.close()}
