import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {parseEnv} from 'node:util'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'

const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const release=JSON.parse(readFileSync('.seguridad-release.local','utf8'))
assert.ok(release.realMigrated&&release.demoMigrated&&release.ensayoAPI)
const base='https://app.labellalupita.com',checks=[]
const call=async(path,token,body)=>{
  const r=await fetch(base+'/api'+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})})
  return {status:r.status,body:await r.json()}
}
assert.equal((await call('/personal/yo')).status,401)
assert.equal((await call('/personal/clave',undefined,{})).status,401)
checks.push('Los endpoints de identidad y cambio requieren sesión')
for(const demo of [true,false]){
  const auth=await call('/auth/casa',undefined,{demo,clave:env.CASA_SECRETO});assert.equal(auth.status,200)
  const token=auth.body.token,yo=await call('/personal/yo',token)
  assert.equal(yo.status,200);assert.equal(yo.body.demo,demo);assert.equal(yo.body.id,'propietario')
  assert.equal(yo.body.requiereCambio,false);assert.ok('claveCambiada' in yo.body)
  for(const tipo of ['pedidos','entregas','agenda','atencion','equipo','auditoria']){
    const r=await call('/operacion/listas/'+tipo,token);assert.equal(r.status,200,tipo)
    assert.ok(Array.isArray(r.body.filas));assert.ok(r.body.filas.length<=20)
    if(tipo==='equipo')for(const e of r.body.filas){assert.ok(Number.isInteger(e.version_clave));assert.equal(typeof e.requiere_cambio,'boolean');assert.ok(!('clave_huella' in e))}
  }
  assert.equal((await call('/operacion/resumen',token)).status,200)
  assert.equal((await call('/operacion/metricas?dias=30',token)).status,200)
  // Cuerpo vacío: se valida el bloqueo/contrato sin enviar ni cambiar una clave.
  assert.equal((await call('/personal/clave',token,{})).status,demo?403:422)
  checks.push((demo?'Demostración':'Operación real')+': acceso original vigente, identidad, seis listas, resumen, informes y validación de cambio de clave')
}
const hash=x=>createHash('sha256').update(x).digest('hex')
const assets=readdirSync('dist/assets').filter(f=>/^(Personal-|principal-).*(js|css)$/.test(f)).map(f=>'/assets/'+f)
for(const path of ['/index.html',...assets]){
  const r=await fetch(base+path);assert.equal(r.status,200,path)
  assert.equal(hash(Buffer.from(await r.arrayBuffer())),hash(readFileSync('dist'+path)),path)
}
for(const path of ['/','/personal?seccion=seguridad','/club'])assert.equal((await fetch(base+path)).status,200)
checks.push('HTML y paquetes Personal/principal coinciden exactamente con el build verificado; rutas públicas disponibles')
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
const cf=await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.account_id+'/workers/scripts/'+config.name+'/deployments',{headers:{authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}})
const current=await cf.json();assert.ok(current.success)
assert.notDeepEqual(current.result.deployments[0].versions,release.previousVersions)
const result={verified:new Date().toISOString(),url:base+'/personal?seccion=seguridad',versions:current.result.deployments[0].versions,checks,migration:'017_seguridad_personal',backups:release.backups,isolatedNeonRehearsal:release.ensayoAPI,localSuites:9,businessDataMutated:false,existingCredentialsChanged:false}
writeFileSync('entregables/seguridad-2026-10-06/verificacion-publicada.json',JSON.stringify(result,null,2))
console.log('PASA publicación: '+checks.length+' grupos; sin cambiar claves existentes ni datos del negocio.')
