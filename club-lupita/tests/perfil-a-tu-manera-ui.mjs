import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { vistaAislada } from './soporte-ui.mjs'
import { tlsLocal } from './tienda-tls.mjs'

// Sesión, Worker, edición y solicitudes reales sobre una base PGlite efímera.
// Las demoras y fallos de respuesta se inyectan únicamente en este servidor TLS local.
const dir = resolve(process.env.EVIDENCIA_DIR || 'entregables/perfil-a-tu-manera-2026-10-22/pruebas-ui')
mkdirSync(dir, { recursive: true })
const resultados = [], medidas = [], errores = [], externas = [], escrituras = []
const nombreLargo = 'María Fernanda de los Ángeles González Rodríguez de la Casa del Café'
const bebidaLarga = 'Chocolate caliente con leche de almendras, una pizca de canela y sin azúcar para disfrutar despacio en la terraza'
const paneles = [['gusto', 'A tu gusto'], ['cuenta', 'Tu cuenta'], ['datos', 'Datos y ayuda']]
let t, browser, context, page
const tab = nombre => page.getByRole('tab', { name: nombre, exact: true })
const bebida = () => page.getByRole('button', { name: /^Cambiar tu bebida de siempre:/ })
const general = () => page.getByRole('button', { name: /^(Editar mi perfil|Continuar edición de mi perfil)$/ })
const dialogo = nombre => page.getByRole('dialog', { name: nombre, exact: true })
async function leerCliente(ruta) {
  const r = await page.evaluate(async ruta => { const respuesta = await fetch(ruta, { headers: { 'x-cliente-solicitud': '1' } }); return { status: respuesta.status, datos: await respuesta.json() } }, ruta)
  assert.equal(r.status, 200, 'lectura autenticada con la cookie emitida por el Worker: ' + ruta)
  return r.datos
}
const consulta = async () => (await leerCliente('/api/perfil')).perfil

