import {spawnSync} from 'node:child_process'
import {mkdirSync,writeFileSync} from 'node:fs'
const dir='entregables/acceso-equipo-2026-10-07/evidencia';mkdirSync(dir,{recursive:true})
const resultados=[]
for(const [nombre,args] of [
  ...['regresion','cuenta-cliente','operacion','correo','resend','auditoria','saldo-cronologico','panel','acceso-equipo','clientes-equipo','correcciones-servidor','correcciones-cliente','cabeceras-perfiles'].map(n=>[n,['tests/'+n+'.mjs']]),
  ['guardian',['scripts/pruebas-guardian.mjs']],['tipos',['node_modules/typescript/bin/tsc','-b']],['build',['node_modules/vite/bin/vite.js','build']],
  ['worker-dry-run',['node_modules/wrangler/bin/wrangler.js','deploy','--dry-run','--outdir','.test-output/acceso-dry-run']],
]){
  const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:10*1024*1024,env:{...process.env,WRANGLER_SEND_METRICS:'false'}})
  writeFileSync(dir+'/'+nombre+'.log',r.stdout+'\n'+r.stderr)
  resultados.push({nombre,codigo:r.status,aprobado:r.status===0});console.log((r.status===0?'PASA ':'FALLA ')+nombre)
  writeFileSync(dir+'/verificacion-final.json',JSON.stringify({fecha:new Date().toISOString(),resultados},null,2))
  if(r.status!==0){console.log((r.stderr||r.stdout).slice(-2500));process.exit(1)}
}
