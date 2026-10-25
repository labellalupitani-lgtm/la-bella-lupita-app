import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {randomUUID} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {Client,neonConfig} from '@neondatabase/serverless'

const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const demo=JSON.parse(readFileSync('.demo.local','utf8'))
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
assert.equal(config.name,'club-lupita');assert.equal(config.account_id,env.CLOUDFLARE_ACCOUNT_ID)
const file='.seguridad-release.local'
const state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{project:env.NEON_PROJECT_ID,created:new Date().toISOString(),backups:{}}
assert.equal(state.project,env.NEON_PROJECT_ID)
const save=()=>writeFileSync(file,JSON.stringify(state,null,2))
async function api(path,body,method=body?'POST':'GET'){
  const r=await fetch('https://console.neon.tech/api/v2/projects/'+env.NEON_PROJECT_ID+path,{method,headers:{Authorization:'Bearer '+env.NEON_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
  if(!r.ok){const detail=await r.json().catch(()=>({}));throw Error('Neon HTTP '+r.status+': '+(detail.message??detail.code??'solicitud rechazada'))}
  return r.status===204?null:r.json()
}
neonConfig.webSocketConstructor=globalThis.WebSocket
async function migrate(url,label){
  const c=new Client(url);await c.connect()
  try{
    await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ')
    await c.query("SET LOCAL lock_timeout='10s'");await c.query("SET LOCAL statement_timeout='60s'")
    await c.query('LOCK TABLE empleado IN SHARE ROW EXCLUSIVE MODE')
    const snapshot=async()=>({
      empleados:(await c.query(`SELECT id,nombre,usuario,permiso,activo,clave_huella FROM empleado ORDER BY id`)).rows,
      saldos:(await c.query('SELECT s.id,d.* FROM socio s CROSS JOIN LATERAL saldo_de(s.id) d ORDER BY s.id')).rows,
      libro:(await c.query('SELECT count(*)::text AS n,coalesce(sum(monto),0)::text AS total FROM asiento')).rows,
    })
    const before=await snapshot()
    await c.query(readFileSync('db/017_seguridad_personal.sql','utf8').replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,''))
    assert.deepEqual(await snapshot(),before,'La migración debe preservar accesos, credenciales, saldos y libro mayor')
    const owner=(await c.query('SELECT clave_huella,version_clave FROM seguridad_propietario WHERE id=true')).rows[0]
    assert.ok(owner);assert.equal(owner.clave_huella,null);assert.equal(owner.version_clave,0)
    const hash=(await c.query("SELECT crypt('comprobacion-sintetica',gen_salt('bf',12)) AS h")).rows[0].h
    assert.equal((await c.query("SELECT crypt('comprobacion-sintetica',$1)=$1 AS ok",[hash])).rows[0].ok,true)
    await c.query('COMMIT')
    console.log(label+': migración 017 correcta; credenciales, usuarios y saldos conservados; bcrypt disponible')
  }catch(e){await c.query('ROLLBACK').catch(()=>{});throw Error(label+': '+(e.code??e.message))}finally{await c.end()}
}
const endpoints=(await api('/endpoints')).endpoints
const match=url=>endpoints.find(e=>e.host===new URL(url).hostname.replace('-pooler',''))
const real=match(env.DATABASE_URL),muestra=match(demo.DATABASE_URL)
assert.ok(real&&muestra);assert.notEqual(real.branch_id,muestra.branch_id);assert.equal(muestra.branch_id,demo.branch)
const cf=await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.account_id+'/workers/scripts/'+config.name+'/deployments',{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}})
const deployed=await cf.json();assert.ok(deployed.success)
state.previousVersions??=deployed.result.deployments[0].versions;save()

