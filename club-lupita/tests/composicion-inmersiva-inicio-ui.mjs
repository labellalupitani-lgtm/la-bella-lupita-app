// Compara la cuarta composición con la quinta: fotografía de borde a borde detrás de toda la portada.
// Geometría y texto no prueban reconocimiento, encuadre ni contraste sobre la fotografía: requieren crítica visual.
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const versiones = [
  ['antes', process.env.BASELINE_URL || 'http://127.0.0.1:5195', 'cuarta'],
  ['despues', process.env.PREVIEW_URL || 'http://127.0.0.1:5190', 'quinta'],
].map(([version, url, composicion]) => {
  const destino = new URL(url)
  assert.ok(['127.0.0.1', 'localhost'].includes(destino.hostname), 'La prueba solo admite localhost')
  assert.equal(destino.protocol, 'http:', 'Usar el servidor local de vista previa')
  assert.ok(!destino.username && !destino.password && !destino.search && !destino.hash && destino.pathname === '/', 'Indicar solo el origen local')
  return { version, url: destino.origin, composicion }
})
assert.notEqual(versiones[0].url, versiones[1].url, 'La comparación necesita dos vistas previas distintas')

const dir = 'entregables/inicio-inmersivo-2026-10-21/evidencia'
const tamanos = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 1000]]
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
      for (const [width, height] of tamanos) {
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
          const fotoEstilo = getComputedStyle(foto)
          const px = propiedad => Number.parseFloat(fotoEstilo[propiedad]) || 0
          const contenidoFoto = {
            x: fotoRect.x + px('borderLeftWidth') + px('paddingLeft'),
            y: fotoRect.y + px('borderTopWidth') + px('paddingTop'),
            width: Math.max(0, fotoRect.width - px('borderLeftWidth') - px('borderRightWidth') - px('paddingLeft') - px('paddingRight')),
            height: Math.max(0, fotoRect.height - px('borderTopWidth') - px('borderBottomWidth') - px('paddingTop') - px('paddingBottom')),
          }
          contenidoFoto.right = contenidoFoto.x + contenidoFoto.width
          contenidoFoto.bottom = contenidoFoto.y + contenidoFoto.height
          const escalaContener = Math.min(contenidoFoto.width / foto.naturalWidth, contenidoFoto.height / foto.naturalHeight)
          const escalaCubrir = Math.max(contenidoFoto.width / foto.naturalWidth, contenidoFoto.height / foto.naturalHeight)
          const escala = fotoEstilo.objectFit === 'cover' ? escalaCubrir : fotoEstilo.objectFit === 'contain' ? escalaContener : fotoEstilo.objectFit === 'scale-down' ? Math.min(1, escalaContener) : 1
          const objetoAncho = fotoEstilo.objectFit === 'fill' ? contenidoFoto.width : foto.naturalWidth * escala
          const objetoAlto = fotoEstilo.objectFit === 'fill' ? contenidoFoto.height : foto.naturalHeight * escala
          const posiciones = fotoEstilo.objectPosition.split(/\s+/)
          const posicionSimple = posiciones.length === 2 && posiciones.every(p => /^(?:-?[\d.]+(?:%|px)|left|right|top|bottom|center)$/.test(p))
          const desplazar = (posicion, libre) => {
            if (posicion === 'center') return libre / 2
            if (posicion === 'left' || posicion === 'top') return 0
            if (posicion === 'right' || posicion === 'bottom') return libre
            return posicion.endsWith('%') ? Number.parseFloat(posicion) / 100 * libre : Number.parseFloat(posicion)
          }
          // Medimos los píxeles pintados por object-fit, no solo la caja de <img>.
          // Después recortamos por su propia caja, el contenedor, el hero y cada ancestro que recorte.
          const objetoFoto = {
            x: contenidoFoto.x + desplazar(posiciones[0], contenidoFoto.width - objetoAncho),
            y: contenidoFoto.y + desplazar(posiciones[1] || '50%', contenidoFoto.height - objetoAlto),
            width: objetoAncho, height: objetoAlto,
          }
          objetoFoto.right = objetoFoto.x + objetoAncho
          objetoFoto.bottom = objetoFoto.y + objetoAlto
          let fotoUtil = interseccion(interseccion(interseccion(objetoFoto, contenidoFoto), contenedorRect), heroRect)
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
          const viewportUtil = { x: 0, y: Math.max(0, avisoRect.bottom), right: document.documentElement.clientWidth, bottom: navInicio }
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
          // La prioridad depende de contenido visible, nunca de dónde se coloque el aviso.
          const seguimientoPrioritario = Boolean(seguimiento && visible(seguimiento) && [...seguimiento.querySelectorAll('button')].some(el => visible(el) && /^(Seguir mi pedido|Ver mi reserva|Actualizar seguimiento)$/.test(textoVisible(el))))
          const estado = alertas.length || seguimientoPrioritario ? 'prioritario' : 'normal'
          return {
            estado, alertas, seguimientoPrioritario,
            cabecera: rect(cabecera), saludo: saludoAntesHero ? rect(saludo) : null, utilidades: rect(utilidades),
            aperturaAntesFoto: Math.max(0, fotoUtil.y - avisoRect.bottom),
            hero: heroRect,
            foto: { ...fotoRect, src: foto.currentSrc, naturalWidth: foto.naturalWidth, naturalHeight: foto.naturalHeight, objeto: fotoEstilo.objectFit, posicion: fotoEstilo.objectPosition, posicionSimple, visible: visible(foto),
              sinDeformar: fotoEstilo.objectFit !== 'fill' || Math.abs((contenidoFoto.width / contenidoFoto.height) / (foto.naturalWidth / foto.naturalHeight) - 1) <= .02 },
            fotoContenedor: contenedorRect, contenidoFoto, objetoFoto, fotoUtil, fotoEnViewport, recortes,
            proporcionFotoHero: heroRect.area ? fotoUtil.area / heroRect.area : 0,
            carta: { ...rect(carta), texto: textoVisible(carta) },
            titular: titular ? rect(titular) : null,
            accionesHero: [...hero.querySelectorAll('button, a, [role="button"]')].filter(visible).map(el => textoVisible(el)),
            accionesCarta: accionesCarta.map(el => ({ texto: textoVisible(el), href: el.getAttribute('href'), clase: el.className, enHero: hero.contains(el) })),
            texto: { h1Visibles: h1s.length, titular: textoTitular, caracteresTitular: textoTitular.length, palabrasTitular: textoTitular.split(/\s+/).filter(Boolean).length,
              adicionalHero: textoVisible(hero, 'h1, button, a, [role="button"]'), parrafosHero: [...hero.querySelectorAll('p')].filter(visible).length },
            tratamientoTexto: {
              titular: titular ? { color: getComputedStyle(titular).color, fondo: getComputedStyle(titular).backgroundColor, sombra: getComputedStyle(titular).textShadow } : null,
              carta: { color: getComputedStyle(carta).color, fondo: getComputedStyle(carta).backgroundColor },
              contrasteOverlay: 'PENDIENTE: no se deduce contraste de colores CSS sobre una fotografía; verificar zonas ocupadas por título y CTA en las capturas.',
            },
            logo: { ...marcaRect, src: marca.currentSrc, naturalWidth: marca.naturalWidth, naturalHeight: marca.naturalHeight, ratioNatural, ratioCaja, objeto: marcaEstilo.objectFit, sinDeformar: logoSinDeformar },
            cuenta: rect(cuenta), sellos: rect(sellos), destacados: { ...rect(destacados), productos: destacados.querySelectorAll('[data-plato]').length },
            ordenDOM: { fotoAntesCuenta: precede(foto, cuenta), fotoAntesSellos: precede(foto, sellos), cartaAntesCuenta: precede(carta, cuenta), cartaAntesSellos: precede(carta, sellos), destacadosAntesCuenta: precede(destacados, cuenta), destacadosAntesSellos: precede(destacados, sellos), heroAntesDestacados: precede(hero, destacados) },
            navInicio, aviso: avisoRect,
            pagina: document.documentElement.scrollHeight, anchoDocumento: document.documentElement.clientWidth,
            overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > document.documentElement.clientWidth,
            fallidas: [...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.getAttribute('src')),
          }
        })
        medidas.push({ version, composicion, width, height, ...medida, pases })
        await page.screenshot({ path: `${dir}/${version}-${width}-viewport.png` })
        if ([390, 1440].includes(width)) await page.screenshot({ path: `${dir}/${version}-${width}-completa.png`, fullPage: true })
        comprobar(!medida.overflow, `${version} ${width}: sin desbordamiento horizontal`)
        comprobar(!medida.fallidas.length, `${version} ${width}: imágenes cargadas`)
        comprobar(medida.aviso.y >= 0 && medida.aviso.bottom <= height, `${version} ${width}: aviso local visible`)
        comprobar(medida.estado === 'normal', `${version} ${width}: fixture normal disponible para comprobar la apertura; los estados prioritarios se prueban por separado`)
        if (version !== 'despues') continue
        const dentro = (interior, exterior) => interior && interior.width > 0 && interior.height > 0 && interior.x >= exterior.x - 2 && interior.y >= exterior.y - 2 && interior.right <= exterior.right + 2 && interior.bottom <= exterior.bottom + 2
        const bordeABorde = r => Math.abs(r.x) <= 2 && Math.abs(r.right - medida.anchoDocumento) <= 2
        comprobar(bordeABorde(medida.hero), `${width}: hero de x=0 al ancho del documento, tolerancia 2 px`)
        comprobar(bordeABorde(medida.fotoUtil), `${width}: fotografía útil de x=0 al ancho del documento, tolerancia 2 px`)
        comprobar(medida.foto.visible && medida.foto.posicionSimple && medida.foto.sinDeformar, `${width}: fotografía visible, sin deformación y con object-position medible`)
        comprobar(dentro(medida.hero, medida.fotoUtil), `${width}: la fotografía pintada y recortada cubre toda la portada, tolerancia 2 px`)
        comprobar(dentro(medida.carta, medida.hero) && dentro(medida.titular, medida.hero), `${width}: título y CTA completos dentro de la portada`)
        comprobar(Object.values(medida.ordenDOM).every(Boolean), `${width}: foto, Carta y destacados preceden a cuenta y sellos en el DOM`)
        comprobar(medida.destacados.productos === 3, `${width}: tres productos destacados`)
        comprobar(medida.accionesCarta.length === 1 && medida.accionesCarta[0].enHero, `${width}: una acción promocional a Carta en Inicio, excluyendo la navegación global`)
        comprobar(medida.accionesHero.length === 1 && medida.carta.texto === 'Explorar la carta', `${width}: único CTA de portada «Explorar la carta»`)
        comprobar(medida.texto.h1Visibles === 1 && medida.texto.palabrasTitular > 0 && medida.texto.palabrasTitular <= 10 && medida.texto.caracteresTitular <= 60, `${width}: un h1 breve de hasta 10 palabras y 60 caracteres`)
        comprobar(!medida.texto.adicionalHero && medida.texto.parrafosHero === 0, `${width}: portada sin antetítulo ni párrafo promocional, según su texto visible`)
        comprobar(medida.logo.naturalWidth > 0 && medida.logo.sinDeformar, `${width}: logo cargado y sin deformación`)
        comprobar(pases.length === 1, `${width}: un solo acceso visible «Mostrá tu pase»`)
        const pase = pases[0]
        comprobar(pase && pase.width >= 44 && pase.height >= 44, `${width}: pase con área táctil de al menos 44 × 44 px`)
        comprobar(medida.carta.width >= 44 && medida.carta.height >= 44, `${width}: Carta con área táctil de al menos 44 × 44 px`)
        if (medida.estado !== 'normal') {
          omitidas.push({ version, width, motivo: 'Pedido, reserva o error prioritario: no se aplican umbrales de apertura ni la posición del pase de la portada normal; no se impone ubicación a las alertas' })
          continue
        }
        comprobar(!medida.saludo, `${width}: saludo y nivel no ocupan una cabecera anterior a la portada`)
        comprobar(pase && pase.y >= medida.aviso.bottom - 2 && pase.bottom <= Math.min(medida.navInicio, medida.fotoUtil.y) + 2 && pase.x >= 0 && pase.right <= medida.anchoDocumento && pase.centroLibre, `${width}: pase completo y accesible antes de la fotografía, sin desplazarse`)
        if ([320, 390].includes(width)) comprobar(medida.fotoUtil.y <= 196, `${width}: la fotografía útil comienza a más tardar en y=196 (188 + 8 px)`)
        if (width === 1440) comprobar(medida.fotoUtil.y <= 239, '1440: la fotografía útil comienza a más tardar en y=239 (231 + 8 px)')
      }
    } finally { await context.close() }
  }
  for (const [width] of tamanos) {
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
    if ([320, 390, 1440].includes(width)) comprobar(despues.fotoUtil.y <= antes.fotoUtil.y + 8, `${width}: apertura no más baja que la cuarta composición normal, tolerancia 8 px`)
  }
  comprobar(!erroresPagina.length, 'Sin errores de JavaScript')
  comprobar(!externas.length, 'Solicitudes exclusivamente locales')
  assert.deepEqual(comprobaciones.filter(c => !c.ok), [], 'Contrato geométrico de la quinta composición')
} catch (error) {
  fallo = error.message
  console.error(error)
  process.exitCode = 1
} finally {
  const informe = {
    ok: !fallo, fallo, versiones, comprobaciones, omitidas, comparacion, medidas, erroresPagina, externas,
    alcance: 'Portada en estado normal. Los estados prioritarios conservan sus acciones y se revisan por separado; no se les aplican los límites de apertura normal.',
    revisionVisual: 'PENDIENTE de crítica visual: producto reconocible, encuadre, centro de taza y marca libres, logo completo y reserva H/4, contraste mínimo 4.5:1 en todas las zonas ocupadas por texto, y jerarquía. fotoUtil calcula la superficie pintada por object-fit intersectada con caja de imagen, contenedor, hero y ancestros que recortan; no mide reconocimiento ni contraste de píxeles.',
    alcanceAdicional: 'Foco, reflujo a 200%, carrusel por teclado, actualización estable y rendimiento se validan en las pruebas complementarias; este script no los declara aprobados.',
  }
  writeFileSync(`${dir}/composicion-inmersiva.json`, JSON.stringify(informe, null, 2))
  console.log(JSON.stringify({ ok: informe.ok, comprobaciones: comprobaciones.length, fallidas: comprobaciones.filter(c => !c.ok), omitidas, evidencia: dir }))
  await browser?.close()
}
