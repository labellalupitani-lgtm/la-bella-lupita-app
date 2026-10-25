import assert from 'node:assert/strict'
import { chromium, firefox } from 'playwright'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { vistaAislada } from './soporte-ui.mjs'

// Auditoría local. No lee credenciales ni permite tráfico a servicios externos.
const t = await vistaAislada()
const out = process.env.TEST_OUTPUT_DIR || join(import.meta.dirname, '../entregables/auditoria-perfiles-2026-10-07/evidencia/perfiles-ui')
mkdirSync(out, { recursive: true })
const browser = await (process.env.NAVEGADOR === 'firefox' ? firefox.launch({ headless: true }) : chromium.launch({ channel: 'msedge', headless: true }))
const axeSource = readFileSync(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8')
const results = [], screens = [], errors = [], sessions = {}, credentials = {}
const sections = {
  propietario: ['Resumen', 'Pedidos', 'Caja', 'Entregas', 'Agenda', 'Atención', 'Informes', 'Clientes', 'Equipo y permisos', 'Cuenta y seguridad'],
  encargado: ['Resumen', 'Pedidos', 'Caja', 'Entregas', 'Agenda', 'Atención', 'Informes', 'Clientes', 'Equipo y permisos', 'Cuenta y seguridad'],
  caja: ['Pedidos', 'Caja', 'Entregas', 'Agenda', 'Atención', 'Cuenta y seguridad'],
  cocina: ['Pedidos', 'Cuenta y seguridad'],
}
const initial = { propietario: 'Resumen', encargado: 'Resumen', caja: 'Caja', cocina: 'Pedidos' }
async function check(name, fn) {
  const start = Date.now()
  try { await fn(); results.push({ name, estado: 'APROBADO', ms: Date.now() - start }); console.log('PASA ' + name) }
  catch (e) { results.push({ name, estado: 'FALLO', error: e.message, ms: Date.now() - start }); console.log('FALLO ' + name + ': ' + e.message.slice(0, 250)) }
  writeFileSync(join(out, 'resultados.json'), JSON.stringify({ motor: process.env.NAVEGADOR || 'edge', version: browser.version(), results, screens, errors }, null, 2))
}
async function session(role) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 }, locale: 'es-NI', timezoneId: 'America/Managua', reducedMotion: 'reduce' })
  await ctx.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort())
  const page = await ctx.newPage(); page.setDefaultTimeout(10000)
  page.on('pageerror', e => errors.push({ role, error: e.message }))
  sessions[role] = { ctx, page }
  return sessions[role]
}
async function login(role, page, secret = credentials[role]?.clave) {
  await page.goto(t.url + '/personal')
  await page.getByRole('heading', { name: 'Ingresar al panel' }).waitFor()
  await page.getByRole('radio', { name: 'Operación real', exact: true }).check()
  if (role === 'propietario') await page.getByLabel('Acceso del propietario').check()
  else await page.getByLabel('Usuario', { exact: true }).fill('auditoria.' + role)
  await page.getByLabel('Clave de acceso', { exact: true }).fill(role === 'propietario' ? t.env.CASA_SECRETO : secret)
  await page.getByRole('button', { name: 'Entrar a la operación real', exact: true }).click()
  await page.getByRole('navigation', { name: 'Secciones del equipo' }).waitFor()
}
async function visit(page, title) {
  await page.getByRole('navigation', { name: 'Secciones del equipo' }).getByRole('link', { name: title, exact: true }).click()
  await page.getByRole('heading', { name: title, exact: true, level: 1 }).waitFor()
  await page.waitForFunction(() => !Array.from(document.querySelectorAll('[role="status"]')).some(e => /^(Cargando registros|Consultando clientes|Calculando cifras|Preparando el resumen)/.test(e.textContent)))
}
async function inspect(role, name, page, axe = true) {
  await page.evaluate(() => document.fonts.ready)
  // Las transiciones CSS del menú continúan incluso con reducedMotion.
  // Esperar sus eventos de finalización evita medir colores intermedios.
  await page.evaluate(() => Promise.all(document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity).map(a => a.finished.catch(() => {}))))
  const width = page.viewportSize().width
  const overflow = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }))
  const file = `${role}-${name}-${width}.png`
  await page.screenshot({ path: join(out, file), fullPage: true })
  let violations = []
  if (axe) {
    await page.addScriptTag({ content: axeSource })
    violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })))
  }
  screens.push({ role, name, width, file, overflow, violations })
  assert.ok(overflow.content <= overflow.viewport + 1, `Desbordamiento ${overflow.content} > ${overflow.viewport}`)
  assert.deepEqual(violations, [], 'Violaciones axe: ' + violations.map(v => v.id).join(', '))
}
try {
  t.env.ACCESO_CORREO = 'true'
  t.env.EMAIL_FROM = 'local@example.test'
  t.env.EMAIL = { send: async () => ({ messageId: 'audit-local-only' }) }
  await t.db.query("UPDATE membresia SET hasta=now()+interval '15 days',estado='activa',renovacion_consentida=now()")
  for (const role of ['encargado', 'caja', 'cocina']) {
    const r = await t.request('/api/personal/equipo', { nombre: 'Auditoría ' + role, usuario: 'auditoria.' + role, permiso: role }, t.staff)
    assert.equal(r.status, 200); credentials[role] = r.body
  }
  await t.request('/api/cuenta/cobrar', { lineas: [{ id: 'latte', cuanto: 1 }], ref: 'auditoria-pedido-inicial' })
  await t.request('/api/atencion', { referencia: crypto.randomUUID(), mensaje: 'Consulta sintética de auditoría por perfiles' })
  await t.request('/api/reserva-cosecha/apartar', { ref: 'auditoria-bolsa-inicial' })
  await t.db.query("INSERT INTO reserva(socio_id,zona,cuando,termina,personas,deposito) VALUES($1,'terraza',now()+interval '5 days',now()+interval '5 days 2 hours',2,0)", [t.id])

  for (const role of Object.keys(sections)) {
    const { page } = await session(role)
    await check(role + ': ingreso real y menú permitido', async () => {
      await login(role, page)
      await page.getByRole('heading', { name: initial[role], level: 1, exact: true }).waitFor()
      assert.deepEqual(await page.getByRole('navigation', { name: 'Secciones del equipo' }).getByRole('link').allTextContents(), sections[role].map((s, i) => String(i + 1).padStart(2, '0') + s))
    })
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 1440 ? 960 : 844 })
      for (const title of sections[role]) await check(role + ': ' + title + ' ' + width + 'px', async () => {
        await visit(page, title)
        await inspect(role, title.replaceAll(' ', '-'), page)
        assert.equal(await page.getByRole('alert').count(), 0, 'Alertas durante consulta normal')
        if (title === 'Equipo y permisos') assert.equal(await page.getByRole('button', { name: 'Crear acceso individual' }).count(), role === 'propietario' ? 1 : 0)
        if (title === 'Clientes') assert.equal(await page.getByRole('button', { name: /Muestras archivadas/ }).count(), role === 'propietario' ? 1 : 0)
      })
    }
    for (const width of [320, 768]) await check(role + ': ancho límite ' + width, async () => {
      await page.setViewportSize({ width, height: 844 }); await visit(page, initial[role]); await inspect(role, 'limite', page, false)
    })
    await check(role + ': enlace directo, recarga e historial', async () => {
      await page.goto(t.url + '/personal?seccion=equipo')
      await page.getByRole('heading', { name: role === 'caja' || role === 'cocina' ? initial[role] : 'Equipo y permisos', level: 1, exact: true }).waitFor()
      await visit(page, 'Cuenta y seguridad'); await page.reload(); await page.getByRole('heading', { name: 'Cuenta y seguridad', level: 1 }).waitFor()
      await visit(page, initial[role]); await page.goBack(); await page.getByRole('heading', { name: 'Cuenta y seguridad', level: 1 }).waitFor()
    })
  }

  const { page: client } = await session('cliente')
  await client.goto(t.url)
  await client.evaluate(token => localStorage.setItem('club-lupita:sesion', token), t.token)
  for (const width of [1440, 390]) {
    await client.setViewportSize({ width, height: width === 1440 ? 960 : 844 })
    for (const path of ['/', '/pedir', '/tienda', '/club', '/perfil', '/compras', '/reservar']) await check('cliente: ' + path + ' ' + width + 'px', async () => {
      await client.goto(t.url + path); await client.getByRole('heading').first().waitFor()
      await client.waitForFunction(() => !document.querySelector('[aria-label="Abriendo la casa"]'))
      await inspect('cliente', path.slice(1) || 'inicio', client)
    })
  }
  await check('cliente: su sesión no abre panel del equipo', async () => {
    await client.goto(t.url + '/personal'); await client.getByRole('heading', { name: 'Ingresar al panel' }).waitFor()
    assert.equal(await client.getByRole('navigation', { name: 'Secciones del equipo' }).count(), 0)
  })
  const caja = sessions.caja.page, cocina = sessions.cocina.page, owner = sessions.propietario.page, manager = sessions.encargado.page
  await check('flujo: cliente paga, caja acepta, cocina prepara, caja entrega', async () => {
    await client.goto(t.url + '/pedir'); await client.getByRole('button', { name: 'Agregar Latte al pedido', exact: true }).click()
    await client.getByRole('button', { name: /Ver tu pedido/ }).click()
    await client.getByRole('button', { name: 'Pagar con la Cuenta de Casa' }).click()
    await client.getByRole('heading', { name: 'Mis compras y reservas' }).waitFor()
    const { rows: [order] } = await t.db.query('SELECT id,numero FROM pedido ORDER BY creado DESC LIMIT 1')
    const article = p => p.getByRole('article').filter({ has: p.getByRole('heading', { name: 'Pedido #' + order.numero, exact: true }) })
    await visit(caja, 'Pedidos'); await article(caja).getByRole('button', { name: 'Aceptar pedido' }).click()
    await article(caja).getByRole('button', { name: 'Comenzar preparación' }).waitFor()
    await visit(cocina, 'Pedidos'); await article(cocina).getByRole('button', { name: 'Comenzar preparación' }).click()
    await article(cocina).getByRole('button', { name: 'Marcar listo' }).click()
    await article(cocina).getByText('listo', { exact: true }).waitFor()
    assert.equal(await article(cocina).getByRole('button', { name: 'Confirmar entrega' }).count(), 0)
    await visit(caja, 'Pedidos'); await caja.getByRole('button', { name: 'Actualizar', exact: true }).click()
    await article(caja).getByRole('button', { name: 'Confirmar entrega' }).click()
    await client.getByRole('button', { name: 'Actualizar', exact: true }).click()
    await client.getByText('Estado: entregado', { exact: true }).waitFor()
    assert.equal((await t.db.query('SELECT estado FROM pedido WHERE id=$1', [order.id])).rows[0].estado, 'entregado')
    await inspect('cliente', 'pedido-entregado', client)
  })
  await check('caja: recarga con confirmación y saldo persistente', async () => {
    await visit(caja, 'Caja'); await caja.getByLabel('Teléfono del cliente').fill(t.tel); await caja.getByRole('button', { name: 'Buscar cliente' }).click()
    await caja.getByLabel('Referencia del ticket de caja').fill('audit-ui-recarga-001'); await caja.getByLabel('Recarga en córdobas').fill('200')
    await caja.getByRole('button', { name: 'Revisar recarga' }).click(); await caja.getByRole('dialog').waitFor()
    await inspect('caja', 'confirmar-recarga', caja)
    await caja.getByRole('button', { name: 'Confirmar pago recibido y registrar recarga' }).click()
    await caja.getByText(/Recarga registrada: C\$ 200/).waitFor()
    assert.equal((await t.db.query("SELECT count(*)::int n FROM asiento WHERE ref_externa='audit-ui-recarga-001' OR ref_externa LIKE '%audit-ui-recarga-001%'")).rows[0].n, 1)
  })
  await check('encargado: ficha de cliente e historial, exportación CSV', async () => {
    await visit(manager, 'Clientes'); await manager.getByRole('link', { name: 'Ver ficha de Prueba Regresión', exact: true }).click()
    await manager.getByRole('heading', { name: 'Historial del cliente' }).waitFor(); await inspect('encargado', 'ficha', manager)
    await visit(manager, 'Informes'); const download = manager.waitForEvent('download'); await manager.getByRole('button', { name: 'Exportar cifras CSV' }).click()
    await (await download).saveAs(join(out, 'encargado-informe.csv'))
    assert.match(readFileSync(join(out, 'encargado-informe.csv'), 'utf8'), /Indicador,Valor/)
  })
  await check('caja: responder atención y cliente consulta respuesta', async () => {
    await visit(caja, 'Atención'); await caja.getByRole('button', { name: 'Responder a Prueba Regresión' }).click()
    await caja.getByLabel('Respuesta al cliente').fill('Respuesta sintética confirmada durante la auditoría')
    await caja.getByRole('button', { name: 'Enviar respuesta y resolver' }).click(); await caja.getByRole('dialog').waitFor({ state: 'hidden' })
    await client.goto(t.url + '/compras'); await client.getByText('La casa: Respuesta sintética confirmada durante la auditoría').waitFor()
  })
  await check('propietario: modal equipo, teclado y retorno del foco', async () => {
    await visit(owner, 'Equipo y permisos'); const button = owner.getByRole('button', { name: 'Crear acceso individual' })
    await button.click(); await owner.getByRole('dialog').waitFor(); await inspect('propietario', 'crear-acceso', owner)
    await owner.keyboard.press('Escape'); await owner.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.ok(await button.evaluate(e => document.activeElement === e), 'El foco debe volver al botón')
  })
  await check('cocina: red caída, aviso y recuperación', async () => {
    await visit(cocina, 'Pedidos'); await sessions.cocina.ctx.setOffline(true)
    await cocina.getByText('Sin conexión', { exact: true }).waitFor()
    await cocina.getByRole('button', { name: 'Actualizar', exact: true }).click(); await cocina.getByRole('alert').filter({ hasText: 'No pudimos conectar' }).waitFor()
    await inspect('cocina', 'sin-conexion', cocina)
    await sessions.cocina.ctx.setOffline(false); await cocina.getByText('Conectado', { exact: true }).waitFor()
    await cocina.getByRole('alert').filter({ hasText: 'No pudimos conectar' }).waitFor({ state: 'hidden' })
  })
  await sessions.cocina.ctx.setOffline(false)
  await check('cocina: sesión revocada vuelve a ingreso y elimina token', async () => {
    assert.equal((await t.request('/api/personal/equipo/' + credentials.cocina.id + '/desactivar', { version: 0 }, t.staff)).status, 200)
    await cocina.reload(); await cocina.getByRole('heading', { name: 'Ingresar al panel' }).waitFor()
    assert.equal(await cocina.evaluate(() => sessionStorage.getItem('club-lupita:personal')), null)
  })
  await check('caja: temporal obliga cambio, cierra sesión y nueva clave funciona', async () => {
    const reset = await t.request('/api/personal/equipo/' + credentials.caja.id + '/restablecer-clave', { version: 0, actual: t.env.CASA_SECRETO }, t.staff)
    assert.equal(reset.status, 200)
    await caja.reload(); await caja.getByRole('heading', { name: 'Ingresar al panel' }).waitFor(); await login('caja', caja, reset.body.clave)
    await caja.getByRole('heading', { name: 'Elegí tu clave personal' }).waitFor()
    assert.equal(await caja.getByRole('navigation', { name: 'Secciones del equipo' }).getByRole('link').count(), 1)
    const next = 'Una frase sintética para auditoría 2026'
    await caja.getByLabel('Clave temporal', { exact: true }).fill(reset.body.clave)
    await caja.getByLabel('Nueva clave', { exact: true }).fill(next); await caja.getByLabel('Confirmar nueva clave', { exact: true }).fill(next)
    await caja.getByRole('button', { name: 'Guardar clave y cerrar sesiones' }).click(); await caja.getByRole('heading', { name: 'Ingresar al panel' }).waitFor()
    await login('caja', caja, next); await caja.getByRole('heading', { name: 'Caja', level: 1, exact: true }).waitFor()
  })
  await check('propietario: cierre sin conexión borra acceso del panel', async () => {
    await sessions.propietario.ctx.setOffline(true); await owner.getByRole('button', { name: 'Cerrar sesión', exact: true }).filter({ visible: true }).first().click()
    await owner.getByRole('heading', { name: 'Ingresar al panel' }).waitFor(); assert.equal(await owner.evaluate(() => sessionStorage.getItem('club-lupita:personal')), null)
    await sessions.propietario.ctx.setOffline(false)
  })
  await check('todos los perfiles: sin excepciones JavaScript', async () => assert.deepEqual(errors, []))
} finally {
  writeFileSync(join(out, 'resultados.json'), JSON.stringify({ motor: process.env.NAVEGADOR || 'edge', version: browser.version(), results, screens, errors }, null, 2))
  await browser.close(); await t.close()
}
console.log(JSON.stringify({ total: results.length, aprobados: results.filter(r => r.estado === 'APROBADO').length, fallos: results.filter(r => r.estado === 'FALLO').length, pantallas: screens.length }))
if (results.some(r => r.estado === 'FALLO')) process.exitCode = 1
