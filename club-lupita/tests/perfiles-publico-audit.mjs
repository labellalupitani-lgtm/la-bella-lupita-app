import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
const out = join(import.meta.dirname, '../entregables/auditoria-perfiles-2026-10-07/evidencia/publico')
mkdirSync(out, { recursive: true })
const base = 'https://app.labellalupita.com'
const results = []
// Solo lecturas públicas sin credenciales. No inicia sesiones ni envía correos.
for (const path of ['/', '/personal', '/api/capacidades', '/api/operacion/clientes', '/api/personal/yo', '/api/yo']) {
  const start = Date.now()
  try {
    const r = await fetch(base + path, { signal: AbortSignal.timeout(20000) }), body = await r.text()
    results.push({ path, status: r.status, ms: Date.now() - start,
      headers: Object.fromEntries(['content-type', 'cache-control', 'strict-transport-security', 'content-security-policy', 'x-content-type-options', 'referrer-policy'].map(k => [k, r.headers.get(k)])),
      ...(path.startsWith('/api/') ? { body: JSON.parse(body) } : { assetScripts: [...body.matchAll(/src="([^"]+\.js)"/g)].map(x => x[1]), title: body.match(/<title>(.*?)<\/title>/)?.[1] }) })
  } catch (e) { results.push({ path, error: e.message }) }
}
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const consoleErrors = [], screens = []
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, locale: 'es-NI', timezoneId: 'America/Managua', reducedMotion: 'reduce' })
  await page.route('**/*', r => ['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort())
  page.on('pageerror', e => consoleErrors.push(e.message))
  for (const width of [1440, 390]) for (const path of ['/', '/personal']) {
    await page.setViewportSize({ width, height: width === 1440 ? 960 : 844 })
    await page.goto(base + path); await page.getByRole('heading').first().waitFor(); await page.evaluate(() => document.fonts.ready)
    const name = (path === '/' ? 'clientes' : 'equipo') + '-' + width
    await page.screenshot({ path: join(out, name + '.png'), fullPage: true })
    await page.addScriptTag({ content: readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8') })
    const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })))
    screens.push({ name, path, width, violations, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1) })
  }
} finally { await browser.close(); writeFileSync(join(out, 'resultados.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results, screens, consoleErrors }, null, 2)) }
console.log(JSON.stringify({ results, screens, consoleErrors }, null, 2))
