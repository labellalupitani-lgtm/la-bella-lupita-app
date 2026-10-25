import { chromium, firefox } from '../club-lupita/node_modules/playwright/index.mjs'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { vistaAislada } from '../club-lupita/tests/soporte-cliente-perfiles.mjs'

const root=resolve(import.meta.dirname),out=join(root,'evidencia'); mkdirSync(out,{recursive:true})
const axe=readFileSync(join(root,'../club-lupita/node_modules/axe-core/axe.min.js'),'utf8')
const results={fecha:new Date().toISOString(),alcance:'Producción: solo GET/HEAD anónimos. Cuenta y estados: aplicación compilada actual y Worker/SQL aislados; variaciones UI simuladas explícitamente.',publico:[],local:[],errors:[]}
const guardar=()=>writeFileSync(join(out,'resultados.json'),JSON.stringify(results,null,2))
const browser=await chromium.launch({channel:'msedge',headless:true}); results.browser=browser.version()
async function estable(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})))})}
async function inspeccionar(page,name,runAxe=true){
 await estable(page)
 const info=await page.evaluate(()=>({url:location.pathname,title:document.title,width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,
  headings:[...document.querySelectorAll('h1,h2,h3,h4')].filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,text:e.textContent})),
  links:[...document.querySelectorAll('a')].map(e=>({text:e.textContent,href:e.getAttribute('href')})),
  invitation:(()=>{const e=document.querySelector('.casa-nav-invitacion');if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);return {visible:!!e.getClientRects().length,display:s.display,x:b.x,y:b.y,width:b.width,height:b.height,inViewport:b.top>=0&&b.bottom<=innerHeight}})(),
  membershipButton:(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.includes('Tomar una plaza'));if(!e)return null;const b=e.getBoundingClientRect();return {text:e.textContent,disabled:e.disabled,y:b.y,height:b.height}})(),
  resources:performance.getEntriesByType('resource').map(e=>({name:new URL(e.name).pathname,type:e.initiatorType,transfer:e.transferSize,decoded:e.decodedBodySize,duration:Math.round(e.duration)}))}))
 if(runAxe){await page.evaluate(axe);info.axe=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})))}
 await page.screenshot({path:join(out,name+'.png'),fullPage:true});writeFileSync(join(out,name+'.aria.txt'),await page.locator('body').ariaSnapshot());
 info.name=name;console.log(name+' '+JSON.stringify({overflow:info.scrollWidth>info.width,axe:info.axe?.length,invitation:info.invitation,membershipButton:info.membershipButton}));return info
}
let t
try{
 const publicCtx=await browser.newContext({viewport:{width:1440,height:960},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'})
 await publicCtx.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
 const pub=await publicCtx.newPage();pub.on('pageerror',e=>results.errors.push({scope:'public',error:e.message}))
 await pub.goto('https://app.labellalupita.com/club');await pub.getByRole('heading').first().waitFor();results.publico.push(await inspeccionar(pub,'publico-club-1440'))
 results.publicAssets=await pub.locator('script[src]').evaluateAll(es=>es.map(e=>e.getAttribute('src')))
 await pub.setViewportSize({width:390,height:844});results.publico.push(await inspeccionar(pub,'publico-club-390'))
 for(const path of ['/api/catalogo','/api/cupos']){const r=await pub.request.get('https://app.labellalupita.com'+path);results.publico.push({path,status:r.status(),body:await r.json()})}
 await publicCtx.close();guardar()
 process.env.TEST_DIST_DIR='.test-output/conoce-club-dist';t=await vistaAislada()
 await t.db.query("UPDATE membresia SET hasta=now()+interval '15 days',estado='activa',renovacion_consentida=now()")
 const baseline=(await t.request('/api/yo')).body
 writeFileSync(join(out,'cuenta-sintetica.json'),JSON.stringify(baseline,null,2))
 const catalog=(await t.request('/api/catalogo')).body,cupos=(await t.request('/api/cupos')).body
 async function caso(name,width,height,transform,options={}){
  const ctx=await browser.newContext({viewport:{width,height},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'})
  await ctx.route('**/*',r=>new URL(r.request().url()).origin===t.url?r.continue():r.abort())
  await ctx.addInitScript(token=>localStorage.setItem('club-lupita:sesion',token),t.token)
  if(transform) await ctx.route('**/api/yo',r=>r.fulfill({json:transform(structuredClone(baseline))}))
  if(options.cupos)await ctx.route('**/api/cupos',r=>r.fulfill({json:options.cupos(structuredClone(cupos))}))
  if(options.catalog)await ctx.route('**/api/catalogo',r=>r.fulfill({json:options.catalog(structuredClone(catalog))}))
  const page=await ctx.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>results.errors.push({scope:name,error:e.message}))
  await page.goto(t.url+'/club');await page.locator('.club-casa').waitFor()
  if(options.text200)await page.evaluate(()=>document.documentElement.style.fontSize='200%')
  const info=await inspeccionar(page,name,options.axe!==false);info.simulated=!!transform||!!options.cupos||!!options.catalog
  results.local.push(info);guardar();return {ctx,page,info}
 }
 for(const [w,h]of [[1440,960],[1366,768],[900,900],[899,900],[768,1024],[390,844],[320,740]]){const x=await caso('socio-'+w,w,h);await x.ctx.close()}
 const x=await caso('gratuito-1440',1440,960,y=>({...y,membresia:null}));
 await x.page.getByRole('button',{name:'Conocé tu club',exact:true}).click();x.info.sameRouteClick={url:new URL(x.page.url()).pathname,dialogCount:await x.page.getByRole('dialog').count(),focus:await x.page.evaluate(()=>document.activeElement?.textContent)}
 await x.page.getByRole('button',{name:/Tomar una plaza/}).click();await x.page.getByRole('dialog').waitFor();results.local.push(await inspeccionar(x.page,'confirmacion-plaza'))
 await x.page.keyboard.press('Escape');x.info.escapeClosed=await x.page.getByRole('dialog').count()===0
 await x.page.getByRole('navigation',{name:'Navegación principal'}).getByRole('button',{name:'Inicio',exact:true}).click();await x.page.getByRole('button',{name:'Conocé tu club',exact:true}).click();await x.page.locator('.club-casa').waitFor();x.info.navigationFocus=await x.page.evaluate(()=>({tag:document.activeElement?.tagName,id:document.activeElement?.id,title:document.title}))
 await x.ctx.close();guardar()
 const free=y=>({...y,membresia:null})
 for(const [name,trans,opts]of [
 ['gratuito-390',free,{}],['sin-saldo-390',y=>({...free(y),saldo:{pagado:0,bono:0,total:0}}),{}],
 ['sin-cupos-390',free,{cupos:c=>({...c,sociosFundadores:0})}],
 ['en-gracia-390',y=>({...y,membresia:{...y.membresia,estado:'en_gracia',hasta:'2026-10-07T12:00:00Z'}}),{}],
 ['premio-390',y=>({...y,sellos:[],premiosPendientes:1}),{}],
 ['texto200-390',free,{text200:true}],
 ['sin-experiencias-390',free,{catalog:c=>({...c,experiencias:[]})}]
 ]){const a=await caso(name,390,844,trans,opts);await a.ctx.close()}
 const large=await caso('reflujo400-320',320,225,free);await large.ctx.close()
 results.completed=true
}catch(e){results.fatal=e.stack;console.error(e)}finally{guardar();await browser.close();if(t)await t.close()}
