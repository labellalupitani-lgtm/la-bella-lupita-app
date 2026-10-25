import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { preparar } from '../club-lupita/tests/soporte-perfiles-equipo.mjs'

const results = []
const t = await preparar()
const add = (name, detail) => { results.push({ name, ...detail }); console.log(name + ': ' + JSON.stringify(detail)) }
try {
  const endpoint = '/api/reserva-cosecha/apartar'
  const initial = await t.request('/api/catalogo', undefined, null)
  assert.equal(initial.body.bolsa.precio, 89000)
  await t.db.exec('UPDATE reserva_cosecha SET precio=99000')
  const repriced = await t.request(endpoint, { ref: 'integridad-precio-cambio' })
  assert.equal(repriced.status, 200)
  assert.equal(repriced.body.cobrado, 99000)
  add('Precio cambia tras consultar catálogo sin reconfirmación', { precioVisto: initial.body.bolsa.precio, precioCobrado: repriced.body.cobrado, http: repriced.status })

  await t.db.exec('UPDATE reserva_cosecha SET precio=89000 WHERE numero=1')
  const heterogeneous = await t.request('/api/catalogo')
  const next = await t.request(endpoint, { ref: 'integridad-precio-mixto' })
  assert.equal(heterogeneous.body.bolsa.precio, 89000)
  assert.equal(next.body.cobrado, 99000)
  add('Precio mínimo vendido diverge del siguiente disponible', { precioCatalogo: heterogeneous.body.bolsa.precio, precioCobrado: next.body.cobrado, numero: next.body.numero })

  const replay = await t.request(endpoint, { ref: 'integridad-precio-cambio' })
  const now = await t.request('/api/yo')
  assert.equal(replay.body.repetido, true)
  assert.equal(replay.body.numero, repriced.body.numero)
  assert.notEqual(replay.body.saldo.total, now.body.saldo.total)
  add('Reintento conserva recibo pero saldo de respuesta es histórico', { saldoRespuesta: replay.body.saldo.total, saldoActual: now.body.saldo.total, repetido: replay.body.repetido })

  const purchases = (await t.request('/api/compras')).body.compras.filter(c => c.tipo === 'bolsa')
  assert.equal(purchases.length, 2)
  const stranger = await t.request('/api/compras', undefined, t.otroToken)
  assert.equal(stranger.body.compras.filter(c => c.tipo === 'bolsa').length, 0)
  assert.equal((await t.request(endpoint, { ref: 'integridad-sin-sesion' }, null)).status, 401)
  assert.equal((await t.request(endpoint, {})).status, 422)
  assert.equal((await t.request('/api/experiencia/mesa-tostador/apartar', { ref: 'integridad-precio-cambio' })).status, 409)
  add('Aislamiento e idempotencia operan correctamente', { compras: purchases.length, comprasAjenasVisibles: 0, sinSesion: 401, refAusente: 422, refOtraOperacion: 409 })

  const tableBefore = (await t.db.query('SELECT count(*)::int n FROM compra_bolsa')).rows[0].n
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES($1,$2,'consumo','Vaciar saldo sintético para rollback','integridad-vaciar')", [t.id, -Number(now.body.saldo.total)])
  const rejected = await t.request(endpoint, { ref: 'integridad-sin-saldo' })
  assert.equal(rejected.status, 409)
  assert.equal((await t.db.query('SELECT count(*)::int n FROM compra_bolsa')).rows[0].n, tableBefore)
  const afterZero = await t.request(endpoint, { ref: 'integridad-precio-cambio' })
  assert.equal(afterZero.status, 200)
  assert.equal(afterZero.body.repetido, true)
  add('Sin saldo revierte; reintento conserva compra pagada', { nuevaCompra: rejected.status, replay: afterZero.status, comprasAntesYDespues: tableBefore, saldoActual: 0, saldoRespuestaReplay: afterZero.body.saldo.total })

  const purchaseId = purchases[0].id.slice(6)
  assert.equal((await t.request('/api/operacion/entregas/bolsa/' + purchaseId, {})).status, 403)
  assert.equal((await t.request('/api/operacion/entregas/bolsa/' + purchaseId, {}, t.staff)).status, 200)
  assert.equal((await t.request('/api/operacion/entregas/bolsa/' + purchaseId, {}, t.staff)).status, 409)
  const log = (await t.db.query("SELECT quien,detalle FROM auditoria WHERE accion='entrega_bolsa'")).rows
  assert.equal(log.length, 1)
  assert.equal(log[0].quien, t.owner.id)
  add('Entrega restringida, única y auditada', { cliente: 403, primera: 200, segunda: 409, auditorias: log.length, responsableIndividual: true })

  await t.db.exec('DELETE FROM reserva_cosecha WHERE apartada IS NULL')
  const reduced = (await t.request('/api/catalogo')).body.bolsa
  add('Total de catálogo fijo aunque sólo existan dos filas', { filasReales: (await t.db.query('SELECT count(*)::int n FROM reserva_cosecha')).rows[0].n, catalogo: reduced })
  assert.equal(reduced.total, 150)
  assert.equal(reduced.quedan, 0)

  const noFields = (await t.request(endpoint, { ref: 'integridad-precio-cambio' })).body
  assert.equal('compraId' in noFields, false)
  assert.equal('generacion' in noFields, false)
  add('Respuesta compra carece de ID durable y generación', { campos: Object.keys(noFields), generacionEnHistorial: purchases[0].detalle.generacion })
} finally {
  await t.close()
  writeFileSync(new URL('./integridad-resultados.json', import.meta.url), JSON.stringify({ alcance: 'API actual, base PGlite sintética en memoria; sin tráfico externo ni concurrencia multiconexión', results }, null, 2))
}
