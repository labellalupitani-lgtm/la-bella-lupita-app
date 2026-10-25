import assert from 'node:assert/strict'
import { chromium, firefox, webkit } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { vistaAislada } from './soporte-cliente-perfiles.mjs'

// Solo Cliente y datos locales. Ejecutar en serie con las demás suites de este soporte.
// No se modifica CSP ni se usa bypassCSP: axe se ejecuta por el canal de evaluación.
// 200 %: reflujo equivalente a 1280x900 / 2, con captura a escala 2. Además se
// prueba texto al 200 %. No equivale a accionar el zoom nativo de un dispositivo.
const t = await vistaAislada()
const motor = process.env.NAVEGADOR || 'edge'
const out = process.env.TEST_OUTPUT_DIR || join(import.meta.dirname, '../entregables/correcciones-perfiles-2026-10-07/evidencia/accesibilidad-cliente')
const filtro = (process.env.AUDIT_CASE_FILTER || '').split(',').filter(Boolean)
const axeSource = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
mkdirSync(out, { recursive: true })
const results = [], capturas = [], csp = [], pageErrors = [], solicitudesFallidas = []
let browser
const guardar = () => writeFileSync(join(out, 'resultados.json'), JSON.stringify({ motor, version: browser?.version(),
  alcance: 'Cliente local, teclado y árbol accesible automatizados; no certifica lector de pantalla ni zoom nativo.',
  ampliacion: { base: '1280x900', equivalente200: '640x450 CSS, deviceScaleFactor 2', texto200: 'font-size raíz duplicado' },
  results, capturas, csp, pageErrors, solicitudesFallidas }, null, 2))

async function crear(id, opciones) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'es-NI', timezoneId: 'America/Managua', reducedMotion: 'reduce', ...opciones })
  await context.route('**/*', r => new URL(r.request().url()).origin === t.url ? r.continue() : r.abort())
  await context.exposeBinding('__registrarCspAuditoria', (_source, evento) => csp.push({ caso: id, ...evento }))
  await context.addInitScript(() => {
    window.addEventListener('securitypolicyviolation', e => {
      void window.__registrarCspAuditoria({ directiva: e.effectiveDirective, recurso: e.blockedURI,
        disposicion: e.disposition, archivo: e.sourceFile, linea: e.lineNumber, fase: window.__faseAuditoria || 'aplicacion' })
    })
  })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  page.on('pageerror', e => pageErrors.push({ caso: id, error: e.message }))
  page.on('requestfailed', r => solicitudesFallidas.push({ caso: id, url: r.url(), tipo: r.resourceType(), error: r.failure()?.errorText }))
  await page.goto(t.url + '/kit')
  // Solo una siembra; la recarga nunca vuelve a autenticar automáticamente.
  await page.evaluate(token => localStorage.setItem('club-lupita:sesion', token), t.token)
  return { context, page }
}
async function estable(page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(document.getAnimations().filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished.catch(() => {})))
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}
async function ir(page, ruta) {
  await page.goto(t.url + ruta)
  await page.locator('.casa-aplicacion').waitFor()
  await page.getByRole('main').waitFor()
  if (ruta === '/compras') await page.getByRole('button', { name: 'Actualizar', exact: true }).click({ trial: true })
  if (ruta === '/tienda') await page.getByRole('button', { name: 'Apartar la mía', exact: true }).waitFor()
  if (ruta === '/reservar') await page.locator('section[aria-labelledby="res-zona"] button').first().waitFor()
  await estable(page)
}
async function tabHasta(page, objetivo, limite = 100) {
  await objetivo.waitFor()
  for (let i = 0; i <= limite; i++) {
    if (await objetivo.evaluate(e => document.activeElement === e)) return i
    await page.keyboard.press('Tab')
  }
  assert.fail('El control no se alcanzó con Tab: ' + await objetivo.innerText())
}
async function focoDentro(page, dialogo) {
  const foco = await dialogo.evaluate(d => ({ dentro: d.contains(document.activeElement), navegador: !document.hasFocus(),
    elemento: document.activeElement?.outerHTML.slice(0, 250) }))
  assert.ok(foco.dentro || foco.navegador, 'El teclado salió al contenido de fondo: ' + foco.elemento)
  return foco
}
async function recorrerDialogo(page, dialogo) {
  await focoDentro(page, dialogo)
  const controles = await dialogo.locator('button:visible:not([disabled]), input:visible:not([disabled]), select:visible:not([disabled]), textarea:visible:not([disabled]), a[href]:visible').count()
  const pasos = []
  for (const tecla of ['Tab', 'Shift+Tab']) for (let i = 0; i < controles + 2; i++) {
    await page.keyboard.press(tecla)
    pasos.push({ tecla, ...await focoDentro(page, dialogo) })
  }
  return { controles, pasos }
}
async function inspeccionar(page, nombre, { axe = true } = {}) {
  await estable(page)
  const geometria = await page.evaluate(() => ({ ancho: innerWidth, documento: document.documentElement.scrollWidth,
    alto: innerHeight, escalaCaptura: devicePixelRatio, fuenteRaiz: getComputedStyle(document.documentElement).fontSize }))
  let violaciones = []
  if (axe) {
    await page.evaluate(() => { window.__faseAuditoria = 'instrumentacion-axe' })
    try {
      await page.evaluate(axeSource)
      violaciones = await page.evaluate(async () => (await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      })).violations.map(v => ({ id: v.id, impacto: v.impact, ayuda: v.help,
        nodos: v.nodes.map(n => ({ selector: n.target, resumen: n.failureSummary })) })))
    } finally { await page.evaluate(() => { window.__faseAuditoria = 'aplicacion' }) }
  }
  await page.screenshot({ path: join(out, nombre + '.png') })
  writeFileSync(join(out, nombre + '.aria.txt'), await page.locator('body').ariaSnapshot())
  writeFileSync(join(out, nombre + '.json'), JSON.stringify({ geometria, violaciones }, null, 2))
  capturas.push({ nombre, geometria, violaciones })
  guardar()
  assert.ok(geometria.documento <= geometria.ancho + 1, 'Desbordamiento horizontal: ' + JSON.stringify(geometria))
  assert.deepEqual(violaciones, [], 'Violaciones de axe en ' + nombre)
}
async function caso(id, trabajo, opciones) {
  if (filtro.length && !filtro.some(f => id.startsWith(f))) return
  let sesion
  try {
    sesion = await crear(id, opciones)
    const detalle = await trabajo(sesion.page)
    assert.deepEqual(csp.filter(e => e.caso === id), [], 'Se bloquearon recursos o ejecución por CSP')
    assert.deepEqual(pageErrors.filter(e => e.caso === id), [], 'Excepciones del navegador')
    results.push({ id, estado: 'APROBADO', detalle })
    console.log('PASA ' + id)
  } catch (e) {
    results.push({ id, estado: 'FALLO', error: e.message })
    console.log('FALLO ' + id + ': ' + e.message)
    if (sesion) await inspeccionar(sesion.page, id + '-fallo', { axe: false }).catch(() => {})
  } finally { await sesion?.context.close(); guardar() }
}

