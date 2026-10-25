import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { preparar } from '../club-lupita/tests/soporte-perfiles-equipo.mjs'

// Auditoría completamente local: PGlite en memoria y driver SQL del fixture.
// Bloquea fetch para impedir que el experimento contacte sistemas externos.
const fetchOriginal = globalThis.fetch
globalThis.fetch = async () => { throw Error('La auditoría no permite conexiones externas') }
const appRoot = resolve(import.meta.dirname, '../club-lupita')
const requireApp = createRequire(join(appRoot, 'package.json'))
const { build } = requireApp('esbuild')
const resultados = []
let t
const registrar = (caso, clasificacion, evidencia) => {
  resultados.push({ caso, clasificacion, evidencia })
  console.log(clasificacion + ' ' + caso + ': ' + JSON.stringify(evidencia))
}
try {
  t = await preparar()
  const archivo = join(t.output, 'auditoria-carta-worker.mjs')
  await build({
    stdin: { contents: "export { app } from './src/worker/index.ts'; export { CARTA } from './src/data/menu.ts';", resolveDir: appRoot, sourcefile: 'auditoria-carta-entry.ts' },
    bundle: true, platform: 'node', format: 'esm', outfile: archivo,
    external: ['qrcode'], alias: { '@neondatabase/serverless': join(t.output, 'driver.mjs') },
  })
  const { app, CARTA } = await import(pathToFileURL(archivo).href)
  const llamar = async (body, extraHeaders = {}) => {
    const r = await app.request('https://localhost/api/cuenta/cobrar', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t.token, ...extraHeaders },
      body: JSON.stringify(body),
    }, t.env, t.ctx)
    return { status: r.status, body: await r.json() }
  }
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,10000000,'recarga','Saldo sintético para auditoría local')", [t.id])

  const yo = await t.request('/api/yo', undefined, t.token, { headers: { cookie: t.staff.cookie } })
  const coexistencia = await llamar({ lineas: [{ id: 'latte', cuanto: 1 }], ref: 'audit-coexistencia-001' }, { cookie: t.staff.cookie })
  assert.equal(yo.status, 200); assert.equal(yo.body.socio.id, t.id); assert.equal(coexistencia.status, 200)
  const dueno = (await t.db.query('SELECT socio_id FROM pedido WHERE id=$1', [coexistencia.body.pedido.id])).rows[0].socio_id
  assert.equal(dueno, t.id)
  registrar('Cookie de equipo y Bearer de cliente coexistentes', 'CONTROL_CORRECTO', { lectura: yo.status, cobro: coexistencia.status, cuentaCorrecta: dueno === t.id })

  for (const cuanto of [0, -1, 1.5, 21, '2']) {
    const r = await llamar({ lineas: [{ id: 'latte', cuanto }], ref: 'audit-cantidad-' + String(cuanto).replace(/[^a-z0-9]/g, '') })
    assert.ok(r.status >= 400 && r.status < 500)
    registrar('Rechaza cantidad ' + JSON.stringify(cuanto), 'CONTROL_CORRECTO', { status: r.status, error: r.body.error })
  }

  const duplicados = await llamar({ lineas: Array.from({ length: 40 }, () => ({ id: 'agua', cuanto: 20 })), ref: 'audit-duplicados-001' })
  assert.equal(duplicados.status, 200)
  const detalle = (await t.db.query('SELECT lineas,total FROM pedido WHERE id=$1', [duplicados.body.pedido.id])).rows[0]
  assert.equal(detalle.lineas.reduce((s, l) => s + l.cuanto, 0), 800)
  registrar('Tope de 20 se aplica a cada línea, admite 800 unidades del mismo producto', 'HALLAZGO_REPRODUCIDO', { status: duplicados.status, lineas: detalle.lineas.length, unidades: 800, totalCentavos: detalle.total })

  const latte = CARTA.find(p => p.id === 'latte'), precioOriginal = latte.precio, nombreOriginal = latte.nombre
  const primera = { lineas: [{ id: 'latte', cuanto: 1 }], ref: 'audit-catalogo-001' }
  const cobrado = await llamar(primera)
  assert.equal(cobrado.status, 200); assert.equal(cobrado.body.cobrado, precioOriginal)
  const repeticion = await llamar(primera)
  assert.equal(repeticion.status, 200); assert.equal(repeticion.body.repetido, true)
  assert.equal(repeticion.body.pedido.id, cobrado.body.pedido.id)
  registrar('Reintento idéntico con catálogo estable', 'CONTROL_CORRECTO', { status: repeticion.status, repetido: repeticion.body.repetido, mismoPedido: true })

  latte.precio = precioOriginal + 1000
  const nuevo = await llamar({ ...primera, ref: 'audit-precio-nuevo-001' })
  assert.equal(nuevo.status, 200); assert.equal(nuevo.body.cobrado, precioOriginal + 1000)
  registrar('Cliente abierto con precio anterior; servidor cobra precio nuevo sin reconfirmación', 'HALLAZGO_REPRODUCIDO', { status: nuevo.status, precioClienteSimulado: precioOriginal, cobrado: nuevo.body.cobrado })
  const reintentoPrecio = await llamar(primera)
  assert.equal(reintentoPrecio.status, 409)
  registrar('Reintento de cobro confirmado tras cambio de precio', 'HALLAZGO_REPRODUCIDO', { status: reintentoPrecio.status, error: reintentoPrecio.body.error })
  latte.precio = precioOriginal
  latte.nombre = nombreOriginal + ' nuevo'
  const reintentoNombre = await llamar(primera)
  assert.equal(reintentoNombre.status, 409)
  registrar('Reintento de cobro confirmado tras cambio de nombre', 'HALLAZGO_REPRODUCIDO', { status: reintentoNombre.status, error: reintentoNombre.body.error })
  latte.nombre = nombreOriginal
  const posicion = CARTA.indexOf(latte)
  CARTA.splice(posicion, 1)
  const reintentoRetirado = await llamar(primera)
  assert.equal(reintentoRetirado.status, 422)
  registrar('Reintento de cobro confirmado tras retirar producto', 'HALLAZGO_REPRODUCIDO', { status: reintentoRetirado.status, error: reintentoRetirado.body.error })
  CARTA.splice(posicion, 0, latte)
  const conteos = (await t.db.query("SELECT (SELECT count(*)::int FROM pedido WHERE socio_id=$1 AND referencia='audit-catalogo-001') pedidos, (SELECT count(*)::int FROM asiento WHERE socio_id=$1 AND ref_externa='pedido:audit-catalogo-001') cargos", [t.id])).rows[0]
  assert.deepEqual(conteos, { pedidos: 1, cargos: 1 })
  registrar('Reintentos bloqueados no duplican el cargo automáticamente', 'CONTROL_CORRECTO', conteos)
} finally {
  writeFileSync(join(import.meta.dirname, 'integridad-local-resultados.json'), JSON.stringify({ entorno: 'PGlite en memoria; fetch externo bloqueado; sin secretos ni producción', resultados }, null, 2) + '\n')
  if (t) await t.close()
  globalThis.fetch = fetchOriginal
}
