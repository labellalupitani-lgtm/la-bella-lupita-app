// Migración y ensayo explícitos. Ningún modo crea identidades reales.
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync,statSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {randomBytes,randomUUID,createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {spawnSync} from 'node:child_process'
import assert from 'node:assert/strict'
import {Client,neonConfig} from '@neondatabase/serverless'
import {TOTP} from 'otpauth'
import {build} from 'esbuild'

const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const demo=JSON.parse(readFileSync('.demo.local','utf8')),config=JSON.parse(readFileSync('wrangler.jsonc','utf8'))
const file='.acceso-equipo-release.local',dir='entregables/acceso-equipo-2026-10-07/evidencia'
mkdirSync(dir,{recursive:true})
const state=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{project:env.NEON_PROJECT_ID,created:new Date().toISOString(),backups:{}}
assert.equal(state.project,env.NEON_PROJECT_ID);assert.equal(config.account_id,env.CLOUDFLARE_ACCOUNT_ID)
const save=()=>writeFileSync(file,JSON.stringify(state,null,2))
async function neonApi(path,body,method=body?'POST':'GET'){
  const r=await fetch('https://console.neon.tech/api/v2/projects/'+env.NEON_PROJECT_ID+path,{method,headers:{Authorization:'Bearer '+env.NEON_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
  if(!r.ok){const d=await r.json().catch(()=>({}));throw Error('Neon '+method+' '+path+' HTTP '+r.status+' '+String(d.message??d.code??'').replace(/postgres(?:ql)?:\/\/\S+/g,'[oculto]'))}
  return r.status===204?null:r.json()
}
async function versiones(){const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+config.account_id+'/workers/scripts/'+config.name+'/deployments',{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}});const v=await r.json();if(!r.ok||!v.success)throw Error('No se pudo leer versión publicada');return v.result.deployments[0].versions}
neonConfig.webSocketConstructor=globalThis.WebSocket
const endpoints=(await neonApi('/endpoints')).endpoints
const match=url=>endpoints.find(e=>e.host===new URL(url).hostname.replace('-pooler',''))
const real=match(env.DATABASE_URL),prueba=match(demo.DATABASE_URL)
assert.ok(real&&prueba);assert.notEqual(real.branch_id,prueba.branch_id);assert.equal(prueba.branch_id,demo.branch)
const actuales=await versiones()
if(process.argv.includes('--inventario'))console.log(JSON.stringify({versiones:actuales,ramas:(await neonApi('/branches')).branches.map(b=>({id:b.id,nombre:b.name,padre:b.parent_id,protegida:b.protected})),real:real.branch_id,demo:prueba.branch_id},null,2))
state.previousVersions??=actuales;save()
const guardiaVersion=()=>assert.deepEqual(actuales,state.previousVersions,'Cambió el despliegue: revisar antes de publicar')
function manifiesto(){const archivos=[];const visitar=p=>{if(statSync(p).isDirectory()){for(const f of readdirSync(p))visitar(p+'/'+f)}else archivos.push({archivo:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')})};for(const p of ['src','public','dist','db/020_acceso_equipo.sql','package.json','package-lock.json','wrangler.jsonc','vite.config.ts'])visitar(p);return archivos.sort((a,b)=>a.archivo.localeCompare(b.archivo))}
if(process.argv.includes('--congelar')){assert.ok(state.runtimeOK);state.manifiesto=manifiesto();save();writeFileSync(dir+'/manifiesto.json',JSON.stringify({fecha:new Date().toISOString(),archivos:state.manifiesto},null,2));console.log('Código y activos congelados: '+state.manifiesto.length+' archivos')}
const sql020=readFileSync('db/020_acceso_equipo.sql','utf8').replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,'')
async function migrar(url,label){
  const db=new Client(url);await db.connect()
  try{
    await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ');await db.query("SET LOCAL lock_timeout='10s'");await db.query("SET LOCAL statement_timeout='60s'");await db.query('LOCK TABLE empleado IN SHARE ROW EXCLUSIVE MODE')
    const snapshot=async()=>JSON.stringify((await db.query(`SELECT
      (SELECT md5(COALESCE(jsonb_agg(x ORDER BY id)::text,'')) FROM (SELECT id,nombre,usuario,permiso,activo,clave_huella,version_clave FROM empleado) x) empleados,
      (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM asiento a) libro,
      (SELECT md5(COALESCE(jsonb_agg(to_jsonb(d)||jsonb_build_object('id',s.id) ORDER BY s.id)::text,'')) FROM socio s CROSS JOIN LATERAL saldo_de(s.id) d) saldos,
      (SELECT md5(COALESCE(jsonb_agg(a ORDER BY id)::text,'')) FROM socio a) clientes
    `)).rows)
    const antes=await snapshot();await db.query(sql020);if(await snapshot()!==antes)throw Error('La migración alteró identidades, credenciales, libro, clientes o saldos')
    const pendientes=(await db.query('SELECT count(*)::int n FROM empleado WHERE requiere_cambio')).rows[0].n
    await db.query('COMMIT');console.log(label+': migración020 correcta, integridad conservada; cambios de contraseña pendientes: '+pendientes)
    return {integridad:true,cambiosPendientes:pendientes}
  }catch(e){await db.query('ROLLBACK').catch(()=>{});throw Error(label+': '+(e.code??e.message))}finally{await db.end()}
}
async function crearRespaldo(label,ep){if(!state.backups[label]){const b=await neonApi('/branches',{branch:{name:'respaldo-acceso-equipo-'+label+'-'+Date.now(),parent_id:ep.branch_id}});state.backups[label]={id:b.branch.id,parent:ep.branch_id};save()}console.log('Respaldo '+label+': '+state.backups[label].id)}
if(process.argv.includes('--liberar-autorizado')){
  const id='br-super-dream-aydpwaoz',nombre='ensayo-auditoria-1790992577144'
  assert.notEqual(id,real.branch_id);assert.notEqual(id,prueba.branch_id)
  const ramas=(await neonApi('/branches')).branches,b=ramas.find(b=>b.id===id)
  if(b){assert.equal(b.name,nombre);assert.equal(b.parent_id,'br-young-leaf-ay6cx6vi');assert.ok(!ramas.some(x=>x.parent_id===id));await neonApi('/branches/'+id,undefined,'DELETE')}
  state.copiaAntiguaEliminada={id,nombre,autorizacion:'Usuario confirmó el 2026-10-08',fecha:new Date().toISOString()};save();console.log('Eliminada únicamente la copia temporal autorizada: '+nombre)
}
if(process.argv.includes('--preparar')){
  guardiaVersion();await crearRespaldo('real',real)
  if(!state.stage){const b=await neonApi('/branches',{branch:{name:'ensayo-acceso-equipo-'+Date.now(),parent_id:state.backups.real.id},endpoints:[{type:'read_write'}]});const u=new URL(env.DATABASE_URL);u.hostname=b.endpoints[0].host;state.stage={id:b.branch.id,parent:state.backups.real.id,url:u.toString()};save()}
  assert.notEqual(state.stage.id,real.branch_id);assert.notEqual(state.stage.id,prueba.branch_id)
  state.migracionEnsayo=await migrar(state.stage.url,'Copia real aislada');await migrar(state.stage.url,'Repetición idempotente');save()
}
if(process.argv.includes('--ensayar')){
  assert.ok(state.migracionEnsayo&&!state.stageDeleted);assert.equal(state.stage.parent,state.backups.real.id);assert.notEqual(state.stage.id,real.branch_id);assert.notEqual(state.stage.id,prueba.branch_id)
  await build({entryPoints:['src/worker/index.ts'],bundle:true,platform:'node',format:'esm',external:['qrcode'],outfile:'.test-output/acceso-neon.mjs'})
  const {app}=await import(pathToFileURL(resolve('.test-output/acceso-neon.mjs')))
  const fixture={DATABASE_URL:state.stage.url,SESION_SECRETO:env.SESION_SECRETO,PERSONAL_CREDENCIAL_SECRETO:env.SESION_SECRETO,PERSONAL_MFA_SECRETO:randomBytes(32).toString('hex'),CASA_SECRETO:randomBytes(32).toString('hex')}
  const db=new Client(state.stage.url);await db.connect();const resultados=[]
  const ctx={waitUntil(p){void p.catch(()=>{})},passThroughOnException(){}}
  const authFrom=headers=>{const cookies=headers.getSetCookie().map(x=>x.split(';')[0]);return cookies.length?{cookie:cookies.join('; '),csrf:decodeURIComponent(cookies.find(x=>x.startsWith('__Host-lupita-equipo-csrf='))?.split('=')[1]??'')}:null}
  const call=async(path,body,auth)=>{const r=await app.request('https://ensayo.local/api'+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',origin:'https://ensayo.local','x-equipo-solicitud':'1',...(auth?{cookie:auth.cookie,'x-equipo-csrf':auth.csrf}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})},fixture,ctx);return{status:r.status,body:await r.json(),auth:authFrom(r.headers)}}
  const check=(r,status=200)=>{assert.equal(r.status,status,JSON.stringify(r.body));return r}
  const mfa=async auth=>{const p=check(await call('/personal/mfa/preparar',{},auth));const r=check(await call('/personal/mfa/confirmar',{codigo:new TOTP({secret:p.body.secreto}).generate()},auth));return{auth:r.auth,secret:p.body.secreto,codigos:r.body.codigos}}
  const clave='Frase sintética de ensayo '+randomUUID(),usuario='ensayo.'+randomUUID().slice(0,8)
  try{
    // Únicamente la rama temporal: el bootstrap sintético no toca la clave real.
    await db.query('UPDATE seguridad_propietario SET clave_huella=NULL WHERE id=true')
    const primero=check(await call('/auth/equipo/iniciar-propietario',{usuario,nombre:'Propietario sintético',actual:fixture.CASA_SECRETO,nueva:clave,confirmacion:clave,compartido:false}))
    const owner=await mfa(primero.auth),yo=check(await call('/personal/yo',undefined,owner.auth)).body
    const crear=async(permiso)=>{const n=check(await call('/personal/equipo',{nombre:'Ensayo '+permiso,usuario:usuario+'.'+permiso,permiso},owner.auth));return{id:n.body.id,...n.body}}
    const inv=await crear('propietario'),payload={usuario:inv.usuario,invitacion:inv.invitacion,nueva:clave,confirmacion:clave,compartido:false}
    const carreras=await Promise.all([call('/auth/equipo/activar',payload),call('/auth/equipo/activar',payload)])
    assert.deepEqual(carreras.map(r=>r.status).sort(),[200,410]);const segundo=await mfa(carreras.find(r=>r.status===200).auth)
    resultados.push('Invitación concurrente consumida una sola vez; MFA real')
    const cambios=await Promise.all([call('/personal/equipo/'+yo.id+'/desactivar',{version:0},owner.auth),call('/personal/equipo/'+inv.id+'/desactivar',{version:1},segundo.auth)])
    assert.deepEqual(cambios.map(r=>r.status).sort(),[200,409]);const activos=(await db.query("SELECT id,usuario FROM empleado WHERE permiso='propietario' AND activo")).rows;assert.equal(activos.length,1)
    resultados.push('Dos propietarios se desactivan concurrentemente: permanece exactamente uno')
    const vigente=activos[0].id===yo.id?owner:segundo,vid=activos[0].id
    const cajaInv=check(await call('/personal/equipo',{nombre:'Caja sintética',usuario:usuario+'.caja',permiso:'caja'},vigente.auth)).body
    const caja=check(await call('/auth/equipo/activar',{usuario:cajaInv.usuario,invitacion:cajaInv.invitacion,nueva:clave,confirmacion:clave,compartido:true}))
    const cc=await Promise.all([call('/personal/clave',{actual:clave,nueva:clave+' nueva',confirmacion:clave+' nueva'},caja.auth),call('/personal/clave',{actual:clave,nueva:clave+' nueva',confirmacion:clave+' nueva'},caja.auth)])
    assert.deepEqual(cc.map(r=>r.status).sort(),[200,401]);check(await call('/personal/yo',undefined,caja.auth),401)
    resultados.push('Cambio de contraseña concurrente, revocación inmediata y versión atómica')
    const recuperaciones=await Promise.all([call('/auth/equipo/recuperar',{usuario:activos[0].usuario,codigo:vigente.codigos[0],nueva:clave+' recuperada',confirmacion:clave+' recuperada'}),call('/auth/equipo/recuperar',{usuario:activos[0].usuario,codigo:vigente.codigos[0],nueva:clave+' recuperada',confirmacion:clave+' recuperada'})])
    assert.deepEqual(recuperaciones.map(r=>r.status).sort(),[200,401]);check(await call('/personal/yo',undefined,vigente.auth),401)
    const recuperada=await mfa(recuperaciones.find(r=>r.status===200).auth)
    check(await call('/personal/salir',{},recuperada.auth));check(await call('/personal/yo',undefined,recuperada.auth),401)
    resultados.push('Recuperación concurrente de un uso y cierre persistente en servidor')
    state.ensayoAPI=true;state.ensayoResultados=resultados;state.runtimeFixture={...fixture,usuario:activos[0].usuario,clave:clave+' recuperada',secret:recuperada.secret,id:vid};save()
    writeFileSync(dir+'/neon.json',JSON.stringify({fecha:new Date().toISOString(),rama:state.stage.id,produccionModificada:false,resultados},null,2));console.log('PASA Neon: '+resultados.join(' | '))
  }finally{await db.end()}
}
if(process.argv.includes('--migrar')){
  guardiaVersion();assert.ok(state.migracionEnsayo&&state.ensayoAPI&&state.runtimeOK&&state.backups.real)
  assert.deepEqual(manifiesto(),state.manifiesto,'Cambió el artefacto verificado')
  if(!state.stageDeleted){assert.notEqual(state.stage.id,real.branch_id);assert.notEqual(state.stage.id,prueba.branch_id);const b=await neonApi('/branches/'+state.stage.id);assert.ok(b.branch.name.startsWith('ensayo-acceso-equipo-'));assert.equal(b.branch.parent_id,state.backups.real.id);await neonApi('/branches/'+state.stage.id,undefined,'DELETE');state.stageDeleted=true;delete state.runtimeFixture;save()}
  await crearRespaldo('demo',prueba)
  state.demoMigrada=await migrar(demo.DATABASE_URL,'Capacitación');save()
  state.realMigrada=await migrar(env.DATABASE_URL,'Operación real');state.migratedAt=new Date().toISOString();save()
}
if(process.argv.includes('--secretos')){
  guardiaVersion();assert.ok(state.realMigrada&&state.demoMigrada)
  state.mfaSecret??=randomBytes(48).toString('base64url');save()
  // El valor inicial conserva las huellas existentes; después se administra como secreto independiente.
  const f='.acceso-equipo-secrets.local';writeFileSync(f,JSON.stringify({PERSONAL_CREDENCIAL_SECRETO:env.SESION_SECRETO,PERSONAL_MFA_SECRETO:state.mfaSecret}))
  const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','bulk',f],{env:{...process.env,CLOUDFLARE_API_TOKEN:env.CLOUDFLARE_API_TOKEN,CLOUDFLARE_ACCOUNT_ID:env.CLOUDFLARE_ACCOUNT_ID},encoding:'utf8'})
  if(r.status!==0)throw Error('No se pudieron cargar los secretos de personal')
  state.secretosCargados=true;state.versionConSecretos=await versiones();save();console.log('Dos secretos configurados, sin exponer sus valores')
}
if(process.argv.includes('--publicar')){
  assert.ok(state.realMigrada&&state.demoMigrada&&state.secretosCargados&&state.runtimeOK)
  assert.deepEqual(await versiones(),state.versionConSecretos,'Hay otro despliegue posterior a los secretos');assert.deepEqual(manifiesto(),state.manifiesto,'Cambió el artefacto verificado')
  const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--keep-vars','--message','Accesos individuales del equipo, múltiples propietarios, MFA y sesiones revocables'],{env:{...process.env,CLOUDFLARE_API_TOKEN:env.CLOUDFLARE_API_TOKEN,CLOUDFLARE_ACCOUNT_ID:env.CLOUDFLARE_ACCOUNT_ID,WRANGLER_SEND_METRICS:'false'},encoding:'utf8'})
  writeFileSync(dir+'/deploy.log',r.stdout+'\n'+r.stderr)
  if(r.status!==0)throw Error('Falló la publicación; consultar deploy.log')
  state.deployed=await versiones();state.deployedAt=new Date().toISOString();save();console.log('Publicado: '+JSON.stringify(state.deployed))
}
if(process.argv.includes('--cerrar-ensayo')){
  assert.ok(state.stage&&state.deployed&&state.runtimeOK);assert.notEqual(state.stage.id,real.branch_id);assert.notEqual(state.stage.id,prueba.branch_id);assert.equal(state.stage.parent,state.backups.real.id)
  if(!state.stageDeleted){const detalle=await neonApi('/branches/'+state.stage.id);assert.ok(detalle.branch.name.startsWith('ensayo-acceso-equipo-'));await neonApi('/branches/'+state.stage.id,undefined,'DELETE');state.stageDeleted=true;delete state.runtimeFixture;save()}
  writeFileSync(dir+'/publicacion.json',JSON.stringify({fecha:state.deployedAt,anterior:state.previousVersions,publicada:state.deployed,respaldos:state.backups,migracionReal:state.realMigrada,migracionDemo:state.demoMigrada,ensayoEliminado:state.stageDeleted},null,2));console.log('Ensayo eliminado; respaldos conservados')
}
