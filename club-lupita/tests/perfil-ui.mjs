import assert from 'node:assert/strict'
import {chromium,firefox,webkit} from 'playwright'
import {tlsLocal} from './tienda-tls.mjs'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {vistaAislada} from './soporte-ui.mjs'
const motor=process.env.PERFIL_NAVEGADOR??'edge';const dir=process.env.EVIDENCIA_DIR||'entregables/mejoras-perfil-2026-10-09/evidencias/'+motor;mkdirSync(dir,{recursive:true})
const t=await vistaAislada({tls:tlsLocal()}),browser=await (motor==='firefox'?firefox:motor==='webkit'?webkit:chromium).launch({...(motor==='edge'?{channel:'msedge'}:{}),headless:true})
const ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},reducedMotion:'reduce',timezoneId:'Europe/Madrid'}),page=await ctx.newPage(),resultados=[],errores=[]
page.on('pageerror',e=>errores.push(e.message));page.setDefaultTimeout(12000)
const dialogo=()=>page.getByRole('dialog',{name:'Editar mi perfil'})
async function abrir(){await page.getByRole('button',{name:/^(Editar mi perfil|Continuar edición de mi perfil)$/}).click();await dialogo().waitFor()}
async function hasta(fn){for(let n=0;n<100;n++){if(await fn())return;await new Promise(r=>setTimeout(r,50))}throw Error('Condición no cumplida')}
async function caso(nombre,fn){await fn();resultados.push({nombre,correcto:true});console.log('PASA '+nombre)}
try{
 await ctx.addInitScript(token=>{if(!sessionStorage.getItem('fixture')){localStorage.setItem('club-lupita:sesion',token);sessionStorage.setItem('fixture','1')}},t.token)
 await caso('perfil independiente abre aunque fallen /yo, catálogo y cupos',async()=>{
  for(const ruta of ['yo','catalogo','cupos'])await page.route('**/api/'+ruta,r=>r.fulfill({status:503,json:{error:'Fallo aislado de '+ruta}}))
  await page.goto(t.url+'/perfil');await page.getByRole('heading',{name:'Prueba Regresión'}).waitFor();assert.ok((await page.getByRole('button',{name:'Editar mi perfil',exact:true}).boundingBox()).y<600)
  await abrir();await dialogo().getByLabel('Tu nombre',{exact:true}).fill('Nombre sin catálogo');await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();await dialogo().waitFor({state:'hidden'});await page.getByRole('heading',{name:'Nombre sin catálogo'}).waitFor()
  for(const ruta of ['yo','catalogo','cupos'])await page.unroute('**/api/'+ruta)
 })
 await caso('Escape y reapertura conservan borrador y foco',async()=>{
  await abrir();await dialogo().getByLabel('Tu bebida de siempre',{exact:false}).fill('Chocolate caliente');await page.keyboard.press('Escape');await dialogo().waitFor({state:'hidden'});assert.match(await page.evaluate(()=>document.activeElement.textContent),/Continuar edición/);await abrir();assert.equal(await dialogo().getByLabel('Tu bebida de siempre',{exact:false}).inputValue(),'Chocolate caliente')
 })
 await caso('cerrar y reabrir mientras guarda no crea un borrador antiguo',async()=>{
  let liberar,recibida=false;const espera=new Promise(r=>{liberar=r})
  await page.route('**/api/perfil*',async ruta=>{if(ruta.request().method()==='POST'){const r=await ruta.fetch();recibida=true;await espera;await ruta.fulfill({response:r})}else await ruta.continue()})
  await dialogo().getByLabel('Tu nombre',{exact:true}).fill('Confirmado durante cierre');await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();await hasta(()=>recibida);await page.keyboard.press('Escape');await abrir();assert.equal(await dialogo().getByLabel('Tu nombre',{exact:true}).isDisabled(),true);liberar();await dialogo().waitFor({state:'hidden'});await page.getByRole('heading',{name:'Confirmado durante cierre'}).waitFor();await page.unroute('**/api/perfil*')
  await abrir();await dialogo().getByLabel('Tu bebida de siempre',{exact:false}).fill('Latte');await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();await dialogo().waitFor({state:'hidden'});await page.getByRole('heading',{name:'Confirmado durante cierre'}).waitFor()
 })
 await caso('conflicto permite elegir por campo sin revertir cambios ajenos',async()=>{
  await abrir();await dialogo().getByLabel('Tu nombre',{exact:true}).fill('Mi nombre elegido');await t.db.query("UPDATE socio SET nombre='Nombre guardado por otro',alergias='Maní' WHERE id=$1",[t.id]);await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();await dialogo().getByRole('button',{name:'Consultar versión guardada'}).click();await dialogo().getByText('Guardado: Nombre guardado por otro',{exact:true}).waitFor();assert.equal(await dialogo().getByRole('button',{name:'Continuar con los cambios elegidos'}).isDisabled(),true)
  await dialogo().getByLabel('Usar mi cambio',{exact:true}).check();await dialogo().getByRole('button',{name:'Continuar con los cambios elegidos'}).click();assert.equal(await dialogo().getByLabel('Alergias · opcional',{exact:true}).inputValue(),'Maní');await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();await dialogo().waitFor({state:'hidden'});await page.getByRole('heading',{name:'Mi nombre elegido'}).waitFor()
 })
 await caso('respuesta perdida se confirma con lectura, sin repetir la escritura',async()=>{
  let post=0;await page.route('**/api/perfil*',async ruta=>{if(ruta.request().method()==='POST'){post++;await ruta.fetch();await ruta.abort('failed')}else await ruta.continue()})
  await abrir();await dialogo().getByLabel('Tu nombre',{exact:true}).fill('Guardado con respuesta perdida');await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();await dialogo().getByRole('button',{name:'Consultar versión guardada'}).click();await dialogo().waitFor({state:'hidden'});await page.getByRole('heading',{name:'Guardado con respuesta perdida'}).waitFor();assert.equal(post,1);await page.unroute('**/api/perfil*')
 })
 await caso('errores asociados, día y mes sin año, consentimiento real y reflujo de nombre máximo',async()=>{
  await page.getByRole('tab',{name:'Datos y ayuda',exact:true}).click()
  await abrir();await dialogo().getByLabel('Tu nombre',{exact:true}).fill('A');await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();assert.equal(await dialogo().getByLabel('Tu nombre',{exact:true}).getAttribute('aria-invalid'),'true');await hasta(()=>page.evaluate(()=>document.activeElement.id==='perfil-nombre'))
  await dialogo().getByLabel('Tu nombre',{exact:true}).fill('M'.repeat(80));await dialogo().getByLabel('Día',{exact:true}).fill('1');await dialogo().getByLabel('Mes',{exact:true}).selectOption('05');await dialogo().getByLabel(/Quiero recibir promociones/).check();await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();await dialogo().waitFor({state:'hidden'});await page.getByText('Promociones por correo: aceptadas.',{exact:true}).waitFor()
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Nombre válido debe refluir a '+width);await page.screenshot({path:dir+'/perfil-'+width+'.png',fullPage:true})}
  await page.setViewportSize({width:390,height:844});await abrir();await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')});const a=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));writeFileSync(dir+'/axe-editor.json',JSON.stringify(a.violations,null,2));assert.deepEqual(a.violations.map(v=>v.id),[]);await page.keyboard.press('Escape')
 })
 await caso('una lectura anterior no restaura el perfil y un contrato corrupto conserva la última lectura válida',async()=>{
  let liberar,recibida=false,terminar;const espera=new Promise(r=>{liberar=r}),terminada=new Promise(r=>{terminar=r});
  await page.route('**/api/perfil*',async ruta=>{if(ruta.request().method()==='GET'&&!recibida){recibida=true;const r=await ruta.fetch();await espera;try{await ruta.fulfill({response:r})}finally{terminar()}}else await ruta.continue()});
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));await hasta(()=>recibida);await abrir();await dialogo().getByLabel('Tu nombre',{exact:true}).fill('Nombre después de lectura');await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();await dialogo().waitFor({state:'hidden'});liberar();await terminada;await page.getByRole('heading',{name:'Nombre después de lectura',exact:true}).waitFor();await page.unroute('**/api/perfil*');
  await page.route('**/api/perfil*',async ruta=>{const r=await ruta.fetch();const b=await r.json();await ruta.fulfill({response:r,json:{perfil:{...b.perfil,creado:'fecha rota',alergias:{invalido:true}}}})});
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));await page.getByRole('button',{name:'Actualizar perfil',exact:true}).waitFor();await page.getByRole('heading',{name:'Nombre después de lectura',exact:true}).waitFor();await page.unroute('**/api/perfil*');await page.getByRole('button',{name:'Actualizar perfil',exact:true}).click();await hasta(async()=>await page.getByRole('button',{name:'Actualizar perfil',exact:true}).count()===0);
 })
 await caso('ampliación efectiva de texto al 200% conserva reflujo y controles',async()=>{
  await abrir();await dialogo().getByLabel('Tu nombre',{exact:true}).fill('Cliente de prueba');await dialogo().getByRole('button',{name:'Guardar cambios',exact:true}).click();await dialogo().waitFor({state:'hidden'});await page.reload();await page.getByRole('heading',{name:'Cliente de prueba',exact:true}).waitFor();
  for(const width of [390,1440]){await page.setViewportSize({width,height:900});await page.screenshot({path:dir+'/perfil-normal-'+width+'.png',fullPage:true})}
  await page.setViewportSize({width:390,height:844});const anterior=await page.locator('#perfil-identidad').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
  await page.evaluate(()=>{const filas=[...document.querySelectorAll('body *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const [e,n] of filas)if(e instanceof HTMLElement&&Number.isFinite(n))e.style.setProperty('font-size',(n*2)+'px','important')});
  await hasta(async()=>await page.locator('#perfil-identidad').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))===anterior*2);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:dir+'/texto-200.png',fullPage:true});await page.reload();await page.getByRole('heading',{name:'Cliente de prueba',exact:true}).waitFor();
 })
 await caso('solicitud de cuenta se registra y muestra seguimiento',async()=>{await page.getByRole('tab',{name:'Datos y ayuda',exact:true}).click();await page.getByLabel('Motivo',{exact:true}).selectOption('datos');await page.getByLabel('Contanos qué necesitás',{exact:true}).fill('Quiero una copia de los datos de mi cuenta.');await page.getByRole('button',{name:'Enviar solicitud a la casa',exact:true}).click();await page.getByText('Solicitud registrada. La respuesta aparecerá aquí.',{exact:true}).waitFor();await page.getByText('Pendiente de atención',{exact:true}).waitFor()})
 await caso('salida sin red limpia datos locales, persiste bloqueo y revoca al reconectar',async()=>{
  await page.getByText('Sesión y dispositivos',{exact:true}).click()
  await ctx.setOffline(true);await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await hasta(()=>page.evaluate(()=>!!localStorage.getItem('club-lupita:salida-pendiente')));await page.getByRole('heading',{name:'Cliente de prueba'}).waitFor({state:'hidden'});assert.equal(await page.getByRole('heading',{name:'Cliente de prueba'}).count(),0)
  await ctx.setOffline(false);await page.evaluate(()=>window.dispatchEvent(new Event('online')));await hasta(()=>page.evaluate(()=>!localStorage.getItem('club-lupita:salida-pendiente')));await page.reload();assert.equal(await page.getByRole('heading',{name:'Cliente de prueba'}).count(),0);assert.equal((await t.db.query('SELECT count(*)::int n FROM sesion_cliente WHERE revocada IS NULL')).rows[0].n,0)
 })
 assert.deepEqual(errores,[]);writeFileSync(dir+'/ui.json',JSON.stringify({fecha:new Date().toISOString(),resultados,errores},null,2))
}finally{await browser.close();await t.close()}
