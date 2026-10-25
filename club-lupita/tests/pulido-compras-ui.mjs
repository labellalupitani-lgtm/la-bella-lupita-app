import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { vistaAislada } from './soporte-ui.mjs'
import { habilitarTienda, fichaPrueba } from './tienda-fixture.mjs'
import { tlsLocal } from './tienda-tls.mjs'

// Solo Worker/PGlite local. El listado grande es una respuesta sintética del
// contrato /api/compras; los envíos y respuestas de atención usan el Worker.
const dir = resolve(process.env.EVIDENCIA_DIR || 'entregables/pulido-tienda-compras-2026-10-22/pruebas-compras')
mkdirSync(dir, { recursive: true })
const resultados = [], errores = [], externas = [], peticionesCompras = [], envios = [], medidas = []
let t, browser, context, page, liberarCarga
let modoCompras = 'worker', paginas = [], fallarLecturaAyuda = false, fallarEnvioAyuda = false
const patronCompras = '**/api/compras?*'
const errorCompras = 'Consulta sintética de compras interrumpida.'
const errorEnvio = 'Envío sintético rechazado; el borrador sigue disponible.'
const errorLectura = 'Lectura sintética de avisos interrumpida.'
const pausa = () => new Promise(resolve => { liberarCarga = resolve })
const saldo = async () => Number((await t.db.query('SELECT total FROM saldo_de($1)', [t.id])).rows[0].total)
const tarjetas = () => page.locator('.compra-comprobante')
const ayuda = () => page.locator('.compras-ayuda')
const resumenAyuda = () => ayuda().locator('summary')
const campoAyuda = () => ayuda().getByRole('textbox', { name: /^Contanos qué necesitás/ })
const actualizador = () => page.getByRole('button', { name: 'Actualizar', exact: true })
const referencias = async () => page.locator('.compra-comprobante .compra-referencia').allTextContents()
const esperarTarjetas = n => page.waitForFunction(n => document.querySelectorAll('.compra-comprobante').length === n, n)
const lecturaCliente = async ruta => {
  // El navegador migra el token inicial a cookie HttpOnly e invalida ese token.
  // La comprobación independiente adopta su cookie real, nunca vuelve al legado.
  const cookies = (await context.cookies(t.url)).filter(c => c.name.startsWith('__Host-lupita-cliente'))
  assert.ok(cookies.some(c => c.name === '__Host-lupita-cliente'), 'cookie emitida por el Worker presente')
  return t.request(ruta, undefined, null, { headers: { 'x-cliente-solicitud': '1', cookie: cookies.map(c => c.name + '=' + c.value).join('; ') } })
}

async function caso(nombre, trabajo) {
  try {
    await trabajo()
    resultados.push({ nombre, ok: true })
    console.log('PASA ' + nombre)
  } catch (error) {
    resultados.push({ nombre, ok: false, error: error.stack || String(error) })
    if (page && !page.isClosed()) {
      await page.screenshot({ path: dir + '/fallo-viewport.png' }).catch(() => {})
      await page.screenshot({ path: dir + '/fallo-completo.png', fullPage: true }).catch(() => {})
      writeFileSync(dir + '/fallo-texto.txt', await page.locator('body').innerText().catch(() => ''))
    }
    throw error
  }
}

async function capturar(nombre) {
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: dir + '/' + nombre + '-viewport.png' })
  await page.screenshot({ path: dir + '/' + nombre + '-completo.png', fullPage: true })
}

async function actualizar() {
  const respuesta = page.waitForResponse(r => new URL(r.url()).pathname === '/api/compras')
  await actualizador().click()
  await respuesta
  await actualizador().waitFor({ state: 'visible' })
  await page.waitForFunction(() => { const boton = document.querySelector('.compras-sincronizacion button'); return boton && !boton.disabled })
}

async function comprobarReflujo(nombre) {
  const medida = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    raiz: getComputedStyle(document.documentElement).fontSize,
    anchoDocumento: document.documentElement.scrollWidth,
    anchoCuerpo: document.body.scrollWidth,
    titulos: [...document.querySelectorAll('main h1, main h2, main h3')].map(e => ({ texto: e.textContent, ancho: e.clientWidth, contenido: e.scrollWidth, soloAccesible: getComputedStyle(e).clipPath === 'inset(50%)', sinCaja: !e.getClientRects().length })),
    imagenesRotas: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.currentSrc)
  }))
  medidas.push({ nombre, ...medida })
  assert.ok(medida.anchoDocumento <= medida.viewport.width + 1, nombre + ': el documento desborda horizontalmente')
  assert.ok(medida.anchoCuerpo <= medida.viewport.width + 1, nombre + ': el cuerpo desborda horizontalmente')
  assert.ok(medida.titulos.filter(h => !h.soloAccesible && !h.sinCaja).every(h => h.contenido <= h.ancho + 1), nombre + ': hay títulos cortados')
  assert.deepEqual(medida.imagenesRotas, [], nombre + ': imágenes locales rotas')
}

