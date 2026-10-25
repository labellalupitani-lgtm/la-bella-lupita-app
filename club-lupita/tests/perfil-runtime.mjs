// workerd ejecuta el Worker real; un puente HTTP limita la base al PGlite sintético de este proceso.
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve,join} from 'node:path'
import {build} from 'esbuild'
import {unstable_dev} from 'wrangler'
import {preparar} from './soporte-perfiles-equipo.mjs'
const dir=resolve('.test-output/perfil-runtime');mkdirSync(dir,{recursive:true})
const t=await preparar({propietario:false}),resultados=[]
const bridge=createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const v=JSON.parse(Buffer.concat(chunks));let resultado;if(v.transaccion){resultado=await t.db.transaction(async tx=>{const r=[];for(const q of v.transaccion)r.push((await tx.query(q.q,q.p)).rows);return r})}else resultado=await t.db.query(v.q,v.p);res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(resultado))}catch{res.writeHead(500);res.end(JSON.stringify({error:'Fallo del puente sintético'}))}})
await new Promise(r=>bridge.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+bridge.address().port
const driver=join(dir,'driver.ts');writeFileSync(driver,`export const neonConfig={};async function consulta(url,v){const r=await fetch(url,{method:'POST',body:JSON.stringify(v)});if(!r.ok)throw Error('Puente sintético');return r.json()}export class Client{constructor(url){this.url=url}async connect(){}async end(){}query(q,p){return consulta(this.url,{q,p})}}export function neon(url){const sql=(parts,...p)=>{const q=parts.reduce((s,t,i)=>s+(i?'$'+i:'')+t,'');return{q,p,then:(a,b)=>consulta(url,{q,p}).then(r=>r.rows).then(a,b)}};sql.transaction=queries=>consulta(url,{transaccion:queries.map(({q,p})=>({q,p}))});return sql}`)
await build({entryPoints:['src/worker/index.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:join(dir,'worker.mjs'),alias:{'@neondatabase/serverless':driver},external:['qrcode']})
const source=JSON.parse(readFileSync('wrangler.jsonc','utf8')),config={name:'perfil-runtime-local',main:join(dir,'worker.mjs'),compatibility_date:source.compatibility_date,compatibility_flags:source.compatibility_flags,assets:{directory:resolve('dist'),binding:'ASSETS',run_worker_first:['/api/*'],not_found_handling:'single-page-application'}}
writeFileSync(join(dir,'wrangler.json'),JSON.stringify(config));writeFileSync(join(dir,'.dev.vars'),Object.entries({...t.env,DATABASE_URL:url}).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n'))
let worker
try{
 worker=await unstable_dev(config.main,{config:join(dir,'wrangler.json'),local:true,port:0,persist:false,logLevel:'error',experimental:{disableExperimentalWarning:true,disableDevRegistry:true,showInteractiveDevSession:false,watch:false}})
 const origin='http://'+worker.address+':'+worker.port
 async function call(path,body,auth={}){const r=await fetch(origin+path,{method:body?'POST':'GET',headers:{origin,'content-type':'application/json','x-cliente-solicitud':'1',...auth},...(body?{body:JSON.stringify(body)}:{})});return{status:r.status,body:await r.json(),headers:r.headers}}
 const m=await call('/api/auth/sesion/migrar',{}, {authorization:'Bearer '+t.token});assert.equal(m.status,200,JSON.stringify(m.body));const cookies=m.headers.getSetCookie().map(x=>x.split(';')[0]),auth={cookie:cookies.join('; '),'x-cliente-csrf':cookies.find(x=>x.startsWith('__Host-lupita-cliente-csrf=')).split('=')[1]}
 const r=await call('/api/perfil',undefined,auth);assert.equal(r.status,200);const p=r.body.perfil,editable=Object.fromEntries(['nombre','bebida_siempre','alergias','cumple','promociones_correo','version'].map(k=>[k,p[k]]));
 const a=await call('/api/perfil',{...editable,nombre:'Perfil desde workerd'},auth);assert.equal(a.status,200,JSON.stringify(a.body));assert.equal(a.body.perfil.version,p.version+1);assert.equal((await call('/api/perfil',{...editable,alergias:'Borrador viejo'},auth)).status,409)
 assert.equal((await call('/api/yo',undefined,auth)).body.socio.nombre,'Perfil desde workerd');assert.equal((await call('/api/sesion/salir-todas',{},auth)).status,200);assert.equal((await call('/api/perfil',undefined,auth)).status,401)
 const html=await fetch(origin+'/perfil');assert.equal(html.status,200);assert.ok((await html.text()).includes('/assets/principal-'));assert.ok(html.headers.get('content-security-policy'))
 resultados.push({caso:'Cookie, CSRF, perfil versionado, transacciones de cuenta agrupadas, revocación y assets con CSP en workerd',correcto:true});console.log('PASA runtime Workers con compatibilidad '+config.compatibility_date)
}finally{if(worker)await worker.stop();await new Promise(r=>bridge.close(r));await t.db.close();writeFileSync('entregables/mejoras-perfil-2026-10-09/evidencias/runtime.json',JSON.stringify({fecha:new Date().toISOString(),metodo:'workerd local y SQL real en PGlite sintético mediante puente HTTP aislado; no usa bases de producción',resultados},null,2))}
