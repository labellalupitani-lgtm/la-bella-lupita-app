// PostgreSQL real, conexiones independientes y esquema desechable de capacitación.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Client, neonConfig } from '@neondatabase/serverless'
import { build } from 'esbuild'
import { TOTP } from 'otpauth'
import { leerAutenticacion } from './soporte-perfiles-equipo.mjs'
const root=resolve(import.meta.dirname,'..'),out=join(root,'.test-output/reservas-real');mkdirSync(out,{recursive:true})
const demo=JSON.parse(readFileSync('.demo.local','utf8')).DATABASE_URL,real=parseEnv(readFileSync('.dev.vars','utf8')).DATABASE_URL
const identidad=u=>{const x=new URL(u);return x.hostname.replace('-pooler','')+x.pathname}
assert.notEqual(identidad(real),identidad(demo),'El ensayo requiere una base de capacitación distinta de producción')
const schema='reservas_test_'+crypto.randomUUID().replaceAll('-','');assert.match(schema,/^reservas_test_[a-f0-9]{32}$/)
neonConfig.webSocketConstructor=globalThis.WebSocket
globalThis.__reservasReal={url:demo,schema}
const driver=join(out,'driver.mjs'),control=new Client(demo),resultados=[];let creado=false
writeFileSync(driver,`import {Client as Original,neonConfig} from '@neondatabase/serverless';export {neonConfig};
export class Client extends Original{constructor(){super(globalThis.__reservasReal.url)}async connect(){await super.connect();await super.query('SET search_path TO "'+globalThis.__reservasReal.schema+'",public')}}
export function neon(){const sql=(parts,...params)=>{const query=parts.reduce((s,p,i)=>s+(i?'$'+i:'')+p,'');const execute=async cli=>{if(cli)return(await cli.query(query,params)).rows;const c=new Client();await c.connect();try{return(await c.query(query,params)).rows}finally{await c.end()}};return{execute,then:(yes,no)=>execute().then(yes,no)}};sql.transaction=async qs=>{const c=new Client();await c.connect();try{await c.query('BEGIN');const rows=[];for(const q of qs)rows.push(await q.execute(c));await c.query('COMMIT');return rows}catch(e){await c.query('ROLLBACK');throw e}finally{await c.end()}};return sql}`)
await control.connect()
try{
  assert.equal((await control.query("SELECT count(*)::int n FROM pg_extension WHERE extname IN ('pgcrypto','btree_gist')")).rows[0].n,2)
  await control.query('CREATE SCHEMA "'+schema+'"');creado=true;await control.query('SET search_path TO "'+schema+'",public')
  for(const f of readdirSync('db').filter(f=>/^\d{3}_.*\.sql$/.test(f)&&!['002','008','019'].includes(f.slice(0,3))).sort())await control.query(readFileSync('db/'+f,'utf8'))
  await build({stdin:{contents:"export {app} from './src/worker/index.ts';export {firmar} from './src/worker/sesion.ts';export {CONFIGURACION_RESERVAS} from './src/compartido/reservas.ts'",resolveDir:root},bundle:true,platform:'node',format:'esm',outfile:join(out,'worker.mjs'),external:['qrcode'],plugins:[{name:'neon-aislado',setup(b){b.onResolve({filter:/^@neondatabase\/serverless$/},args=>args.importer===driver?{path:args.path,external:true}:{path:driver})}}]})
  const {app,firmar,CONFIGURACION_RESERVAS}=await import(pathToFileURL(join(out,'worker.mjs'))),cfg=structuredClone(CONFIGURACION_RESERVAS)
  cfg.zonas.forEach(z=>{z.mesas=Array.from({length:z.id==='vip'?1:2},(_,i)=>({id:'sintetica-'+i,plazas:4}))})
  await control.query('INSERT INTO reserva_config(id,datos) VALUES(true,$1::jsonb)',[JSON.stringify(cfg)])
  const env={DATABASE_URL:'postgres://ensayo-reservas',SESION_SECRETO:'firma-de-cuentas-sinteticas-reservas',CASA_SECRETO:'arranque-sintetico',PERSONAL_CREDENCIAL_SECRETO:'equipo-sintetico',PERSONAL_MFA_SECRETO:'mfa-sintetico-de-32-caracteres-exclusivo'},cierres=[],ctx={waitUntil:p=>cierres.push(p)}
  const clientes=[]
  for(let i=0;i<7;i++){const id=crypto.randomUUID(),tel='50599000'+String(i).padStart(3,'0');await control.query('INSERT INTO socio(id,telefono,nombre) VALUES($1,$2,$3)',[id,tel,'Reserva sintética '+i]);await control.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,100000,'recarga','Saldo sintético')",[id]);clientes.push({id,token:await firmar(env.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+3600000})})}
  const dia=n=>new Date(Date.now()-21600000+n*86400000).toISOString().slice(0,10)
  const visita=(n=2,extra={})=>({zona:'terraza',cuando:dia(n)+'T12:00:00-06:00',horas:2,personas:2,configuracion:cfg.version,referencia:crypto.randomUUID(),...extra})
  const request=async(i,path,body)=>{const r=await app.request('https://localhost'+path,{method:'POST',headers:{authorization:'Bearer '+clientes[i].token,'content-type':'application/json'},body:JSON.stringify(body)},env,ctx);return{status:r.status,body:await r.json()}}
  const crear=async(i,body)=>{for(let n=0;n<5;n++){const r=await request(i,'/api/reserva',body);if(r.status!==503)return r;await new Promise(r=>setTimeout(r,1500))}throw Error('Contención no resuelta')}
  const cuatro=await Promise.all([0,1,2,3].map(i=>crear(i,visita())))
  assert.equal(cuatro.filter(r=>r.status===200).length,2,JSON.stringify(cuatro));assert.equal(cuatro.filter(r=>r.status===409).length,2)
  assert.equal(new Set(cuatro.filter(r=>r.status===200).flatMap(r=>r.body.reserva.mesas)).size,2)
  resultados.push({caso:'Cuatro titulares simultáneos compiten por dos mesas: dos confirmaciones y dos conflictos, sin mesas duplicadas',correcto:true})
  const intento=visita(3,{zona:'vip'}),repetidas=await Promise.all(Array.from({length:4},()=>crear(4,intento)))
  assert.ok(repetidas.every(r=>r.status===200),JSON.stringify(repetidas));assert.equal(new Set(repetidas.map(r=>r.body.reserva.id)).size,1)
  assert.equal((await control.query("SELECT count(*)::int n FROM asiento WHERE socio_id=$1 AND ref_externa LIKE 'dep:%'",[clientes[4].id])).rows[0].n,1)
  assert.equal((await control.query('SELECT total FROM saldo_de($1)',[clientes[4].id])).rows[0].total,50000)
  resultados.push({caso:'Cuatro reintentos simultáneos VIP generan una reserva y un solo cargo de C$500',correcto:true})
  const solapes=await Promise.all([crear(5,visita(4)),crear(5,visita(4,{zona:'barra'}))]);assert.deepEqual(solapes.map(r=>r.status).sort(),[200,409])
  resultados.push({caso:'Dos reservas simultáneas superpuestas del mismo titular: solo una puede confirmarse',correcto:true})
  const winner=cuatro.findIndex(r=>r.status===200),reservada=cuatro[winner].body.reserva
  const cancelar=await Promise.all([request(winner,'/api/reservas/'+reservada.id+'/cancelar',{version:1}),request(winner,'/api/reservas/'+reservada.id+'/cancelar',{version:1})])
  assert.ok(cancelar.every(r=>r.status===200));assert.equal(cancelar.filter(r=>r.body.repetido).length,1)
  assert.equal((await crear(6,visita())).status,200)
  resultados.push({caso:'Cancelación simultánea libera una mesa una sola vez y permite ocuparla a otro titular',correcto:true})
  const staffRequest=async(path,body,auth=null)=>{const response=await app.request('https://localhost'+path,{method:'POST',headers:{'content-type':'application/json',origin:'https://localhost','x-equipo-solicitud':'1',...(auth?{cookie:auth.cookie,'x-equipo-csrf':auth.csrf}:{})},body:JSON.stringify(body)},env,ctx);return{status:response.status,body:await response.json(),auth:leerAutenticacion(response.headers)}}
  const inicial=await staffRequest('/api/auth/equipo/iniciar-propietario',{usuario:'prueba.reservas',nombre:'Propietario sintético',actual:env.CASA_SECRETO,nueva:'Clave sintética de la prueba reservas',confirmacion:'Clave sintética de la prueba reservas',demo:false,compartido:false,dispositivo:'Prueba aislada'})
  assert.equal(inicial.status,200,JSON.stringify(inicial.body))
  const preparada=await staffRequest('/api/personal/mfa/preparar',{},inicial.auth)
  assert.equal(preparada.status,200)
  const autenticada=await staffRequest('/api/personal/mfa/confirmar',{codigo:new TOTP({secret:preparada.body.secreto}).generate()},inicial.auth)
  assert.equal(autenticada.status,200,JSON.stringify(autenticada.body))
  const vip=repetidas[0].body.reserva
  await control.query("UPDATE reserva SET cuando=now()-interval '30 minutes',termina=now()+interval '90 minutes',estado='llego' WHERE id=$1",[vip.id])
  const operacion={accion:'aplicar',version:1,motivo:'Consumo sintético concurrente verificado.',consumo:30000,comprobante:'CAJA-CONCURRENCIA-0001'}
  const cobros=await Promise.all(Array.from({length:3},()=>staffRequest('/api/operacion/reservas/'+vip.id,operacion,autenticada.auth)))
  assert.deepEqual(cobros.map(r=>r.status).sort(),[200,409,409],JSON.stringify(cobros))
  assert.equal((await control.query("SELECT count(*)::int n FROM asiento WHERE ref_externa='pedido:CAJA-CONCURRENCIA-0001'")).rows[0].n,1)
  const devoluciones=await Promise.all(Array.from({length:2},()=>staffRequest('/api/operacion/reservas/'+vip.id,{accion:'devolver',version:2,motivo:'Devolución sintética del remanente.'},autenticada.auth)))
  assert.deepEqual(devoluciones.map(r=>r.status).sort(),[200,409])
  assert.equal((await control.query('SELECT total FROM saldo_de($1)',[clientes[4].id])).rows[0].total,70000)
  resultados.push({caso:'Tres aplicaciones simultáneas cobran C$300 una vez; dos devoluciones simultáneas restituyen solo C$200 pendientes',correcto:true})
  const cancelable=await crear(6,visita(8,{zona:'vip'}));assert.equal(cancelable.status,200)
  const cancelacionesVip=await Promise.all(Array.from({length:3},()=>request(6,'/api/reservas/'+cancelable.body.reserva.id+'/cancelar',{version:1})))
  assert.ok(cancelacionesVip.every(r=>r.status===200),JSON.stringify(cancelacionesVip));assert.equal(cancelacionesVip.filter(r=>r.body.repetido).length,2)
  assert.ok(cancelacionesVip.every(r=>r.body.reserva.anticipo_devuelto===50000))
  assert.equal((await control.query('SELECT total FROM saldo_de($1)',[clientes[6].id])).rows[0].total,100000)
  assert.equal((await control.query('SELECT count(*)::int n FROM asiento WHERE ref_externa=$1',['reserva-anticipo:'+cancelable.body.reserva.id])).rows[0].n,1)
  resultados.push({caso:'Tres cancelaciones VIP simultáneas devuelven C$500 una sola vez y muestran el mismo comprobante',correcto:true})
  const ausente=await crear(6,visita(9,{zona:'vip'}));assert.equal(ausente.status,200)
  await control.query("UPDATE reserva SET cuando=now()-interval '3 hours',termina=now()-interval '1 hour' WHERE id=$1",[ausente.body.reserva.id])
  const faltas=await Promise.all(Array.from({length:2},()=>staffRequest('/api/operacion/reservas/'+ausente.body.reserva.id,{accion:'no_asistio',version:1,motivo:'Inasistencia sintética concurrente.'},autenticada.auth)))
  assert.ok(faltas.every(r=>r.status===200),JSON.stringify(faltas));assert.equal(faltas.filter(r=>r.body.repetido).length,1)
  assert.equal((await control.query('SELECT total FROM saldo_de($1)',[clientes[6].id])).rows[0].total,100000)
  resultados.push({caso:'Dos registros simultáneos de inasistencia producen una devolución única de C$500',correcto:true})
  await Promise.all(cierres)
  console.log('PASA PostgreSQL real: '+resultados.length+' grupos concurrentes de reservas.')
}catch(e){throw Error('Ensayo de reservas fallido: '+(e.code??e.message))}
finally{await control.query('ROLLBACK').catch(()=>{});if(creado)await control.query('DROP SCHEMA "'+schema+'" CASCADE');await control.end();delete globalThis.__reservasReal;writeFileSync('entregables/reservas-2026-10-10/concurrencia.json',JSON.stringify({fecha:new Date().toISOString(),metodo:'Worker real y PostgreSQL multiconexión de capacitación. Solo cuentas sintéticas en un esquema exclusivo eliminado al terminar.',resultados},null,2))}
