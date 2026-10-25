// Preparación local únicamente. No despliega, ejecuta SQL ni modifica el árbol fuente.
// Requiere la copia del coordinador en .test-output/release-perfiles.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

const root = realpathSync(resolve(import.meta.dirname, '..'))
const esperado = resolve(root, '.test-output/release-perfiles')
const solicitado = resolve(root, process.env.RELEASE_DIR || '.test-output/release-perfiles')
assert.equal(solicitado.toLowerCase(), esperado.toLowerCase(), 'RELEASE_DIR debe ser exactamente .test-output/release-perfiles del proyecto')
assert.ok(existsSync(solicitado), 'El coordinador debe crear primero la copia de release')
const release = realpathSync(solicitado)
assert.equal(release.toLowerCase(), esperado.toLowerCase(), 'El release no puede ser un enlace a otro directorio')
assert.ok(lstatSync(release).isDirectory() && !lstatSync(release).isSymbolicLink())
const respaldo = join(root, 'entregables/correcciones-perfiles-2026-10-07/respaldo/src/worker')
const sha = s => createHash('sha256').update(s).digest('hex')
const leer = path => readFileSync(path, 'utf8').replaceAll('\r\n', '\n')

// Toda ruta de escritura o movimiento debe permanecer dentro del release,
// incluso al resolver ancestros que pudieran ser junctions de Windows.
function dentro(path) {
  const abs = resolve(path)
  assert.ok(abs.startsWith(release + sep), 'Ruta fuera del release: ' + abs)
  let existente = abs
  while (!existsSync(existente)) existente = dirname(existente)
  const real = realpathSync(existente)
  assert.ok(real === release || real.startsWith(release + sep), 'Ancestro enlazado fuera del release')
  return abs
}
function guardar(path, texto) {
  dentro(path)
  mkdirSync(dirname(path), { recursive: true })
  dentro(path)
  writeFileSync(path, texto, 'utf8')
}
function cambiar(texto, anterior, nuevo, etiqueta) {
  assert.equal(texto.split(anterior).length - 1, 1, 'Parche único esperado: ' + etiqueta)
  return texto.replace(anterior, nuevo)
}

const originales = new Map()
for (const file of readdirSync(join(root, 'src/worker'))) {
  const path = join(root, 'src/worker', file)
  if (lstatSync(path).isFile()) originales.set(file, sha(readFileSync(path)))
}
const inventario = [...new Set([...readdirSync(respaldo), ...originales.keys()])].sort().map(file => {
  const old = join(respaldo, file), actual = join(root, 'src/worker', file)
  const antes = existsSync(old) ? sha(readFileSync(old)) : null
  const ahora = existsSync(actual) ? sha(readFileSync(actual)) : null
  return { archivo: 'src/worker/' + file, estado: !antes ? 'agregado' : !ahora ? 'eliminado' : antes === ahora ? 'igual' : 'modificado', respaldoSha256: antes, actualSha256: ahora }
})

// Restaurar autenticación publicada y módulos cuyo permiso cambió en el otro chat.
const restaurados = ['index.ts','credenciales.ts','sesion.ts','clientes.ts','mostrador.ts','personal.ts','seguridad-personal.ts']
for (const file of restaurados) guardar(join(release, 'src/worker', file), leer(join(respaldo, file)))

