import assert from 'node:assert/strict'
import { readFileSync, mkdirSync } from 'node:fs'
import { build } from 'esbuild'
import { Hono } from 'hono'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const out=resolve('.test-output/cabeceras-perfiles.mjs')
mkdirSync('.test-output',{recursive:true})
await build({entryPoints:['src/worker/cabeceras.ts'],bundle:true,platform:'node',format:'esm',outfile:out})
const {CABECERAS_SEGURIDAD,cabecerasSeguras}=await import(pathToFileURL(out))
const app=new Hono()
app.use('*',cabecerasSeguras)
app.get('/ok',c=>c.json({ok:true}))
app.get('/privado',c=>c.json({error:'Acceso requerido'},401))
app.get('/invalido',()=>Response.json({error:'Entrada inválida'},{status:422}))
app.get('/fallo',()=>{throw Error('Prueba de cabeceras de error')})
app.onError((_,c)=>c.json({error:'Error interno'},500))
for(const [path,status] of [['/ok',200],['/privado',401],['/invalido',422],['/inexistente',404],['/fallo',500]]){
 const response=await app.request('https://app.example.test'+path)
 assert.equal(response.status,status)
 for(const [name,value] of Object.entries(CABECERAS_SEGURIDAD))assert.equal(response.headers.get(name),value,path+' '+name)
}
const headers=readFileSync('public/_headers','utf8')
for(const [name,value] of Object.entries(CABECERAS_SEGURIDAD))assert.ok(headers.includes('  '+name+': '+value),name+' política igual en activos y API')
const csp=CABECERAS_SEGURIDAD['Content-Security-Policy']
assert.ok(csp.includes("script-src 'self' https://static.cloudflareinsights.com;"))
assert.ok(csp.includes("connect-src 'self' https://cloudflareinsights.com;"))
assert.ok(!csp.includes('unsafe-eval'))
assert.match(csp,/frame-ancestors 'none'/)
console.log('PASA cabeceras de 200/401/404/500 y política idéntica de activos; scripts del origen y Web Analytics existente de Cloudflare')
