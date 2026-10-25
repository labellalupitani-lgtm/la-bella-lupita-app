import { createServer } from 'node:http'
import { readFileSync,writeFileSync,existsSync,mkdirSync } from 'node:fs'
import {resolve,join,extname} from 'node:path'
import {chromium} from 'playwright'
import {gzipSync} from 'node:zlib'
import {readdirSync} from 'node:fs'
const base=resolve('../entregables/identidad-marca-v3-2026-09-29'),out=resolve('../entregables/implementacion-identidad-2026-09-30/comparacion')
mkdirSync(out,{recursive:true})
const server=createServer((req,res)=>{const file=resolve(base,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(base+'\\')||!existsSync(file)){res.writeHead(404);res.end();return}res.setHeader('content-type',({'.html':'text/html','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'})[extname(file)]||'application/octet-stream');res.end(readFileSync(file))})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'})
const metrics=[]
try{
 for(const [name,path] of [['inicio','/'],['pedir','/pedir'],['club','/club']]){
  for(const kind of ['referencia','aplicacion']){
   await page.goto(kind==='referencia'?`http://127.0.0.1:${server.address().port}/pantalla.html?vista=${name}`:'http://127.0.0.1:5213'+path)
   if(kind==='aplicacion')await page.getByRole('main').waitFor()
   await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))})
   await page.waitForTimeout(200);await page.screenshot({path:join(out,name+'-'+kind+'.png')})
   metrics.push({name,kind,...await page.evaluate(()=>({background:getComputedStyle(document.body).backgroundColor,fonts:[...new Set([...document.querySelectorAll('h1,h2,input,button')].map(e=>getComputedStyle(e).fontFamily))],heading:[...document.querySelectorAll('h1,h2')].slice(0,3).map(e=>({text:e.textContent,size:getComputedStyle(e).fontSize,lineHeight:getComputedStyle(e).lineHeight,box:e.getBoundingClientRect().toJSON()})),images:[...document.images].filter(e=>e.getBoundingClientRect().y<844).map(e=>({src:e.getAttribute('src'),width:e.width,height:e.height,filter:getComputedStyle(e).filter}))}))})
  }
 }
 const css=readdirSync('dist/assets').filter(n=>/^principal.*\.(css|js)$/.test(n)).map(n=>({file:n,bytes:readFileSync('dist/assets/'+n).length,gzip:gzipSync(readFileSync('dist/assets/'+n)).length}))
 writeFileSync(join(out,'mediciones.json'),JSON.stringify({metrics,bundles:css},null,2))
 const cards=['inicio','pedir','club'].map(n=>`<section><h2>${n}</h2><div class="pareja"><figure><figcaption>Referencia aprobada</figcaption><img src="${n}-referencia.png"></figure><figure><figcaption>Aplicación con funciones reales</figcaption><img src="${n}-aplicacion.png"></figure></div></section>`).join('')
 writeFileSync(join(out,'comparacion.html'),`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Revisión visual V3</title><style>body{background:#FBF6EE;color:#53291E;font:16px system-ui;margin:32px}h1,h2{font-family:Georgia;font-weight:400}.pareja{display:flex;gap:24px;flex-wrap:wrap}figure{margin:0}figcaption{margin-bottom:12px}img{width:390px;max-width:100%;border:1px solid #D7C1A5}section{margin:40px 0}</style><h1>Referencia e implementación</h1><p>Mismo ancho de 390 px · Las diferencias de contenido corresponden a datos y funciones reales</p>${cards}</html>`)
}finally{await browser.close();await new Promise(r=>server.close(r))}
console.log('Comparación de las tres portadas guardada')