if(process.argv.includes('--liberar-cupo')){
  assert.ok(!state.realMigrated&&!state.demoMigrated&&!state.stage&&state.backups.demo)
  const b=state.backups.demo
  assert.equal(b.parent,muestra.branch_id);assert.notEqual(b.id,muestra.branch_id);assert.notEqual(b.id,real.branch_id)
  const detail=await api('/branches/'+b.id);assert.ok(detail.branch.name.startsWith('respaldo-seguridad-demo-'))
  await api('/branches/'+b.id,undefined,'DELETE');delete state.backups.demo;save()
  console.log('Cupo recuperado: se recreará el respaldo demo después de terminar el ensayo')
}
if(process.argv.includes('--preparar')){
  for(const [label,ep] of [['real',real]]){
    if(!state.backups[label]){const b=await api('/branches',{branch:{name:'respaldo-seguridad-'+label+'-'+Date.now(),parent_id:ep.branch_id}});state.backups[label]={id:b.branch.id,parent:ep.branch_id};save()}
    console.log('Respaldo '+label+': '+state.backups[label].id)
  }
  if(!state.stage){const b=await api('/branches',{branch:{name:'ensayo-seguridad-'+Date.now(),parent_id:state.backups.real.id},endpoints:[{type:'read_write'}]});const url=new URL(env.DATABASE_URL);url.hostname=b.endpoints[0].host;state.stage={id:b.branch.id,parent:state.backups.real.id,url:url.toString()};save()}
  await migrate(state.stage.url,'Ensayo sobre copia real')
  await migrate(state.stage.url,'Repetición idempotente del ensayo')
  state.ensayoMigracion=true;save()
}
if(process.argv.includes('--ensayar')){
  assert.ok(state.ensayoMigracion&&!state.stageDeleted);assert.notEqual(state.stage.id,real.branch_id);assert.notEqual(state.stage.id,muestra.branch_id)
  assert.equal(state.stage.parent,state.backups.real.id)
  await build({entryPoints:['src/worker/index.ts'],bundle:true,platform:'node',format:'esm',outfile:'.test-output/worker-neon.mjs'})
  const {app}=await import(pathToFileURL(resolve('.test-output/worker-neon.mjs')))
  const fixture={DATABASE_URL:state.stage.url,SESION_SECRETO:randomUUID(),CASA_SECRETO:randomUUID(),ACCESO_PERSONAL:'false',ACCESO_CORREO:'true'}
  const ctx={waitUntil(p){void p.catch(()=>{})},passThroughOnException(){}}
  const call=async(path,body,token)=>{const r=await app.request('https://ensayo.local/api'+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})},fixture,ctx);return {status:r.status,body:await r.json()}}
  const login=await call('/auth/casa',{clave:fixture.CASA_SECRETO});assert.equal(login.status,200)
  const token=login.body.token,usuario='ensayo.'+randomUUID().slice(0,8)
  const empleado=await call('/personal/equipo',{nombre:'Ensayo aislado seguridad',usuario,permiso:'cocina'},token);assert.equal(empleado.status,200)
  const first=await call('/auth/personal',{usuario,clave:empleado.body.clave});assert.equal(first.status,200)
  const reset=await call('/personal/equipo/'+empleado.body.id+'/restablecer-clave',{actual:fixture.CASA_SECRETO,version:0},token);assert.equal(reset.status,200)
  assert.equal((await call('/personal/yo',undefined,first.body.token)).status,401)
  const temporal=await call('/auth/personal',{usuario,clave:reset.body.clave});assert.equal(temporal.status,200)
  assert.equal((await call('/personal/yo',undefined,temporal.body.token)).body.requiereCambio,true)
  assert.equal((await call('/operacion/listas/pedidos',undefined,temporal.body.token)).status,403)
  const nueva='Frase sintética de prueba 🍮 '+randomUUID()
  const changes=await Promise.all([call('/personal/clave',{actual:reset.body.clave,nueva,confirmacion:nueva},temporal.body.token),call('/personal/clave',{actual:reset.body.clave,nueva,confirmacion:nueva},temporal.body.token)])
  assert.deepEqual(changes.map(r=>r.status).sort(),[200,401])
  assert.equal((await call('/personal/yo',undefined,temporal.body.token)).status,401)
  assert.equal((await call('/auth/personal',{usuario,clave:nueva})).status,200)
  const ownerKey='Nueva clave sintética 🍮 '+randomUUID()
  assert.equal((await call('/personal/clave',{actual:fixture.CASA_SECRETO,nueva:ownerKey,confirmacion:ownerKey},token)).status,200)
  assert.equal((await call('/personal/yo',undefined,token)).status,401)
  assert.equal((await call('/auth/casa',{clave:fixture.CASA_SECRETO})).status,403)
  assert.equal((await call('/auth/casa',{clave:ownerKey})).status,200)
  state.ensayoAPI=true;save()
  console.log('PASA Neon aislado: bcrypt, autenticación, restablecimiento, cambio obligatorio, concurrencia y revocación de propietario y empleado')
}
if(process.argv.includes('--migrar')){
  assert.ok(state.ensayoMigracion&&state.ensayoAPI&&state.backups.real)
  assert.equal(state.backups.real.parent,real.branch_id)
  assert.deepEqual(deployed.result.deployments[0].versions,state.previousVersions,'El Worker cambió desde el respaldo; revisar antes de publicar')
  if(!state.stageDeleted){
    assert.notEqual(state.stage.id,real.branch_id);assert.notEqual(state.stage.id,muestra.branch_id);assert.equal(state.stage.parent,state.backups.real.id)
    await api('/branches/'+state.stage.id,undefined,'DELETE');state.stageDeleted=true;save()
    console.log('Ensayo finalizado: rama temporal eliminada')
  }
  if(!state.backups.demo){const b=await api('/branches',{branch:{name:'respaldo-seguridad-demo-'+Date.now(),parent_id:muestra.branch_id}});state.backups.demo={id:b.branch.id,parent:muestra.branch_id};save()}
  assert.equal(state.backups.demo.parent,muestra.branch_id)
  await migrate(demo.DATABASE_URL,'Demo');state.demoMigrated=true;save()
  await migrate(env.DATABASE_URL,'Producción');state.realMigrated=true;state.migratedAt=new Date().toISOString();save()
}
if(process.argv.includes('--cerrar-ensayo')&&!state.stageDeleted){
  assert.ok(state.realMigrated&&state.demoMigrated&&state.ensayoAPI)
  assert.notEqual(state.stage.id,real.branch_id);assert.notEqual(state.stage.id,muestra.branch_id)
  assert.equal(state.stage.parent,state.backups.real.id)
  await api('/branches/'+state.stage.id,undefined,'DELETE');state.stageDeleted=true;save();console.log('Rama de ensayo eliminada; respaldos real y demo conservados')
}
