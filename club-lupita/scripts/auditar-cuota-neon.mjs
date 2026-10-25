// Lectura del plano de gestión: no ejecuta SQL, no despierta bases ni cambia configuración.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { parseEnv } from 'node:util'
const env = {...parseEnv(readFileSync('.env.deploy','utf8')), ...parseEnv(readFileSync('.dev.vars','utf8')), ...parseEnv(readFileSync('.infra.local','utf8'))}
const dir='entregables/auditoria-cuota-2026-10-22'; mkdirSync(dir,{recursive:true})
const save=(file,data)=>writeFileSync(dir+'/'+file+'.json',JSON.stringify(data,null,2))
const pick=(x,keys)=>Object.fromEntries(keys.filter(k=>x[k]!==undefined).map(k=>[k,x[k]]))
async function api(path){const r=await fetch('https://console.neon.tech/api/v2'+path,{headers:{Authorization:'Bearer '+env.NEON_API_KEY},signal:AbortSignal.timeout(30000)});return {status:r.status,data:await r.json()}}
const base='/projects/'+env.NEON_PROJECT_ID
const mode=process.argv[2]??'neon'
if(mode==='schema'){
 const spec=await (await fetch('https://neon.com/api_spec/release/v2.json')).json()
 save('schema-neon',spec)
 console.log(JSON.stringify(Object.entries(spec.paths).filter(([p])=>/consumption|operations|metric/.test(p)).map(([p,v])=>({path:p,methods:Object.entries(v).filter(([k])=>k==='get').map(([k,x])=>({id:x.operationId,parameters:x.parameters}))})),null,2))
 const props=spec.components.schemas.Endpoint?.properties
 console.log(JSON.stringify({suspend:props?.suspend_timeout_seconds},null,2))
} else if(mode==='neon'){
 const got=await Promise.all([api(base),api(base+'/endpoints'),api(base+'/branches?limit=100')])
 const p=got[0].data.project,eps=got[1].data.endpoints??[],branches=got[2].data.branches??[]
 const demo=JSON.parse(readFileSync('.demo.local','utf8'))
 const host=url=>new URL(url).hostname.replace('-pooler','')
 const meta={fecha:new Date().toISOString(),proyecto:{...pick(p,['id','name','created_at','updated_at','compute_time_seconds','active_time_seconds','cpu_used_sec','data_transfer_bytes','written_data_bytes','data_storage_bytes_hour','default_endpoint_settings','consumption_period_start','consumption_period_end','branch_logical_size_limit_bytes']),plan:p.owner?.subscription_type,quota:p.settings?.quota},endpoints:eps.map(e=>({...pick(e,['id','branch_id','type','created_at','updated_at','current_state','disabled','suspended_at','last_active','suspend_timeout_seconds','autoscaling_limit_min_cu','autoscaling_limit_max_cu']),entorno:e.host===host(env.DATABASE_URL)?'real':e.host===host(demo.DATABASE_URL)?'demo':'otro'})),ramas:branches.map(b=>pick(b,['id','name','parent_id','created_at','updated_at','current_state','logical_size','physical_size','cpu_used_sec','compute_time_seconds','active_time_seconds','default','protected']))}
 save('inventario',meta);console.log(JSON.stringify(meta,null,2))
 let cursor,operations=[],pages=0
 do{
   const q=new URLSearchParams({limit:'1000',...(cursor?{cursor}:{})});const r=await api(base+'/operations?'+q)
   if(r.status!==200)throw Error('Operaciones HTTP '+r.status)
   const batch=(r.data.operations??[]).map(o=>pick(o,['id','branch_id','endpoint_id','action','status','created_at','updated_at','total_duration_ms','execution_duration_ms','suspend','reason','type']))
   operations.push(...batch);pages++;cursor=r.data.pagination?.cursor
   console.log(JSON.stringify({pagina:pages,cantidad:batch.length,primera:batch[0]?.created_at,ultima:batch.at(-1)?.created_at,cursor:!!cursor,keys:Object.keys(r.data.operations?.[0]??{})}))
   if(!batch.length || batch.every(x=>x.created_at<'2026-10-01'))break
 }while(cursor&&pages<20)
 save('operaciones',{fecha:new Date().toISOString(),pages,operations})
 const q=new URLSearchParams({project_ids:env.NEON_PROJECT_ID,org_id:p.org_id,from:'2026-10-01T00:00:00Z',to:new Date().toISOString(),granularity:'daily',metrics:'compute_unit_seconds'})
 const hist=await api('/consumption_history/v2/projects?'+q);save('historial-consumo',hist);console.log(JSON.stringify({historialStatus:hist.status,historial:hist.status===200?'guardado':hist.data}))
} else if(mode==='cloudflare-schema'){
 const gql=async query=>(await (await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query})})).json())
 const first=await gql('{__schema{types{name}}}')
 const names=first.data?.__schema?.types?.map(x=>x.name).filter(x=>/WorkersInvocationsAdaptive/.test(x))??[]
 console.log(JSON.stringify({names,errors:first.errors}))
 const data=await gql('{'+names.filter(x=>/Dimensions|Sum|Filter_InputObject|Quantiles/.test(x)).map((name,i)=>`t${i}:__type(name:"${name}"){name fields{name type{name kind ofType{name kind}}} inputFields{name type{name kind ofType{name kind}}}}`).join(' ')+'}')
 save('cloudflare-schema',data);console.log(JSON.stringify(Object.values(data.data??{}).map(t=>({tipo:t.name,campos:t.fields?.map(f=>f.name)}))))
} else if(mode==='cloudflare'||mode==='cloudflare-minutos'){
 const minute=mode==='cloudflare-minutos',timeField=minute?'datetimeMinute':'datetimeHour'
 const query=`query($account: string) { viewer { accounts(filter:{accountTag:$account}) { workersInvocationsAdaptive(limit:10000, filter:{scriptName:"club-lupita",datetime_geq:"2026-10-01T00:00:00Z",datetime_lt:"2026-10-23T03:00:00Z"}, orderBy:[${timeField}_ASC]) { dimensions { ${timeField} status ${minute?'scriptVersion isPreview':''} } sum { requests errors subrequests ${minute?'wallTime cpuTimeUs duration requestDuration':''} } } } } }`
 const r=await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query,variables:{account:env.CLOUDFLARE_ACCOUNT_ID}})})
 const data=await r.json();save(minute?'cloudflare-minutos':'cloudflare-horas',{status:r.status,...data});console.log(JSON.stringify({status:r.status,errors:data.errors,filas:data.data?.viewer?.accounts?.[0]?.workersInvocationsAdaptive?.length}))
}
