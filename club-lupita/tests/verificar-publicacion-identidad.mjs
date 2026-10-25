import { chromium } from 'playwright'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const base = 'https://club-lupita.labellalupita.workers.dev'
const out = resolve('../entregables/implementacion-identidad-2026-09-30/produccion')
await mkdir(out, { recursive: true })
const report = { url: base, fecha: new Date().toISOString(), rutas: [], recursos: [], pantallas: [] }
const health = await fetch(`${base}/api/health`)
report.salud = { status: health.status, ok: (await health.json()).ok }
if (health.status !== 200 || !report.salud.ok) throw new Error('Servicio no saludable')
const html = await readFile('dist/index.html', 'utf8')
const assets = [...html.matchAll(/(?:src|href)="(\/(?:assets|fuentes)\/[^\"]+)"/g)].map(x => x[1])
assets.push('/brand/v3/logo-original.png', '/brand/v3/retrato-original.png')
for (const route of ['/', '/pedir', '/tienda', '/club', '/reservar', '/perfil', '/compras', '/kit', '/personal']) {
  const response = await fetch(base + route)
  const body = await response.text()
  const current = body.includes('/assets/principal-Dj2rZ4nW.js') && body.includes('/assets/principal-k-4kelbV.css')
  report.rutas.push({ ruta: route, status: response.status, versionActual: current })
  if (response.status !== 200 || !current) throw new Error(`Ruta incorrecta: ${route}`)
}
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
for (const asset of assets) {
  const response = await fetch(base + asset)
  const same = hash(Buffer.from(await response.arrayBuffer())) === hash(await readFile(`dist${asset}`))
  report.recursos.push({ recurso: asset, status: response.status, coincideConBuild: same })
  if (response.status !== 200 || !same) throw new Error(`Recurso incorrecto: ${asset}`)
}
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  for (const [route, name] of [['/', 'acceso-cliente'], ['/personal', 'acceso-personal']]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(base + route, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const visual = await page.evaluate(() => ({
      fondo: getComputedStyle(document.body).backgroundColor,
      texto: getComputedStyle(document.body).color,
      desbordamiento: document.documentElement.scrollWidth > innerWidth,
      imagenesRotas: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src')),
      textoVisible: document.body.innerText.slice(0, 700)
    }))
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true })
    report.pantallas.push({ ruta: route, ...visual, errores: errors })
    if (errors.length || visual.desbordamiento || visual.imagenesRotas.length) throw new Error(`Error visual en ${route}`)
    await page.close()
  }
} finally {
  await browser.close()
  await writeFile(`${out}/verificacion.json`, JSON.stringify(report, null, 2))
}
console.log(JSON.stringify(report, null, 2))
