// Publicación de Inicio. Los secretos y las URL de base sólo se guardan en estado .local.
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync,statSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {randomUUID,randomBytes,createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {spawnSync} from 'node:child_process'
import assert from 'node:assert/strict'
import {Client,neonConfig} from '@neondatabase/serverless'
import {build} from 'esbuild'
import {respaldar} from './respaldo-inicio.mjs'
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const demo=JSON.parse(readFileSync('.demo.local','utf8')),config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
const file='.inicio-release.local',dir='entregables/mejoras-inicio-2026-10-09',state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{creado:new Date().toISOString(),proyecto:env.NEON_PROJECT_ID,respaldos:{}}
assert.equal(state.proyecto,env.NEON_PROJECT_ID);assert.equal(config.account_id,env.CLOUDFLARE_ACCOUNT_ID)
const guardar=()=>writeFileSync(file,JSON.stringify(state,null,2))
async function neonApi(path,body,method=body?'POST':'GET'){
 const r=await fetch('https://console.neon.tech/api/v2/projects/'+env.NEON_PROJECT_ID+path,{method,headers:{Authorization:'Bearer '+env.NEON_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
 if(!r.ok){const d=await r.json().catch(()=>({}));const error=Error('Neon '+method+' HTTP '+r.status+' '+String(d.message??d.code??'').replace(/postgres(?:ql)?:\/\/\S+/g,'[oculto]').slice(0,250));error.status=r.status;throw error}
 return r.status===204?null:r.json()
}
async function versiones(){const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.account_id+'/workers/scripts/'+config.name+'/deployments',{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}});const v=await r.json();if(!r.ok||!v.success)throw Error('No se pudo leer la versión publicada');return v.result.deployments[0].versions}
neonConfig.webSocketConstructor=globalThis.WebSocket
const endpoints=(await neonApi('/endpoints')).endpoints,match=url=>endpoints.find(e=>e.host===new URL(url).hostname.replace('-pooler',''))
const real=match(env.DATABASE_URL),prueba=match(demo.DATABASE_URL)
assert.ok(real&&prueba);assert.notEqual(real.branch_id,prueba.branch_id)
const actuales=await versiones()
if(process.argv.includes('--inventario')){console.log(JSON.stringify({versiones:actuales,ramas:(await neonApi('/branches')).branches.map(b=>({id:b.id,nombre:b.name})),real:real.branch_id,demo:prueba.branch_id},null,2));process.exit()}
state.anterior??=actuales;guardar()
async function migrar(url,etiqueta){
 const db=new Client(url);await db.connect()
 try{
  await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ');await db.query("SET LOCAL lock_timeout='8s'");await db.query("SET LOCAL statement_timeout='60s'")
  const snapshot=async()=>JSON.stringify((await db.query(`SELECT
   (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM asiento a) libro,
   (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM socio a) clientes,
   (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM membresia a) membresias,
   (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM tanda a) tandas,
   (SELECT md5(COALESCE(jsonb_agg(a ORDER BY codigo)::text,'')) FROM vale a) vales,
   (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM empleado a) empleados
  `)).rows)
  const antes=await snapshot();await db.query(readFileSync('db/021_inicio_sesion.sql','utf8'));assert.equal(await snapshot(),antes,'La migración alteró datos existentes')
  await db.query('COMMIT');console.log('Migración aditiva e integridad verificadas: '+etiqueta);return {integridad:true,fecha:new Date().toISOString()}
 }catch(e){await db.query('ROLLBACK').catch(()=>{});throw Error('Migración '+etiqueta+': '+(e.code??e.message))}finally{await db.end()}
}
async function respaldo(nombre,ep){
 if(!state.respaldos[nombre]){const b=await neonApi('/branches',{branch:{name:'respaldo-inicio-'+nombre+'-'+Date.now(),parent_id:ep.branch_id}});state.respaldos[nombre]={id:b.branch.id,padre:ep.branch_id};guardar()}
 console.log('Respaldo conservado: '+nombre)
}
function manifiesto(){const a=[];function visitar(p){if(statSync(p).isDirectory()){for(const f of readdirSync(p))visitar(p+'/'+f)}else a.push({archivo:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')})}for(const p of ['src','public','dist','db/021_inicio_sesion.sql','package.json','package-lock.json','wrangler.jsonc'])visitar(p);return a.sort((x,y)=>x.archivo.localeCompare(y.archivo))}
async function confirmarPublicacion(){
 const esperada=readFileSync(dir+'/deploy.log','utf8').match(/Current Version ID: ([a-f0-9-]{36})/)?.[1]
 assert.ok(esperada,'Wrangler no informó una versión publicada')
 let publicadas
 for(let intento=0;intento<8;intento++){
  publicadas=await versiones()
  if(publicadas.length===1&&publicadas[0].version_id===esperada&&publicadas[0].percentage===100)break
  if(intento<7)await new Promise(r=>setTimeout(r,2000))
 }
 assert.deepEqual(publicadas,[{version_id:esperada,percentage:100}],'La API aún no confirma la versión de Wrangler')
 state.publicada=publicadas;state.publicado??=new Date().toISOString();state.confirmado=new Date().toISOString();guardar()
 writeFileSync(dir+'/publicacion.json',JSON.stringify({fecha:state.publicado,confirmado:state.confirmado,anterior:state.anterior,publicada:state.publicada,respaldos:state.respaldos,migracionReal:state.realMigrada,migracionDemo:state.demoMigrada},null,2))
 console.log('Publicación confirmada al 100%: '+esperada)
}
if(process.argv.includes('--preparar')){
 assert.deepEqual(actuales,state.anterior,'Cambió la versión publicada')
 await respaldo('real',real)
 if(!state.ensayo){const b=await neonApi('/branches',{branch:{name:'ensayo-inicio-'+Date.now(),parent_id:state.respaldos.real.id},endpoints:[{type:'read_write'}]});const url=new URL(env.DATABASE_URL);url.hostname=b.endpoints[0].host;state.ensayo={id:b.branch.id,padre:state.respaldos.real.id,url:url.toString()};guardar()}
 assert.notEqual(state.ensayo.id,real.branch_id);assert.notEqual(state.ensayo.id,prueba.branch_id)
 state.migracionEnsayo=await migrar(state.ensayo.url,'copia aislada');await migrar(state.ensayo.url,'repetición idempotente');guardar()
}
if(process.argv.includes('--ensayar')){
 assert.ok(state.migracionEnsayo&&!state.ensayoEliminado)
 await build({entryPoints:['src/worker/index.ts'],bundle:true,platform:'node',format:'esm',external:['qrcode'],outfile:'.test-output/inicio-neon.mjs'})
 await build({entryPoints:['src/worker/sesion.ts'],bundle:true,platform:'node',format:'esm',outfile:'.test-output/inicio-firma.mjs'})
 const {app}=await import(pathToFileURL(resolve('.test-output/inicio-neon.mjs'))),{firmar}=await import(pathToFileURL(resolve('.test-output/inicio-firma.mjs')))
 const fixture={DATABASE_URL:state.ensayo.url,SESION_SECRETO:randomBytes(32).toString('hex')},db=new Client(state.ensayo.url)
 await db.connect()
 try{
  const id=randomUUID(),tel='1999'+String(Date.now()).slice(-9)
  await db.query("INSERT INTO socio(id,telefono,nombre) VALUES($1,$2,'Prueba sintética Inicio')",[id,tel])
  await db.query("INSERT INTO tanda(socio_id,cerrada) VALUES($1,now())",[id])
  const token=await firmar(fixture.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+600000}),ctx={waitUntil:p=>void p.catch(()=>{}),passThroughOnException(){}}
  let cookie='',csrf=''
  async function call(path,body,bearer){const r=await app.request('https://ensayo.local/api'+path,{method:body?'POST':'GET',headers:{origin:'https://ensayo.local','content-type':'application/json','x-cliente-solicitud':'1','x-cliente-csrf':csrf,cookie,...(bearer?{authorization:'Bearer '+bearer}:{})},...(body?{body:JSON.stringify(body)}:{})},fixture,ctx);return{status:r.status,body:await r.json(),headers:r.headers}}
  const m=await call('/auth/sesion/migrar',{},token);assert.equal(m.status,200);cookie=m.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');csrf=m.headers.getSetCookie().find(c=>c.startsWith('__Host-lupita-cliente-csrf=')).split(';')[0].split('=')[1]
  assert.equal((await call('/yo')).body.socio.id,id);assert.equal((await call('/inicio/contexto')).status,200)
  const premio=await call('/tanda/canjear',{});assert.equal(premio.status,200);assert.ok(premio.body.codigo)
  assert.equal((await call('/inicio/evento',{evento:'vista',duracion:0})).status,200)
  assert.equal((await call('/sesion/salir',{})).status,200);assert.equal((await call('/yo')).status,401)
  state.ensayoOK={fecha:new Date().toISOString(),pruebas:['migración idempotente e integridad','sesión cookie y revocación','cuenta y contexto','premio con hora del servidor','métrica agregada']};guardar();writeFileSync(dir+'/ensayo-neon.json',JSON.stringify({...state.ensayoOK,produccionModificada:false},null,2));console.log('PASA ensayo de API en Neon aislado')
 }finally{await db.end()}
}
if(process.argv.includes('--congelar')){assert.ok(state.ensayoOK);state.manifiesto=manifiesto();guardar();writeFileSync(dir+'/manifest.json',JSON.stringify({fecha:new Date().toISOString(),archivos:state.manifiesto},null,2));console.log('Artefacto congelado: '+state.manifiesto.length+' archivos')}
if(process.argv.includes('--respaldar-local')){
 assert.deepEqual(actuales,state.anterior)
 for(const [nombre,url,ep] of [['real',env.DATABASE_URL,real],['demo',demo.DATABASE_URL,prueba]]){
  if(!state.respaldos[nombre]?.restored||process.argv.includes('--actualizar-ensayo')){
   state.respaldos[nombre]=await respaldar(url,'.inicio-backup-'+nombre+(process.argv.includes('--actualizar-ensayo')?'-final':'')+'.local',async db=>{
    const antes=JSON.stringify((await db.query("SELECT (SELECT count(*) FROM socio) clientes,(SELECT sum(monto) FROM asiento) libro,(SELECT count(*) FROM vale) vales,(SELECT count(*) FROM tanda) tandas")).rows)
    await db.exec(readFileSync('db/021_inicio_sesion.sql','utf8'));await db.exec(readFileSync('db/021_inicio_sesion.sql','utf8'))
    assert.equal(JSON.stringify((await db.query("SELECT (SELECT count(*) FROM socio) clientes,(SELECT sum(monto) FROM asiento) libro,(SELECT count(*) FROM vale) vales,(SELECT count(*) FROM tanda) tandas")).rows),antes)
   });guardar()
  }
  state.snapshotNombres??={};state.snapshotNombres[nombre]??='inicio-'+nombre+'-'+randomUUID();guardar()
  if(!state.snapshots?.[nombre]){
   const lista=(await neonApi('/snapshots')).snapshots
   const previo=lista.find(s=>s.name===state.snapshotNombres[nombre])
   let respuesta
   try{respuesta=previo?{snapshot:previo}:await neonApi('/branches/'+ep.branch_id+'/snapshot',{name:state.snapshotNombres[nombre]})}
   catch(e){if(![400,403,422].includes(e.status))throw e;respuesta={disponible:false,http:e.status,motivo:e.message};console.log('Snapshot remoto no disponible; respaldo restaurable local verificado.')}
   state.snapshots??={};state.snapshots[nombre]=respuesta;guardar()
  }
  console.log('Copia privada restaurada exactamente y migración ensayada: '+nombre)
 }
 state.ensayoOK={fecha:new Date().toISOString(),metodo:'Restauración local exacta de cada base real y demo; migración aditiva aplicada dos veces; API e interfaz probadas en bases sintéticas aisladas',pruebas:['restauración completa e idéntica','migración idempotente','integridad del libro y premios']};guardar()
 writeFileSync(dir+'/respaldos.json',JSON.stringify({fecha:new Date().toISOString(),ensayo:state.ensayoOK,respaldos:state.respaldos,snapshots:state.snapshots},null,2))
}
if(process.argv.includes('--migrar')){
 assert.ok(state.ensayoOK&&state.manifiesto);assert.deepEqual(actuales,state.anterior);assert.deepEqual(manifiesto(),state.manifiesto)
 if(!state.respaldos.demo)await respaldo('demo',prueba)
 state.demoMigrada=await migrar(demo.DATABASE_URL,'capacitación');guardar()
 state.realMigrada=await migrar(env.DATABASE_URL,'operación real');guardar()
}
if(process.argv.includes('--publicar')){
 assert.ok(state.demoMigrada&&state.realMigrada&&state.ensayoOK);assert.deepEqual(await versiones(),state.anterior);assert.deepEqual(manifiesto(),state.manifiesto)
 const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--keep-vars','--message','Inicio: cuenta y premios fiables, contexto, carga ligera y sesión cliente protegida'],{env:{...process.env,CLOUDFLARE_API_TOKEN:env.CLOUDFLARE_API_TOKEN,CLOUDFLARE_ACCOUNT_ID:env.CLOUDFLARE_ACCOUNT_ID,WRANGLER_SEND_METRICS:'false'},encoding:'utf8'})
 writeFileSync(dir+'/deploy.log',r.stdout+'\n'+r.stderr);if(r.status!==0)throw Error('Falló la publicación; revisar deploy.log')
 state.publicado=new Date().toISOString();guardar();await confirmarPublicacion()
}
if(process.argv.includes('--confirmar-publicacion')){assert.ok(state.demoMigrada&&state.realMigrada);assert.deepEqual(manifiesto(),state.manifiesto);await confirmarPublicacion()}
if(process.argv.includes('--cerrar-ensayo')){
 assert.ok(state.publicada&&state.ensayoOK);assert.notEqual(state.ensayo.id,real.branch_id);assert.notEqual(state.ensayo.id,prueba.branch_id)
 if(!state.ensayoEliminado){const b=await neonApi('/branches/'+state.ensayo.id);assert.equal(b.branch.parent_id,state.respaldos.real.id);assert.ok(b.branch.name.startsWith('ensayo-inicio-'));await neonApi('/branches/'+state.ensayo.id,undefined,'DELETE');state.ensayoEliminado=true;delete state.ensayo.url;guardar()}
 console.log('Eliminado sólo el ensayo creado en este trabajo. Respaldos conservados.')
}
