import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {createHash} from 'node:crypto'
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))},state=JSON.parse(readFileSync('.acceso-equipo-release.local','utf8')),base='https://app.labellalupita.com',resultados=[]
for(const [ruta,estado] of [['/personal',200],['/',200],['/api/health',200],['/api/catalogo',200],['/api/personal/yo',401],['/api/operacion/resumen',401],['/api/auth/equipo/estado',200],['/api/auth/equipo/estado?entorno=capacitacion',200],['/api/panel',410],['/legado.html',302]]){
  const r=await fetch(base+ruta,{headers:{'x-equipo-solicitud':'1',origin:base},redirect:'manual'});assert.equal(r.status,estado,ruta)
  if(ruta==='/legado.html')assert.match(r.headers.get('location'),/\/personal$/)
  else{assert.ok(r.headers.get('content-security-policy'));assert.equal(r.headers.get('x-frame-options'),'DENY')}
  const dato=ruta.includes('/estado')?await r.json():undefined
  resultados.push({ruta,estado,configurado:dato?.configurado,demo:dato?.demo})
}
for(const ruta of ['/api/auth/casa','/api/auth/personal']){const r=await fetch(base+ruta,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(r.status,410);resultados.push({ruta,estado:410})}
for(const f of readdirSync('dist/assets').filter(f=>/^(Personal-|principal-).+\.(js|css)$/.test(f))){const r=await fetch(base+'/assets/'+f);assert.equal(r.status,200);assert.equal(createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),createHash('sha256').update(readFileSync('dist/assets/'+f)).digest('hex'));resultados.push({activo:f,sha256:true})}
async function cf(path){const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/scripts/club-lupita'+path,{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}});const j=await r.json();assert.ok(j.success);return j.result}
const [d,s,b]=await Promise.all([cf('/deployments'),cf('/schedules'),cf('/settings')]);assert.deepEqual(d.deployments[0].versions,state.deployed)
const cron=Array.isArray(s)?s:s.schedules;assert.ok(cron.some(x=>x.cron==='17 * * * *'))
const bindings=b.bindings.map(x=>({nombre:x.name,tipo:x.type}));for(const nombre of ['DATABASE_URL','DEMO_DATABASE_URL','SESION_SECRETO','CASA_SECRETO','PERSONAL_CREDENCIAL_SECRETO','PERSONAL_MFA_SECRETO'])assert.ok(bindings.some(x=>x.nombre===nombre&&x.tipo==='secret_text'))
writeFileSync('entregables/acceso-equipo-2026-10-07/evidencia/verificacion-publica.json',JSON.stringify({fecha:new Date().toISOString(),version:state.deployed,resultados,cron,bindings},null,2));console.log('PASA publicación: '+resultados.length+' comprobaciones; versión, activos, bases y secretos configurados, cron conservado')
