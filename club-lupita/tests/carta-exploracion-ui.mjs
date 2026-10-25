import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { vistaAislada } from './soporte-ui.mjs'

// El modo por defecto prueba dist con Worker/PGlite propios. El segundo modo
// comprueba el servidor Vite aislado: nunca acepta un origen externo.
const preview = process.env.CARTA_PREVIEW_URL
if (preview && !['127.0.0.1', 'localhost'].includes(new URL(preview).hostname)) throw Error('Solo se permite una preview local')
const fixture = preview ? null : await vistaAislada()
const url = preview ?? fixture.url
if (preview) {
  const status = await (await fetch(url + '/__preview/status')).json()
  assert.equal(status.preview, true); assert.equal(status.outbound, 'bloqueado')
}
const mode = preview ? 'vite' : 'build'
const dir = resolve(process.env.EVIDENCIA_DIR || `entregables/ciclo-carta-2026-10-21/evidencia/exploracion-${mode}`)
mkdirSync(dir, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
const errors = [], external = [], results = []
await context.route('**/*', route => {
  if (new URL(route.request().url()).origin === url) return route.continue()
  external.push(route.request().url()); return route.abort()
})
if (fixture) await context.addInitScript(token => localStorage.setItem('club-lupita:sesion', token), fixture.token)
const page = await context.newPage()
page.setDefaultTimeout(10000)
page.on('pageerror', e => errors.push(e.message))
const search = () => page.getByRole('searchbox', { name: 'Buscar en la carta', exact: true })
async function visit(path = '/pedir?momento=barra') {
  await page.goto(url + path)
  await search().waitFor(); await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => !document.querySelector('.carta-recepcion')?.textContent.includes('Consultando'))
}
async function checkLayout() {
  const layout = await page.evaluate(() => {
    const grid = document.querySelector('.casa-carta-composicion').getBoundingClientRect()
    const result = document.querySelector('.casa-carta-resultados').getBoundingClientRect()
    const notice = document.querySelector('.carta-recepcion').getBoundingClientRect()
    return { width: innerWidth, document: document.documentElement.scrollWidth, grid: grid.width, results: result.width, below: result.top >= notice.bottom, images: [...document.images].filter(i => i.complete && !i.naturalWidth).length }
  })
  assert.ok(layout.document <= layout.width + 1, JSON.stringify(layout))
  assert.ok(layout.results >= layout.grid - 2, 'Resultados comprimidos: ' + JSON.stringify(layout))
  assert.equal(layout.below, true, 'Los resultados deben quedar después del aviso de recepción')
  assert.equal(layout.images, 0)
  return layout
}
async function checkFocus() {
  await page.waitForFunction(() => {
    const r=document.activeElement.getBoundingClientRect(), nav=document.querySelector('.casa-nav-movil')?.getBoundingClientRect()
    return r.top>=0 && r.bottom<=(nav?.height ? nav.top : innerHeight)
  })
  const result = await page.evaluate(() => {
    const r = document.activeElement.getBoundingClientRect()
    const nav = document.querySelector('.casa-nav-movil')?.getBoundingClientRect()
    return { top: r.top, bottom: r.bottom, limit: nav?.height ? nav.top : innerHeight, name: document.activeElement.getAttribute('id') }
  })
  assert.ok(result.top >= 0 && result.bottom <= result.limit, JSON.stringify(result))
}
async function test(name, fn) {
  await fn(); results.push({ name, pass: true }); console.log('PASA ' + name)
}
try {
  if (preview) await page.goto(url + '/__preview/entrar')
  await test('resultados a ancho completo en cinco tamaños y cuatro búsquedas', async () => {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 }); await visit()
      for (const query of ['pizza', 'latte', 'maracuyá', 'sincoincidenciaszz']) {
        await search().fill(query); await checkLayout()
      }
      await page.getByRole('button', { name: 'Ver toda la carta', exact: true }).click()
      assert.equal(await search().inputValue(), '')
      assert.equal(await search().evaluate(e => e === document.activeElement), true)
      assert.equal(await page.locator('.casa-carta-lista li').count(), 73)
    }
  })
  await test('Borrar conserva categoría, limpia URL y devuelve foco al campo', async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await visit('/pedir?momento=brunch')
    await search().fill('pizza')
    const clear = page.getByRole('button', { name: 'Limpiar búsqueda' })
    await clear.focus(); await page.keyboard.press('Enter')
    assert.equal(await search().inputValue(), '')
    assert.equal(new URL(page.url()).searchParams.has('q'), false)
    assert.equal(await page.getByRole('button', { name: 'Brunch', exact: true }).getAttribute('aria-pressed'), 'true')
    assert.equal(await search().evaluate(e => e === document.activeElement), true)
    await checkFocus()
    await search().fill('   '); await clear.click(); assert.equal(await search().inputValue(), '')
  })
  await test('texto al 200 % conserva búsqueda, resultados y control de borrado', async () => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 700 }); await visit('/pedir?q=pizza')
      await page.addStyleTag({ content: 'html { font-size:200% !important }' })
      await checkLayout()
      const clear = page.getByRole('button', { name: 'Limpiar búsqueda' })
      const fits = await clear.evaluate(button => {
        const b=button.getBoundingClientRect(), i=button.parentElement.querySelector('input').getBoundingClientRect()
        return b.left >= i.left && b.right <= i.right && b.height >= 44
      })
      assert.equal(fits, true)
      await clear.click(); await checkFocus()
    }
  })
  await test('categorías completas al tabular en ambos sentidos con texto al 200 %', async () => {
    await page.setViewportSize({ width: 320, height: 700 }); await visit()
    await page.addStyleTag({ content: 'html { font-size:200% !important }' })
    await search().focus()
    const buttons=page.locator('.casa-carta-categorias button')
    for (const [i,key] of [[0,'Tab'],[1,'Tab'],[2,'Tab'],[3,'Tab'],[4,'Tab'],[3,'Shift+Tab'],[2,'Shift+Tab'],[1,'Shift+Tab'],[0,'Shift+Tab']]) {
      await page.keyboard.press(key)
      assert.equal(await buttons.nth(i).evaluate(e => e === document.activeElement), true)
      const visible=await buttons.nth(i).evaluate(e => {
        const r=e.getBoundingClientRect(), p=e.parentElement.getBoundingClientRect()
        return r.left>=p.left+5 && r.right<=p.right-5
      })
      assert.equal(visible,true, 'Categoría recortada: '+i)
    }
  })
  await test('detalle conserva origen; recarga devuelve foco visible; atrás conserva consulta', async () => {
    await page.setViewportSize({ width: 320, height: 700 }); await visit('/pedir?momento=brunch')
    const origin=page.getByRole('button', { name: 'Ver Mollete del Huerto', exact: true })
    await origin.click(); await page.getByRole('dialog').waitFor(); await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Ver Mollete del Huerto')
    await checkFocus()
    await origin.click(); await page.reload(); await page.getByRole('dialog').waitFor()
    await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'hidden' })
    await page.waitForFunction(() => document.activeElement?.id === 'carta-busqueda'); await checkFocus()
    await search().fill('pizza'); await page.locator('.casa-carta-plato').first().click()
    await page.getByRole('dialog').waitFor(); await page.goBack()
    await page.getByRole('dialog').waitFor({ state: 'hidden' }); assert.equal(await search().inputValue(), 'pizza')
    await checkLayout()
  })
  await test('orden de navegación y carga de CSS no cambia la composición', async () => {
    for (const first of ['/tienda', '/perfil', '/']) {
      await page.goto(url + first)
      await page.locator('.casa-nav-movil').getByRole('link', { name: 'Carta', exact: true }).click()
      await search().fill('pizza'); await checkLayout()
    }
  })
  await test('estado de error conserva búsqueda y reintento recupera la carta', async () => {
    await page.route('**/api/carta', r => r.fulfill({ status: 503, json: { error: 'Fallo de prueba' } }))
    await visit('/pedir?q=latte')
    await page.getByRole('button', { name: 'Actualizar carta', exact: true }).waitFor()
    await checkLayout(); await page.unroute('**/api/carta')
    await page.getByRole('button', { name: 'Actualizar carta', exact: true }).click()
    await page.getByRole('button', { name: 'Actualizar carta', exact: true }).waitFor({ state: 'hidden' })
    assert.equal(await search().inputValue(), 'latte')
  })
  await test('capturas y axe en búsqueda móvil, tablet y escritorio', async () => {
    const axe=readFileSync(resolve('node_modules/axe-core/axe.min.js'), 'utf8')
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 }); await visit()
      await page.locator('.carta-seleccion img').evaluateAll(imgs => Promise.all(imgs.map(i => i.decode().catch(() => {}))))
      await page.screenshot({ path: dir + `/despues-${width}.png`, fullPage: true })
      await search().fill('pizza'); await checkLayout()
      await page.screenshot({ path: dir + `/despues-busqueda-${width}.png`, fullPage: true })
      await page.addScriptTag({ content: axe })
      const a=await page.evaluate(async()=> (await axe.run(document, { runOnly: { type:'tag', values:['wcag2a','wcag2aa','wcag21aa'] } })).violations)
      writeFileSync(dir + `/axe-${width}.json`, JSON.stringify(a, null, 2)); assert.deepEqual(a, [])
    }
    assert.deepEqual(errors, []); assert.deepEqual(external, [])
  })
} finally {
  writeFileSync(dir + '/resultados.json', JSON.stringify({ mode, results, errors, external }, null, 2))
  await browser.close(); await fixture?.close()
}
