import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { preparar } from './soporte-perfiles-equipo.mjs'

// PGlite exclusivamente local. El fixture compila una vez por proceso en su namespace.
const t = await preparar(), demo = await preparar()
Object.assign(t.env, { DEMO_DATABASE_URL: demo.env.DATABASE_URL, DEMO_AISLADA: 'true' })
const call = t.request, resultados = []
const filtro = process.env.SERVER_CASE_FILTER ? new RegExp(process.env.SERVER_CASE_FILTER, 'i') : null
const test = async (nombre, fn) => {
  if (filtro && !filtro.test(nombre)) { resultados.push({ nombre, estado: 'OMITIDA' }); return }
  try { await fn(); resultados.push({ nombre, estado: 'PASA' }); console.log('PASA ' + nombre) }
  catch (e) { resultados.push({ nombre, estado: 'FALLA', detalle: e.message }); console.error('FALLA ' + nombre + ': ' + e.message) }
}
const crear = (usuario, permiso = 'caja', nombre = 'Empleado de prueba') => call('/api/personal/equipo', { nombre, usuario, permiso }, t.staff)
const login = t.entrarEquipo
const snapshotFinanzas = async db => JSON.stringify((await db.query(`SELECT
  (SELECT jsonb_agg(a ORDER BY id) FROM asiento a) AS asientos,
  (SELECT jsonb_agg(p ORDER BY id) FROM punto p) AS puntos,
  (SELECT jsonb_agg(m ORDER BY id) FROM membresia m) AS membresias`)).rows)
