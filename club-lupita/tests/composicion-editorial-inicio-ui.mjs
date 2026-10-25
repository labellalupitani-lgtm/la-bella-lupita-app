// Sexta composición: fotografía a todo el ancho y productos completos en la primera vista.
// Complementa redisenio-inicio-ui (axe, texto 200%, pase y funciones) y estabilidad-inicio-ui.
// La geometría no determina reconocimiento del alimento, buen encuadre ni aprobación visual.
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const versiones = [
  ['antes', process.env.BASELINE_URL || 'http://127.0.0.1:5196', 'quinta'],
  ['despues', process.env.PREVIEW_URL || 'http://127.0.0.1:5190', 'sexta'],
].map(([version, url, composicion]) => {
  const destino = new URL(url)
  assert.ok(['127.0.0.1', 'localhost'].includes(destino.hostname), 'Solo se admite localhost')
  assert.equal(destino.protocol, 'http:')
  assert.ok(!destino.username && !destino.password && !destino.search && !destino.hash && destino.pathname === '/', 'Indicar solo el origen local')
  return { version, url: destino.origin, composicion }
})
assert.notEqual(versiones[0].url, versiones[1].url, 'La comparación requiere dos vistas distintas')
const dir = process.env.EVIDENCIA_COMPOSICION_DIR || 'entregables/inicio-ajuste-2026-10-21/evidencia/composicion'
mkdirSync(dir, { recursive: true })
const viewports = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 1000]]
const vacio = { pedido: null, reserva: null, avisos: 0, ahora: '2026-10-21T18:00:00.000Z' }
const prioridad = /^(Seguir mi pedido|Ver mi reserva|Actualizar seguimiento)$/
const medidas = [], comprobaciones = [], autenticacion = [], estados = [], recorridos = [], erroresPagina = [], externas = []
const comprobar = (condicion, nombre) => comprobaciones.push({ nombre, ok: Boolean(condicion) })
let browser, fallo

async function estable(page) {
  await page.getByRole('heading', { name: 'Tu cuenta de casa', exact: true }).waitFor()
  await page.waitForFunction(() => document.querySelector('.inicio-actualizar')?.getAttribute('aria-busy') !== 'true' &&
    !document.querySelector('.inicio-seguimiento [role="status"]')?.textContent.trim())
  await page.evaluate(async () => {
    await document.fonts.ready
    for (const img of document.images) img.loading = 'eager'
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})))
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}

