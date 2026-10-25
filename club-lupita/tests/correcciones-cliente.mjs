import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

// Prueba pura: compila solo el cliente en memoria. Sin worker, dist, base ni red.
const root = resolve(import.meta.dirname, '..')
const out = process.env.TEST_OUTPUT_DIR || join(root, 'entregables/correcciones-perfiles-2026-10-07/evidencia/cliente-unitario')
mkdirSync(out, { recursive: true })
const compilado = await build({ stdin: { contents: "export {api,cordobas,sesion} from './src/casa/datos.tsx'; export {operacion,TOKEN_PERSONAL} from './src/casa/operacion.ts'; export {pedirJSON,LIMITE_PETICION} from './src/casa/http.ts';", resolveDir: root, loader: 'tsx' },
  bundle: true, platform: 'node', format: 'esm', write: false, define: { 'process.env.NODE_ENV': '"production"' } })
const cliente = await import('data:text/javascript;base64,' + Buffer.from(compilado.outputFiles[0].text).toString('base64'))
class Almacen {
  valores = new Map()
  getItem(k) { return this.valores.get(k) ?? null }
  setItem(k, v) { this.valores.set(k, String(v)) }
  removeItem(k) { this.valores.delete(k) }
  clear() { this.valores.clear() }
}
const originales = Object.fromEntries(['window', 'document', 'localStorage', 'sessionStorage', 'fetch', 'setTimeout', 'clearTimeout'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]))
const definir = (k, value) => Object.defineProperty(globalThis, k, { configurable: true, writable: true, value })
definir('window', new EventTarget())
definir('document', { cookie: '__Host-lupita-equipo-csrf=csrf-sintetico' })
definir('localStorage', new Almacen())
definir('sessionStorage', new Almacen())
const results = []
const respuesta = (status, body = { error: 'Fallo controlado' }) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const guardar = () => writeFileSync(join(out, 'resultados.json'), JSON.stringify({ entorno: 'cliente compilado en memoria, transporte simulado sin red', results }, null, 2))
async function caso(nombre, trabajo) {
  try { await trabajo(); results.push({ nombre, estado: 'APROBADO' }); console.log('PASA ' + nombre) }
  catch (e) { results.push({ nombre, estado: 'FALLO', error: e.message }); console.log('FALLO ' + nombre + ': ' + e.message) }
  finally { guardar() }
}
try {
  await caso('Importes enteros, centavos, negativos y límites de recarga', () => {
    for (const [n, esperado] of [[0, 'C$ 0'], [20000, 'C$ 200'], [20049, 'C$ 200.49'], [20050, 'C$ 200.50'], [-20049, '−C$ 200.49'], [1, 'C$ 0.01'], [300000, 'C$ 3,000']]) assert.equal(cliente.cordobas(n), esperado)
  })
  await caso('401 perfil por api limpia cliente y preserva almacenamiento del equipo', async () => {
    cliente.sesion.guardar('cliente-vigente')
    sessionStorage.setItem('club-lupita:personal', 'equipo-vigente')
    definir('fetch', async () => respuesta(401))
    const r = await cliente.api.guardarPerfil({ nombre: 'Prueba', bebida_siempre: '', alergias: '', cumple: '' })
    assert.equal(r.codigo, 401); assert.equal(cliente.sesion.leer(), null)
    assert.equal(sessionStorage.getItem('club-lupita:personal'), 'equipo-vigente')
  })
  await caso('401 compras por operacion limpia cliente', async () => {
    cliente.sesion.guardar('cliente-vigente')
    definir('fetch', async () => respuesta(401))
    await assert.rejects(cliente.operacion('/compras?pagina=0'), e => e.status === 401)
    assert.equal(cliente.sesion.leer(), null)
  })
  await caso('401 de personal no elimina cliente', async () => {
    cliente.sesion.guardar('cliente-vigente')
    let notificacion
    const recibir = e => { notificacion = e.detail }
    window.addEventListener('personal:sesion-caducada', recibir)
    definir('fetch', async () => respuesta(401))
    await assert.rejects(cliente.operacion('/personal/yo', undefined, 'equipo-vigente'), e => e.status === 401)
    assert.equal(cliente.sesion.leer(), 'cliente-vigente'); assert.equal(notificacion, 'equipo-vigente')
    window.removeEventListener('personal:sesion-caducada', recibir)
  })
  await caso('Sesión de equipo por cookie envía credenciales y CSRF sin Bearer del cliente', async () => {
    cliente.sesion.guardar('cliente-vigente')
    let peticion
    definir('fetch', async (_url, init) => { peticion = init; return respuesta(200, { guardado: true }) })
    await cliente.operacion('/personal/equipo/crear', { nombre: 'Prueba local' }, cliente.TOKEN_PERSONAL)
    assert.equal(peticion.credentials, 'same-origin')
    assert.equal(peticion.headers.authorization, undefined)
    assert.equal(peticion.headers['x-equipo-solicitud'], '1')
    assert.equal(peticion.headers['x-equipo-csrf'], 'csrf-sintetico')
    assert.equal(cliente.sesion.leer(), 'cliente-vigente')
    await cliente.operacion('/auth/equipo/entrar', { usuario: 'prueba' })
    assert.equal(peticion.headers.authorization, undefined)
    assert.equal(peticion.headers['x-equipo-csrf'], 'csrf-sintetico')
    await cliente.operacion('/compras?pagina=0')
    assert.equal(peticion.headers.authorization, 'Bearer cliente-vigente')
    assert.equal(peticion.headers['x-equipo-csrf'], undefined)
  })
  await caso('401 de cookie de equipo emite solo su evento y conserva cliente', async () => {
    cliente.sesion.guardar('cliente-vigente')
    const eventos = []
    const recibir = e => eventos.push(e.detail)
    window.addEventListener('personal:sesion-caducada', recibir)
    try {
      definir('fetch', async () => respuesta(401))
      await assert.rejects(cliente.operacion('/personal/yo', undefined, cliente.TOKEN_PERSONAL), e => e.status === 401)
      assert.deepEqual(eventos, [cliente.TOKEN_PERSONAL])
      assert.equal(cliente.sesion.leer(), 'cliente-vigente')
      assert.equal(document.cookie, '__Host-lupita-equipo-csrf=csrf-sintetico')
      await assert.rejects(cliente.operacion('/auth/equipo/entrar', { usuario: 'prueba' }), e => e.status === 401)
      assert.deepEqual(eventos, [cliente.TOKEN_PERSONAL])
      assert.equal(cliente.sesion.leer(), 'cliente-vigente')
    } finally { window.removeEventListener('personal:sesion-caducada', recibir) }
  })
  await caso('Respuesta antigua del equipo no repuebla datos de otra persona', async () => {
    let terminar
    document.cookie='__Host-lupita-equipo-csrf=persona-anterior'
    definir('fetch',()=>new Promise(resolve=>{terminar=resolve}))
    const p=cliente.operacion('/personal/yo',undefined,cliente.TOKEN_PERSONAL)
    document.cookie='__Host-lupita-equipo-csrf=persona-nueva'
    terminar(respuesta(200,{nombre:'Anterior'}))
    await assert.rejects(p,/acceso cambió/)
    document.cookie='__Host-lupita-equipo-csrf=csrf-sintetico'
  })
  await caso('401 antiguo del equipo no invalida a la siguiente persona', async () => {
    let terminar;const eventos=[];const recibir=e=>eventos.push(e.detail)
    window.addEventListener('personal:sesion-caducada',recibir)
    try{
      document.cookie='__Host-lupita-equipo-csrf=persona-anterior'
      definir('fetch',()=>new Promise(resolve=>{terminar=resolve}))
      const p=cliente.operacion('/personal/yo',undefined,cliente.TOKEN_PERSONAL)
      document.cookie='__Host-lupita-equipo-csrf=persona-nueva'
      terminar(respuesta(401));await assert.rejects(p,e=>e.status===401);assert.deepEqual(eventos,[])
    }finally{document.cookie='__Host-lupita-equipo-csrf=csrf-sintetico';window.removeEventListener('personal:sesion-caducada',recibir)}
  })
  await caso('403 y 500 conservan cliente; fallo de autenticación no revoca sesión existente', async () => {
    for (const status of [403, 500]) {
      cliente.sesion.guardar('cliente-vigente'); definir('fetch', async () => respuesta(status))
      const r = await cliente.api.yo(); assert.equal(r.codigo, status); assert.equal(cliente.sesion.leer(), 'cliente-vigente')
    }
    definir('fetch', async () => respuesta(401))
    await assert.rejects(cliente.operacion('/auth/correo/verificar', { codigo: '123456' }), e => e.status === 401)
    assert.equal(cliente.sesion.leer(), 'cliente-vigente')
  })
  await caso('401 retrasado de cuenta anterior no cierra la cuenta nueva', async () => {
    cliente.sesion.guardar('cuenta-anterior')
    let terminar
    definir('fetch', () => new Promise(resolve => { terminar = resolve }))
    const eventos = []
    const recibir = e => eventos.push(e.detail)
    window.addEventListener('personal:sesion-caducada', recibir)
    try {
      const pendiente = cliente.api.yo()
      cliente.sesion.guardar('cuenta-nueva')
      terminar(respuesta(401))
      const r = await pendiente
      assert.equal(r.ok, false); assert.equal(r.codigo, 409); assert.equal(cliente.sesion.leer(), 'cuenta-nueva')
      assert.deepEqual(eventos, [])
      assert.equal(document.cookie, '__Host-lupita-equipo-csrf=csrf-sintetico')
    } finally { window.removeEventListener('personal:sesion-caducada', recibir) }
  })
  await caso('Cambiar cuenta mientras se lee el cuerpo de un 401 descarta el resultado anterior', async () => {
    cliente.sesion.guardar('cuenta-anterior')
    let terminar, cuerpoIniciado
    const leyendo = new Promise(resolve => { cuerpoIniciado = resolve })
    definir('fetch', async () => ({ status: 401, ok: false, json: () => { cuerpoIniciado(); return new Promise(resolve => { terminar = resolve }) } }))
    const pendiente = cliente.api.yo()
    await leyendo
    assert.equal(cliente.sesion.leer(), null)
    cliente.sesion.guardar('cuenta-nueva')
    terminar({ error: 'Sesión anterior vencida' })
    const r = await pendiente
    assert.equal(r.codigo, 409); assert.equal(cliente.sesion.leer(), 'cuenta-nueva')
  })
  await caso('200 retrasado de compras no aplica datos de la cuenta anterior', async () => {
    cliente.sesion.guardar('cuenta-anterior')
    let terminar
    definir('fetch', () => new Promise(resolve => { terminar = resolve }))
    const pendiente = cliente.operacion('/compras?pagina=0')
    cliente.sesion.guardar('cuenta-nueva')
    terminar(respuesta(200, { compras: [{ dato: 'anterior' }] }))
    await assert.rejects(pendiente, e => e.status === 409)
    assert.equal(cliente.sesion.leer(), 'cuenta-nueva')
  })
  await caso('Respuesta de escritura perdida se considera incierta', async () => {
    cliente.sesion.guardar('cliente-vigente')
    definir('fetch', async () => { throw new TypeError('Respuesta perdida de la red') })
    const r = await cliente.api.cobrarPedido([{ id: 'latte', cuanto: 1 }], 'referencia-persistente')
    assert.equal(r.ok, false); assert.equal(r.resultadoIncierto, true); assert.match(r.error, /no pudimos confirmar/i)
  })
  await caso('JSON roto al escribir no se confirma como éxito', async () => {
    definir('fetch', async () => new Response('{roto', { status: 200 }))
    const r = await cliente.api.cobrarPedido([{ id: 'latte', cuanto: 1 }], 'referencia-persistente')
    assert.equal(r.ok, false); assert.equal(r.resultadoIncierto, true)
  })
  await caso('Respuesta incompleta o error 500 al escribir conserva el resultado incierto', async () => {
    for (const [status, body] of [[200, { saldo: {} }], [500, { error: 'No se confirmó la operación' }]]) {
      definir('fetch', async () => respuesta(status, body))
      const r = await cliente.api.cobrarPedido([{ id: 'latte', cuanto: 1 }], 'referencia-persistente')
      assert.equal(r.ok, false); assert.equal(r.resultadoIncierto, true)
    }
  })
  await caso('Timeout de consulta recuperable y timeout de escritura incierto', async () => {
    let vencer
    const timeoutReal = originales.setTimeout.value, clearReal = originales.clearTimeout.value
    definir('setTimeout', (fn, ms, ...args) => ms === cliente.LIMITE_PETICION ? (vencer = fn, -987) : timeoutReal(fn, ms, ...args))
    definir('clearTimeout', id => { if (id !== -987) clearReal(id) })
    try {
      definir('fetch', (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('Plazo agotado', 'AbortError')), { once: true })))
      const lectura = cliente.api.yo(); vencer(); const r = await lectura
      assert.equal(r.codigo, 408); assert.equal(r.resultadoIncierto, false)
      const escritura = cliente.api.cobrarPedido([{ id: 'latte', cuanto: 1 }], 'referencia-persistente'); vencer(); const w = await escritura
      assert.equal(w.codigo, 408); assert.equal(w.resultadoIncierto, true)
    } finally { definir('setTimeout', timeoutReal); definir('clearTimeout', clearReal) }
  })
  await caso('Cancelación externa de lectura no revoca una sesión válida', async () => {
    const c = new AbortController()
    definir('fetch', (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('Cancelada', 'AbortError')), { once: true })))
    const p = cliente.operacion('/compras', undefined, undefined, {}, c.signal)
    c.abort(); await assert.rejects(p, e => e.name === 'AbortError')
    assert.equal(cliente.sesion.leer(), 'cliente-vigente')
  })
  await caso('Cancelación externa de escritura conserva la incertidumbre del resultado', async () => {
    const c = new AbortController()
    definir('fetch', (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('Cancelada', 'AbortError')), { once: true })))
    const p = cliente.operacion('/cuenta/cobrar', { lineas: [{ id: 'latte', cuanto: 1 }], ref: 'referencia-persistente' }, undefined, {}, c.signal)
    c.abort(); await assert.rejects(p, e => e.resultadoIncierto === true)
    assert.equal(cliente.sesion.leer(), 'cliente-vigente')
  })
} finally {
  for (const [k, descriptor] of Object.entries(originales)) descriptor ? Object.defineProperty(globalThis, k, descriptor) : delete globalThis[k]
  guardar()
}
process.exitCode = results.some(r => r.estado === 'FALLO') ? 1 : 0
