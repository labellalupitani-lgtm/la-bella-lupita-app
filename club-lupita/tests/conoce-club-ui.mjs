import assert from 'node:assert/strict'
import {chromium,firefox,webkit} from 'playwright'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {vistaAislada} from './soporte-ui.mjs'
import {tlsLocal} from './tienda-tls.mjs'
const dir=process.env.EVIDENCIA_DIR||'entregables/conoce-tu-club-2026-10-12/evidencia';mkdirSync(dir,{recursive:true});const resultados=[]
for(const motor of ['edge','firefox','webkit']){
 const t=await vistaAislada({tls:tlsLocal()}),errores=[]
 const browser=await (motor==='edge'?chromium:motor==='firefox'?firefox:webkit).launch(motor==='edge'?{channel:'msedge',headless:true}:{headless:true})
 const ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},reducedMotion:'reduce'})
 await ctx.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort())
 const page=await ctx.newPage();page.on('pageerror',e=>errores.push(e.message));page.setDefaultTimeout(10000)
 const caso=async(nombre,fn)=>{await fn();resultados.push({motor,nombre,correcto:true});console.log('PASA '+motor+' · '+nombre)}
 try{
  await caso('ruta pública, cinco beneficios y acceso sin cobro',async()=>{
   await page.goto(t.url+'/conoce-tu-club');await page.getByRole('heading',{name:'Conocé tu club',exact:true}).waitFor()
   await page.getByText(/C\$\s*950/).first().waitFor();assert.equal(await page.title(),'Conocé tu club · La Bella Lupita')
   assert.equal(await page.locator('#mesa-fundadora li').count(),5)
   await page.getByRole('link',{name:'Ver Mesa Fundadora',exact:true}).click();assert.equal(new URL(page.url()).hash,'#mesa-fundadora')
   assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'mem:%'")).rows[0].n,0)
   await page.getByRole('link',{name:'Crear mi cuenta o ingresar',exact:true}).first().click();await page.getByRole('heading',{name:'Tu lugar en la casa',exact:true}).waitFor();assert.equal(new URL(page.url()).pathname,'/club')
   await page.getByRole('link',{name:'Beneficios y condiciones del club',exact:true}).click();await page.getByRole('heading',{name:'Conocé tu club',exact:true}).waitFor()
  })
  await caso('fallo independiente de la cuenta y respuesta incompleta permiten reintentar',async()=>{
   await page.route('**/api/club/informacion',r=>r.fulfill({status:503,body:'{}'}),{times:1})
   await page.reload();await page.getByRole('alert').filter({hasText:'No pudimos consultar'}).waitFor()
   await page.route('**/api/club/informacion',r=>r.fulfill({status:200,contentType:'application/json',body:'{"contrato":{}}'}),{times:1})
   await page.getByRole('button',{name:'Reintentar condiciones'}).click();await page.getByRole('alert').filter({hasText:'No pudimos consultar'}).waitFor()
   await page.getByRole('button',{name:'Reintentar condiciones'}).click();await page.getByText(/C\$\s*950/).first().waitFor()
  })
  await caso('320–1440 px, texto ampliado, teclado y accesibilidad automática',async()=>{
   for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);if([390,1440].includes(width))await page.screenshot({path:`${dir}/conoce-${motor}-${width}.png`,fullPage:true})}
   await page.setViewportSize({width:390,height:844});await page.locator('summary').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('details').first().getAttribute('open'),'')
   await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')});const axe=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(axe.violations.map(v=>({id:v.id,nodos:v.nodes.length})),[])
   await page.addStyleTag({content:'html{font-size:200%!important} p,li,summary{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} p{margin-bottom:2em!important}'})
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:`${dir}/conoce-${motor}-texto-200.png`,fullPage:true})
  })
  await caso('Mi Club ofrece enlace visible en móvil y escritorio bajo; ruta cambia y recibe foco',async()=>{
   await ctx.addInitScript(token=>{if(!sessionStorage.getItem('club-fixture')){localStorage.setItem('club-lupita:sesion',token);sessionStorage.setItem('club-fixture','1')}},t.token)
   for(const size of [{width:390,height:844},{width:1366,height:768}]){
    await page.setViewportSize(size);await page.goto(t.url+'/club');await page.getByRole('heading',{name:'Tu lugar entre cien'}).waitFor()
    const link=page.getByRole('link',{name:'Conocé tu club',exact:true}).filter({visible:true});await link.click()
    await page.getByRole('heading',{name:'Conocé tu club',exact:true}).waitFor();assert.equal(new URL(page.url()).pathname,'/conoce-tu-club');assert.equal(await page.locator('#contenido').evaluate(e=>e===document.activeElement),true)
    await page.getByRole('link',{name:'Ir a Mi Club',exact:true}).click();await page.getByRole('heading',{name:'Tu lugar entre cien'}).waitFor()
   }
  })
  await caso('experiencia mantiene oferta aceptada durante refresco y rechaza precio nuevo',async()=>{
   await t.db.exec("UPDATE experiencia SET abre_socios=now()-interval '3 days',abre_publico=now()-interval '1 day',precio=85000,lugar='Casa de prueba',incluye='Café y explicación',condiciones='Entrada personal de prueba'")
   await page.getByRole('button',{name:'Actualizar Mi Club',exact:true}).click();await page.getByRole('button',{name:/Revisar entrada/}).first().click()
   const d=page.getByRole('dialog');await d.getByRole('checkbox').check();await d.getByRole('button',{name:/Confirmar pago · C\$\s*850/}).waitFor()
   await t.db.exec('UPDATE experiencia SET precio=90000');const refresco=page.waitForResponse(r=>r.url().endsWith('/api/catalogo'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await refresco
   await d.getByRole('button',{name:/Confirmar pago · C\$\s*850/}).click();await d.getByRole('alert').filter({hasText:'La oferta cambió'}).waitFor()
   assert.equal((await t.db.query('SELECT count(*)::int n FROM asiento_experiencia')).rows[0].n,0)
   await page.keyboard.press('Escape');await page.getByRole('button',{name:/Revisar entrada/}).first().click();await d.getByRole('checkbox').check();await d.getByRole('button',{name:/Confirmar pago · C\$\s*900/}).click();await d.getByText('Tu entrada está confirmada.',{exact:false}).waitFor()
  })
  await caso('membresía conserva condiciones revisadas durante refresco',async()=>{
   await page.getByRole('dialog').getByRole('button',{name:'Cerrar panel',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await page.getByRole('button',{name:/Revisar contratación/}).click();const d=page.getByRole('dialog',{name:'Contratar Mesa Fundadora'})
   await d.getByRole('checkbox').check()
   await t.db.exec("UPDATE club_config SET cafe_detalle='Nueva condición que exige aceptación',version=version+1")
   const consulta=page.waitForResponse(r=>r.url().endsWith('/api/club'));await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await consulta
   assert.equal(await d.getByText('Nueva condición que exige aceptación',{exact:false}).count(),0)
   await d.getByRole('button',{name:/Confirmar pago/}).click();await d.getByRole('alert').waitFor()
   assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'mem:%'")).rows[0].n,0)
  })
  await caso('medición de explicación limitada a sesión y respetuosa de no seguimiento',async()=>{
   const privado=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844}})
   await privado.addCookies(await ctx.cookies());await privado.addInitScript(()=>Object.defineProperty(navigator,'doNotTrack',{get:()=> '1'}))
   const q=await privado.newPage(),eventos=[];q.on('request',r=>{if(r.url().endsWith('/api/club/evento'))eventos.push(r.postDataJSON())})
   await q.goto(t.url+'/conoce-tu-club');await q.getByRole('link',{name:'Ir a Mi Club',exact:true}).waitFor();await q.getByRole('link',{name:'Ver Mesa Fundadora',exact:true}).click()
   assert.deepEqual(eventos,[]);await privado.close()
   assert.ok((await t.db.query("SELECT 1 FROM club_metrica WHERE evento='informacion_vista'")).rows.length)
  })
  assert.deepEqual(errores,[])
 }finally{await browser.close();await t.close();writeFileSync(dir+'/interfaz.json',JSON.stringify({resultados},null,2))}
}
