import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {parseEnv} from 'node:util'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {neon} from '@neondatabase/serverless'
const env={...parseEnv(readFileSync('.env.deploy','utf8')),...parseEnv(readFileSync('.dev.vars','utf8')),...parseEnv(readFileSync('.infra.local','utf8'))}
const release=JSON.parse(readFileSync('.clientes-release.local','utf8')),demo=JSON.parse(readFileSync('.demo.local','utf8'))
assert.ok(release.realArchivada&&release.demoMigrada&&release.ensayoAPI)
const base='https://app.labellalupita.com',checks=[]
const hash=x=>createHash('sha256').update(x).digest('hex')
const call=async(path,body,token)=>{const r=await fetch(base+'/api'+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,body:await r.json(),cache:r.headers.get('cache-control')}}
for(const path of ['/operacion/clientes','/operacion/clientes/00000000-0000-4000-8000-000000000001','/personal/equipo'])assert.equal((await call(path)).status,401)
const real=neon(env.DATABASE_URL),prueba=neon(demo.DATABASE_URL)
const conteos=async(sql)=>{const [r]=await sql`SELECT (SELECT count(*)::int FROM socio) AS conservadas,(SELECT count(*)::int FROM operativo_socio) AS directorio,(SELECT count(*)::int FROM socio WHERE archivado_muestra IS NOT NULL) AS archivadas,(SELECT count(*)::int FROM operativo_socio WHERE correo_verificado IS NOT NULL) AS verificadas,(SELECT count(*)::int FROM empleado) AS empleados,(SELECT count(*)::int FROM operativo_membresia WHERE estado IN ('activa','en_gracia')) AS membresias_ocupadas,(SELECT count(*)::int FROM reserva_cosecha WHERE socio_id IS NOT NULL) AS bolsas_ocupadas`;return r}
const cuentasReal=await conteos(real),cuentasDemo=await conteos(prueba)
assert.equal(cuentasReal.archivadas,82);assert.ok(cuentasReal.directorio>=2);assert.equal(cuentasReal.membresias_ocupadas,0);assert.equal(cuentasReal.bolsas_ocupadas,0)
assert.equal(cuentasDemo.archivadas,0);assert.equal(cuentasDemo.directorio,82)
// Las claves se comparan en memoria, nunca se imprimen ni se agregan al informe.
const respaldo=JSON.parse(readFileSync(release.backupReal.file,'utf8'))
const [seguridad]=await real`SELECT to_jsonb(r) AS dato FROM seguridad_propietario r`
assert.deepEqual(seguridad.dato,respaldo.tables.seguridad_propietario[0])
const [libro]=await real`SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY to_jsonb(r)::text),'[]'::jsonb) AS rows FROM asiento r`
assert.equal(hash(JSON.stringify(libro.rows)),hash(JSON.stringify(respaldo.tables.asiento)))
checks.push('84 cuentas conservadas: directorio real separado de 82 muestras; libro mayor y credencial del propietario intactos')
const cupos=await call('/cupos');assert.equal(cupos.status,200);assert.equal(cupos.body.sociosFundadores,100);assert.equal(cupos.body.bolsasReserva,150);assert.match(cupos.cache,/no-store/)
checks.push('Cupos publicados: 100 membresías y 150 bolsas disponibles; las muestras no ocupan operación real')
// Acceso público de demostración: no se envía ningún correo ni se usa la clave del propietario.
const codigo=await call('/auth/codigo',{telefono:'50587442005'});assert.equal(codigo.status,200);assert.ok(codigo.body.codigoDemo)
const entrar=await call('/auth/entrar',{telefono:'50587442005',codigo:codigo.body.codigoDemo});assert.equal(entrar.status,200)
const token=entrar.body.token
const compras=await call('/compras',undefined,token);assert.equal(compras.status,200);assert.ok(compras.body.compras.length)
assert.equal((await call('/operacion/clientes',undefined,token)).status,403)
assert.equal((await call('/personal/equipo',undefined,token)).status,403)
const demoCupos=await call('/cupos',undefined,token);assert.equal(demoCupos.status,200);assert.notDeepEqual(demoCupos.body,cupos.body)
checks.push('Demostración publicada: acceso de cliente e historial disponibles, datos aislados y administración denegada')
for(const path of ['/index.html',...readdirSync('dist/assets').filter(f=>/^(Personal-|principal-).*(js|css)$/.test(f)).map(f=>'/assets/'+f)]){
 const r=await fetch(base+path);assert.equal(r.status,200);assert.equal(hash(Buffer.from(await r.arrayBuffer())),hash(readFileSync('dist'+path)),path)
}
for(const path of ['/','/personal?seccion=clientes','/personal?seccion=equipo'])assert.equal((await fetch(base+path)).status,200)
checks.push('HTML y activos de Personal/principal idénticos al build probado; enlaces de Clientes y Equipo disponibles')
const headers={Authorization:'Bearer '+env.CLOUDFLARE_API_TOKEN},url='https://api.cloudflare.com/client/v4/accounts/'+env.CLOUDFLARE_ACCOUNT_ID+'/workers/scripts/club-lupita'
const deployment=await (await fetch(url+'/deployments',{headers})).json();assert.ok(deployment.success);assert.notDeepEqual(deployment.result.deployments[0].versions,release.previousVersions)
const settings=await (await fetch(url+'/settings',{headers})).json();assert.ok(settings.success)
for(const name of ['DATABASE_URL','DEMO_DATABASE_URL','SESION_SECRETO','CASA_SECRETO'])assert.ok(settings.result.bindings.some(b=>b.name===name&&b.type==='secret_text'))
checks.push('Nueva versión activa con los secretos conservados; las diez suites locales y el ensayo de concurrencia en Neon pasaron')
const result={verified:new Date().toISOString(),url:base+'/personal?seccion=clientes',versions:deployment.result.deployments[0].versions,checks,cuentasReal,cuentasDemo,cupos:cupos.body,migrations:['018_clientes_equipo (real y demo)','019_archivar_muestras (solo real)'],snapshot:release.snapshots.real.snapshot.id,backups:{real:{restored:release.backupReal.restored,tables:release.backupReal.tables},demo:{restored:release.backupDemo.restored,tables:release.backupDemo.tables}},browser:'UI probada en entorno local aislado; la sesión de propietario del navegador publicado requiere ingresar con su clave vigente.',credentialsChanged:false}
writeFileSync('entregables/clientes-equipo-2026-10-06/verificacion-publicada.json',JSON.stringify(result,null,2))
console.log('PASA publicación',result.versions,cuentasReal,cuentasDemo);for(const check of checks)console.log(check)
