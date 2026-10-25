// Runtime Workers local con ASSETS real y base Neon exclusivamente de ensayo.
import assert from 'node:assert/strict'
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs'
import { resolve,join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { unstable_dev } from 'wrangler'
const stage=JSON.parse(readFileSync('.perfiles-ensayo.local','utf8'))
assert.ok(!stage.eliminada&&stage.branch!==stage.parent&&stage.name.startsWith('ensayo-perfiles-'))
const root=resolve(process.env.TEST_SOURCE_DIR||'.'),dir=join(resolve('.'),'.test-output/perfiles-runtime');mkdirSync(dir,{recursive:true})
const config={name:'club-lupita-ensayo-perfiles',main:join(root,'src/worker/index.ts'),compatibility_date:'2025-08-01',compatibility_flags:['nodejs_compat'],
 assets:{directory:resolve(process.env.TEST_DIST_DIR||'.test-output/perfiles-dist'),binding:'ASSETS',run_worker_first:['/api/*'],not_found_handling:'single-page-application'},
 vars:{DEMO_AISLADA:'false',ACCESO_PERSONAL:'false',ACCESO_CORREO:'false'},triggers:{crons:['17 * * * *']}}
writeFileSync(join(dir,'wrangler.json'),JSON.stringify(config))
const bindings={DATABASE_URL:stage.DATABASE_URL,SESION_SECRETO:randomUUID(),CASA_SECRETO:randomUUID(),PERSONAL_CREDENCIAL_SECRETO:randomUUID(),PERSONAL_MFA_SECRETO:randomUUID()}
writeFileSync(join(dir,'.dev.vars'),Object.entries(bindings).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n'))
const worker=await unstable_dev(config.main,{config:join(dir,'wrangler.json'),local:true,port:0,persist:false,logLevel:'error',experimental:{disableExperimentalWarning:true,disableDevRegistry:true,showInteractiveDevSession:false,testScheduled:true,watch:false}})
const results=[]
try{
 const policy=readFileSync('public/_headers','utf8').split(/\r?\n/).find(l=>l.includes('Content-Security-Policy:')).split('Content-Security-Policy: ')[1]
 for(const [path,status] of [['/',200],['/personal',200],['/api/health',200],['/api/yo',401],['/api/ocupacion?dia=2026-02-31',422]]){
  const response=await worker.fetch(path);assert.equal(response.status,status,path)
  assert.equal(response.headers.get('content-security-policy'),policy,path)
  assert.equal(response.headers.get('x-content-type-options'),'nosniff')
  assert.equal(response.headers.get('x-frame-options'),'DENY')
  assert.equal(response.headers.get('strict-transport-security'),'max-age=31536000')
  assert.ok(response.headers.get('referrer-policy'))
  results.push({path,status,cabeceras:true});console.log('PASA Workers local '+path+' '+status+' con cabeceras')
 }
 const response=await worker.fetch('/__scheduled?cron='+encodeURIComponent('17 * * * *'))
 assert.equal(response.status,200,'Scheduled sobre copia aislada')
 results.push({path:'scheduled',status:response.status,base:'ensayo'});console.log('PASA evento scheduled en Workers local con base de ensayo')
}finally{
 await worker.stop()
 writeFileSync('entregables/correcciones-perfiles-2026-10-07/evidencia/'+(process.env.TEST_EVIDENCE_PREFIX||'')+'runtime-workers.json',JSON.stringify({fecha:new Date().toISOString(),fuentes:root,branch:stage.branch,results},null,2))
}
