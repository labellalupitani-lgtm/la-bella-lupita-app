import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {parseEnv} from 'node:util'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'

// Lecturas solamente; las operaciones transaccionales se prueban en PGlite.
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const base='https://app.labellalupita.com'
const checks=[]
const call=async(path,token,body)=>{
  const r=await fetch(base+'/api'+path,{method:body?'POST':'GET',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{}),...(body?{'x-casa':env.CASA_SECRETO}:{})},...(body?{body:JSON.stringify(body)}:{})})
  return {status:r.status,body:await r.json()}
}
assert.equal((await call('/operacion/resumen')).status,401)
assert.equal((await call('/operacion/listas/pedidos','sesion-invalida')).status,401)
checks.push('API sin sesión y sesión inválida: 401')
for(const demo of [true,false]){
  const auth=await call('/auth/casa',undefined,{demo});assert.equal(auth.status,200)
  const token=auth.body.token,yo=await call('/personal/yo',token)
  assert.equal(yo.status,200);assert.equal(yo.body.demo,demo);assert.equal(yo.body.permiso,'encargado')
  for(const tipo of ['pedidos','entregas','agenda','atencion','equipo','auditoria']){
    const r=await call('/operacion/listas/'+tipo,token)
    assert.equal(r.status,200,tipo);assert.ok(Array.isArray(r.body.filas));assert.ok(r.body.filas.length<=20);assert.ok(Number.isInteger(r.body.total))
  }
  assert.equal((await call('/operacion/resumen',token)).status,200)
  for(const dias of [1,7,30,90])assert.equal((await call('/operacion/metricas?dias='+dias,token)).status,200)
  assert.equal((await call('/operacion/listas/pedidos?pagina=-1',token)).status,422)
  checks.push((demo?'Demostración':'Operación real')+': identidad, seis listas, resumen, cuatro períodos y validación de filtros')
  console.log(checks.at(-1))
}
const hash=x=>createHash('sha256').update(x).digest('hex')
const assets=readdirSync('dist/assets').filter(f=>/^(Personal-|principal-).*(js|css)$/.test(f)).map(f=>'/assets/'+f)
for(const path of ['/index.html',...assets]){
  const r=await fetch(base+path);assert.equal(r.status,200,path)
  assert.equal(hash(Buffer.from(await r.arrayBuffer())),hash(readFileSync('dist'+path)),path+' debe coincidir con build')
}
checks.push('HTML y paquetes principal/personal idénticos al build verificado')
for(const path of ['/','/personal','/club'])assert.equal((await fetch(base+path)).status,200)
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
assert.equal(config.account_id,env.CLOUDFLARE_ACCOUNT_ID)
const cf=await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.account_id+'/workers/scripts/'+config.name+'/deployments',{headers:{authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}})
const state=await cf.json();assert.ok(state.success)
const result={verified:new Date().toISOString(),url:base+'/personal',versions:state.result.deployments[0].versions,checks,businessDataMutated:false,schemaChanged:false}
writeFileSync('entregables/panel-operativo-2026-10-06/verificacion-publicada.json',JSON.stringify(result,null,2))
console.log('PASA publicación: '+checks.length+' grupos de comprobaciones; sin operaciones sobre datos del negocio.')