try {
  browser = await (motor === 'firefox' ? firefox.launch() : motor === 'webkit' ? webkit.launch() : chromium.launch({ channel: 'msedge' }))
  await caso('A01-navegacion-teclado-foco', async page => {
    await ir(page, '/')
    const perfil = page.getByRole('navigation', { name: 'Secciones de Club Lupita', exact: true }).getByRole('button', { name: 'Perfil', exact: true })
    const tabs = await tabHasta(page, perfil)
    await page.keyboard.press('Enter')
    await page.getByRole('heading', { name: 'Prueba Regresión', exact: true }).waitFor()
    assert.equal(await page.getByRole('main').evaluate(e => e === document.activeElement), true)
    await inspeccionar(page, 'A01-navegacion-teclado-foco')
    return { tabs, foco: 'main del Perfil tras navegación SPA por Enter' }
  })
  for (const [id, ruta, nombre, titulo] of [
    ['saldo', '/', 'Recargá', 'Recargá en el mostrador'],
    ['perfil', '/perfil', 'Editar mi perfil', 'Editar mi perfil'],
    ['compra', '/tienda', 'Apartar la mía', 'Una bolsa de la Reserva'],
  ]) await caso('A02-modal-' + id, async page => {
    await ir(page, ruta)
    const origen = page.getByRole('button', { name: nombre, exact: true })
    const tabs = await tabHasta(page, origen)
    await page.keyboard.press('Enter')
    const dialogo = page.getByRole('dialog', { name: titulo, exact: true })
    await dialogo.waitFor()
    const recorrido = await recorrerDialogo(page, dialogo)
    await inspeccionar(page, 'A02-modal-' + id)
    await page.keyboard.press('Escape')
    await dialogo.waitFor({ state: 'hidden' })
    assert.equal(await origen.evaluate(e => e === document.activeElement), true, 'Escape debe devolver el foco al botón de origen')
    return { tabs, ...recorrido, escape: 'cerró y devolvió foco al origen' }
  })
  await caso('A03-pedido-error-teclado', async page => {
    await ir(page, '/pedir')
    await tabHasta(page, page.getByRole('button', { name: 'Agregar Latte al pedido', exact: true }))
    await page.keyboard.press('Enter')
    const origen = page.getByRole('button', { name: /Ver tu pedido/ })
    await tabHasta(page, origen); await page.keyboard.press('Enter')
    const dialogo = page.getByRole('dialog', { name: 'Tu pedido', exact: true })
    await dialogo.waitFor()
    await page.route(t.url + '/api/cuenta/cobrar', r => r.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ error: 'No se pudo completar este pedido de prueba' }) }))
    await tabHasta(page, dialogo.getByRole('button', { name: 'Pagar con la Cuenta de Casa', exact: true }))
    await page.keyboard.press('Enter')
    await dialogo.getByRole('alert').filter({ hasText: 'No se pudo completar este pedido de prueba' }).waitFor()
    assert.ok((await dialogo.ariaSnapshot()).includes('No se pudo completar este pedido de prueba'))
    await recorrerDialogo(page, dialogo)
    await inspeccionar(page, 'A03-pedido-error-teclado')
    await page.keyboard.press('Escape'); await dialogo.waitFor({ state: 'hidden' })
    await origen.waitFor()
    assert.equal(await origen.evaluate(e => e === document.activeElement), true, 'Cerrar Tu pedido debe devolver el foco a Ver tu pedido')
    return { error: '422 accesible dentro del modal; todo el recorrido se realizó por teclado' }
  })
  await caso('A04-catalogo-reintento-teclado', async page => {
    let consultas = 0
    await page.route(t.url + '/api/catalogo', r => ++consultas === 1
      ? r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Catálogo temporalmente no disponible' }) }) : r.continue())
    await page.goto(t.url + '/tienda')
    const reintentar = page.getByRole('button', { name: 'Actualizar catálogo', exact: true })
    await reintentar.waitFor()
    await inspeccionar(page, 'A04-catalogo-error')
    const tabs = await tabHasta(page, reintentar); await page.keyboard.press('Enter')
    await page.getByRole('button', { name: 'Apartar la mía', exact: true }).waitFor()
    assert.equal(consultas, 2)
    await inspeccionar(page, 'A04-catalogo-recuperado')
    return { consultas, tabs }
  })
  for (const [nombre, ruta] of [['inicio', '/'], ['pedir', '/pedir'], ['tienda', '/tienda'], ['club', '/club'], ['perfil', '/perfil'], ['reservar', '/reservar'], ['compras', '/compras']]) {
    await caso('A05-reflujo200-' + nombre, async page => {
      await ir(page, ruta)
      await inspeccionar(page, 'A05-reflujo200-' + nombre)
      if (ruta !== '/reservar') {
        const perfil = page.getByRole('navigation', { name: 'Secciones de Club Lupita', exact: true }).getByRole('button', { name: 'Perfil', exact: true })
        await perfil.click({ trial: true })
      } else await page.locator('section[aria-labelledby="res-zona"] button').first().click({ trial: true })
      return { viewportCSS: '640x450', captura: '1280x900', equivalente: 'reflujo a 200 % sobre base de 1280x900' }
    }, { viewport: { width: 640, height: 450 }, deviceScaleFactor: 2 })
  }
  for (const [id, ruta, nombre, titulo] of [
    ['saldo', '/', 'Recargá', 'Recargá en el mostrador'],
    ['perfil', '/perfil', 'Editar mi perfil', 'Editar mi perfil'],
    ['compra', '/tienda', 'Apartar la mía', 'Una bolsa de la Reserva'],
  ]) await caso('A06-texto200-' + id, async page => {
    await ir(page, ruta)
    const antes = await page.evaluate(() => {
      const raiz = document.documentElement, antes = parseFloat(getComputedStyle(raiz).fontSize)
      raiz.style.fontSize = antes * 2 + 'px'
      return antes
    })
    await estable(page)
    const fuente = { antes, despues: await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize)) }
    assert.equal(fuente.despues, fuente.antes * 2)
    const origen = page.getByRole('button', { name: nombre, exact: true })
    await origen.click()
    const dialogo = page.getByRole('dialog', { name: titulo, exact: true })
    await dialogo.waitFor()
    await inspeccionar(page, 'A06-texto200-' + id)
    for (const control of await dialogo.getByRole('button').all()) if (await control.isVisible() && await control.isEnabled()) await control.click({ trial: true })
    await page.keyboard.press('Escape'); await dialogo.waitFor({ state: 'hidden' })
    return { fuente, controles: 'botones visibles alcanzables mediante desplazamiento; Escape cierra' }
  }, { viewport: { width: 640, height: 900 } })
} finally { guardar(); await browser?.close(); await t.close() }
process.exitCode = results.some(r => r.estado === 'FALLO') || csp.length || pageErrors.length ? 1 : 0