async function caso(nombre, fn) {
  try { await fn(); resultados.push({ nombre, ok: true }); console.log('PASA ' + nombre) }
  catch (e) {
    resultados.push({ nombre, ok: false, error: e.stack || String(e) })
    await capturar('fallo').catch(() => {})
    if (page) writeFileSync(dir + '/fallo-texto.txt', await page.locator('body').innerText().catch(() => ''))
    throw e
  }
}
async function estable() {
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
  await page.waitForFunction(() => [...document.images].every(i => i.complete))
}
async function capturar(nombre) {
  await estable()
  await page.screenshot({ path: dir + '/' + nombre + '-viewport.png' })
  await page.screenshot({ path: dir + '/' + nombre + '-completo.png', fullPage: true })
}
async function abrir() {
  await page.goto(t.url + '/perfil')
  await page.locator('#perfil-identidad').waitFor()
  await estable()
}
async function seleccionar(nombre) {
  await tab(nombre).click()
  assert.equal(await tab(nombre).getAttribute('aria-selected'), 'true')
  await page.evaluate(() => scrollTo(0, 0))
  await estable()
}
async function cerrar(nombre) {
  await page.keyboard.press('Escape')
  await dialogo(nombre).waitFor({ state: 'hidden' })
}
async function guardar(nombre) {
  await dialogo(nombre).getByRole('button', { name: 'Guardar cambios', exact: true }).click()
  await dialogo(nombre).waitFor({ state: 'hidden' })
}
async function camposVisibles(nombre) {
  return dialogo(nombre).locator('input,select,textarea').evaluateAll(es => es.filter(e => e.getClientRects().length).map(e => e.id || e.autocomplete || e.type).sort())
}
async function axe(nombre) {
  if (!await page.evaluate(() => !!window.axe)) await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') })
  const a = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } }))
  writeFileSync(dir + '/axe-' + nombre + '.json', JSON.stringify(a.violations, null, 2))
  assert.deepEqual(a.violations.map(v => ({ id: v.id, nodos: v.nodes.map(n => n.target) })), [], nombre)
}
async function ampliarTexto() {
  const cambios = await page.evaluate(() => {
    const es = [...document.querySelectorAll('body *')].filter(e => e instanceof HTMLElement).map(e => ({ e, antes: parseFloat(getComputedStyle(e).fontSize) }))
    for (const { e, antes } of es) e.style.setProperty('font-size', antes * 2 + 'px', 'important')
    return es.filter(({ e }) => e.matches('main h1,main h2,main h3,main button,main p')).map(({ e, antes }) => ({ texto: e.textContent.slice(0, 80), antes, despues: parseFloat(getComputedStyle(e).fontSize) }))
  })
  assert.ok(cambios.length > 8 && cambios.every(c => Math.abs(c.despues - 2 * c.antes) < .05), 'el texto duplica su tamaño computado real')
  return cambios
}
async function reflujo(nombre, fuentes = []) {
  const dato = await page.evaluate(() => {
    const visible = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).clipPath !== 'inset(50%)'
    const caja = e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, derecha: r.right, abajo: r.bottom, ancho: r.width, alto: r.height } }
    const numeros = [], palabras = []
    for (const e of [...document.querySelectorAll('#perfil-identidad,.perfil-bebida strong,.perfil-cumple,.perfil-selector [role="tab"],#perfil-comunicaciones,.perfil-contacto>div:last-child dd')].filter(visible)) {
      const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let nodo
      while ((nodo = walker.nextNode())) {
        if (nodo.parentElement.closest('[aria-hidden="true"]')) continue
        for (const palabra of nodo.textContent.matchAll(/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*|\d{4,}/gu)) {
          const glifos = []
          for (let i = palabra.index; i < palabra.index + palabra[0].length; i++) {
            const r = document.createRange(); r.setStart(nodo, i); r.setEnd(nodo, i + 1); const b = r.getBoundingClientRect()
            glifos.push({ c: nodo.textContent[i], x: b.left, y: b.top, derecha: b.right, abajo: b.bottom })
          }
          palabras.push({ elemento: e.id || e.className, palabra: palabra[0], glifos })
        }
      }
    }
    for (const e of [...document.querySelectorAll('main *')].filter(visible)) {
      if (![...e.childNodes].some(n => n.nodeType === Node.TEXT_NODE && /C\$/.test(n.textContent)) && !(e.matches('.cuenta-importe') && /C\$/.test(e.textContent))) continue
      const text = e.textContent, match = text.match(/C\$\s*([\d.,]+)/)
      if (!match) continue
      const inicio = match.index + match[0].length - match[1].length, final = inicio + match[1].length, walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT)
      const caracteres = []; let n, offset = 0
      while ((n = walker.nextNode())) {
        for (let i = 0; i < n.textContent.length; i++) if (offset + i >= inicio && offset + i < final) {
          const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); const b = r.getBoundingClientRect()
          caracteres.push({ c: n.textContent[i], x: b.left, y: b.top, derecha: b.right, abajo: b.bottom })
        }
        offset += n.textContent.length
      }
      numeros.push({ texto: match[1], caja: caja(e), caracteres })
    }
    const foto = document.querySelector('.perfil-escena'), identidad = document.querySelector('#perfil-identidad')
    const indicaciones = [...document.querySelectorAll('select')].filter(e => visible(e) && !e.value).map(e => {
      const estilo = getComputedStyle(e), contexto = document.createElement('canvas').getContext('2d')
      contexto.font = `${estilo.fontWeight} ${estilo.fontSize} ${estilo.fontFamily}`
      return { texto: e.selectedOptions[0]?.text || '', ancho: contexto.measureText(e.selectedOptions[0]?.text || '').width, disponible: e.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight) - 24 }
    })
    return {
      viewport: { width: innerWidth, height: innerHeight }, documento: document.documentElement.scrollWidth, cuerpo: document.body.scrollWidth,
      titulos: [...document.querySelectorAll('main h1,main h2,main h3,.perfil-bebida strong')].filter(visible).map(e => ({ texto: e.textContent, ancho: e.clientWidth, contenido: e.scrollWidth })),
      imagenesRotas: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.currentSrc), numeros, palabras, indicaciones,
      foto: foto && visible(foto) ? caja(foto) : null, identidad: identidad && visible(identidad) ? caja(identidad) : null
    }
  })
  medidas.push({ nombre, ...dato, fuentes })
  assert.ok(dato.documento <= dato.viewport.width + 1 && dato.cuerpo <= dato.viewport.width + 1, nombre + ': sin desbordamiento horizontal')
  assert.ok(dato.titulos.every(h => h.contenido <= h.ancho + 1), nombre + ': nombre y títulos sin recorte')
  assert.deepEqual(dato.imagenesRotas, [], nombre + ': imágenes locales cargadas')
  assert.ok(dato.indicaciones.every(i => i.ancho <= i.disponible), nombre + ': indicaciones de selector íntegras')
  for (const p of dato.palabras) assert.ok(p.glifos.length > 0 && p.glifos.every(g => Math.abs(g.y - p.glifos[0].y) < 1), nombre + ': palabra íntegra en ' + p.elemento + ': ' + p.palabra)
  for (const n of dato.numeros) {
    assert.ok(n.caracteres.length > 0 && n.caracteres.every(c => Math.abs(c.y - n.caracteres[0].y) < 1), nombre + ': cifra monetaria íntegra ' + n.texto)
    assert.ok(n.caracteres.every(c => c.x >= n.caja.x - 1 && c.derecha <= n.caja.derecha + 1), nombre + ': cifra monetaria dentro de su espacio ' + n.texto)
  }
  if (dato.foto && dato.identidad) assert.ok(dato.foto.derecha <= dato.identidad.x + 1 || dato.foto.x >= dato.identidad.derecha - 1 || dato.foto.abajo <= dato.identidad.y + 1 || dato.foto.y >= dato.identidad.abajo - 1, nombre + ': la foto secundaria no tapa el nombre')
}
async function focoVisible(control) {
  await control.focus(); await page.keyboard.press('Shift')
  const d = await control.evaluate(e => {
    const r = e.getBoundingClientRect(), nav = document.querySelector('.casa-nav-movil'), n = nav?.getBoundingClientRect(), css = getComputedStyle(e)
    return { foco: e === document.activeElement, arriba: r.top, abajo: r.bottom, limite: nav && getComputedStyle(nav).display !== 'none' ? n.top : innerHeight, contorno: css.outlineStyle, ancho: parseFloat(css.outlineWidth) }
  })
  assert.ok(d.foco && d.arriba >= 0 && d.abajo <= d.limite + 1, 'acción enfocada visible sobre la navegación: ' + JSON.stringify(d))
  assert.ok(d.contorno !== 'none' && d.ancho >= 2, 'foco distinguible: ' + JSON.stringify(d))
}

