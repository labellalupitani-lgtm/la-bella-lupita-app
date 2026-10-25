// Publicación acotada: solo la copia probada; nunca el árbol compartido.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,readdirSync,statSync,mkdirSync} from 'node:fs'
import {resolve,join,relative} from 'node:path'
import {parseEnv} from 'node:util'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
const root=resolve(import.meta.dirname,'..'),release=join(root,'.test-output/release-perfiles')
const output=join(root,'entregables/correcciones-perfiles-2026-10-07')
const env=Object.assign({},...['.env.deploy','.dev.vars','.infra.local'].map(f=>parseEnv(readFileSync(join(root,f),'utf8'))))
const config=JSON.parse(readFileSync(join(release,'wrangler.jsonc'),'utf8'))
assert.equal(config.name,'club-lupita');assert.equal(config.account_id,env.CLOUDFLARE_ACCOUNT_ID)
assert.deepEqual(config.triggers,{crons:['17 * * * *']})
assert.deepEqual(config.routes,[{pattern:'app.labellalupita.com',custom_domain:true}])
const api='https://api.cloudflare.com/client/v4/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/scripts/club-lupita'
async function get(path){const r=await fetch(api+path,{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}});assert.equal(r.status,200);const j=await r.json();assert.equal(j.success,true);return j.result}
const hash=b=>createHash('sha256').update(b).digest('hex')
const files=[]
function walk(dir){for(const n of readdirSync(dir)){const p=join(dir,n);if(statSync(p).isDirectory())walk(p);else files.push({path:relative(release,p).replaceAll('\\','/'),sha256:hash(readFileSync(p))})}}
for(const d of ['src','public','dist'])walk(join(release,d))
for(const f of ['package.json','package-lock.json','wrangler.jsonc','tsconfig.json','vite.config.ts','tailwind.config.js','postcss.config.js','index.html','legado.html','scripts/proteger-braces.mjs'])files.push({path:f,sha256:hash(readFileSync(join(release,f)))})
files.sort((a,b)=>a.path.localeCompare(b.path))
const manifestFile=join(output,'evidencia/release-final-manifest.json')
if(process.argv.includes('--congelar')){
 const manifest={fecha:new Date().toISOString(),release:relative(root,release),archivos:files,hash:hash(JSON.stringify(files)),migraciones:[],auth:'acceso vigente; alta nueva temporal de 24 horas'}
 writeFileSync(manifestFile,JSON.stringify(manifest,null,2));console.log('Artefacto congelado SHA256 '+manifest.hash);process.exit(0)
}
const manifest=JSON.parse(readFileSync(manifestFile,'utf8'));assert.deepEqual(files,manifest.archivos,'El artefacto cambió después de congelarse')
assert.ok(!files.some(f=>/src\/worker\/(acceso-equipo|equipo-sesion)\.ts/.test(f.path)))
const before=JSON.parse(readFileSync(join(output,'evidencia/infra-antes.json'),'utf8'))
const current=await get('/deployments')
const verify=process.argv.includes('--verificar')
const expected=process.argv.includes('--desde')?[{version_id:process.argv[process.argv.indexOf('--desde')+1],percentage:100}]:before.deployments.deployments[0].versions
if(!verify)assert.deepEqual(current.deployments[0].versions,expected,'Hay otra versión remota: revisar antes de publicar')
const args=[join(root,'node_modules/wrangler/bin/wrangler.js'),'deploy','--config',join(release,'wrangler.jsonc'),'--keep-vars','--message','Correcciones auditadas de perfiles: sesiones, pagos, cupos, validaciones y mantenimiento']
const publish=process.argv.includes('--publicar')
if(!publish)args.push('--dry-run','--outdir',join(release,'.test-output/deploy-dry-run'))
if(!verify){
const run=spawnSync(process.execPath,args,{cwd:release,env:{...process.env,CLOUDFLARE_ACCOUNT_ID:env.CLOUDFLARE_ACCOUNT_ID,CLOUDFLARE_API_TOKEN:env.CLOUDFLARE_API_TOKEN,WRANGLER_SEND_METRICS:'false'},encoding:'utf8',maxBuffer:10*1024*1024})
writeFileSync(join(output,'logs/'+(publish?'publicacion':'dry-run')+'.log'),run.stdout+'\n'+run.stderr)
process.stdout.write(run.stdout);process.stderr.write(run.stderr)
assert.equal(run.status,0,'Wrangler no terminó correctamente; comprobar estado remoto antes de reintentar')
}
if(publish||verify){
 const [settings,deployments,scheduleResult]=await Promise.all([get('/settings'),get('/deployments'),get('/schedules')])
 const schedules=Array.isArray(scheduleResult)?scheduleResult:scheduleResult.schedules
 const version=deployments.deployments[0].versions
 if(verify)assert.equal(version[0].version_id,process.argv[process.argv.indexOf('--verificar')+1],'La versión no coincide con la publicada')
 assert.notDeepEqual(version,before.deployments.deployments[0].versions)
 assert.ok(schedules.some(s=>s.cron==='17 * * * *'))
 const bindings=settings.bindings.map(b=>({name:b.name,type:b.type})).sort((a,b)=>a.name.localeCompare(b.name))
 assert.deepEqual(bindings,before.bindings.sort((a,b)=>a.name.localeCompare(b.name)),'Bindings inesperados')
 writeFileSync(join(output,'evidencia/publicacion.json'),JSON.stringify({fecha:new Date().toISOString(),version,anterior:before.deployments.deployments[0].versions,reemplazada:expected,hashArtefacto:manifest.hash,bindings,schedules,migracionesEjecutadas:[],destino:'https://app.labellalupita.com'},null,2))
 console.log('Versión y cron confirmados; bindings conservados.')
}
