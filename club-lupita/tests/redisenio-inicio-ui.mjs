/** Prueba de aceptación del ciclo visual contra el servidor local aislado. */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const url = process.env.PREVIEW_URL || 'http://127.0.0.1:5188'
assert.equal(new URL(url).hostname, '127.0.0.1', 'La prueba solo admite la vista local')
const dir = process.env.EVIDENCIA_DISENO_DIR || 'entregables/redisenio-2026-10-20/evidencia'
mkdirSync(dir, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const page = await context.newPage()
const errores = [], externas = [], resultados = [], medidas = []
page.on('pageerror', error => errores.push(error.message))
page.on('request', request => { if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== url) externas.push(request.url()) })
page.setDefaultTimeout(15000)
async function caso(nombre, fn) { await fn(); resultados.push({ nombre, ok: true }); console.log('PASA ' + nombre) }
async function inicio() {
  await page.goto(url)
  await page.getByRole('heading', { name: 'Tu cuenta de casa', exact: true }).waitFor()
  await page.waitForFunction(() => !document.querySelector('.inicio-alertas')?.textContent.trim())
  await page.evaluate(() => document.fonts.ready)
}
try {
  await caso('entorno identificado y API exclusivamente local', async () => {
    const status = await (await context.request.get(url + '/__preview/status')).json()
    assert.equal(status.preview, true); assert.equal(status.outbound, 'bloqueado')
    await inicio(); await page.getByRole('complementary', { name: 'Entorno de prueba' }).waitFor()
  })
  await caso('móvil, tablet y escritorio: texto, fotos, foco y ausencia de desbordamiento', async () => {
    for (const [width, height] of [[320,568],[360,800],[390,844],[430,932],[768,1024],[1024,768],[1440,1000]]) {
      await page.setViewportSize({width,height})
      await page.evaluate(async () => { for(const img of document.images) img.loading='eager'; await Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))); await document.fonts.ready; window.scrollTo(0,0) })
      await page.waitForFunction(() => !document.querySelector('.inicio-alertas')?.textContent.trim())
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
      const m = await page.evaluate(() => {
        const pase = [...document.querySelectorAll('button')].find(x=>x.textContent.includes('Mostrá tu pase'))
        const nav = document.querySelector('.casa-nav-movil')
        return { ancho:innerWidth, alto:innerHeight, overflow:document.documentElement.scrollWidth>innerWidth,
          fallidas:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),
          paseFin:pase.getBoundingClientRect().bottom, navInicio:nav.getBoundingClientRect().top,
          titulo:getComputedStyle(document.querySelector('h1')).fontFamily,
          texto:getComputedStyle(document.querySelector('.casa-cuenta-disponible')).fontFamily }
      })
      assert.equal(m.overflow,false,`${width}: desbordamiento`); assert.deepEqual(m.fallidas,[])
      assert.match(m.titulo,/Playfair/); assert.match(m.texto,/Montserrat/)
      if(width===320||width===390) assert.ok(m.paseFin < m.navInicio,`${width}: pase tapado por navegación: ${m.paseFin} / ${m.navInicio}`)
      medidas.push(m)
      if(width===390||width===1440||width===768) await page.screenshot({path:`${dir}/despues-${width===390?'movil':width===1440?'escritorio':'tablet'}.png`,fullPage:true})
    }
  })
  await page.setViewportSize({width:390,height:844})
  await caso('privacidad de saldo persiste al recargar', async () => {
    await page.getByRole('button',{name:'Ocultar saldo en Inicio',exact:true}).click()
    assert.equal(await page.locator('.casa-cuenta-saldo').innerText(),'••••')
    await inicio(); assert.equal(await page.locator('.casa-cuenta-saldo').innerText(),'••••')
    await page.getByRole('button',{name:'Mostrar saldo en Inicio',exact:true}).click()
  })
  await caso('pase con teclado, cierre y retorno del foco', async () => {
    const trigger=page.getByRole('button',{name:'Mostrá tu pase',exact:true})
    await trigger.focus(); await page.keyboard.press('Enter')
    const dialog=page.getByRole('dialog'); await dialog.waitFor()
    await page.screenshot({path:`${dir}/pase-movil.png`,fullPage:true})
    // Un dialog nativo puede ceder foco a los controles del navegador (body),
    // pero nunca a un control de la página de fondo.
    for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await dialog.evaluate(d=>d.contains(document.activeElement)||document.activeElement===document.body),true,'El foco llegó a un control del fondo')}
    await page.keyboard.press('Escape'); await dialog.waitFor({state:'hidden'})
    assert.equal(await trigger.evaluate(el=>el===document.activeElement),true)
  })
  await caso('recarga informativa y acceso al pase sin cobro', async () => {
    await page.getByRole('button',{name:'Recargar en caja',exact:true}).click()
    const dialog=page.getByRole('dialog'); await dialog.getByText(/La recarga se paga en el mostrador/).waitFor()
    assert.match(await dialog.locator('p.t-seccion').evaluate(el=>getComputedStyle(el).fontFamily),/Montserrat/,'El saldo de recarga conserva la familia de datos')
    assert.match(await dialog.getByRole('heading',{name:'Recargar en caja',exact:true}).evaluate(el=>getComputedStyle(el).fontFamily),/Playfair/,'El título de recarga conserva la familia de titulares')
    await dialog.getByRole('button',{name:'Enseñar mi pase',exact:true}).click()
    await dialog.getByText(/El pase identifica tu cuenta/).waitFor(); await page.keyboard.press('Escape')
  })
  await caso('rutas existentes y tipografía de la dirección aprobada extendida', async () => {
    for(const [nombre,ruta] of [['Explorar la carta','/pedir'],['Reservar mesa','/reservar'],['Tienda de la finca','/tienda']]) {
      await inicio(); await page.getByRole('button',{name:nombre,exact:true}).click(); await page.waitForURL(url+ ruta)
      await page.locator('main').waitFor(); assert.equal(await page.locator('.inicio-redisenado').count(),0)
      assert.match(await page.evaluate(()=>getComputedStyle(document.body).fontFamily),/Montserrat/)
    }
    await inicio(); await page.locator('.casa-nav-movil').getByRole('link',{name:'Carta',exact:true}).click(); await page.waitForURL(url+'/pedir')
    await inicio(); await page.locator('.casa-antojo').first().click(); await page.waitForURL(/\/pedir\?plato=/)
    await page.getByRole('dialog').waitFor()
  })
  await caso('tarjetas completas al avanzar y retroceder con teclado en móvil', async () => {
    for(const width of [320,390]) {
      await page.setViewportSize({width,height:844}); await inicio()
      const tarjetas=page.locator('.casa-antojo')
      await tarjetas.first().focus()
      for(const [indice,tecla] of [[0,null],[1,'Tab'],[2,'Tab'],[1,'Shift+Tab'],[0,'Shift+Tab']]) {
        if(tecla)await page.keyboard.press(tecla)
        assert.equal(await tarjetas.nth(indice).evaluate(el=>el===document.activeElement),true)
        await page.waitForFunction(()=>{
          const tarjeta=document.activeElement,lista=tarjeta?.parentElement
          if(!tarjeta?.matches('.casa-antojo')||!lista)return false
          const t=tarjeta.getBoundingClientRect(),l=lista.getBoundingClientRect()
          return t.left>=l.left+3&&t.right<=l.right-3
        })
      }
      await tarjetas.nth(1).focus(); await page.keyboard.press('Enter')
      await page.waitForURL(/\/pedir\?plato=risotto-gallo-pinto/); await page.getByRole('dialog').waitFor()
    }
    await page.setViewportSize({width:390,height:844}); await inicio()
  })
  await caso('seguimiento conserva pedidos, reservas, avisos y vacío en móvil', async () => {
    const base={pedido:null,reserva:null,avisos:0,ahora:new Date().toISOString()}
    const variantes=[
      ['pedido',{...base,pedido:{numero:987654,estado:'preparando'}},'Seguir mi pedido'],
      ['reserva',{...base,reserva:{zona:'Zona de prueba',cuando:'2027-01-30T18:30:00.000Z',personas:12}},'Ver mi reserva'],
      ['avisos',{...base,avisos:15},'Ver mis avisos'],
      ['vacio',base,null]
    ]
    for(const [nombre,respuesta,accion] of variantes) {
      await page.route('**/api/inicio/contexto',r=>r.fulfill({json:respuesta}))
      for(const ampliado of [false,true]) {
        await page.setViewportSize({width:320,height:568}); await inicio()
        if(ampliado)await page.addStyleTag({content:'html{font-size:200%!important}'})
        const bloque=page.locator('.inicio-seguimiento')
        if(accion)await bloque.getByRole('button',{name:accion,exact:true}).waitFor()
        else await bloque.getByText('Sin pedidos en curso, reservas próximas ni avisos pendientes.',{exact:true}).waitFor()
        const m=await bloque.evaluate(el=>{
          const datos=el.querySelector('.inicio-seguimiento-datos').getBoundingClientRect()
          const boton=el.querySelector('button')?.getBoundingClientRect()
          return {overflow:document.documentElement.scrollWidth>innerWidth,solapado:boton?datos.left<boton.right&&datos.right>boton.left&&datos.top<boton.bottom&&datos.bottom>boton.top:false}
        })
        assert.equal(m.overflow,false,`${nombre} texto ${ampliado?'200':'100'}%`)
        assert.equal(m.solapado,false,`${nombre}: acción solapa datos`)
        if(ampliado)await page.screenshot({path:`${dir}/seguimiento-${nombre}-200.png`,fullPage:true})
        if(accion){await bloque.getByRole('button',{name:accion,exact:true}).click();await page.waitForURL(url+'/compras')}
      }
      await page.unroute('**/api/inicio/contexto')
    }
    await page.setViewportSize({width:390,height:844}); await inicio()
  })
  await caso('errores de red visibles y recuperables', async () => {
    await inicio(); await page.route('**/api/inicio/contexto',r=>r.fulfill({status:503,json:{error:'Prueba local de conexión'}}))
    await page.getByRole('button',{name:'Actualizar Inicio',exact:true}).click()
    await page.getByText(/No pudimos comprobar pedidos/).waitFor()
    await page.screenshot({path:`${dir}/estado-error.png`,fullPage:true})
    await page.unroute('**/api/inicio/contexto')
    await page.getByRole('button',{name:'Actualizar seguimiento',exact:true}).click()
    await page.getByText(/No pudimos comprobar pedidos/).waitFor({state:'hidden'})
  })
  await caso('accesibilidad automática en móvil, escritorio y diálogo', async () => {
    for(const width of [390,1440]) {
      await page.setViewportSize({width,height:1000})
      await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')})
      const report=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}))
      writeFileSync(`${dir}/axe-${width}.json`,JSON.stringify(report.violations,null,2))
      assert.deepEqual(report.violations.map(x=>({id:x.id,n:x.nodes.length})),[])
    }
    await page.getByRole('button',{name:'Mostrá tu pase',exact:true}).click()
    const report=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}))
    writeFileSync(`${dir}/axe-dialogo.json`,JSON.stringify(report.violations,null,2)); assert.deepEqual(report.violations.map(x=>({id:x.id,n:x.nodes.length})),[])
    await page.keyboard.press('Escape')
  })
  await caso('texto ampliado y movimiento reducido', async () => {
    await page.addStyleTag({content:'html{font-size:200%!important} p,span,button{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important} p{margin-bottom:2em!important}'})
    for(const width of [320,390]) {
      await page.setViewportSize({width,height:844})
      await page.evaluate(async () => {window.scrollTo(0,0);await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))})
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Texto ampliado a ${width}px`)
      await page.screenshot({path:`${dir}/texto-ampliado-${width}.png`,fullPage:true})
    }
    assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true)
  })
  assert.deepEqual(errores,[]); assert.deepEqual(externas,[])
} catch(error) {
  resultados.push({ok:false,error:error.message}); console.error(error)
  await page.screenshot({path:`${dir}/fallo-aceptacion.png`,fullPage:true}); process.exitCode=1
} finally {
  writeFileSync(`${dir}/aceptacion.json`,JSON.stringify({resultados,medidas,errores,externas},null,2))
  await browser.close()
}
