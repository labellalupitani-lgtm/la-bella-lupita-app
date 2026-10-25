import assert from 'node:assert/strict'

/**
 * Preparación explícita de un alta NUEVA, sin alterar request ni la base.
 * Recorre el mismo primer cambio obligatorio que debe hacer el empleado.
 * Los tests de claves temporales deben usar su login original y no este helper.
 */
export async function completarAlta(request, { usuario, clave, demo = false, nueva = 'Frase personal de prueba ' + usuario }) {
  const entrar = (password) => request('/api/auth/personal', { usuario, clave: password, demo }, null)
  const acceso = await entrar(clave)
  assert.equal(acceso.status, 200, 'El alta temporal permite autenticarse')
  const temporal = acceso.body.token
  assert.equal((await request('/api/personal/yo', undefined, temporal)).body.requiereCambio, true, 'El alta nueva exige cambiar clave')
  assert.equal((await request('/api/operacion/listas/pedidos', undefined, temporal)).status, 403, 'La clave temporal no habilita operaciones')
  const cambio = await request('/api/personal/clave', { actual: clave, nueva, confirmacion: nueva }, temporal)
  assert.equal(cambio.status, 200, 'Primer cambio de clave por API')
  assert.equal((await request('/api/personal/yo', undefined, temporal)).status, 401, 'El token temporal se revoca al cambiar clave')
  const definitiva = await entrar(nueva)
  assert.equal(definitiva.status, 200, 'La clave personal permite ingresar')
  assert.equal((await request('/api/personal/yo', undefined, definitiva.body.token)).body.requiereCambio, false)
  return { token: definitiva.body.token, clave: nueva, version: 1, usuario }
}
