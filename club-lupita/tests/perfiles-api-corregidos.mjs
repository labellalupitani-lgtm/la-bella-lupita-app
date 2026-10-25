import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { preparar } from './soporte-perfiles-equipo.mjs'

// Auditoría reproducible: solo PGlite en memoria, sin credenciales ni red.
// Ejecutar en serie: soporte.mjs comparte los bundles de .test-output.
const t = await preparar()
const demo = await preparar({ propietario:false })
const realUrl=t.env.DATABASE_URL
Object.assign(t.env, { DEMO_DATABASE_URL: demo.env.DATABASE_URL, DEMO_AISLADA: 'true' })
const { firmar } = t
const call = t.request
const resultados = []
const filtro = process.env.AUDIT_CASE_FILTER ? new RegExp(process.env.AUDIT_CASE_FILTER, 'i') : null
const evidenciaDir = resolve(import.meta.dirname, '../entregables/correcciones-perfiles-2026-10-07/evidencia')
const ciclo = process.env.AUDIT_CYCLE && /^[a-z0-9_-]{1,40}$/i.test(process.env.AUDIT_CYCLE) ? '-' + process.env.AUDIT_CYCLE : ''
const prueba = async (nombre, fn) => {
  if (filtro && !filtro.test(nombre)) { resultados.push({ nombre, estado: 'OMITIDA' }); return }
  try { await fn(); resultados.push({ nombre, estado: 'PASA' }); console.log('PASA ' + nombre) }
  catch (e) { resultados.push({ nombre, estado: 'FALLA', detalle: e.message }); console.error('FALLA ' + nombre + ': ' + e.message) }
}
try {
  const roles = { cliente: t.otroToken, propietario: t.staff, invitado: null }
  const empleados = {}
  for (const permiso of ['encargado', 'caja', 'cocina']) {
    const usuario = 'audit.' + permiso
    const empleado = await t.crearEmpleado({nombre:'Auditoría '+permiso,usuario,permiso})
    empleados[permiso] = empleado
    roles[permiso] = empleado.auth
  }
  await prueba('Matriz de lecturas: cinco perfiles e invitado, 22 rutas por identidad', async () => {
    const tabla = [
      ['/api/health', ['cliente','propietario','encargado','caja','cocina','invitado']],
      ['/api/catalogo', ['cliente','propietario','encargado','caja','cocina','invitado']],
      ['/api/personal/yo', ['propietario','encargado','caja','cocina']],
      ['/api/personal/equipo', ['propietario','encargado']],
      ['/api/actividad', ['cliente']], ['/api/compras', ['cliente']],
      ['/api/avisos', ['cliente']], ['/api/atencion', ['cliente']],
      ['/api/operacion/pedidos', ['propietario','encargado','caja','cocina']],
      ['/api/operacion/entregas', ['propietario','encargado','caja']],
      ['/api/operacion/atencion', ['propietario','encargado','caja']],
      ['/api/operacion/clientes', ['propietario','encargado']],
      ['/api/operacion/clientes/' + t.otro, ['propietario','encargado']],
      ['/api/operacion/clientes/' + t.otro + '/historial', ['propietario','encargado']],
      ['/api/operacion/resumen', ['propietario','encargado']],
      ['/api/operacion/metricas', ['propietario','encargado']],
      ...['pedidos','entregas','agenda','atencion','equipo','auditoria'].map(tipo => [
        '/api/operacion/listas/' + tipo,
        tipo === 'pedidos' ? ['propietario','encargado','caja','cocina'] : ['equipo','auditoria'].includes(tipo) ? ['propietario','encargado'] : ['propietario','encargado','caja'],
      ]),
    ]
    for (const [ruta, permitidos] of tabla) for (const [rol, token] of Object.entries(roles)) {
      const r = await call(ruta, undefined, token)
      assert.equal(r.status, permitidos.includes(rol) ? 200 : rol === 'invitado' ? 401 : 403, rol + ' ' + ruta)
    }
    console.log('MATRIZ_LECTURAS ' + tabla.length * Object.keys(roles).length)
  })
  await prueba('Matriz de escrituras prohibidas y escalada de privilegios', async () => {
    const inexistente = '00000000-0000-4000-8000-999999999999'
    const mutaciones = [
      ['/api/personal/equipo', { nombre: 'No crear', usuario: 'no.crear', permiso: 'encargado' }, ['cliente','encargado','caja','cocina','invitado']],
      ...['desactivar','reactivar','permiso','restablecer-clave'].map(accion => ['/api/personal/equipo/' + inexistente + '/' + accion, { version: 0, permiso: 'encargado', actual: 'no-corresponde' }, ['cliente','encargado','caja','cocina','invitado']]),
      ['/api/cuenta/recargar', { telefono: '50500000002', monto: 20000, ref: 'audit-denegado-recarga' }, ['cliente','cocina','invitado']],
      ['/api/tanda/sellar', { telefono: '50500000002', ticket: 'audit-denegado-sello' }, ['cliente','cocina','invitado']],
      ['/api/vale/quemar', { codigo: 'ABCDEFGH' }, ['cliente','cocina','invitado']],
      ['/api/operacion/cliente', { telefono: '50500000002' }, ['cliente','cocina','invitado']],
      ['/api/operacion/beneficios/consultar', { codigo: 'ABCDEF123456' }, ['cliente','cocina','invitado']],
      ['/api/operacion/beneficios/entregar', { codigo: 'ABCDEF123456' }, ['cliente','cocina','invitado']],
      ['/api/operacion/vale/consultar', { codigo: 'ABCDEFGH' }, ['cliente','cocina','invitado']],
      ['/api/operacion/entregas/bolsa/' + inexistente, {}, ['cliente','cocina','invitado']],
      ['/api/operacion/atencion/' + inexistente + '/responder', { respuesta: 'No corresponde' }, ['cliente','cocina','invitado']],
      ['/api/operacion/pedidos/' + inexistente + '/estado', { estado: 'aceptado' }, ['cliente','cocina','invitado']],
      ['/api/perfil', { nombre: 'No modificar', bebida_siempre: '', alergias: '', cumple: '' }, ['propietario','encargado','caja','cocina','invitado']],
    ]
    let numero = 0
    for (const [ruta, body, prohibidos] of mutaciones) for (const rol of prohibidos) {
      assert.equal((await call(ruta, body, roles[rol])).status, rol === 'invitado' ? 401 : 403, rol + ' ' + ruta)
      numero++
    }
    assert.equal((await t.db.query("SELECT count(*)::int n FROM empleado WHERE usuario='no.crear'")).rows[0].n, 0)
    console.log('MATRIZ_ESCRITURAS_DENEGADAS ' + numero)
  })
  await prueba('Sesiones ausentes, vencidas y firma alterada no abren operaciones', async () => {
    const vencida = await firmar(t.env.SESION_SECRETO, { tel: '50500000002', rol: 'socio', exp: Date.now() - 1000 })
    const [cuerpo, firma] = t.otroToken.split('.')
    const escalado = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(cuerpo, 'base64url').toString()), rol: 'casa' })).toString('base64url') + '.' + firma
    for (const token of [null, 'basura', vencida, escalado, t.otroToken.slice(0, -3) + 'XXX']) {
      assert.equal((await call('/api/operacion/clientes', undefined, token)).status, 401)
    }
  })
  await prueba('IDOR: cliente no modifica reserva ni aviso ajenos y no cobra a otro teléfono', async () => {
    const r = await t.db.query("INSERT INTO reserva(socio_id,zona,cuando,termina,personas,deposito) VALUES($1,'terraza',now()+interval '10 days',now()+interval '10 days 2 hours',2,0) RETURNING id", [t.id])
    const aviso = await t.db.query("INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,'audit-ajeno','Aviso privado sintético') RETURNING id", [t.id])
    assert.equal((await call('/api/reservas/' + r.rows[0].id + '/cancelar', {}, roles.cliente)).status, 404)
    assert.equal((await call('/api/avisos/' + aviso.rows[0].id + '/leido', {}, roles.cliente)).status, 200)
    assert.equal((await t.db.query('SELECT leido FROM aviso_cliente WHERE id=$1', [aviso.rows[0].id])).rows[0].leido, null)
    assert.equal((await t.db.query('SELECT cancelada FROM reserva WHERE id=$1', [r.rows[0].id])).rows[0].cancelada, null)
    const compra = await call('/api/cuenta/cobrar', { telefono: t.tel, lineas: [{ id: 'latte', cuanto: 1 }], ref: 'audit-identidad-firmada' }, roles.cliente)
    assert.equal(compra.status, 200)
    assert.equal((await t.db.query('SELECT socio_id FROM pedido WHERE id=$1', [compra.body.pedido.id])).rows[0].socio_id, t.otro)
    const comprasAjenas = await call('/api/compras?telefono=' + t.tel, undefined, roles.cliente)
    assert.ok(comprasAjenas.body.compras.every(c => c.id !== 'reserva:' + r.rows[0].id))
  })
  await prueba('Cocina respeta transiciones; bandejas no incluyen teléfonos, correo, saldo ni hashes', async () => {
    const compra = await call('/api/cuenta/cobrar', { lineas: [{ id: 'latte', cuanto: 1 }], ref: 'audit-transiciones' }, roles.cliente)
    assert.equal(compra.status, 200)
    const ruta = '/api/operacion/pedidos/' + compra.body.pedido.id + '/estado'
    assert.equal((await call(ruta, { estado: 'preparando' }, roles.cocina)).status, 409)
    assert.equal((await call(ruta, { estado: 'aceptado' }, roles.caja)).status, 200)
    assert.equal((await call(ruta, { estado: 'preparando' }, roles.cocina)).status, 200)
    assert.equal((await call(ruta, { estado: 'cancelado', motivo: 'No corresponde' }, roles.cocina)).status, 403)
    assert.equal((await call(ruta, { estado: 'listo' }, roles.cocina)).status, 200)
    assert.equal((await call(ruta, { estado: 'entregado' }, roles.cocina)).status, 403)
    assert.equal((await call(ruta, { estado: 'entregado' }, roles.caja)).status, 200)
    for (const rutaBandeja of ['/api/operacion/pedidos','/api/operacion/listas/pedidos?estado=todos']) {
      const r = await call(rutaBandeja, undefined, roles.cocina)
      assert.equal(r.status, 200)
      for (const campo of ['telefono','correo','saldo','clave_huella','alergias','cumple']) assert.ok(!JSON.stringify(r.body).includes('"' + campo + '":'), campo + ' expuesto en ' + rutaBandeja)
    }
  })
  await prueba('Aislamiento demo/real: escrituras del propietario y empleado, cierre ante base demo ausente', async () => {
    const duenoDemo = await t.crearPropietario({usuario:'dueno.demo',demo:true})
    const empleadoDemo = await t.crearEmpleado({nombre:'Solo demo',usuario:'audit.demo',permiso:'caja',demo:true,owner:duenoDemo.auth})
    assert.equal((await t.db.query('SELECT count(*)::int n FROM empleado WHERE id=$1', [empleadoDemo.id])).rows[0].n, 0)
    const tokenDemo = empleadoDemo.auth
    assert.equal((await call('/api/cuenta/recargar', { telefono: demo.tel, monto: 20000, ref: 'audit-solo-demo-recarga' }, tokenDemo)).status, 200)
    assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa='recarga:audit-solo-demo-recarga'")).rows[0].n, 0)
    assert.equal((await demo.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa='recarga:audit-solo-demo-recarga'")).rows[0].n, 1)
    assert.equal((await t.entrarEquipo('audit.demo',empleadoDemo.clave,false)).status,401)
    const cerrado = await t.worker.app.request('https://localhost/api/personal/yo', { headers: {cookie:tokenDemo.cookie,'x-equipo-solicitud':'1'} }, { ...t.env, DEMO_DATABASE_URL: undefined }, t.ctx)
    assert.equal(cerrado.status, 503)
    assert.equal(t.env.DATABASE_URL, realUrl)
  })
  await prueba('Identificador de aviso fuera de bigint se rechaza sin error interno', async () => {
    const r = await call('/api/avisos/99999999999999999999999999999999999999/leido', {}, roles.cliente)
    assert.ok(r.status >= 400 && r.status < 500, 'ID numérico desbordado: HTTP ' + r.status)
  })
  await prueba('Nombre de empleado con NUL se valida antes de escribir en PostgreSQL', async () => {
    const r = await call('/api/personal/equipo', { nombre: 'Nombre\u0000inválido', usuario: 'audit.invalido', permiso: 'caja' }, roles.propietario)
    const cantidad = (await t.db.query("SELECT count(*)::int n FROM empleado WHERE usuario='audit.invalido'")).rows[0].n
    assert.equal(cantidad, 0, 'No persistir un nombre con un carácter NUL')
    assert.equal(r.status, 422, 'Entrada inválida del propietario: HTTP ' + r.status)
  })
  await prueba('Revocación por rol y baja impide reutilizar las sesiones anteriores', async () => {
    const empleado = empleados.caja
    const fila = (await t.db.query('SELECT version_clave FROM empleado WHERE id=$1', [empleado.id])).rows[0]
    assert.equal((await call('/api/personal/equipo/' + empleado.id + '/permiso', { version: fila.version_clave, permiso: 'cocina' }, roles.propietario)).status, 200)
    assert.equal((await call('/api/personal/yo', undefined, roles.caja)).status, 401)
    const acceso = await t.entrarEquipo(empleado.usuario,empleado.clave)
    assert.equal(acceso.status,200)
    const actual = acceso.auth
    assert.equal((await call('/api/cuenta/recargar', { telefono: t.tel, monto: 20000, ref: 'audit-caja-revocada' }, actual)).status, 403)
    await t.db.query('UPDATE socio SET baja=now() WHERE id=$1', [t.otro])
    assert.equal((await call('/api/compras', undefined, roles.cliente)).status, 401)
  })
  await prueba('Fechas imposibles de ocupación devuelven 4xx en vez de error interno', async () => {
    for (const dia of ['2026-02-31', '2026-13-01', '0000-01-01']) {
      const r = await call('/api/ocupacion?dia=' + dia, undefined, null)
      assert.ok(r.status >= 400 && r.status < 500, dia + ': HTTP ' + r.status)
    }
  })
  await prueba('Cupos públicos excluyen membresías vencidas aun antes del mantenimiento', async () => {
    await t.db.query("UPDATE membresia SET estado='activa',hasta=now()-interval '1 day',autorenueva=false WHERE socio_id=$1", [t.id])
    const validas = (await t.db.query("SELECT count(*)::int n FROM operativo_membresia WHERE estado IN ('activa','en_gracia') AND hasta>now()")).rows[0].n
    const r = await call('/api/cupos', undefined, null)
    assert.equal(r.status, 200)
    assert.equal(r.body.sociosFundadores, 100 - validas, 'Una plaza vencida sin autorrenovación no debe anunciarse ocupada')
  })
} finally {
  await t.close()
  await demo.close()
  const resumen = { ejecutadoUTC: new Date().toISOString(), filtro: process.env.AUDIT_CASE_FILTER || null, grupos: resultados.filter(r => r.estado !== 'OMITIDA').length, omitidos: resultados.filter(r => r.estado === 'OMITIDA').length, pasan: resultados.filter(r => r.estado === 'PASA').length, fallan: resultados.filter(r => r.estado === 'FALLA').length, resultados }
  mkdirSync(evidenciaDir, { recursive: true })
  writeFileSync(resolve(evidenciaDir, 'perfiles-api' + ciclo + '.json'), JSON.stringify(resumen, null, 2) + '\n')
  console.log('AUDITORIA_PERFILES_API ' + JSON.stringify(resumen))
  if (resumen.fallan) process.exitCode = 1
}
