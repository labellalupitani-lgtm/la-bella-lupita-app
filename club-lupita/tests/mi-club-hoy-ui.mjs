import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { vistaAislada } from './soporte-ui.mjs'
import { tlsLocal } from './tienda-tls.mjs'

// El Worker, la sesión, los códigos y PGlite son reales y están aislados.
// Las variantes visuales alteran exclusivamente las respuestas GET documentadas.
// La regresión transaccional de Mi Club vive en tests/mi-club-ui.mjs.
const dir = resolve(process.env.EVIDENCIA_DIR || 'entregables/mi-club-hoy-2026-10-22/pruebas-ui')
mkdirSync(dir, { recursive: true })
const resultados = [], medidas = [], errores = [], externas = [], escrituras = [], fixtures = {}
let t, browser, context, page
let modo = 'activo', cantidadSellos = 4, falloClub = false, cambiarTanda = false
const nombreLargo = 'María Fernanda de los Ángeles González Rodríguez'
const ahora = () => new Date().toISOString()
const cafe = () => page.getByRole('button', { name: 'Mostrar código del café', exact: true })
const pase = () => page.getByRole('button', { name: 'Mostrar mi pase', exact: true })
const bolsa = () => page.getByRole('button', { name: 'Mostrar código de la bolsa', exact: true })
const saldo = async () => Number((await t.db.query('SELECT total FROM saldo_de($1)', [t.id])).rows[0].total)

async function caso(nombre, trabajo) {
  try {
    await trabajo()
    resultados.push({ nombre, ok: true })
    console.log('PASA ' + nombre)
  } catch (error) {
    resultados.push({ nombre, ok: false, error: error.stack || String(error) })
    await capturar('fallo').catch(() => {})
    if (page) writeFileSync(dir + '/fallo-texto.txt', await page.locator('body').innerText().catch(() => ''))
    throw error
  }
}

async function estable() {
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await page.waitForFunction(() => [...document.images].every(i => i.complete))
  await page.evaluate(async () => { await Promise.all([...document.images].map(i => i.decode().catch(() => {}))) })
}

async function capturar(nombre) {
  await estable()
  await page.screenshot({ path: dir + '/' + nombre + '-viewport.png' })
  await page.screenshot({ path: dir + '/' + nombre + '-completo.png', fullPage: true })
}

async function capturarDetalles(nombre) {
  await estable()
  for (const [detalle, selector] of [['bolsa', '.club-beneficio-bolsa'], ['sellos', '.club-estampillas'], ['saldo', '.cuenta-saldo']]) {
    await page.locator(selector).screenshot({ path: dir + '/' + nombre + '-' + detalle + '.png' })
  }
  await page.evaluate(() => scrollTo(0, 0))
}

async function abrir(nombre = modo, ruta = '/club') {
  modo = nombre
  await page.goto(t.url + ruta)
  await pase().waitFor()
  await page.getByRole('button', { name: 'Actualizar Mi Club', exact: true }).waitFor()
  await estable()
}

