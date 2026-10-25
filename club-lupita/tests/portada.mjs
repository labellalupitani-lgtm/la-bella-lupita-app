import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { vistaAislada } from './soporte-ui.mjs'
const t=await vistaAislada()
const browser=await chromium.launch({channel:'msedge',headless:true})
const out='../entregables/portada-2026-10-01'
mkdirSync(out,{recursive:true})
const page=await browser.newPage()
const errors=[]; page.on('pageerror',e=>errors.push(e.message))
const results=[]
try {
 for(const [width,height] of [[320,740],[390,844],[768,1024],[1024,768],[1440,960],[2560,980]]) {
  await page.setViewportSize({width,height});await page.goto(t.url);await page.getByRole('button',{name:'Continuar con mi correo'}).waitFor();await page.evaluate(()=>document.fonts.ready)
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Desbordamiento a '+width)
  await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')})
  const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}))
  assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[])
  if([390,1440,2560].includes(width))await page.screenshot({path:out+'/portada-'+width+'.png',fullPage:true})
  results.push({width,height,overflow:false,accessibilityViolations:0})
 }
 await page.setViewportSize({width:390,height:844})
 await page.goto(t.url+'/?demo');await page.route('**/api/auth/codigo',async r=>{await new Promise(resolve=>setTimeout(resolve,500));await r.fulfill({status:503,json:{error:'La demostración está en mantenimiento. Intentá de nuevo.'}})})
 await page.getByRole('button',{name:'Explorar la demostración'}).click()
 await page.getByRole('button',{name:'Abriendo la demostración…'}).waitFor()
 assert(await page.getByRole('button',{name:'Abriendo la demostración…'}).isDisabled())
 await page.getByRole('alert').waitFor();assert(await page.getByRole('button',{name:'Explorar la demostración'}).isEnabled())
 await page.unroute('**/api/auth/codigo')
 await page.getByRole('button',{name:'Explorar la demostración'}).click()
 await page.getByRole('heading',{name:'Un buen día empieza aquí'}).waitFor()
 assert.deepEqual(errors,[])
 writeFileSync(out+'/verificacion.json',JSON.stringify({viewports:results,loading:true,retry:true,demoLogin:true,jsErrors:errors},null,2))
 console.log('OK Portada: seis tamaños, accesibilidad, carga, recuperación y entrada real con API local aislada.')
} finally {await browser.close();await t.close()}