// Conservar únicamente los módulos de corrección propios, sin arrastrar auth 020.
const conservados = ['cabeceras.ts','membresias.ts','validacion.ts','pedido-publico.ts','operacion.ts','panel.ts']
for (const file of conservados) {
  const contenido = leer(join(root, 'src/worker', file))
  assert.ok(!/from ['"]\.\/(?:equipo-sesion|acceso-equipo)['"]/.test(contenido), 'Dependencia inesperada de autenticación nueva: ' + file)
  guardar(join(release, 'src/worker', file), contenido)
}

let index = leer(join(release, 'src/worker/index.ts'))
index = cambiar(index, "import { registrarAtencion } from './atencion'", "import { registrarAtencion } from './atencion'\nimport { cabecerasSeguras } from './cabeceras'\nimport { plazasOcupadas } from './membresias'\nimport { fechaCalendario } from './validacion'", 'imports de correcciones')
index = cambiar(index, 'const app = new Hono<{ Bindings: Env; Variables: Vars }>()', "const app = new Hono<{ Bindings: Env; Variables: Vars }>()\napp.use('*', cabecerasSeguras)", 'cabeceras para respuestas directas')
index = cambiar(index, "  const [socios] = await sql`\n    SELECT count(*)::int AS n FROM operativo_membresia WHERE estado IN ('activa', 'en_gracia')`", '  const socios = await plazasOcupadas(c.env.DATABASE_URL)', 'cupos efectivos')
index = cambiar(index, "  const [socios] = await sql`SELECT count(*)::int AS n FROM operativo_membresia WHERE estado IN ('activa', 'en_gracia')`", '  const socios = await plazasOcupadas(c.env.DATABASE_URL)', 'panel anterior efectivo')
index = cambiar(index, "  const [bajas] = await sql`\n    SELECT count(*) FILTER (WHERE NOT autorenueva)::int AS salen, count(*)::int AS total\n    FROM operativo_membresia WHERE estado IN ('activa', 'en_gracia')`", '  const bajas = { salen: socios.salen, total: socios.n }', 'indicadores del panel anterior')
index = cambiar(index, "  const dia = c.req.query('dia') ?? new Date().toISOString().slice(0, 10)\n  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(dia)) return enCasa('Esa fecha no nos cuadra.')", "  const dia = c.req.query('dia') ?? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Managua', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())\n  if (!fechaCalendario(dia)) return enCasa('Esa fecha no nos cuadra.', 422)", 'calendario y día local')
const actual = leer(join(root, 'src/worker/index.ts'))
const inicio = actual.indexOf('/** Un fallo de un entorno no cancela el mantenimiento del otro. */')
const fin = actual.indexOf('app.onError(', inicio)
assert.ok(inicio >= 0 && fin > inicio, 'Sección actual de mantenimiento independiente disponible')
const mantenimiento = actual.slice(inicio, fin)
assert.ok(mantenimiento.includes('Promise.allSettled') && mantenimiento.includes('identidadBase') && mantenimiento.includes("entorno: 'real'"), 'El mantenimiento debe conservar aislamiento y logs por entorno')
assert.ok(!/equipo-sesion|acceso-equipo|PERSONAL_CREDENCIAL_SECRETO/.test(mantenimiento))
index = cambiar(index, 'app.onError((error) => {', mantenimiento + 'app.onError((error) => {', 'mantenimiento de real y demo')
index = cambiar(index, '    await mantenerMembresias(env)', '    await mantenerEntornos(env)', 'scheduled independiente')
assert.ok(!/equipo-sesion|acceso-equipo|PERSONAL_CREDENCIAL_SECRETO|PERSONAL_MFA_SECRETO/.test(index))
guardar(join(release, 'src/worker/index.ts'), index)

// O04 solo afecta nuevas altas; no altera credenciales ni filas históricas.
let personal = leer(join(release, 'src/worker/personal.ts'))
personal = cambiar(personal, "import { comprobarClave, guardarClave } from './credenciales'", "import { comprobarClave, guardarClave } from './credenciales'\nimport { nombrePersonalValido } from './validacion'", 'import del validador de nombres')
personal = cambiar(personal, "!r||typeof r.nombre!=='string'||r.nombre.trim().length<2||r.nombre.length>80||", '!r||!nombrePersonalValido(r.nombre)||', 'nombre antes de hash y SQL')
personal = cambiar(personal, 'const clave=crypto.randomUUID()+crypto.randomUUID()', "const clave=crypto.randomUUID().replaceAll('-','')", 'clave temporal aleatoria')
personal = cambiar(personal, 'INSERT INTO empleado(nombre,usuario,permiso,clave_huella) VALUES(${r.nombre.trim()},${r.usuario},${r.permiso},${firma}) ON CONFLICT(usuario) DO NOTHING RETURNING id', "INSERT INTO empleado(nombre,usuario,permiso,clave_huella,requiere_cambio,clave_temporal_vence) VALUES(${r.nombre.trim()},${r.usuario},${r.permiso},${firma},true,now()+interval '24 hours') ON CONFLICT(usuario) DO NOTHING RETURNING id,usuario,clave_temporal_vence", 'nueva alta temporal 24 h')
personal = cambiar(personal, 'SELECT id FROM nuevo`', 'SELECT id,usuario,clave_temporal_vence FROM nuevo`', 'respuesta del alta temporal')
personal = cambiar(personal, 'return c.json({id:nuevo.id,clave})', 'return c.json({id:nuevo.id,clave,usuario:nuevo.usuario,vence:nuevo.clave_temporal_vence})', 'contrato temporal de interfaz')
guardar(join(release, 'src/worker/personal.ts'), personal)

// Fuera de src: tsconfig incluye todos los TS de src aunque no se importen.
const excluidos = []
for (const file of ['acceso-equipo.ts','equipo-sesion.ts']) {
  const desde = dentro(join(release, 'src/worker', file))
  if (!existsSync(desde)) continue
  const destino = dentro(join(release, '.excluded/worker', file))
  mkdirSync(dirname(destino), { recursive: true })
  dentro(desde); dentro(destino)
  // Una repetición conserva el archivo ya archivado si es idéntico.
  if (existsSync(destino)) {
    assert.equal(sha(readFileSync(desde)), sha(readFileSync(destino)), 'Archivo excluido diferente; no sobrescribir')
    throw new Error('Ya existe una exclusión y su archivo original: recrear la copia de release')
  }
  renameSync(desde, destino)
  excluidos.push(relative(release, destino).replaceAll('\\', '/'))
}
for (const file of readdirSync(join(release, 'src/worker'))) {
  if (file.endsWith('.ts')) assert.ok(!/from ['"]\.\/(?:equipo-sesion|acceso-equipo)['"]/.test(leer(join(release, 'src/worker', file))), 'Import de auth nueva restante: ' + file)
}
for (const [file, hash] of originales) assert.equal(sha(readFileSync(join(root, 'src/worker', file))), hash, 'El árbol fuente debe permanecer intacto: ' + file)

const resultado = { fechaUTC: new Date().toISOString(), directorio: '.test-output/release-perfiles', autenticacion: 'publicada anterior a 020; nuevas altas temporales 24 h', restaurados, conservados, excluidos, migracionesEjecutadas: [], inventario, archivosRelease: [...new Set([...restaurados, ...conservados])].sort().map(file => ({ archivo: 'src/worker/' + file, sha256: sha(readFileSync(join(release, 'src/worker', file))) })) }
guardar(join(release, 'release-backend-manifest.json'), JSON.stringify(resultado, null, 2) + '\n')
console.log('Release de backend preparado; ninguna migración ni publicación ejecutada.')
console.log(JSON.stringify({ restaurados, conservados, excluidos, manifest: '.test-output/release-perfiles/release-backend-manifest.json' }))
