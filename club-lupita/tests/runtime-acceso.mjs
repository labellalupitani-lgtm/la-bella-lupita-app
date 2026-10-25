import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve,join} from 'node:path'
import {unstable_dev} from 'wrangler'
import {TOTP} from 'otpauth'
const file='.acceso-equipo-release.local',state=JSON.parse(readFileSync(file,'utf8'))
assert.ok(state.ensayoAPI&&!state.stageDeleted&&state.stage.parent===state.backups.real.id)
const dir=resolve('.test-output/runtime-acceso');mkdirSync(dir,{recursive:true})
const config={name:'lupita-ensayo-acceso',main:resolve('src/worker/index.ts'),compatibility_date:'2025-08-01',compatibility_flags:['nodejs_compat'],assets:{directory:resolve('dist'),binding:'ASSETS',run_worker_first:['/api/*'],not_found_handling:'single-page-application'}}
writeFileSync(join(dir,'wrangler.json'),JSON.stringify(config))
const {usuario,clave,secret,id,...bindings}=state.runtimeFixture
writeFileSync(join(dir,'.dev.vars'),Object.entries(bindings).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n'))
const worker=await unstable_dev(config.main,{config:join(dir,'wrangler.json'),local:true,port:0,persist:false,logLevel:'error',experimental:{disableExperimentalWarning:true,disableDevRegistry:true,showInteractiveDevSession:false,watch:false}})
const origen='http://'+worker.address+':'+worker.port,resultados=[]
function authFrom(headers){const cookies=headers.getSetCookie().map(x=>x.split(';')[0]);return cookies.length?{cookie:cookies.join('; '),csrf:decodeURIComponent(cookies.find(x=>x.startsWith('__Host-lupita-equipo-csrf='))?.split('=')[1]??'')}:null}
async function call(path,body,auth){const r=await fetch(origen+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',origin:origen,'x-equipo-solicitud':'1',...(auth?{cookie:auth.cookie,'x-equipo-csrf':auth.csrf}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return{status:r.status,body:await r.json(),auth:authFrom(r.headers)}}
const check=(r,n=200)=>{assert.equal(r.status,n,JSON.stringify(r.body));return r}
try{
  for(const [path,status] of [['/',200],['/personal',200],['/api/health',200],['/api/yo',401],['/api/ocupacion?dia=2026-02-31',422]]){const r=await fetch(origen+path);assert.equal(r.status,status);assert.ok(r.headers.get('content-security-policy'));assert.equal(r.headers.get('x-frame-options'),'DENY');resultados.push(path+' '+status)}
  const legacy=await fetch(origen+'/legado.html',{redirect:'manual'});assert.equal(legacy.status,302);assert.match(legacy.headers.get('location'),/\/personal$/)
  const login=check(await call('/api/auth/equipo/entrar',{usuario,clave}));assert.equal(login.body.fase,'mfa')
  const owner=check(await call('/api/personal/mfa/verificar',{codigo:new TOTP({secret}).generate()},login.auth)).auth
  const nombre='runtime.'+crypto.randomUUID().slice(0,8),n=check(await call('/api/personal/equipo',{nombre:'Ensayo runtime',usuario:nombre,permiso:'encargado'},owner))
  const activar=check(await call('/api/auth/equipo/activar',{usuario:nombre,invitacion:n.body.invitacion,nueva:clave,confirmacion:clave}));assert.equal(activar.body.fase,'configurar')
  const qr=check(await call('/api/personal/mfa/preparar',{},activar.auth));assert.match(qr.body.qr,/^data:image\/svg\+xml;base64,/)
  const mfa=check(await call('/api/personal/mfa/confirmar',{codigo:new TOTP({secret:qr.body.secreto}).generate()},activar.auth));assert.equal(mfa.body.codigos.length,8)
  check(await call('/api/operacion/resumen',undefined,mfa.auth));check(await call('/api/personal/salir',{},mfa.auth));check(await call('/api/personal/yo',undefined,mfa.auth),401)
  resultados.push('Cookies, contraseña, invitación, QR SVG, TOTP, recuperación y revocación en runtime Workers')
  state.runtimeOK=true;state.runtimeAt=new Date().toISOString();writeFileSync(file,JSON.stringify(state,null,2));console.log('PASA runtime Workers: '+resultados.join(' | '))
}finally{await worker.stop();writeFileSync('entregables/acceso-equipo-2026-10-07/evidencia/runtime.json',JSON.stringify({fecha:new Date().toISOString(),rama:state.stage.id,aprobado:!!state.runtimeOK,resultados},null,2))}
