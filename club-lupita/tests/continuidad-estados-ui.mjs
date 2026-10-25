import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync,writeFileSync } from 'node:fs'
import { vistaAislada } from './soporte-ui.mjs'
import { habilitarTienda } from './tienda-fixture.mjs'

const dir=process.env.EVIDENCIA_DIR||'entregables/continuidad-modulos-2026-10-21/evidencia/estados'
mkdirSync(dir,{recursive:true})
const t=await vistaAislada();await habilitarTienda(t)
const b=await chromium.launch({channel:'msedge',headless:true}),c=await b.newContext({viewport:{width:320,height:700},reducedMotion:'reduce'})
const p=await c.newPage(),results=[],errors=[],external=[]
p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message))
await c.route('**/*',r=>{if(new URL(r.request().url()).origin===t.url)return r.continue();external.push(r.request().url());return r.abort()})
await c.addInitScript(token=>{if(!sessionStorage.getItem('continuidad')){localStorage.setItem('club-lupita:sesion',token);sessionStorage.setItem('continuidad','1')}},t.token)
const test=async(name,fn)=>{await fn();results.push({name,pass:true});console.log('PASA '+name)}
const day=n=>new Date(Date.now()-21600000+n*86400000).toISOString().slice(0,10)
try{
 const reservaPrueba=await t.request('/api/reserva',{zona:'terraza',cuando:day(2)+'T12:00:00-06:00',horas:2,personas:2,referencia:crypto.randomUUID()})
 assert.equal(reservaPrueba.status,200,JSON.stringify(reservaPrueba.body))
 await test('consulta inicial fallida o incompleta termina la carga, no inventa referencia y bloquea otra compra',async()=>{
  for(const respuesta of [{status:503,json:{error:'Consulta sintética interrumpida'}},{status:200,json:{}}]){
   await p.route('**/api/tienda/recuperacion',r=>r.fulfill(respuesta))
   await p.goto(t.url+'/tienda');await p.getByText(/No pudimos consultar tus compras pendientes/).waitFor()
   assert.equal(await p.getByText('Comprobando si tenés un intento pendiente…',{exact:true}).count(),0)
   assert.equal(await p.getByText(/Conservamos tu referencia/).count(),0)
   assert.equal(await p.getByRole('button',{name:'Apartar la mía',exact:true}).isDisabled(),true)
   await p.unroute('**/api/tienda/recuperacion');await p.getByRole('button',{name:'Reintentar consulta de compras'}).click()
   await p.getByText(/No pudimos consultar tus compras pendientes/).waitFor({state:'hidden'})
   await p.locator('#tienda-apartar:enabled').waitFor()
   assert.equal(await p.getByRole('button',{name:'Apartar la mía',exact:true}).isEnabled(),true)
  }
 })
 await test('una referencia local real se conserva si falla el listado, y se recupera sin cobrar',async()=>{
  const ref=crypto.randomUUID(),key='club-lupita:compra:'+t.id+':bolsa'
  const saldoAntes=(await t.db.query('SELECT total FROM saldo_de($1)',[t.id])).rows[0].total
  await p.evaluate(({key,ref})=>localStorage.setItem(key,ref),{key,ref})
  await p.route('**/api/tienda/recuperacion',r=>r.fulfill({status:503,json:{error:'Consulta sintética interrumpida'}}))
  await p.reload();await p.getByText(/No pudimos consultar tus compras pendientes/).waitFor()
  await p.getByText('Referencia: '+ref,{exact:true}).waitFor();await p.getByText('Conservamos tu referencia. Consultá el resultado antes de iniciar otra compra.',{exact:true}).waitFor()
  assert.equal(await p.evaluate(key=>localStorage.getItem(key),key),ref)
  await p.unroute('**/api/tienda/recuperacion');await p.getByRole('button',{name:'Reintentar consulta de compras'}).click()
  await p.getByText(/no tiene un cobro registrado/).waitFor()
  assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa=$1",['bolsa:'+ref])).rows[0].n,0)
  assert.equal((await t.db.query('SELECT total FROM saldo_de($1)',[t.id])).rows[0].total,saldoAntes)
  await p.getByRole('button',{name:'Descartar intento sin cobro',exact:true}).click()
 })
 await test('cambiar visita distingue carga, fallo y vacío; recuperar horarios elimina el error sin alterar la reserva',async()=>{
  const id=reservaPrueba.body.reserva.id,patron='**/api/reservas/'+id+'/disponibilidad?*'
  await p.route(patron,r=>r.fulfill({status:503,json:{error:'Horarios sintéticos interrumpidos'}}))
  await p.goto(t.url+'/reservas');await p.getByRole('button',{name:'Cambiar visita',exact:true}).click()
  const d=p.getByRole('dialog',{name:'Cambiar tu visita',exact:true})
  await d.getByText(/No pudimos consultar los horarios/).waitFor()
  assert.equal(await d.getByText(/No hay horarios disponibles/).count(),0)
  assert.equal(await d.getByRole('button',{name:'Confirmar cambio',exact:true}).isDisabled(),true)
  await p.unroute(patron);await d.getByRole('button',{name:'Actualizar horarios',exact:true}).click()
  await d.getByText('Disponibilidad actualizada para tu grupo.',{exact:true}).waitFor()
  assert.equal(await d.getByRole('alert').count(),0)
  await p.route(patron,async route=>{const response=await route.fetch(),data=await response.json();data.zonas.terraza.horas=[];await route.fulfill({json:data})})
  await d.getByRole('button',{name:'Actualizar horarios',exact:true}).click();await d.getByText(/No hay horarios disponibles/).waitFor()
  assert.equal(await d.getByRole('alert').count(),0)
  await p.unroute(patron);await d.getByLabel('Personas',{exact:true}).fill('3')
  await d.getByText('Disponibilidad actualizada para tu grupo.',{exact:true}).waitFor()
  assert.equal((await t.db.query('SELECT version,personas FROM reserva WHERE id=$1',[id])).rows[0].personas,2)
  await p.keyboard.press('Escape');await d.waitFor({state:'hidden'})
 })
 await test('ayuda recupera lectura sin arrastrar error; actualizar no borra borrador ni fallo de envío',async()=>{
  await p.route('**/api/atencion',r=>r.request().method()==='GET'?r.fulfill({status:503,json:{error:'Lectura sintética interrumpida'}}):r.continue())
  await p.goto(t.url+'/perfil');await p.getByText(/No pudimos actualizar tus avisos y solicitudes/).waitFor()
  await p.unroute('**/api/atencion');await p.getByRole('button',{name:'Actualizar avisos',exact:true}).click()
  await p.getByText(/No pudimos actualizar tus avisos y solicitudes/).waitFor({state:'hidden'})
  const texto='Solicitud sintética que debe conservar su borrador'
  await p.getByRole('textbox',{name:/^Contanos qué necesitás/}).fill(texto)
  await p.route('**/api/atencion',r=>r.request().method()==='POST'?r.fulfill({status:422,json:{error:'Envío sintético rechazado'}}):r.continue())
  await p.getByRole('button',{name:'Enviar solicitud a la casa',exact:true}).click();await p.getByText('Envío sintético rechazado',{exact:true}).waitFor()
  await p.getByRole('button',{name:'Actualizar avisos',exact:true}).click();await p.getByText('Consultando avisos y solicitudes…',{exact:true}).waitFor({state:'hidden'})
  writeFileSync(dir+'/ayuda-despues-actualizar.json',JSON.stringify({url:p.url(),texto:await p.locator('body').innerText()},null,2))
  assert.equal(await p.getByRole('textbox',{name:/^Contanos qué necesitás/}).inputValue(),texto)
  assert.equal(await p.getByText('Envío sintético rechazado',{exact:true}).isVisible(),true)
  await p.unroute('**/api/atencion');await p.getByRole('button',{name:'Enviar solicitud a la casa',exact:true}).click()
  await p.getByText('Solicitud registrada. La respuesta aparecerá aquí.',{exact:true}).waitFor()
  assert.equal(await p.getByText('Envío sintético rechazado',{exact:true}).count(),0)
  assert.equal(await p.getByRole('textbox',{name:/^Contanos qué necesitás/}).inputValue(),'')
 })
 await test('Perfil320 con texto200 permite Tab al textarea por encima de la navegación y títulos completos',async()=>{
  await p.addStyleTag({content:'html{font-size:200%!important}'})
  await p.evaluate(()=>document.fonts.ready)
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  const h=p.getByRole('heading',{name:'Comunicaciones y tus datos',exact:true})
  assert.equal(await h.evaluate(e=>e.scrollWidth>e.clientWidth),false)
  await p.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0)})
  await p.getByRole('link',{name:'Mis datos',exact:true}).focus()
  for(let n=0;n<60;n++){await p.keyboard.press('Tab');if(await p.getByRole('textbox',{name:/^Contanos qué necesitás/}).evaluate(e=>e===document.activeElement))break}
  assert.equal(await p.getByRole('textbox',{name:/^Contanos qué necesitás/}).evaluate(e=>e===document.activeElement),true)
  const campo=await p.getByRole('textbox',{name:/^Contanos qué necesitás/}).boundingBox(),nav=await p.locator('.casa-nav-movil').boundingBox()
  assert.ok(campo.y>=0&&campo.y+campo.height<nav.y)
  await p.screenshot({path:dir+'/ayuda-foco320-200.png'})
 })
 assert.deepEqual(errors,[]);assert.deepEqual(external,[])
}finally{writeFileSync(dir+'/resultados.json',JSON.stringify({results,errors,external},null,2));await b.close();await t.close()}
