import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdirSync,writeFileSync } from 'node:fs';
if (process.env.PERMITIR_PRUEBA_DESTRUCTIVA_REMOTA !== 'SI_EN_ENTORNO_DE_PRUEBAS' || !process.env.URL_PRUEBAS || ['club-lupita.labellalupita.workers.dev', 'app.labellalupita.com'].includes(new URL(process.env.URL_PRUEBAS).hostname)) throw Error('Prueba histórica con escrituras: usá test:carta en aislamiento. Una ejecución remota requiere URL_PRUEBAS ajena a producción y autorización explícita.');
const base=process.env.URL_PRUEBAS,out='recorrido-2026-09-13';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'});
// Se comprueban los destinos de compartir y WhatsApp sin enviar mensajes.
await ctx.addInitScript(()=>{window.__externos=[];window.open=url=>{window.__externos.push(String(url));return null;};Object.defineProperty(navigator,'share',{value:undefined,configurable:true});});
await ctx.grantPermissions(['clipboard-read','clipboard-write']);
const page=await ctx.newPage();page.setDefaultTimeout(10000);
const results=[],errors=[],responses=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().includes('/api/'))responses.push({path:new URL(r.url()).pathname,status:r.status()});});
let touches=0;
const click=async locator=>{await locator.click();touches++;};
const btn=name=>page.getByRole('button',{name,exact:typeof name==='string'});
const go=async path=>{await page.goto(base+path);await page.getByRole('heading').first().waitFor();};
const close=async()=>{await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});};
const test=async(name,fn)=>{if(process.argv[2]&&!name.startsWith('Entrada:')&&!new RegExp(process.argv[2]).test(name))return;try{const detail=await fn();results.push({name,status:'PASA',detail});console.log('PASA '+name+(detail?' '+JSON.stringify(detail):''));}catch(e){results.push({name,status:'FALLA',error:e.message});console.log('FALLA '+name+': '+e.message.slice(0,220));await page.screenshot({path:out+'/fallo-'+results.length+'.png',fullPage:true});}writeFileSync(out+'/resultados'+(process.argv[2]?'-repeticion':'')+'.json',JSON.stringify({results,touches,errors,responses},null,2));};
try{
 await test('Entrada: teléfono, alta deshabilitada y acceso demo',async()=>{await page.goto(base);await page.getByLabel('Tu número de WhatsApp').fill('abc1234567890');assert.equal(await page.getByLabel('Tu número de WhatsApp').inputValue(),'12345678');assert(await btn('Unite al club').isDisabled());await click(btn('Explorar la demostración'));await btn('Perfil').waitFor();return 'El alta real no está habilitada';});
 await test('Inicio: recarga informativa, pase, premio y avisos',async()=>{
  await go('/');await click(btn('Recargá'));await page.getByRole('dialog').waitFor();assert((await page.getByRole('dialog').innerText()).includes('No se recarga desde el'));await click(btn('Enseñar mi pase'));await page.getByRole('heading',{name:'Tu pase de la casa'}).waitFor();await close();
  await click(btn(/Mostrá tu pase/));await close();await click(btn('Mostrar mi premio'));await page.getByRole('dialog').waitFor();await click(btn('Renovar código del premio'));await page.getByText(/Tenés un vale vivo/).waitFor();await close();await click(btn('Avisos'));return 'Recarga sólo en caja; premio disponible';
 });
 await test('Navegación: pestañas, tarjetas y accesos rápidos',async()=>{
  for(const name of ['Inicio','Pedir','Tienda','Club','Perfil']){await click(btn(name));await page.getByRole('main').waitFor();}
  for(const [name,path] of [[/Pedí para llevar/,'/pedir'],[/Reservá mesa/,'/reservar'],[/Tienda de la finca/,'/tienda'],[/Reservá la tuya/,'/tienda'],[/Ver y apartar/,'/club']]){await go('/');await click(btn(name));await page.waitForURL(base+path);await click(btn('Volver').first());await page.waitForURL(base+(path==='/reservar'?'/club':'/'));}
 });
 await test('Carta completa: filtros, detalles y dos formas de agregar cada producto',async()=>{
  await go('/pedir');let total=0;
  for(const categoria of ['Barra','Brunch','Bistró','Sobremesa']){
   await click(btn(categoria));const cards=page.getByRole('article');const count=await cards.count();
   for(let i=0;i<count;i++){
    const card=cards.nth(i);await click(card.getByRole('button').first());await page.getByRole('dialog').waitFor();await click(page.getByRole('dialog').getByRole('button',{name:/Agregar —/}));await page.getByRole('dialog').waitFor({state:'hidden'});await click(card.getByRole('button',{name:/^Agregar /}));total++;
   }console.log('Carta revisada: '+categoria+' ('+count+')');
  }assert(total>=70);return {productos:total};
 });
 await test('Carrito: aumentar, reducir y vaciar todas las líneas',async()=>{
  await click(btn(/Ver tu pedido/));const dialog=page.getByRole('dialog');const plus=await dialog.getByRole('button',{name:/^Agregar otro /}).all();const minus=await dialog.getByRole('button',{name:/^Quitar un /}).all();
  for(let i=0;i<plus.length;i++){await click(plus[i]);await click(minus[i]);}
  await click(btn('Vaciar el pedido'));assert.equal(await dialog.getByRole('button',{name:'Pagar con la Cuenta de Casa'}).count(),0);await close();return {lineas:plus.length};
 });
 await test('Buscador: mayúsculas, tildes, sin resultados y recuperación',async()=>{
  await go('/pedir');const input=page.getByRole('searchbox');await input.fill('CAFÉ');assert(await page.getByRole('article').count()>0);await input.fill('zzzzNoExiste');assert.equal(await page.getByRole('article').count(),0);await click(btn('Ver toda la carta'));assert(await page.getByRole('article').count()>0);
 });
 await test('Pedido: pago confirmado y movimiento persistido',async()=>{
  await go('/pedir');await click(btn('Agregar Espresso al pedido'));await click(btn(/Ver tu pedido/));const response=page.waitForResponse(r=>r.url().endsWith('/api/cuenta/cobrar'));await click(btn('Pagar con la Cuenta de Casa'));assert.equal((await response).status(),200);await page.getByRole('dialog').waitFor({state:'hidden'});await go('/perfil');assert((await page.locator('body').innerText()).includes('Espresso'));
 });
 await test('Tienda: cancelar, comprar bolsa y abrir opciones de WhatsApp',async()=>{
  await go('/tienda');await click(btn('Apartar la mía'));await click(btn('Mejor no'));await click(btn('Apartar la mía'));const response=page.waitForResponse(r=>r.url().endsWith('/api/reserva-cosecha/apartar'));await click(page.getByRole('dialog').getByRole('button',{name:/Sí, cobrá/}));assert.equal((await response).status(),200);await page.getByText(/Es tuya la bolsa/).last().waitFor();
  await click(btn(/Cajas de regalo/));await click(btn(/Pedidos para oficina/));const links=await page.evaluate(()=>window.__externos);assert.equal(links.length,2);assert(links.every(u=>u.startsWith('https://wa.me/')));await click(btn(/Ver la Mesa Fundadora/));await page.waitForURL(base+'/club');return 'WhatsApp: destinos válidos; no se envió ningún mensaje';
 });
 await test('Club: alta de membresía, ambos beneficios y control de renovación',async()=>{
  await go('/club');if(await btn(/Tomar una plaza/).count()){await click(btn(/Tomar una plaza/));await click(page.getByRole('dialog').getByRole('button',{name:/Sí, cobrá/}));await btn('Cancelar renovación').waitFor();}
  for(const [name,path] of [['Anotar','/api/beneficio/bolsa_mes'],['Canjear','/api/beneficio/bebida_dia']]){if(await btn(name).count()){const response=page.waitForResponse(r=>r.url().endsWith(path));await click(btn(name));assert.equal((await response).status(),200);await btn(name).waitFor({state:'hidden'});}}
  await click(btn('Cancelar renovación'));await click(btn('Volver').last());await click(btn('Cancelar renovación'));await click(btn('Sí, cancelar renovación'));await btn('Activar renovación automática').waitFor();await click(btn('Activar renovación automática'));await click(btn('Sí, activar renovación'));await btn('Cancelar renovación').waitFor();await click(btn('Cancelar renovación'));await click(btn('Sí, cancelar renovación'));await btn('Activar renovación automática').waitFor();
 });
 await test('Club: compra de cada experiencia del catálogo',async()=>{
  await go('/club');const count=await btn('Apartar butaca').count();for(let i=0;i<count;i++){await click(btn('Apartar butaca').nth(i));const response=page.waitForResponse(r=>/\/api\/experiencia\/.+\/apartar$/.test(r.url()));await click(page.getByRole('dialog').getByRole('button',{name:/Sí, cobrá/}));assert.equal((await response).status(),200);await page.getByRole('dialog').waitFor({state:'hidden'});}return {experiencias:count};
 });
 await test('Reservas: cinco zonas, catorce fechas, doce tamaños y seis duraciones',async()=>{
  await go('/reservar');const dates=page.locator('section[aria-labelledby="res-dia"]').getByRole('button');for(let i=0;i<await dates.count();i++){await click(dates.nth(i));assert.equal(await dates.nth(i).getAttribute('aria-pressed'),'true');}
  for(const name of [/La terraza/,/El ventanal/,/La barra/,/El bistró/,/El Salón VIP/]){await click(btn(name));assert.equal(await btn(name).getAttribute('aria-pressed'),'true');}
  for(let n=1;n<=12;n++){await click(btn(String(n)));assert.equal(await btn(String(n)).getAttribute('aria-pressed'),'true');}
  const less=btn('Menos horas de mesa'),more=btn('Más horas de mesa');while(!await less.isDisabled())await click(less);for(let i=1;i<6;i++)await click(more);assert(await more.isDisabled());for(let i=6;i>1;i--)await click(less);assert(await less.isDisabled());
  await click(btn(/La terraza/));const hours=page.locator('section[aria-labelledby="res-hora"]').getByRole('button');await hours.first().waitFor();let available=0;for(let i=0;i<await hours.count();i++){if(!await hours.nth(i).isDisabled()){await click(hours.nth(i));available++;}}return {zonas:5,fechas:14,personas:12,duraciones:6,horasSeleccionadas:available};
 });
 await test('Reservas: confirmar una mesa de cada zona, incluido depósito VIP',async()=>{
  for(const name of [/La terraza/,/El ventanal/,/La barra/,/El bistró/,/El Salón VIP/]){
   await go('/reservar');await click(btn(name));await click(page.locator('section[aria-labelledby="res-dia"]').getByRole('button').nth(10));await click(btn('2'));while(!await btn('Menos horas de mesa').isDisabled())await click(btn('Menos horas de mesa'));
   const hours=page.locator('section[aria-labelledby="res-hora"]').getByRole('button');await hours.first().waitFor();for(let i=0;i<await hours.count();i++){if(!await hours.nth(i).isDisabled()){await click(hours.nth(i));break;}}
   const response=page.waitForResponse(r=>r.url().endsWith('/api/reserva'));await click(btn(/Apartar la mesa|Apartar .*C\$/));assert.equal((await response).status(),200);
  }
 });
 await test('Perfil: compartir por portapapeles, volver y salir sin conexión',async()=>{
  await go('/perfil');await click(btn(/Compartir /));const clip=await page.evaluate(()=>navigator.clipboard.readText());assert(clip.length>0);await click(btn('Volver a la casa'));await page.waitForURL(base+'/');await click(btn('Perfil'));await ctx.setOffline(true);await click(btn('Cerrar sesión'));await btn('Explorar la demostración').waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('club-lupita:sesion')),null);await ctx.setOffline(false);
 });
}finally{await ctx.setOffline(false);writeFileSync(out+'/resultados'+(process.argv[2]?'-repeticion':'')+'.json',JSON.stringify({results,touches,errors,responses},null,2));await browser.close();}
console.log(JSON.stringify({grupos:results.length,fallos:results.filter(r=>r.status==='FALLA').length,touches,errors}));
