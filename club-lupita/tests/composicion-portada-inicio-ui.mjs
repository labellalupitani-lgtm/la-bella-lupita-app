// Compara la tercera composición con la cuarta: fotografía, titular breve y cabecera compacta.
// Solo mide geometría y texto. Reconocimiento del producto, encuadre y jerarquía requieren revisión visual.
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const versiones = [
  ['antes', process.env.BASELINE_URL || 'http://127.0.0.1:5194', 'tercera'],
  ['despues', process.env.PREVIEW_URL || 'http://127.0.0.1:5190', 'cuarta'],
].map(([version, url, composicion]) => {
  const destino = new URL(url)
  assert.ok(['127.0.0.1', 'localhost'].includes(destino.hostname), 'La prueba solo admite localhost')
  assert.equal(destino.protocol, 'http:', 'Usar el servidor local de vista previa')
  assert.ok(!destino.username && !destino.password && !destino.search && !destino.hash && destino.pathname === '/', 'Indicar solo el origen local')
  return { version, url: destino.origin, composicion }
})
assert.notEqual(versiones[0].url, versiones[1].url, 'La comparación necesita dos vistas previas distintas')

const dir = 'entregables/inicio-portada-2026-10-21/evidencia'
mkdirSync(dir, { recursive: true })
const medidas = [], comparacion = [], comprobaciones = [], omitidas = [], erroresPagina = [], externas = []
const comprobar = (condicion, nombre) => comprobaciones.push({ nombre, ok: Boolean(condicion) })
let browser, fallo

