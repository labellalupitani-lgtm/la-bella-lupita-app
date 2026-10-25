import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {randomUUID,createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {Client,neonConfig} from '@neondatabase/serverless'
import {respaldar} from './respaldo-clientes.mjs'
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const file='.clientes-release.local',s=JSON.parse(readFileSync(file,'utf8')),demo=JSON.parse(readFileSync('.demo.local','utf8'))
assert.equal(s.project,env.NEON_PROJECT_ID)
const save=()=>writeFileSync(file,JSON.stringify(s,null,2))
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
neonConfig.webSocketConstructor=globalThis.WebSocket
async function api(path,body,method=body?'POST':'GET'){
 const r=await fetch('https://console.neon.tech/api/v2/projects/'+s.project+path,{method,headers:{Authorization:'Bearer '+env.NEON_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})})
 const d=r.status===204?{}:await r.json();if(!r.ok)throw Error('Neon '+r.status+': '+(d.message??d.code));return d
}
async function version(){const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/scripts/club-lupita/deployments',{headers:{Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN}});const d=await r.json();assert.ok(d.success);return d.result.deployments[0].versions}
const endpoints=(await api('/endpoints')).endpoints
const branch=url=>endpoints.find(e=>e.host===new URL(url).hostname.replace('-pooler',''))?.branch_id
assert.equal(branch(env.DATABASE_URL),s.real);assert.equal(branch(demo.DATABASE_URL),s.demo);assert.notEqual(s.real,s.demo)
const snapshotId=s.snapshots.real.snapshot.id
const snapshot=(await api('/snapshots')).snapshots.find(r=>r.id===snapshotId)
assert.ok(snapshot?.full_size>0);assert.equal(snapshot.source_branch_id,s.real)
if(process.argv.includes('--preparar')){
 s.previousVersions??=await version();save()
 if(!s.oldBackupDeleted){
   assert.ok(s.backupAnterior.restored&&existsSync(s.backupAnterior.file));assert.equal(digest(JSON.parse(readFileSync(s.backupAnterior.file,'utf8'))),s.backupAnterior.sha256)
   const old=JSON.parse(readFileSync('.seguridad-release.local','utf8')).backups.real
   assert.equal(old.id,s.oldBackup.id);assert.equal(old.parent,s.real);assert.notEqual(old.id,s.real);assert.notEqual(old.id,s.demo)
   const b=(await api('/branches/'+old.id)).branch;assert.ok(b.name.startsWith('respaldo-seguridad-real-'));assert.equal(b.parent_id,s.real)
   assert.ok(!(await api('/branches')).branches.some(b=>b.parent_id===old.id))
   await api('/branches/'+old.id,undefined,'DELETE');s.oldBackupDeleted=true;save()
   console.log('Rama de respaldo anterior sustituida por exportación privada restaurada y snapshot actual')
 }
 if(!s.stage){
   const b=await api('/branches',{branch:{name:'ensayo-clientes-equipo-'+Date.now(),parent_id:s.real},endpoints:[{type:'read_write'}]})
   const u=new URL(env.DATABASE_URL);u.hostname=b.endpoints[0].host;s.stage={id:b.branch.id,parent:s.real,url:u.toString()};save()
 }
 console.log('Ensayo aislado disponible:',s.stage.id)
}
async function migrar(url,archivo,label){
 const c=new Client(url);await c.connect()
 try{
   await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ')
   await c.query("SET LOCAL lock_timeout='15s'; SET LOCAL statement_timeout='60s'; SET LOCAL timezone='UTC'")
   await c.query('LOCK TABLE socio,asiento,sello,punto,membresia,reserva,compra_bolsa,asiento_experiencia,reserva_cosecha,empleado,seguridad_propietario IN SHARE ROW EXCLUSIVE MODE')
   const integridad=async()=>({
     libro:(await c.query('SELECT to_jsonb(r) AS dato FROM asiento r ORDER BY id')).rows,
     sellos:(await c.query('SELECT to_jsonb(r) AS dato FROM sello r ORDER BY id')).rows,
     puntos:(await c.query('SELECT to_jsonb(r) AS dato FROM punto r ORDER BY id')).rows,
     saldos:(await c.query('SELECT s.id,to_jsonb(d) AS saldo FROM socio s CROSS JOIN LATERAL saldo_de(s.id) d ORDER BY s.id')).rows,
     equipo:(await c.query('SELECT to_jsonb(r) AS dato FROM empleado r ORDER BY id')).rows,
     propietario:(await c.query('SELECT to_jsonb(r) AS dato FROM seguridad_propietario r')).rows,
   })
   const antes=await integridad()
   const sql=readFileSync('db/'+archivo+'.sql','utf8').replace(/^BEGIN;\s*$/m,'').replace(/^COMMIT;\s*$/m,'')
   const rawReales=archivo.startsWith('019')?(await c.query("SELECT to_jsonb(r) AS dato FROM socio r WHERE origen<>'muestra' ORDER BY id")).rows:null
   await c.query(sql)
   assert.equal(digest(await integridad()),digest(antes),'Libro, sellos, puntos, saldos y credenciales deben quedar intactos')
   if(rawReales)assert.equal(digest((await c.query("SELECT to_jsonb(r) AS dato FROM socio r WHERE origen<>'muestra' ORDER BY id")).rows),digest(rawReales))
   const [conteos]=(await c.query(`SELECT count(*)::int AS cuentas,count(*) FILTER(WHERE archivado_muestra IS NULL)::int AS operativas,count(*) FILTER(WHERE archivado_muestra IS NOT NULL)::int AS archivo,count(*) FILTER(WHERE origen='muestra')::int AS muestras FROM socio`)).rows
   if(archivo.startsWith('019')){assert.equal(conteos.archivo,82);assert.ok(conteos.operativas>=2)}else assert.equal(conteos.archivo,0)
   await c.query('COMMIT');console.log(label,archivo,conteos,'Integridad verificada');return {conteos,integridad:digest(antes),fecha:new Date().toISOString()}
 }catch(e){await c.query('ROLLBACK').catch(()=>{});throw Error(label+': '+e.message)}finally{await c.end()}
}
if(process.argv.includes('--ensayar')){
 assert.ok(s.stage&&!s.stageDeleted);assert.notEqual(s.stage.id,s.real);assert.notEqual(s.stage.id,s.demo)
 if(!s.ensayoEsquema){s.ensayoEsquema=await migrar(s.stage.url,'018_clientes_equipo','Ensayo');save()}
 if(!s.ensayoArchivo){s.ensayoArchivo=await migrar(s.stage.url,'019_archivar_muestras','Ensayo');save()}
 // Se cambia únicamente la credencial de la copia aislada para las pruebas.
 const c=new Client(s.stage.url);await c.connect();try{await c.query('UPDATE seguridad_propietario SET clave_huella=NULL,version_clave=0,clave_cambiada=NULL WHERE id=true')}finally{await c.end()}
 await build({entryPoints:['src/worker/index.ts'],bundle:true,platform:'node',format:'esm',outfile:'.test-output/worker-clientes-neon.mjs'})
 const {app}=await import('../.test-output/worker-clientes-neon.mjs')
 const fixture={DATABASE_URL:s.stage.url,CASA_SECRETO:randomUUID(),SESION_SECRETO:randomUUID(),ACCESO_PERSONAL:'false',ACCESO_CORREO:'true'}
 const ctx={waitUntil(p){void p.catch(()=>{})},passThroughOnException(){}}
 const call=async(path,body,token)=>{const r=await app.request('https://ensayo.local/api'+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})},fixture,ctx);return {status:r.status,body:await r.json()}}
 const login=await call('/auth/casa',{clave:fixture.CASA_SECRETO});assert.equal(login.status,200);const token=login.body.token
 const listado=await call('/operacion/clientes',undefined,token);assert.equal(listado.status,200);assert.equal(listado.body.muestras_archivadas,82);assert.ok(listado.body.total>=2)
 const archivo=await call('/operacion/clientes?archivo=muestras',undefined,token);assert.equal(archivo.status,200);assert.equal(archivo.body.total,82)
 const persona=archivo.body.filas[0].id
 assert.equal((await call('/operacion/clientes/'+persona,undefined,token)).status,200)
 assert.equal((await call('/operacion/clientes/'+persona+'/historial',undefined,token)).status,200)
 const usuario='ensayo.'+randomUUID().slice(0,8),empleado=await call('/personal/equipo',{nombre:'Ensayo aislado',usuario,permiso:'encargado'},token);assert.equal(empleado.status,200)
 const entrar=()=>call('/auth/personal',{usuario,clave:empleado.body.clave})
 const e=await entrar();assert.equal(e.status,200)
 assert.equal((await call('/operacion/clientes',undefined,e.body.token)).status,200)
 assert.equal((await call('/operacion/clientes?archivo=muestras',undefined,e.body.token)).status,403)
 assert.equal((await call('/personal/equipo',{nombre:'Denegado',usuario:'denegado',permiso:'encargado'},e.body.token)).status,403)
 const cambiar=(accion,version,permiso)=>call('/personal/equipo/'+empleado.body.id+'/'+accion,{version,permiso},token)
 const carrera=await Promise.all([cambiar('permiso',0,'cocina'),cambiar('permiso',0,'caja')]);assert.deepEqual(carrera.map(r=>r.status).sort(),[200,409])
 assert.equal((await call('/personal/yo',undefined,e.body.token)).status,401)
 const nuevo=await entrar();assert.equal(nuevo.status,200)
 assert.equal((await cambiar('desactivar',1)).status,200);assert.equal((await entrar()).status,401)
 assert.equal((await cambiar('reactivar',2)).status,200);assert.equal((await call('/personal/yo',undefined,nuevo.body.token)).status,401);assert.equal((await entrar()).status,200)
 s.ensayoAPI=true;save();console.log('PASA Neon: directorio, archivo, ficha, historial, permisos, concurrencia real, desactivación, reactivación y revocación')
}
if(process.argv.includes('--migrar')){
 assert.ok(s.ensayoAPI&&s.backupDemo.restored);assert.deepEqual(await version(),s.previousVersions,'La publicación cambió desde el inicio del ensayo')
 if(!s.backupReal){s.backupReal=await respaldar(env.DATABASE_URL,'.clientes-respaldo-real.local');save()}
 if(!s.demoMigrada){s.demoMigrada=await migrar(demo.DATABASE_URL,'018_clientes_equipo','Demo');save()}
 if(!s.realMigrada){s.realMigrada=await migrar(env.DATABASE_URL,'018_clientes_equipo','Real');save()}
}
if(process.argv.includes('--archivar')){
 assert.ok(s.ensayoAPI&&s.demoMigrada&&s.realMigrada);assert.notDeepEqual(await version(),s.previousVersions,'Publicar el Worker nuevo antes de archivar')
 if(!s.realArchivada){s.realArchivada=await migrar(env.DATABASE_URL,'019_archivar_muestras','Real');save()}
}
if(process.argv.includes('--cerrar-ensayo')){
 assert.ok(s.realArchivada&&s.ensayoAPI)
 if(!s.stageDeleted){assert.notEqual(s.stage.id,s.real);assert.notEqual(s.stage.id,s.demo);assert.equal(s.stage.parent,s.real);await api('/branches/'+s.stage.id,undefined,'DELETE');s.stageDeleted=true;save();console.log('Ensayo temporal eliminado; respaldos privados verificados y snapshot remoto conservados')}
}
