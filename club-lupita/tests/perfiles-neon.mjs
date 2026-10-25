// Concurrencia real sobre la rama temporal verificada; nunca usa el endpoint real.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { randomUUID } from 'node:crypto'
import { resolve, join } from 'node:path'
import { build } from 'esbuild'
import { Client,neonConfig } from '@neondatabase/serverless'
const state=JSON.parse(readFileSync('.perfiles-ensayo.local','utf8'))
const remote=Object.assign({},...['.env.deploy','.dev.vars','.infra.local'].map(f=>parseEnv(readFileSync(f,'utf8'))))
const demo=JSON.parse(readFileSync('.demo.local','utf8'))
assert.ok(!state.eliminada&&state.name.startsWith('ensayo-perfiles-'))
assert.notEqual(state.branch,state.parent);assert.notEqual(state.branch,demo.branch)
assert.notEqual(new URL(state.DATABASE_URL).hostname.replace('-pooler',''),new URL(remote.DATABASE_URL).hostname.replace('-pooler',''))
const r=await fetch('https://console.neon.tech/api/v2/projects/'+state.project+'/branches/'+state.branch,{headers:{Authorization:'Bearer '+remote.NEON_API_KEY}})
assert.equal(r.status,200);const {branch}=await r.json()
assert.equal(branch.name,state.name);assert.equal(branch.parent_id,state.parent)
neonConfig.webSocketConstructor=globalThis.WebSocket
const db=new Client(state.DATABASE_URL);await db.connect()
const resultados=[], pendientes=[],contencion=[]
const source=resolve(process.env.TEST_SOURCE_DIR||'.')
const evidence=process.env.TEST_EVIDENCE_PREFIX||''
const ctx={waitUntil(p){pendientes.push(p)},passThroughOnException(){}}
const prueba=async(nombre,fn)=>{try{await fn();resultados.push({nombre,estado:'PASA'});console.log('PASA '+nombre)}catch(e){resultados.push({nombre,estado:'FALLA',error:e.message});throw e}}
try{
 await build({entryPoints:[join(source,'src/worker/index.ts')],bundle:true,platform:'node',format:'esm',external:['qrcode'],outfile:'.test-output/worker-perfiles-neon.mjs'})
 await build({entryPoints:[join(source,'src/worker/sesion.ts')],bundle:true,platform:'node',format:'esm',outfile:'.test-output/sesion-perfiles-neon.mjs'})
 const {app}=await import('../.test-output/worker-perfiles-neon.mjs'),{firmar}=await import('../.test-output/sesion-perfiles-neon.mjs')
 const env={DATABASE_URL:state.DATABASE_URL,SESION_SECRETO:randomUUID(),CASA_SECRETO:randomUUID(),PERSONAL_CREDENCIAL_SECRETO:randomUUID(),PERSONAL_MFA_SECRETO:randomUUID()}
 const clientes=[]
 for(let i=0;i<4;i++){
  const telefono='5058'+String(Math.floor(Math.random()*10000000)).padStart(7,'0')
  const {rows:[s]}=await db.query("INSERT INTO socio(telefono,nombre) VALUES($1,'Ensayo de perfiles') RETURNING id",[telefono])
  const saldo=i===1?19000:1000000
  await db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'recarga','Saldo sintético de ensayo')",[s.id,saldo])
  clientes.push({...s,saldo,telefono,token:await firmar(env.SESION_SECRETO,{tel:telefono,rol:'socio',exp:Date.now()+3600000})})
 }
 const call=async(path,body,cliente=clientes[0])=>{
  const response=await app.request('https://ensayo.local/api'+path,{method:body===undefined?'GET':'POST',headers:{authorization:'Bearer '+cliente.token,'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})},{...env},ctx)
  return {status:response.status,body:await response.json()}
 }
 const resolver=async (respuestas,cuerpos,cliente)=>{
  contencion.push(respuestas.map(r=>r.status))
  assert.ok(respuestas.every(r=>[200,409,503].includes(r.status)),JSON.stringify(respuestas.map(r=>r.status)))
  for(let i=0;i<respuestas.length;i++) if(respuestas[i].status===503){
   assert.match(respuestas[i].body.error,/Reintentá el mismo pedido/)
   // Cada transacción agotada ya terminó: reenviar LA MISMA referencia.
   respuestas[i]=await call('/cuenta/cobrar',cuerpos[i],cliente)
   assert.ok([200,409].includes(respuestas[i].status),'El reintento secuencial debe resolverse')
  }
  return respuestas
 }
 await prueba('O06 ocho cobros simultáneos con misma referencia producen un pedido y un cargo',async()=>{
  const ref=randomUUID(),body={lineas:[{id:'latte',cuanto:1}],ref}
  const rs=await resolver(await Promise.all(Array.from({length:8},()=>call('/cuenta/cobrar',body))),Array(8).fill(body),clientes[0])
  assert.ok(rs.every(x=>x.status===200),JSON.stringify(rs.map(x=>x.status)))
  assert.equal(new Set(rs.map(x=>x.body.pedido.id)).size,1)
  const {rows:[s]}=await db.query('SELECT (SELECT count(*)::int FROM pedido WHERE socio_id=$1) pedidos,(SELECT count(*)::int FROM asiento WHERE socio_id=$1 AND monto<0) cargos,(SELECT total FROM saldo_de($1)) saldo',[clientes[0].id])
  assert.deepEqual(s,{pedidos:1,cargos:1,saldo:clientes[0].saldo-9500})
 })
 await prueba('O06 ocho referencias distintas compiten por saldo para solo dos compras',async()=>{
  const bodies=Array.from({length:8},()=>({lineas:[{id:'latte',cuanto:1}],ref:randomUUID()}))
  const rs=await resolver(await Promise.all(bodies.map(body=>call('/cuenta/cobrar',body,clientes[1]))),bodies,clientes[1])
  assert.equal(rs.filter(x=>x.status===200).length,2)
  assert.ok(rs.filter(x=>x.status!==200).every(x=>x.status===409),JSON.stringify(rs.map(x=>x.status)))
  const {rows:[s]}=await db.query('SELECT (SELECT count(*)::int FROM pedido WHERE socio_id=$1) pedidos,(SELECT total FROM saldo_de($1)) saldo',[clientes[1].id])
  assert.deepEqual(s,{pedidos:2,saldo:0})
 })
 await prueba('O06 dos clientes compiten por un horario VIP sin solapamiento ni doble cargo',async()=>{
  const day=new Date(Date.now()+60*86400000).toISOString().slice(0,10),cuando=day+'T10:00:00-06:00'
  const antes=(await db.query("SELECT count(*)::int n FROM operativo_reserva WHERE zona='vip' AND cuando<($1::timestamptz+interval '1 hour') AND termina>$1 AND cancelada IS NULL",[cuando])).rows[0].n
  assert.equal(antes,0,'El horario de ensayo debe estar libre')
  const rs=await Promise.all(clientes.slice(2).map(c=>call('/reserva',{zona:'vip',cuando,horas:1,personas:2,ref:randomUUID()},c)))
  assert.deepEqual(rs.map(x=>x.status).sort(),[200,409])
  const {rows:[s]}=await db.query('SELECT count(*)::int n FROM reserva WHERE socio_id=ANY($1::uuid[])',[clientes.slice(2).map(c=>c.id)])
  assert.equal(s.n,1)
 })
 await prueba('B02/B03 entradas límite en PostgreSQL remoto responden 4xx sin errores SQL',async()=>{
  assert.equal((await call('/ocupacion?dia=2026-02-31')).status,422)
  assert.equal((await call('/avisos/'+('9'.repeat(40))+'/leido',{})).status,404)
 })
 await Promise.all(pendientes)
}finally{
 await db.end()
 writeFileSync('entregables/correcciones-perfiles-2026-10-07/evidencia/'+evidence+'concurrencia-neon.json',JSON.stringify({fecha:new Date().toISOString(),fuentes:source,rama:state.branch,produccionModificada:false,criterio:'Concurrencia sin cargos duplicados ni saldo negativo; contención limitada a 8s responde 503 y se reintenta con la misma referencia',contencion,resultados},null,2))
}
