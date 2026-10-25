/**
 * Vista previa del proyecto real con Worker real y PGlite en memoria.
 * No lee .env, .dev.vars, Wrangler ni credenciales. No hay proxy remoto.
 * Uso: node scripts/vista-previa-diseno.mjs [--port 5188] [--dist ruta] [--equipo]
 * --dist permite comparar una compilación anterior con los mismos datos.
 * --equipo añade /__preview con cliente, visitante y cuatro perfiles sintéticos.
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, relative, extname, join, sep } from 'node:path'
import { TOTP } from 'otpauth'
import { preparar, root } from '../tests/soporte-perfiles-equipo.mjs'

const args = process.argv.slice(2)
const equipo = args.includes('--equipo')
const experiencia = args.includes('--experiencia')
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback
const port = Number(option('--port', '5188'))
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error('Puerto local inválido')
const dist = option('--dist', null)
const base = dist ? resolve(root, dist) : null
if (base && !(await stat(join(base, 'index.html'))).isFile()) throw Error('La compilación no contiene index.html')

const fixture = await preparar({ propietario: false, telefono: '50500000001' })
await fixture.db.query('UPDATE socio SET nombre=$2 WHERE id=$1', [fixture.id, 'Vista previa'])
await fixture.db.exec("UPDATE membresia SET hasta=now()+interval '20 days',estado='activa',autorenueva=false")
if (experiencia) {
  // Escenario editorial exclusivamente sintético; no cambia semillas ni datos reales.
  const { fichaPrueba } = await import('../tests/tienda-fixture.mjs')
  const fechaPrueba = dias => new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10)
  await fixture.db.query('UPDATE tienda_lote SET ficha=$1::jsonb', [JSON.stringify({ ...fichaPrueba, nombre: 'Reserva de Cosecha', presentacion: 'Grano entero · prueba', origen: 'Finca de muestra', proceso: 'Lavado · dato de prueba', perfil: 'Cacao y caramelo · descripción de prueba', retiroDesde: fechaPrueba(7), retiroHasta: fechaPrueba(14), lugar: 'Mostrador de prueba', foto: '', fotoAlt: '' })])
  await fixture.db.query("UPDATE socio SET nombre='Lucía de prueba',bebida_siempre='Café con leche',alergias='',correo='lucia@example.test',correo_verificado=now() WHERE id=$1", [fixture.id])
}
// Defensa independiente: cualquier servicio que intente usar fetch queda bloqueado.
globalThis.fetch = async () => { throw Error('Red externa bloqueada en la vista previa de diseño') }

const perfilesEquipo = Object.freeze({ propietario: 'Propietario', encargado: 'Encargado', caja: 'Caja', cocina: 'Cocina' })
const cuentasEquipo = new Map()
if (equipo) {
  // Las personas se crean una sola vez en esta PGlite. No se importa ningún acceso real.
  const owner = await fixture.crearPropietario({ usuario: 'preview.propietario', nombre: 'Propietario de prueba' })
  fixture.staff = owner.auth
  cuentasEquipo.set('propietario', owner)
  for (const rol of ['encargado', 'caja', 'cocina']) {
    cuentasEquipo.set(rol, await fixture.crearEmpleado({ usuario: 'preview.' + rol, nombre: perfilesEquipo[rol] + ' de prueba', permiso: rol }))
  }
}

const abrirEquipo = async rol => {
  const persona = cuentasEquipo.get(rol)
  if (!persona) throw Error('Perfil de prueba no disponible')
  // Reingresar por la API renueva las sesiones vencidas, cerradas o bloqueadas.
  let entrada = await fixture.entrarEquipo(persona.usuario, persona.clave)
  if (entrada.status !== 200 || !entrada.auth) throw Error('No se pudo abrir el perfil sintético')
  if (entrada.body.fase === 'mfa') {
    if (!persona.secretoMfa) throw Error('Autenticador sintético no disponible')
    // Igual que tests/acceso-equipo.mjs: reloj de la fixture, exclusivamente en memoria.
    // Permite alternar perfiles dentro de los mismos 30 s sin esperar otra ventana TOTP.
    await fixture.db.query('UPDATE empleado SET mfa_ultimo=-1 WHERE id=$1', [persona.id])
    entrada = await fixture.request('/api/personal/mfa/verificar', { codigo: new TOTP({ secret: persona.secretoMfa }).generate() }, entrada.auth)
  }
  if (entrada.status !== 200 || !entrada.auth || entrada.body.fase !== 'completa') throw Error('El perfil sintético no completó su acceso')
  const yo = await fixture.request('/api/personal/yo', undefined, entrada.auth)
  if (yo.status !== 200 || yo.body.id !== persona.id || yo.body.permiso !== rol || yo.body.bloqueada) throw Error('El perfil sintético cambió durante la prueba')
  // Conservar los atributos originales; los valores y las cookies los emite el Worker.
  return entrada.headers.getSetCookie()
}

const origin = `http://127.0.0.1:${port}`
let queue = Promise.resolve()
const serial = fn => {
  const next = queue.then(fn)
  queue = next.catch(() => {})
  return next
}
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self' ws://127.0.0.1:*; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
const styles = `#preview-notice{position:relative;z-index:9999;background:#53291e;color:#fff6ec;padding:7px 12px;text-align:center;font:600 11px/1.5 Arial,sans-serif;letter-spacing:.02em}#preview-notice a{color:inherit;text-decoration:underline;margin-left:8px}#preview-outbound{position:fixed;z-index:10000;bottom:90px;left:50%;transform:translateX(-50%);width:min(90vw,420px);padding:16px;background:#53291e;color:white;border-radius:12px;box-shadow:0 6px 24px #0003;font:14px/1.5 Arial,sans-serif}`
const guard = `document.addEventListener('click',function(e){const a=e.target.closest&&e.target.closest('a[href]');if(!a)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin){e.preventDefault();e.stopImmediatePropagation();let n=document.getElementById('preview-outbound');if(!n){n=document.createElement('div');n.id='preview-outbound';n.setAttribute('role','status');document.body.append(n)}n.textContent='Vista previa: los enlaces externos están desactivados. No se envió ninguna solicitud al negocio.';setTimeout(()=>n.remove(),6000)}},true);`
const decorate = html => html.replace('</head>', `<style>${styles}</style></head>`).replace('<body>', `<body><aside id="preview-notice" aria-label="Entorno de prueba">VISTA PREVIA LOCAL · Datos de prueba · Sin operaciones reales${equipo ? '<a href="/__preview">Volver al selector</a>' : '<a href="/__preview/entrar">Reabrir cuenta</a>'}</aside><script>${guard}</script>`)
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.avif': 'image/avif', '.json': 'application/json' }
const destinosPublicos = new Set(['/', '/pedir', '/reservar', '/conoce-tu-club'])
const cookieVisitante = '__Host-lupita-preview-visitante'
const borrarCookie = (nombre, httpOnly = true) => `${nombre}=; Max-Age=0; Path=/; Secure; SameSite=Strict${httpOnly ? '; HttpOnly' : ''}`
const borrarCliente = () => [borrarCookie('__Host-lupita-cliente'), borrarCookie('__Host-lupita-cliente-csrf', false)]
const borrarEquipo = () => [borrarCookie('__Host-lupita-equipo'), borrarCookie('__Host-lupita-equipo-csrf', false)]
const esVisitante = req => req.headers.cookie?.split(';').some(item => item.trim() === cookieVisitante + '=1')
const parametroUnico = (url, nombre) => [...url.searchParams.keys()].every(key => key === nombre) && url.searchParams.getAll(nombre).length <= 1
// Todo el contenido y los destinos son constantes locales; no se interpolan datos de la URL.
const selector = () => decorate(`<!doctype html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Vista previa local · La Bella Lupita</title></head><body><main><h1>Elegí una vista de prueba</h1><p>Datos de prueba. Estas cuentas sintéticas viven únicamente en memoria y no realizan operaciones reales.</p><nav aria-label="Vistas de cliente y visitante"><h2>Cliente y visitante</h2><ul><li><a href="/__preview/entrar">Inicio cliente</a></li><li><a href="/__preview/publico?destino=%2F">Visitante · Inicio</a></li><li><a href="/__preview/publico?destino=%2Fpedir">Visitante · Carta pública</a></li><li><a href="/__preview/publico?destino=%2Freservar">Visitante · Reservar</a></li><li><a href="/__preview/publico?destino=%2Fconoce-tu-club">Visitante · Conocé tu club</a></li></ul></nav><nav aria-label="Perfiles sintéticos del equipo"><h2>Equipo</h2><ul>${Object.entries(perfilesEquipo).map(([rol, nombre]) => `<li><a href="/__preview/equipo?rol=${rol}">${nombre}</a></li>`).join('')}</ul></nav><p>Al elegir un perfil del equipo se abre una sesión nueva de prueba; podés volver aquí después de bloquearla o cerrarla.</p></main></body></html>`)

let vite
const server = createServer(async (req, res) => {
  const setHeader = res.setHeader.bind(res)
  res.setHeader = (name, value) => setHeader(name, name.toLowerCase() === 'cache-control' ? 'no-store' : value)
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Security-Policy', csp)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  try {
    // Vite does not expose an API proxy. The only API is the in-memory Worker.
    const url = new URL(req.url, origin)
    if (req.headers.host !== `127.0.0.1:${port}` && req.headers.host !== `localhost:${port}`) {
      res.writeHead(403); res.end('Host no permitido'); return
    }
    if (equipo && (url.pathname === '/__preview' || url.pathname.startsWith('/__preview/'))) {
      if (req.method !== 'GET') { res.writeHead(405, { Allow: 'GET' }); res.end('Método no permitido'); return }
      const localOrigin = `http://${req.headers.host}`
      if ((req.headers.origin && req.headers.origin !== localOrigin) || req.headers['sec-fetch-site'] === 'cross-site') {
        res.writeHead(403); res.end('Abrí el selector desde la vista previa local'); return
      }
      if (url.pathname === '/__preview') {
        if (url.search) { res.writeHead(400); res.end('El selector no acepta parámetros'); return }
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(selector()); return
      }
      if (url.pathname === '/__preview/equipo') {
        const rol = url.searchParams.get('rol')
        if (!parametroUnico(url, 'rol') || !cuentasEquipo.has(rol)) { res.writeHead(400); res.end('Perfil de prueba inválido'); return }
        const cookies = await serial(() => abrirEquipo(rol))
        res.setHeader('Set-Cookie', [...cookies, ...borrarCliente(), borrarCookie(cookieVisitante)])
        res.writeHead(302, { location: '/personal' }); res.end(); return
      }
      if (url.pathname === '/__preview/publico') {
        const destino = url.searchParams.get('destino') ?? '/'
        if (!parametroUnico(url, 'destino') || !destinosPublicos.has(destino)) { res.writeHead(400); res.end('Destino público inválido'); return }
        res.setHeader('Set-Cookie', [...borrarCliente(), ...borrarEquipo(), `${cookieVisitante}=1; Max-Age=43200; Path=/; Secure; HttpOnly; SameSite=Strict`])
        res.writeHead(302, { location: destino }); res.end(); return
      }
      if (!['/__preview/status', '/__preview/entrar'].includes(url.pathname)) { res.writeHead(404); res.end('Vista de prueba no encontrada'); return }
      if (url.search) { res.writeHead(400); res.end('Esta vista no acepta parámetros'); return }
    }
    if (url.pathname === '/__preview/status') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ preview: true, storage: 'PGlite en memoria', outbound: 'bloqueado', frontend: base ? 'compilación' : 'Vite local', credentials: 'sintéticas', escenario: experiencia ? 'experiencia sintética' : 'base', ...(equipo ? { equipo: true, roles: Object.keys(perfilesEquipo), perfiles: ['cliente', 'visitante', ...Object.keys(perfilesEquipo)] } : {}) })); return
    }
    if (url.pathname === '/__preview/entrar') {
      const token = await fixture.firmar(fixture.env.SESION_SECRETO, { tel: fixture.tel, rol: 'socio', exp: Date.now() + 3600_000 })
      const response = await serial(() => fixture.worker.app.request(origin + '/api/auth/sesion/migrar', { method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-cliente-solicitud': '1', authorization: 'Bearer ' + token }, body: '{}' }, fixture.env, fixture.ctx))
      if (!response.ok) throw Error('No se pudo abrir la cuenta sintética')
      res.setHeader('Set-Cookie', [...response.headers.getSetCookie(), ...(equipo ? [...borrarEquipo(), borrarCookie(cookieVisitante)] : [])])
      res.writeHead(302, { location: '/' }); res.end(); return
    }
    if (url.pathname.startsWith('/api/')) {
      const chunks = []; let size = 0
      for await (const chunk of req) { size += chunk.length; if (size > 512 * 1024) throw Error('Solicitud demasiado grande'); chunks.push(chunk) }
      const response = await serial(() => fixture.worker.app.request(origin + url.pathname + url.search, { method: req.method, headers: req.headers, ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}) }, fixture.env, fixture.ctx))
      const headers = Object.fromEntries(response.headers)
      headers['cache-control'] = 'no-store'; headers['content-security-policy'] = csp
      if (response.headers.getSetCookie().length) headers['set-cookie'] = response.headers.getSetCookie()
      let body = Buffer.from(await response.arrayBuffer())
      // Aclara únicamente la presentación de un movimiento sintético. El libro
      // mayor sigue inmutable y conserva sus importes y registros originales.
      if (experiencia && req.method === 'GET' && response.ok && ['/api/yo', '/api/actividad'].includes(url.pathname)) {
        const datos = JSON.parse(body.toString())
        if (Array.isArray(datos.movimientos)) datos.movimientos = datos.movimientos.map(m => m.concepto === 'Historial de puntos' ? { ...m, concepto: 'Consumo en la casa · prueba' } : m)
        body = Buffer.from(JSON.stringify(datos))
        delete headers['content-length']
      }
      res.writeHead(response.status, headers); res.end(body); return
    }
    const isDocument = req.headers.accept?.includes('text/html') && !extname(url.pathname)
    const entradaEquipo = equipo && (url.pathname === '/personal' || url.pathname.startsWith('/personal/'))
    if (isDocument && !req.headers.cookie?.includes('__Host-lupita-cliente=') && !entradaEquipo && !(equipo && esVisitante(req))) {
      res.writeHead(302, { location: '/__preview/entrar' }); res.end(); return
    }
    if (base) {
      const file = resolve(base, '.' + decodeURIComponent(url.pathname))
      const rel = relative(base, file)
      if (rel.startsWith('..' + sep) || rel === '..') { res.writeHead(403); res.end(); return }
      let actual = file
      if (!extname(file)) actual = join(base, 'index.html')
      let body
      try { body = await readFile(actual) } catch { res.writeHead(404); res.end('Recurso no encontrado'); return }
      const type = extname(actual)
      res.setHeader('Content-Type', mime[type] ?? 'application/octet-stream')
      res.end(type === '.html' ? decorate(body.toString()) : body); return
    }
    vite.middlewares(req, res, () => { res.writeHead(404); res.end('Recurso no encontrado') })
  } catch (error) {
    console.error('Vista previa:', error.message)
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'No se pudo completar la operación local.' }))
  }
})

if (!base) {
  const { createServer: createVite } = await import('vite')
  const { default: react } = await import('@vitejs/plugin-react')
  vite = await createVite({ root, configFile: false, envFile: false, plugins: [react(), { name: 'notice-preview', transformIndexHtml: decorate }], server: { middlewareMode: true, hmr: { server }, watch: { ignored: ['**/.test-output/**'] } }, appType: 'spa' })
}
await new Promise((accept, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', accept) })
console.log(`Vista previa aislada disponible en ${origin}`)
console.log('Datos sintéticos en memoria; red externa bloqueada; sin credenciales ni env de producción.')
const close = async () => { await vite?.close(); await new Promise(r => server.close(r)); await fixture.close(); process.exit(0) }
process.on('SIGINT', close); process.on('SIGTERM', close)
