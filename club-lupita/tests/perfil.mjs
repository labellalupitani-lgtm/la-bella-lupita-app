import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {preparar} from './soporte-perfiles-equipo.mjs'
const t=await preparar(),resultados=[]
const dir='entregables/mejoras-perfil-2026-10-09/evidencias'
mkdirSync(dir,{recursive:true})
const edit=p=>Object.fromEntries(['nombre','bebida_siempre','alergias','cumple','promociones_correo','version'].map(k=>[k,p[k]]))
async function leer(){const r=await t.request('/api/perfil');assert.equal(r.status,200,JSON.stringify(r.body));return r.body.perfil}
async function caso(nombre,fn){await fn();resultados.push({nombre,correcto:true});console.log('PASA '+nombre)}
async function raw(path,{cookie,csrf,body,token}={}){const r=await t.worker.app.request(t.origen+path,{method:body?'POST':'GET',headers:{'x-cliente-solicitud':'1',origin:t.origen,'content-type':'application/json',...(cookie?{cookie}:{}),...(csrf?{'x-cliente-csrf':csrf}:{}),...(token?{authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})},t.env,t.ctx);return{status:r.status,body:await r.json(),headers:r.headers}}
async function abrir(n){const token=await t.firmar(t.env.SESION_SECRETO,{tel:t.tel,rol:'socio',exp:Date.now()+3600000+n});const r=await raw('/api/auth/sesion/migrar',{body:{},token});assert.equal(r.status,200);const c=r.headers.getSetCookie().map(v=>v.split(';')[0]);return{cookie:c.join('; '),csrf:c.find(v=>v.startsWith('__Host-lupita-cliente-csrf=')).split('=')[1]}}
try{
 await caso('migración repetible conserva datos y versiones',async()=>{const antes=await leer();await t.db.exec(readFileSync('db/026_perfil.sql','utf8'));assert.deepEqual(await leer(),antes)})
 await caso('solo el titular lee y edita su perfil',async()=>{assert.equal((await t.request('/api/perfil',undefined,null)).status,401);assert.equal((await t.request('/api/perfil',undefined,t.staff)).status,403);assert.equal((await t.request('/api/perfil',undefined,t.otroToken)).body.perfil.id,t.otro)})
 await caso('dos borradores no pierden nombre ni alergias; respuesta canónica y auditoría mínima',async()=>{
  const p=await leer();const a=await t.request('/api/perfil',{...edit(p),nombre:'  Nombre confirmado  ',alergias:'Maní'});assert.equal(a.status,200);assert.equal(a.body.perfil.nombre,'Nombre confirmado');assert.equal(a.body.perfil.version,p.version+1)
  const b=await t.request('/api/perfil',{...edit(p),bebida_siempre:'Chocolate'});assert.equal(b.status,409);const actual=await leer();assert.equal(actual.nombre,'Nombre confirmado');assert.equal(actual.alergias,'Maní')
  const log=(await t.db.query("SELECT detalle FROM auditoria WHERE accion='editar_perfil'")).rows;assert.deepEqual(log.at(-1).detalle.campos,['nombre','alergias']);assert.ok(!JSON.stringify(log).includes('Maní'));assert.equal(log.length,1)
  const sinCambio=await t.request('/api/perfil',edit(actual));assert.equal(sinCambio.body.perfil.version,actual.version);assert.equal((await t.db.query("SELECT count(*)::int AS n FROM auditoria WHERE accion='editar_perfil'")).rows[0].n,1)
 })
 await caso('edición ajena y respuesta perdida se concilian sin reenvío antiguo',async()=>{
  const p=await leer();await t.db.query('UPDATE socio SET nombre=$2 WHERE id=$1',[t.id,'Nombre del directorio']);assert.equal((await t.request('/api/perfil',{...edit(p),alergias:'Otra'})).status,409)
  const b=await leer(),payload={...edit(b),bebida_siempre:'Chocolate'};assert.equal((await t.request('/api/perfil',payload)).status,200);assert.equal((await t.request('/api/perfil',payload)).status,409);assert.equal((await leer()).bebida_siempre,'Chocolate')
 })
 await caso('contrato estricto, Unicode por puntos de código y cumpleaños sin año nuevo',async()=>{
  const p=await leer();assert.equal((await t.request('/api/perfil',{nombre:'Viejo',bebida_siempre:'',alergias:'',cumple:''})).status,428)
  for(const cambio of [{nombre:'A\u0085B'},{nombre:'A\u202eB'},{nombre:'\ud800A'},{nombre:'𠮷'.repeat(81)},{cumple:'02-30'},{cumple:'2000-02-29'},{promociones_correo:'sí'},{telefono:'otro'},{version:1.1}])assert.equal((await t.request('/api/perfil',{...edit(p),...cambio})).status,422,JSON.stringify(cambio))
  const r=await t.request('/api/perfil',{...edit(p),nombre:'𠮷'.repeat(80),cumple:'02-29',promociones_correo:true});assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.perfil.cumple,'02-29')
  const fila=(await t.db.query('SELECT cumple,cumple_mes_dia,promociones_correo,promociones_aceptadas FROM socio WHERE id=$1',[t.id])).rows[0];assert.equal(fila.cumple,null);assert.equal(fila.cumple_mes_dia,'02-29');assert.equal(fila.promociones_correo,true);assert.ok(fila.promociones_aceptadas)
  const baja=await t.request('/api/perfil',{...edit(r.body.perfil),promociones_correo:false,cumple:'',alergias:''});assert.equal(baja.status,200);assert.equal(baja.body.perfil.promociones_correo,false);assert.equal(baja.body.perfil.cumple,'')
 })
 await caso('lectura de perfil requiere menos consultas que la cuenta comercial',async()=>{globalThis.__testHttpCalls=0;await leer();const perfil=globalThis.__testHttpCalls;globalThis.__testHttpCalls=0;await t.request('/api/yo');const cuenta=globalThis.__testHttpCalls;assert.ok(perfil<cuenta);resultados.push({consultasConAutenticacion:{perfil,cuenta}});delete globalThis.__testHttpCalls})
 const caja=await t.crearEmpleado({permiso:'caja'}),cocina=await t.crearEmpleado({permiso:'cocina'})
 await caso('solicitud de privacidad solo llega a administración; seguimiento y resolución reales',async()=>{
  const data={mensaje:'Solicito una copia de mis datos.',categoria:'datos',referencia:crypto.randomUUID()};const r=await t.request('/api/atencion',data);assert.equal(r.status,200);assert.equal((await t.request('/api/atencion',data)).body.id,r.body.id);assert.equal((await t.request('/api/atencion',{...data,categoria:'baja'})).status,409)
  for(const ruta of ['/api/operacion/atencion','/api/operacion/listas/atencion']){const a=await t.request(ruta,undefined,caja.auth);assert.equal(a.status,200);assert.equal((a.body.solicitudes??a.body.filas).some(s=>s.id===r.body.id),false);assert.equal((await t.request(ruta,undefined,cocina.auth)).status,403)}
  assert.equal((await t.request('/api/operacion/atencion/'+r.body.id+'/responder',{respuesta:'Respuesta de caja'},caja.auth)).status,409)
  const admin=await t.request('/api/operacion/listas/atencion',undefined,t.staff);assert.ok(admin.body.filas.some(s=>s.id===r.body.id&&s.categoria==='datos'))
  assert.equal((await t.request('/api/operacion/atencion/'+r.body.id+'/responder',{respuesta:'Coordinaremos contigo la entrega segura de tus datos.'},t.staff)).status,200)
  assert.equal((await t.request('/api/atencion')).body.solicitudes.find(s=>s.id===r.body.id).estado,'resuelta');assert.equal((await t.request('/api/atencion',undefined,t.otroToken)).body.solicitudes.length,0)
 })
 await caso('cocina recibe solo la instantánea del pedido y debe reconocerla antes de preparar',async()=>{
  const {rows:[p]}=await t.db.query("INSERT INTO pedido(socio_id,referencia,lineas,total,estado,restriccion_confirmada) VALUES($1,'alergia-perfil','[]',10000,'aceptado','Maní confirmado con equipo') RETURNING id",[t.id]);await t.db.query("UPDATE socio SET alergias='Perfil modificado después' WHERE id=$1",[t.id])
  for(const ruta of ['/api/operacion/pedidos','/api/operacion/listas/pedidos']){const r=await t.request(ruta,undefined,cocina.auth);const pedido=(r.body.pedidos??r.body.filas).find(x=>x.id===p.id);assert.equal(pedido.restriccion_confirmada,'Maní confirmado con equipo');assert.equal(pedido.alergias,undefined);assert.equal(pedido.telefono,undefined)}
  assert.equal((await t.request('/api/operacion/pedidos/'+p.id+'/estado',{estado:'preparando'},cocina.auth)).status,422)
  assert.equal((await t.request('/api/operacion/pedidos/'+p.id+'/estado',{estado:'preparando',restriccionReconocida:true},cocina.auth)).status,200)
  const a=(await t.db.query("SELECT detalle FROM auditoria WHERE accion='pedido_estado'")).rows.at(-1);assert.equal(a.detalle.restriccion_reconocida,true);assert.ok(!JSON.stringify(a).includes('Maní'))
 })
 await caso('cierre actual preserva otro dispositivo; cerrar todas revoca cookies y bearer anteriores',async()=>{
  const a=await abrir(1),b=await abrir(2);assert.equal((await raw('/api/sesion/salir',{...a,body:{}})).status,200);assert.equal((await raw('/api/perfil',a)).status,401);assert.equal((await raw('/api/perfil',b)).status,200)
  const c=await abrir(3);assert.equal((await raw('/api/sesion/salir-todas',{...b,csrf:'incorrecto',body:{}})).status,403);assert.equal((await raw('/api/sesion/salir-todas',{...b,body:{}})).status,200)
  assert.equal((await raw('/api/perfil',b)).status,401);assert.equal((await raw('/api/perfil',c)).status,401);assert.equal((await t.request('/api/perfil')).status,401);assert.equal((await t.request('/api/perfil',undefined,t.otroToken)).status,200)
  const d=await abrir(4);assert.equal((await raw('/api/perfil',d)).status,200);assert.equal((await t.request('/api/personal/yo',undefined,t.staff)).status,200)
 })
 writeFileSync(dir+'/backend.json',JSON.stringify({fecha:new Date().toISOString(),resultados},null,2))
}finally{await t.db.close()}
