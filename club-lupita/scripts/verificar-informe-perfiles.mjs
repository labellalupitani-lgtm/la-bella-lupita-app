import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
const dir = resolve(import.meta.dirname, '../entregables/auditoria-perfiles-2026-10-07')
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const checks = [], errors = []
try {
  const page = await browser.newPage()
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(pathToFileURL(resolve(dir, 'INFORME.html')).href)
  await page.getByRole('heading', { level: 1, name: 'Auditoría de calidad y funcionalidad de los cinco perfiles' }).waitFor()
  const links = await page.locator('a').evaluateAll(links => links.map(a => ({ href: a.href, raw: a.getAttribute('href') })))
  for (const link of links) if (link.href.startsWith('file:') && !link.raw.startsWith('#')) assert.ok(existsSync(fileURLToPath(link.href)), 'Enlace local inexistente: ' + link.raw)
  const anchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => ({ href: a.getAttribute('href'), exists: !!document.getElementById(a.getAttribute('href').slice(1)) })))
  assert.ok(anchors.every(a => a.exists))
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 })
    await page.addScriptTag({ content: readFileSync(resolve(import.meta.dirname, '../node_modules/axe-core/axe.min.js'), 'utf8') })
    const result = await page.evaluate(async () => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, violations: (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })) }))
    assert.equal(result.overflow, false); assert.deepEqual(result.violations, [])
    await page.screenshot({ path: resolve(dir, 'evidencia/informe-' + width + '.png') })
    checks.push({ width, ...result })
  }
  await page.locator('.proof').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => Array.from(document.images).every(i => i.complete && i.naturalWidth > 0))
  assert.deepEqual(errors, [])
  checks.push({ enlaces: links.length, imagenes: await page.locator('img').count(), errors })
} finally {
  await browser.close()
  writeFileSync(resolve(dir, 'evidencia/verificacion-informe.json'), JSON.stringify(checks, null, 2))
}
console.log('Informe verificado: enlaces, imágenes, escritorio/móvil, accesibilidad automática y consola.')
