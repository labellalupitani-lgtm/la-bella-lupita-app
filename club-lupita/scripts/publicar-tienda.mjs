// Credenciales y respaldos con datos reales permanecen en archivos .local privados.
import {readFileSync,writeFileSync,existsSync,readdirSync,statSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import assert from 'node:assert/strict'
import {Client,neonConfig} from '@neondatabase/serverless'
import {respaldar} from './respaldo-inicio.mjs'
const dir='entregables/mejoras-tienda-2026-10-09',file='.tienda-release.local'
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const demo=JSON.parse(readFileSync('.demo.local','utf8')),config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
assert.equal(config.account_id,env.CLOUDFLARE_ACCOUNT_ID);assert.notEqual(new URL(env.DATABASE_URL).hostname.replace('-pooler',''),new URL(demo.DATABASE_URL).hostname.replace('-pooler',''))
const state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{creado:new Date().toISOString(),respaldos:{}}
const guardar=()=>writeFileSync(file,JSON.stringify(state,null,2))
neonConfig.webSocketConstructor=globalThis.WebSocket
async function versiones(){const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.account_id+'/workers/scripts/'+config.name+'/deployments',{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}});const v=await r.json();if(!r.ok||!v.success)throw Error('No se pudo leer la versión publicada');return v.result.deployments[0].versions}
const actuales=await versiones();state.anterior??=actuales;guardar()
const sql=readFileSync('db/023_tienda.sql','utf8').replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,'')
const huellaSQL=`SELECT (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM asiento a) libro,
 (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM socio a) clientes,
 (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM membresia a) membresias,
 (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM empleado a) equipo,
 (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM (SELECT id,socio_id,referencia,lineas,total,estado,creado FROM pedido) a) pedidos,
 (SELECT md5(COALESCE(jsonb_agg(a ORDER BY codigo)::text,'')) FROM vale a) vales,
 (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM (SELECT id,socio_id,numero,generacion,total,creada,entregada,entregada_por FROM compra_bolsa) a) bolsas`
function manifiesto(){const a=[];function visitar(p){if(statSync(p).isDirectory()){for(const f of readdirSync(p))visitar(p+'/'+f)}else a.push({archivo:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')})}for(const p of ['src','public','dist','db/023_tienda.sql','package.json','package-lock.json','wrangler.jsonc'])visitar(p);return a.sort((a,b)=>a.archivo.localeCompare(b.archivo))}
if(process.argv.includes('--inventario'))console.log(JSON.stringify({versiones:actuales,preparado:!!state.ensayo,publicado:state.publicada??null}))
if(process.argv.includes('--preparar')){
 assert.deepEqual(actuales,state.anterior,'Cambió la versión remota durante el trabajo')
 for(const [nombre,url] of [['real',env.DATABASE_URL],['demo',demo.DATABASE_URL]]){
  state.respaldos[nombre]=await respaldar(url,'.tienda-backup-'+nombre+'.local',async db=>{
   const antes=JSON.stringify((await db.query(huellaSQL)).rows)
   await db.exec(sql);await db.exec(sql)
   assert.equal(JSON.stringify((await db.query(huellaSQL)).rows),antes)
   assert.equal((await db.query("SELECT count(*)::int n FROM tienda_lote WHERE (ficha->>'habilitada')::boolean")).rows[0].n,0)
  });guardar();console.log('Restauración completa y doble migración verificadas: '+nombre)
 }
 state.ensayo=new Date().toISOString();state.manifiesto=manifiesto();guardar()
 writeFileSync(dir+'/manifest.json',JSON.stringify({fecha:state.ensayo,archivos:state.manifiesto},null,2))
 writeFileSync(dir+'/evidencia/respaldos.json',JSON.stringify({metodo:'Exportación privada completa, restauración exacta en PGlite y migración aplicada dos veces; sin crear ni borrar ramas remotas',respaldos:state.respaldos,fecha:state.ensayo},null,2))
}
if(process.argv.includes('--migrar')){
 assert.ok(state.ensayo);assert.deepEqual(actuales,state.anterior);assert.deepEqual(manifiesto(),state.manifiesto,'Cambió el código desde la verificación')
 for(const [nombre,url] of [['demo',demo.DATABASE_URL],['real',env.DATABASE_URL]]){
  const db=new Client(url);await db.connect()
  try{await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ');await db.query("SET LOCAL lock_timeout='8s'");await db.query("SET LOCAL statement_timeout='60s'")
   const antes=JSON.stringify((await db.query(huellaSQL)).rows);await db.query(sql);assert.equal(JSON.stringify((await db.query(huellaSQL)).rows),antes);await db.query('COMMIT')
   state[nombre+'Migrada']={fecha:new Date().toISOString(),integridad:true};guardar();console.log('Migración e integridad verificadas: '+nombre)
  }catch(e){await db.query('ROLLBACK').catch(()=>{});throw Error('Migración '+nombre+' falló: '+(e.code??e.message))}finally{await db.end()}
 }
}
if(process.argv.includes('--congelar')){assert.ok(state.ensayo);assert.deepEqual(actuales,state.anterior);state.manifiesto=manifiesto();guardar();writeFileSync(dir+'/manifest.json',JSON.stringify({fecha:new Date().toISOString(),archivos:state.manifiesto},null,2));console.log('Versión local verificada y congelada')}
async function confirmar(){
 const esperada=readFileSync(dir+'/deploy.log','utf8').match(/Current Version ID: ([a-f0-9-]{36})/)?.[1];assert.ok(esperada)
 const publicadas=await versiones();assert.deepEqual(publicadas,[{version_id:esperada,percentage:100}])
 state.publicada=publicadas;state.confirmado=new Date().toISOString();guardar()
 writeFileSync(dir+'/publicacion.json',JSON.stringify({fecha:state.confirmado,anterior:state.anterior,publicada:state.publicada,migracionReal:state.realMigrada,migracionDemo:state.demoMigrada},null,2));console.log('Versión confirmada al 100%: '+esperada)
}
if(process.argv.includes('--publicar')){
 assert.ok(state.realMigrada&&state.demoMigrada);assert.deepEqual(manifiesto(),state.manifiesto);assert.deepEqual(await versiones(),state.anterior)
 const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--keep-vars','--message','Tienda: preventa consentida, recuperación durable, entregas y devoluciones'],{env:{...process.env,CLOUDFLARE_API_TOKEN:env.CLOUDFLARE_API_TOKEN,CLOUDFLARE_ACCOUNT_ID:env.CLOUDFLARE_ACCOUNT_ID,WRANGLER_SEND_METRICS:'false'},encoding:'utf8'})
 writeFileSync(dir+'/deploy.log',r.stdout+'\n'+r.stderr);assert.equal(r.status,0,'Wrangler no confirmó la publicación');await confirmar()
}
if(process.argv.includes('--confirmar'))await confirmar()