async function actualizar() {
  const yo = page.waitForResponse(r => new URL(r.url()).pathname === '/api/yo')
  const club = page.waitForResponse(r => new URL(r.url()).pathname === '/api/club')
  await page.getByRole('button', { name: 'Actualizar Mi Club', exact: true }).click()
  await Promise.all([yo, club])
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

async function ampliarTexto() {
  const cambios = await page.evaluate(() => {
    const elementos = [...document.querySelectorAll('body *')].filter(e => e instanceof HTMLElement)
    const originales = elementos.map(e => ({ e, antes: parseFloat(getComputedStyle(e).fontSize) }))
    for (const { e, antes } of originales) e.style.setProperty('font-size', antes * 2 + 'px', 'important')
    return originales.filter(({ e }) => e.matches('main h1, main h2, main h3, main button, main p')).map(({ e, antes }) => ({ texto: e.textContent.trim().slice(0, 90), antes, despues: parseFloat(getComputedStyle(e).fontSize) }))
  })
  assert.ok(cambios.length > 8, 'se miden textos y controles de la pantalla')
  assert.ok(cambios.every(c => Math.abs(c.despues - c.antes * 2) < .05), 'el texto realmente duplica su tamaño computado')
  return cambios
}

async function reflujo(nombre, fuentes = []) {
  const dato = await page.evaluate(() => {
    const caja = r => ({ izquierda: r.left, derecha: r.right, arriba: r.top, abajo: r.bottom })
    const caracteres = elemento => {
      if (!elemento) return []
      const caminante = document.createTreeWalker(elemento, NodeFilter.SHOW_TEXT), medidas = []
      let nodo
      while ((nodo = caminante.nextNode())) for (let i = 0; i < nodo.textContent.length; i++) {
        const caracter = nodo.textContent[i]
        if (/\s/.test(caracter)) continue
        const rango = document.createRange()
        rango.setStart(nodo, i); rango.setEnd(nodo, i + 1)
        medidas.push({ caracter, ...caja(rango.getBoundingClientRect()) })
      }
      return medidas
    }
    const importe = document.querySelector('.cuenta-importe')
    const numero = importe && [...importe.querySelectorAll('span')].find(e => /\d/.test(e.textContent))
    const peso = document.querySelector('.club-peso')
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documento: document.documentElement.scrollWidth,
      cuerpo: document.body.scrollWidth,
      titulos: [...document.querySelectorAll('main h1, main h2, main h3, .club-credencial-nombre')].filter(e => e.getClientRects().length && getComputedStyle(e).clipPath !== 'inset(50%)').map(e => ({ texto: e.textContent, ancho: e.clientWidth, contenido: e.scrollWidth })),
      imagenesRotas: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.currentSrc),
      saldo: numero ? { texto: numero.textContent, caracteres: caracteres(numero), linea: caja(importe.getBoundingClientRect()), contenedor: caja(importe.closest('.cuenta-saldo').getBoundingClientRect()) } : null,
      peso: peso ? { texto: peso.textContent, caracteres: caracteres(peso), contenedor: caja(peso.closest('.club-bolsa-arte').getBoundingClientRect()) } : null,
      sellos: [...document.querySelectorAll('.club-estampilla-lista')].map(e => ({ etiqueta: e.getAttribute('aria-label'), contenedor: caja(e.getBoundingClientRect()), icono: caja(e.querySelector('.ico').getBoundingClientRect()), numero: caja(e.querySelector('small').getBoundingClientRect()), glifosNumero: caracteres(e.querySelector('small')) }))
    }
  })
  medidas.push({ nombre, ...dato, fuentes })
  assert.ok(dato.documento <= dato.viewport.width + 1 && dato.cuerpo <= dato.viewport.width + 1, nombre + ': sin desbordamiento horizontal')
  assert.ok(dato.titulos.every(h => h.contenido <= h.ancho + 1), nombre + ': títulos y nombre sin recorte')
  assert.deepEqual(dato.imagenesRotas, [], nombre + ': imágenes locales cargadas')
  const dentro = (c, limite) => c.izquierda >= limite.izquierda - 1 && c.derecha <= limite.derecha + 1 && c.arriba >= limite.arriba - 1 && c.abajo <= limite.abajo + 1
  const unaLinea = caracteres => caracteres.length > 0 && caracteres.every(c => Math.abs(c.arriba - caracteres[0].arriba) < 1)
  assert.ok(dato.saldo && /\d/.test(dato.saldo.texto), nombre + ': importe numérico identificado')
  assert.ok(unaLinea(dato.saldo.caracteres), nombre + ': el número del saldo no se fragmenta entre líneas')
  assert.ok(dato.saldo.caracteres.every(c => dentro(c, dato.saldo.contenedor) && c.izquierda >= dato.saldo.linea.izquierda - 1 && c.derecha <= dato.saldo.linea.derecha + 1), nombre + ': todos los dígitos del saldo permanecen dentro de su tarjeta y línea')
  assert.ok(dato.peso && dato.peso.texto.replace(/\s/g, '') === '250g', nombre + ': peso completo identificado')
  const digitosPeso = dato.peso.caracteres.filter(c => /\d/.test(c.caracter)), unidadPeso = dato.peso.caracteres.find(c => c.caracter === 'g')
  assert.ok(unaLinea(digitosPeso), nombre + ': 250 no se fragmenta entre líneas')
  assert.ok(unidadPeso && unidadPeso.izquierda >= digitosPeso.at(-1).derecha - 2 && Math.min(unidadPeso.abajo, digitosPeso[0].abajo) > Math.max(unidadPeso.arriba, digitosPeso[0].arriba), nombre + ': la unidad g continúa en la misma línea del peso')
  assert.ok(dato.peso.caracteres.every(c => dentro(c, dato.peso.contenedor)), nombre + ': peso y unidad permanecen dentro de su superficie')
  assert.ok(dato.sellos.length > 0, nombre + ': hay sellos marcados para comprobar')
  for (const sello of dato.sellos) {
    assert.ok(sello.icono.abajo <= sello.numero.arriba + 1, nombre + ': el icono no se superpone al número de ' + sello.etiqueta)
    assert.ok(dentro(sello.icono, sello.contenedor) && dentro(sello.numero, sello.contenedor) && sello.glifosNumero.every(c => dentro(c, sello.contenedor)), nombre + ': icono y número permanecen dentro de ' + sello.etiqueta)
  }
}

