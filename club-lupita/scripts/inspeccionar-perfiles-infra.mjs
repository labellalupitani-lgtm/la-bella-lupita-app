// Solo lectura. No imprime bindings ni credenciales; guarda metadatos de reversión.
import { readFileSync, writeFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
const env = Object.assign({}, ...['.env.deploy','.dev.vars','.infra.local'].map(f => parseEnv(readFileSync(f,'utf8'))))
async function get(url, token) {
  const r = await fetch(url, {headers:{Authorization:'Bearer '+token}})
  if (!r.ok) throw Error('Inspección remota: HTTP '+r.status)
  return r.json()
}
const cf = 'https://api.cloudflare.com/client/v4/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/scripts/club-lupita'
const [settings, deployments, schedules, endpoints] = await Promise.all([
  get(cf+'/settings',env.CLOUDFLARE_API_TOKEN),get(cf+'/deployments',env.CLOUDFLARE_API_TOKEN),
  get(cf+'/schedules',env.CLOUDFLARE_API_TOKEN),
  get('https://console.neon.tech/api/v2/projects/'+env.NEON_PROJECT_ID+'/endpoints',env.NEON_API_KEY),
])
if (![settings,deployments,schedules].every(x => x.success)) throw Error('Inspección incompleta')
const real = endpoints.endpoints.find(e=>e.host===new URL(env.DATABASE_URL).hostname.replace('-pooler',''))
const demo = JSON.parse(readFileSync('.demo.local','utf8'))
if (!real || real.branch_id===demo.branch) throw Error('Aislamiento no verificado')
const result = {
  fecha:new Date().toISOString(),worker:'club-lupita',
  compatibility_date:settings.result.compatibility_date,
  bindings:settings.result.bindings.map(b=>({name:b.name,type:b.type})),
  deployments:deployments.result,schedules:schedules.result,
  neon:{project:env.NEON_PROJECT_ID,real:real.branch_id,demo:demo.branch,aisladas:true},
}
writeFileSync('entregables/correcciones-perfiles-2026-10-07/evidencia/infra-antes.json',JSON.stringify(result,null,2))
console.log(JSON.stringify(result,null,2))
