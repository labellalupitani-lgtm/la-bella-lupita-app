/** Comparación local de primera carga: no sustituye métricas de campo. */
import { chromium } from 'playwright'
import { mkdir,writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
const antes=process.env.PREVIEW_ANTES||'http://127.0.0.1:5294',despues=process.env.PREVIEW_URL||'http://127.0.0.1:5296'
const dir=process.env.EVIDENCIA_DIR||'entregables/experiencia-cuenta-2026-10-21/rendimiento'
await mkdir(dir,{recursive:true})
const browser=await chromium.launch({channel:'msedge',headless:true}),resultados=[]
try{for(const [version,base] of [['antes',antes],['despues',despues]]){
 assert.equal(new URL(base).hostname,'127.0.0.1')
 for(const ruta of ['tienda','club','perfil'])for(let vuelta=1;vuelta<=3;vuelta++){
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),p=await ctx.newPage()
  const status=await(await ctx.request.get(base+'/__preview/status')).json();assert.ok(status.preview&&status.outbound==='bloqueado'&&status.frontend==='compilación')
  await ctx.request.get(base+'/__preview/entrar')
  await ctx.addInitScript(()=>{
   window.__medicion={lcp:0,cls:0}
   new PerformanceObserver(l=>{for(const e of l.getEntries())window.__medicion.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true})
   new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__medicion.cls+=e.value}).observe({type:'layout-shift',buffered:true})
  })
  await p.goto(base+'/'+ruta);await p.waitForLoadState('networkidle');await p.evaluate(()=>document.fonts.ready)
  resultados.push({version,ruta,vuelta,...await p.evaluate(()=>({lcp:window.__medicion.lcp,cls:window.__medicion.cls,transferidos:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0),imagenes:performance.getEntriesByType('resource').filter(r=>r.initiatorType==='img').reduce((n,r)=>n+r.transferSize,0)}))})
  await ctx.close()
 }
}}finally{await browser.close();await writeFile(dir+'/resultados.json',JSON.stringify({condiciones:'Edge headless local, 390×844, contexto nuevo por muestra, sin throttle, tres muestras; no métricas de campo',resultados},null,2))}
console.log(JSON.stringify(resultados,null,2))
