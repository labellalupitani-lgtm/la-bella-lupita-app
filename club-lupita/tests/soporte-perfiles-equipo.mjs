import assert from 'node:assert/strict'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist'
import { TOTP } from 'otpauth'
import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const root = resolve(import.meta.dirname, '..')
const output = join(root, '.test-output', 'perfiles-equipo', String(process.pid))
const origen = 'https://localhost'
let compilacion, secuencia = 0
const bases = globalThis.__perfilesEquipoDbs ??= new Map()

async function compilar() {
  mkdirSync(output, { recursive: true })
  const driver = join(output, 'driver.mjs')
  writeFileSync(driver, `
export const neonConfig={};
const base=url=>{const db=globalThis.__perfilesEquipoDbs.get(url);if(!db)throw Error('Base local no registrada');return db};
export class Client{constructor(url){this.db=base(url)}async connect(){}async end(){}async query(q,p){return this.db.query(q,p)}}
export function neon(url){const db=base(url);const sql=(parts,...params)=>{const query=parts.reduce((s,p,i)=>s+(i?'$'+i:'')+p,'');const execute=()=>{if(typeof globalThis.__testHttpCalls==='number')globalThis.__testHttpCalls++;return db.query(query,params).then(r=>r.rows)};return{execute,then:(yes,no)=>execute().then(yes,no)}};sql.transaction=async queries=>{await db.exec('BEGIN');try{const rows=[];for(const q of queries)rows.push(await q.execute());await db.exec('COMMIT');return rows}catch(e){await db.exec('ROLLBACK');throw e}};return sql}
`)
  await build({ stdin: { contents: "export * from './src/worker/index.ts'; export * from './src/compartido/reservas.ts'; export { procesarCorreosReservas } from './src/worker/reservas-correo.ts'; export { CONFIGURACION_RESERVAS as configReservasPrueba } from './src/compartido/reservas.ts'; export { CARTA as cartaPrueba } from './src/data/menu.ts'; export { estadoHorario, CONFIGURACION_CARTA, intencionPedido } from './src/compartido/carta.ts'", resolveDir: root }, bundle: true, platform: 'node', format: 'esm', outfile: join(output, 'worker.mjs'), external: ['qrcode'], alias: { '@neondatabase/serverless': driver } })
  await build({ entryPoints: [join(root, 'src/worker/sesion.ts')], bundle: true, platform: 'node', format: 'esm', outfile: join(output, 'sesion.mjs') })
  return { worker: await import(pathToFileURL(join(output, 'worker.mjs'))), sesion: await import(pathToFileURL(join(output, 'sesion.mjs'))) }
}

/** Extraer solamente las cookies que emitió el Worker, sin fabricar sesiones. */
export function leerAutenticacion(headers) {
  const filas = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [headers.get('set-cookie') ?? '']
  const cookies = new Map()
  for (const fila of filas) for (const match of fila.matchAll(/(?:^|,\s*)(__Host-lupita-equipo(?:-csrf)?)=([^;]*)/g)) cookies.set(match[1], match[2])
  if (!cookies.has('__Host-lupita-equipo')) return null
  return { cookie: [...cookies].map(([k,v]) => k + '=' + v).join('; '), csrf: decodeURIComponent(cookies.get('__Host-lupita-equipo-csrf') ?? '') }
}