try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  for (const { version, url, composicion } of versiones) {
    const context = await browser.newContext({ reducedMotion: 'reduce', serviceWorkers: 'block' })
    try {
      const statusResponse = await context.request.get(url + '/__preview/status', { maxRedirects: 0 })
      assert.equal(statusResponse.status(), 200, `${version}: falta la vista previa local`)
      const status = await statusResponse.json()
      assert.equal(status.preview, true, `${version}: falta la vista previa local`)
      assert.equal(status.outbound, 'bloqueado', `${version}: API aislada`)
      await context.route('**/*', async route => {
        const destino = new URL(route.request().url())
        if (['http:', 'https:'].includes(destino.protocol) && destino.origin !== url) {
          externas.push({ version, url: destino.href, bloqueada: true })
          await route.abort('blockedbyclient')
        } else await route.continue()
      })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)
      page.on('pageerror', error => erroresPagina.push({ version, error: error.message }))
      page.on('websocket', socket => {
        const destino = new URL(socket.url())
        if (!['127.0.0.1', 'localhost'].includes(destino.hostname)) externas.push({ version, url: destino.href, tipo: 'websocket' })
      })
      for (const [width, height] of [[320, 568], [390, 844], [1440, 1000]]) {
        await page.setViewportSize({ width, height })
        await page.goto(url + '/__preview/entrar')
        await page.getByRole('heading', { name: 'Tu cuenta de casa', exact: true }).waitFor()
        await page.getByRole('complementary', { name: 'Entorno de prueba' }).waitFor()
        await page.waitForFunction(() =>
          document.querySelector('.inicio-actualizar')?.getAttribute('aria-busy') !== 'true' &&
          !document.querySelector('.inicio-encabezado [role="status"]')?.textContent.trim() &&
          !document.querySelector('.inicio-seguimiento [role="status"]')?.textContent.trim())
        await page.evaluate(async () => {
          await document.fonts.ready
          for (const img of document.images) img.loading = 'eager'
          await Promise.all([...document.images].map(img => img.decode().catch(() => {})))
          window.scrollTo(0, 0)
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        })
        const pases = await page.getByRole('button', { name: 'Mostrá tu pase', exact: true }).evaluateAll(elements => elements.filter(el => el.checkVisibility()).map(el => {
          const r = el.getBoundingClientRect()
          const centro = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
          return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom, centroLibre: Boolean(centro && el.contains(centro)) }
        }))
        const medida = await page.evaluate(() => {
          const inicio = document.querySelector('main.inicio-redisenado')
          const hero = inicio?.querySelector('.inicio-invitacion')
          const foto = hero?.querySelector('img')
          const fotoContenedor = hero?.querySelector('.inicio-invitacion-foto') || hero
          const cuenta = inicio?.querySelector('.casa-cuenta')
          const sellos = inicio?.querySelector('.casa-fidelidad')
          const destacados = inicio?.querySelector('.casa-antojos')
          const cabecera = document.querySelector('.casa-cabecera')
          const marca = cabecera?.querySelector('.casa-marca img')
          const utilidades = inicio?.querySelector('.inicio-encabezado')
          const aviso = document.querySelector('#preview-notice')
          if (!inicio || !hero || !foto || !fotoContenedor || !cuenta || !sellos || !destacados || !cabecera || !marca || !utilidades || !aviso) throw Error('Falta una pieza de Inicio o el aviso local')
          const rect = el => {
            const r = el.getBoundingClientRect()
            return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom, area: r.width * r.height }
          }
          const interseccion = (a, b, recortarX = true, recortarY = true) => {
            const x = recortarX ? Math.max(a.x, b.x) : a.x, y = recortarY ? Math.max(a.y, b.y) : a.y
            const right = recortarX ? Math.min(a.right, b.right) : a.right, bottom = recortarY ? Math.min(a.bottom, b.bottom) : a.bottom
            const width = Math.max(0, right - x), height = Math.max(0, bottom - y)
            return { x, y, width, height, right: x + width, bottom: y + height, area: width * height }
          }
          const precede = (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
          const visible = el => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
          const textoVisible = (root, omitir = '') => {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), partes = []
            while (walker.nextNode()) {
              const node = walker.currentNode, padre = node.parentElement
              if (!padre || !visible(padre) || padre.closest('svg, .ico, [aria-hidden="true"], .sr-only, script, style')) continue
              if (omitir && padre.closest(omitir)) continue
              if (node.textContent.trim()) partes.push(node.textContent.trim())
            }
            return partes.join(' ').replace(/\s+/g, ' ').trim()
          }
          const accionesCarta = [...inicio.querySelectorAll('button, a, [role="button"]')].filter(el => {
            if (!visible(el) || el.closest('nav, [role="navigation"]') || el.hasAttribute('data-plato')) return false
            const href = el.getAttribute('href')
            return /\bcarta\b/i.test(textoVisible(el)) || (href && new URL(href, location.href).pathname === '/pedir')
          })
          const carta = accionesCarta.find(el => hero.contains(el))
          if (!carta) throw Error('La portada no tiene una acción explícita hacia Carta')
          const heroRect = rect(hero), fotoRect = rect(foto), contenedorRect = rect(fotoContenedor), avisoRect = rect(aviso)
          // El área útil nunca cuenta el rectángulo que queda fuera de la foto o del hero.
          let fotoUtil = interseccion(interseccion(fotoRect, contenedorRect), heroRect)
          const recortes = []
          for (let padre = foto.parentElement; padre && padre !== hero; padre = padre.parentElement) {
            const estilo = getComputedStyle(padre), recortaX = /hidden|clip|scroll|auto/.test(estilo.overflowX), recortaY = /hidden|clip|scroll|auto/.test(estilo.overflowY)
            if (recortaX || recortaY) {
              const r = rect(padre)
              fotoUtil = interseccion(fotoUtil, r, recortaX, recortaY)
              recortes.push({ clase: padre.className, rect: r, overflowX: estilo.overflowX, overflowY: estilo.overflowY })
            }
          }
          const nav = document.querySelector('.casa-nav-movil')
          const navInicio = nav && visible(nav) ? Math.min(innerHeight, nav.getBoundingClientRect().top) : innerHeight
          const viewportUtil = { x: 0, y: Math.max(0, avisoRect.bottom), right: innerWidth, bottom: navInicio }
          const fotoEnViewport = interseccion(fotoUtil, viewportUtil)
          const marcaRect = rect(marca), marcaEstilo = getComputedStyle(marca)
          const ratioNatural = marca.naturalWidth / marca.naturalHeight, ratioCaja = marcaRect.width / marcaRect.height
          const logoSinDeformar = ['contain', 'scale-down'].includes(marcaEstilo.objectFit) || Math.abs(ratioCaja / ratioNatural - 1) <= .02
          const h1s = [...inicio.querySelectorAll('h1')].filter(visible)
          const titular = h1s.find(el => hero.contains(el))
          const textoTitular = titular ? textoVisible(titular) : ''
          const saludo = document.querySelector('.casa-saludo')
          const saludoAntesHero = saludo && visible(saludo) && precede(saludo, hero)
          const seguimiento = inicio.querySelector('.inicio-seguimiento')
          const alertas = [...inicio.querySelectorAll('[role="alert"]')].filter(visible).map(el => textoVisible(el)).filter(Boolean)
          const seguimientoPrioritario = Boolean(seguimiento && visible(seguimiento) && precede(seguimiento, hero))
          const estado = alertas.length || seguimientoPrioritario ? 'prioritario' : 'normal'
          return {
            estado, alertas, seguimientoPrioritario,
            cabecera: rect(cabecera), saludo: saludoAntesHero ? rect(saludo) : null, utilidades: rect(utilidades),
            aperturaAntesFoto: Math.max(0, fotoUtil.y - avisoRect.bottom),
            hero: heroRect,
            foto: { ...fotoRect, src: foto.currentSrc, naturalWidth: foto.naturalWidth, naturalHeight: foto.naturalHeight, objeto: getComputedStyle(foto).objectFit, posicion: getComputedStyle(foto).objectPosition },
            fotoContenedor: contenedorRect, fotoUtil, fotoEnViewport, recortes,
            proporcionFotoHero: heroRect.area ? fotoUtil.area / heroRect.area : 0,
            carta: { ...rect(carta), texto: textoVisible(carta) },
            accionesCarta: accionesCarta.map(el => ({ texto: textoVisible(el), href: el.getAttribute('href'), clase: el.className, enHero: hero.contains(el) })),
            texto: { h1Visibles: h1s.length, titular: textoTitular, caracteresTitular: textoTitular.length, palabrasTitular: textoTitular.split(/\s+/).filter(Boolean).length,
              adicionalHero: textoVisible(hero, 'h1, button, a, [role="button"]') },
            logo: { ...marcaRect, src: marca.currentSrc, naturalWidth: marca.naturalWidth, naturalHeight: marca.naturalHeight, ratioNatural, ratioCaja, objeto: marcaEstilo.objectFit, sinDeformar: logoSinDeformar },
            cuenta: rect(cuenta), sellos: rect(sellos), destacados: { ...rect(destacados), productos: destacados.querySelectorAll('[data-plato]').length },
            ordenDOM: { fotoAntesCuenta: precede(foto, cuenta), fotoAntesSellos: precede(foto, sellos), cartaAntesCuenta: precede(carta, cuenta), cartaAntesSellos: precede(carta, sellos), destacadosAntesCuenta: precede(destacados, cuenta), destacadosAntesSellos: precede(destacados, sellos), heroAntesDestacados: precede(hero, destacados) },
            navInicio, aviso: avisoRect,
            pagina: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth > innerWidth,
            fallidas: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')),
          }
        })
        medidas.push({ version, composicion, width, height, ...medida, pases })
        await page.screenshot({ path: `${dir}/${version}-${width}-viewport.png` })
        if (width !== 320) await page.screenshot({ path: `${dir}/${version}-${width}-completa.png`, fullPage: true })
        comprobar(!medida.overflow, `${version} ${width}: sin desbordamiento horizontal`)
        comprobar(!medida.fallidas.length, `${version} ${width}: imágenes cargadas`)
        comprobar(medida.aviso.y >= 0 && medida.aviso.bottom <= height, `${version} ${width}: aviso local visible`)
        if (version !== 'despues') continue
        comprobar(Object.values(medida.ordenDOM).every(Boolean), `${width}: foto, Carta y destacados preceden a cuenta y sellos en el DOM`)
        comprobar(medida.destacados.productos === 3, `${width}: tres productos destacados`)
        comprobar(medida.accionesCarta.length === 1 && medida.accionesCarta[0].enHero, `${width}: una acción promocional a Carta en Inicio, excluyendo la navegación global`)
        comprobar(medida.texto.h1Visibles === 1 && medida.texto.palabrasTitular > 0 && medida.texto.palabrasTitular <= 10 && medida.texto.caracteresTitular <= 60, `${width}: un h1 breve de hasta 10 palabras y 60 caracteres`)
        comprobar(!medida.texto.adicionalHero, `${width}: portada sin antetítulo ni párrafo promocional, según su texto visible`)
        comprobar(medida.logo.naturalWidth > 0 && medida.logo.sinDeformar, `${width}: logo cargado y sin deformación`)
        comprobar(pases.length === 1, `${width}: un solo acceso visible «Mostrá tu pase»`)
        if (medida.estado !== 'normal') {
          omitidas.push({ version, width, motivo: 'Pedido, reserva o error prioritario: no se aplican umbrales de la portada normal' })
          continue
        }
        comprobar(!medida.saludo, `${width}: saludo y nivel no ocupan una cabecera anterior a la portada`)
        if (width < 600) {
          const pase = pases[0]
          comprobar(pase && pase.y >= medida.aviso.bottom && pase.bottom <= medida.navInicio && pase.x >= 0 && pase.right <= width && pase.centroLibre, `${width}: pase completo y accesible antes de la navegación, sin desplazarse`)
          comprobar(pase && pase.width >= 44 && pase.height >= 44, `${width}: pase con área táctil de al menos 44 × 44 px`)
          comprobar(medida.carta.width >= 44 && medida.carta.height >= 44, `${width}: Carta con área táctil de al menos 44 × 44 px`)
        }
        if (width === 320) comprobar(medida.fotoUtil.y <= 210, '320: la fotografía útil comienza a más tardar en y=210')
        if (width === 390) {
          comprobar(medida.fotoUtil.y <= 200, '390: la fotografía útil comienza a más tardar en y=200')
          comprobar(medida.fotoUtil.height >= 300, '390: la fotografía útil mide al menos 300 px de alto')
          comprobar(medida.proporcionFotoHero >= .70, '390: la foto contenida ocupa al menos el 70% de la superficie del hero')
        }
        if (width === 1440) {
          comprobar(medida.fotoUtil.y < 260, '1440: la fotografía útil comienza antes de y=260')
          comprobar(medida.proporcionFotoHero >= .65, '1440: la foto contenida ocupa al menos el 65% de la superficie del hero')
        }
      }
    } finally { await context.close() }
  }
  for (const width of [320, 390, 1440]) {
    const antes = medidas.find(m => m.version === 'antes' && m.width === width)
    const despues = medidas.find(m => m.version === 'despues' && m.width === width)
    if (antes.estado !== 'normal' || despues.estado !== 'normal') continue
    const cambio = (a, d) => ({ antes: a, despues: d, diferencia: d - a, variacionPorcentaje: a ? (d / a - 1) * 100 : null })
    comparacion.push({ width,
      cabeceraAlto: cambio(antes.cabecera.height, despues.cabecera.height),
      saludoAlto: cambio(antes.saludo?.height || 0, despues.saludo?.height || 0),
      utilidadesAlto: cambio(antes.utilidades.height, despues.utilidades.height),
      aperturaAntesFoto: cambio(antes.aperturaAntesFoto, despues.aperturaAntesFoto),
      fotoY: cambio(antes.fotoUtil.y, despues.fotoUtil.y), fotoAlto: cambio(antes.fotoUtil.height, despues.fotoUtil.height),
      fotoArea: cambio(antes.fotoUtil.area, despues.fotoUtil.area), fotoProporcionHero: cambio(antes.proporcionFotoHero, despues.proporcionFotoHero),
      logoAncho: cambio(antes.logo.width, despues.logo.width),
    })
    comprobar(despues.fotoUtil.y < antes.fotoUtil.y, `${width}: la fotografía comienza antes que en la tercera composición`)
  }
  comprobar(!erroresPagina.length, 'Sin errores de JavaScript')
  comprobar(!externas.length, 'Solicitudes exclusivamente locales')
  assert.deepEqual(comprobaciones.filter(c => !c.ok), [], 'Contrato geométrico de la cuarta composición')
} catch (error) {
  fallo = error.message
  console.error(error)
  process.exitCode = 1
} finally {
  const informe = {
    ok: !fallo, fallo, versiones, comprobaciones, omitidas, comparacion, medidas, erroresPagina, externas,
    alcance: 'Portada en estado normal. Los estados prioritarios conservan sus acciones y se revisan por separado; no se les aplican los límites de apertura normal.',
    revisionVisual: 'Pendiente de revisión visual: producto reconocible, encuadre, detalle central libre, logo completo y reserva H/4, contraste y jerarquía. fotoUtil es la intersección de rectángulos de imagen, contenedor y hero; no mide el área del producto ni su reconocimiento.',
  }
  writeFileSync(`${dir}/composicion-portada.json`, JSON.stringify(informe, null, 2))
  console.log(JSON.stringify({ ok: informe.ok, comprobaciones: comprobaciones.length, fallidas: comprobaciones.filter(c => !c.ok), omitidas, evidencia: dir }))
  await browser?.close()
}
