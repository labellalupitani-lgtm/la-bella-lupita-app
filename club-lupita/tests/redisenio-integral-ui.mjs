/** Revisión transversal del rediseño en servidor sintético; complementa recorridos transaccionales. */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs'
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5198'
assert.equal(new URL(base).hostname,'127.0.0.1')
const dir=process.env.EVIDENCIA_DIR||'entregables/extension-aprobada-2026-10-21/evidencia/integral'
mkdirSync(dir,{recursive:true})
const rutas=['/','/pedir','/tienda','/club','/conoce-tu-club','/perfil','/compras','/reservas','/reservar','/kit','/__ruta-desconocida__']
const secciones=['resumen','pedidos','caja','club','tienda','entregas','agenda','atencion','informes','clientes','equipo','seguridad']
const browser=await chromium.launch({channel:'msedge',headless:true})
const results=[],errors=[],external=[]
const axeSource=readFileSync('node_modules/axe-core/axe.min.js','utf8')
async function contexto(){
 const ctx=await browser.newContext({reducedMotion:'reduce'})
 await ctx.route('**/*',route=>{const u=route.request().url();if(/^https?:/.test(u)&&new URL(u).origin!==base){external.push(u);return route.abort()}return route.continue()})
 return ctx
}
function guardar(){writeFileSync(dir+'/resultados.json',JSON.stringify({base,results,errors,external},null,2))}
async function estable(page){
 await page.waitForLoadState('networkidle',{timeout:15000}).catch(()=>{})
 await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))})
}
async function medir(page){return page.evaluate(()=>({
 overflow:document.documentElement.scrollWidth>innerWidth+1,
 ancho:innerWidth,contenido:document.documentElement.scrollWidth,
 font:getComputedStyle(document.body).fontFamily,
 rotas:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),
 salientes:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left<-1)&&!e.closest('.carril,[role=region]')}).slice(0,8).map(e=>({tag:e.tagName,clase:e.className,texto:e.textContent.slice(0,70)}))
}))}
try{
 const ctx=await contexto(),page=await ctx.newPage();page.setDefaultTimeout(20000)
 const status=await(await ctx.request.get(base+'/__preview/status')).json();assert.ok(status.preview&&status.outbound==='bloqueado'&&status.equipo)
 page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}))
 await page.goto(base+'/__preview/entrar')
 for(const ruta of rutas){
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:width===1440?1000:844});await page.goto(base+ruta);await estable(page)
   const name=ruta==='/'?'inicio':ruta.slice(1),m=await medir(page)
   if(width===390||width===1440)await page.screenshot({path:`${dir}/cliente-${name}-${width}.png`,fullPage:true})
   results.push({area:'cliente',ruta,width,...m})
   if(width===390){
    await page.addScriptTag({content:axeSource})
    const violations=await page.evaluate(async()=>{const r=await axe.run(document.querySelector('main')||document.body,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})
    results.push({area:'cliente',ruta,axe:violations})
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');await estable(page)
    results.push({area:'cliente',ruta,texto200:true,...await medir(page)})
    await page.screenshot({path:`${dir}/cliente-${name}-texto200.png`})
   }
   guardar()
  }console.log('CLIENTE '+ruta)
 }
 await ctx.close()
 const staff=await contexto(),p=await staff.newPage();p.setDefaultTimeout(20000)
 p.on('pageerror',e=>errors.push({url:p.url(),message:e.message}))
 await p.goto(base+'/__preview/equipo?rol=propietario')
 for(const seccion of secciones){
  for(const width of [320,390,768,1440]){
   await p.setViewportSize({width,height:width===1440?1000:844});await p.goto(base+'/personal?seccion='+seccion);await estable(p)
   results.push({area:'equipo',seccion,rol:'propietario',width,...await medir(p)})
   if(width===390||width===1440)await p.screenshot({path:`${dir}/equipo-${seccion}-${width}.png`,fullPage:true})
   if(width===390){
    await p.addScriptTag({content:axeSource})
    const violations=await p.evaluate(async()=>{const r=await axe.run(document.querySelector('main')||document.body,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})
    results.push({area:'equipo',seccion,axe:violations})
    await p.evaluate(()=>document.documentElement.style.fontSize='200%');await estable(p)
    results.push({area:'equipo',seccion,texto200:true,...await medir(p)})
    await p.screenshot({path:`${dir}/equipo-${seccion}-texto200.png`})
   }guardar()
  }console.log('EQUIPO '+seccion)
 }
 await staff.close()
 assert.deepEqual(errors,[],'Errores de ejecución');assert.deepEqual(external,[],'Peticiones externas')
 const fallos=results.filter(r=>r.overflow||r.rotas?.length||r.axe?.length||r.font&&!r.font.includes('Montserrat'))
 assert.deepEqual(fallos,[],'Hallazgos transversales; revisar resultados.json')
}finally{guardar();await browser.close()}
console.log('PASS '+results.length+' revisiones transversales')
