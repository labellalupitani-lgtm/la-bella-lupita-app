// Credenciales del proceso; respaldos con datos reales exclusivamente en .local.
import {readFileSync,writeFileSync,existsSync,readdirSync,statSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import assert from 'node:assert/strict'
import {Client,neonConfig} from '@neondatabase/serverless'
import {respaldar} from './respaldo-inicio.mjs'
const dir='entregables/conoce-tu-club-2026-10-12',file='.conoce-club-release.local'
const env={...parseEnv(readFileSync('.dev.vars','utf8')),...process.env,...parseEnv(readFileSync('.env.deploy','utf8'))}
const demo=JSON.parse(readFileSync('.demo.local','utf8')),config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
const identidad=u=>{const x=new URL(u);return x.hostname.replace('-pooler','')+x.pathname}
assert.notEqual(identidad(env.DATABASE_URL),identidad(demo.DATABASE_URL),'Capacitación requiere una base separada')
assert.ok(env.CLOUDFLARE_API_TOKEN,'Falta credencial en el proceso')
const state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{creado:new Date().toISOString(),respaldos:{}}
const guardar=()=>writeFileSync(file,JSON.stringify(state,null,2))
neonConfig.webSocketConstructor=WebSocket
async function versiones(){const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.account_id+'/workers/scripts/'+config.name+'/deployments',{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN},signal:AbortSignal.timeout(15000)});const d=await r.json();assert.ok(r.ok&&d.success,'No se pudo leer la versión publicada');return d.result.deployments[0].versions}
const actuales=await versiones();state.anterior??=actuales;guardar()
const migraciones=['db/029_reglas_club.sql'].map(f=>readFileSync(f,'utf8').replace(/^BEGIN;\s*/m,'').replace(/COMMIT;\s*$/,''))
async function huellas(db){
 const tablas=(await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT IN ('club_ticket_validacion','club_premio_entrega','club_vip_espera') ORDER BY tablename")).rows
 const hashes={}
 for(const {tablename:t} of tablas){
  assert.match(t,/^[a-z_]+$/)
  const row=t==='club_config'?"to_jsonb(a)-ARRAY['reglas_version','validacion_operativa']":t==='tanda'?"to_jsonb(a)-'reglas_version'":"to_jsonb(a)"
  const where=t==='club_migracion'?" WHERE version<>'029'":''
  hashes[t]=(await db.query(`SELECT md5(COALESCE(jsonb_agg(${row} ORDER BY (${row})::text)::text,'')) h FROM "${t}" a${where}`)).rows[0].h
 }
 return hashes
}
function manifiesto(){const archivos=[];function visitar(p){if(statSync(p).isDirectory()){for(const f of readdirSync(p))visitar(p+'/'+f)}else archivos.push({archivo:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')})}for(const p of ['src','public','dist','db','tests','scripts','package.json','package-lock.json','wrangler.jsonc','worker-configuration.d.ts','tsconfig.json'])visitar(p);return archivos.sort((a,b)=>a.archivo.localeCompare(b.archivo))}
if(process.argv.includes('--preparar')){
 assert.deepEqual(actuales,state.anterior,'Otra publicación cambió el Worker')
 for(const [nombre,url] of [['real',env.DATABASE_URL],['demo',demo.DATABASE_URL]]){
  state.respaldos[nombre]=await respaldar(url,'.conoce-club-backup-'+nombre+'.local',async db=>{
   const antes=await huellas(db)
   for(let i=0;i<2;i++)for(const sql of migraciones)await db.exec(sql)
   assert.deepEqual(await huellas(db),antes,'Una migración alteró datos históricos')
   assert.equal((await db.query('SELECT reglas_version FROM club_config')).rows[0].reglas_version,null)
  });guardar();console.log('Respaldo restaurado y migraciones repetidas con integridad: '+nombre)
 }
 state.ensayo=new Date().toISOString();state.manifiesto=manifiesto();guardar()
 writeFileSync(dir+'/manifest.json',JSON.stringify({fecha:state.ensayo,archivos:state.manifiesto},null,2))
 writeFileSync(dir+'/respaldos.json',JSON.stringify({fecha:state.ensayo,metodo:'Copia privada completa, restauración en memoria y doble migración sin alterar datos históricos',respaldos:state.respaldos},null,2))
}
if(process.argv.includes('--migrar')){
 assert.ok(state.ensayo);assert.deepEqual(actuales,state.anterior);assert.deepEqual(manifiesto(),state.manifiesto,'Cambió el código desde el ensayo')
 for(const [nombre,url] of [['demo',demo.DATABASE_URL],['real',env.DATABASE_URL]]){
  const db=new Client(url);await db.connect()
  try{await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ');await db.query("SET LOCAL lock_timeout='8s'");await db.query("SET LOCAL statement_timeout='60s'")
   const antes=await huellas(db);for(const sql of migraciones)await db.query(sql);assert.deepEqual(await huellas(db),antes);await db.query('COMMIT')
   state[nombre+'Migrada']={fecha:new Date().toISOString(),integridad:true};guardar();console.log('Migraciones e integridad verificadas: '+nombre)
  }catch(e){await db.query('ROLLBACK').catch(()=>{});throw Error('Migración '+nombre+' falló: '+(e.code??e.message))}finally{await db.end()}
 }
}
async function confirmar(){
 const esperada=readFileSync(dir+'/deploy.log','utf8').match(/Current Version ID: ([a-f0-9-]{36})/)?.[1];assert.ok(esperada)
 const publicadas=await versiones();assert.deepEqual(publicadas,[{version_id:esperada,percentage:100}]);if(state.publicada&&!state.publicada.some(v=>v.version_id===esperada))state.historial=[...(state.historial??[]),{fecha:state.confirmado,versiones:state.publicada}];state.publicada=publicadas;state.confirmado=new Date().toISOString();guardar()
 writeFileSync(dir+'/publicacion.json',JSON.stringify({fecha:state.confirmado,anterior:state.anterior,historial:state.historial??[],publicada:state.publicada,migracionReal:state.realMigrada,migracionDemo:state.demoMigrada},null,2));console.log('Versión confirmada al 100%: '+esperada)
}
if(process.argv.includes('--congelar-actualizacion')){
 assert.ok(state.publicada);assert.deepEqual(actuales,state.publicada);state.baseActualizacion=actuales;state.manifiesto=manifiesto();guardar();writeFileSync(dir+'/manifest.json',JSON.stringify({fecha:new Date().toISOString(),archivos:state.manifiesto},null,2));console.log('Actualización preparada sobre la versión publicada')
}
if(process.argv.includes('--publicar')||process.argv.includes('--actualizar')){
 assert.ok(state.realMigrada&&state.demoMigrada);assert.deepEqual(manifiesto(),state.manifiesto);assert.deepEqual(await versiones(),process.argv.includes('--actualizar')?state.baseActualizacion:state.anterior)
 const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--keep-vars','--message','Conocé tu club: explicación pública, oferta aceptada y reglas aprobadas pendientes de validación operativa'],{env:{...process.env,CLOUDFLARE_API_TOKEN:env.CLOUDFLARE_API_TOKEN,WRANGLER_SEND_METRICS:'false'},encoding:'utf8'})
 writeFileSync(dir+'/deploy.log',r.stdout+'\n'+r.stderr);assert.equal(r.status,0,'Wrangler no confirmó la publicación');await confirmar()
}
if(process.argv.includes('--confirmar'))await confirmar()
