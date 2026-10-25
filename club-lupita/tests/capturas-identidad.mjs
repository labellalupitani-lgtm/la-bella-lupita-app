import { chromium } from 'playwright'
import { mkdirSync,writeFileSync,readFileSync } from 'node:fs'
import { join } from 'node:path'
const out='../entregables/implementacion-identidad-2026-09-30/capturas'
mkdirSync(out,{recursive:true})
const browser=await chromium.launch({channel:'msedge',headless:true})
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'})
const page=await ctx.newPage(),result=[]
try {
for(const width of [390,1440]){
 await page.setViewportSize({width,height:844})
 for(const route of ['/','/pedir','/club','/tienda','/perfil','/reservar','/compras','/kit','/personal','/no-existe']){
  await page.goto('http://127.0.0.1:5213'+route);await page.getByRole('main').waitFor();await page.waitForTimeout(250);await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))})
  await page.screenshot({path:join(out,(route.slice(1)||'inicio')+'-'+width+'.png'),fullPage:true})
  if(['/','/pedir','/club'].includes(route))await page.screenshot({path:join(out,(route.slice(1)||'inicio')+'-'+width+'-portada.png')})
  await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')})
  const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}))
  result.push({route,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),violations:audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))})
 }
}
}finally{writeFileSync(join(out,'auditoria.json'),JSON.stringify(result,null,2));await browser.close()}
console.log(JSON.stringify(result.filter(r=>r.overflow||r.violations.length),null,2))
