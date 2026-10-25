import assert from 'node:assert/strict'
import {chromium,firefox,webkit} from 'playwright'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {vistaAislada} from './soporte-ui.mjs'
import {tlsLocal} from './tienda-tls.mjs'
const dir=process.env.EVIDENCIA_DIR||'entregables/mejoras-mi-club-2026-10-09/evidencia';mkdirSync(dir,{recursive:true})
const resultados=[]
for(const motor of ['edge','firefox','webkit']){
 const t=await vistaAislada({tls:tlsLocal()}),errores=[]
 const browser=await (motor==='edge'?chromium: motor==='firefox'?firefox:webkit).launch(motor==='edge'?{channel:'msedge',headless:true}:{headless:true})
 const ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},reducedMotion:'reduce'})
 await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
 await ctx.addInitScript(token=>{if(!sessionStorage.getItem('club-fixture')){localStorage.setItem('club-lupita:sesion',token);sessionStorage.setItem('club-fixture','1')}},t.token)
 const page=await ctx.newPage();page.on('pageerror',e=>errores.push(e.message));page.setDefaultTimeout(12000)
 const caso=async(nombre,fn)=>{await fn();resultados.push({motor,nombre,correcto:true});console.log('PASA '+motor+' · '+nombre)}
 try{
  await page.goto(t.url+'/club');await page.getByRole('heading',{name:'Tu lugar entre cien'}).waitFor()
  await caso('oferta completa antes del cobro, consentimiento y cancelación de diálogo',async()=>{
   await page.getByText('Los cinco beneficios y sus condiciones',{exact:true}).click()
   await page.getByText('Una bolsa de café de 250 g por período pagado.',{exact:true}).waitFor()
   const abrir=page.getByRole('button',{name:/Revisar contratación/});await abrir.click()
   const d=page.getByRole('dialog',{name:'Contratar Mesa Fundadora'});await d.waitFor()
   assert.equal(await d.getByRole('button',{name:/Confirmar pago/}).isDisabled(),true)
   await page.keyboard.press('Escape');await d.waitFor({state:'hidden'});await page.waitForTimeout(100);assert.equal(await abrir.evaluate(e=>e===document.activeElement),true,JSON.stringify(await page.evaluate(()=>({activo:document.activeElement?.outerHTML.slice(0,600)}))))
  })
  await caso('móvil y texto ampliado no desbordan ni recortan el pase',async()=>{
   for(const width of [320,390,1024,1440]){await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
   await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Mostrar mi pase',exact:true}).click()
   const d=page.getByRole('dialog',{name:'Tu pase de la casa'});await d.waitFor();assert.equal(await d.getByText(t.tel,{exact:true}).count(),0)
   await d.getByRole('button',{name:'Ver cómo usarlo'}).click();await page.addStyleTag({content:'html{font-size:200% !important} dialog section p{font-size:200% !important;line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important;margin-bottom:2em !important}'})
   const pase=d.getByRole('region',{name:'Pase de la casa'});assert.equal(await pase.evaluate(e=>e.scrollHeight>e.clientHeight+2),false)
   await page.screenshot({path:dir+'/pase-texto-200-'+motor+'.png',fullPage:true});await page.keyboard.press('Escape');await page.reload();await page.getByRole('heading',{name:'Tu lugar entre cien'}).waitFor()
  })
  await caso('recarga conserva contexto y volver no contrata automáticamente',async()=>{
   const saldo=(await t.db.query('SELECT total FROM saldo_de($1)',[t.id])).rows[0].total
   await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'consumo','Ensayo de falta de saldo')",[t.id,-saldo])
   await page.getByRole('button',{name:'Actualizar Mi Club',exact:true}).click();await page.getByRole('button',{name:'Recargar para tomar una plaza'}).click()
   const d=page.getByRole('dialog',{name:'Recargar en caja'});await d.waitFor();assert.equal(new URL(page.url()).pathname,'/club')
   await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'recarga','Restauración de saldo sintético')",[t.id,saldo])
   await d.getByRole('button',{name:'Ya recargué: actualizar saldo'}).click();await d.getByRole('button',{name:'Volver a Mi Club'}).click()
   await page.getByRole('button',{name:/Revisar contratación/}).waitFor();assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'mem:%'")).rows[0].n,0)
  })
  await caso('respuesta perdida conserva referencia, recupera sin doble cobro y permite descartar éxito',async()=>{
   await page.getByRole('button',{name:/Revisar contratación/}).click();const d=page.getByRole('dialog',{name:'Contratar Mesa Fundadora'})
   await d.getByRole('checkbox').check()
   let refInicial
   await page.route('**/api/membresia/apartar',async ruta=>{refInicial=ruta.request().postDataJSON().ref;const respuesta=await ruta.fetch();assert.equal(respuesta.status(),200);await ruta.abort('failed')},{times:1})
   await d.getByRole('button',{name:/Confirmar pago/}).click();await d.getByRole('alert').waitFor()
   assert.equal(await d.isVisible(),true);assert.ok(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.endsWith(':membresia'))))
   const reintento=page.waitForRequest(r=>r.url().endsWith('/api/membresia/apartar'))
   await d.getByRole('button',{name:/Confirmar pago/}).click();assert.equal((await reintento).postDataJSON().ref,refInicial)
   await d.getByText('Tu plaza está confirmada.',{exact:false}).waitFor()
   await d.getByRole('button',{name:'Descartar mensaje'}).click();assert.equal(await d.getByText('Tu plaza está confirmada.',{exact:false}).count(),0)
   await d.getByRole('link',{name:'Ver mis beneficios'}).click();await page.getByRole('heading',{name:'Tus beneficios disponibles'}).waitFor()
   assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'mem:%'")).rows[0].n,1)
  })
  await caso('beneficio devuelve foco al botón y presenta tiempo real',async()=>{
   const boton=page.getByRole('button',{name:'Mostrar código del café'});await boton.click()
   const d=page.getByRole('dialog',{name:'Mostrá tu beneficio en caja'});await d.getByText(/Vence en/).waitFor();await page.keyboard.press('Escape');await d.waitFor({state:'hidden'})
   assert.equal(await boton.evaluate(e=>e===document.activeElement),true)
   await t.db.exec("UPDATE beneficio_solicitud SET vence=now()+interval '25 seconds' WHERE clase='bebida_dia'")
   await boton.click();await d.getByText(/Vence en 0 min/).waitFor();await page.keyboard.press('Escape')
  })
  await caso('respuesta de código incompleta se puede reintentar; actualización refleja entrega',async()=>{
   await page.route('**/api/beneficios/solicitar',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({codigo:'INVALIDO',vence:'sin fecha',ahora:'sin fecha'})}),{times:1})
   await page.getByRole('button',{name:'Mostrar código del café'}).click();const d=page.getByRole('dialog')
   await d.getByRole('alert').waitFor();await d.getByRole('button',{name:'Reintentar código'}).click();await d.getByText(/Vence en/).waitFor()
   const codigo=(await t.db.query("SELECT codigo FROM beneficio_solicitud WHERE clase='bebida_dia' AND vence>now() ORDER BY creado DESC LIMIT 1")).rows[0].codigo
   assert.equal((await t.request('/api/operacion/beneficios/entregar',{codigo},t.staff)).status,200)
   await d.getByRole('button',{name:'Comprobar entrega'}).click();await d.getByText('La casa registró la entrega de este beneficio.').waitFor()
   await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Mostrar código del café'}).isDisabled(),true)
  })
  await caso('navegación a comprobantes y accesibilidad automática',async()=>{
   await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')})
   const axe=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}))
   assert.deepEqual(axe.violations.map(v=>({id:v.id,nodos:v.nodes.length})),[])
   await page.screenshot({path:dir+'/mi-club-'+motor+'.png',fullPage:true})
   await page.getByRole('link',{name:'Ver mis entradas y reservas'}).click();await page.waitForURL('**/compras')
   assert.deepEqual(errores,[])
   const tiempos=await t.db.query('SELECT operacion,resultado,entrada FROM club_tiempo')
   assert.ok(tiempos.rows.some(r=>r.operacion==='codigo'&&r.resultado==='error'))
   assert.ok(tiempos.rows.some(r=>r.operacion==='recuperacion'&&r.resultado==='correcto'))
   const medicion=page.waitForResponse(r=>r.url().endsWith('/api/club/tiempo')&&r.request().postDataJSON().operacion==='vista')
   await page.getByRole('navigation',{name:'Secciones de Club Lupita'}).getByRole('link',{name:'Mi Club',exact:true}).click();await medicion
   assert.ok((await t.db.query("SELECT 1 FROM club_tiempo WHERE operacion='vista' AND entrada='interna'")).rows.length)
  })
  await caso('no seguimiento impide emitir métricas y tiempos',async()=>{
   const privado=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844}})
   await privado.addCookies(await ctx.cookies());await privado.addInitScript(()=>Object.defineProperty(navigator,'doNotTrack',{get:()=> '1'}))
   const p=await privado.newPage(),enviadas=[];p.on('request',r=>{if(/\/api\/club\/(tiempo|evento|rendimiento)$/.test(r.url()))enviadas.push(r.url())})
   await p.goto(t.url+'/club');await p.getByRole('button',{name:'Mostrar mi pase',exact:true}).waitFor();await p.getByRole('button',{name:'Mostrar código de la bolsa'}).click();await p.getByText(/Vence en/).waitFor();await p.waitForTimeout(200)
   assert.deepEqual(enviadas,[]);await privado.close()
  })
 }finally{await browser.close();await t.close();writeFileSync(dir+'/interfaz.json',JSON.stringify({resultados},null,2))}
}
