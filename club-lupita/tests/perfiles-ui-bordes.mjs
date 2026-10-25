import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
import { vistaAislada } from './soporte-ui.mjs'

// Auditoría de recuperación, importes y sesión en un worker y una base sintéticos.
// Ejecutar secuencialmente respecto a otras suites que usen soporte.mjs.
// Lee dist existente: compilar la aplicación antes de ejecutar esta suite.
const out = process.env.TEST_OUTPUT_DIR || join(import.meta.dirname, '../entregables/auditoria-perfiles-2026-10-07/evidencia/bordes-ui')
// AUDIT_CASE_FILTER admite IDs/prefijos separados por coma, por ejemplo UI-02,UI-05.
const filtro = (process.env.AUDIT_CASE_FILTER || '').split(',').map(s => s.trim()).filter(Boolean)
mkdirSync(out, { recursive: true })
const results = [], screenshots = [], pageErrors = []
let t, browser

function guardar() {
  writeFileSync(join(out, 'resultados.json'), JSON.stringify({
    descripcion: 'Pruebas locales de bordes de los perfiles, con datos sintéticos y respuestas HTTP controladas',
    motor: 'Microsoft Edge', version: browser?.version(),
    filtro,
    aprobados: results.filter(r => r.estado === 'APROBADO').length,
    fallos: results.filter(r => r.estado === 'FALLO').length,
    results, screenshots, pageErrors,
  }, null, 2))
}

async function nuevaPagina(id, personal = false) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, locale: 'es-NI',
    timezoneId: 'America/Managua', reducedMotion: 'reduce',
  })
  // Única salida permitida: el servidor de esta suite en loopback.
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    return url.hostname === '127.0.0.1' && url.origin === t.url ? route.continue() : route.abort()
  })
  await context.addInitScript(({ token, personal }) => {
    if (personal) sessionStorage.setItem('club-lupita:personal', token)
    else localStorage.setItem('club-lupita:sesion', token)
  }, { token: personal ? t.staff : t.token, personal })
  const page = await context.newPage()
  page.setDefaultTimeout(10000)
  page.on('pageerror', error => pageErrors.push({ id, error: error.message }))
  return { context, page }
}

