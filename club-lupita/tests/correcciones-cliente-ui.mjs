import assert from 'node:assert/strict'
import { chromium, firefox, webkit } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { vistaAislada } from './soporte-cliente-perfiles.mjs'

// Solo Cliente: no crea empleados ni depende del contrato de invitaciones de Personal.
// Las suites heredadas de Personal deben adaptar sus fixtures al acceso final vigente.
// Bundle/servidor independientes; CSP activa y Worker actual, con SQL local.
const t = await vistaAislada()
const motor = process.env.NAVEGADOR || 'edge'
const browser = await (motor === 'firefox' ? firefox.launch() : motor === 'webkit' ? webkit.launch() : chromium.launch({ channel: 'msedge' }))
const out = process.env.TEST_OUTPUT_DIR || join(import.meta.dirname, '../entregables/correcciones-perfiles-2026-10-07/evidencia/cliente-ui')
mkdirSync(out, { recursive: true })
const filtro = (process.env.AUDIT_CASE_FILTER || '').split(',').filter(Boolean)
const results = [], pageErrors = [], red = []
const guardar = () => writeFileSync(join(out, 'resultados.json'), JSON.stringify({ motor, version: browser.version(), results, pageErrors, red }, null, 2))
async function crear(id) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'es-NI', timezoneId: 'America/Managua', reducedMotion: 'reduce' })
  const estado = { fase: 'preparacion' }
  context.on('page', pagina => {
    const pendientes = new Map()
    pagina.setDefaultTimeout(10000)
    pagina.on('request', peticion => {
      if (new URL(peticion.url()).pathname.startsWith('/api/')) {
        const registro = { caso: id, url: peticion.url(), metodo: peticion.method(), inicio: Date.now(), faseInicio: estado.fase }
        pendientes.set(peticion, registro); red.push(registro)
      }
    })
    pagina.on('response', respuesta => { const registro = pendientes.get(respuesta.request()); if (registro) registro.status = respuesta.status() })
    pagina.on('requestfinished', peticion => { const registro = pendientes.get(peticion); if (registro) { registro.fin = Date.now(); registro.faseFin = estado.fase; pendientes.delete(peticion) } })
    pagina.on('requestfailed', peticion => { const registro = pendientes.get(peticion); if (registro) { registro.fin = Date.now(); registro.faseFin = estado.fase; registro.error = peticion.failure()?.errorText; pendientes.delete(peticion) } })
    pagina.on('pageerror', e => pageErrors.push({ caso: id, fase: estado.fase, momento: Date.now(), pagina: pagina.url(), error: e.message, stack: e.stack,
      peticionesPendientes: [...pendientes.values()].map(r => ({ url: r.url, status: r.status, faseInicio: r.faseInicio })) }))
  })
  await context.route('**/*', r => new URL(r.request().url()).origin === t.url ? r.continue() : r.abort())
  const page = await context.newPage()
  // Sembrar una sola vez: no volver a insertar el token tras un 401 o una recarga.
  await page.goto(t.url + '/kit')
  await page.evaluate(token => localStorage.setItem('club-lupita:sesion', token), t.token)
  return { context, page, estado }
}
async function render(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}
async function captura(page, id) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(document.getAnimations().filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime)).map(a => a.finished.catch(() => {})))
  })
  await page.screenshot({ path: join(out, id + '.png') })
  writeFileSync(join(out, id + '.aria.txt'), await page.locator('body').ariaSnapshot())
}
async function caso(id, trabajo) {
  if (filtro.length && !filtro.some(f => id.startsWith(f))) return
  let sesion
  try { sesion = await crear(id); sesion.estado.fase = 'recorrido'; await trabajo(sesion.page, sesion.context); results.push({ id, estado: 'APROBADO' }); console.log('PASA ' + id) }
  catch (e) { results.push({ id, estado: 'FALLO', error: e.message }); console.log('FALLO ' + id + ': ' + e.message); if (sesion) await captura(sesion.page, id + '-fallo').catch(() => {}) }
  finally { if (sesion) { sesion.estado.fase = 'cierre-contexto'; await sesion.context.close(); sesion.estado.fase = 'contexto-cerrado' } guardar() }
}
async function pedido(page) {
  await page.goto(t.url + '/pedir')
  await page.getByRole('button', { name: 'Agregar Latte al pedido', exact: true }).click()
  await page.getByRole('button', { name: /Ver tu pedido/ }).click()
  return page.getByRole('dialog', { name: 'Tu pedido', exact: true })
}
async function saldo(page) {
  await page.goto(t.url + '/')
  await page.getByRole('button', { name: 'Recargá', exact: true }).click()
  return page.getByRole('dialog', { name: 'Recargá en el mostrador', exact: true })
}
try {
  await caso('C01-cuenta-centavos', async page => {
    await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES($1,49,'bono','Bono sintético de centavos','centavos-ui')", [t.id])
    await page.goto(t.url + '/')
    const esperado = (await t.request('/api/yo')).body.saldo.total
    assert.equal(esperado % 100, 49)
    await page.locator('.casa-cuenta-saldo').filter({ hasText: /\.49$/ }).waitFor()
    await captura(page, 'C01-cuenta-centavos')
  })
  for (const status of [409, 422, 500]) await caso('C02-error-' + status, async page => {
    const dialogo = await pedido(page), mensaje = 'Error controlado de cobro ' + status
    await page.route(t.url + '/api/cuenta/cobrar', r => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ error: mensaje }) }))
    await dialogo.getByRole('button', { name: 'Pagar con la Cuenta de Casa', exact: true }).click()
    await dialogo.getByRole('alert').filter({ hasText: mensaje }).waitFor()
    assert.ok((await dialogo.ariaSnapshot()).includes(mensaje))
    await captura(page, 'C02-error-' + status)
  })
  await caso('C03-respuesta-perdida-idempotencia', async page => {
    const inicial = (await t.db.query('SELECT count(*)::int n FROM pedido')).rows[0].n
    const referencias = []; let perdida = false
    await page.route(t.url + '/api/cuenta/cobrar', async r => {
      referencias.push(r.request().postDataJSON().ref)
      if (!perdida) { perdida = true; await r.fetch(); await r.abort('failed') }
      else await r.continue()
    })
    let dialogo = await pedido(page)
    await dialogo.getByRole('button', { name: 'Pagar con la Cuenta de Casa', exact: true }).click()
    await dialogo.getByRole('alert').filter({ hasText: /no pudimos confirmar/i }).waitFor()
    assert.equal(await dialogo.getByRole('button', { name: 'Agregar otro Latte', exact: true }).isDisabled(), true)
    assert.equal(await dialogo.getByRole('button', { name: 'Vaciar el pedido', exact: true }).isDisabled(), true)
    await page.reload()
    dialogo = page.getByRole('dialog', { name: 'Tu pedido', exact: true })
    await dialogo.waitFor()
    await dialogo.getByRole('button', { name: 'Pagar con la Cuenta de Casa', exact: true }).click()
    await page.getByRole('heading', { name: 'Mis compras y reservas', exact: true }).waitFor()
    assert.equal(referencias.length, 2); assert.equal(referencias[0], referencias[1])
    assert.equal((await t.db.query('SELECT count(*)::int n FROM pedido')).rows[0].n, inicial + 1)
    assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa=$1", ['pedido:' + referencias[0]])).rows[0].n, 1)
    await captura(page, 'C03-respuesta-perdida-idempotencia')
  })
  await caso('C04-saldo-fallo-reintento', async page => {
    const dialogo = await saldo(page)
    let llamadas = 0
    await page.route(t.url + '/api/yo', async r => {
      llamadas++
      if (llamadas === 1) await r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Lectura no disponible' }) })
      else await r.continue()
    })
    await dialogo.getByRole('button', { name: 'Actualizar mi saldo', exact: true }).click()
    await dialogo.getByRole('alert').filter({ hasText: 'No pudimos actualizar tu cuenta' }).waitFor()
    await dialogo.getByText(/Última consulta de tu cuenta:/).waitFor()
    await dialogo.getByRole('button', { name: 'Reintentar actualización de cuenta', exact: true }).click()
    await dialogo.getByRole('alert').waitFor({ state: 'hidden' })
    assert.equal(llamadas, 2)
    await captura(page, 'C04-saldo-fallo-reintento')
  })
  await caso('C05-catalogo-independiente', async page => {
    let consultas = 0
    await page.route(t.url + '/api/catalogo', async r => {
      consultas++
      if (consultas === 1) await r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Catálogo no disponible' }) })
      else await r.continue()
    })
    await page.goto(t.url + '/tienda')
    await page.getByRole('button', { name: 'Actualizar catálogo', exact: true }).waitFor()
    assert.equal(await page.getByLabel('Correo electrónico', { exact: true }).count(), 0)
    await page.getByRole('button', { name: 'Actualizar catálogo', exact: true }).click()
    await page.getByRole('button', { name: 'Apartar la mía', exact: true }).waitFor()
    assert.equal(consultas, 2)
    await page.getByRole('button', { name: 'Reservar una mesa', exact: true }).click()
    await page.locator('section[aria-labelledby="res-zona"] button').first().waitFor()
    await captura(page, 'C05-catalogo-independiente')
  })
  for (const endpoint of ['compras', 'perfil', 'cobro']) await caso('C06-401-' + endpoint, async page => {
    const ruta = endpoint === 'compras' ? '/api/compras?pagina=0' : endpoint === 'perfil' ? '/api/perfil' : '/api/cuenta/cobrar'
    await page.route(t.url + ruta, r => r.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Sesión terminada' }) }))
    if (endpoint === 'compras') await page.goto(t.url + '/compras')
    else if (endpoint === 'perfil') {
      await page.goto(t.url + '/perfil'); await page.getByRole('button', { name: 'Editar mi perfil', exact: true }).click()
      await page.getByRole('dialog').getByRole('button', { name: 'Guardar cambios', exact: true }).click()
    } else {
      const d = await pedido(page); await d.getByRole('button', { name: 'Pagar con la Cuenta de Casa', exact: true }).click()
    }
    await page.getByLabel('Correo electrónico', { exact: true }).waitFor()
    assert.equal(await page.evaluate(() => localStorage.getItem('club-lupita:sesion')), null)
    assert.equal(await page.getByRole('heading', { name: 'Prueba Regresión', exact: true }).count(), 0)
    await page.reload(); await page.getByLabel('Correo electrónico', { exact: true }).waitFor()
    await captura(page, 'C06-401-' + endpoint)
  })
  await caso('C07-cierre-otras-pestanas', async (page, context) => {
    await page.goto(t.url + '/perfil'); await page.getByRole('heading', { name: 'Prueba Regresión', exact: true }).waitFor()
    const otra = await context.newPage(); await otra.goto(t.url + '/perfil')
    await otra.getByRole('heading', { name: 'Prueba Regresión', exact: true }).waitFor()
    await page.route(t.url + '/api/compras?pagina=0', r => r.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Sesión terminada' }) }))
    await page.getByRole('button', { name: 'Mis compras y reservas', exact: true }).click()
    await page.getByLabel('Correo electrónico', { exact: true }).waitFor()
    await otra.getByLabel('Correo electrónico', { exact: true }).waitFor()
    assert.equal(await otra.getByRole('heading', { name: 'Prueba Regresión', exact: true }).count(), 0)
    await captura(otra, 'C07-cierre-otras-pestanas')
  })
  await caso('C08-respuesta-antigua', async page => {
    const anterior = (await t.request('/api/yo')).body
    const dialogo = await saldo(page)
    let retenida, indicar
    const retenidaLista = new Promise(resolve => { indicar = resolve })
    let consultas = 0
    await page.route(t.url + '/api/yo', async r => { consultas++; if (consultas === 1) { retenida = r; indicar() } else await r.continue() })
    await dialogo.getByRole('button', { name: 'Actualizar mi saldo', exact: true }).click(); await retenidaLista
    await page.evaluate(token => { localStorage.setItem('club-lupita:sesion', token); window.dispatchEvent(new Event('club-lupita:salida')) }, t.otroToken)
    await page.getByRole('navigation', { name: 'Secciones de Club Lupita', exact: true }).getByRole('button', { name: 'Perfil', exact: true }).click()
    await page.getByRole('heading', { name: 'Otro Socio', exact: true }).waitFor()
    await retenida.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(anterior) })
    await render(page)
    assert.equal(await page.getByRole('heading', { name: 'Otro Socio', exact: true }).isVisible(), true)
    assert.equal(await page.getByRole('heading', { name: 'Prueba Regresión', exact: true }).count(), 0)
    await captura(page, 'C08-respuesta-antigua')
  })
} finally { guardar(); await browser.close(); await t.close() }
process.exitCode = results.some(r => r.estado === 'FALLO') || pageErrors.length ? 1 : 0
