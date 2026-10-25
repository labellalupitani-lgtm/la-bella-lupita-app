// Rama temporal exclusivamente de estas correcciones. Nunca elimina ramas ajenas.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { randomUUID } from 'node:crypto'
const env=Object.assign({},...['.env.deploy','.dev.vars','.infra.local'].map(f=>parseEnv(readFileSync(f,'utf8'))))
const file='.perfiles-ensayo.local', prefix='ensayo-perfiles-'
const api=async(path,body,method=body?'POST':'GET')=>{
 const r=await fetch('https://console.neon.tech/api/v2/projects/'+env.NEON_PROJECT_ID+path,{method,headers:{Authorization:'Bearer '+env.NEON_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
 if(!r.ok)throw Error('Neon HTTP '+r.status+' en operación de ensayo')
 return r.status===204?null:r.json()
}
const endpoints=(await api('/endpoints')).endpoints
const real=endpoints.find(e=>e.host===new URL(env.DATABASE_URL).hostname.replace('-pooler',''))
const demo=JSON.parse(readFileSync('.demo.local','utf8'))
assert.ok(real);assert.notEqual(real.branch_id,demo.branch)
let state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):null
if(process.argv.includes('--preparar')){
 if(!state||state.eliminada){
  const name=prefix+randomUUID(),b=await api('/branches',{branch:{name,parent_id:real.branch_id},endpoints:[{type:'read_write'}]})
  assert.ok(b.branch.id&&b.endpoints[0]?.host)
  const url=new URL(env.DATABASE_URL);url.hostname=b.endpoints[0].host
  state={project:env.NEON_PROJECT_ID,branch:b.branch.id,parent:real.branch_id,name,DATABASE_URL:url.toString(),creada:new Date().toISOString(),eliminada:false}
  writeFileSync(file,JSON.stringify(state,null,2))
 }
}
assert.ok(state&&!state.eliminada,'Preparar una rama antes de verificar o limpiar')
assert.equal(state.project,env.NEON_PROJECT_ID);assert.equal(state.parent,real.branch_id)
assert.notEqual(state.branch,real.branch_id);assert.notEqual(state.branch,demo.branch)
const detail=(await api('/branches/'+state.branch)).branch
assert.equal(detail.name,state.name);assert.ok(detail.name.startsWith(prefix));assert.equal(detail.parent_id,state.parent)
if(process.argv.includes('--limpiar')){
 await api('/branches/'+state.branch,undefined,'DELETE')
 state.eliminada=true;state.eliminadaEn=new Date().toISOString();delete state.DATABASE_URL
 writeFileSync(file,JSON.stringify(state,null,2))
}
const safe={project:state.project,branch:state.branch,parent:state.parent,name:state.name,creada:state.creada,eliminada:state.eliminada,verificada:new Date().toISOString()}
writeFileSync('entregables/correcciones-perfiles-2026-10-07/evidencia/ensayo-infra.json',JSON.stringify(safe,null,2))
console.log(JSON.stringify(safe,null,2))
