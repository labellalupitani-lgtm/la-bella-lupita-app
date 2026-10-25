import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '..')
const base = resolve(root, 'entregables/auditoria-perfiles-2026-10-07')
const fingerprint = b => createHash('sha256').update(b).digest('hex')
const manifest = JSON.parse(readFileSync(resolve(base, 'evidencia/fuentes-sha256.json'), 'utf8').replace(/^\uFEFF/, ''))
const changed = manifest.filter(f => fingerprint(readFileSync(resolve(root, f.path))).toUpperCase() !== f.sha256.toUpperCase()).map(f => f.path)
const html = readFileSync(resolve(root, 'dist/index.html'), 'utf8')
const main = html.match(/src="([^"]+\.js)"/)[1]
const mainSource = readFileSync(resolve(root, 'dist', main.slice(1)), 'utf8')
const staff = mainSource.match(/Personal-[A-Za-z0-9_-]+\.js/)?.[0]
const assets = []
for (const path of [main, staff && '/assets/' + staff].filter(Boolean)) {
  const local = readFileSync(resolve(root, 'dist', path.slice(1)))
  const remote = await fetch('https://app.labellalupita.com' + path, { signal: AbortSignal.timeout(20000) })
  const remoteBytes = Buffer.from(await remote.arrayBuffer())
  assets.push({ path, status: remote.status, bytes: local.length, localSHA256: fingerprint(local), remoteSHA256: fingerprint(remoteBytes), coincide: remote.status === 200 && fingerprint(local) === fingerprint(remoteBytes) })
}
const result = { checkedAtUTC: new Date().toISOString(), fuentes: manifest.length, fuentesModificadas: changed, frontendPublicado: assets, alcance: 'Coincidencia de bundles frontend. No certifica que el backend desplegado coincida con las fuentes locales.' }
writeFileSync(resolve(base, 'evidencia/integridad-y-publicacion.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
if (changed.length) process.exitCode = 1
