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
const root=resolve(import.meta.dirname,'..'),dir=join(root,'entregables/mejoras-mi-club-2026-10-09/evidencia'),out=join(root,'.test-output/mi-club-real');mkdirSync(dir,{recursive:true});mkdirSync(out,{recursive:true})
const demo=JSON.parse(readFileSync('.demo.local','utf8')).DATABASE_URL,real=parseEnv(readFileSync('.dev.vars','utf8')).DATABASE_URL
assert.notEqual(new URL(real).hostname.replace('-pooler',''),new URL(demo).hostname.replace('-pooler',''))
const schema='mi_club_test_'+crypto.randomUUID().replaceAll('-','');assert.match(schema,/^mi_club_test_[a-f0-9]{32}$/)
neonConfig.webSocketConstructor=globalThis.WebSocket
globalThis.__clubReal={url:demo,schema};const control=new Client(demo),resultados=[];let creado=false
const driver=join(out,'driver.mjs')
writeFileSync(driver,`
import {Client as RealClient,neonConfig} from '@neondatabase/serverless';export {neonConfig};
export class Client extends RealClient{constructor(){super(globalThis.__clubReal.url)}async connect(){await super.connect();await super.query('SET search_path TO "'+globalThis.__clubReal.schema+'",public')}}
export function neon(){const sql=(parts,...params)=>{const query=parts.reduce((s,p,i)=>s+(i?'$'+i:'')+p,'');const execute=async cli=>{if(cli)return(await cli.query(query,params)).rows;const c=new Client();await c.connect();try{return(await c.query(query,params)).rows}finally{await c.end()}};return{execute,then:(yes,no)=>execute().then(yes,no)}};sql.transaction=async queries=>{const c=new Client();await c.connect();try{await c.query('BEGIN');const rows=[];for(const q of queries)rows.push(await q.execute(c));await c.query('COMMIT');return rows}catch(e){await c.query('ROLLBACK');throw e}finally{await c.end()}};return sql}
`)
await control.connect()
try{
 const ext=(await control.query("SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto','btree_gist')")).rows;assert.equal(ext.length,2,'El ensayo no instala extensiones en la base compartida')
 await control.query('CREATE SCHEMA "'+schema+'"');creado=true;await control.query('SET search_path TO "'+schema+'",public')
 const migraciones=['001_schema','003_correcciones','004_sesiones','005_generacion','006_orden_del_saldo','007_vale','009_puntos','010_integridad','011_plazas','012_operacion','013_correo','014_promociones','015_saldo_cronologico','016_baja_socio','017_seguridad_personal','018_clientes_equipo','020_acceso_equipo','021_inicio_sesion','022_carta','023_tienda','024_mi_club','025_club_operacion','026_perfil','027_reservas','028_reservas_reembolso','029_reglas_club']
 for(const m of migraciones)await control.query(readFileSync('db/'+m+'.sql','utf8'))
 // Importar el driver real como externo evita que el alias se aplique a sí mismo.
 await build({stdin:{contents:"export {app} from './src/worker/index.ts';export {firmar} from './src/worker/sesion.ts'",resolveDir:root},bundle:true,platform:'node',format:'esm',outfile:join(out,'worker.mjs'),external:['qrcode'],plugins:[{name:'neon-aislado',setup(b){b.onResolve({filter:/^@neondatabase\/serverless$/},args=>args.importer===driver?{path:args.path,external:true}:{path:driver})}}]})
 const {app,firmar}=await import(pathToFileURL(join(out,'worker.mjs')))
 const env={DATABASE_URL:'postgres://ensayo-aislado',SESION_SECRETO:'firma-exclusiva-del-ensayo-sintetico',CASA_SECRETO:'arranque-sintetico-de-este-esquema',PERSONAL_CREDENCIAL_SECRETO:'credenciales-sinteticas-exclusivas-del-ensayo',PERSONAL_MFA_SECRETO:'mfa-sintetico-de-32-caracteres-exclusivo'},cierres=[]
 const ctx={waitUntil:p=>cierres.push(p),passThroughOnException(){}}
 const clientes=[]
 for(let i=0;i<13;i++){const id=crypto.randomUUID(),tel='5059000'+String(i).padStart(4,'0');await control.query('INSERT INTO socio(id,telefono,nombre) VALUES($1,$2,$3)',[id,tel,'Prueba concurrente '+i]);await control.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,1000000,'recarga','Saldo del ensayo')",[id]);clientes.push({id,tel,token:await firmar(env.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+3600000})})}
 await control.query("INSERT INTO experiencia(id,nombre,cuando,cupos,precio,abre_socios,abre_publico) VALUES('concurrente','Experiencia del ensayo',now()+interval '7 days',12,85000,now()-interval '3 days',now()-interval '1 day')")
 const request=async(i,ruta,cuerpo)=>{const r=await app.request('https://localhost'+ruta,{method:'POST',headers:{authorization:'Bearer '+clientes[i].token,'content-type':'application/json'},body:JSON.stringify(cuerpo)},env,ctx);return{status:r.status,body:await r.json()}}
 const oferta=(await (await app.request('https://localhost/api/catalogo',{},env,ctx)).json()).experiencias.find(e=>e.id==='concurrente').oferta
 const intentos=[]
 const comprar=async i=>{for(let n=0;n<5;n++){const r=await request(i,'/api/experiencia/concurrente/apartar',{oferta,ref:'concurrente-'+String(i).padStart(4,'0')});intentos.push({cliente:i,intento:n+1,status:r.status});if(r.status!==503)return r;await new Promise(resolver=>setTimeout(resolver,2000))}throw Error('Se agotaron los reintentos de contención')}
 const compras=await Promise.all(clientes.slice(0,12).map((_,i)=>comprar(i)))
 assert.deepEqual(compras.map(r=>r.status),Array(12).fill(200));assert.equal(new Set(compras.map(r=>r.body.butaca)).size,12)
 assert.equal((await request(12,'/api/experiencia/concurrente/apartar',{oferta,ref:'concurrente-0013'})).status,409)
 assert.equal((await control.query("SELECT count(*)::int n FROM asiento WHERE monto=-85000")).rows[0].n,12)
 resultados.push({caso:'12 compradores simultáneos: 12 butacas y cargos únicos; el decimotercero obtiene agotado sin cargo',correcto:true,intentos,nota:'El límite de espera puede devolver 503 con Retry-After; se reintenta la misma referencia. Nunca se acepta un falso 409 agotado entre los doce compradores.'})
 const reintentos=await Promise.all(Array.from({length:4},()=>request(0,'/api/experiencia/concurrente/apartar',{oferta,ref:'concurrente-0000'})))
 assert.ok(reintentos.every(r=>r.status===200&&r.body.repetido));assert.equal((await control.query("SELECT count(*)::int n FROM asiento WHERE monto=-85000")).rows[0].n,12)
 resultados.push({caso:'Cuatro reintentos concurrentes de una compra recuperan el mismo recibo sin otro cargo',correcto:true})
 await control.query("INSERT INTO membresia(socio_id,numero,cuota,desde,hasta,autorenueva,renovacion_consentida,periodo_inicio) VALUES($1,1,95000,now()-interval '31 days',now()-interval '1 day',true,now(),now()-interval '31 days')",[clientes[0].id])
 const renovaciones=await Promise.all(Array.from({length:4},()=>request(0,'/api/club/sincronizar',{})))
 assert.ok(renovaciones.every(r=>r.status===200));assert.equal((await control.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'renovacion:%'")).rows[0].n,1)
 const cambios=await Promise.all([request(0,'/api/membresia/cancelar',{}),request(0,'/api/membresia/renovacion',{})]);assert.ok(cambios.every(r=>r.status===200))
 assert.equal((await control.query("SELECT count(*)::int n FROM membresia WHERE estado='activa'")).rows[0].n,1)
 resultados.push({caso:'Renovaciones simultáneas cobran una vez; cancelación y consentimiento concurrentes se serializan sin duplicar contrato',correcto:true})

 let auth
 const equipo=async(ruta,cuerpo)=>{
  const r=await app.request('https://localhost'+ruta,{method:cuerpo===undefined?'GET':'POST',headers:{origin:'https://localhost','x-equipo-solicitud':'1','content-type':'application/json',...(auth?{cookie:auth.cookie,'x-equipo-csrf':auth.csrf}:{})},...(cuerpo===undefined?{}:{body:JSON.stringify(cuerpo)})},env,ctx)
  const nueva=leerAutenticacion(r.headers);if(nueva)auth=nueva
  return {status:r.status,body:await r.json()}
 }
 assert.equal((await equipo('/api/auth/equipo/iniciar-propietario',{usuario:'propietario.ensayo',nombre:'Propietario sintético',actual:env.CASA_SECRETO,nueva:'Una clave sintética solo para este ensayo',confirmacion:'Una clave sintética solo para este ensayo',demo:false,compartido:false,dispositivo:'Ensayo de concurrencia'})).status,200)
 const mfa=await equipo('/api/personal/mfa/preparar',{});assert.equal(mfa.status,200)
 assert.equal((await equipo('/api/personal/mfa/confirmar',{codigo:new TOTP({secret:mfa.body.secreto}).generate()})).status,200)
 const configuracion=(await equipo('/api/operacion/club/panel')).body.config
 assert.equal((await equipo('/api/operacion/club/configuracion',{...configuracion,reposteria:['cheesecake-cafe']})).status,200)
 const pase=(await control.query('SELECT codigo_club FROM socio WHERE id=$1',[clientes[0].id])).rows[0].codigo_club
 const cuerpo={pase,ticket:'concurrencia-caja-0001',lineas:[{id:'cheesecake-cafe',cuanto:2}]}
 const cotizacion=await equipo('/api/operacion/club-caja/cotizar',cuerpo);assert.equal(cotizacion.status,200)
 const antesCaja=JSON.stringify((await control.query('SELECT * FROM asiento ORDER BY id')).rows)
 const registrar=async()=>{for(let n=0;n<5;n++){const r=await equipo('/api/operacion/club-caja/registrar',{...cuerpo,huella:cotizacion.body.huella,confirmo:true});if(r.status!==503)return r;await new Promise(r=>setTimeout(r,2000))}throw Error('Contención de descuento sin resolver')}
 const registros=await Promise.all(Array.from({length:4},()=>registrar()))
 assert.ok(registros.every(r=>r.status===200));assert.equal(new Set(registros.map(r=>r.body.id)).size,1)
 assert.equal((await control.query('SELECT count(*)::int n FROM club_descuento_caja')).rows[0].n,1)
 assert.equal(JSON.stringify((await control.query('SELECT * FROM asiento ORDER BY id')).rows),antesCaja)
 resultados.push({caso:'Cuatro confirmaciones simultáneas de un comprobante generan un registro de descuento y ningún movimiento financiero, con sesión del propietario autenticada por MFA real',correcto:true})

 // Dos administraciones compiten por ofrecer el mismo horario/grupo.
 const futuro=new Date(Date.now()+4*86400000).toISOString().slice(0,10)+'T15:00:00-06:00'
 const cola=(await control.query('INSERT INTO club_vip_espera(socio_id,cuando,horas,personas) SELECT id,$1,2,4 FROM socio WHERE id=ANY($2::uuid[]) RETURNING id,socio_id',[futuro,[clientes[0].id,clientes[1].id]])).rows
 const preferente=cola.find(w=>w.socio_id===clientes[0].id),otra=cola.find(w=>w.socio_id===clientes[1].id)
 const ofertas=await Promise.all([preferente,otra].map(w=>equipo('/api/operacion/club/vip-espera/'+w.id+'/ofrecer',{version:1,motivo:'Comprobación concurrente en esquema efímero'})))
 assert.equal(ofertas[0].status,200);assert.equal(ofertas[1].status,409)
 assert.equal((await control.query('SELECT count(*)::int n FROM club_vip_espera WHERE ofrecida IS NOT NULL')).rows[0].n,1)
 resultados.push({caso:'Dos ofertas VIP simultáneas respetan prioridad, sin ofertar a dos titulares del mismo horario y grupo',correcto:true})
 await Promise.all(cierres)
 console.log('PASA PostgreSQL real: '+resultados.length+' grupos concurrentes; esquema sintético exclusivo.')
}catch(e){throw Error('Falló el ensayo de PostgreSQL: '+(e.code??e.message))}
finally{await control.query('ROLLBACK').catch(()=>{});if(creado)await control.query('DROP SCHEMA "'+schema+'" CASCADE');await control.end();delete globalThis.__clubReal;writeFileSync(join(dir,'concurrencia.json'),JSON.stringify({metodo:'Worker y SQL reales, PostgreSQL de capacitación, conexiones independientes, 13 cuentas sintéticas, esquema exclusivo eliminado. No es un ensayo de carga de producción.',resultados},null,2))}
