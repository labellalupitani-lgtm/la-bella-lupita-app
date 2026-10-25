import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {mkdirSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {unstable_dev} from 'wrangler'
const root=resolve('.'),dir=resolve('.test-output/consumo-runtime');mkdirSync(dir,{recursive:true})
writeFileSync(dir+'/.dev.vars','')
writeFileSync(dir+'/driver.mjs',`export const neonConfig={};export class Client{};export function neon(){const sql=()=>{const execute=()=>{globalThis.contador=(globalThis.contador??0)+1;return Promise.resolve([{fallidos:0,siguiente:null}])};return {execute,then:(a,b)=>execute().then(a,b)}};sql.transaction=qs=>Promise.all(qs.map(q=>q.execute()));return sql}`)
await build({stdin:{contents:`import {PlanificadorMantenimiento as Base} from './src/worker/planificador';import {app} from './src/worker/index';export class PlanificadorMantenimiento extends Base {cuentas(){return globalThis.contador??0}};export default {async fetch(r,e){const p=new URL(r.url).pathname,s=e.MANTENIMIENTO.getByName('real');if(p==='/tick'){await s.revisar();return Response.json(await s.estado())}if(p==='/iniciar')return Response.json(await s.iniciarCambio());if(p==='/cerrar'){await s.cerrarCambio(await r.json());return Response.json(true)}if(p==='/contador')return Response.json(await s.cuentas());return app.fetch(r,e,{waitUntil(){}})}}`,resolveDir:root},bundle:true,platform:'browser',format:'esm',outfile:dir+'/entry.mjs',external:['cloudflare:workers','node:*'],alias:{'@neondatabase/serverless':dir+'/driver.mjs'}})
const config={name:'consumo-prueba-local',main:dir+'/entry.mjs',compatibility_date:'2026-10-01',compatibility_flags:['nodejs_compat'],vars:{DATABASE_URL:'postgres://local-main',DEMO_DATABASE_URL:'postgres://local-demo',SESION_SECRETO:'solo-fixture'},durable_objects:{bindings:[{name:'MANTENIMIENTO',class_name:'PlanificadorMantenimiento'}]},migrations:[{tag:'v1',new_sqlite_classes:['PlanificadorMantenimiento']}]}
writeFileSync(dir+'/wrangler.json',JSON.stringify(config))
const runtime=await unstable_dev(config.main,{config:dir+'/wrangler.json',local:true,port:0,persist:false,logLevel:'error',experimental:{disableExperimentalWarning:true,disableDevRegistry:true,showInteractiveDevSession:false,watch:false}})
try{
 const pedir=async(path,body)=>{const r=await runtime.fetch(path,body?{method:'POST',body:JSON.stringify(body),headers:{'content-type':'application/json'}}:{});assert.equal(r.status,200,path);return r.json()}
 const primero=await pedir('/tick');assert(primero.ultimoExito>0&&!primero.error)
 const consultas=await pedir('/contador');assert(consultas>0)
 for(let n=0;n<24;n++)await pedir('/tick')
 assert.equal(await pedir('/contador'),consultas)
 const id=await pedir('/iniciar');await pedir('/tick');assert.equal(await pedir('/contador'),consultas)
 await pedir('/cerrar',id);await pedir('/tick');assert((await pedir('/contador'))>consultas)
 const salud=await runtime.fetch('/api/health/datos');assert.equal(salud.status,200);assert.equal((await salud.json()).datos,'disponibles')
 const privado=await runtime.fetch('/api/personal/sistema/consumo');assert.notEqual(privado.status,200)
 console.log('PASA Workers real local: SQLite durable, RPC, 24 revisiones sin SQL, señales antes/después, disponibilidad y acceso privado')
}finally{await runtime.stop()}