async function axe(nombre) {
  if (!await page.evaluate(() => !!window.axe)) await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') })
  const informe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }))
  writeFileSync(dir + '/axe-' + nombre + '.json', JSON.stringify(informe.violations, null, 2))
  assert.deepEqual(informe.violations.map(v => ({ id: v.id, impacto: v.impact, nodos: v.nodes.map(n => n.target) })), [], nombre)
}

async function focoVisible(control) {
  await control.focus()
  await page.keyboard.press('Shift')
  const datos = await control.evaluate(e => {
    const r = e.getBoundingClientRect(), nav = document.querySelector('.casa-nav-movil'), n = nav?.getBoundingClientRect(), css = getComputedStyle(e)
    return { foco: e === document.activeElement, arriba: r.top, abajo: r.bottom, limite: n && getComputedStyle(nav).display !== 'none' ? n.top : innerHeight, contorno: css.outlineStyle, ancho: parseFloat(css.outlineWidth) }
  })
  assert.ok(datos.foco && datos.arriba >= 0 && datos.abajo <= datos.limite + 1, 'control enfocado visible sobre la navegación: ' + JSON.stringify(datos))
  assert.ok(datos.contorno !== 'none' && datos.ancho >= 2, 'el foco se distingue visualmente: ' + JSON.stringify(datos))
}

