/** Evidencia visual reproducible: mismo dataset sintético, gutter de Windows y fuentes listas. */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
const base=process.env.PREVIEW_URL||'http://127.0.0.1:5290'
const dir=process.env.EVIDENCIA_DIR||'entregables/experiencia-cuenta-2026-10-21/ronda-1'
assert.equal(new URL(base).hostname,'127.0.0.1')
const anchuras=(process.env.ANCHURAS||'320,390,768,899,900,913,960,1024,1120,1440').split(',').map(Number)
await mkdir(dir,{recursive:true})
const browser=await chromium.launch({channel:'msedge',headless:true})
const ctx=await browser.newContext({reducedMotion:'reduce'}),page=await ctx.newPage(),resultados=[],errores=[],externas=[]
await ctx.route('**/*',r=>{const u=r.request().url();if(/^https?:/.test(u)&&new URL(u).origin!==base){externas.push(u);return r.abort()}return r.continue()})
page.on('pageerror',e=>errores.push(e.message))
const status=await(await ctx.request.get(base+'/__preview/status')).json()
assert.ok(status.preview&&status.outbound==='bloqueado')
const axe=await readFile('node_modules/axe-core/axe.min.js','utf8')
async function estado(){return page.evaluate(()=>{
 const main=document.querySelector('main'),header=document.querySelector('.casa-cabecera'),rs=header?.getBoundingClientRect()
 return {ancho:innerWidth,disponible:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,alto:document.documentElement.scrollHeight,cabecera:rs?.height,palabras:main?.innerText.trim().split(/\s+/).length,
 imagenes:[...main?.querySelectorAll('img')||[]].map(i=>({src:i.getAttribute('src'),rota:i.complete&&!i.naturalWidth})),
 acciones:[...main?.querySelectorAll('button,a')||[]].filter(e=>e.getBoundingClientRect().height>0).slice(0,14).map(e=>({texto:e.innerText,top:Math.round(e.getBoundingClientRect().top),height:Math.round(e.getBoundingClientRect().height)}))}
})}
try{
 await page.goto(base+'/__preview/entrar')
 for(const ruta of ['tienda','club','perfil'])for(const width of anchuras){
  await page.setViewportSize({width,height:width>=1100?1000:884})
  await page.goto(base+'/'+ruta);await page.waitForLoadState('networkidle')
  await page.addStyleTag({content:'html{scrollbar-gutter:stable}'});await page.evaluate(()=>document.fonts.ready)
  const row={ruta,width,...await estado()};resultados.push(row)
  if([390,913,1440].includes(width)){
   await page.screenshot({path:`${dir}/${ruta}-${width}.png`});await page.screenshot({path:`${dir}/${ruta}-${width}-completa.png`,fullPage:true})
  }
  if(width===390){
   await page.addScriptTag({content:axe});row.axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})
  }
  if([320,390].includes(width)){
   await page.addStyleTag({content:'html{font-size:200%}'});resultados.push({ruta,width,texto200:'raiz',...await estado()});await page.screenshot({path:`${dir}/${ruta}-${width}-texto200.png`,fullPage:true})
   await page.reload();await page.waitForLoadState('networkidle');await page.addStyleTag({content:'html{scrollbar-gutter:stable}'});await page.evaluate(()=>document.fonts.ready)
   await page.evaluate(()=>{const medidas=[...document.querySelectorAll('body *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const [e,size] of medidas)e.style.fontSize=`${size*2}px`})
   resultados.push({ruta,width,texto200:'computado',...await estado()});await page.screenshot({path:`${dir}/${ruta}-${width}-texto200-computado.png`,fullPage:true})
  }
 }
}finally{await writeFile(dir+'/resultados.json',JSON.stringify({base,status,resultados,errores,externas},null,2));await browser.close()}
console.log(JSON.stringify({vistas:resultados.length,errores,externas,hallazgos:resultados.filter(r=>r.scroll>r.ancho||r.imagenes.some(i=>i.rota)||r.axe?.length)},null,2))
assert.deepEqual(errores,[],'Errores de ejecución')
assert.deepEqual(externas,[],'Peticiones externas')
assert.deepEqual(resultados.filter(r=>r.scroll>r.ancho||r.imagenes.some(i=>i.rota)||r.axe?.length),[],'Desbordamiento, imagen rota o hallazgo de accesibilidad; revisar evidencia')