export async function preparar({ propietario = true, antesMigracionEquipo, telefono='50587442006', compatibilidadDemo=false, reservasConfiguradas=true } = {}) {
  compilacion ??= compilar()
  const { worker, sesion } = await compilacion
  const db = new PGlite({ extensions: { pgcrypto, btree_gist } })
  const DATABASE_URL = 'postgres://perfiles-equipo-' + process.pid + '-' + (++secuencia)
  const env = { DATABASE_URL, SESION_SECRETO: 'sesion-cliente-fixture-independiente', PERSONAL_CREDENCIAL_SECRETO: 'credenciales-fixture-local-independiente', PERSONAL_MFA_SECRETO: 'mfa-fixture-local-32-caracteres-comprobables', CASA_SECRETO: 'clave-arranque-local-solo-pruebas' }
  bases.set(DATABASE_URL, db)
  // Solo la regresión histórica usa un dataset sintético compartido para su número demo.
  // Las pruebas de aislamiento crean dos PGlite distintos, sin este modo.
  if(compatibilidadDemo){env.DEMO_DATABASE_URL=DATABASE_URL+'-demo';bases.set(env.DEMO_DATABASE_URL,db)}
  try {
    for (const f of ['001_schema','003_correcciones','004_sesiones','005_generacion','006_orden_del_saldo','007_vale']) await db.exec(readFileSync(join(root, 'db', f + '.sql'), 'utf8'))
    const id = '00000000-0000-4000-8000-000000000001', otro = '00000000-0000-4000-8000-000000000002', tel = telefono
    await db.exec(`
      INSERT INTO socio(id,telefono,nombre,cumple) VALUES('${id}','${tel}','Cliente de pruebas','2000-09-14'),('${otro}','50500000002','Otro cliente','2000-02-03');
      INSERT INTO asiento(socio_id,monto,tipo,concepto,creado) SELECT id,1000000,'recarga','Saldo sintético',now()-interval '2 days' FROM socio;
      INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES('${id}',-10000,'consumo','Historial de puntos');
      INSERT INTO tanda(socio_id) VALUES('${id}');
      INSERT INTO sello(tanda_id,n,motivo,ref_externa) SELECT t.id,n,'Prueba','test-'||n FROM tanda t,generate_series(1,8) n;
      INSERT INTO membresia(socio_id,numero,cuota,desde,hasta) VALUES('${id}',1,95000,now()-interval '31 days',now()-interval '1 day');
      INSERT INTO reserva_cosecha(numero,precio) SELECT n,89000 FROM generate_series(1,150) n;
      INSERT INTO experiencia(id,nombre,cuando,cupos,precio) VALUES('mesa-tostador','Experiencia sintética',now()+interval '7 days',12,85000);
    `)
    for (const f of ['009_puntos','010_integridad','011_plazas','012_operacion','013_correo','014_promociones','015_saldo_cronologico','016_baja_socio','017_seguridad_personal','018_clientes_equipo']) await db.exec(readFileSync(join(root, 'db', f + '.sql'), 'utf8'))
    if (antesMigracionEquipo) await antesMigracionEquipo({ db, env, huella: sesion.huella })
    await db.exec(readFileSync(join(root, 'db/020_acceso_equipo.sql'), 'utf8'))
    await db.exec(readFileSync(join(root, 'db/021_inicio_sesion.sql'), 'utf8'))
    await db.exec(readFileSync(join(root, 'db/022_carta.sql'), 'utf8'))
    await db.exec(readFileSync(join(root, 'db/023_tienda.sql'), 'utf8'))
    await db.exec(readFileSync(join(root, 'db/024_mi_club.sql'), 'utf8'))
    await db.exec(readFileSync(join(root, 'db/025_club_operacion.sql'), 'utf8'))
    await db.exec(readFileSync(join(root, 'db/026_perfil.sql'), 'utf8'))
    await db.exec(readFileSync(join(root, 'db/027_reservas.sql'), 'utf8'))
    await db.exec(readFileSync(join(root, 'db/028_reservas_reembolso.sql'), 'utf8'))
    await db.exec(readFileSync(join(root, 'db/029_reglas_club.sql'), 'utf8'))
    if (reservasConfiguradas) {
      // Inventario exclusivamente sintético; nunca se migra a entornos reales.
      const cfg = structuredClone(worker.configReservasPrueba)
      const cantidades = { terraza:10, ventanal:6, barra:8, bistro:12, vip:1 }
      cfg.zonas.forEach(z => { z.mesas=Array.from({length:cantidades[z.id]},(_,i)=>({id:'prueba-'+(i+1),plazas:12})) })
      await db.query('INSERT INTO reserva_config(id,version,datos) VALUES(true,1,$1::jsonb)',[JSON.stringify(cfg)])
    }
    const token = await sesion.firmar(env.SESION_SECRETO, { tel, rol: 'socio', exp: Date.now() + 3600000 })
    const otroToken = await sesion.firmar(env.SESION_SECRETO, { tel: '50500000002', rol: 'socio', exp: Date.now() + 3600000 })
    const ctx = { waitUntil(p) { void p.catch(() => {}) }, passThroughOnException() {} }
    // auth string = Bearer de cliente; objeto = cookies y CSRF del equipo;
    // null = invitado. No cambia el auth que recibe: el test adopta cada cookie nueva.
    const request = async (path, body, auth = token, opciones = {}) => {
      const equipo = (auth && typeof auth === 'object') || path.startsWith('/api/auth/equipo/') || path.startsWith('/api/personal/')
      const headers = { 'content-type': 'application/json', ...(equipo ? { origin: origen, 'x-equipo-solicitud': '1' } : {}), ...(typeof auth === 'string' ? { authorization: 'Bearer ' + auth } : auth ? { cookie: auth.cookie, 'x-equipo-csrf': auth.csrf } : {}), ...opciones.headers }
      const response = await worker.app.request(origen + path, { method: body === undefined ? 'GET' : 'POST', headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }, env, ctx)
      return { status: response.status, body: await response.json(), headers: response.headers, auth: leerAutenticacion(response.headers) }
    }
    const t = { db, env, worker, ctx, request, id, otro, tel, token, otroToken, bases, origen, output, firmar: sesion.firmar, huella: sesion.huella, staff: null }
    t.configurarMfa = async auth => {
      const preparada = await request('/api/personal/mfa/preparar', {}, auth)
      assert.equal(preparada.status, 200, 'Preparar el autenticador por API')
      const secreto = preparada.body.secreto
      assert.equal(typeof secreto, 'string')
      const codigo = new TOTP({ secret: secreto }).generate()
      const confirmada = await request('/api/personal/mfa/confirmar', { codigo }, auth)
      assert.equal(confirmada.status, 200, 'Confirmar TOTP real por API')
      assert.equal(confirmada.body.fase, 'completa')
      assert.ok(confirmada.auth?.cookie && confirmada.auth?.csrf, 'La sesión completa procede de las cookies reales')
      return { auth: confirmada.auth, secretoMfa: secreto, codigos: confirmada.body.codigos }
    }
    t.crearPropietario = async ({ usuario = 'propietario.prueba', nombre = 'Propietario de pruebas', clave = 'El café de montaña abre temprano', demo = false } = {}) => {
      const acceso = await request('/api/auth/equipo/iniciar-propietario', { usuario, nombre, actual: env.CASA_SECRETO, nueva: clave, confirmacion: clave, demo, compartido: false, dispositivo: 'Fixture de propietario' }, null)
      assert.equal(acceso.status, 200, 'Bootstrap del propietario mediante la API pública')
      assert.equal(acceso.body.fase, 'configurar')
      assert.ok(acceso.auth)
      assert.equal((await request('/api/operacion/resumen', undefined, acceso.auth)).status, 403, 'El propietario incompleto no opera antes de MFA')
      const mfa = await t.configurarMfa(acceso.auth)
      const yo = await request('/api/personal/yo', undefined, mfa.auth)
      assert.equal(yo.status, 200)
      assert.equal(yo.body.permiso, 'propietario')
      return { id: yo.body.id, usuario, clave, demo, ...mfa }
    }
    t.activarInvitacion = async ({ usuario, invitacion, clave = 'Una taza tranquila antes del turno', demo = false, configurarMfa = true }) => {
      const activada = await request('/api/auth/equipo/activar', { usuario, invitacion, nueva: clave, confirmacion: clave, demo, compartido: false, dispositivo: 'Fixture de empleado' }, null)
      assert.equal(activada.status, 200, 'Activar invitación con contraseña elegida por el empleado')
      assert.ok(activada.auth)
      const authInicial = activada.auth
      let resultado = { auth: activada.auth, codigos: activada.body.codigos }
      if (activada.body.fase === 'configurar' && configurarMfa) resultado = await t.configurarMfa(activada.auth)
      const yo = await request('/api/personal/yo', undefined, resultado.auth)
      assert.equal(yo.status, 200)
      return { id: yo.body.id, usuario, clave, demo, fase: yo.body.fase, authInicial, ...resultado }
    }
    t.crearEmpleado = async ({ usuario = 'empleado.' + crypto.randomUUID().slice(0,8), nombre = 'Empleado de pruebas', permiso = 'caja', clave = 'Una taza tranquila antes del turno', demo = false, owner = t.staff, activar = true, configurarMfa = true } = {}) => {
      const invitada = await request('/api/personal/equipo', { usuario, nombre, permiso }, owner)
      assert.equal(invitada.status, 200, 'Crear invitación mediante el propietario autenticado')
      assert.equal(typeof invitada.body.invitacion, 'string')
      if (!activar) return { ...invitada.body, clave, demo }
      return { ...invitada.body, ...await t.activarInvitacion({ ...invitada.body, clave, demo, configurarMfa }) }
    }
    t.entrarEquipo = async (usuario, clave, demo = false) => request('/api/auth/equipo/entrar', { usuario, clave, demo, compartido: false, dispositivo: 'Fixture de reingreso' }, null)
    t.close = async () => { bases.delete(DATABASE_URL); await db.close() }
    if (propietario) { t.owner = await t.crearPropietario(); t.staff = t.owner.auth }
    return t
  } catch (e) { bases.delete(DATABASE_URL); await db.close(); throw e }
}
