// Auditoría local: datos sintéticos en PGlite; sin conexiones ni correo externos.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const appRoot=resolve(import.meta.dirname,'../../club-lupita')
const require=createRequire(join(appRoot,'package.json'))
const {PGlite}=require('@electric-sql/pglite')
const {pgcrypto}=require('@electric-sql/pglite/contrib/pgcrypto')
const {btree_gist}=require('@electric-sql/pglite/contrib/btree_gist')
const {build}=require('esbuild')
const out=import.meta.dirname
const driver=join(out,'driver.mjs')
writeFileSync(driver,`export const neonConfig={}; const db=()=>globalThis.__reservationAuditDb; export class Client { constructor(url){if(url!=='postgres://reservation-audit-local')throw Error('No remote database allowed')} async connect(){} async end(){} async query(q,p){return db().query(q,p)}} export function neon(url){if(url!=='postgres://reservation-audit-local')throw Error('No remote database allowed'); const sql=(parts,...p)=>{const q=parts.reduce((s,v,i)=>s+(i?'$'+i:'')+v,''); const execute=()=>db().query(q,p).then(r=>r.rows);return {execute,then:(yes,no)=>execute().then(yes,no)}};sql.transaction=async queries=>{await db().exec('BEGIN');try{const result=[];for(const q of queries)result.push(await q.execute());await db().exec('COMMIT');return result}catch(e){await db().exec('ROLLBACK');throw e}};return sql}`)
const qrcode=pathToFileURL(require.resolve('qrcode')).href
await build({entryPoints:[join(appRoot,'src/worker/index.ts')],bundle:true,platform:'node',format:'esm',outfile:join(out,'worker.mjs'),alias:{'@neondatabase/serverless':driver},plugins:[{name:'local-qrcode',setup(b){b.onResolve({filter:/^qrcode$/},()=>({path:qrcode,external:true}))}}]})
await build({entryPoints:[join(appRoot,'src/worker/sesion.ts')],bundle:true,platform:'node',format:'esm',outfile:join(out,'sesion.mjs')})
const db=globalThis.__reservationAuditDb=new PGlite({extensions:{pgcrypto,btree_gist}})
const {app}=await import(pathToFileURL(join(out,'worker.mjs')))
const {firmar}=await import(pathToFileURL(join(out,'sesion.mjs')))
globalThis.fetch=async()=>{throw Error('Outbound fetch disabled during audit')}
const env={DATABASE_URL:'postgres://reservation-audit-local',SESION_SECRETO:'audit-only-local-secret'}
const ctx={waitUntil(p){void p.catch(()=>{})},passThroughOnException(){}}
const results=[]
const test=async(name,fn)=>{const evidence=await fn();results.push({name,status:'PASS',evidence});console.log('PASS '+name)}
let serial=0
const fresh=async(balance=0)=>{const tel='5058888'+String(++serial).padStart(4,'0');const {rows:[s]}=await db.query("INSERT INTO socio(telefono,nombre) VALUES($1,'Auditoría local') RETURNING id",[tel]);if(balance)await db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'recarga','Saldo sintético')",[s.id,balance]);return {...s,token:await firmar(env.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+3600000})}}
const call=async(path,body,token)=>{const r=await app.request('https://localhost'+path,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})},env,ctx);return {status:r.status,body:await r.json()}}
const payload=(zona='terraza',hora='10:00:00',personas=2,horas=2,dia='2026-11-15')=>({zona,cuando:dia+'T'+hora+'-06:00',personas,horas})
try{
 for(const f of ['001_schema','003_correcciones','004_sesiones','005_generacion','006_orden_del_saldo','007_vale','009_puntos','010_integridad','011_plazas','012_operacion','013_correo','014_promociones','015_saldo_cronologico','016_baja_socio','017_seguridad_personal','018_clientes_equipo','020_acceso_equipo'])await db.exec(readFileSync(join(appRoot,'db',f+'.sql'),'utf8'))
 await test('La reserva requiere sesión de cliente',async()=>{const r=await call('/api/reserva',payload());assert.equal(r.status,401);return r})
 await test('Cambiar personas y duración en mismo inicio devuelve reserva original',async()=>{const s=await fresh();const original=await call('/api/reserva',payload('ventanal','10:00:00',2,1),s.token);const changed=await call('/api/reserva',payload('ventanal','10:00:00',12,6),s.token);assert.equal(original.status,200);assert.equal(changed.status,200);assert.equal(changed.body.yaEstaba,true);assert.equal(changed.body.reserva.personas,2);assert.equal(changed.body.reserva.id,original.body.reserva.id);return {original,requested:payload('ventanal','10:00:00',12,6),changed}})
 await test('Una cuenta agota diez mesas de terraza con inicios separados por un segundo',async()=>{const s=await fresh();const statuses=[];for(let i=0;i<10;i++){const r=await call('/api/reserva',payload('terraza','10:00:'+String(i).padStart(2,'0'),12,6),s.token);statuses.push(r.status);assert.equal(r.status,200)}const other=await fresh();const rejected=await call('/api/reserva',payload('terraza','11:00:00'),other.token);assert.equal(rejected.status,409);const {rows:[occupancy]}=await db.query('SELECT count(*)::int AS reservas,sum(personas)::int AS personas FROM reserva WHERE socio_id=$1',[s.id]);assert.equal(occupancy.reservas,10);return {statuses,occupancy,rejected}})
 await test('Fecha inexistente 31 de noviembre se normaliza a 1 de diciembre',async()=>{const s=await fresh();const sent=payload('barra','10:00:00',2,1,'2026-11-31');const r=await call('/api/reserva',sent,s.token);assert.equal(r.status,200);assert.equal(r.body.reserva.cuando,'2026-12-01T16:00:00.000Z');return {sent,result:r}})
 await test('VIP cobra una sola vez, rechaza cancelar y no emite aviso de creación',async()=>{const s=await fresh(50000);const sent=payload('vip','10:00:00');const original=await call('/api/reserva',sent,s.token);assert.equal(original.status,200);const retry=await call('/api/reserva',sent,s.token);assert.equal(retry.body.cobrado,0);const cancelled=await call('/api/reservas/'+original.body.reserva.id+'/cancelar',{},s.token);assert.equal(cancelled.status,409);const balance=(await db.query('SELECT * FROM saldo_de($1)',[s.id])).rows[0];assert.equal(balance.total,0);const charges=(await db.query('SELECT tipo,monto,concepto,ref_externa FROM asiento WHERE socio_id=$1 AND monto<0',[s.id])).rows;const notices=(await call('/api/avisos',undefined,s.token)).body;return {original,retry,cancelled,balance,charges,notices}})
 await test('Cancelar mesa gratis es privada, idempotente y libera inventario',async()=>{const s=await fresh(),other=await fresh();const reserved=await call('/api/reserva',payload('bistro','10:00:00'),s.token);const path='/api/reservas/'+reserved.body.reserva.id+'/cancelar';const stranger=await call(path,{},other.token);assert.equal(stranger.status,404);const first=await call(path,{},s.token),repeat=await call(path,{},s.token);assert.equal(first.status,200);assert.equal(repeat.body.repetido,true);const next=await call('/api/reserva',payload('bistro','10:00:00'),s.token);assert.equal(next.status,200);assert.notEqual(next.body.reserva.id,reserved.body.reserva.id);return {stranger,first,repeat,newReservation:next.body.reserva.id}})
 await test('Cierre y domingo temprano rechazados',async()=>{const s=await fresh();const closing=await call('/api/reserva',payload('barra','20:30:00',2,1),s.token);const sunday=await call('/api/reserva',payload('barra','07:00:00',2,1),s.token);assert.equal(closing.status,400);assert.equal(sunday.status,400);return {closing,sunday}})
 writeFileSync(join(out,'resultados.json'),JSON.stringify({scope:'PGlite isolated, no remote network, sequential requests; not a concurrency load test',timestamp:new Date().toISOString(),results},null,2)+'\n')
 console.log(results.length+' comprobaciones locales correctas')
}finally{await db.close()}
