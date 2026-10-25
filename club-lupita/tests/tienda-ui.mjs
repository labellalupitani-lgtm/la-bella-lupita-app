import {tlsLocal} from './tienda-tls.mjs'
import assert from 'node:assert/strict'
import {chromium,firefox,webkit} from 'playwright'
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs'
import {vistaAislada} from './soporte-ui.mjs'
import {habilitarTienda} from './tienda-fixture.mjs'
const dir=process.env.EVIDENCIA_DIR||'entregables/extension-aprobada-2026-10-21/evidencia/tienda-ui',resultados=[],errores=[]
mkdirSync(dir,{recursive:true})
const t=await vistaAislada({tls:tlsLocal()});await habilitarTienda(t)
const browser=await chromium.launch({channel:'msedge',headless:true}),ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},reducedMotion:'reduce'})
await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
await ctx.addInitScript(token=>{if(!sessionStorage.getItem('fixture-tienda')){localStorage.setItem('club-lupita:sesion',token);sessionStorage.setItem('fixture-tienda','1')}},t.token)
let page=await ctx.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errores.push(e.message))
const caso=async(nombre,fn)=>{await fn();resultados.push({nombre,ok:true});console.log('PASA '+nombre)}
const hasta=async f=>{for(let i=0;i<120;i++){if(await f())return;await new Promise(r=>setTimeout(r,80))}throw Error('Condición no satisfecha')}
const d=()=>page.getByRole('dialog',{name:'Confirmá tu Reserva de Cosecha'})
const abrir=async()=>{await page.goto(t.url+'/tienda');await page.getByRole('heading',{name:'Lote de prueba'}).waitFor();await hasta(async()=>await page.getByRole('button',{name:'Apartar la mía',exact:true}).isEnabled())}
const cotizar=async()=>{await page.getByRole('button',{name:'Apartar la mía',exact:true}).click();await d().waitFor();await d().getByLabel('Acepto el precio y las condiciones de esta preventa.').check()}
try{
 await abrir()
 await caso('oferta y compra visibles en móvil; teclado, semántica y cero desbordamiento',async()=>{
  for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1440,900]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(150)
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
   const b=await page.getByRole('button',{name:'Apartar la mía',exact:true}).boundingBox();if(width===390)assert.ok(b.y+b.height<height-70,'CTA fuera del primer viewport normal: '+JSON.stringify(b));if(width===320){await page.getByRole('button',{name:'Apartar la mía',exact:true}).focus();await page.getByRole('button',{name:'Apartar la mía',exact:true}).scrollIntoViewIfNeeded();const r=await page.getByRole('button',{name:'Apartar la mía',exact:true}).boundingBox();const nav=await page.locator('.casa-nav-movil').boundingBox();assert.ok(r.y>=0&&r.y+r.height<=(nav?.y??height),'CTA obstruida al desplazar en pantalla corta')}
   resultados.push({viewport:`${width}x${height}`,ctaBottom:b.y+b.height});await page.screenshot({path:dir+'/tienda-'+width+'.png',fullPage:true})
  }
  await page.setViewportSize({width:390,height:844});await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')})
  const axe=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(axe.violations.map(v=>({id:v.id,nodos:v.nodes.length})),[])
  await page.getByRole('button',{name:'Apartar la mía',exact:true}).focus();await page.keyboard.press('Enter');await d().waitFor();assert.equal(await d().getByRole('button',{name:/Pagar/}).isDisabled(),true)
  await page.keyboard.press('Escape');await d().waitFor({state:'hidden'});await hasta(()=>page.getByRole('button',{name:'Apartar la mía',exact:true}).evaluate(e=>e===document.activeElement))
 })
 await caso('precio modificado exige revisión y no cobra; error permanece en diálogo',async()=>{
  await cotizar();await t.db.exec('UPDATE reserva_cosecha SET precio=99000')
  await d().getByRole('button',{name:/Pagar/}).click();await d().getByRole('alert').waitFor();await d().getByText(/El precio o las condiciones cambiaron/).waitFor()
  assert.equal((await t.db.query('SELECT count(*)::int n FROM compra_bolsa')).rows[0].n,0)
  await d().getByRole('button',{name:'Consultar resultado de la compra'}).click();await d().waitFor({state:'hidden'})
  await page.getByText(/no tiene un cobro registrado/).waitFor();await page.getByRole('button',{name:'Descartar intento sin cobro'}).click()
  await t.db.exec('UPDATE reserva_cosecha SET precio=89000');await page.reload();await hasta(async()=>await page.getByRole('button',{name:'Apartar la mía',exact:true}).isEnabled())
 })
 await caso('diálogo bloqueado durante el cargo; respuesta perdida recupera última bolsa y saldo exacto',async()=>{
  await t.db.exec('DELETE FROM reserva_cosecha WHERE numero<>1');const s=(await t.db.query('SELECT total FROM saldo_de($1)',[t.id])).rows[0].total;await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'consumo','Fixture saldo exacto')",[t.id,89000-s]);await page.reload();await hasta(async()=>await page.getByRole('button',{name:'Apartar la mía',exact:true}).isEnabled())
  let liberar;const barrera=new Promise(r=>liberar=r);await page.route('**/api/reserva-cosecha/apartar',async route=>{const real=await route.fetch();assert.equal(real.status(),200);await barrera;await route.abort()})
  await cotizar();await d().getByRole('button',{name:/Pagar/}).click();await hasta(async()=>await d().getByRole('button',{name:'Cerrar panel'}).isDisabled());await page.keyboard.press('Escape');assert.equal(await d().isVisible(),true)
  liberar();await d().getByRole('alert').waitFor();await page.screenshot({path:dir+'/respuesta-perdida.png',fullPage:true});assert.ok(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.endsWith(':bolsa'))))
  await page.reload();await page.getByText('Importe pagado:',{exact:false}).waitFor();await page.getByText('Saldo después de esa compra:',{exact:false}).waitFor()
  assert.equal((await t.db.query('SELECT count(*)::int n FROM compra_bolsa')).rows[0].n,1);assert.equal((await t.db.query('SELECT total FROM saldo_de($1)',[t.id])).rows[0].total,0)
  await page.getByRole('button',{name:'Ver comprobante y estado de entrega'}).click();await page.waitForURL('**/compras');await page.getByText('Lote 1 · Pagada · en espera de preparación',{exact:true}).waitFor();await page.getByText('Mostrador de prueba · 08:00 a 17:00 (fixture)',{exact:true}).waitFor()
  await page.goto(t.url+'/tienda');await page.getByRole('button',{name:'Finalizar este intento'}).click();await page.getByText('Intento cerrado.',{exact:true}).waitFor();await page.unroute('**/api/reserva-cosecha/apartar')
 })
 await caso('contrato incompleto nunca borra referencia ni anuncia éxito; se consulta antes de repetir',async()=>{
  await t.db.exec('INSERT INTO reserva_cosecha(numero,precio) VALUES(2,89000)');await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,200000,'recarga','Fixture recarga')",[t.id]);await abrir()
  await cotizar();await page.route('**/api/reserva-cosecha/apartar',r=>r.fulfill({status:200,json:{cobrado:89000,saldo:{total:0,pagado:0,bono:0}}}));await d().getByRole('button',{name:/Pagar/}).click();await d().getByRole('alert').waitFor();assert.ok(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.endsWith(':bolsa'))));assert.equal(await page.getByText('Importe pagado:',{exact:false}).count(),0)
  await d().getByRole('button',{name:'Consultar resultado de la compra'}).click();await d().waitFor({state:'hidden'});await page.getByRole('button',{name:'Descartar intento sin cobro'}).click();await page.unroute('**/api/reserva-cosecha/apartar')
 })
 await caso('recarga conserva Tienda; beneficio distingue retirada y WhatsApp prepara contexto sin enviarlo',async()=>{
  const s=(await t.db.query('SELECT total FROM saldo_de($1)',[t.id])).rows[0].total;await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'consumo','Fixture insuficiente')",[t.id,1000-s]);await page.reload();await page.getByRole('button',{name:'Cómo recargar y continuar'}).click();const recarga=page.getByRole('dialog',{name:'Recargá y seguí en Tienda'});await recarga.waitFor();await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,100000,'recarga','Fixture mostrador')",[t.id]);await recarga.getByRole('button',{name:'Ya recargué: actualizar saldo'}).click();await recarga.waitFor({state:'hidden'});assert.equal(new URL(page.url()).pathname,'/tienda');await hasta(async()=>await page.getByRole('button',{name:'Apartar la mía',exact:true}).isEnabled())
  await page.locator('summary').filter({hasText:'Regalos y café para oficina'}).click()
  await page.getByLabel('Cantidad aproximada (opcional)').fill('20 bolsas');await page.getByLabel('Zona de retiro o entrega (opcional)').fill('Managua');const enlace=page.getByRole('link',{name:/Preparar consulta/});assert.match(decodeURIComponent(await enlace.getAttribute('href')),/20 bolsas.*Managua/);assert.equal(await enlace.getAttribute('target'),'_blank')
  await page.getByText('Un beneficio de la Mesa Fundadora, aparte de esta compra.',{exact:true}).waitFor()
 })
 await caso('error de catálogo tiene su propio mensaje y reintento; datos inválidos no producen NaN',async()=>{
  await page.route('**/api/tienda',r=>r.fulfill({status:200,json:{precio:'890'}}));await page.reload();await page.getByRole('button',{name:'Reintentar catálogo'}).waitFor();assert.equal((await page.locator('main').innerText()).includes('NaN'),false);assert.equal(await page.getByRole('button',{name:'Apartar la mía'}).count(),0);await page.unroute('**/api/tienda');await page.getByRole('button',{name:'Reintentar catálogo'}).click();await page.getByRole('button',{name:'Apartar la mía'}).waitFor()
 })
 await caso('beneficio mensual activo, acceso directo y canje ya retirado se distinguen',async()=>{
  await t.db.exec("UPDATE membresia SET estado='activa',hasta=now()+interval '15 days',autorenueva=false")
  await page.reload();await page.getByRole('button',{name:'Mostrar mi beneficio de bolsa'}).click();await page.waitForURL('**/club?beneficio=bolsa');await page.getByRole('heading',{name:'Tus beneficios disponibles'}).waitFor();await hasta(()=>page.locator('#club-beneficios').evaluate(e=>e===document.activeElement))
  await t.db.query("INSERT INTO beneficio_uso(membresia_id,clase) SELECT id,'bolsa_mes' FROM membresia WHERE socio_id=$1 ON CONFLICT DO NOTHING",[t.id])
  await page.goto(t.url+'/tienda');await page.getByText('Ya retiraste la bolsa de este mes.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Mostrar mi beneficio de bolsa'}).count(),0)
 })
 assert.deepEqual(errores,[])
 // Los otros motores usan la sesión emitida por la propia aplicación, nunca cookies inventadas.
 for(const [nombre,motor] of [['Firefox',firefox],['WebKit',webkit]]){
  await caso(nombre+': render, contrato y diálogo accesible',async()=>{
   const b=await motor.launch({headless:true});try{const c=await b.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},storageState:await ctx.storageState()});const p=await c.newPage();await p.goto(t.url+'/tienda');await p.getByRole('heading',{name:'Lote de prueba'}).waitFor();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.getByRole('button',{name:'Apartar la mía'}).click();const dialog=p.getByRole('dialog',{name:'Confirmá tu Reserva de Cosecha'});await dialog.waitFor();await p.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await c.close()}finally{await b.close()}
  })
 }
}catch(error){
 await page.screenshot({path:dir+'/fallo.png',fullPage:true}).catch(()=>{})
 writeFileSync(dir+'/fallo.json',JSON.stringify({error:error.message,url:page.url(),texto:await page.locator('main').innerText().catch(()=>''),oferta:(await t.request('/api/tienda',undefined,t.token)).body},null,2))
 throw error
}finally{writeFileSync(dir+'/ui.json',JSON.stringify({resultados,errores},null,2));await browser.close();await t.close()}
