import {chromium,firefox} from '../club-lupita/node_modules/playwright/index.mjs'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {vistaAislada} from '../club-lupita/tests/soporte-cliente-perfiles.mjs'
const out=join(import.meta.dirname,'evidencia'),results=[];mkdirSync(out,{recursive:true})
const save=()=>writeFileSync(join(out,'interacciones.json'),JSON.stringify(results,null,2))
process.env.TEST_DIST_DIR='.test-output/conoce-club-dist';const t=await vistaAislada()
await t.db.query("UPDATE membresia SET hasta=now()+interval '15 days',estado='activa',renovacion_consentida=now()")
const yo=(await t.request('/api/yo')).body
const browser=await chromium.launch({channel:'msedge',headless:true})
async function crear(name,{transform,width=390,height=844,catalogFail=false,cuposFail=false,cuentaFail=false,motor=browser}={}){
 const ctx=await motor.newContext({viewport:{width,height},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'})
 await ctx.route('**/*',r=>new URL(r.request().url()).origin===t.url?r.continue():r.abort())
 await ctx.addInitScript(token=>localStorage.setItem('club-lupita:sesion',token),t.token)
 if(transform)await ctx.route('**/api/yo',r=>r.fulfill({json:transform(structuredClone(yo))}))
 for(const [api,fail]of [['catalogo',catalogFail],['cupos',cuposFail],['yo',cuentaFail]])if(fail)await ctx.route('**/api/'+api,r=>r.fulfill({status:503,json:{error:'Fallo sintético de auditoría'}}))
 const page=await ctx.newPage();page.setDefaultTimeout(10000);await page.goto(t.url+'/club');await (cuentaFail?page.getByRole('heading',{name:'No pudimos abrir tu cuenta'}):page.locator('.club-casa')).waitFor();await page.evaluate(()=>document.fonts.ready)
 return{ctx,page,name}
}
async function registrar(x,extra={}){await x.page.screenshot({path:join(out,x.name+'.png'),fullPage:true});results.push({name:x.name,...extra,overflow:await x.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),text:await x.page.getByRole('main').innerText()});save();await x.ctx.close()}
try{
 const asset='/assets/principal-Cfxl5pt5.js',r=await fetch('https://app.labellalupita.com'+asset);const bytes=Buffer.from(await r.arrayBuffer()),local=readFileSync(join(import.meta.dirname,'../club-lupita/.test-output/conoce-club-dist',asset));const sha=b=>createHash('sha256').update(b).digest('hex');
 const home=await fetch('https://app.labellalupita.com/club');results.push({name:'equivalencia-publicacion',status:r.status,localSHA256:sha(local),publicSHA256:sha(bytes),iguales:sha(local)===sha(bytes),headers:Object.fromEntries(['content-security-policy','strict-transport-security','x-frame-options','referrer-policy','cache-control'].map(h=>[h,home.headers.get(h)]))});save()
 for(const [name,opts]of [['error-catalogo',{catalogFail:true}],['error-cupos',{cuposFail:true,transform:y=>({...y,membresia:null})}],['error-cuenta',{cuentaFail:true}]])await registrar(await crear(name,opts))
 let x=await crear('error-canje-fuera-de-vista');await x.ctx.route('**/api/beneficios/solicitar',r=>r.fulfill({status:503,json:{error:'Canje fallido de prueba'}}));await x.page.getByRole('button',{name:'Mostrar código',exact:true}).last().click();await x.page.getByRole('alert').filter({hasText:'Canje fallido'}).waitFor();
 const errorView=await x.page.getByRole('alert').filter({hasText:'Canje fallido'}).evaluate(e=>{const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,viewport:innerHeight,visible:b.top>=0&&b.bottom<=innerHeight}});await registrar(x,{errorView})
 x=await crear('pase-texto-ampliado',{width:320,height:740,transform:y=>({...y,socio:{...y.socio,nombre:'María Alejandra de los Ángeles Rodríguez López'}})})
 await x.page.evaluate(()=>{const es=[...document.querySelectorAll('main *')].filter(e=>e instanceof HTMLElement);const sizes=es.map(e=>parseFloat(getComputedStyle(e).fontSize));es.forEach((e,i)=>e.style.fontSize=(sizes[i]*2)+'px')})
 const card=await x.page.locator('.pase-frente').evaluate(e=>{const b=e.getBoundingClientRect();return {height:b.height,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,children:[...e.children].map(c=>{const r=c.getBoundingClientRect();return{text:c.textContent,top:r.top-b.top,bottom:r.bottom-b.top,outside:r.bottom>b.bottom||r.top<b.top}})}});await registrar(x,{metodo:'Todos los tamaños computados dentro del contenido duplicados; prueba de esfuerzo, no zoom nativo.',card})
 x=await crear('pase-reverso');await x.page.getByRole('button',{name:'Ver cómo usarlo',exact:true}).click();await x.page.screenshot({path:join(out,'pase-reverso-viewport.png')});await registrar(x,{button:await x.page.getByRole('button',{name:'Ver identificación',exact:true}).getAttribute('aria-pressed')})
 await t.db.query('UPDATE tanda SET cerrada=now() WHERE socio_id=$1 AND cerrada IS NULL',[t.id])
 x=await crear('premio-codigo');await x.page.getByRole('button',{name:'Mostrar mi premio',exact:true}).click();await x.page.getByRole('dialog',{name:'Tu bebida de cortesía'}).waitFor();const dialogText=await x.page.getByRole('dialog').innerText();await registrar(x,{dialogText})
 let ff;try{ff=await firefox.launch({headless:true});for(const width of [390,1440]){const f=await crear('firefox-club-'+width,{motor:ff,width,height:844});await f.page.evaluate(readFileSync(join(import.meta.dirname,'../club-lupita/node_modules/axe-core/axe.min.js'),'utf8'));const violations=await f.page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations.map(v=>v.id));await registrar(f,{version:ff.version(),violations})}}catch(e){results.push({name:'firefox',error:e.message})}finally{if(ff)await ff.close()}
}catch(e){results.push({name:'fatal',error:e.stack});console.error(e)}finally{save();await browser.close();await t.close()}
console.log(JSON.stringify(results.map(({text,...r})=>r),null,2))
