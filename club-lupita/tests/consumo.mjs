import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { preparar } from './soporte-perfiles-equipo.mjs'
const dir=resolve('.test-output/consumo');mkdirSync(dir,{recursive:true})
writeFileSync(dir+'/driver.mjs',`export const neonConfig={};export class Client{constructor(){this.db=globalThis.__consumoDb}async connect(){}async end(){}query(q,p){return this.db.query(q,p)}};export const neon=()=>{const sql=(parts,...p)=>{const q=parts.reduce((s,t,i)=>s+(i?'$'+i:'')+t,'');const execute=()=>globalThis.__consumoDb.query(q,p).then(r=>r.rows);return {execute,then:(a,b)=>execute().then(a,b)}};sql.transaction=async qs=>{const out=[];for(const q of qs)out.push(await q.execute());return out};return sql}`)
await build({entryPoints:['src/worker/mantenimiento.ts','src/worker/cuota.ts','src/casa/actualizacion-activa.ts'],outdir:dir,bundle:true,platform:'node',format:'esm',outExtension:{'.js':'.mjs'},alias:{'@neondatabase/serverless':dir+'/driver.mjs'}})
const m=await import(pathToFileURL(dir+'/worker/mantenimiento.mjs'))
const {resumirCuota}=await import(pathToFileURL(dir+'/worker/cuota.mjs'))
let estado=m.estadoInicial(),lecturas=0,limpiezas=0
const almacen={leer:()=>structuredClone(estado),guardar:e=>{estado=structuredClone(e)}}
const ahora=Date.UTC(2026,9,23)
const tarea=async limpiar=>{lecturas++;if(limpiar)limpiezas++;return ahora+m.DIA}
for(let hora=0;hora<24;hora++)await m.ejecutarPlan(almacen,tarea,ahora+hora*m.HORA)
assert.equal(lecturas,1);assert.equal(limpiezas,1)
console.log('PASA 24 revisiones horarias sin pendientes: 1 acceso diario, 23 sin SQL')
estado={...m.estadoInicial(),siguiente:ahora+3*m.HORA,limpieza:ahora}
await m.ejecutarPlan(almacen,async()=>{throw Error('No debe consultar antes')},ahora+2*m.HORA)
let ejecutado=await m.ejecutarPlan(almacen,async limpiar=>{assert.equal(limpiar,false);return ahora+m.DIA},ahora+3*m.HORA)
assert.equal(ejecutado.ejecutado,true)
console.log('PASA vencimiento programado conserva cadencia horaria sin limpieza repetida')
m.marcarCambio(almacen)
let liberar;const trabajo=new Promise(r=>{liberar=r})
const corriendo=m.ejecutarPlan(almacen,async()=>{await trabajo;return ahora+m.DIA},ahora)
m.marcarCambio(almacen);liberar();await corriendo;assert.equal(estado.siguiente,0)
console.log('PASA cambio concurrente durante SQL conserva una nueva revisión pendiente')
estado={...m.estadoInicial(),escrituras:{interrumpida:ahora+120000}}
assert.equal((await m.ejecutarPlan(almacen,tarea,ahora)).ejecutado,false)
await m.ejecutarPlan(almacen,tarea,ahora+m.HORA);assert.deepEqual(estado.escrituras,{})
console.log('PASA escritura interrumpida se recupera al vencer la señal durable')
estado=m.estadoInicial();await m.ejecutarPlan(almacen,async()=>{throw Error('sin cuota')},ahora)
assert.equal(estado.error,true);assert.equal(estado.siguiente,ahora+m.HORA)
await m.ejecutarPlan(almacen,tarea,ahora+m.HORA);assert.equal(estado.error,false)
console.log('PASA fallo conserva trabajo, espera y se recupera sin bucle agresivo')
for(const n of [59,60,80,90,101]){
 const q=resumirCuota({compute_time_seconds:n*3600,consumption_period_start:'2026-10-01T00:00:00Z',consumption_period_end:'2026-11-01T00:00:00Z'},[],ahora)
 assert.equal(q.umbral,n===59?0:n===101?100:n)
}
assert.throws(()=>resumirCuota({compute_time_seconds:-1,consumption_period_start:'x',consumption_period_end:'x'},[],ahora))
console.log('PASA umbrales 60/80/90/100, proyección y rechazo de contadores inválidos')
const f=await preparar();globalThis.__consumoDb=f.db
try{
 await f.db.exec("UPDATE membresia SET hasta=now()+interval '3 hours'; UPDATE socio SET baja=NULL")
 const siguiente=await m.siguienteTrabajo(f.env,Date.now())
 assert(siguiente>Date.now()+2*m.HORA&&siguiente<Date.now()+4*m.HORA)
 await f.db.exec("UPDATE membresia SET estado='vencida'")
 const instante=Date.now();assert.equal(await m.siguienteTrabajo(f.env,instante),instante+m.DIA)
 await m.limpiarDatos(f.env)
 console.log('PASA SQL real en PGlite: vencimientos, ausencia de tareas y limpieza agrupada')
 let claves=[]
 await f.worker.mantenerEntornos({...f.env,MANTENIMIENTO:{getByName:n=>{claves.push(n);return {revisarCuota:async()=>{},revisar:async()=>{}}}}})
 assert.deepEqual(claves,['real']);console.log('PASA cron no visita demostración')
}finally{await f.db.close()}
// Reloj determinista del navegador: sin esperas reales ni solicitudes remotas.
const guardar={window:globalThis.window,document:globalThis.document,performance:globalThis.performance,navigator:globalThis.navigator}
let t=0,tick,consultas=0
globalThis.window=new EventTarget();globalThis.document=new EventTarget();globalThis.document.visibilityState='visible'
globalThis.window.setInterval=fn=>{tick=fn;return 1};globalThis.window.clearInterval=()=>{}
Object.defineProperty(globalThis,'performance',{configurable:true,value:{now:()=>t}})
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{onLine:true}})
const {actualizarConActividad}=await import(pathToFileURL(dir+'/casa/actualizacion-activa.mjs'))
const flush=()=>new Promise(r=>setImmediate(r))
const parar=actualizarConActividad(async()=>{consultas++},60000)
t=60000;tick();await flush();assert.equal(consultas,1)
t=180000;tick();await flush();assert.equal(consultas,1)
t=3600000;tick();await flush();assert.equal(consultas,1)
window.dispatchEvent(new Event('pointerdown'));await flush();assert.equal(consultas,2)
window.dispatchEvent(new Event('focus'));await flush();assert.equal(consultas,2)
document.visibilityState='hidden';t+=60000;tick();await flush();assert.equal(consultas,2)
document.visibilityState='visible';document.dispatchEvent(new Event('visibilitychange'));await flush();assert.equal(consultas,3)
parar();t+=60000;window.dispatchEvent(new Event('focus'));await flush();assert.equal(consultas,3)
for(const [key,value] of Object.entries(guardar))Object.defineProperty(globalThis,key,{configurable:true,value})
console.log('PASA pestaña inactiva/oculta sin consultas; reanuda una vez y limpia sus escuchas')