async function auditarAxe(nombre) {
  if (!await page.evaluate(() => !!window.axe)) await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') })
  const informe = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }))
  writeFileSync(dir + '/axe-' + nombre + '.json', JSON.stringify(informe.violations, null, 2))
  assert.deepEqual(informe.violations.map(v => ({ id: v.id, impacto: v.impact, nodos: v.nodes.map(n => n.target) })), [], nombre)
}

try {
  t = await vistaAislada({ tls: tlsLocal() })
  await habilitarTienda(t)
  const saldoInicial = await saldo()
  const cotizada = await t.request('/api/tienda/cotizar', { ref: 'pulido-compras-' + crypto.randomUUID() })
  assert.equal(cotizada.status, 200, JSON.stringify(cotizada.body))
  const cotizacion = cotizada.body
  assert.equal(cotizacion.oferta.ficha.politica, fichaPrueba.politica)
  const fechaBase = Date.parse('2026-10-01T12:00:00-06:00')
  const compra = (tipo, n, detalle) => ({ id: tipo + ':00000000-0000-4000-8000-' + String(n).padStart(12, '0'), tipo, creado: new Date(fechaBase - n * 60000).toISOString(), detalle })
  const pedido = compra('pedido', 1, {
    numero: 4101, estado: 'preparando', total: 19000, empaque: 1000,
    lineas: [{ nombre: 'Café de prueba con opciones', cuanto: 2, precio: 9000, precioAntes: 10000, descuentoClub: 10, opciones: [{ nombre: 'Leche', valor: 'Avena de prueba' }] }],
    restriccion_confirmada: 'Sin nueces; confirmar utensilios separados con cocina.'
  })
  const bolsa = compra('bolsa', 2, { numero: 37, generacion: 1, estado: 'pagada', total: 89000, cotizacion })
  const reserva = compra('reserva', 3, { zona: 'terraza', cuando: '2099-11-02T12:00:00-06:00', fin: '2099-11-02T14:00:00-06:00', personas: 4, deposito: 12000, estado: 'confirmada' })
  const experiencia = compra('experiencia', 4, { nombre: 'Encuentro sintético de café', cuando: '2099-11-04T16:00:00-06:00', butaca: 3, total: 85000, titular: true, puede_ceder: false, lugar: 'Mesa de prueba', duracion_minutos: 90, incluye: 'Incluye tres degustaciones de prueba.', condiciones: 'Condición sintética: ingreso diez minutos antes; cupo individual.' })
  const principales = [pedido, bolsa, reserva, experiencia]
  const historicos = Array.from({ length: 16 }, (_, i) => compra('pedido', i + 5, { numero: 4105 + i, estado: 'entregado', total: 6000, lineas: [{ nombre: 'Americano sintético ' + (i + 1), cuanto: 1, precio: 6000 }] }))
  const paginaCero = [...principales, ...historicos]
  const repetidoActualizado = { ...pedido, detalle: { ...pedido.detalle, estado: 'listo' } }
  const anteriores = [
    compra('bolsa', 21, { numero: 38, generacion: 1, estado: 'reembolsada', total: 89000, motivo: 'Demora sintética autorizada', cotizacion }),
    compra('experiencia', 22, { ...experiencia.detalle, nombre: 'Encuentro sintético anterior', cuando: '2026-09-01T16:00:00-06:00', asistencia: '2026-09-01T16:05:00-06:00' })
  ]
  paginas = [{ compras: paginaCero, hayMas: true }, { compras: [repetidoActualizado, ...anteriores], hayMas: false }]
  writeFileSync(dir + '/fixtures-compras.json', JSON.stringify({ paginaCero, paginaUno: paginas[1], alcance: 'Comprobantes sintéticos, no se envían compras ni pagos.' }, null, 2))

  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: process.env.HEADED !== '1' })
  context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    if (url.origin === t.url) return route.continue()
    externas.push(url.href)
    return route.abort()
  })
  await context.addInitScript(token => {
    if (!sessionStorage.getItem('pulido-compras')) {
      localStorage.setItem('club-lupita:sesion', token)
      sessionStorage.setItem('pulido-compras', '1')
    }
  }, t.token)
  page = await context.newPage()
  page.setDefaultTimeout(12000)
  page.on('pageerror', error => errores.push(error.message))
  await page.route(patronCompras, async route => {
    const url = new URL(route.request().url()), pagina = Number(url.searchParams.get('pagina'))
    peticionesCompras.push({ pagina, modo: modoCompras, metodo: route.request().method() })
    assert.equal(route.request().method(), 'GET')
    if (modoCompras === 'worker') return route.continue()
    if (modoCompras === 'carga') { await pausa(); return route.fulfill({ json: { compras: [], hayMas: false } }) }
    if (modoCompras === 'error') return route.fulfill({ status: 503, json: { error: errorCompras } })
    return route.fulfill({ json: paginas[pagina] || { compras: [], hayMas: false } })
  })
  await page.route('**/api/atencion', route => {
    const metodo = route.request().method()
    if (metodo === 'POST') {
      envios.push({ ...route.request().postDataJSON(), rechazado: fallarEnvioAyuda })
      if (fallarEnvioAyuda) return route.fulfill({ status: 422, json: { error: errorEnvio } })
    }
    if (metodo === 'GET' && fallarLecturaAyuda) return route.fulfill({ status: 503, json: { error: errorLectura } })
    return route.continue()
  })

  await caso('carga, vacío real y error inicial son distintos; el encabezado es único', async () => {
    modoCompras = 'carga'
    await page.goto(t.url + '/compras')
    await page.getByRole('status').filter({ hasText: 'Consultando tu cuenta…' }).waitFor()
    assert.equal(await page.getByText('Todavía no hay compras o reservas en tu cuenta.', { exact: true }).count(), 0)
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.getByRole('heading', { level: 1, name: 'Mis compras y reservas', exact: true }).count(), 1)
    assert.equal(await actualizador().isDisabled(), true)
    await capturar('carga-390')
    liberarCarga()
    await page.getByText('Todavía no hay compras o reservas en tu cuenta.', { exact: true }).waitFor()
    modoCompras = 'worker'
    await actualizar()
    const vacioReal = await lecturaCliente('/api/compras?pagina=0')
    assert.equal(vacioReal.status, 200)
    assert.deepEqual(vacioReal.body, { compras: [], hayMas: false })
    await page.getByRole('button', { name: 'Preparar una visita', exact: true }).waitFor()
    await page.evaluate(() => scrollTo(0, 0))
    const accionVacia = await page.getByRole('button', { name: 'Preparar una visita', exact: true }).boundingBox()
    const navVacia = await page.locator('.casa-nav-movil').boundingBox()
    assert.ok(accionVacia.y + accionVacia.height <= navVacia.y, 'la acción del vacío debe verse completa en la primera ventana de 390px')
    await capturar('vacio-390')
    modoCompras = 'error'
    await page.reload()
    await page.getByRole('alert').filter({ hasText: errorCompras }).waitFor()
    assert.equal(await page.getByText('Todavía no hay compras o reservas en tu cuenta.', { exact: true }).count(), 0)
    assert.equal(await tarjetas().count(), 0)
    assert.equal(await actualizador().isEnabled(), true)
    await capturar('error-inicial-390')
  })

  await caso('los cuatro tipos conservan condiciones, restricciones, descuentos e identificadores', async () => {
    modoCompras = 'datos'
    await actualizar()
    await esperarTarjetas(20)
    const comprobar = async (registro, textos) => {
      const tarjeta = tarjetas().filter({ hasText: 'Comprobante: ' + registro.id })
      assert.equal(await tarjeta.count(), 1)
      for (const texto of textos) await tarjeta.getByText(texto, { exact: false }).filter({ visible: true }).waitFor()
    }
    await comprobar(pedido, ['Pedido #4101', 'Restricción confirmada para cocina: ' + pedido.detalle.restriccion_confirmada, 'Mesa Fundadora: 10% incluido.', 'Precio unitario antes del descuento: C$ 100.', '2 × Café de prueba con opciones', 'Leche: Avena de prueba', 'Empaque incluido: C$ 10'])
    await comprobar(bolsa, ['Lote 1 · Pagada · en espera de preparación', '250 g · Grano entero (fixture)', 'Retiro estimado', 'Lugar y horario', fichaPrueba.lugar, fichaPrueba.horario, fichaPrueba.politica])
    await comprobar(reserva, ['Tu mesa', '4 personas', 'Gestionar esta reserva'])
    await comprobar(experiencia, [experiencia.detalle.nombre, 'Butaca 3', experiencia.detalle.incluye, experiencia.detalle.condiciones, 'Mesa de prueba · 90 minutos'])
    for (const [registro, etiqueta, valor] of [[pedido, 'Importe', 'C$ 190'], [bolsa, 'Importe', 'C$ 890'], [reserva, 'Anticipo', 'C$ 120'], [experiencia, 'Importe', 'C$ 850']]) {
      const importe = tarjetas().filter({ hasText: 'Comprobante: ' + registro.id }).locator('.compra-importe')
      await importe.getByText(etiqueta, { exact: true }).waitFor()
      await importe.getByText(valor, { exact: true }).waitFor()
    }
    await tarjetas().filter({ hasText: 'Comprobante: ' + pedido.id }).getByRole('listitem').filter({ hasText: '2 × Café de prueba con opciones' }).getByText('C$ 180', { exact: true }).waitFor()
    const filtros = page.getByRole('group', { name: 'Filtrar los comprobantes cargados', exact: true })
    for (const [nombre, tipo] of [['Pedidos', 'pedido'], ['Café', 'bolsa'], ['Mesas', 'reserva'], ['Experiencias', 'experiencia']]) {
      await filtros.getByRole('button', { name: nombre, exact: true }).click()
      const esperados = paginaCero.filter(c => c.tipo === tipo).map(c => 'Comprobante: ' + c.id).sort()
      await esperarTarjetas(esperados.length)
      assert.deepEqual((await referencias()).map(s => s.trim()).sort(), esperados)
      assert.equal(await filtros.getByRole('button', { name: nombre, exact: true }).getAttribute('aria-pressed'), 'true')
    }
    await filtros.getByRole('button', { name: 'Todas', exact: true }).click()
    await esperarTarjetas(20)
  })

  await caso('un fallo después de datos conserva los comprobantes y anuncia su antigüedad', async () => {
    const antes = await referencias()
    modoCompras = 'error'
    await actualizar()
    await page.getByRole('alert').filter({ hasText: errorCompras }).waitFor()
    await page.getByText('Los comprobantes visibles corresponden a la última consulta disponible.', { exact: false }).waitFor()
    const estado = await page.locator('.compras-sincronizacion').innerText()
    assert.match(estado, /Última consulta disponible:/)
    assert.doesNotMatch(estado, /Compras actualizadas|Actualizado correctamente|Actualización completada/)
    assert.deepEqual(await referencias(), antes)
    assert.equal(await page.getByText('Todavía no hay compras o reservas en tu cuenta.', { exact: true }).count(), 0)
    await page.evaluate(() => window.scrollTo(0, 0))
    await capturar('error-con-datos-390')
    modoCompras = 'datos'
    await actualizar()
    await page.getByRole('alert').filter({ hasText: errorCompras }).waitFor({ state: 'hidden' })
  })

  await caso('Ver anteriores añade sin duplicar y actualiza el comprobante repetido', async () => {
    const respuesta = page.waitForResponse(r => new URL(r.url()).pathname === '/api/compras' && new URL(r.url()).searchParams.get('pagina') === '1')
    await page.getByRole('button', { name: 'Ver anteriores', exact: true }).click()
    await respuesta
    await esperarTarjetas(22)
    const refs = await referencias()
    assert.equal(new Set(refs).size, 22)
    assert.deepEqual(refs.map(s => s.trim()).sort(), [...paginaCero, ...anteriores].map(c => 'Comprobante: ' + c.id).sort())
    await tarjetas().filter({ hasText: 'Comprobante: ' + pedido.id }).getByText('Estado: listo', { exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Ver anteriores', exact: true }).count(), 0)
    assert.ok(peticionesCompras.some(r => r.pagina === 1))
  })

  await caso('un filtro vacío ofrece volver a todos sin presentar la cuenta como vacía', async () => {
    paginas = [{ compras: [pedido], hayMas: false }]
    await actualizar()
    await esperarTarjetas(1)
    await page.getByRole('group', { name: 'Filtrar los comprobantes cargados' }).getByRole('button', { name: 'Experiencias', exact: true }).click()
    await page.getByText('No hay comprobantes de este tipo entre los cargados.', { exact: true }).waitFor()
    assert.equal(await page.getByText('Todavía no hay compras o reservas en tu cuenta.', { exact: true }).count(), 0)
    await page.getByRole('button', { name: 'Ver todos los comprobantes', exact: true }).click()
    await esperarTarjetas(1)
    paginas = [{ compras: principales, hayMas: false }]
    await actualizar()
    await esperarTarjetas(4)
  })

  await caso('ayuda sigue montada, conserva borrador y errores al plegar y envía una sola solicitud al Worker', async () => {
    assert.match(await resumenAyuda().innerText(), /Avisos y ayuda de la casa/)
    assert.equal(await ayuda().getAttribute('open'), null)
    assert.equal(await ayuda().locator('textarea').count(), 1, 'el contenido cerrado permanece montado')
    assert.equal(await campoAyuda().isVisible(), false)
    await resumenAyuda().focus()
    await page.keyboard.press('Enter')
    await campoAyuda().waitFor()
    const borrador = 'Revisen el comprobante sintético ' + bolsa.id + '; necesito confirmar el retiro.'
    await campoAyuda().fill(borrador)
    await resumenAyuda().click()
    assert.equal(await campoAyuda().isVisible(), false)
    await resumenAyuda().focus()
    await page.keyboard.press('Space')
    assert.equal(await campoAyuda().inputValue(), borrador)
    fallarEnvioAyuda = true
    await ayuda().getByRole('button', { name: 'Enviar solicitud a la casa', exact: true }).click()
    await ayuda().getByRole('alert').filter({ hasText: errorEnvio }).waitFor()
    fallarLecturaAyuda = true
    await ayuda().getByRole('button', { name: 'Actualizar avisos', exact: true }).click()
    await ayuda().getByRole('alert').filter({ hasText: errorLectura }).waitFor()
    assert.equal(await campoAyuda().inputValue(), borrador)
    assert.equal(await ayuda().getByText('Solicitud registrada. La respuesta aparecerá aquí.', { exact: true }).count(), 0)
    await resumenAyuda().click()
    await resumenAyuda().click()
    assert.equal(await campoAyuda().inputValue(), borrador)
    await ayuda().getByRole('alert').filter({ hasText: errorEnvio }).waitFor()
    fallarLecturaAyuda = false
    await ayuda().getByRole('button', { name: 'Actualizar avisos', exact: true }).click()
    await ayuda().getByRole('alert').filter({ hasText: errorLectura }).waitFor({ state: 'hidden' })
    await ayuda().getByRole('alert').filter({ hasText: errorEnvio }).waitFor()
    fallarEnvioAyuda = false
    await ayuda().getByRole('button', { name: 'Enviar solicitud a la casa', exact: true }).click()
    await ayuda().getByText('Solicitud registrada. La respuesta aparecerá aquí.', { exact: true }).waitFor()
    assert.equal(await campoAyuda().inputValue(), '')
    assert.equal(await ayuda().getByRole('alert').count(), 0)
    assert.equal(envios.length, 2)
    assert.equal(envios[0].referencia, envios[1].referencia, 'el reintento conserva la misma referencia')
    const solicitudes = (await lecturaCliente('/api/atencion')).body.solicitudes.filter(s => s.mensaje === borrador)
    assert.equal(solicitudes.length, 1)
    assert.equal(solicitudes[0].categoria, 'compra')
    assert.equal(solicitudes[0].estado, 'pendiente')
    const respuesta = 'Confirmamos el retiro sintético en el horario del comprobante.'
    const resuelta = await t.request('/api/operacion/atencion/' + solicitudes[0].id + '/responder', { respuesta }, t.staff)
    assert.equal(resuelta.status, 200, JSON.stringify(resuelta.body))
    await ayuda().getByRole('button', { name: 'Actualizar avisos', exact: true }).click()
    await ayuda().getByText('La casa: ' + respuesta, { exact: true }).waitFor()
    await ayuda().getByText('Respondida', { exact: true }).waitFor()
    assert.equal(await saldo(), saldoInicial)
    await capturar('ayuda-respondida-390')
    await auditarAxe('ayuda-abierta-390')
    await resumenAyuda().click()
  })

  await caso('320, 390, 768 y 1440 conservan el contenido con texto normal y al 200%', async () => {
    for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1440, 1000]]) {
      await page.setViewportSize({ width, height })
      for (const texto200 of [false, true]) {
        await page.evaluate(texto200 => { document.documentElement.style.fontSize = texto200 ? '200%' : '' }, texto200)
        await page.evaluate(() => window.scrollTo(0, 0))
        const nombre = 'comprobantes-' + width + (texto200 ? '-texto200' : '')
        await comprobarReflujo(nombre)
        assert.equal(await tarjetas().count(), 4)
        assert.equal(await page.locator('h1').count(), 1)
        if (width === 390 && !texto200) {
          const estadoPrimero = await tarjetas().first().locator('.compra-estado').boundingBox()
          const navPrimero = await page.locator('.casa-nav-movil').boundingBox()
          assert.ok(estadoPrimero.y + estadoPrimero.height <= navPrimero.y, 'el estado del primer comprobante debe verse antes de la navegación')
        }
        await capturar(nombre)
      }
    }
    await page.setViewportSize({ width: 390, height: 844 })
    await page.evaluate(() => { document.documentElement.style.fontSize = ''; window.scrollTo(0, 0) })
    await auditarAxe('comprobantes-cerrados-390')
  })

  await caso('teclado opera filtros y ayuda; el textarea queda visible sobre la navegación con texto al 200%', async () => {
    const filtros = page.getByRole('group', { name: 'Filtrar los comprobantes cargados' })
    await filtros.getByRole('button', { name: 'Todas', exact: true }).focus()
    await page.keyboard.press('Tab')
    assert.equal(await filtros.getByRole('button', { name: 'Pedidos', exact: true }).evaluate(e => e === document.activeElement), true)
    await page.keyboard.press('Space')
    await esperarTarjetas(1)
    assert.equal(await filtros.getByRole('button', { name: 'Pedidos', exact: true }).getAttribute('aria-pressed'), 'true')
    await filtros.getByRole('button', { name: 'Todas', exact: true }).click()
    await esperarTarjetas(4)
    await page.setViewportSize({ width: 320, height: 700 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    await resumenAyuda().focus()
    await page.keyboard.press('Enter')
    for (let n = 0; n < 40; n++) {
      await page.keyboard.press('Tab')
      if (await campoAyuda().evaluate(e => e === document.activeElement)) break
    }
    assert.equal(await campoAyuda().evaluate(e => e === document.activeElement), true)
    await ayuda().getByRole('combobox', { name: 'Motivo', exact: true }).selectOption('datos')
    const motivoCompleto = ayuda().getByText('Motivo elegido: Solicitar copia o revisión de mis datos', { exact: true })
    assert.equal(await motivoCompleto.isVisible(), true)
    assert.equal(await motivoCompleto.evaluate(e => e.scrollWidth <= e.clientWidth), true, 'el motivo completo permite reflujo')
    await motivoCompleto.scrollIntoViewIfNeeded()
    await capturar('motivo-completo-320-texto200')
    await campoAyuda().focus()
    const campo = await campoAyuda().boundingBox(), nav = await page.locator('.casa-nav-movil').boundingBox()
    const limite = nav ? nav.y : 700
    assert.ok(campo.y >= 0 && campo.y + campo.height <= limite + 1, 'el foco no debe quedar bajo la navegación fija')
    await comprobarReflujo('ayuda-abierta-320-texto200')
    await capturar('ayuda-foco-320-texto200')
    await auditarAxe('ayuda-abierta-320-texto200')
  })

  await caso('el flujo no genera compras, cargos, errores de JavaScript ni tráfico externo', async () => {
    assert.equal(await saldo(), saldoInicial)
    assert.equal((await t.db.query('SELECT count(*)::int n FROM compra_bolsa')).rows[0].n, 0)
    assert.equal((await t.db.query('SELECT count(*)::int n FROM pedido')).rows[0].n, 0)
    assert.deepEqual(errores, [])
    assert.deepEqual(externas, [])
    assert.ok(peticionesCompras.every(r => r.metodo === 'GET'))
  })
} finally {
  liberarCarga?.()
  writeFileSync(dir + '/resultados.json', JSON.stringify({ resultados, medidas, errores, externas, peticionesCompras, envios, capturas: 'Cada estado se guarda como viewport real y página completa.' }, null, 2))
  await browser?.close()
  await t?.close()
}