const panel = async () => {
  const r = await call('/api/operacion/resumen', undefined, t.staff)
  assert.equal(r.status, 200)
  return r.body
}
try {
  await test('B02 calendario: imposibles, año cero, bisiestos, fecha normal y día local', async () => {
    for (const fecha of ['2026-02-31','2026-13-01','2026-00-10','2026-01-00','0000-01-01','2025-02-29','2026-1-01','2026-01-01T00:00:00Z','basura']) {
      assert.equal((await call('/api/ocupacion?dia=' + encodeURIComponent(fecha), undefined, null)).status, 422, fecha)
    }
    for (const fecha of ['0001-01-01','2024-02-29','2000-02-29','2026-10-07','9999-12-31']) {
      const r = await call('/api/ocupacion?dia=' + fecha, undefined, null)
      assert.equal(r.status, 200, fecha)
      assert.equal(r.body.dia, fecha)
    }
    const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Managua', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
    assert.equal((await call('/api/ocupacion', undefined, null)).body.dia, hoy)
  })

  await test('B03 bigint: límites, representación inválida, aviso propio y aviso ajeno', async () => {
    for (const id of ['0','-1','+1','1.5','1e2','abc','01','9223372036854775808','9'.repeat(100)]) {
      const r = await call('/api/avisos/' + encodeURIComponent(id) + '/leido', {}, t.otroToken)
      assert.equal(r.status, 404, id)
    }
    assert.equal((await call('/api/avisos/9223372036854775807/leido', {}, t.otroToken)).status, 200)
    const { rows: avisos } = await t.db.query("INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,'limite-propio','Propio'),($2,'limite-ajeno','Ajeno') RETURNING id,socio_id", [t.otro,t.id])
    for (const aviso of avisos) assert.equal((await call('/api/avisos/' + aviso.id + '/leido', {}, t.otroToken)).status, 200)
    const estado = (await t.db.query("SELECT socio_id,leido FROM aviso_cliente WHERE referencia IN ('limite-propio','limite-ajeno')")).rows
    assert.ok(estado.find(a => a.socio_id === t.otro).leido)
    assert.equal(estado.find(a => a.socio_id === t.id).leido, null)
  })

  await test('B04 nombres: controles y Unicode malformado rechazados; acentos y no BMP conservados', async () => {
    const malos = ['Nombre\u0000inválido','A\nB','A\tB','A\u0085B','A\u2028B','A\u202eB','\ud800Nombre','A','x'.repeat(81)]
    const problemas = []
    for (let i = 0; i < malos.length; i++) {
      const r = await crear('invalido.' + i, 'caja', malos[i])
      if (r.status !== 422) problemas.push('Nombre inválido ' + i + ': HTTP ' + r.status)
    }
    const insertados = (await t.db.query("SELECT count(*)::int n FROM empleado WHERE usuario LIKE 'invalido.%'")).rows[0].n
    if (insertados) problemas.push('Nombres inválidos insertados: ' + insertados)
    for (const [usuario, nombre] of [['unicode.acentos','  María José 李 ☕  '], ['unicode.limite','𠮷'.repeat(80)]]) {
      const r = await crear(usuario, 'caja', nombre)
      if (r.status !== 200) problemas.push(usuario + ': HTTP ' + r.status)
      else assert.equal((await t.db.query('SELECT nombre FROM empleado WHERE usuario=$1', [usuario])).rows[0].nombre, nombre.trim())
    }
    assert.equal((await call('/api/personal/equipo', { nombre: 'María', usuario: 'sin.permiso', permiso: 'caja' }, t.otroToken)).status, 403)
    assert.deepEqual(problemas, [], 'Todas las fronteras de nombre deben validarse antes de SQL')
  })

  await test('O04 invitación24h: contraseña propia, uso único, caducidad y restablecimiento con revocación', async () => {
    const antes = Date.now(), r = await crear('temporal.nueva')
    assert.equal(r.status, 200)
    assert.equal(r.body.usuario, 'temporal.nueva')
    assert.match(r.body.invitacion, /^[a-f0-9]{64}$/)
    assert.equal(r.body.clave, undefined, 'El propietario no recibe la contraseña del empleado')
    const duracion = Date.parse(r.body.vence) - antes
    assert.ok(duracion >= 24 * 3600000 - 2000 && duracion <= 24 * 3600000 + 60000)
    assert.equal((await login(r.body.usuario, r.body.invitacion)).status, 401, 'La invitación no sirve como contraseña')
    assert.equal((await t.db.query('SELECT count(*)::int n FROM sesion_personal WHERE empleado_id=$1', [r.body.id])).rows[0].n, 0)
    const clave = 'El turno comienza con café y calma'
    const activar = invitacion => call('/api/auth/equipo/activar', { usuario: r.body.usuario, invitacion, nueva: clave, confirmacion: clave }, null)
    assert.equal((await call('/api/auth/equipo/activar', { usuario: r.body.usuario, invitacion: r.body.invitacion, nueva: 'corta', confirmacion: 'corta' }, null)).status, 422)
    const definitiva = await t.activarInvitacion({ ...r.body, clave })
    assert.equal(definitiva.fase, 'completa')
    assert.equal((await activar(r.body.invitacion)).status, 410)
    assert.equal((await call('/api/operacion/listas/pedidos', undefined, definitiva.auth)).status, 200)
    const credencial = (await t.db.query('SELECT version_clave,requiere_cambio,clave_temporal_vence FROM empleado WHERE id=$1', [r.body.id])).rows[0]
    assert.deepEqual(credencial, { version_clave: 1, requiere_cambio: false, clave_temporal_vence: null })
    const segunda = await login(r.body.usuario, clave)
    assert.equal(segunda.status, 200)
    const restablecido = await call('/api/personal/equipo/' + r.body.id + '/restablecer-clave', { version: 1 }, t.staff)
    assert.equal(restablecido.status, 200)
    for (const auth of [definitiva.auth, segunda.auth]) assert.equal((await call('/api/personal/yo', undefined, auth)).status, 401)
    assert.equal((await login(r.body.usuario, clave)).status, 401)
    const restablecida = await t.activarInvitacion({ ...restablecido.body, clave: 'Ahora el café se sirve en otra mesa' })
    assert.equal((await call('/api/operacion/listas/pedidos', undefined, restablecida.auth)).status, 200)
    const exp = await crear('temporal.expira')
    await t.db.query("UPDATE invitacion_personal SET vence=now()-interval '1 second' WHERE empleado_id=$1", [exp.body.id])
    assert.equal((await call('/api/auth/equipo/activar', { usuario: exp.body.usuario, invitacion: exp.body.invitacion, nueva: clave, confirmacion: clave }, null)).status, 410)
    const auditoria = JSON.stringify((await t.db.query('SELECT * FROM auditoria')).rows)
    for (const secreto of [r.body.invitacion, definitiva.clave, exp.body.invitacion, restablecido.body.invitacion]) assert.ok(!auditoria.includes(secreto))
    assert.ok(!auditoria.includes('clave_huella'))
  })

  await test('O04 cuentas anteriores no cambian ni pierden acceso al crear una temporal', async () => {
    const existente = await t.crearEmpleado({ usuario: 'existente.anterior' })
    const antes = (await t.db.query('SELECT * FROM empleado WHERE id=$1', [existente.id])).rows[0]
    assert.equal((await call('/api/personal/yo', undefined, existente.auth)).body.requiereCambio, false)
    assert.equal((await crear('otra.nueva')).status, 200)
    assert.deepEqual((await t.db.query('SELECT * FROM empleado WHERE id=$1', [existente.id])).rows[0], antes)
    assert.equal((await call('/api/operacion/listas/pedidos', undefined, existente.auth)).status, 200)
  })

  await test('O04 encargado: sesión pendiente no opera hasta completar TOTP y la anterior se revoca', async () => {
    const encargado = await t.crearEmpleado({ usuario: 'mfa.encargado', permiso: 'encargado', configurarMfa: false })
    assert.equal(encargado.fase, 'configurar')
    assert.equal((await call('/api/operacion/clientes', undefined, encargado.auth)).status, 403)
    assert.equal((await call('/api/personal/equipo', undefined, encargado.auth)).status, 403)
    const completo = await t.configurarMfa(encargado.auth)
    assert.equal((await call('/api/personal/yo', undefined, encargado.auth)).status, 401)
    assert.equal((await call('/api/operacion/clientes', undefined, completo.auth)).status, 200)
    const loginMfa = await login(encargado.usuario, encargado.clave)
    assert.equal(loginMfa.body.fase, 'mfa')
    assert.equal((await call('/api/operacion/clientes', undefined, loginMfa.auth)).status, 403)
  })

  await test('Coexistencia: cookie personal sin cabecera conserva Bearer cliente; con cabecera obtiene personal', async () => {
    const cliente = await call('/api/yo', undefined, t.token, { headers: { cookie: t.staff.cookie } })
    assert.equal(cliente.status, 200)
    assert.equal(cliente.body.socio.id, t.id)
    assert.equal((await call('/api/operacion/resumen', undefined, t.token, { headers: { cookie: t.staff.cookie } })).status, 403)
    const equipo = await call('/api/operacion/resumen', undefined, t.token, { headers: { cookie: t.staff.cookie, 'x-equipo-solicitud': '1', origin: t.origen } })
    assert.equal(equipo.status, 200)
    assert.equal((await call('/api/personal/yo', undefined, t.staff)).body.permiso, 'propietario')
  })

  await test('O05 cocina: ambas bandejas minimizan datos, otros perfiles conservan importes y estados', async () => {
    const roles = { propietario: t.staff }
    for (const permiso of ['encargado','caja','cocina']) {
      roles[permiso] = (await t.crearEmpleado({ usuario: 'cocina.' + permiso, permiso })).auth
    }
    const compra = await call('/api/cuenta/cobrar', { lineas: [{ id: 'latte', cuanto: 2 }], ref: 'minimizacion-pedido' }, t.otroToken)
    assert.equal(compra.status, 200)
    // Contenido adicional persistido no debe escapar a la lista positiva.
    await t.db.query("UPDATE pedido SET motivo='Contacto 50512345678',lineas=lineas||'[{\"nombre\":\"Extra\",\"cuanto\":1,\"precio\":12345,\"telefono\":\"50512345678\",\"correo\":\"privado@example.test\"}]'::jsonb WHERE id=$1", [compra.body.pedido.id])
    for (const ruta of ['/api/operacion/pedidos','/api/operacion/listas/pedidos?estado=todos']) {
      for (const [rol, token] of Object.entries(roles)) {
        const r = await call(ruta, undefined, token)
        assert.equal(r.status, 200)
        const pedido = (r.body.pedidos ?? r.body.filas).find(p => p.id === compra.body.pedido.id)
        assert.ok(pedido)
        if (rol === 'cocina') {
          for (const key of ['total','precio','telefono','correo','motivo','saldo']) assert.ok(!JSON.stringify(pedido).includes('"' + key + '":'), ruta + ' ' + key)
          assert.ok(!JSON.stringify(pedido).includes('50512345678'))
          assert.deepEqual(pedido.lineas[0], { id: 'latte', nombre: 'Latte', cuanto: 2 })
        } else {
          assert.equal(typeof pedido.total, 'number')
          assert.equal(typeof pedido.lineas[0].precio, 'number')
        }
      }
    }
    const ruta = '/api/operacion/pedidos/' + compra.body.pedido.id + '/estado'
    assert.equal((await call(ruta, { estado: 'aceptado' }, roles.cocina)).status, 403)
    assert.equal((await call(ruta, { estado: 'aceptado' }, roles.caja)).status, 200)
    assert.equal((await call(ruta, { estado: 'preparando' }, roles.cocina)).status, 200)
    assert.equal((await call(ruta, { estado: 'listo' }, roles.cocina)).status, 200)
    assert.equal((await call(ruta, { estado: 'entregado' }, roles.cocina)).status, 403)
    assert.equal((await call('/api/operacion/clientes', undefined, roles.cocina)).status, 403)
  })

  await test('B01 proyección sin cargos: vigencia/gracia/renovación, panel y mantenimiento coherentes', async () => {
    await t.db.exec("UPDATE membresia SET estado='vencida'")
    const casos = [
      ['vigente','activa',true,false,false,0,false,true],
      ['gracia','en_gracia',true,false,false,0,false,true],
      ['sin-renovar','activa',false,false,false,100000,false,false],
      ['sin-consentir','activa',false,true,false,100000,false,false],
      ['sin-saldo','activa',false,true,true,94999,false,false],
      ['renovable','activa',false,true,true,95000,false,true],
      ['gracia-renovable','en_gracia',false,true,true,95000,false,true],
      ['gracia-sin-saldo','en_gracia',false,true,true,94999,false,false],
      ['baja-vigente','activa',true,false,false,0,true,true],
      ['baja-vencida','activa',false,true,true,95000,true,false],
    ]
    for (let i = 0; i < casos.length; i++) {
      const [nombre, estado, vigente, autorenueva, consentida, saldo, baja] = casos[i]
      const { rows: [socio] } = await t.db.query("INSERT INTO socio(nombre,telefono,baja) VALUES($1,$2,CASE WHEN $3 THEN now() ELSE NULL END) RETURNING id", [nombre, '5056000' + String(i).padStart(4,'0'), baja])
      if (saldo) await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'recarga','Saldo sintético para membresía')", [socio.id, saldo])
      await t.db.query("INSERT INTO membresia(socio_id,numero,cuota,estado,desde,hasta,autorenueva,renovacion_consentida) VALUES($1,$2,95000,$3,now()-interval '40 days',now()+CASE WHEN $4 THEN interval '1 day' ELSE interval '-1 day' END,$5,CASE WHEN $6 THEN now()-interval '40 days' ELSE NULL END)", [socio.id, i + 10, estado, vigente, autorenueva, consentida])
    }
    const esperadas = casos.filter(c => c[7]).length
    const antes = await snapshotFinanzas(t.db)
    const cupos = await call('/api/cupos', undefined, null), admin = await panel()
    assert.equal(cupos.body.sociosFundadores, 100 - esperadas)
    assert.equal(admin.membresiasVivas, esperadas)
    assert.equal(await snapshotFinanzas(t.db), antes, 'Leer cupos/panel no cobra ni modifica estados/puntos')
    await t.worker.mantenerMembresias(t.env)
    assert.equal((await call('/api/cupos', undefined, null)).body.sociosFundadores, cupos.body.sociosFundadores)
    assert.equal((await panel()).membresiasVivas, admin.membresiasVivas)
    const renovaciones = (await t.db.query("SELECT count(*)::int n FROM auditoria WHERE accion='renovacion'")).rows[0].n
    assert.equal(renovaciones, 2, 'Solo renuevan las dos membresías consentidas con saldo')
  })

  await test('O03 scheduled: real y demo independientes, sin mutar bindings ni duplicar renovaciones', async () => {
    for (const db of [t.db,demo.db]) await db.query("UPDATE membresia SET estado='activa',hasta=now()-interval '1 day',autorenueva=true,renovacion_consentida=now() WHERE socio_id=$1", [t.id])
    const envAntes = { ...t.env }
    await t.worker.default.scheduled({}, t.env, t.ctx)
    assert.deepEqual(t.env, envAntes)
    for (const db of [t.db,demo.db]) assert.equal((await db.query('SELECT hasta>now() AS vigente FROM membresia WHERE socio_id=$1', [t.id])).rows[0].vigente, true)
    const realAntes = await snapshotFinanzas(t.db), demoAntes = await snapshotFinanzas(demo.db)
    await t.worker.default.scheduled({}, t.env, t.ctx)
    assert.equal(await snapshotFinanzas(t.db), realAntes)
    assert.equal(await snapshotFinanzas(demo.db), demoAntes)
  })

  await test('O03 alias pooler de la misma base: una sola ejecución y fallo de aislamiento', async () => {
    const real = 'postgres://usuario:clave@ep-prueba.test/base?sslmode=require'
    const alias = 'postgresql://otro:secreto@ep-prueba-pooler.test/base?sslmode=verify-full'
    t.bases.set(real, t.db); t.bases.set(alias, t.db)
    const logs = [], log = console.log, error = console.error
    console.log = (...args) => logs.push(args.join(' ')); console.error = (...args) => logs.push(args.join(' '))
    globalThis.__testHttpCalls = 0
    try {
      const env = { ...t.env, DATABASE_URL: real, DEMO_DATABASE_URL: alias }
      await assert.rejects(() => t.worker.default.scheduled({}, env, t.ctx), /Mantenimiento incompleto/)
      assert.equal(globalThis.__testHttpCalls, 1, 'No ejecutar la misma base dos veces por distinto rol, pooler o query string')
      assert.ok(logs.some(l => l.includes('"entorno":"real"') && l.includes('"estado":"correcto"')))
      assert.ok(logs.some(l => l.includes('"entorno":"demo"') && l.includes('"estado":"error"')))
      assert.ok(!logs.join('\n').includes('"entorno":"demo","estado":"correcto"'))
      assert.equal(env.DATABASE_URL, real); assert.equal(env.DEMO_DATABASE_URL, alias)
      assert.ok(!logs.join('\n').includes('postgres'))
    } finally {
      delete globalThis.__testHttpCalls
      console.log = log; console.error = error
      t.bases.delete(real); t.bases.delete(alias)
    }
  })

  await test('O03 fallos parciales: la otra base continúa y los logs no revelan secretos', async () => {
    const errorReal = { query: async () => { const e = new Error('NO PUBLICAR postgres://secreto-real'); e.code = '08006'; throw e } }
    const errorDemo = { query: async () => { const e = new Error('NO PUBLICAR postgres://secreto-demo'); e.code = '08006'; throw e } }
    const mensajes = [], originalError = console.error, originalLog = console.log
    console.error = (...args) => mensajes.push(args.join(' ')); console.log = (...args) => mensajes.push(args.join(' '))
    try {
      await demo.db.query("UPDATE membresia SET estado='activa',hasta=now()-interval '1 day',autorenueva=false WHERE socio_id=$1", [t.id])
      t.bases.set(t.env.DATABASE_URL, errorReal)
      await assert.rejects(() => t.worker.default.scheduled({}, t.env, t.ctx), /Mantenimiento incompleto/)
      assert.equal((await demo.db.query('SELECT estado FROM membresia WHERE socio_id=$1', [t.id])).rows[0].estado, 'vencida')
      t.bases.set(t.env.DATABASE_URL, t.db)
      t.bases.set(t.env.DEMO_DATABASE_URL, errorDemo)
      await t.db.query("UPDATE membresia SET estado='activa',hasta=now()-interval '1 day',autorenueva=false WHERE socio_id=$1", [t.id])
      await assert.rejects(() => t.worker.default.scheduled({}, t.env, t.ctx), /Mantenimiento incompleto/)
      assert.equal((await t.db.query('SELECT estado FROM membresia WHERE socio_id=$1', [t.id])).rows[0].estado, 'vencida')
      await assert.rejects(() => t.worker.default.scheduled({}, { ...t.env, DEMO_DATABASE_URL: undefined }, t.ctx), /Mantenimiento incompleto/)
    } finally {
      console.error = originalError; console.log = originalLog
      t.bases.set(t.env.DATABASE_URL, t.db); t.bases.set(t.env.DEMO_DATABASE_URL, demo.db)
    }
    assert.ok(mensajes.some(m => m.includes('"entorno":"real"') && m.includes('"estado":"error"')))
    assert.ok(mensajes.some(m => m.includes('"entorno":"demo"') && m.includes('"estado":"error"')))
    assert.ok(mensajes.some(m => m.includes('"entorno":"demo"') && m.includes('"estado":"correcto"')))
    assert.ok(!mensajes.join('\n').includes('NO PUBLICAR'))
    assert.ok(!mensajes.join('\n').includes('postgres://'))
  })
} finally {
  await t.close(); await demo.close()
  const resumen = { fechaUTC: new Date().toISOString(), filtro: process.env.SERVER_CASE_FILTER || null, grupos: resultados.filter(r => r.estado !== 'OMITIDA').length, omitidos: resultados.filter(r => r.estado === 'OMITIDA').length, pasan: resultados.filter(r => r.estado === 'PASA').length, fallan: resultados.filter(r => r.estado === 'FALLA').length, resultados }
  const dir = resolve(import.meta.dirname, '../entregables/correcciones-perfiles-2026-10-07/evidencia')
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'correcciones-servidor.json'), JSON.stringify(resumen, null, 2) + '\n')
  console.log('CORRECCIONES_SERVIDOR ' + JSON.stringify(resumen))
  if (resumen.fallan) process.exitCode = 1
}
