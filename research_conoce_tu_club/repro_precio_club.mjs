import assert from 'node:assert/strict'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { vistaAislada } from '../club-lupita/tests/soporte-cliente-perfiles.mjs'

// Worker actual + SQL real en PGlite efímero. Solo datos sintéticos del fixture.
// No se usa el navegador ni bases remotas. No se imprimen identidades/tokens.
const salida = fileURLToPath(new URL('./repro_precio_club_resultado.json', import.meta.url))
const t = await vistaAislada()
const fetchOriginal = globalThis.fetch
globalThis.fetch = async () => { throw new Error('Red externa prohibida en esta prueba aislada') }
const resultados = []
try {
  const catalogo = await t.request('/api/catalogo', undefined, null)
  assert.equal(catalogo.status, 200)
  const vista = catalogo.body.experiencias.find(e => e.id === 'mesa-tostador')
  assert.equal(vista.precio, 85000)
  const antes = await t.request('/api/yo')
  assert.equal(antes.status, 200)

  await t.db.query('UPDATE experiencia SET precio=$1 WHERE id=$2', [90000, vista.id])
  // Este es el cuerpo real que construye api.apartarExperiencia: solo ref.
  const compra = await t.request('/api/experiencia/mesa-tostador/apartar', { ref: 'auditoria-precio-club-00001' })
  assert.equal(compra.status, 200)
  assert.equal(compra.body.cobrado, 90000)
  assert.equal(antes.body.saldo.total - compra.body.saldo.total, 90000)
  resultados.push({
    caso: 'precio_actualizado_entre_catalogo_y_confirmacion',
    estado: 'DEFECTO_REPRODUCIDO_LOCALMENTE',
    importe_mostrado_centavos: vista.precio,
    importe_actualizado_centavos: 90000,
    cobrado_centavos: compra.body.cobrado,
    exceso_sobre_precio_mostrado_centavos: compra.body.cobrado - vista.precio,
    http: compra.status,
  })

  await t.db.query('UPDATE experiencia SET precio=$1 WHERE id=$2', [95000, vista.id])
  const repetida = await t.request('/api/experiencia/mesa-tostador/apartar', { ref: 'auditoria-precio-club-00001' })
  assert.equal(repetida.status, 200)
  assert.equal(repetida.body.cobrado, compra.body.cobrado)
  assert.equal(repetida.body.butaca, compra.body.butaca)
  assert.equal(repetida.body.saldo.total, compra.body.saldo.total)
  resultados.push({ caso: 'reintento_misma_referencia_tras_otro_cambio_precio', estado: 'PROTECCION_VERIFICADA', doble_cargo: false, misma_butaca: true })

  await t.db.query("INSERT INTO experiencia(id,nombre,cuando,cupos,precio) VALUES($1,$2,now()-interval '1 day',6,10000)", ['auditoria-experiencia-pasada', 'Experiencia sintética pasada'])
  const c = await t.request('/api/catalogo', undefined, null)
  const p = await t.request('/api/cupos', undefined, null)
  assert.equal(c.status, 200)
  assert.equal(p.status, 200)
  const enCatalogo = c.body.experiencias.some(e => e.id === 'auditoria-experiencia-pasada')
  const enCupos = Object.hasOwn(p.body.experiencias, 'auditoria-experiencia-pasada')
  assert.equal(enCatalogo, false)
  assert.equal(enCupos, true)
  resultados.push({ caso: 'experiencia_pasada_en_endpoints_publicos', estado: 'DIFERENCIA_REPRODUCIDA_LOCALMENTE', presente_en_catalogo: enCatalogo, presente_en_cupos: enCupos, afecta_listado_club: false })

  const informe = { fecha_referencia: '2026-10-08 America/Managua', entorno: 'Worker local actual y PGlite efímero con datos sintéticos; red externa bloqueada', resultados }
  writeFileSync(salida, JSON.stringify(informe, null, 2) + '\n')
  console.log(JSON.stringify(informe, null, 2))
} finally {
  globalThis.fetch = fetchOriginal
  await t.close()
}