async function medir(page) {
  return page.evaluate(() => {
    const rect = el => {
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
    }
    const visible = el => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
    const interseccion = (a, b, x = true, y = true) => {
      const left = x ? Math.max(a.x, b.x) : a.x, top = y ? Math.max(a.y, b.y) : a.y
      const right = x ? Math.min(a.right, b.right) : a.right, bottom = y ? Math.min(a.bottom, b.bottom) : a.bottom
      return { x: left, y: top, right, bottom, width: Math.max(0, right - left), height: Math.max(0, bottom - top) }
    }
    const expuesto = el => {
      let r = rect(el)
      for (let padre = el.parentElement; padre; padre = padre.parentElement) {
        const css = getComputedStyle(padre), x = /hidden|clip|scroll|auto/.test(css.overflowX), y = /hidden|clip|scroll|auto/.test(css.overflowY)
        if (x || y) r = interseccion(r, rect(padre), x, y)
      }
      return r
    }
    const main = document.querySelector('main.inicio-redisenado'), hero = main?.querySelector('.inicio-invitacion')
    const foto = hero?.querySelector('.inicio-invitacion-foto'), aviso = document.querySelector('#preview-notice')
    if (!main || !hero || !foto || !aviso) throw Error('Falta portada, foto o aviso de aislamiento')
    const nav = document.querySelector('.casa-nav-movil')
    const limite = nav && visible(nav) ? Math.min(innerHeight, rect(nav).y) : innerHeight
    const area = { x: 0, y: Math.max(0, rect(aviso).bottom), right: innerWidth, bottom: limite }
    const completa = el => {
      const r = rect(el), e = interseccion(expuesto(el), area)
      return visible(el) && r.width > 0 && r.height > 0 && e.width >= r.width - 1 && e.height >= r.height - 1
    }
    const textoIntegro = el => {
      const r = rect(el), range = document.createRange(); range.selectNodeContents(el)
      const cajas = [...range.getClientRects()].filter(c => c.width && c.height)
      return el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1 && cajas.every(c => c.left >= r.x - 1 && c.right <= r.right + 1 && c.top >= r.y - 1 && c.bottom <= r.bottom + 1)
    }
    const seguimiento = main.querySelector('.inicio-seguimiento')
    const accionesPrioritarias = [...(seguimiento?.querySelectorAll('button') || [])].filter(el => visible(el) && /^(Seguir mi pedido|Ver mi reserva|Actualizar seguimiento)$/.test(el.textContent.trim()))
    const productos = [...main.querySelectorAll('.casa-antojo')].map(el => {
      const img = el.querySelector('.casa-antojo-foto img'), nombre = el.querySelector('.casa-antojo-nombre'), precio = el.querySelector('.casa-antojo-precio')
      if (!img || !nombre || !precio) throw Error('Producto sin foto, nombre o precio')
      return { id: el.dataset.plato, tarjeta: rect(el), foto: rect(img), nombre: nombre.textContent.trim(), precio: precio.textContent.trim(), src: img.currentSrc,
        cargada: img.complete && img.naturalWidth > 0, textoIntegro: textoIntegro(nombre) && textoIntegro(precio),
        completa: completa(el) && completa(img) && completa(nombre) && completa(precio) }
    })
    const pases = [...document.querySelectorAll('button.inicio-pase-rapido')].filter(visible).map(el => {
      const r = rect(el), centro = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      return { ...r, completa: completa(el), centroLibre: Boolean(centro && el.contains(centro)) }
    })
    // El díptico desktop cubre el ancho como conjunto; no exige deformar una sola imagen.
    const franja = expuesto(foto)
    const fotos = [...foto.querySelectorAll('img')].filter(visible).map(img => {
      const r = interseccion(expuesto(img), franja), css = getComputedStyle(img)
      const proporcion = rect(img).width / rect(img).height, natural = img.naturalWidth / img.naturalHeight
      return { ...r, src: img.currentSrc, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
        objeto: css.objectFit, sinBandas: css.objectFit === 'cover' || Math.abs(proporcion / natural - 1) <= .02 }
    }).sort((a, b) => a.x - b.x)
    let borde = franja.x
    const sinHuecos = fotos.length > 0 && fotos.every(img => {
      const cubre = img.sinBandas && img.naturalWidth > 0 && img.width > 0 && img.x <= borde + 1 && img.y <= franja.y + 1 && img.bottom >= franja.bottom - 1
      borde = Math.max(borde, img.right); return cubre
    }) && borde >= franja.right - 1
    return { viewport: { width: innerWidth, height: innerHeight }, aviso: rect(aviso), main: rect(main), hero: rect(hero),
      foto: { ...rect(foto), expuesta: franja, fuentes: fotos, sinHuecos },
      navInicio: limite, productos, productosCompletos: productos.filter(p => p.completa && p.textoIntegro && p.cargada).length, pases,
      prioridad: accionesPrioritarias.map(el => ({ texto: el.textContent.trim(), ...rect(el), antesFoto: Boolean(seguimiento.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING) })),
      overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > document.documentElement.clientWidth,
      fallidas: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')) }
  })
}

async function comprobarRecorrido(page, url, width) {
  await page.setViewportSize({ width, height: 844 }); await page.goto(url); await estable(page)
  const tarjetas = page.locator('.casa-antojo')
  await tarjetas.first().focus()
  // Secuencia real de teclado; verifica también el regreso por la lista horizontal.
  for (const [indice, tecla] of [[0, null], [1, 'Tab'], [2, 'Tab'], [1, 'Shift+Tab']]) {
    if (tecla) await page.keyboard.press(tecla)
    await page.waitForFunction(indice => {
      const el = document.querySelectorAll('.casa-antojo')[indice], lista = el?.parentElement
      if (!el || !lista || document.activeElement !== el) return false
      const r = el.getBoundingClientRect(), l = lista.getBoundingClientRect()
      const nav = document.querySelector('.casa-nav-movil'), limite = nav?.checkVisibility() ? nav.getBoundingClientRect().top : innerHeight
      return r.left >= l.left + 3 && r.right <= l.right - 3 && r.top >= 0 && r.bottom <= limite + 1
    }, indice)
  }
  const antes = await tarjetas.nth(1).evaluate(el => ({ id: el.dataset.plato, nombre: el.querySelector('.casa-antojo-nombre').textContent.trim(),
    foto: el.querySelector('img').currentSrc, scrollY, scrollLista: el.parentElement.scrollLeft }))
  await page.keyboard.press('Enter'); await page.waitForURL(url + '/pedir?plato=' + antes.id)
  const dialogo = page.getByRole('dialog'); await dialogo.getByRole('heading', { name: antes.nombre, exact: true }).waitFor()
  const fotoFicha = await dialogo.locator('img').first().getAttribute('src')
  const identidadFoto = src => new URL(src, url).pathname.replace(/-(240|480|960)\./, '.')
  assert.equal(identidadFoto(fotoFicha), identidadFoto(antes.foto), 'La ficha conserva la fotografía del producto elegido')
  await page.screenshot({ path: `${dir}/despues-${width}-ficha-producto.png` })
  const retorno = width === 320 ? 'historial del navegador' : 'cerrar ficha y navegación Inicio'
  if (width === 320) await page.goBack()
  else {
    await dialogo.getByRole('button', { name: 'Cerrar panel', exact: true }).click()
    await dialogo.waitFor({ state: 'hidden' })
    await page.locator('.casa-nav-movil').getByRole('link', { name: 'Inicio', exact: true }).click()
  }
  await page.waitForURL(url + '/')
  await estable(page)
  await page.waitForFunction(id => document.activeElement?.getAttribute('data-plato') === id, antes.id)
  const despues = await tarjetas.nth(1).evaluate(el => ({ id: el.dataset.plato, scrollY, scrollLista: el.parentElement.scrollLeft, enfocado: document.activeElement === el }))
  assert.ok(Math.abs(antes.scrollY - despues.scrollY) <= 2, `Retorno ${width}: conserva desplazamiento vertical`)
  assert.ok(Math.abs(antes.scrollLista - despues.scrollLista) <= 2, `Retorno ${width}: conserva desplazamiento de productos`)
  await page.screenshot({ path: `${dir}/despues-${width}-retorno-producto.png` })
  recorridos.push({ width, retorno, ok: true, antes, despues, fotoFicha })
}

async function comprobarRetornoPrioritario(page, url) {
  for (const [estado, datos, accion] of [
    ['pedido', { ...vacio, pedido: { numero: 987654, estado: 'preparando' } }, 'Seguir mi pedido'],
    ['reserva', { ...vacio, reserva: { zona: 'Zona de prueba', cuando: '2027-01-30T18:30:00.000Z', personas: 2 } }, 'Ver mi reserva'],
  ]) {
    let respuesta = vacio
    await page.route('**/api/inicio/contexto', async route => {
      if (respuesta !== vacio) await new Promise(resolve => setTimeout(resolve, 100))
      await route.fulfill({ json: respuesta })
    })
    try {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(url); await estable(page)
      await page.evaluate(() => window.scrollTo(0, 450))
      await page.locator('.casa-antojo').first().click()
      await page.getByRole('dialog').waitFor()
      respuesta = datos
      await page.goBack(); await page.waitForURL(url + '/'); await estable(page)
      // No desplazar ni enfocar desde el arnés: debe corregirlo la app después del historial.
      const boton = page.locator('.inicio-seguimiento').getByRole('button', { name: accion, exact: true })
      await boton.waitFor()
      const retorno = await boton.evaluate(el => {
        const r = el.getBoundingClientRect(), nav = document.querySelector('.casa-nav-movil').getBoundingClientRect()
        const centro = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
        return { scrollY, y: r.y, bottom: r.bottom, navTop: nav.top, visible: r.y >= 0 && r.bottom <= nav.top,
          centroLibre: Boolean(centro && el.contains(centro)), focoEnProducto: document.activeElement?.matches('.casa-antojo') }
      })
      comprobar(retorno.visible && retorno.centroLibre, `Retorno con ${estado} nuevo: acción prioritaria completa y operable`)
      comprobar(!retorno.focoEnProducto, `Retorno con ${estado} nuevo: no restaura foco de producto obsoleto`)
      recorridos.push({ width: 390, retorno: 'historial con ' + estado + ' nuevo', ok: retorno.visible && retorno.centroLibre && !retorno.focoEnProducto, ...retorno })
      await page.screenshot({ path: `${dir}/despues-390-retorno-${estado}-nuevo.png` })
    } finally { await page.unroute('**/api/inicio/contexto') }
  }
}

try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  for (const { version, url, composicion } of versiones) {
    const context = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'block' })
    try {
      const respuesta = await context.request.get(url + '/__preview/status', { maxRedirects: 0 })
      assert.equal(respuesta.status(), 200, `${version}: vista previa local`)
      const status = await respuesta.json()
      assert.equal(status.preview, true); assert.equal(status.outbound, 'bloqueado')
      assert.equal(status.frontend, 'compilación', `${version}: ejecutar sobre compilación, no sobre Vite`)
      await context.route('**/*', async route => {
        const destino = new URL(route.request().url())
        if (['http:', 'https:'].includes(destino.protocol) && destino.origin !== url) {
          externas.push({ version, url: destino.href, bloqueada: true }); await route.abort('blockedbyclient')
        } else await route.continue()
      })
      const page = await context.newPage(); page.setDefaultTimeout(15000)
      page.on('pageerror', error => erroresPagina.push({ version, error: error.message }))
      page.on('websocket', socket => {
        const destino = new URL(socket.url())
        if (!['127.0.0.1', 'localhost'].includes(destino.hostname)) externas.push({ version, url: destino.href, tipo: 'websocket' })
      })
      for (const [width, height] of viewports) {
        await page.setViewportSize({ width, height }); await page.goto(url + '/__preview/entrar'); await estable(page)
        await page.getByRole('complementary', { name: 'Entorno de prueba' }).waitFor()
        // Usar el mismo origen, cookies y cabecera explícita de cliente que el transporte de la app.
        const [yo, respuestaContexto] = await page.evaluate(async () => Promise.all(['/api/yo', '/api/inicio/contexto'].map(async ruta => {
          const r = await fetch(ruta, { credentials: 'same-origin', headers: { 'x-cliente-solicitud': '1' } }); return { status: r.status, json: await r.json() }
        })))
        assert.equal(yo.status, 200, `${version}: la vista normal es una cuenta autenticada`)
        assert.ok(yo.json.socio?.id, 'La cuenta sintética está identificada')
        assert.equal(respuestaContexto.status, 200, `${version}: contexto real de la fixture disponible`)
        const contextoReal = respuestaContexto.json
        assert.ok(!contextoReal.pedido && !contextoReal.reserva, 'La comparación normal necesita una fixture sin pedido ni reserva')
        autenticacion.push({ version, width, cuentaAutenticada: true, contextoReal })
        await page.evaluate(() => window.scrollTo(0, 0))
        const medida = await medir(page); medidas.push({ version, composicion, width, height, ...medida })
        await page.screenshot({ path: `${dir}/${version}-${width}x${height}-viewport.png` })
        if ([390, 1440].includes(width)) await page.screenshot({ path: `${dir}/${version}-${width}x${height}-completa.png`, fullPage: true })
        comprobar(!medida.overflow, `${version} ${width}: sin desbordamiento horizontal`)
        comprobar(!medida.fallidas.length, `${version} ${width}: imágenes cargadas`)
        comprobar(medida.aviso.y === 0 && medida.aviso.bottom < height, `${version} ${width}: aviso local incluido`)
        comprobar(medida.prioridad.length === 0, `${version} ${width}: cuenta autenticada y contexto vacío son estado normal`)
        if (version !== 'despues') continue
        comprobar(medida.productos.length === 3 && medida.productos.every(p => p.cargada && p.textoIntegro && p.nombre && /C\$\s*\d/.test(p.precio)), `${width}: tres productos con foto, nombre y precio íntegros`)
        comprobar(medida.foto.expuesta.x <= medida.main.x + 1 && medida.foto.expuesta.right >= medida.main.right - 1, `${width}: foto llega a ambos bordes del área de Inicio`)
        comprobar(medida.foto.sinHuecos, `${width}: imágenes pintadas cubren la franja fotográfica sin huecos`)
        comprobar(await page.getByRole('button', { name: 'Mostrá tu pase', exact: true }).count() === 1, `${width}: nombre accesible inequívoco del pase`)
        comprobar(medida.pases.length === 1 && medida.pases.every(p => p.width >= 44 && p.height >= 44), `${width}: un acceso al pase de al menos 44 × 44 px`)
        if (width < 900) comprobar(medida.pases.every(p => p.completa && p.centroLibre), `${width}: pase completo y operable sin desplazamiento`)
        if (width === 390) comprobar(medida.productosCompletos >= 1, '390 × 844: al menos un producto entero antes de la navegación inferior, con aviso local')
        if (width === 1440) comprobar(medida.productosCompletos === 3, '1440 × 1000: los tres productos completos en la primera vista')
      }
      if (version !== 'despues') continue
      const variantes = [
        ['avisos', { ...vacio, avisos: 3 }, 'Ver mis avisos', false],
        ['pedido', { ...vacio, pedido: { numero: 987654, estado: 'preparando' } }, 'Seguir mi pedido', true],
        ['reserva', { ...vacio, reserva: { zona: 'Zona de prueba', cuando: '2027-01-30T18:30:00.000Z', personas: 2 } }, 'Ver mi reserva', true],
        ['error', { error: 'Conexión local de prueba' }, 'Actualizar seguimiento', true],
      ]
      for (const [estado, json, accion, esPrioridad] of variantes) {
        await page.route('**/api/inicio/contexto', route => route.fulfill({ status: estado === 'error' ? 503 : 200, json }))
        await page.setViewportSize({ width: 390, height: 844 }); await page.goto(url); await estable(page)
        const boton = page.locator('.inicio-seguimiento').getByRole('button', { name: accion, exact: true }); await boton.waitFor()
        await page.evaluate(() => window.scrollTo(0, 0)); const medida = await medir(page)
        comprobar(!medida.overflow, `${estado}: sin desbordamiento`)
        comprobar((medida.prioridad.length > 0) === esPrioridad, `${estado}: prioridad definida por acción real`)
        if (esPrioridad) comprobar(medida.prioridad.length === 1 && medida.prioridad[0].antesFoto && medida.prioridad[0].y >= medida.aviso.bottom && medida.prioridad[0].bottom <= medida.navInicio, `${estado}: acción de seguimiento visible antes de la fotografía`)
        else comprobar(medida.productosCompletos >= 1, 'Avisos sin pedido ni reserva conservan la composición normal')
        comprobar(await boton.isEnabled(), `${estado}: acción habilitada`)
        estados.push({ estado, esPrioridad, medida }); await page.screenshot({ path: `${dir}/despues-390-${estado}.png`, fullPage: true })
        if (esPrioridad && prioridad.test(accion) && estado !== 'error') { await boton.click(); await page.waitForURL(url + '/compras') }
        if (estado === 'error') {
          await page.unroute('**/api/inicio/contexto'); await page.route('**/api/inicio/contexto', route => route.fulfill({ json: vacio }))
          await boton.click(); await page.locator('.inicio-seguimiento').getByRole('button', { name: prioridad }).waitFor({ state: 'hidden' })
          comprobar(await page.locator('.inicio-seguimiento').getByText('Sin pedidos en curso, reservas próximas ni avisos pendientes.', { exact: true }).isVisible(), 'Recuperación del seguimiento hacia estado normal')
        }
        await page.unroute('**/api/inicio/contexto')
      }
      for (const width of [320, 390]) await comprobarRecorrido(page, url, width)
      await comprobarRetornoPrioritario(page, url)
    } catch (error) {
      const page = context.pages()[0]
      if (page && !page.isClosed()) await page.screenshot({ path: `${dir}/${version}-fallo.png`, fullPage: true }).catch(() => {})
      throw error
    } finally { await context.close() }
  }
  comprobar(!erroresPagina.length, 'Sin errores de JavaScript')
  comprobar(!externas.length, 'Sin solicitudes fuera del origen local')
  assert.deepEqual(comprobaciones.filter(c => !c.ok), [], 'Criterios medibles de la sexta composición')
} catch (error) { fallo = error.message; console.error(error); process.exitCode = 1 }
finally {
  const comparacion = viewports.map(([width]) => ({ width, ...Object.fromEntries(versiones.map(({ version }) => {
    const m = medidas.find(m => m.version === version && m.width === width)
    return [version, m ? { productosCompletos: m.productosCompletos, fotoY: m.foto.y, fotoAlto: m.foto.height, primerProducto: m.productos[0]?.tarjeta, navInicio: m.navInicio } : null]
  })) }))
  const informe = { ok: !fallo, fallo, versiones, comprobaciones, comparacion, autenticacion, medidas, estados, recorridos, erroresPagina, externas,
    alcance: 'Cuenta autenticada normal y estados prioritarios. El banner local participa en todas las medidas. Prioridad requiere un botón real de pedido, reserva o reintento de seguimiento; la autenticación, el título y el texto vacío no la activan.',
    revisionVisual: 'Pendiente de revisión humana: reconocimiento y encuadre del alimento, detalle de marca y reserva H/4, jerarquía y acabado. El PASS geométrico no implica aprobación visual.' }
  writeFileSync(`${dir}/composicion-editorial.json`, JSON.stringify(informe, null, 2))
  console.log(JSON.stringify({ ok: informe.ok, comprobaciones: comprobaciones.length, fallidas: comprobaciones.filter(c => !c.ok), evidencia: dir }))
  await browser?.close()
}
