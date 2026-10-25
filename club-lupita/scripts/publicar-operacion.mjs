import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {parseEnv} from 'node:util';
import assert from 'node:assert/strict';
import {Client,neonConfig} from '@neondatabase/serverless';
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))};
const demo=JSON.parse(readFileSync('.demo.local','utf8'));
const file='.operacion-release.local';
let state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{project:env.NEON_PROJECT_ID,created:new Date().toISOString(),backups:{}};
assert.equal(state.project,env.NEON_PROJECT_ID);
const save=()=>writeFileSync(file,JSON.stringify(state,null,2));
async function api(path,body){const r=await fetch('https://console.neon.tech/api/v2/projects/'+env.NEON_PROJECT_ID+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+env.NEON_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok)throw Error('Neon HTTP '+r.status);return r.json();}
neonConfig.webSocketConstructor=globalThis.WebSocket;
async function migrate(url,label){const c=new Client(url);await c.connect();try{
 await c.query('BEGIN');await c.query("SET LOCAL lock_timeout='10s'");await c.query("SET LOCAL statement_timeout='45s'");
 await c.query('LOCK TABLE socio,asiento,reserva_cosecha IN SHARE ROW EXCLUSIVE MODE');
 const before=(await c.query('SELECT s.id,d.* FROM socio s CROSS JOIN LATERAL saldo_de(s.id) d ORDER BY s.id')).rows;
 const ledger=(await c.query('SELECT count(*)::text AS n,coalesce(sum(monto),0)::text AS total FROM asiento')).rows;
 const migration=readFileSync('db/012_operacion.sql','utf8').replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,'');
 await c.query(migration);
 assert.deepEqual((await c.query('SELECT s.id,d.* FROM socio s CROSS JOIN LATERAL saldo_de(s.id) d ORDER BY s.id')).rows,before,'Saldos distintos');
 assert.deepEqual((await c.query('SELECT count(*)::text AS n,coalesce(sum(monto),0)::text AS total FROM asiento')).rows,ledger,'Libro mayor distinto');
 await c.query('COMMIT');console.log(label+': migración 012 correcta, saldos y libro mayor conservados');
 }catch(e){await c.query('ROLLBACK').catch(()=>{});throw Error(label+': '+(e.code??e.message))}finally{await c.end()}}
const endpoints=(await api('/endpoints')).endpoints;
const match=url=>endpoints.find(e=>e.host===new URL(url).hostname.replace('-pooler',''));
const real=match(env.DATABASE_URL),muestra=match(demo.DATABASE_URL);
assert.ok(real&&muestra);assert.notEqual(real.branch_id,muestra.branch_id);assert.equal(muestra.branch_id,demo.branch);
const cf=await fetch('https://api.cloudflare.com/client/v4/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/scripts/club-lupita/settings',{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}});
const settings=await cf.json();assert.ok(settings.success,'No se pudo verificar Cloudflare');
const bindings=settings.result.bindings;
assert.ok(bindings.some(b=>b.name==='DATABASE_URL'));assert.ok(bindings.some(b=>b.name==='DEMO_DATABASE_URL'));
assert.ok(!bindings.some(b=>b.name==='OTP_SERVICE'),'Servicio externo inesperado');
console.log('Destino comprobado: club-lupita; bases real y demo distintas; sin servicio OTP');
if(process.argv.includes('--preparar')){
 for(const [label,ep] of [['real',real],['demo',muestra]]){
  if(!state.backups[label]){const b=await api('/branches',{branch:{name:'respaldo-operacion-'+label+'-'+Date.now(),parent_id:ep.branch_id}});state.backups[label]={id:b.branch.id,parent:ep.branch_id};save();}
  console.log('Respaldo '+label+': '+state.backups[label].id);
 }
 if(!state.stage){const b=await api('/branches',{branch:{name:'ensayo-operacion-'+Date.now(),parent_id:state.backups.real.id},endpoints:[{type:'read_write'}]});const url=new URL(env.DATABASE_URL);url.hostname=b.endpoints[0].host;state.stage={id:b.branch.id,parent:state.backups.real.id,url:url.toString()};save();}
 await migrate(state.stage.url,'Ensayo sobre copia real');state.ensayo=true;save();
}
if(process.argv.includes('--migrar')){
 assert.ok(state.ensayo&&state.backups.real&&state.backups.demo);
 assert.equal(state.backups.real.parent,real.branch_id);assert.equal(state.backups.demo.parent,muestra.branch_id);
 await migrate(demo.DATABASE_URL,'Demo');state.demoMigrated=true;save();
 await migrate(env.DATABASE_URL,'Producción');state.realMigrated=true;save();
}
