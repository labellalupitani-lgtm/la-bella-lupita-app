import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync} from 'node:fs'
import {parseEnv} from 'node:util'
import assert from 'node:assert/strict'
const dir='entregables/optimizacion-consumo-2026-10-22'
mkdirSync(dir,{recursive:true})
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const id='polished-waterfall-53015854'
assert.equal(env.NEON_PROJECT_ID,id)
const endpoints=['ep-royal-recipe-ayyyffav','ep-dark-firefly-ayj6vvl8']
const save=(name,data)=>writeFileSync(`${dir}/${name}.json`,JSON.stringify(data,null,2))
async function neon(path,method='GET',body){const r=await fetch('https://console.neon.tech/api/v2/projects/'+id+path,{method,headers:{Authorization:'Bearer '+env.NEON_API_KEY,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});const data=await r.json();if(!r.ok)throw Error(`Neon ${method} ${path}: ${r.status} ${data.message??data.error??''}`);return data}
async function cf(path){const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/club-lupita/${path}`,{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN},signal:AbortSignal.timeout(30000)});const j=await r.json();assert(r.ok&&j.success,`Cloudflare ${path}: ${r.status}`);return j.result}
const pick=(obj,keys)=>Object.fromEntries(keys.filter(k=>obj[k]!==undefined).map(k=>[k,obj[k]]))
async function inventory(){const [p,e,b]=await Promise.all([neon(''),neon('/endpoints'),neon('/branches?limit=100')]);return {fecha:new Date().toISOString(),proyecto:pick(p.project,['id','name','compute_time_seconds','active_time_seconds','default_endpoint_settings','consumption_period_start','consumption_period_end']),endpoints:e.endpoints.map(x=>pick(x,['id','branch_id','host','current_state','autoscaling_limit_min_cu','autoscaling_limit_max_cu','suspend_timeout_seconds'])),ramas:b.branches.map(x=>pick(x,['id','name','compute_time_seconds','active_time_seconds']))}}
const mode=process.argv[2]??'base'
if(mode==='base'){
 assert(!existsSync(dir+'/base.json'),'La línea base ya existe; no sobrescribir.')
 const [base,deployments,settings,schedules]=await Promise.all([inventory(),cf('deployments'),cf('settings'),cf('schedules')])
 const bindings=settings.bindings.map(x=>({...pick(x,['name','type']),...(x.type==='plain_text'?{text:x.text}:{})}))
 save('base',{...base,cloudflare:{deployments,settings:{...pick(settings,['compatibility_date','compatibility_flags','observability','migration_tag']),bindings},schedules}})
 for(const name of ['src','wrangler.jsonc','worker-configuration.d.ts','package.json','package-lock.json'])cpSync(name,`${dir}/antes/${name}`,{recursive:true})
 console.log(JSON.stringify({fecha:base.fecha,cuHoras:base.proyecto.compute_time_seconds/3600,endpoints:base.endpoints,deployments,schedules},null,2))
}else if(mode==='aplicar'){
 const base=JSON.parse(readFileSync(dir+'/base.json','utf8'))
 const current=await inventory();assert.deepEqual(current.endpoints.map(x=>x.id).sort(),endpoints.toSorted())
 const results=[]
 for(const ep of current.endpoints){
   const before=base.endpoints.find(x=>x.id===ep.id);assert.equal(ep.branch_id,before.branch_id)
   const result=await neon('/endpoints/'+ep.id,'PATCH',{endpoint:{autoscaling_limit_min_cu:0.25,autoscaling_limit_max_cu:2}})
   results.push({endpoint:ep.id,operations:result.operations?.map(x=>pick(x,['id','action','status']))})
   save('aplicacion-parcial',results)
 }
 await neon('','PATCH',{project:{default_endpoint_settings:{autoscaling_limit_min_cu:0.25,autoscaling_limit_max_cu:2,suspend_timeout_seconds:0}}})
 const after=await inventory();save('capacidad-aplicada',after)
 assert(after.endpoints.every(x=>x.autoscaling_limit_min_cu===0.25&&x.autoscaling_limit_max_cu===2&&x.suspend_timeout_seconds===0))
 assert.equal(after.proyecto.default_endpoint_settings.autoscaling_limit_min_cu,0.25)
 console.log(JSON.stringify(after,null,2))
}else if(mode==='estado'){const current=await inventory();save('capacidad-actual',current);console.log(JSON.stringify(current,null,2))}
else throw Error('Modo no reconocido')
