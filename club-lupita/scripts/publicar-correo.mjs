import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {spawnSync} from 'node:child_process'
import {Client,neonConfig} from '@neondatabase/serverless'
const deploy=parseEnv(readFileSync('.env.deploy','utf8'))
const db=parseEnv(readFileSync('.dev.vars','utf8'))
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
assert.equal(config.account_id,deploy.CLOUDFLARE_ACCOUNT_ID)
assert.equal(config.name,'club-lupita')
const output='../entregables/registro-correo-2026-10-01'
mkdirSync(output,{recursive:true})
const api=async path=>{const r=await fetch('https://api.cloudflare.com/client/v4'+path,{headers:{Authorization:'Bearer '+deploy.CLOUDFLARE_API_TOKEN}});const j=await r.json();assert.ok(r.ok&&j.success,'Cloudflare '+r.status);return j.result}
const zones=await api('/zones?name=labellalupita.com');assert.equal(zones.length,1);assert.equal(zones[0].account.id,config.account_id);assert.equal(zones[0].status,'active')
const base='/accounts/'+config.account_id+'/workers'
const bindings=(await api(base+'/scripts/club-lupita/settings')).bindings
assert.ok(bindings.some(b=>b.name==='DATABASE_URL'));assert.ok(bindings.some(b=>b.name==='DEMO_DATABASE_URL'))
if(process.argv.includes('--migrar')){
 neonConfig.webSocketConstructor=globalThis.WebSocket
 const demo=JSON.parse(readFileSync('.demo.local','utf8'));assert.notEqual(new URL(db.DATABASE_URL).hostname,new URL(demo.DATABASE_URL).hostname)
 const results=[]
 for(const [name,url] of [['demostracion',demo.DATABASE_URL],['clientes',db.DATABASE_URL]]){
  const cli=new Client(url);await cli.connect()
  try{
   await cli.query('BEGIN');await cli.query("SET LOCAL lock_timeout='10s'");await cli.query("SET LOCAL statement_timeout='30s'")
   await cli.query('LOCK TABLE socio,asiento IN SHARE ROW EXCLUSIVE MODE')
   const query='SELECT (SELECT count(*)::text FROM socio) AS socios,count(*)::text AS asientos,coalesce(sum(monto),0)::text AS total FROM asiento'
   const before=(await cli.query(query)).rows
   const migration=process.argv.includes('--promociones')?'014_promociones':'013_correo'
   const source=readFileSync('db/'+migration+'.sql','utf8').replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,'')
   await cli.query(source)
   assert.deepEqual((await cli.query(query)).rows,before)
   await cli.query('COMMIT');results.push({base:name,migration,preserved:true});console.log(name+': migración correcta; clientes y libro mayor conservados')
  }catch(e){await cli.query('ROLLBACK');throw Error('Migración '+name+': '+(e.code??'fallida'))}finally{await cli.end()}
 }
 writeFileSync(output+'/migracion.json',JSON.stringify({date:new Date().toISOString(),results},null,2))
}
if(process.argv.includes('--publicar')){
 const existing=await api('/zones/'+zones[0].id+'/dns_records?name=app.labellalupita.com')
 const domains=await api(base+'/domains')
 assert.ok(existing.length===0||domains.some(d=>d.hostname==='app.labellalupita.com'&&d.service==='club-lupita'),'Subdominio ocupado por otro servicio')
 const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy'],{env:{...process.env,...deploy},stdio:'inherit'})
 if(r.status!==0)process.exit(r.status??1)
 console.log('Publicación terminada. Verificar HTTPS y capacidades antes de habilitar correo.')
}
