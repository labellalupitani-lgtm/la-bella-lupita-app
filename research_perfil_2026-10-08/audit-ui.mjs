import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const root=resolve(import.meta.dirname,'../club-lupita'), require=createRequire(join(root,'package.json'))
const { chromium }=require('playwright')
process.env.TEST_DIST_DIR=resolve(import.meta.dirname,'build')
const { vistaAislada }=await import(pathToFileURL(join(root,'tests/soporte-cliente-perfiles.mjs')))
const t=await vistaAislada(), out=join(import.meta.dirname,'evidencia/ui')
mkdirSync(out,{recursive:true})
const browser=await chromium.launch({channel:'msedge',headless:true})
const axe=readFileSync(join(root,'node_modules/axe-core/axe.min.js'),'utf8')
const results=[],screens=[],errors=[]
const guardar=()=>writeFileSync(join(out,'resultados.json'),JSON.stringify({fecha:new Date().toISOString(),motor:browser.version(),results,screens,errors},null,2))
const base={nombre:'Cliente de auditoría',bebida_siempre:'Café con leche',alergias:'',cumple:'2000-09-14'}
async function abrir(opciones={}){
 const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce',...opciones})
 await ctx.route('**/*',r=>new URL(r.request().url()).origin===t.url?r.continue():r.abort())
 const page=await ctx.newPage();page.setDefaultTimeout(6000)
 page.on('pageerror',e=>errors.push(e.message))
 await page.goto(t.url+'/kit')
 await page.evaluate(token=>localStorage.setItem('club-lupita:sesion',token),t.token)
 await page.goto(t.url+'/perfil');await page.getByRole('button',{name:'Editar mi perfil',exact:true}).waitFor()
 return{ctx,page}
}
async function estable(p){await p.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a=>a.finished.catch(()=>{})))})}
async function captura(p,id,{axeRun=true,fullPage=true}={}){
 await estable(p)
 const geometry=await p.evaluate(()=>({viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,main:document.querySelector('main')?.getBoundingClientRect().toJSON(),edit:Array.from(document.querySelectorAll('button')).find(x=>x.textContent==='Editar mi perfil')?.getBoundingClientRect().toJSON(),logout:Array.from(document.querySelectorAll('button')).find(x=>x.textContent==='Cerrar sesión')?.getBoundingClientRect().toJSON()}))
 let violations=[]
 if(axeRun){
  await p.evaluate(axe)
  violations=await p.evaluate(async()=>{
   const report=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})
   return report.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))
  })
 }
 await p.screenshot({path:join(out,id+'.png'),fullPage})
 writeFileSync(join(out,id+'.aria.txt'),await p.locator('body').ariaSnapshot())
 screens.push({id,geometry,violations});guardar();return{geometry,violations}
}
async function caso(id,fn){let ctx;try{await t.request('/api/perfil',base);const ses=await abrir();ctx=ses.ctx;const detail=await fn(ses.page,ctx);results.push({id,estado:'COMPROBADO',detail});console.log('COMPROBADO '+id)}catch(e){results.push({id,estado:'ERROR_PRUEBA',error:e.message});console.log('ERROR '+id+' '+e.message.slice(0,200))}finally{await ctx?.close();guardar()}}
try{
 await caso('01-diseno-responsive',async p=>{const rows=[];for(const width of[1440,768,390,320]){await p.setViewportSize({width,height:width===1440?960:844});await p.evaluate(()=>scrollTo(0,0));const r=await captura(p,'perfil-'+width);rows.push({width,...r});assert.ok(r.geometry.scrollWidth<=width+1)}return rows})
 await caso('02-borrador-descartado',async p=>{await p.getByRole('button',{name:'Editar mi perfil',exact:true}).click();await p.getByLabel('Tu nombre',{exact:true}).fill('Borrador todavía no guardado');await p.keyboard.press('Escape');await p.getByRole('button',{name:'Editar mi perfil',exact:true}).click();const value=await p.getByLabel('Tu nombre',{exact:true}).inputValue();assert.equal(value,base.nombre);return{borradorPerdido:true,nombreAlReabrir:value}})
 await caso('03-guardado-y-reapertura',async p=>{
  let release;const gate=new Promise(r=>release=r);let started=false
  await p.route(t.url+'/api/perfil',async r=>{started=true;await gate;await r.continue()})
  await p.getByRole('button',{name:'Editar mi perfil',exact:true}).click();await p.getByLabel('Tu nombre',{exact:true}).fill('Nombre nuevo confirmado')
  await p.getByRole('button',{name:'Guardar cambios',exact:true}).click();await p.getByRole('button',{name:'Guardando…',exact:true}).waitFor();assert.ok(started)
  await p.keyboard.press('Escape');await p.getByRole('button',{name:'Editar mi perfil',exact:true}).click()
  release();await p.waitForResponse(r=>r.url()===t.url+'/api/yo'&&r.status()===200);await p.getByRole('heading',{name:'Nombre nuevo confirmado',exact:true}).waitFor()
  const valor=await p.getByLabel('Tu nombre',{exact:true}).inputValue();assert.equal(valor,base.nombre)
  await p.getByLabel('Tu bebida de siempre · opcional',{exact:true}).fill('Chocolate')
  await captura(p,'guardado-reapertura-borrador-antiguo')
  await p.getByRole('button',{name:'Guardar cambios',exact:true}).click();await p.getByText('Tu perfil quedó guardado',{exact:true}).waitFor()
  const final=(await t.request('/api/yo')).body.socio;assert.equal(final.nombre,base.nombre)
  return{borradorViejoTrasGuardar:valor,segundoGuardadoRevirtioNombre:true,final:{nombre:final.nombre,bebida:final.bebida_siempre}}
 })
 await caso('04-guardado-refresco-fallido',async p=>{
  await p.route(t.url+'/api/yo',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Fallo sintético al consultar cuenta'})}))
  await p.getByRole('button',{name:'Editar mi perfil',exact:true}).click();await p.getByLabel('Tu nombre',{exact:true}).fill('Guardado correcto en servidor')
  await p.getByRole('button',{name:'Guardar cambios',exact:true}).click();await p.getByText('Tu perfil quedó guardado',{exact:true}).waitFor()
  const dbName=(await t.request('/api/yo')).body.socio.nombre;assert.equal(dbName,'Guardado correcto en servidor')
  const head=await p.locator('.casa-perfil-identidad h2').innerText();assert.equal(head,base.nombre)
  const alerts=await p.getByRole('alert').allTextContents();await captura(p,'guardado-con-datos-antiguos')
  return{servidor:dbName,pantalla:head,avisoGlobal:alerts,confirmacionGuardado:true}
 })
 await caso('05-guardado-espera-catalogo',async p=>{
  let release;const gate=new Promise(r=>release=r)
  await p.route(t.url+'/api/catalogo',async r=>{await gate;await r.continue()})
  await p.getByRole('button',{name:'Editar mi perfil',exact:true}).click();await p.getByLabel('Tu nombre',{exact:true}).fill('Guardado esperando catálogo')
  const response=p.waitForResponse(r=>r.url()===t.url+'/api/yo'&&r.status()===200)
  await p.getByRole('button',{name:'Guardar cambios',exact:true}).click();await response
  const busy=await p.getByRole('button',{name:'Guardando…',exact:true}).isVisible();const saved=(await t.request('/api/yo')).body.socio.nombre;assert.ok(busy);assert.equal(saved,'Guardado esperando catálogo')
  release();await p.getByText('Tu perfil quedó guardado',{exact:true}).waitFor();return{cuentaYaGuardadaYLeida:true,esperabaCatalogo:busy}
 })
 await caso('06-error-servidor',async p=>{
  await p.getByRole('button',{name:'Editar mi perfil',exact:true}).click();await p.getByLabel('Tu cumpleaños · opcional',{exact:true}).fill('2999-01-01');await p.getByRole('button',{name:'Guardar cambios',exact:true}).click()
  await p.getByRole('alert').waitFor();const r=await captura(p,'formulario-error-fecha')
  return{mensaje:await p.getByRole('alert').innerText(),campos:await p.locator('dialog input').evaluateAll(es=>es.map(e=>({type:e.type,invalid:e.getAttribute('aria-invalid'),describedby:e.getAttribute('aria-describedby'),max:e.getAttribute('max')}))),...r}
 })
 await caso('07-nombre-largo',async p=>{
  await t.request('/api/perfil',{...base,nombre:'M'.repeat(80),bebida_siempre:'Café '.repeat(24),alergias:'Alergia sintética '.repeat(12)})
  await p.reload();await p.getByRole('button',{name:'Editar mi perfil',exact:true}).waitFor();await p.setViewportSize({width:320,height:844});const r=await captura(p,'perfil-nombre-largo-320');return r
 })
 await caso('08-historial',async p=>{
  await p.getByRole('button',{name:'Ver toda mi actividad',exact:true}).click();await p.getByRole('list',{name:'Movimientos de tu cuenta'}).getByRole('listitem').first().waitFor();const r=await captura(p,'actividad')
  await p.getByRole('button',{name:'Canjes',exact:true}).click();await p.getByText('Todavía no hay movimientos en este filtro',{exact:true}).waitFor();await captura(p,'actividad-vacia');return r
 })
 await caso('09-clipboard-error',async(p,ctx)=>{
  await ctx.grantPermissions(['clipboard-read','clipboard-write']);await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('Denegado sintético')}}}))
  await p.getByRole('button',{name:'Copiar enlace del Club',exact:true}).click();await p.getByRole('alert').waitFor();const text=await p.getByRole('alert').innerText();assert.ok(text.includes('No pudimos copiarlo'));return{fallback:text}
 })
 await caso('10-fechas-dos-zonas',async()=>{
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,creado) VALUES($1,100,'recarga','Fecha límite sintética','2026-10-09T02:00:00Z')",[t.id])
  const {ctx,page:p}=await abrir({timezoneId:'Europe/Madrid'});try{
   const resumen=await p.locator('li').filter({hasText:'Fecha límite sintética'}).innerText()
   await p.getByRole('button',{name:'Ver toda mi actividad',exact:true}).click();await p.getByRole('dialog').getByText('Fecha límite sintética',{exact:true}).waitFor()
   const detalle=await p.getByRole('dialog').getByRole('listitem').filter({hasText:'Fecha límite sintética'}).innerText();await captura(p,'actividad-zona-madrid');return{zona:'Europe/Madrid',resumen,detalle}
  }finally{await ctx.close()}
 })
 await caso('11-cierre-de-sesion',async(p,ctx)=>{
  const p2=await ctx.newPage();await p2.goto(t.url+'/perfil');await p2.getByRole('button',{name:'Editar mi perfil',exact:true}).waitFor()
  await p.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await p.getByRole('heading',{name:'Tres generaciones Una taza',exact:true}).waitFor();await p2.getByRole('heading',{name:'Tres generaciones Una taza',exact:true}).waitFor()
  assert.equal(await p.evaluate(()=>localStorage.getItem('club-lupita:sesion')),null)
  const replay=(await t.request('/api/yo',undefined,t.token)).status;return{saleEnDosPestanas:true,tokenReutilizableTrasCerrar:replay===200,statusToken:replay}
 })
}finally{guardar();await browser.close();await t.close()}
if(results.some(r=>r.estado==='ERROR_PRUEBA'))process.exitCode=1
