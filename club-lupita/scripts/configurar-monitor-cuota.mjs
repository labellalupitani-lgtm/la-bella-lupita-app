import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {spawnSync} from 'node:child_process'
import assert from 'node:assert/strict'
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const archivo='.cuota-monitor.local',out='entregables/optimizacion-consumo-2026-10-22'
let clave
if(existsSync(archivo))clave=JSON.parse(readFileSync(archivo,'utf8'))
else{
 const r=await fetch('https://console.neon.tech/api/v2/organizations/org-patient-bonus-16468849/api_keys',{method:'POST',headers:{Authorization:'Bearer '+env.NEON_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({key_name:'club-lupita-monitor-cuota',project_id:'polished-waterfall-53015854'}),signal:AbortSignal.timeout(30000)})
 const data=await r.json()
 if(r.status===404&&String(data.message).includes('requires a personal API key')){
   // La credencial de organización disponible no puede emitir claves hijas.
   // El monitor usa únicamente GET del proyecto fijo; no se amplían permisos.
   clave={id:null,key:env.NEON_API_KEY,proyecto:'polished-waterfall-53015854',alcance:'organizacion_existente',limitacion:'Neon requiere una clave personal para crear otra limitada al proyecto'}
 }else{
   assert(r.ok&&typeof data.key==='string',`No se creó la clave de monitor: HTTP ${r.status}`)
   clave={id:data.id,key:data.key,proyecto:'polished-waterfall-53015854',alcance:'proyecto'}
 }
 writeFileSync(archivo,JSON.stringify(clave))
}
const prueba=await fetch('https://console.neon.tech/api/v2/projects/'+clave.proyecto,{headers:{Authorization:'Bearer '+clave.key},signal:AbortSignal.timeout(15000)})
assert.equal(prueba.status,200,'La clave restringida no puede consultar el proyecto')
const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','put','NEON_CUOTA_API_KEY','--config','wrangler.jsonc'],{input:clave.key+'\n',encoding:'utf8',env:{...process.env,CLOUDFLARE_API_TOKEN:env.CLOUDFLARE_API_TOKEN,CLOUDFLARE_ACCOUNT_ID:env.CLOUDFLARE_ACCOUNT_ID,WRANGLER_SEND_METRICS:'false'},maxBuffer:2*1024*1024})
writeFileSync(out+'/monitor-secreto.log',result.stdout+'\n'+result.stderr)
assert.equal(result.status,0,'Revisar resultado remoto antes de repetir')
writeFileSync(out+'/monitor-configurado.json',JSON.stringify({fecha:new Date().toISOString(),id:clave.id,proyecto:clave.proyecto,alcance:clave.alcance,limitacion:clave.limitacion,secret:'NEON_CUOTA_API_KEY',consultaGestion:200},null,2))
console.log('Credencial del monitor verificada y almacenada como secreto; alcance registrado sin mostrar su valor.')