try {
  t = await vistaAislada({ tls: tlsLocal() })
  // Activación sintética sin cargo; ningún pago es parte de esta prueba visual.
  await t.db.query("UPDATE membresia SET estado='activa',periodo_inicio=now(),hasta=now()+interval '30 days',autorenueva=false,contrato_version='fundadora-2026-10' WHERE socio_id=$1", [t.id])
  const saldoInicial = await saldo()
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: process.env.HEADED !== '1' })
  context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin === t.url) return route.continue()
    externas.push(url.href)
    return route.abort()
  })
  await context.addInitScript(token => {
    if (!sessionStorage.getItem('mi-club-hoy-fixture')) {
      localStorage.setItem('club-lupita:sesion', token)
      sessionStorage.setItem('mi-club-hoy-fixture', '1')
    }
    window.__sellosAnimados = []
    document.addEventListener('animationstart', e => { if (e.animationName === 'club-estampar') window.__sellosAnimados.push({ nombre: e.animationName, etiqueta: e.target.getAttribute('aria-label'), tiempo: performance.now() }) })
  }, t.token)
  page = await context.newPage()
  page.setDefaultTimeout(12000)
  page.on('pageerror', e => errores.push(e.message))
  page.on('request', r => { if (r.method() !== 'GET' && new URL(r.url()).origin === t.url) escrituras.push({ ruta: new URL(r.url()).pathname, metodo: r.method() }) })

  for (const ruta of ['/api/yo', '/api/club', '/api/catalogo']) await page.route('**' + ruta, async route => {
    if (ruta === '/api/club' && falloClub) return route.fulfill({ status: 503, json: { error: 'Consulta sintética de Mi Club interrumpida.' } })
    const respuesta = await route.fetch(), original = await respuesta.json()
    if (respuesta.status() !== 200) return route.fulfill({ response: respuesta })
    const dato = structuredClone(original)
    if (ruta === '/api/yo') {
      dato.sellos = dato.sellos.slice(0, cantidadSellos)
      if (cambiarTanda) dato.sellos = dato.sellos.map(s => ({ ...s, puesto: '2026-10-20T10:00:00-06:00' }))
      if (modo === 'gratis' || modo === 'renovacion') dato.membresia = null
      if (modo === 'entregado') { dato.bebidaDelDia = ahora(); dato.bolsaDelMes = ahora() }
      if (modo === 'premio') dato.premiosPendientes = 1
      if (modo === 'nombre-largo') dato.socio.nombre = nombreLargo
    }
    if (ruta === '/api/club' && (modo === 'gratis' || modo === 'renovacion')) dato.ultima = { ...dato.ultima, estado: modo === 'gratis' ? 'vencida' : 'activa', autorenueva: modo === 'renovacion', hasta: '2026-10-01T10:00:00-06:00' }
    if (ruta === '/api/catalogo' && modo === 'agotado') dato.experiencias = dato.experiencias.map(e => ({ ...e, libres: 0 }))
    fixtures[modo + ':' + ruta] = dato
    return route.fulfill({ response: respuesta, json: dato })
  })

  await caso('la primera vista activa ofrece un único café, pase y saldo, con imagen de ambiente identificada', async () => {
    await abrir('activo')
    await cafe().waitFor()
    assert.equal(await cafe().count(), 1)
    assert.equal(await pase().count(), 1)
    assert.equal(await page.locator('main .cuenta-importe').count(), 1)
    assert.equal(await page.locator('main h1').count(), 1)
    assert.match(await page.locator('.club-hoy-foto figcaption').innerText(), /ambiente/i)
    const c = await cafe().boundingBox(), nav = await page.locator('.casa-nav-movil').boundingBox()
    assert.ok(c.y >= 0 && c.y + c.height <= nav.y, 'el café se puede usar desde la primera vista de 390px')
    assert.equal(await page.getByRole('group', { name: 'Sellos de tu tanda' }).locator('.club-estampilla').count(), 9)
    await capturar('activo-390-inicial')
    await axe('activo-390')
  })

  await caso('el pase y el código del café se abren por teclado y devuelven el foco al cerrar', async () => {
    for (const [control, titulo] of [[pase(), 'Tu pase de la casa'], [cafe(), 'Mostrá tu beneficio en caja']]) {
      await focoVisible(control)
      await page.keyboard.press('Enter')
      const dialogo = page.getByRole('dialog', { name: titulo })
      await dialogo.waitFor()
      if (titulo === 'Mostrá tu beneficio en caja') await dialogo.getByText(/Vence en/).waitFor()
      await axe(titulo === 'Tu pase de la casa' ? 'pase' : 'codigo-cafe')
      await page.keyboard.press('Escape')
      await dialogo.waitFor({ state: 'hidden' })
      assert.equal(await control.evaluate(e => e === document.activeElement), true, titulo + ': foco devuelto')
    }
  })

  await caso('la cuenta gratuita coloca los sellos antes de la oferta y conserva sus nueve posiciones', async () => {
    await abrir('gratis')
    await page.getByRole('heading', { name: 'Tu lugar entre cien' }).waitFor()
    assert.equal(await cafe().count(), 0)
    assert.equal(await page.locator('#club-premio-titulo').evaluate(e => !!(e.compareDocumentPosition(document.querySelector('#club-oferta')) & Node.DOCUMENT_POSITION_FOLLOWING)), true)
    assert.equal(await page.getByRole('group', { name: 'Sellos de tu tanda' }).locator('.club-estampilla').count(), 9)
    await capturar('gratis-390')
    await axe('gratis-390')
  })

  await caso('entrega, renovación pendiente, premio y experiencia agotada muestran acciones coherentes', async () => {
    await abrir('entregado')
    assert.equal(await cafe().isDisabled(), true)
    assert.equal(await bolsa().isDisabled(), true)
    await capturar('entregado-390')
    await abrir('renovacion')
    await page.getByRole('heading', { name: 'Tu renovación está pendiente' }).waitFor()
    assert.equal(await cafe().count(), 0)
    assert.equal(await page.getByRole('button', { name: 'Revisar renovación pendiente' }).isEnabled(), true)
    await capturar('renovacion-390')
    await abrir('premio')
    assert.equal(await page.getByRole('button', { name: 'Mostrar mi premio' }).isEnabled(), true)
    await page.getByRole('button', { name: 'Mostrar mi premio' }).scrollIntoViewIfNeeded()
    await capturar('premio-390')
    await abrir('agotado')
    const agotadas = page.getByRole('button', { name: 'Sin butacas', exact: true })
    assert.ok(await agotadas.count() > 0)
    for (const boton of await agotadas.all()) assert.equal(await boton.isDisabled(), true)
    await agotadas.first().scrollIntoViewIfNeeded()
    await capturar('experiencia-agotada-390')
  })

  await caso('un fallo de actualización conserva los beneficios y anuncia el error', async () => {
    await abrir('activo')
    falloClub = true
    await actualizar()
    await page.getByRole('alert').filter({ hasText: 'Consulta sintética de Mi Club interrumpida.' }).waitFor()
    assert.equal(await cafe().isEnabled(), true)
    await page.evaluate(() => scrollTo(0, 0))
    await capturar('error-actualizacion-390')
    falloClub = false
    await actualizar()
  })

  await caso('320, 390, 768 y 1440 conservan contenido y nombre largo a 100% y 200% real', async () => {
    for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1440, 1000]]) {
      await page.setViewportSize({ width, height })
      for (const texto200 of [false, true]) {
        await abrir('nombre-largo')
        assert.equal(await page.locator('.club-credencial-nombre').innerText(), nombreLargo)
        const fuentes = texto200 ? await ampliarTexto() : []
        await page.evaluate(() => scrollTo(0, 0))
        const nombre = 'activo-' + width + (texto200 ? '-texto200' : '')
        if (texto200) await capturarDetalles(nombre)
        await reflujo(nombre, fuentes)
        await capturar(nombre)
        if (width === 320 && texto200) {
          await focoVisible(cafe())
          await capturar('cafe-foco-320-texto200')
          await axe('activo-320-texto200')
        }
      }
    }
  })

  await caso('el enlace directo a la bolsa enfoca su sección y mantiene el código accesible', async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    await abrir('activo', '/club?beneficio=bolsa')
    assert.equal(await page.locator('#club-beneficios').evaluate(e => e === document.activeElement), true)
    await focoVisible(bolsa())
    await page.keyboard.press('Enter')
    const dialogo = page.getByRole('dialog', { name: 'Mostrá tu beneficio en caja' })
    await dialogo.getByText(/Vence en/).waitFor()
    await capturar('bolsa-codigo-390')
    await page.keyboard.press('Escape')
    await dialogo.waitFor({ state: 'hidden' })
    assert.equal(await bolsa().evaluate(e => e === document.activeElement), true)
  })

  await caso('solo un sello nuevo anima: no lo hacen carga, reentrada, cambio de tanda ni movimiento reducido', async () => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    cantidadSellos = 4
    cambiarTanda = false
    await abrir('activo')
    assert.deepEqual(await page.evaluate(() => window.__sellosAnimados), [])
    cantidadSellos = 5
    await actualizar()
    await page.waitForFunction(() => window.__sellosAnimados.length === 1)
    assert.equal(await page.evaluate(() => window.__sellosAnimados[0].etiqueta), 'Consultar sello 5')
    await page.getByRole('button', { name: 'Consultar sello 5', exact: true }).focus()
    await page.keyboard.press('Enter')
    assert.equal(await page.getByRole('button', { name: 'Consultar sello 5', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.match(await page.locator('#club-sello-detalle').innerText(), /Sello 5/)
    await actualizar()
    assert.equal(await page.evaluate(() => window.__sellosAnimados.length), 1, 'actualización idéntica no repite animación')
    await page.getByRole('link', { name: 'Ver mis entradas y reservas', exact: true }).click()
    await page.waitForURL('**/compras')
    await page.getByRole('navigation', { name: 'Secciones de Club Lupita' }).getByRole('link', { name: 'Mi Club', exact: true }).click()
    await cafe().waitFor()
    await estable()
    assert.equal(await page.evaluate(() => window.__sellosAnimados.length), 1, 'reentrada SPA no anima sellos existentes')
    cantidadSellos = 2
    cambiarTanda = true
    await actualizar()
    assert.equal(await page.evaluate(() => window.__sellosAnimados.length), 1, 'reinicio de tanda no celebra sellos previos')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    cantidadSellos = 3
    await actualizar()
    await estable()
    assert.equal(await page.evaluate(() => window.__sellosAnimados.length), 1)
    assert.equal(await page.getByRole('button', { name: 'Consultar sello 3', exact: true }).evaluate(e => getComputedStyle(e).animationName), 'none')
    await capturar('sellos-reduced-motion-390')
  })

  await caso('la revisión no crea compras, cobros, errores de JavaScript ni tráfico externo', async () => {
    assert.equal(await saldo(), saldoInicial)
    assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa LIKE 'mem:%' OR ref_externa LIKE 'renovacion:%'")).rows[0].n, 0)
    assert.ok(escrituras.every(e => !/membresia\/(apartar|cancelar|renovacion)|experiencias\/.+\/apartar|club\/sincronizar/.test(e.ruta)), 'no solicitudes de compra o renovación')
    assert.deepEqual(errores, [])
    assert.deepEqual(externas, [])
  })
} finally {
  writeFileSync(dir + '/resultados.json', JSON.stringify({ resultados, medidas, errores, externas, escrituras, alcance: 'Edge Chromium. Worker y PGlite reales aislados; variantes GET de cuenta, club y catálogo sintéticas. No compras ni pagos. Movimiento comprobado por eventos animationstart; texto 200% por tamaño computado de cada elemento. Axe no sustituye auditoría humana.' }, null, 2))
  writeFileSync(dir + '/fixtures.json', JSON.stringify(fixtures, null, 2))
  await browser?.close()
  await t?.close()
}
