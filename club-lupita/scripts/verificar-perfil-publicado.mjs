import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {parseEnv} from 'node:util'
const dir='entregables/mejoras-perfil-2026-10-09',base='https://app.labellalupita.com',salida=[]
const hash=b=>createHash('sha256').update(b).digest('hex')
const pub=JSON.parse(readFileSync(dir+'/publicacion.json','utf8'))
const local=readFileSync('dist/index.html');const r=await fetch(base+'/perfil',{cache:'no-store'});assert.equal(r.status,200);assert.equal(hash(Buffer.from(await r.arrayBuffer())),hash(local));salida.push({ruta:'/perfil',estado:200,hash:hash(local),coincide:true})
const archivos=readdirSync('dist/assets').filter(f=>/\.(js|css)$/.test(f))
for(let i=0;i<archivos.length;i+=5)await Promise.all(archivos.slice(i,i+5).map(async file=>{const ruta='/assets/'+file,r=await fetch(base+ruta,{cache:'no-store'});assert.equal(r.status,200,ruta);const esperado=hash(readFileSync('dist'+ruta)),actual=hash(Buffer.from(await r.arrayBuffer()));assert.equal(actual,esperado,ruta);salida.push({ruta,estado:200,hash:actual,coincide:true})}))
for(const [ruta,estado] of [['/api/health',200],['/api/perfil',401],['/api/yo',401],['/api/actividad?tipo=todos',401],['/api/atencion',401]]){const r=await fetch(base+ruta,{headers:{'x-cliente-solicitud':'1'},cache:'no-store'});assert.equal(r.status,estado);assert.equal(r.headers.get('cache-control'),'no-store');assert.ok(r.headers.get('content-security-policy'));assert.ok(r.headers.get('strict-transport-security'));salida.push({ruta,estado,privadoSinCache:true,cabeceras:true})}
const env=parseEnv(readFileSync('.env.deploy','utf8')),config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
async function cf(path){const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.account_id+'/workers/scripts/'+config.name+path,{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}});const v=await r.json();assert.ok(r.ok&&v.success,'Lectura de configuración pública del Worker');return v.result}
const deployment=(await cf('/deployments')).deployments[0].versions;assert.deepEqual(deployment,pub.publicada)
const settings=await cf('/settings');assert.equal(settings.compatibility_date,config.compatibility_date)
const bindings=settings.bindings.map(x=>({nombre:x.name,tipo:x.type}));for(const nombre of ['DATABASE_URL','DEMO_DATABASE_URL','SESION_SECRETO','CASA_SECRETO','PERSONAL_CREDENCIAL_SECRETO','PERSONAL_MFA_SECRETO'])assert.ok(bindings.some(x=>x.nombre===nombre&&x.tipo==='secret_text'))
writeFileSync(dir+'/evidencias/publicacion-verificada.json',JSON.stringify({fecha:new Date().toISOString(),deployment,compatibilidad:settings.compatibility_date,bindings,checks:salida},null,2));console.log('PASA versión pública: HTML, '+archivos.length+' activos JS/CSS idénticos, cinco endpoints y configuración preservada. '+deployment[0].version_id)