try {
  t = await vistaAislada({ tls: tlsLocal() })
  await t.db.query("UPDATE socio SET bebida_siempre='Chocolate caliente' WHERE id=$1", [t.id])
  const saldoInicial = Number((await t.db.query('SELECT total FROM saldo_de($1)', [t.id])).rows[0].total)
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true })
  context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', timezoneId: 'America/Managua' })
  await context.route('**/*', r => { const u = new URL(r.request().url()); if (u.origin === t.url) return r.continue(); externas.push(u.href); return r.abort() })
  await context.addInitScript(token => { if (!sessionStorage.getItem('perfil-a-tu-manera-fixture')) { localStorage.setItem('club-lupita:sesion', token); sessionStorage.setItem('perfil-a-tu-manera-fixture', '1') } }, t.token)
  page = await context.newPage(); page.setDefaultTimeout(12000)
  page.on('pageerror', e => errores.push(e.message))
  page.on('request', r => { if (r.method() !== 'GET' && new URL(r.url()).origin === t.url) escrituras.push({ ruta: new URL(r.url()).pathname, metodo: r.method(), cuerpo: r.postDataJSON() }) })
  // El libro mayor permanece inmutable. Solo aclaramos el rótulo de un movimiento
  // sintético en las respuestas visuales GET; cantidades e historial siguen reales.
  for (const ruta of ['**/api/yo', '**/api/actividad*']) await page.route(ruta, async route => {
    if (route.request().method() !== 'GET') return route.continue()
    const respuesta = await route.fetch(), datos = await respuesta.json()
    if (Array.isArray(datos.movimientos)) datos.movimientos = datos.movimientos.map(m => m.concepto === 'Historial de puntos' ? { ...m, concepto: 'Consumo en la casa · prueba' } : m)
    return route.fulfill({ response: respuesta, json: datos })
  })

  await caso('390: nombre, pestañas y bebida accionable aparecen antes de la navegación, sin formulario inicial', async () => {
    await abrir()
    const nav = await page.locator('.casa-nav-movil').boundingBox()
    for (const elemento of [page.locator('#perfil-identidad'), page.getByRole('tablist', { name: 'En tu perfil' }), bebida()]) {
      const b = await elemento.boundingBox(); assert.ok(b.y >= 0 && b.y + b.height <= nav.y + 1, 'elemento completo visible en la primera pantalla: ' + await elemento.innerText())
    }
    assert.equal(await page.getByRole('dialog').count(), 0)
    assert.equal(await page.locator('main form:visible').count(), 0)
    assert.match(await bebida().innerText(), /Chocolate caliente/)
    await capturar('gusto-390-inicial'); await axe('gusto-390')
    await page.setViewportSize({ width: 1440, height: 1000 }); await capturar('gusto-1440-inicial')
    await page.setViewportSize({ width: 390, height: 844 })
  })

  await caso('pestañas por teclado, contexto conservado e indicador con desplazamiento real y movimiento reducido', async () => {
    await tab('A tu gusto').focus()
    for (const [tecla, nombre] of [['ArrowRight', 'Tu cuenta'], ['ArrowRight', 'Datos y ayuda'], ['Home', 'A tu gusto'], ['End', 'Datos y ayuda'], ['ArrowLeft', 'Tu cuenta']]) {
      await page.keyboard.press(tecla); assert.equal(await tab(nombre).getAttribute('aria-selected'), 'true'); assert.equal(await tab(nombre).evaluate(e => e === document.activeElement), true)
      assert.equal(await page.getByRole('tabpanel').count(), 1)
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await seleccionar('A tu gusto')
    const movimiento = await page.evaluate(async () => {
      const indicador = document.querySelector('.perfil-selector')
      if (!indicador) throw Error('No se encontró el indicador móvil de las pestañas')
      await Promise.all(indicador.getAnimations({ subtree: true }).map(a => a.finished.catch(() => {})))
      const muestras = [], inicio = performance.now()
      const tomar = () => { const c = getComputedStyle(indicador, '::before'); muestras.push({ t: performance.now() - inicio, x: new DOMMatrixReadOnly(c.transform === 'none' ? undefined : c.transform).m41, ancho: parseFloat(c.width) }) }
      tomar(); document.getElementById('perfil-tab-cuenta').click()
      await new Promise(resolve => { const tick = () => { tomar(); performance.now() - inicio < 450 ? requestAnimationFrame(tick) : resolve() }; requestAnimationFrame(tick) })
      return muestras
    })
    const primer = movimiento[0].x, ultimo = movimiento.at(-1).x
    assert.ok(Math.abs(ultimo - primer) > 20, 'el indicador cambia de posición entre pestañas')
    assert.ok(movimiento.some(m => Math.abs(m.x - primer) > 2 && Math.abs(m.x - ultimo) > 2), 'hay posiciones intermedias medidas, no solo un salto')
    medidas.push({ nombre: 'movimiento-indicador', muestras: movimiento })
    await page.setViewportSize({ width: 1440, height: 1000 }); await seleccionar('A tu gusto')
    for (const [tarjeta, arte] of [['.perfil-bebida', '.perfil-bebida-foto'], ['.perfil-cumple', '.perfil-cumple-arte img']]) {
      await page.mouse.move(1, 1)
      await page.locator(tarjeta).evaluate(e => Promise.all(e.getAnimations({ subtree: true }).map(a => a.finished.catch(() => {}))))
      const antes = await page.locator(arte).evaluate(e => getComputedStyle(e).transform)
      await page.locator(tarjeta).hover()
      const muestras = await page.locator(arte).evaluate(async e => {
        const valores = [], inicio = performance.now()
        await new Promise(resolve => { const tick = () => { valores.push({ t: performance.now() - inicio, matriz: getComputedStyle(e).transform }); performance.now() - inicio < 400 ? requestAnimationFrame(tick) : resolve() }; requestAnimationFrame(tick) })
        return valores
      })
      assert.notEqual(muestras.at(-1).matriz, antes, 'la tarjeta responde al puntero: ' + tarjeta)
      assert.ok(new Set(muestras.map(m => m.matriz)).size > 2, 'la respuesta transita entre estados: ' + tarjeta)
      medidas.push({ nombre: 'respuesta-puntero-' + tarjeta, antes, muestras })
    }
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.mouse.move(1, 1); await seleccionar('A tu gusto')
    await page.locator('.perfil-cumple').hover()
    const activas = await page.locator('main').evaluate(e => e.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)
    assert.equal(activas, 0, 'las tarjetas no animan con movimiento reducido')
    await page.setViewportSize({ width: 390, height: 844 })
    await seleccionar('Datos y ayuda')
    const reducido = await page.locator('.perfil-selector').evaluate(e => ({ transicion: getComputedStyle(e, '::before').transitionDuration, animacion: getComputedStyle(e, '::before').animationDuration, activas: e.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length }))
    assert.ok(reducido.transicion.split(',').every(x => parseFloat(x) <= .01) && reducido.activas === 0, 'movimiento reducido sin desplazamiento animado')
    medidas.push({ nombre: 'indicador-movimiento-reducido', ...reducido }); await seleccionar('A tu gusto')
  })

  await caso('bebida focal, devolución del foco y confirmación únicamente después de la respuesta real', async () => {
    await bebida().click(); const d = dialogo('Tu bebida de siempre'); await d.waitFor()
    assert.deepEqual(await camposVisibles('Tu bebida de siempre'), ['perfil-bebida_siempre'])
    await d.getByLabel('Tu bebida de siempre', { exact: false }).fill('Cacao con canela')
    await capturar('editor-bebida-390-borrador')
    let liberar; const espera = new Promise(r => { liberar = r }); let recibida = false
    await page.route('**/api/perfil*', async r => { if (r.request().method() === 'POST') { const respuesta = await r.fetch(); recibida = true; await espera; await r.fulfill({ response: respuesta }) } else await r.continue() })
    try {
      await d.getByRole('button', { name: 'Guardar cambios', exact: true }).click()
      for (let i = 0; i < 120 && !recibida; i++) await new Promise(r => setTimeout(r, 25))
      assert.equal(recibida, true)
      assert.match(await page.locator('.perfil-bebida').innerText(), /Chocolate caliente/)
      assert.equal(await page.getByText('Tu perfil quedó guardado.', { exact: true }).count(), 0)
      assert.equal(await d.getByLabel('Tu bebida de siempre', { exact: false }).isDisabled(), true)
    } finally { liberar() }
    await d.waitFor({ state: 'hidden' }); await page.unroute('**/api/perfil*')
    assert.match(await bebida().innerText(), /Cacao con canela/)
    assert.equal((await consulta()).bebida_siempre, 'Cacao con canela')
    assert.equal(await bebida().evaluate(e => e === document.activeElement), true)
    await bebida().click(); await axe('bebida-focal'); await capturar('editor-bebida-390'); await cerrar('Tu bebida de siempre')
  })

  await caso('cumpleaños, alergias y consentimiento editan solo su campo, con validación visible', async () => {
    await page.getByRole('button', { name: 'Editar tu cumpleaños', exact: true }).click()
    const cumple = dialogo('Tu cumpleaños'); await cumple.waitFor()
    assert.deepEqual(await camposVisibles('Tu cumpleaños'), ['bday-day', 'bday-month'])
    await cumple.getByLabel('Día', { exact: true }).fill('31'); await cumple.getByLabel('Mes', { exact: true }).selectOption('02')
    const posts = escrituras.filter(x => x.ruta === '/api/perfil').length
    await cumple.getByRole('button', { name: 'Guardar cambios', exact: true }).click()
    assert.equal(await cumple.getByLabel('Día', { exact: true }).getAttribute('aria-invalid'), 'true')
    assert.equal(escrituras.filter(x => x.ruta === '/api/perfil').length, posts)
    await cumple.getByLabel('Día', { exact: true }).fill('19'); await cumple.getByLabel('Mes', { exact: true }).selectOption('05'); await guardar('Tu cumpleaños')
    assert.equal((await consulta()).cumple, '05-19')
    assert.match(await page.locator('.perfil-cumple').innerText(), /19[\s\S]*mayo/i)
    await page.getByRole('button', { name: 'Editar tu cumpleaños', exact: true }).click()
    await cumple.getByRole('button', { name: 'Quitar cumpleaños', exact: true }).click(); await guardar('Tu cumpleaños')
    assert.equal((await consulta()).cumple, '')
    assert.doesNotMatch(await page.locator('.perfil-cumple').innerText(), /19|mayo/i, 'la tarjeta no inventa una fecha al borrar el cumpleaños')
    await capturar('cumple-sin-fecha-390')
    await page.getByRole('button', { name: 'Editar tu cumpleaños', exact: true }).click()
    await cumple.getByLabel('Día', { exact: true }).fill('29'); await cumple.getByLabel('Mes', { exact: true }).selectOption('02'); await guardar('Tu cumpleaños')
    assert.match(await page.locator('.perfil-cumple').innerText(), /29[\s\S]*febrero/i, '29 de febrero se muestra sin inventar año ni cambiar el día')
    await capturar('cumple-febrero-390')
    await page.getByRole('button', { name: 'Editar tu cumpleaños', exact: true }).click()
    await cumple.getByLabel('Día', { exact: true }).fill('19'); await cumple.getByLabel('Mes', { exact: true }).selectOption('05'); await guardar('Tu cumpleaños')
    await page.locator('.perfil-alergias').getByRole('button', { name: 'Editar', exact: true }).click()
    const alergias = dialogo('Alergias'); await alergias.waitFor(); assert.deepEqual(await camposVisibles('Alergias'), ['perfil-alergias'])
    await alergias.getByLabel('Alergias', { exact: false }).fill('Maní y nueces'); await guardar('Alergias')
    assert.equal((await consulta()).alergias, 'Maní y nueces'); assert.match(await page.locator('.perfil-alergias').innerText(), /Avisá y confirmá/)
    await seleccionar('Datos y ayuda'); await page.locator('.perfil-comunicaciones').getByRole('button', { name: /^Cambiar mi preferencia/ }).click()
    const promos = dialogo('Promociones por correo'); await promos.waitFor(); assert.deepEqual(await camposVisibles('Promociones por correo'), ['checkbox'])
    await promos.getByLabel(/Quiero recibir promociones/).check(); await guardar('Promociones por correo')
    assert.equal((await consulta()).promociones_correo, true); await page.getByText('Promociones por correo: aceptadas.', { exact: true }).waitFor()
    await seleccionar('A tu gusto')
  })

  await caso('un borrador de otro campo se revisa completo y nunca se guarda oculto desde bebida', async () => {
    await general().click(); await dialogo('Editar mi perfil').getByLabel('Tu nombre', { exact: true }).fill('A'); await cerrar('Editar mi perfil')
    await bebida().click(); const d = dialogo('Editar mi perfil'); await d.waitFor()
    await d.getByText('Tenés cambios pendientes en otros datos. Revisá el formulario completo antes de guardarlos.', { exact: true }).waitFor()
    assert.equal(await d.getByLabel('Tu nombre', { exact: true }).inputValue(), 'A')
    assert.equal(await d.getByLabel('Alergias · opcional', { exact: true }).isVisible(), true)
    assert.equal((await consulta()).nombre, 'Prueba Regresión')
    const posts = escrituras.filter(x => x.ruta === '/api/perfil').length
    await d.getByRole('button', { name: 'Guardar cambios', exact: true }).click()
    assert.equal(await d.getByLabel('Tu nombre', { exact: true }).getAttribute('aria-invalid'), 'true')
    await page.waitForFunction(() => document.activeElement?.id === 'perfil-nombre')
    assert.equal(await d.getByLabel('Tu nombre', { exact: true }).evaluate(e => e === document.activeElement), true)
    assert.equal(escrituras.filter(x => x.ruta === '/api/perfil').length, posts)
    await d.getByLabel('Tu nombre', { exact: true }).fill('Cliente de prueba'); await guardar('Editar mi perfil')
    assert.equal((await consulta()).nombre, 'Cliente de prueba')
    await bebida().click(); await dialogo('Tu bebida de siempre').getByRole('button', { name: 'Editar todos mis datos', exact: true }).click()
    await dialogo('Editar mi perfil').waitFor(); assert.equal(await dialogo('Editar mi perfil').getByLabel('Tu nombre', { exact: true }).isVisible(), true)
    await axe('editor-general'); await cerrar('Editar mi perfil')
  })

  await caso('saldo íntegro, últimos movimientos e historial mantienen dinero, puntos y sellos separados', async () => {
    await seleccionar('Tu cuenta')
    assert.equal(await page.locator('#perfil-panel-cuenta .cuenta-importe').count(), 1)
    assert.match(await page.locator('#perfil-panel-cuenta .cuenta-importe').innerText(), /9[,.]900/)
    await reflujo('cuenta-390'); await axe('cuenta-390'); await capturar('cuenta-390')
    await page.setViewportSize({ width: 1440, height: 1000 }); await capturar('cuenta-1440-inicial'); await page.setViewportSize({ width: 390, height: 844 })
    await page.getByRole('button', { name: 'Ver toda mi actividad', exact: true }).click()
    const d = dialogo('Tu actividad'); await d.waitFor(); await d.getByRole('button', { name: 'Dinero', exact: true }).click()
    await d.getByText(/Llegaste al final del historial/).waitFor()
    assert.equal(await d.getByRole('button', { name: 'Dinero', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.match(await d.getByRole('list', { name: 'Movimientos de tu cuenta' }).innerText(), /Saldo sintético/)
    await axe('historial'); await capturar('historial-390'); await cerrar('Tu actividad')
    assert.equal(await page.getByRole('button', { name: 'Ver toda mi actividad', exact: true }).evaluate(e => e === document.activeElement), true)
  })

  await caso('ayuda progresiva conserva borrador entre pestañas y al volver, y registra una solicitud local', async () => {
    await seleccionar('Datos y ayuda')
    await page.getByText('No tenés avisos ni solicitudes para mostrar.', { exact: true }).waitFor()
    assert.equal(await page.getByLabel('Motivo', { exact: true }).inputValue(), '')
    assert.equal(await page.getByRole('textbox', { name: 'Contanos qué necesitás', exact: true }).isVisible(), false)
    await capturar('datos-390-inicial'); await axe('datos-390')
    await page.setViewportSize({ width: 1440, height: 1000 }); await capturar('datos-1440-inicial'); await page.setViewportSize({ width: 390, height: 844 })
    await page.getByLabel('Motivo', { exact: true }).selectOption('datos')
    const texto = page.getByRole('textbox', { name: 'Contanos qué necesitás', exact: true }); await texto.waitFor(); await texto.fill('Solicitud sintética: quiero una copia de los datos de mi cuenta.')
    await seleccionar('A tu gusto'); await seleccionar('Datos y ayuda')
    assert.match(await texto.inputValue(), /^Solicitud sintética/)
    await page.getByRole('button', { name: 'Volver sin enviar', exact: true }).click(); assert.equal(await texto.isVisible(), false)
    await page.getByRole('button', { name: 'Continuar solicitud', exact: true }).click(); assert.match(await texto.inputValue(), /^Solicitud sintética/)
    let fallar = true
    await page.route('**/api/atencion', async r => { if (r.request().method() === 'POST' && fallar) return r.fulfill({ status: 422, json: { error: 'Fallo sintético de envío: revisá tu solicitud.' } }); return r.continue() })
    await page.getByRole('button', { name: 'Enviar solicitud a la casa', exact: true }).click()
    await page.getByRole('alert').filter({ hasText: 'Fallo sintético de envío' }).waitFor(); assert.match(await texto.inputValue(), /^Solicitud sintética/)
    assert.equal(await page.getByText('Solicitud registrada. La respuesta aparecerá aquí.', { exact: true }).count(), 0)
    fallar = false; await page.getByRole('button', { name: 'Enviar solicitud a la casa', exact: true }).click()
    await page.getByText('Solicitud registrada. La respuesta aparecerá aquí.', { exact: true }).waitFor(); await page.getByText('Pendiente de atención', { exact: true }).waitFor()
    await page.unroute('**/api/atencion')
    const solicitudes = await leerCliente('/api/atencion'); assert.equal(solicitudes.solicitudes.length, 1); assert.match(solicitudes.solicitudes[0].mensaje, /^Solicitud sintética/)
    await capturar('datos-390-confirmada')
  })

  await caso('la ayuda de Mi Club conserva su formulario directo cuando no se habilita la presentación progresiva', async () => {
    await page.goto(t.url + '/club')
    await page.getByRole('button', { name: 'Mostrar mi pase', exact: true }).waitFor()
    await page.getByText('Ayuda, avisos y revisión de beneficios', { exact: true }).click()
    await page.getByRole('textbox', { name: 'Contanos qué necesitás', exact: true }).waitFor()
    assert.equal(await page.getByLabel('Motivo', { exact: true }).inputValue(), 'compra')
    assert.equal(await page.getByRole('button', { name: 'Enviar solicitud a la casa', exact: true }).isVisible(), true)
    assert.equal(await page.getByRole('button', { name: 'Volver sin enviar', exact: true }).count(), 0)
    await abrir()
  })

  await caso('320, 390, 768 y 1440 con nombre y bebida largos: tres pestañas a 100% y texto real 200%', async () => {
    await seleccionar('A tu gusto'); await general().click(); const d = dialogo('Editar mi perfil')
    await d.getByLabel('Tu nombre', { exact: true }).fill(nombreLargo); await d.getByLabel('Tu bebida de siempre', { exact: false }).fill(bebidaLarga); await guardar('Editar mi perfil')
    const problemas = []
    for (const [width, height] of [[320, 700], [390, 844], [768, 1024], [1440, 1000]]) for (const texto200 of [false, true]) {
      await page.setViewportSize({ width, height }); await abrir()
      assert.equal(await page.locator('#perfil-identidad').innerText(), nombreLargo)
      const fuentes = texto200 ? await ampliarTexto() : []
      for (const [id, nombre] of paneles) {
        await seleccionar(nombre); const evidencia = id + '-' + width + (texto200 ? '-texto200' : '-normal')
        try { await reflujo(evidencia, fuentes) } catch (e) { problemas.push(e.message); console.error('REFLUJO ' + e.message) }
        await capturar(evidencia)
        if (id === 'cuenta') await page.locator('.perfil-cuenta-resumen').screenshot({ path: dir + '/' + evidencia + '-saldo.png' })
        if (width === 320 && texto200) try { await axe(evidencia) } catch (e) { problemas.push(e.message) }
      }
    }
    await page.setViewportSize({ width: 320, height: 700 }); await abrir(); await ampliarTexto(); await focoVisible(general()); await capturar('editar-foco-320-texto200')
    assert.deepEqual(problemas, [], 'todas las combinaciones deben conservar reflujo y palabras íntegras')
  })

  await caso('la revisión mantiene saldo y compras, no envía fuera del servidor aislado ni genera errores JavaScript', async () => {
    assert.equal(Number((await t.db.query('SELECT total FROM saldo_de($1)', [t.id])).rows[0].total), saldoInicial)
    assert.ok(escrituras.every(e => !/membresia\/(apartar|cancelar|renovacion)|experiencias\/.+\/apartar|pedidos|reservas\//.test(e.ruta)), 'sin operaciones de compra')
    assert.deepEqual(errores, []); assert.deepEqual(externas, [])
  })
} finally {
  writeFileSync(dir + '/resultados.json', JSON.stringify({ resultados, medidas, errores, externas, escrituras, alcance: 'Edge Chromium, Worker/PGlite/TLS locales reales. Campos guardados y una solicitud sintética real en base efímera. Fallos/demora de respuesta interceptados localmente. El concepto sintético Historial de puntos se presenta como Consumo en la casa · prueba solo en GET /api/yo y /api/actividad; no se modifica el libro mayor. Indicador medido por requestAnimationFrame, texto200 por tamaños computados individuales. Axe no sustituye revisión humana.' }, null, 2))
  await browser?.close(); await t?.close()
}
