import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { neon } from '@neondatabase/serverless'
const env = { ...parseEnv(readFileSync('.env.deploy','utf8')), ...parseEnv(readFileSync('.dev.vars','utf8')), ...parseEnv(readFileSync('.infra.local','utf8')) }
const demo = JSON.parse(readFileSync('.demo.local','utf8'))
function safe(value) {
  let s = String(value ?? '')
  for (const secret of Object.values(env).concat(demo.DATABASE_URL).filter(v => typeof v === 'string' && v.length > 6)) s = s.replaceAll(secret, '[oculto]')
  return s.replace(/postgres(?:ql)?:\/\/\S+/g, '[conexión oculta]').slice(0, 600)
}
const result = { fecha: new Date().toISOString(), consultas: [], infraestructura: [] }
for (const [entorno,url] of [['real',env.DATABASE_URL],['demo',demo.DATABASE_URL]]) {
  try { const rows = await neon(url)('SELECT 1 AS disponible'); result.consultas.push({entorno,disponible:rows[0]?.disponible===1}) }
  catch (e) { result.consultas.push({entorno,disponible:false,tipo:e.name,codigo:safe(e.code),mensaje:safe(e.message)}) }
}
for (const path of ['', '/endpoints']) {
  const r = await fetch('https://console.neon.tech/api/v2/projects/'+env.NEON_PROJECT_ID+path,{headers:{Authorization:'Bearer '+env.NEON_API_KEY}})
  const data = await r.json()
  if (!r.ok) result.infraestructura.push({ruta:path,status:r.status,error:safe(data.message??data.code)})
  else if (path === '') result.infraestructura.push({ruta:path,status:r.status,proyecto:{id:data.project?.id,nombre:data.project?.name,region:data.project?.region_id,owner_id:data.project?.owner_id,org_id:data.project?.org_id,consumption_period_start:data.project?.consumption_period_start,consumption_period_end:data.project?.consumption_period_end,synthetic_storage_size:data.project?.synthetic_storage_size,compute_time_seconds:data.project?.compute_time_seconds,active_time_seconds:data.project?.active_time_seconds,quota:data.project?.quota,settings:data.project?.settings}})
  else result.infraestructura.push({ruta:path,status:r.status,endpoints:data.endpoints?.map(e=>({id:e.id,branch_id:e.branch_id,current_state:e.current_state,pending_state:e.pending_state,disabled:e.disabled,suspended_at:e.suspended_at,last_active:e.last_active,compute_provisioner:e.compute_provisioner,suspend_timeout_seconds:e.suspend_timeout_seconds,autoscaling_limit_min_cu:e.autoscaling_limit_min_cu,autoscaling_limit_max_cu:e.autoscaling_limit_max_cu}))})
}
mkdirSync('entregables/error-cuenta-2026-10-22',{recursive:true})
writeFileSync('entregables/error-cuenta-2026-10-22/base.json',JSON.stringify(result,null,2))
console.log(JSON.stringify(result,null,2))
