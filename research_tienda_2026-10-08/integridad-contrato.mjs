import assert from 'node:assert/strict'
import { build } from '../club-lupita/node_modules/esbuild/lib/main.js'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../club-lupita/', import.meta.url))
const result = await build({ stdin: { contents: "export {api} from './src/casa/datos.tsx';", resolveDir: root, loader: 'tsx' }, bundle: true, platform: 'node', format: 'esm', write: false, define: { 'process.env.NODE_ENV': '"production"' } })
const { api } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'))
globalThis.localStorage = { getItem: () => null }
globalThis.fetch = async () => Response.json({ experiencias: [], zonas: [], bolsa: {}, membresia: {} })
const catalog = await api.catalogo()
assert.equal(catalog.ok, true)
globalThis.fetch = async () => Response.json({ saldo: { pagado: 1000, bono: 0, total: 1000 }, cobrado: 89000 })
const compra = await api.apartarBolsa('integridad-json-incompleto')
assert.equal(compra.ok, true)
assert.equal(compra.datos.numero, undefined)
const results = {
  alcance: 'Cliente actual compilado en memoria; transporte simulado sin red',
  catalogoSinCamposAceptado: catalog,
  compraSinNumeroAceptada: compra,
  numeroMostradoPorTienda: String(compra.datos.numero).padStart(3, '0'),
}
writeFileSync(new URL('./integridad-contrato-resultados.json', import.meta.url), JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
