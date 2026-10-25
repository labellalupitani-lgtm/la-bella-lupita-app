// Servidor efímero de pruebas manuales: solo PGlite y cuentas sintéticas.
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, join, extname } from 'node:path'
import { createInterface } from 'node:readline'
import { preparar, root } from './soporte-perfiles-equipo.mjs'
const t = await preparar(), base = join(root, 'dist')
const diaPrueba=new Date(Date.now()-21600000+3*86400000).toISOString().slice(0,10)
const configuracion=(await t.request('/api/reservas/configuracion',undefined,null)).body
const vip=await t.request('/api/reserva',{zona:'vip',cuando:diaPrueba+'T12:00:00-06:00',personas:2,horas:2,referencia:crypto.randomUUID(),configuracion:configuracion.version})
if(vip.status!==200)throw Error('No se pudo preparar la visita sintética')
await t.db.query("UPDATE reserva SET cuando=now()-interval '30 minutes',termina=now()+interval '90 minutes',estado='llego' WHERE id=$1",[vip.body.reserva.id])
await t.db.query("UPDATE socio SET correo='reservas@example.invalid',correo_verificado=now() WHERE id=$1",[t.id])
t.env.ACCESO_CORREO='true';t.env.EMAIL_FROM='prueba@example.invalid'
t.env.EMAIL={send:async m=>{console.log('Código sintético de acceso: '+m.text.match(/\b\d{6}\b/)?.[0]);return{messageId:'simulado-'+crypto.randomUUID()}}}
let cola = Promise.resolve(), modo = 'normal', inyectar = true
const server = createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      const chunks = []; for await (const c of req) chunks.push(c)
      if (req.method === 'POST' && req.url === '/api/reserva' && modo === 'malformada') { res.writeHead(200, { 'content-type': 'application/json' }); res.end('{}'); return }
      if (req.url.startsWith('/api/reservas/disponibilidad') && modo === 'ocupacion-error') { res.writeHead(503, { 'content-type': 'application/json' }); res.end('{"error":"No se pudo consultar la agenda de prueba."}'); return }
      const tarea = cola.then(() => t.worker.app.request('http://' + req.headers.host + req.url, { method: req.method, headers: req.headers, ...(req.method === 'POST' ? { body: Buffer.concat(chunks) } : {}) }, t.env, t.ctx))
      cola = tarea.catch(() => {}); const r = await tarea
      const headers = Object.fromEntries(r.headers); if(r.headers.getSetCookie().length)headers['set-cookie']=r.headers.getSetCookie()
      res.writeHead(r.status, headers); res.end(Buffer.from(await r.arrayBuffer()))
    } else {
      let file = resolve(base, '.' + new URL(req.url, 'http://localhost').pathname)
      if (!file.startsWith(base + '\\') || !existsSync(file) || !extname(file)) file = join(base, 'index.html')
      if (new URL(req.url, 'http://localhost').pathname === '/reservar') file = join(base, 'reservar.html')
      const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml' }
      let contenido = readFileSync(file)
      if (extname(file) === '.html' && inyectar) contenido = Buffer.from(contenido.toString().replace('<head>', `<head><script>if(!sessionStorage.getItem('reserva-fixture')){localStorage.setItem('club-lupita:sesion',${JSON.stringify(t.token)});sessionStorage.setItem('reserva-fixture','1')}</script>`))
      const cabeceras={ 'content-type': mime[extname(file)] ?? 'application/octet-stream', 'cache-control': extname(file)==='.html'?'no-store':'public, max-age=0, must-revalidate' }
      if(req.url==='/personal?prueba=equipo')cabeceras['set-cookie']=t.staff.cookie.split('; ').map(c=>c+'; Path=/; Secure; SameSite=Strict'+(c.startsWith('__Host-lupita-equipo=')?'; HttpOnly':''))
      res.writeHead(200, cabeceras); res.end(contenido)
    }
  } catch { res.writeHead(500); res.end('Error del entorno aislado') }
})
server.listen(4189, '127.0.0.1', () => console.log('Prueba local: http://localhost:4189/reservar · datos sintéticos. Comandos: estado, normal, malformada, ocupacion-error, publico, privado.'))
createInterface({ input: process.stdin }).on('line', async l => {
  if (['normal', 'malformada', 'ocupacion-error'].includes(l)) { modo = l; console.log('Modo: ' + modo) }
  if (l === 'publico') { inyectar = false; console.log('Páginas sin inyección de acceso.') }
  if (l === 'privado') { inyectar = true; console.log('Acceso sintético habilitado.') }
  if (l === 'estado') console.log(JSON.stringify((await t.db.query('SELECT id,zona,personas,estado,version FROM reserva ORDER BY creada')).rows))
  if (l === 'saldo-cero') { const {rows:[saldo]}=await t.db.query('SELECT total FROM saldo_de($1)',[t.id]);if(saldo.total>0)await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto) VALUES($1,$2,'consumo','Escenario sintético sin saldo')",[t.id,-saldo.total]);console.log('Cuenta sintética sin saldo.') }
})
process.on('SIGINT', async () => { server.close(); await t.close(); process.exit(0) })