async function actualizarRender(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

async function esperarAnimacionesFinitas(page) {
  await actualizarRender(page)
  await page.evaluate(async () => {
    const finitas = document.getAnimations().filter(a => Number.isFinite(a.effect?.getComputedTiming().endTime))
    await Promise.all(finitas.map(a => a.finished.catch(() => {})))
  })
}

async function evidencia(page, id, detalles) {
  await page.evaluate(() => document.fonts.ready)
  await esperarAnimacionesFinitas(page)
  const archivo = id + '.png'
  await page.screenshot({ path: join(out, archivo), fullPage: false })
  screenshots.push({ id, archivo })
  const accesibilidad = await page.locator('body').ariaSnapshot()
  writeFileSync(join(out, id + '.aria.txt'), accesibilidad)
  writeFileSync(join(out, id + '.json'), JSON.stringify(detalles, null, 2))
}

async function caso(id, nombre, personal, trabajo) {
  if (filtro.length && !filtro.some(f => id === f || id.startsWith(f))) return
  const inicio = Date.now()
  let contexto
  try {
    contexto = await nuevaPagina(id, personal)
    await trabajo(contexto.page)
    results.push({ id, nombre, estado: 'APROBADO', ms: Date.now() - inicio })
    console.log('PASA ' + id + ': ' + nombre)
  } catch (error) {
    results.push({ id, nombre, estado: 'FALLO', error: error.message, ms: Date.now() - inicio })
    console.log('FALLO ' + id + ': ' + error.message.slice(0, 300))
    // Si el flujo se interrumpió antes de producir evidencia, conservar su estado.
    if (contexto && !screenshots.some(s => s.id === id)) {
      try { await evidencia(contexto.page, id, { interrumpido: true, error: error.message }) }
      catch (falloCaptura) { results.at(-1).errorEvidencia = falloCaptura.message }
    }
  } finally {
    await contexto?.context.close()
    guardar()
  }
}

try {
  t = await vistaAislada()
  browser = await chromium.launch({ channel: 'msedge', headless: true })

  await caso('UI-01-centavos', 'Confirmación de recarga conserva el importe con centavos', true, async page => {
    await page.goto(t.url + '/personal?seccion=caja')
    await page.getByRole('heading', { name: 'Caja', level: 1, exact: true }).waitFor()
    await page.getByLabel('Teléfono del cliente').fill(t.tel)
    await page.getByRole('button', { name: 'Buscar cliente', exact: true }).click()
    await page.getByLabel('Referencia del ticket de caja').fill('auditoria-centavos-001')
    await page.getByLabel('Recarga en córdobas').fill('200.49')
    await page.getByRole('button', { name: 'Revisar recarga', exact: true }).click()
    const dialogo = page.getByRole('dialog', { name: 'Confirmar recarga', exact: true })
    await dialogo.waitFor()
    const importeVisible = await dialogo.locator('p').filter({ hasText: 'Importe recibido:' }).innerText()
    const importeIntroducido = await page.getByLabel('Recarga en córdobas').inputValue()
    await evidencia(page, 'UI-01-centavos', { importeIntroducido, importeVisible, esperadoCentavos: 20049, operacionEnviada: false })
    assert.match(importeVisible, /C\$\s*200[.,]49\b/, 'Se introdujeron C$ 200.49, pero la confirmación no conserva sus centavos: ' + importeVisible)
  })

  await caso('UI-02-error-cobro', 'El rechazo del cobro aparece dentro del diálogo activo', false, async page => {
    const mensaje = 'No pudimos registrar este pedido. Reintentá desde esta confirmación.'
    let interceptados = 0
    await page.route(t.url + '/api/cuenta/cobrar', async route => {
      assert.equal(route.request().method(), 'POST')
      interceptados++
      await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ error: mensaje }) })
    })
    await page.goto(t.url + '/pedir')
    await page.getByRole('button', { name: 'Agregar Latte al pedido', exact: true }).click()
    await page.getByRole('button', { name: /Ver tu pedido/ }).click()
    const dialogo = page.getByRole('dialog', { name: 'Tu pedido', exact: true })
    await dialogo.waitFor()
    const respuesta = page.waitForResponse(r => r.url() === t.url + '/api/cuenta/cobrar')
    await dialogo.getByRole('button', { name: 'Pagar con la Cuenta de Casa', exact: true }).click()
    await (await respuesta).finished()
    await actualizarRender(page)
    await page.waitForFunction(texto => document.body.textContent.includes(texto), mensaje)
    const dentro = await dialogo.getByText(mensaje, { exact: true }).count()
    const arbolDialogo = await dialogo.ariaSnapshot()
    const diagnostico = await page.evaluate(texto => {
      const d = document.querySelector('dialog[open]')
      return {
        modalAbierto: !!d && d.matches(':modal'),
        textoDentroDelDialogo: d?.textContent.includes(texto) ?? false,
        regionesVivasDentro: d?.querySelectorAll('[role="alert"],[role="status"],[aria-live]').length ?? 0,
        mensajeExisteEnDocumento: document.body.textContent.includes(texto),
      }
    }, mensaje)
    await evidencia(page, 'UI-02-error-cobro', { ...diagnostico, interceptados, arbolDialogo, escrituraEnWorker: false })
    assert.equal(interceptados, 1)
    assert.ok(dentro > 0 && arbolDialogo.includes(mensaje), 'El cobro fue rechazado, pero su error está fuera del diálogo modal y de su árbol accesible')
  })

  await caso('UI-03-saldo-antiguo', 'Actualizar saldo informa el fallo sin presentar el anterior como actualizado', false, async page => {
    await page.goto(t.url + '/')
    await page.getByRole('button', { name: 'Recargá', exact: true }).click()
    const dialogo = page.getByRole('dialog', { name: 'Recargá en el mostrador', exact: true })
    await dialogo.waitFor()
    const antes = await dialogo.innerText()
    const mensaje = 'No pudimos actualizar tu saldo. Conservamos la consulta anterior.'
    let fallosForzados = 0
    await page.route(t.url + '/api/yo', async route => {
      fallosForzados++
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: mensaje }) })
    })
    const respuesta = page.waitForResponse(r => r.url() === t.url + '/api/yo')
    await dialogo.getByRole('button', { name: 'Actualizar mi saldo', exact: true }).click()
    await (await respuesta).finished()
    // refrescar espera también cupos y catálogo; esperar el fin de toda consulta local.
    await page.waitForLoadState('networkidle')
    await actualizarRender(page)
    const despues = await dialogo.innerText()
    const arbol = await dialogo.ariaSnapshot()
    const avisos = await dialogo.locator('[role="alert"],[role="status"],[aria-live]').allTextContents()
    await evidencia(page, 'UI-03-saldo-antiguo', { antes, despues, fallosForzados, avisos, arbolDialogo: arbol })
    assert.ok(fallosForzados > 0, 'La consulta de actualización no se interceptó')
    assert.match(arbol, /No pudimos|sin actualizar|desactualizado|consulta anterior|falló|fallo|error|señal|conexión/i,
      'La actualización recibió 500, pero el diálogo sigue presentando el saldo anterior sin error ni indicación de antigüedad')
  })

  await caso('UI-04-catalogo', 'Tienda y Reservar recuperan un fallo transitorio del catálogo mediante la interfaz', false, async page => {
    let consultasCatalogo = 0
    const solicitudes = [], respuestas = [], fases = []
    let documentos = 0
    page.on('request', request => {
      const url = new URL(request.url())
      if (request.resourceType() === 'document') documentos++
      if (url.origin === t.url && url.pathname.startsWith('/api/')) solicitudes.push({ ruta: url.pathname, metodo: request.method() })
    })
    page.on('response', response => {
      const url = new URL(response.url())
      if (url.origin === t.url && url.pathname.startsWith('/api/')) respuestas.push({ ruta: url.pathname, estado: response.status() })
    })
    await page.route(t.url + '/api/catalogo', async route => {
      consultasCatalogo++
      if (consultasCatalogo === 1) {
        await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'El catálogo no está disponible temporalmente. Volvé a intentar.' }) })
      } else await route.continue()
    })
    const patronReintento = /^(?:Reintentar(?: .*)?|Probar de nuevo|Volver a intentar|Volver a cargar|Cargar de nuevo|Actualizar(?: (?:catálogo|tienda|productos|zonas|datos))?|Consultar (?:el catálogo|las zonas)(?: otra vez)?)$/i
    async function registrar(fase) {
      await page.waitForLoadState('networkidle')
      await actualizarRender(page)
      const reintentos = page.getByRole('button', { name: patronReintento })
      const disponibles = []
      for (const boton of await reintentos.all()) if (await boton.isVisible()) disponibles.push(await boton.innerText())
      const detalle = { fase, ruta: new URL(page.url()).pathname, consultasCatalogo,
        consultasYo: solicitudes.filter(r => r.ruta === '/api/yo').length,
        consultasCupos: solicitudes.filter(r => r.ruta === '/api/cupos').length,
        reintentosVisibles: disponibles,
        compraDisponible: await page.getByRole('button', { name: 'Apartar la mía', exact: true }).isVisible(),
        zonasDisponibles: await page.locator('section[aria-labelledby="res-zona"] button').count(),
        documentos }
      fases.push(detalle)
      return detalle
    }
    async function intentarRecuperacion() {
      for (const boton of await page.getByRole('button', { name: patronReintento }).all()) {
        if (await boton.isVisible() && await boton.isEnabled()) { await boton.click(); return true }
      }
      return false
    }
    await page.goto(t.url + '/tienda')
    await page.getByRole('heading', { name: 'Tienda de la finca', exact: true }).waitFor()
    await registrar('Tienda, primera carga; falla únicamente la primera respuesta del catálogo')
    const navegacion = page.getByRole('navigation', { name: 'Secciones de Club Lupita', exact: true })
    await navegacion.getByRole('button', { name: 'Perfil', exact: true }).click()
    await page.getByRole('button', { name: 'Mis compras y reservas', exact: true }).waitFor()
    await navegacion.getByRole('button', { name: 'Tienda', exact: true }).click()
    await page.getByRole('heading', { name: 'Tienda de la finca', exact: true }).waitFor()
    await registrar('Vuelta SPA a Tienda; todas las respuestas posteriores del catálogo ya están restablecidas')
    const reintentoTiendaPulsado = await intentarRecuperacion()
    const tienda = await registrar('Tienda, después de pulsar reintento visible si existe')
    await evidencia(page, 'UI-04-catalogo-tienda', { fases, solicitudes, respuestas, reintentoTiendaPulsado })
    await page.getByRole('button', { name: 'Reservar una mesa', exact: true }).click()
    await page.getByRole('heading', { name: 'Apartá tu mesa', exact: true }).waitFor()
    await registrar('Navegación SPA a Reservar')
    const reintentoReservaPulsado = await intentarRecuperacion()
    const reserva = await registrar('Reservar, después de pulsar reintento visible si existe')
    await evidencia(page, 'UI-04-catalogo', { fases, solicitudes, respuestas, consultasCatalogo,
      documentos, reintentoTiendaPulsado, reintentoReservaPulsado,
      tiendaRecuperada: tienda.compraDisponible, reservaRecuperada: reserva.zonasDisponibles > 0,
      criterio: 'Una única respuesta 503 inicial; el resto vuelve al worker sintético. Se usa navegación SPA y solo acciones de reintento visibles en la pantalla afectada.' })
    assert.equal(documentos, 1, 'El recorrido debía preservar el proveedor de datos mediante navegación SPA, sin recarga completa')
    assert.ok(consultasCatalogo >= 2 && tienda.compraDisponible && reserva.zonasDisponibles > 0,
      `El catálogo no se recuperó: ${consultasCatalogo} consultas; compra visible=${tienda.compraDisponible}; zonas=${reserva.zonasDisponibles}; reintento Tienda=${reintentoTiendaPulsado}; reintento Reservar=${reintentoReservaPulsado}`)
  })

  await caso('UI-05-sesion-401', 'Un 401 en compras invalida la sesión del Cliente', false, async page => {
    await page.goto(t.url + '/perfil')
    await page.getByRole('button', { name: 'Mis compras y reservas', exact: true }).waitFor()
    const mensaje = 'Tu sesión terminó. Ingresá de nuevo para continuar.'
    let rechazos = 0
    await page.route(t.url + '/api/compras?pagina=0', async route => {
      rechazos++
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: mensaje }) })
    })
    const respuesta = page.waitForResponse(r => new URL(r.url()).pathname === '/api/compras')
    await page.getByRole('button', { name: 'Mis compras y reservas', exact: true }).click()
    await (await respuesta).finished()
    await page.waitForLoadState('networkidle')
    await actualizarRender(page)
    const tokenConservado = await page.evaluate(() => !!localStorage.getItem('club-lupita:sesion'))
    const accesoCorreoVisible = await page.getByLabel('Correo electrónico', { exact: true }).isVisible()
    const errorMostrado = await page.getByRole('alert').allTextContents()
    const navegacion = page.getByRole('navigation', { name: 'Secciones de Club Lupita', exact: true })
    if (await navegacion.isVisible()) {
      await navegacion.getByRole('button', { name: 'Perfil', exact: true }).click()
      await actualizarRender(page)
    }
    const perfilCacheadoVisible = await page.getByRole('heading', { name: 'Prueba Regresión', exact: true }).isVisible()
    await evidencia(page, 'UI-05-sesion-401', { rechazos, tokenConservado, accesoCorreoVisible, errorMostrado, perfilCacheadoVisible })
    assert.ok(rechazos > 0, 'La consulta a compras no se interceptó')
    assert.equal(tokenConservado, false, 'El Cliente conserva su token y puede regresar al perfil cacheado después de recibir 401')
    assert.equal(accesoCorreoVisible, true, 'El Cliente no volvió al acceso tras recibir 401')
  })

  await caso('OBS-nav-contraste', 'Contraste estable de etiquetas, separado de numerales decorativos', true, async page => {
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto(t.url + '/personal?seccion=pedidos')
    await page.getByRole('heading', { name: 'Pedidos', exact: true, level: 1 }).waitFor()
    const nav = page.getByRole('navigation', { name: 'Secciones del equipo', exact: true })
    await page.addScriptTag({ content: readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8') })
    const estados = []
    async function medir(estado) {
      const datos = await page.evaluate(async () => {
        const nav = document.querySelector('nav[aria-label="Secciones del equipo"]')
        const a = await window.axe.run(nav, { runOnly: { type: 'rule', values: ['color-contrast'] } })
        const violaciones = a.violations.flatMap(v => v.nodes.map(n => {
          const elemento = typeof n.target[0] === 'string' ? document.querySelector(n.target[0]) : null
          return { id: v.id, target: n.target, html: n.html, resumen: n.failureSummary,
            datos: n.any.map(c => c.data), numeralDecorativo: !!elemento?.matches('.equipo-nav-numero[aria-hidden="true"]') }
        }))
        const enlaces = Array.from(nav.querySelectorAll('a')).map(a => {
          const numero = a.querySelector('.equipo-nav-numero'), etiqueta = a.querySelector('span:not(.equipo-nav-numero)')
          const estilo = e => e ? { color: getComputedStyle(e).color, fondo: getComputedStyle(e).backgroundColor,
            opacidad: getComputedStyle(e).opacity, transicion: getComputedStyle(e).transitionDuration } : null
          return { nombre: etiqueta?.textContent, actual: a.getAttribute('aria-current'), hover: a.matches(':hover'),
            enlace: estilo(a), numero: estilo(numero), etiqueta: estilo(etiqueta) }
        })
        return { violaciones, enlaces }
      })
      estados.push({ estado, ...datos })
    }
    await esperarAnimacionesFinitas(page)
    await medir('Pedidos activo, estabilizado')
    await nav.getByRole('link', { name: 'Caja', exact: true }).click()
    await page.getByRole('heading', { name: 'Caja', exact: true, level: 1 }).waitFor()
    await esperarAnimacionesFinitas(page)
    await medir('Cambio Pedidos a Caja, estabilizado')
    await nav.getByRole('link', { name: 'Pedidos', exact: true }).hover()
    await esperarAnimacionesFinitas(page)
    await medir('Hover sobre Pedidos inactivo, estabilizado')
    await evidencia(page, 'OBS-nav-contraste', { estados,
      criterio: 'Los numerales aria-hidden se documentan como observación decorativa. Solo las violaciones de etiquetas/enlaces informativos fallan esta comprobación.' })
    const etiquetas = estados.flatMap(e => e.violaciones.filter(v => !v.numeralDecorativo))
    assert.deepEqual(etiquetas, [], 'Contraste insuficiente en etiquetas informativas del menú tras estabilizar animaciones')
  })
} catch (error) {
  results.push({ id: 'INFRAESTRUCTURA', estado: 'FALLO', error: error.message })
  console.error('FALLO INFRAESTRUCTURA: ' + error.message)
} finally {
  guardar()
  await browser?.close()
  await t?.close()
}

process.exitCode = results.some(r => r.estado === 'FALLO') || pageErrors.length ? 1 : 0
