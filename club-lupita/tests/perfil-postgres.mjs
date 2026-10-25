import {TOTP} from 'otpauth'
import {leerAutenticacion} from './soporte-perfiles-equipo.mjs'
// Worker real con PostgreSQL multiconexión, en un esquema efímero de capacitación.
// El adaptador solo fija search_path; no serializa ni simula las consultas.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {parseEnv} from 'node:util'
import {resolve,join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {Client,neonConfig} from '@neondatabase/serverless'
import {build} from 'esbuild'
const root=resolve(import.meta.dirname,'..'),dir=join(root,'entregables/mejoras-perfil-2026-10-09/evidencias'),out=join(root,'.test-output/perfil-real');mkdirSync(dir,{recursive:true});mkdirSync(out,{recursive:true})
const demo=JSON.parse(readFileSync('.demo.local','utf8')).DATABASE_URL,real=parseEnv(readFileSync('.dev.vars','utf8')).DATABASE_URL
assert.notEqual(new URL(real).hostname.replace('-pooler',''),new URL(demo).hostname.replace('-pooler',''))
const schema='perfil_test_'+crypto.randomUUID().replaceAll('-','');assert.match(schema,/^perfil_test_[a-f0-9]{32}$/)
neonConfig.webSocketConstructor=globalThis.WebSocket
globalThis.__perfilReal={url:demo,schema};const control=new Client(demo),resultados=[];let creado=false
const driver=join(out,'driver.mjs')
writeFileSync(driver,`
import {Client as RealClient,neonConfig} from '@neondatabase/serverless';export {neonConfig};
export class Client extends RealClient{constructor(){super(globalThis.__perfilReal.url)}async connect(){await super.connect();await super.query('SET search_path TO "'+globalThis.__perfilReal.schema+'",public')}}
export function neon(){const sql=(parts,...params)=>{const query=parts.reduce((s,p,i)=>s+(i?'$'+i:'')+p,'');const execute=async cli=>{if(cli)return(await cli.query(query,params)).rows;const c=new Client();await c.connect();try{return(await c.query(query,params)).rows}finally{await c.end()}};return{execute,then:(yes,no)=>execute().then(yes,no)}};sql.transaction=async queries=>{const c=new Client();await c.connect();try{await c.query('BEGIN');const rows=[];for(const q of queries)rows.push(await q.execute(c));await c.query('COMMIT');return rows}catch(e){await c.query('ROLLBACK');throw e}finally{await c.end()}};return sql}
`)
await control.connect()
try{
 const ext=(await control.query("SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto','btree_gist')")).rows;assert.equal(ext.length,2,'El ensayo no instala extensiones en la base compartida')
 await control.query('CREATE SCHEMA "'+schema+'"');creado=true;await control.query('SET search_path TO "'+schema+'",public')
 const migraciones=['001_schema','003_correcciones','004_sesiones','005_generacion','006_orden_del_saldo','007_vale','009_puntos','010_integridad','011_plazas','012_operacion','013_correo','014_promociones','015_saldo_cronologico','016_baja_socio','017_seguridad_personal','018_clientes_equipo','020_acceso_equipo','021_inicio_sesion','022_carta','023_tienda','024_mi_club','025_club_operacion','026_perfil']
 for(const m of migraciones)await control.query(readFileSync('db/'+m+'.sql','utf8'))
 // Importar el driver real como externo evita que el alias se aplique a sí mismo.
 await build({stdin:{contents:"export {app} from './src/worker/index.ts';export {firmar} from './src/worker/sesion.ts'",resolveDir:root},bundle:true,platform:'node',format:'esm',outfile:join(out,'worker.mjs'),external:['qrcode'],plugins:[{name:'neon-aislado',setup(b){b.onResolve({filter:/^@neondatabase\/serverless$/},args=>args.importer===driver?{path:args.path,external:true}:{path:driver})}}]})
 const {app,firmar}=await import(pathToFileURL(join(out,'worker.mjs')))
 const env={DATABASE_URL:'postgres://ensayo-aislado',SESION_SECRETO:'firma-exclusiva-del-ensayo-sintetico',CASA_SECRETO:'arranque-sintetico-de-este-esquema',PERSONAL_CREDENCIAL_SECRETO:'credenciales-sinteticas-exclusivas-del-ensayo',PERSONAL_MFA_SECRETO:'mfa-sintetico-de-32-caracteres-exclusivo'},cierres=[]
 const ctx={waitUntil:p=>cierres.push(p),passThroughOnException(){}}

 const id=crypto.randomUUID(),tel='50590009991';await control.query('INSERT INTO socio(id,telefono,nombre) VALUES($1,$2,$3)',[id,tel,'Ensayo de Perfil']);
 const token=await firmar(env.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+3600000});
 const request=async(body)=>{const r=await app.request('https://localhost/api/perfil',{method:body?'POST':'GET',headers:{authorization:'Bearer '+token,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})},env,ctx);return{status:r.status,body:await r.json()}};
 const base=(await request()).body.perfil;const editable=Object.fromEntries(['nombre','bebida_siempre','alergias','cumple','promociones_correo','version'].map(k=>[k,base[k]]));
 const respuestas=await Promise.all(['Primera persona','Segunda persona','Tercera persona','Cuarta persona'].map(nombre=>request({...editable,nombre})));
 assert.deepEqual(respuestas.map(r=>r.status).sort(),[200,409,409,409]);const ganadora=respuestas.find(r=>r.status===200).body.perfil;assert.equal((await request()).body.perfil.nombre,ganadora.nombre);
 assert.equal((await control.query("SELECT count(*)::int n FROM auditoria WHERE accion='editar_perfil'")).rows[0].n,1);
 resultados.push({caso:'Cuatro borradores concurrentes de la misma versión: uno guardado, tres conflictos, una auditoría',correcto:true});
 // Una transacción del equipo compite con un borrador, sobre conexiones independientes.
 const bloqueo=new Client(demo);await bloqueo.connect();await bloqueo.query('SET search_path TO "'+schema+'",public');await bloqueo.query('BEGIN');await bloqueo.query('UPDATE socio SET alergias=$2 WHERE id=$1',[id,'Restricción confirmada por equipo']);
 const esperando=request({...editable,version:ganadora.version,bebida_siempre:'Latte'});await new Promise(r=>setTimeout(r,200));await bloqueo.query('COMMIT');await bloqueo.end();assert.equal((await esperando).status,409);assert.equal((await request()).body.perfil.alergias,'Restricción confirmada por equipo');
 resultados.push({caso:'Edición del equipo bajo bloqueo preservada frente a un guardado cliente concurrente',correcto:true});
 await Promise.all(cierres);console.log('PASA PostgreSQL real: '+resultados.length+' grupos concurrentes; datos sintéticos en esquema exclusivo.');
}catch(e){throw Error('Falló el ensayo de Perfil en PostgreSQL: '+(e.code??e.message))}
finally{await control.query('ROLLBACK').catch(()=>{});if(creado){assert.match(schema,/^perfil_test_[a-f0-9]{32}$/);await control.query('DROP SCHEMA "'+schema+'" CASCADE')}await control.end();delete globalThis.__perfilReal;writeFileSync(join(dir,'postgres.json'),JSON.stringify({metodo:'Worker y SQL reales, conexiones independientes en PostgreSQL de capacitación. Esquema sintético exclusivo eliminado. No es carga de producción.',resultados},null,2))}
