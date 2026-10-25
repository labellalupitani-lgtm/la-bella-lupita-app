// Comparación local de Inicio: la carta y la fotografía preceden a la cuenta completa.
// La geometría no juzga si el alimento se reconoce: revisar también las capturas.
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const versiones = [
  ['antes', process.env.BASELINE_URL || 'http://127.0.0.1:5193'],
  ['despues', process.env.PREVIEW_URL || 'http://127.0.0.1:5190'],
]
for (const [, url] of versiones) {
  const destino = new URL(url)
  assert.ok(['127.0.0.1', 'localhost'].includes(destino.hostname), 'La prueba solo admite localhost')
  assert.equal(destino.protocol, 'http:', 'Usar el servidor local de vista previa')
}
const dir = 'entregables/inicio-carta-2026-10-21/evidencia'
mkdirSync(dir, { recursive: true })
const medidas = [], comprobaciones = [], erroresPagina = [], externas = []
const browser = await chromium.launch({ channel: 'msedge', headless: true })
let fallo
const comprobar = (condicion, nombre) => comprobaciones.push({ nombre, ok: Boolean(condicion) })

try {
  for (const [version, url] of versiones) {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    try {
      const status = await (await context.request.get(url + '/__preview/status')).json()
      assert.equal(status.preview, true, `${version}: falta la vista previa local`)
      assert.equal(status.outbound, 'bloqueado', `${version}: API aislada`)
      const page = await context.newPage()
      page.setDefaultTimeout(15000)
      page.on('pageerror', error => erroresPagina.push({ version, error: error.message }))
      page.on('request', request => {
        if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== new URL(url).origin) externas.push({ version, url: request.url() })
      })
      for (const [width, height] of [[320, 568], [390, 844], [1440, 1000]]) {
        await page.setViewportSize({ width, height })
        await page.goto(url + '/__preview/entrar')
        await page.getByRole('heading', { name: 'Tu cuenta de casa', exact: true }).waitFor()
        await page.getByRole('complementary', { name: 'Entorno de prueba' }).waitFor()
        await page.waitForFunction(() =>
          !document.querySelector('.inicio-alertas')?.textContent.trim() &&
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
          return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, centroLibre: Boolean(centro && el.contains(centro)) }
        }))
        const medida = await page.evaluate(() => {
          const foto = document.querySelector('.inicio-invitacion img')
          const carta = [...document.querySelectorAll('.inicio-invitacion button, .inicio-invitacion a')].find(el => /carta/i.test(el.textContent))
          const cuenta = document.querySelector('.casa-cuenta')
          const sellos = document.querySelector('.casa-fidelidad')
          const nav = document.querySelector('.casa-nav-movil')
          const aviso = document.querySelector('#preview-notice')
          if (!foto || !carta || !cuenta || !sellos || !aviso) throw Error('Falta una pieza de Inicio o el aviso local')
          const rect = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom } }
          const precede = (a, b) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
          const fotoRect = rect(foto), avisoRect = rect(aviso)
          const navInicio = nav?.checkVisibility() ? nav.getBoundingClientRect().top : innerHeight
          const limiteSuperior = Math.max(0, avisoRect.bottom)
          return {
            foto: { ...fotoRect, area: fotoRect.width * fotoRect.height, naturalWidth: foto.naturalWidth, naturalHeight: foto.naturalHeight,
              objeto: getComputedStyle(foto).objectFit, posicion: getComputedStyle(foto).objectPosition },
            fotoVisiblePx: Math.max(0, Math.min(fotoRect.bottom, navInicio, innerHeight) - Math.max(fotoRect.y, limiteSuperior)),
            carta: { ...rect(carta), texto: carta.textContent.trim() }, cuenta: rect(cuenta), sellos: rect(sellos), navInicio, aviso: avisoRect,
            ordenDOM: { fotoAntesCuenta: precede(foto, cuenta), fotoAntesSellos: precede(foto, sellos), cartaAntesCuenta: precede(carta, cuenta), cartaAntesSellos: precede(carta, sellos) },
            pagina: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth > innerWidth,
            fallidas: [...document.images].filter(img => !img.naturalWidth).map(img => img.getAttribute('src')),
          }
        })
        medidas.push({ version, width, height, ...medida, pases })
        await page.screenshot({ path: `${dir}/${version}-${width}-viewport.png` })
        if (width !== 320) await page.screenshot({ path: `${dir}/${version}-${width}-completa.png`, fullPage: true })
        comprobar(!medida.overflow, `${version} ${width}: sin desbordamiento horizontal`)
        comprobar(!medida.fallidas.length, `${version} ${width}: fotografías cargadas`)
        comprobar(medida.aviso.y >= 0 && medida.aviso.bottom <= height, `${version} ${width}: aviso local visible`)
        if (version !== 'despues') continue
        comprobar(Object.values(medida.ordenDOM).every(Boolean), `${width}: foto y acción de carta antes de cuenta y sellos en el DOM`)
        comprobar(pases.length === 1, `${width}: un solo acceso visible «Mostrá tu pase»`)
        if (width < 600) {
          const pase = pases[0]
          comprobar(pase && pase.y >= medida.aviso.bottom && pase.bottom <= medida.navInicio && pase.centroLibre, `${width}: pase completo y accesible sin desplazarse`)
          comprobar(pase && pase.width >= 44 && pase.height >= 44, `${width}: pase con área táctil de al menos 44 × 44 px`)
          comprobar(medida.carta.width >= 44 && medida.carta.height >= 44, `${width}: carta con área táctil de al menos 44 × 44 px`)
        }
        if (width === 390) {
          comprobar(medida.foto.y < 360, '390: la fotografía comienza antes de y=360')
          comprobar(medida.fotoVisiblePx >= 180, '390: al menos 180 px de fotografía antes de la navegación')
        }
        if (width === 320) comprobar(medida.fotoVisiblePx >= 80, '320: al menos 80 px de fotografía al abrir; reconocer el alimento requiere revisión visual')
      }
    } finally { await context.close() }
  }
  const antes = medidas.find(m => m.version === 'antes' && m.width === 1440)
  const despues = medidas.find(m => m.version === 'despues' && m.width === 1440)
  comprobar(despues.foto.height >= 350, '1440: la fotografía tiene al menos 350 px de alto')
  comprobar(despues.foto.area > antes.foto.area, '1440: la fotografía gana superficie frente a la composición anterior')
  comprobar(!erroresPagina.length, 'Sin errores de JavaScript')
  comprobar(!externas.length, 'Solicitudes exclusivamente al servidor local')
  assert.deepEqual(comprobaciones.filter(c => !c.ok), [], 'Contrato geométrico de la nueva composición')
} catch (error) {
  fallo = error.message
  console.error(error)
  process.exitCode = 1
} finally {
  const informe = { ok: !fallo, fallo, comprobaciones, medidas, erroresPagina, externas,
    revisionVisual: 'Pendiente de juicio humano: alimento reconocible, encuadre de escritorio y protagonismo de la carta. Los píxeles visibles miden el rectángulo de la imagen, no su contenido.' }
  writeFileSync(`${dir}/composicion.json`, JSON.stringify(informe, null, 2))
  console.log(JSON.stringify({ ok: informe.ok, comprobaciones: comprobaciones.length, fallidas: comprobaciones.filter(c => !c.ok), evidencia: dir }))
  await browser.close()
}
