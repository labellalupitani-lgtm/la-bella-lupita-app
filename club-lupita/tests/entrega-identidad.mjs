import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { readFileSync,writeFileSync,readdirSync } from 'node:fs'
import {gzipSync} from 'node:zlib'
import config from '../tailwind.config.js'
const out='../entregables/implementacion-identidad-2026-09-30'
const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:390,height:844}})
await page.addInitScript(()=>{
 window.__metricas={cls:0,lcp:0};new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__metricas.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{window.__metricas.lcp=list.getEntries().at(-1).startTime}).observe({type:'largest-contentful-paint',buffered:true})
})
try{
 const response=await page.goto('http://127.0.0.1:5213/');assert.equal(response.headers()['cache-control'],'no-store')
 await page.getByRole('heading',{name:'Un buen día empieza aquí'}).waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(500)
 const first=await page.evaluate(()=>({color:getComputedStyle(document.body).color,background:getComputedStyle(document.body).backgroundColor,css:[...document.querySelectorAll('link[rel=stylesheet]')].map(e=>e.href),...window.__metricas}))
 await page.reload();await page.getByRole('heading',{name:'Un buen día empieza aquí'}).waitFor();await page.evaluate(()=>document.fonts.ready)
 const warm=await page.evaluate(()=>({color:getComputedStyle(document.body).color,css:[...document.querySelectorAll('link[rel=stylesheet]')].map(e=>e.href)}))
 assert.equal(first.color,'rgb(83, 41, 30)');assert.equal(first.background,'rgb(251, 246, 238)');assert.equal(warm.color,first.color);assert.deepEqual(first.css,warm.css)
 const luminance=hex=>{const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722}
 const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
 const pairs=[['tinta','papel',4.5],['tinta-media','papel',4.5],['tinta','banda-velo',4.5],['contorno','papel',3],['achiote','achiote-velo',4.5],['exito','papel',4.5],['foco','papel',3]].map(([a,b,min])=>{const ratio=contrast(config.theme.colors[a],config.theme.colors[b]);assert(ratio>=min);return{frente:a,fondo:b,ratio:+ratio.toFixed(2),min}})
 const bundles=readdirSync('dist/assets').filter(n=>/^(principal|legado).*\.(css|js)$/.test(n)).map(file=>{const bytes=readFileSync('dist/assets/'+file);return{file,bytes:bytes.length,gzip:gzipSync(bytes).length}})
 const baseline=JSON.parse(readFileSync(out+'/base/bundles.json','utf8'));for(const b of baseline.filter(b=>b.Name.startsWith('legado')))assert(bundles.some(n=>n.file===b.Name&&n.bytes===b.Length),'El artefacto de legado debe ser idéntico')
 writeFileSync(out+'/entrega.json',JSON.stringify({first,warm,contrast:pairs,bundles,legacyIdentical:true,nota:'LCP y CLS son una medición local, sin simulación de red móvil y sin línea base temporal comparable'},null,2))
 console.log(JSON.stringify({cache:'verificada',legacy:'idéntico',contrast:pairs,local:first}))
}finally{await browser.close()}
