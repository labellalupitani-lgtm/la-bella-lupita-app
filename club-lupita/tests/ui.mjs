import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync,existsSync,mkdirSync,writeFileSync } from 'node:fs';
import { resolve,join,extname } from 'node:path';
import { chromium } from 'playwright';
import { preparar,root } from './soporte.mjs';
const t=await preparar();
await t.db.query("UPDATE membresia SET hasta=now()+interval '15 days',renovacion_consentida=now()");
await t.db.query('UPDATE tanda SET cerrada=now()');
let cola=Promise.resolve();
const server=createServer(async(req,res)=>{
 try{
  if(req.url.startsWith('/api/')){
   const chunks=[];for await(const c of req)chunks.push(c);
   const trabajo=cola.then(()=>t.worker.app.request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})},t.env,t.ctx));
   cola=trabajo.catch(()=>{});const r=await trabajo;const headers=Object.fromEntries(r.headers);if(r.headers.getSetCookie().length)headers['set-cookie']=r.headers.getSetCookie();res.writeHead(r.status,headers);res.end(Buffer.from(await r.arrayBuffer()));
  }else{
   const base=join(root,'dist');let file=resolve(base,'.'+new URL(req.url,'http://localhost').pathname);
   if(!file.startsWith(base)||!existsSync(file)||!extname(file))file=join(base,'index.html');
   const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'};
   res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(readFileSync(file));
  }
 }catch{res.writeHead(500);res.end('Prueba fallida');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
const out=process.env.TEST_OUTPUT_DIR||join(root,'verificacion-2026-09-13');mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'es-NI',timezoneId:'America/Managua',reducedMotion:'reduce'});
await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
const page=await ctx.newPage();page.setDefaultTimeout(12000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
const ok=name=>{results.push(name);console.log('OK '+name);};
const go=async path=>{await page.goto(url+path);await page.getByRole('main').waitFor();};
try{
 await ctx.addInitScript(token=>{if(!sessionStorage.getItem('fixture-inicial')){localStorage.setItem('club-lupita:sesion',token);sessionStorage.setItem('fixture-inicial','1')}},t.token);
 await go('/perfil');await page.getByText(/14 de septiembre/).waitFor();ok('Cumpleaños sin desfase de fecha');
 await go('/');await page.getByRole('button',{name:'Mostrar mi premio'}).click();await page.getByRole('dialog').waitFor();await page.screenshot({path:join(out,'premio.png'),fullPage:true});ok('Premio pendiente accesible');
 await go('/club');await page.getByRole('button',{name:'Cancelar renovación',exact:true}).click();await page.getByRole('button',{name:'Sí, cancelar renovación'}).click();await page.getByRole('button',{name:'Activar renovación automática',exact:true}).waitFor();ok('Cancelación de renovación reflejada en pantalla');
 await go('/tienda');const refs=[];let lost=false;
 const before=(await t.db.query('SELECT count(*)::int n FROM reserva_cosecha WHERE socio_id IS NOT NULL')).rows[0].n;
 await page.route('**/api/reserva-cosecha/apartar',async r=>{refs.push(r.request().postDataJSON().ref);if(!lost){lost=true;await r.fetch();await r.abort('failed');}else await r.continue();});
 await page.getByRole('button',{name:'Apartar la mía'}).click();await page.getByRole('button',{name:'Sí, cobrá C$ 890'}).click();await page.getByRole('alert').filter({hasText:/cayó la señal/}).waitFor();
 await go('/tienda');await page.getByRole('button',{name:'Apartar la mía'}).click();await page.getByRole('button',{name:'Sí, cobrá C$ 890'}).click();await page.getByText(/Es tuya la bolsa/).last().waitFor();
 assert.equal(refs.length,2);assert.equal(refs[0],refs[1]);assert.equal((await t.db.query('SELECT count(*)::int n FROM reserva_cosecha WHERE socio_id IS NOT NULL')).rows[0].n,before+1);ok('Respuesta perdida y recarga de página: una sola compra');
 for(const width of [360,1440]){await page.setViewportSize({width,height:844});for(const path of ['/','/club','/perfil','/reservar']){await go(path);await page.getByRole('heading').first().waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}}ok('Sin desbordamiento horizontal en móvil y escritorio');

 await page.setViewportSize({width:390,height:844});
 await go('/');await page.getByRole('heading',{name:'Tu cuenta de casa',exact:true}).waitFor();
 await page.screenshot({path:join(out,'premium-inicio.png'),fullPage:true});
 await page.screenshot({path:join(out,'premium-portada.png')});
 await page.getByRole('button',{name:'Mostrá tu pase'}).click();await page.getByRole('dialog').waitFor();

 await page.getByRole('button',{name:'Ver cómo usarlo'}).click();await page.getByRole('button',{name:'Ver identificación'}).waitFor();
 assert.equal(await page.locator('.pase-cuerpo').evaluate(e=>getComputedStyle(e).transform),'none');
 await page.getByRole('button',{name:'Ver identificación'}).click();
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'Ver cómo usarlo'}).click();
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.pase-cuerpo')).transform.startsWith('matrix3d(-1'));
 await page.getByRole('button',{name:'Ver identificación'}).click();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.pase-cara[aria-hidden="true"]')).display==='none');
 await page.screenshot({path:join(out,'premium-pase.png')});ok('Pase reversible con movimiento y alternativa reducida');
 await page.getByRole('button',{name:'Cerrar panel'}).click();assert.equal(await page.getByRole('dialog').count(),0);
 assert(await page.getByRole('button',{name:'Mostrá tu pase'}).evaluate(e=>e===document.activeElement));
 await page.getByRole('button',{name:'Mostrá tu pase'}).click();await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);ok('Panel: cierre visible, Escape y retorno del foco');
 await page.getByRole('button',{name:'Explorar la carta'}).click();await page.getByRole('heading',{name:'Pedí para llevar'}).waitFor();
 assert.equal(await page.evaluate(()=>scrollY),0);ok('Navegación conserva el inicio de la pantalla');
 assert.equal(await page.getByText('De la casa',{exact:true}).count(),0);
 await page.getByRole('searchbox',{name:'Buscar en la carta'}).fill('capuchino');
 await page.getByRole('button',{name:/Cappuccino C\$/}).waitFor();ok('Búsqueda reconoce capuchino');
 await page.getByRole('searchbox',{name:'Buscar en la carta'}).fill('Latte');
 await page.getByRole('button',{name:'Latte C$ 95',exact:true}).click();await page.getByRole('dialog').getByRole('img',{name:'Latte',exact:true}).waitFor();
 await page.getByRole('button',{name:'Cerrar panel'}).click();
 await page.getByRole('button',{name:'Agregar Latte al pedido',exact:true}).click();
 await page.getByRole('button',{name:/Ver tu pedido/}).click();await page.getByRole('dialog').getByText('Latte',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Cerrar panel'}).click();ok('Carta sin marcadores repetidos, foto real y pedido funcional');
 await page.getByRole('searchbox',{name:'Buscar en la carta'}).fill('');await page.screenshot({path:join(out,'premium-carta.png'),fullPage:true});
 await go('/reservar');await page.getByRole('heading',{name:'Encontrá tu rincón'}).waitFor();
 await page.locator('section[aria-labelledby="res-zona"] button').first().click();
 await page.getByRole('button',{name:'Elegir fecha y grupo'}).click();await page.getByRole('heading',{name:'Hagamos espacio para vos'}).waitFor();
 await page.locator('section[aria-labelledby="res-dia"] button').nth(1).click();
 await page.locator('section[aria-labelledby="res-hora"] button:not([disabled])').first().click();
 await page.getByRole('button',{name:'Revisar mi reserva'}).click();await page.getByRole('heading',{name:'Todo listo para tu visita'}).waitFor();
 await page.waitForTimeout(150);await page.screenshot({path:join(out,'premium-reserva.png'),fullPage:true});
 await page.getByRole('button',{name:'Volver',exact:true}).click();assert.equal(await page.locator('section[aria-labelledby="res-hora"] button[aria-pressed="true"]').count(),1);
 await page.getByRole('button',{name:'Revisar mi reserva'}).click();await page.getByRole('button',{name:/Apartar la mesa|Apartar con/}).click();await page.getByText(/La mesa está apartada|te espera|Mesa apartada|Esa mesa ya era tuya/i).first().waitFor();ok('Reserva guiada preserva selección y confirma con API aislada');
 const axe=readFileSync(join(root,'node_modules/axe-core/axe.min.js'),'utf8');
 for(const path of ['/','/pedir','/tienda','/reservar','/club','/perfil']){
   await go(path);await page.getByRole('heading').first().waitFor();await page.addScriptTag({content:axe});
   const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
   writeFileSync(join(out,'axe-'+(path.slice(1)||'inicio')+'.json'),JSON.stringify(audit.violations,null,2));
   assert.deepEqual(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
 }
 ok('Accesibilidad WCAG automatizada: las seis pantallas principales');
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:844});for(const path of ['/','/pedir','/tienda','/reservar']){await go(path);await page.getByRole('heading').first().waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}}ok('Premium sin desbordamiento a 320, 390 y 1440 px');
 await go('/perfil');await page.getByRole('button',{name:'Cerrar sesión',exact:true}).waitFor();await ctx.setOffline(true);await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await page.getByRole('alert').filter({hasText:/No pudimos confirmar el cierre/}).waitFor();await ctx.setOffline(false);await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await page.getByRole('button',{name:'Continuar con mi correo'}).waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('club-lupita:sesion')),null);assert.equal(await page.getByText('Prueba Regresión',{exact:true}).count(),0);ok('Cierre sin conexión informa el fallo y el reintento conectado revoca la sesión');
 await ctx.setOffline(false);await page.route('**/api/yo',r=>r.fulfill({status:200,contentType:'text/html',body:'<html>Fallo del proxy</html>'}));await go('/');await page.getByRole('button',{name:/Reintentar|Volver a intentar/}).waitFor();assert.equal(await page.getByRole('main').count(),1);ok('Respuesta inválida muestra error recuperable');
 assert.deepEqual(errors,[]);ok('Sin errores JavaScript');
}catch(e){await page.screenshot({path:join(out,'fallo-ui.png'),fullPage:true});throw e;}
finally{writeFileSync(join(out,'ui.json'),JSON.stringify(results,null,2));await browser.close();await new Promise(r=>server.close(r));await t.db.close();}

