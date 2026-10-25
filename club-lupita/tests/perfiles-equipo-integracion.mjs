// Diagnóstico de integración con el acceso nuevo. No lee credenciales ni bases externas.
// Registra observaciones y no cambia expectativas de correcciones-servidor para ocultar fallos.
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { preparar } from './soporte-perfiles-equipo.mjs'

const evidencia = { fechaUTC: new Date().toISOString(), migracion: [], entradas: [] }
const clave = 'Clave histórica sintética para pruebas'
const t = await preparar({ antesMigracionEquipo: async ({ db, env, huella }) => {
  for (const [usuario, secreto, cambiada] of [
    ['historico.sin.cambio', env.PERSONAL_CREDENCIAL_SECRETO, false],
    ['historico.con.cambio', env.PERSONAL_CREDENCIAL_SECRETO, true],
    ['historico.secreto.sesion', env.SESION_SECRETO, true],
  ]) {
    const material = await huella(secreto, 'empleado:' + clave)
    await db.query("INSERT INTO empleado(nombre,usuario,permiso,clave_huella,requiere_cambio,clave_cambiada) VALUES('Empleado histórico',$1,'caja',crypt($2,gen_salt('bf',12)),false,CASE WHEN $3 THEN now() ELSE NULL END)", [usuario,material,cambiada])
  }
} })
try {
  for (const usuario of ['historico.sin.cambio','historico.con.cambio','historico.secreto.sesion']) {
    const row = (await t.db.query('SELECT requiere_cambio FROM empleado WHERE usuario=$1', [usuario])).rows[0]
    const r = await t.entrarEquipo(usuario, clave)
    evidencia.migracion.push({ usuario, requiereCambioTras020: row.requiere_cambio, httpLogin: r.status, fase: r.body.fase ?? null })
  }
  // Control positivo: al conservar el secreto histórico sí se acepta el hash anterior.
  const actual = t.env.PERSONAL_CREDENCIAL_SECRETO
  t.env.PERSONAL_CREDENCIAL_SECRETO = t.env.SESION_SECRETO
  const preservado = await t.entrarEquipo('historico.secreto.sesion', clave)
  evidencia.migracion.push({ usuario: 'historico.secreto.sesion', secretoHistoricoConservado: true, httpLogin: preservado.status, fase: preservado.body.fase ?? null })
  assert.equal(preservado.status, 200)
  t.env.PERSONAL_CREDENCIAL_SECRETO = actual

  const originalError = console.error
  try {
    // El logger de Hono podría incluir parámetros SQL: conservar solo un contador.
    let errores = 0
    console.error = () => { errores++ }
    for (const [caso, dispositivo] of [['numero',123], ['objeto',{}], ['NUL','Equipo\u0000compartido']]) {
      const antes = errores
      const r = await t.request('/api/auth/equipo/entrar', { usuario: t.owner.usuario, clave: t.owner.clave, dispositivo }, null)
      evidencia.entradas.push({ campo: 'dispositivo', caso, http: r.status, erroresInternos: errores - antes })
    }
  } finally { console.error = originalError }
} finally {
  await t.close()
  const dir = resolve(import.meta.dirname, '../entregables/correcciones-perfiles-2026-10-07/evidencia')
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'equipo-integracion.json'), JSON.stringify(evidencia, null, 2) + '\n')
  console.log('EQUIPO_INTEGRACION ' + JSON.stringify(evidencia))
}
