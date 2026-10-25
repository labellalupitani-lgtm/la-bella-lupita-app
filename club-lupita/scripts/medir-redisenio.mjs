// Comparación local de compilaciones: no equivale a métricas de producción.
import {chromium} from 'playwright'
import {writeFileSync} from 'node:fs'
const browser=await chromium.launch({channel:'msedge',headless:true})
const resultados=[]
try {
  for(const [version,url] of [['antes',process.env.BASELINE_URL||'http://127.0.0.1:5189'],['despues',process.env.PREVIEW_URL||'http://127.0.0.1:5190']]){
    if(new URL(url).hostname!=='127.0.0.1')throw Error('Solo se permiten vistas locales')
    for(let muestra=1;muestra<=3;muestra++){
      const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
      const page=await context.newPage()
      await page.addInitScript(()=>{
        window.__medicion={lcp:0,cls:0}
        new PerformanceObserver(l=>{for(const e of l.getEntries())window.__medicion.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true})
        new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__medicion.cls+=e.value}).observe({type:'layout-shift',buffered:true})
      })
      await page.goto(url+'/__preview/entrar')
      await page.getByRole('heading',{name:'Tu cuenta de casa',exact:true}).waitFor()
      await page.evaluate(()=>document.fonts.ready)
      await page.waitForLoadState('networkidle')
      const metrics=await page.evaluate(()=>({
        ...window.__medicion,
        recursos:performance.getEntriesByType('resource').filter(e=>e.name.includes(location.origin)).map(e=>({archivo:e.name.replace(location.origin,''),bytes:e.encodedBodySize,tipo:e.initiatorType})),
        erroresImagen:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)
      }))
      resultados.push({version,muestra,...metrics}); await context.close()
    }
  }
  const resumen=['antes','despues'].map(version=>{
    const r=resultados.filter(x=>x.version===version)
    const mediana=campo=>r.map(campo).sort((a,b)=>a-b)[1]
    return {version,lcpMs:Math.round(mediana(x=>x.lcp)),cls:mediana(x=>x.cls),bytes:mediana(x=>x.recursos.reduce((n,r)=>n+r.bytes,0)),peticiones:mediana(x=>x.recursos.length)}
  })
  writeFileSync(process.env.EVIDENCIA_RENDIMIENTO||'entregables/redisenio-2026-10-20/evidencia/rendimiento.json',JSON.stringify({nota:'Tres cargas en Edge local, sin limitación de red/CPU; comparar compilaciones, no usar como Core Web Vitals de producción.',resumen,resultados},null,2))
  console.log(JSON.stringify(resumen,null,2))
} finally { await browser.close() }
