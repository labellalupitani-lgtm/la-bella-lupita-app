import assert from 'node:assert/strict'
import {chromium} from 'playwright'
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs'
import {vistaAislada} from './soporte-ui.mjs'
const dir=process.env.EVIDENCIA_DIR||'entregables/extension-aprobada-2026-10-21/evidencia/carta-ui';mkdirSync(dir,{recursive:true})
const t=await vistaAislada(),browser=await chromium.launch({channel:'msedge',headless:true}),contexto=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'})
await t.db.query("UPDATE carta_configuracion SET valor=jsonb_set(valor,'{horario}',$1::jsonb)",[JSON.stringify(Array.from({length:7},()=>({abre:'00:00',cierra:'23:59'})))])
const resultados=[],errores=[];let page=await contexto.newPage()
await contexto.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
await contexto.addInitScript(token=>{if(!localStorage.getItem('fixture-carta')){localStorage.setItem('club-lupita:sesion',token);localStorage.setItem('fixture-carta','1')}},t.token)
function observar(p){p.setDefaultTimeout(10_000);p.on('pageerror',e=>errores.push(e.message))}observar(page)
async function esperar(fn){for(let i=0;i<100;i++){if(await fn())return;await new Promise(r=>setTimeout(r,80))}throw Error('No se cumplió la condición')}
async function caso(nombre,fn){await fn();resultados.push({nombre,correcto:true});console.log('PASA '+nombre)}
async function abrir(){const yo=page.waitForResponse(r=>r.url().endsWith('/api/yo')&&r.status()===200);await page.goto(t.url+'/pedir');await yo;await page.getByRole('searchbox',{name:'Buscar en la carta'}).waitFor()}
async function buscar(s){await page.getByRole('searchbox',{name:'Buscar en la carta'}).fill(s)}
const dialogo=()=>page.getByRole('dialog',{name:'Tu pedido',exact:true})
try{
 await abrir()
 await caso('búsqueda global con alias y resultados próximos en cinco anchos',async()=>{
  for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:844});await buscar('maracuyá');await page.getByText('1 resultado en toda la carta',{exact:true}).waitFor();assert.equal(await page.locator('.casa-carta-lista li').count(),1);assert.equal(await page.locator('.carta-seleccion').count(),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.evaluate(()=>document.fonts.ready);const r=await page.locator('.casa-carta-lista li').first().boundingBox();assert.ok(r.y<650,'Resultado visible a '+width+': '+r.y);await page.evaluate(()=>document.fonts.ready);if(width>=900)await esperar(async()=> Math.abs((await page.locator('.casa-cabecera').boundingBox()).width-width)<2); await page.screenshot({path:dir+'/carta-'+width+'.png',fullPage:true})}
  await buscar('   ');assert.equal(await page.getByText(/resultados en toda la carta/).count(),0);await buscar('inexistente');await page.getByRole('button',{name:'Ver toda la carta',exact:true}).click();assert.equal(await page.locator('.casa-carta-lista li').count(),73)
 })
 await caso('ficha restaura foco por teclado y limpia la URL',async()=>{
  await page.setViewportSize({width:390,height:844});await buscar('espresso');const b=page.locator('.casa-carta-plato').first();await b.focus();await page.keyboard.press('Enter');await page.getByRole('dialog',{name:'Espresso',exact:true}).waitFor();assert.equal(new URL(page.url()).searchParams.get('plato'),'espresso');await page.keyboard.press('Escape');await page.getByRole('dialog',{name:'Espresso',exact:true}).waitFor({state:'hidden'});await esperar(()=>page.url().includes('plato=')===false);await esperar(()=>b.evaluate(e=>e===document.activeElement));await page.reload();await page.getByRole('searchbox',{name:'Buscar en la carta'}).waitFor();assert.equal(await page.getByRole('dialog').count(),0)
 })
 await caso('opciones obligatorias conservan variantes distintas y sus límites',async()=>{
  await buscar('ensalada lupita');await page.getByRole('button',{name:/Agregar Ensalada Lupita al pedido/}).click();let d=page.getByRole('dialog',{name:'Ensalada Lupita'});assert.equal(await d.getByRole('button',{name:/Agregar ·/}).isDisabled(),true);await d.getByLabel('Pollo',{exact:true}).check();await d.getByRole('button',{name:/Agregar ·/}).click();await d.waitFor({state:'hidden'});await page.getByRole('button',{name:/Agregar Ensalada Lupita al pedido/}).click();d=page.getByRole('dialog',{name:'Ensalada Lupita'});await d.getByLabel('Res',{exact:true}).check();await d.getByRole('button',{name:/Agregar ·/}).click();await d.waitFor({state:'hidden'});await page.locator('.casa-carta-barra button').click();assert.equal(await dialogo().locator('.casa-carta-linea-pedido').count(),2);await dialogo().getByText('Proteína: Pollo',{exact:true}).waitFor();await dialogo().getByText('Proteína: Res',{exact:true}).waitFor();await dialogo().getByRole('button',{name:'Vaciar el pedido',exact:true}).click();assert.equal(await dialogo().getByRole('heading',{name:'Elegí y revisá tu pedido'}).evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Escape');await dialogo().waitFor({state:'hidden'});assert.equal(await page.getByRole('searchbox',{name:'Buscar en la carta'}).evaluate(e=>e===document.activeElement),true)
 })
 await caso('veinte unidades no se pueden exceder en ficha y listado',async()=>{
  await buscar('latte');await page.locator('.casa-carta-plato').filter({hasText:/^Latte/}).first().click();const d=page.getByRole('dialog',{name:'Latte',exact:true});for(let n=1;n<20;n++)await d.getByRole('button',{name:'Aumentar cantidad'}).click();assert.equal(await d.getByRole('button',{name:'Aumentar cantidad'}).isDisabled(),true);await d.getByRole('button',{name:/Agregar ·/}).click();await d.waitFor({state:'hidden'});assert.equal(await page.getByRole('button',{name:/^Agregar Latte al pedido/}).isDisabled(),true);await page.locator('.casa-carta-barra button').click();await dialogo().getByRole('button',{name:'Vaciar el pedido',exact:true}).click();await page.keyboard.press('Escape')
 })
 await caso('el pago muestra empaque y requiere revisar una cotización',async()=>{
  await page.getByRole('button',{name:/^Agregar Latte al pedido/}).click();await page.locator('.casa-carta-barra button').click();assert.equal(await dialogo().getByRole('button',{name:/^Pagar/}).count(),0);await dialogo().getByText('Empaque para llevar',{exact:true}).waitFor();await dialogo().getByRole('button',{name:'Revisar total para pagar',exact:true}).click();await dialogo().getByRole('button',{name:/Pagar C\$\s?135/}).waitFor();await page.screenshot({path:dir+'/cotizacion.png',fullPage:true})
 })
 await caso('respuesta perdida y cierre de pestaña recuperan exactamente un cobro',async()=>{
  await page.route('**/api/cuenta/cobrar',async r=>{const real=await r.fetch();assert.equal(real.status(),200);await r.abort()});await dialogo().getByRole('button',{name:/Pagar C\$\s?135/}).click();await dialogo().getByRole('button',{name:'Consultar resultado',exact:true}).waitFor();await esperar(async()=>await dialogo().getByRole('button',{name:'Consultar resultado',exact:true}).isEnabled());const guardado=await page.evaluate(()=>Object.keys(localStorage).find(k=>k.startsWith('club-lupita:envio:')));assert.ok(guardado);await page.close();page=await contexto.newPage();observar(page);await page.goto(t.url+'/pedir');await dialogo().getByRole('button',{name:'Consultar resultado',exact:true}).click();await page.waitForURL('**/compras');assert.equal((await t.db.query('SELECT count(*)::int n FROM pedido')).rows[0].n,1);assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'pedido:%'")).rows[0].n,1)
 })
 await caso('consulta pública y cuenta caída conservan productos',async()=>{
  const invitado=await browser.newContext({viewport:{width:390,height:844}}),p=await invitado.newPage();await p.goto(t.url+'/pedir');await p.getByRole('searchbox',{name:'Buscar en la carta'}).waitFor();await p.getByRole('button',{name:'Ingresar a mi cuenta',exact:true}).waitFor();assert.ok(await p.locator('.casa-carta-lista li').count()>0);await p.route('**/api/yo',r=>r.fulfill({status:503,json:{error:'Prueba de caída'}}));await p.reload();await p.getByRole('searchbox',{name:'Buscar en la carta'}).waitFor();assert.ok(await p.locator('.casa-carta-lista li').count()>0);await invitado.close()
 })
 await caso('pendiente con producto retirado o contenido dañado conserva consulta y cierre',async()=>{
  await page.goto(t.url+'/pedir');await page.getByRole('searchbox').waitFor()
  const clave=await page.evaluate(()=>Object.keys(sessionStorage).find(k=>k.startsWith('club-lupita:pedido:')))
  for(const lineas of [[{id:'retirado-del-catalogo',cuanto:1}],[null]]){
   const ref=crypto.randomUUID();await page.evaluate(({clave,ref,lineas})=>localStorage.setItem(clave.replace(':pedido:',':envio:'),JSON.stringify({referencia:ref,lineas,pendiente:true})),{clave,ref,lineas})
   await page.reload();await dialogo().getByRole('button',{name:'Consultar resultado',exact:true}).waitFor();await dialogo().getByRole('button',{name:'Cerrar intento sin cobro',exact:true}).click();await dialogo().getByText('Tu pedido está vacío.',{exact:true}).waitFor();await page.keyboard.press('Escape')
  }
 })
 await caso('almacenamiento bloqueado impide cobrar y conserva el presupuesto',async()=>{
  await buscar('latte');await page.getByRole('button',{name:/^Agregar Latte al pedido/}).click();await page.locator('.casa-carta-barra button').click();await dialogo().getByRole('button',{name:'Revisar total para pagar',exact:true}).click();const p=dialogo().getByRole('button',{name:/Pagar C\$\s?135/});await p.waitFor()
  const antes=(await t.db.query('SELECT count(*)::int n FROM pedido')).rows[0].n
  await page.evaluate(()=>{window.setOriginal=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('club-lupita:envio:'))throw Error('Bloqueado');return window.setOriginal.call(this,k,v)}})
  await p.click();await dialogo().getByText(/No podemos conservar la referencia/).waitFor();assert.equal((await t.db.query('SELECT count(*)::int n FROM pedido')).rows[0].n,antes)
  await page.evaluate(()=>{Storage.prototype.setItem=window.setOriginal});await page.keyboard.press('Escape')
 })
 await caso('otra pestaña reconoce el intento y no envía un segundo pedido',async()=>{
  const otra=await contexto.newPage();await otra.goto(t.url+'/pedir');await otra.getByRole('searchbox').waitFor();await otra.getByRole('searchbox').fill('latte');await otra.getByRole('button',{name:/^Agregar Latte al pedido/}).click();await otra.locator('.casa-carta-barra button').click();await otra.getByRole('button',{name:'Revisar total para pagar',exact:true}).click();await otra.getByRole('button',{name:/Pagar C\$\s?135/}).waitFor()
  await page.locator('.casa-carta-barra button').click();await page.route('**/api/cuenta/cobrar',r=>r.abort());await dialogo().getByRole('button',{name:/Pagar C\$\s?135/}).click();await dialogo().getByRole('button',{name:'Consultar resultado',exact:true}).waitFor()
  await otra.getByRole('button',{name:'Consultar resultado',exact:true}).waitFor();assert.equal(await otra.getByRole('button',{name:/^Pagar /}).count(),0)
  await esperar(async()=>await dialogo().getByRole('button',{name:'Cerrar intento sin cobro',exact:true}).isEnabled());await dialogo().getByRole('button',{name:'Cerrar intento sin cobro',exact:true}).click();await dialogo().getByText('Tu pedido está vacío.',{exact:true}).waitFor();await otra.close();await page.unroute('**/api/cuenta/cobrar');await page.keyboard.press('Escape')
 })
 await caso('un HTTP 200 sin recibo válido no se interpreta como pago exitoso',async()=>{
  await buscar('latte');await page.getByRole('button',{name:/^Agregar Latte al pedido/}).click();await page.locator('.casa-carta-barra button').click();await dialogo().getByRole('button',{name:'Revisar total para pagar',exact:true}).click()
  await page.route('**/api/cuenta/cobrar',r=>r.fulfill({status:200,json:{ok:true}}));await dialogo().getByRole('button',{name:/Pagar C\$\s?135/}).click();await dialogo().getByText(/La respuesta está incompleta/).waitFor();assert.equal(new URL(page.url()).pathname,'/pedir');await dialogo().getByRole('button',{name:'Cerrar intento sin cobro',exact:true}).click();await dialogo().getByText('Tu pedido está vacío.',{exact:true}).waitFor();await page.unroute('**/api/cuenta/cobrar');await page.keyboard.press('Escape')
 })
 await caso('foco de teclado queda visible por encima del pedido y navegación móvil',async()=>{
  await page.goto(t.url+'/pedir?momento=todos');await page.getByRole('searchbox').waitFor();await page.getByRole('searchbox').fill('');await page.getByRole('button',{name:'Todo',exact:true}).click();await page.getByRole('button',{name:/^Agregar Espresso al pedido/}).click()
  await page.locator('.casa-carta-lista button').first().focus()
  for(let i=0;i<35;i++){await page.keyboard.press('Tab');await page.evaluate(()=>new Promise(requestAnimationFrame));const r=await page.evaluate(()=>{const a=document.activeElement;if(!a?.closest('.casa-carta-lista'))return null;const z=a.getBoundingClientRect(),b=document.querySelector('.casa-carta-barra').getBoundingClientRect();return{top:z.top,bottom:z.bottom,techo:b.top}});if(r)assert.ok(r.top>=-1&&r.bottom<=r.techo,JSON.stringify(r))}
  await page.locator('.casa-carta-barra button').click();await dialogo().getByRole('button',{name:'Vaciar el pedido',exact:true}).click();await page.keyboard.press('Escape')
 })
 await caso('consulta y posición sobreviven a salir y volver a Carta',async()=>{
  await page.goto(t.url+'/pedir?momento=todos');await page.getByRole('searchbox').waitFor();await page.evaluate(()=>window.scrollTo(0,600));await page.evaluate(()=>new Promise(requestAnimationFrame));await page.evaluate(()=>new Promise(requestAnimationFrame));
  const antes=await page.evaluate(()=>window.scrollY);assert.ok(antes>300)
  await page.goto(t.url+'/perfil');await page.getByRole('main').waitFor();await page.goto(t.url+'/pedir');await page.getByRole('searchbox').waitFor();await esperar(()=>page.evaluate(()=>window.scrollY>300));assert.equal(await page.getByRole('button',{name:'Todo',exact:true}).getAttribute('aria-pressed'),'true')
  await page.evaluate(()=>window.scrollTo(0,0));await page.getByRole('searchbox').fill('maracuyá');await page.reload();await page.getByRole('searchbox').waitFor();assert.equal(await page.getByRole('searchbox').inputValue(),'maracuyá')
 })
 await caso('foto fallida y revisión automatizada de accesibilidad',async()=>{
  await page.route('**/images/latte-logo-mesa-*',r=>r.abort());await page.goto(t.url+'/pedir?momento=barra');await page.getByRole('searchbox',{name:'Buscar en la carta'}).waitFor();await page.locator('.carta-seleccion').getByText('Fotografía no disponible',{exact:true}).waitFor();assert.equal(await page.locator('.carta-seleccion .carta-foto-respaldo').count(),1);await page.locator('.casa-carta-lista .carta-foto-respaldo').scrollIntoViewIfNeeded();await page.locator('.casa-carta-lista').getByText('Fotografía no disponible',{exact:true}).waitFor();await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')});const a=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));writeFileSync(dir+'/axe-carta.json',JSON.stringify(a.violations,null,2));assert.deepEqual(a.violations.map(v=>({id:v.id,n:v.nodes.length})),[]);assert.deepEqual(errores,[])
 })
}finally{writeFileSync(dir+'/interfaz-carta.json',JSON.stringify({resultados,errores},null,2));await browser.close();await t.close()}


