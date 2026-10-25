// Preparación de pruebas de la entrega aislada; no modifica fuentes raíz.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
const root = resolve(import.meta.dirname, '..')
const release = join(root, '.test-output/release-perfiles')
const edit = (name, fn) => { const file = join(release, name); writeFileSync(file, fn(readFileSync(file, 'utf8'))) }
edit('tests/soporte.mjs', s => s.replaceAll("'.test-output'", "`.test-output/baseline/${process.pid}`").replaceAll("'.test-output/worker.mjs'", "`.test-output/baseline/${process.pid}/worker.mjs`").replaceAll("'.test-output/sesion.mjs'", "`.test-output/baseline/${process.pid}/sesion.mjs`"))
edit('tests/soporte-ui.mjs', s => s.replace(" const t=await preparar();", " const policy=Object.fromEntries(readFileSync(join(root,'public/_headers'),'utf8').split(/\\r?\\n/).filter(l=>/^\\s+[^:]+:/.test(l)).map(l=>{const i=l.indexOf(':');return [l.slice(0,i).trim(),l.slice(i+1).trim()]}));\n const t=await preparar();").replace("res.writeHead(200,{'content-type'", "res.writeHead(200,{...policy,'content-type'"))
edit('tests/perfiles-ui-audit.mjs', s => s.replace("import assert from 'node:assert/strict'", "import assert from 'node:assert/strict'\nimport { completarAlta } from './personal-fixture.mjs'")
 .replace("assert.equal(r.status, 200); credentials[role] = r.body", "assert.equal(r.status, 200); credentials[role] = {...r.body,...await completarAlta(t.request,r.body)}")
 .replaceAll('{ version: 0', '{ version: 1')
 .replace("await page.addScriptTag({ content: axeSource })", "await page.evaluate(axeSource)")
 .replace(".fill('200')", ".fill('200.49')").replace('/Recarga registrada: C\\$ 200/', '/Recarga registrada: C\\$ 200\\.49/'))
edit('tests/perfiles-ui-bordes.mjs', s => s.replace("    if (personal) sessionStorage", "    if (sessionStorage.getItem('fixture-iniciada')) return\n    sessionStorage.setItem('fixture-iniciada','1')\n    if (personal) sessionStorage").replace("await page.addScriptTag({ content: readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8') })", "await page.evaluate(readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8'))"))
console.log('Preparación aislada de pruebas UI terminada')
