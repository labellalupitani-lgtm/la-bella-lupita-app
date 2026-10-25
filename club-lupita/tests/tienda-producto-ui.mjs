// Estados reales sobre Worker/PGlite aislados: ninguna operación externa.
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {chromium} from 'playwright'
import {vistaAislada} from './soporte-ui.mjs'
import {tlsLocal} from './tienda-tls.mjs'
import {fichaPrueba} from './tienda-fixture.mjs'

const dir=process.env.EVIDENCIA_DIR||'entregables/tienda-producto-2026-10-22/pruebas'
mkdirSync(dir,{recursive:true})
const t=await vistaAislada({tls:tlsLocal()}),resultados=[],errores=[]
const browser=await chromium.launch({channel:'msedge',headless:true})
const ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},reducedMotion:'reduce'})
await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
await ctx.addInitScript(token=>{if(!sessionStorage.getItem('fixture-tienda-producto')){localStorage.setItem('club-lupita:sesion',token);sessionStorage.setItem('fixture-tienda-producto','1')}},t.token)
const page=await ctx.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errores.push(e.message))
const caso=async(nombre,fn)=>{await fn();resultados.push({nombre,ok:true});console.log('PASA '+nombre)}
const abrir=async()=>{await page.goto(t.url+'/tienda');await page.locator('main h1').waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250)}
const fixture=async f=>{await t.db.query('UPDATE tienda_lote SET ficha=$1::jsonb',[JSON.stringify(f)]);await abrir()}
const revisar=async nombre=>{
 // El cambio de viewport puede seleccionar otro srcset después del primer layout.
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete),{},{timeout:8000})
 await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,1500))])))})
 const estado=await page.evaluate(()=>({desborde:document.documentElement.scrollWidth>innerWidth,rotas:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')),h1:document.querySelectorAll('main h1').length,texto:document.querySelector('main').innerText}))
 assert.equal(estado.desborde,false,nombre);assert.deepEqual(estado.rotas,[],nombre);assert.equal(estado.h1,1,nombre);assert.ok(!estado.texto.includes('Por confirmar al Por confirmar'),nombre)
 await page.screenshot({path:dir+'/'+nombre+'.png',fullPage:true})
 resultados.push({vista:nombre,desborde:false,imagenesRotas:0,palabrasVisibles:estado.texto.split(/\s+/).length})
}
try{
 await abrir()
 await caso('oferta incompleta: consulta dominante, sin cobro ni filas pendientes repetidas',async()=>{
  await page.getByRole('link',{name:/Consultar este lote/}).waitFor()
  assert.equal(await page.getByRole('button',{name:'Apartar la mía',exact:true}).count(),0)
  assert.equal(await page.getByLabel('Cantidad aproximada (opcional)').isVisible(),false)
  for(const [width,height] of [[320,568],[390,844],[768,1024],[913,900],[1440,900]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));await revisar('incompleta-'+width)
   if(width===390){const box=await page.getByRole('link',{name:/Consultar este lote/}).boundingBox(),nav=await page.locator('.casa-nav-movil').boundingBox();assert.ok(box.y+box.height<=(nav?.y??height),'Consulta fuera de primera vista móvil: '+JSON.stringify(box));await page.screenshot({path:dir+'/viewport-390.png',fullPage:false})}
  }
 })
 await caso('detalles accesibles por teclado; encargos conserva contexto sin enviar',async()=>{
  await page.setViewportSize({width:390,height:844})
  const retiro=page.locator('summary').filter({hasText:'Retiro y condiciones'});await retiro.focus();await page.keyboard.press('Enter')
  await revisar('retiro-incompleto')
  const encargo=page.locator('summary').filter({hasText:'Regalos y café para oficina'});await encargo.focus();await page.keyboard.press('Enter')
  await page.getByLabel('Cantidad aproximada (opcional)').fill('12 bolsas');await page.getByLabel('Zona de retiro o entrega (opcional)').fill('Matagalpa')
  const enlace=page.getByRole('link',{name:/Preparar consulta/});assert.match(decodeURIComponent(await enlace.getAttribute('href')),/12 bolsas.*Matagalpa/)
  assert.equal(await enlace.getAttribute('target'),'_blank');await revisar('encargo-abierto')
 })
 await caso('texto al 200% y movimiento reducido conservan reflujo y acción alcanzable',async()=>{
  await abrir();await page.setViewportSize({width:320,height:700})
  await page.evaluate(()=>{const nodes=[...document.querySelectorAll('body *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const [e,size] of nodes)if(e instanceof HTMLElement)e.style.fontSize=size*2+'px'})
  await revisar('texto200-320')
  await page.screenshot({path:dir+'/texto200-viewport-inicial.png',fullPage:false})
  const heading=page.locator('main h1');await heading.scrollIntoViewIfNeeded()
  let headingBox=await heading.boundingBox(),navTitle=await page.locator('.casa-nav-movil').boundingBox()
  if(headingBox.y+headingBox.height>navTitle.y)await page.evaluate(offset=>scrollBy(0,offset),headingBox.y+headingBox.height-navTitle.y+24)
  headingBox=await heading.boundingBox();assert.ok(headingBox.y>=0&&headingBox.y+headingBox.height<=navTitle.y,'Nombre no puede exponerse completo al desplazar')
  await page.screenshot({path:dir+'/texto200-viewport-titulo.png',fullPage:false})
  const cta=page.getByRole('link',{name:/Consultar este lote/});await cta.focus();await cta.scrollIntoViewIfNeeded();const box=await cta.boundingBox(),nav=await page.locator('.casa-nav-movil').boundingBox();assert.ok(box.y>=0&&box.y+box.height<=(nav?.y??700),'CTA obstruida con texto ampliado')
  await page.screenshot({path:dir+'/texto200-viewport-accion.png',fullPage:false})
  await page.locator('summary').filter({hasText:'Regalos y café para oficina'}).click()
  await page.getByLabel('Cantidad aproximada (opcional)').fill('12 bolsas')
  await page.getByLabel('Zona de retiro o entrega (opcional)').fill('Matagalpa')
  const nota=page.getByRole('complementary',{name:'Vista previa de tu consulta'})
  const colisiones=await nota.evaluate(e=>[...e.querySelectorAll('dl > div')].map(row=>{
   const dt=row.querySelector('dt'),dd=row.querySelector('dd'),r=document.createRange();r.selectNodeContents(dt)
   const a=r.getBoundingClientRect(),b=dd.getBoundingClientRect()
   return {etiqueta:dt.textContent,solapa:a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top}
  }).filter(x=>x.solapa))
  assert.deepEqual(colisiones,[],'Etiquetas de consulta invaden sus valores con texto 200%')
  await revisar('texto200-encargo-320')
 })
 await caso('foto de ficha tiene prioridad y fallo recupera imagen contextual identificada',async()=>{
  await page.setViewportSize({width:390,height:844})
  await fixture({...fichaPrueba,foto:'/images/salon-vip-cafe-ventana-240.webp',fotoAlt:'Foto sintética de ficha para ensayo'})
  await page.getByRole('img',{name:'Foto sintética de ficha para ensayo',exact:true}).waitFor();await revisar('foto-publicada')
  await page.route('**/images/salon-vip-cafe-ventana-240.webp',r=>r.abort())
  await fixture({...fichaPrueba,foto:'/images/salon-vip-cafe-ventana-240.webp',fotoAlt:'Foto sintética de ficha para ensayo'})
  await page.getByText(/imagen de ambiente/).waitFor();await revisar('foto-producto-fallida')
  await page.unroute('**/images/salon-vip-cafe-ventana-240.webp')
 })
 await caso('oferta completa mantiene consentimiento y todas las condiciones antes del pago',async()=>{
  await fixture(fichaPrueba)
  await page.getByRole('button',{name:'Apartar la mía',exact:true}).click()
  const dialog=page.getByRole('dialog',{name:'Confirmá tu Reserva de Cosecha'});await dialog.waitFor()
  assert.equal(await dialog.getByRole('button',{name:/Pagar/}).isDisabled(),true)
  for(const texto of [fichaPrueba.lugar,fichaPrueba.horario,fichaPrueba.politica])assert.ok((await dialog.innerText()).includes(texto))
  await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')})
  const axe=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(axe.violations.map(v=>({id:v.id,nodos:v.nodes.length})),[])
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await revisar('completa-390')
 })
 await caso('axe de la pantalla y ausencia de errores JavaScript',async()=>{
  const axe=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(axe.violations.map(v=>({id:v.id,nodos:v.nodes.length})),[]);assert.deepEqual(errores,[])
 })
}finally{writeFileSync(dir+'/resultados.json',JSON.stringify({resultados,errores},null,2));await browser.close();await t.close()}
