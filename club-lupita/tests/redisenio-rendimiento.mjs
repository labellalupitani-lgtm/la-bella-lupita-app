// Comparación de compilaciones locales, con cookies emitidas por el Worker sintético.
import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {writeFileSync,mkdirSync} from 'node:fs'
const urls={antes:process.env.BASELINE_URL||'http://127.0.0.1:5197',despues:process.env.PREVIEW_URL||'http://127.0.0.1:5203'}
for(const u of Object.values(urls))assert.equal(new URL(u).hostname,'127.0.0.1')
const dir='entregables/extension-aprobada-2026-10-21/evidencia/rendimiento'
mkdirSync(dir,{recursive:true});const b=await chromium.launch({channel:'msedge',headless:true}),resultados=[]
try{
 for(const ruta of ['/','/pedir','/club','/personal?seccion=pedidos'])for(let muestra=1;muestra<=3;muestra++)for(const [version,base] of Object.entries(urls)){
  const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
  await c.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort())
  await c.request.get(base+(ruta.startsWith('/personal')?'/__preview/equipo?rol=propietario':'/__preview/entrar'),{maxRedirects:0})
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message))
  await p.addInitScript(()=>{window.__m={lcp:0,cls:0,shifts:[],sesion:0,inicio:0,ultimo:0};new PerformanceObserver(l=>{for(const e of l.getEntries())window.__m.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{const m=window.__m;for(const e of l.getEntries())if(!e.hadRecentInput){m.shifts.push({t:e.startTime,v:e.value});if(e.startTime-m.ultimo>1000||e.startTime-m.inicio>5000){m.sesion=0;m.inicio=e.startTime}m.sesion+=e.value;m.ultimo=e.startTime;m.cls=Math.max(m.cls,m.sesion)}}).observe({type:'layout-shift',buffered:true})})
  await p.goto(base+ruta);await p.getByRole('main').waitFor();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(2000)
  const m=await p.evaluate(()=>({...window.__m,recursos:performance.getEntriesByType('resource').filter(e=>e.name.startsWith(location.origin)).map(e=>({archivo:e.name.replace(location.origin,''),bytes:e.encodedBodySize,tipo:e.initiatorType})),rotas:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),titulo:document.querySelector('h1')?.textContent}))
  resultados.push({version,ruta,muestra,...m,errors});console.log(version+' '+ruta+' '+muestra+' LCP '+Math.round(m.lcp)+'ms');await c.close()
 }
 const resumen=[];for(const ruta of ['/','/pedir','/club','/personal?seccion=pedidos'])for(const version of Object.keys(urls)){const r=resultados.filter(x=>x.ruta===ruta&&x.version===version),med=f=>r.map(f).sort((a,b)=>a-b)[1];resumen.push({ruta,version,lcpMs:Math.round(med(x=>x.lcp)),cls:med(x=>x.cls),bytes:med(x=>x.recursos.reduce((n,r)=>n+r.bytes,0)),peticiones:med(x=>x.recursos.length)})}
 writeFileSync(dir+'/resultados.json',JSON.stringify({nota:'Tres cargas por ruta y versión, intercaladas, Edge local, caché vacía por contexto, sin limitar CPU/red; CLS máximo de ventanas1s/5s. Mide solo estas cuatro rutas; no equivale a Core Web Vitals de producción.',resumen,resultados},null,2));console.log(JSON.stringify(resumen,null,2));assert.ok(resultados.every(r=>!r.rotas.length&&!r.errors.length))
}finally{await b.close()}
