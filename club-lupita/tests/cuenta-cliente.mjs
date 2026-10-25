import assert from 'node:assert/strict';
import { preparar } from './soporte.mjs';
const t = await preparar();
try {
  const perfil = { nombre: 'Perfil de prueba', bebida_siempre: 'Latte', alergias: '', cumple: '02-29', promociones_correo: false, version:(await t.request('/api/perfil')).body.perfil.version };
  assert.equal((await t.request('/api/perfil', perfil)).status, 200);
  const yo = (await t.request('/api/yo')).body;
  assert.equal(yo.socio.nombre, perfil.nombre);
  assert.equal(yo.socio.bebida_siempre, 'Latte');
  assert.equal((await t.request('/api/yo', undefined, t.otroToken)).body.socio.nombre, 'Otro Socio');
  for (const cambio of [{ nombre: 'A' }, { cumple: '2025-02-29' }, { cumple: '2999-01-01' }, { cumple: '0000-01-01' }, { nombre: 'A\nB' }, { telefono: 'otro' }, { alergias: 'a'.repeat(241) }]) {
    assert.equal((await t.request('/api/perfil', { ...perfil, ...cambio })).status, 422, JSON.stringify(cambio));
  }
  assert.equal((await t.request('/api/perfil', { ...perfil, nombre: 'x'.repeat(5000) })).status, 413);
  assert.equal((await t.request('/api/perfil', perfil, t.staff)).status, 403);
  assert.equal((await t.request('/api/perfil', perfil, null)).status, 401);
  const auditoria = (await t.db.query("SELECT detalle FROM auditoria WHERE accion='editar_perfil'")).rows;
  assert.equal(auditoria.length, 1);
  assert.equal(JSON.stringify(auditoria).includes(perfil.nombre), false);
  await t.db.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,creado) SELECT $1,100,'recarga','Página de prueba '||n,'2026-01-01T00:00:00Z'::timestamptz + (n%3)*interval '1 microsecond' FROM generate_series(1,45)n", [t.id]);
  const ids = []; let cursor; let paginas = 0;
  do {
    const r = await t.request('/api/actividad?tipo=todos' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''));
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.ok(r.body.movimientos.length <= 20);
    ids.push(...r.body.movimientos.map(m => m.id));
    cursor = r.body.siguiente; paginas++;
    assert.ok(paginas < 10);
  } while(cursor);
  assert.equal(new Set(ids).size, ids.length);
  const expected = (await t.db.query('SELECT (SELECT count(*) FROM asiento WHERE socio_id=$1)+(SELECT count(*) FROM punto WHERE socio_id=$1)+(SELECT count(*) FROM sello s JOIN tanda t ON t.id=s.tanda_id WHERE t.socio_id=$1) AS n', [t.id])).rows[0].n;
  assert.equal(ids.length, Number(expected));
  for (const tipo of ['dinero','puntos','sellos','canjes']) {
    const r = await t.request('/api/actividad?tipo=' + tipo);
    assert.equal(r.status, 200);
    assert.ok(r.body.movimientos.every(m => m.tipo === tipo));
  }
  assert.equal((await t.request('/api/actividad?tipo=sellos', undefined, t.otroToken)).body.movimientos.length, 0);
  assert.equal((await t.request('/api/actividad?tipo=invalido')).status, 422);
  assert.equal((await t.request('/api/actividad?cursor=roto')).status, 422);
  const cursorInvalido = Buffer.from(JSON.stringify({ fecha: '0000-01-01T00:00:00.000000Z', id: 'dinero:1' })).toString('base64');
  assert.equal((await t.request('/api/actividad?cursor=' + encodeURIComponent(cursorInvalido))).status, 422);
  assert.equal((await t.request('/api/actividad', undefined, t.staff)).status, 403);
  assert.equal((await t.request('/api/actividad', undefined, null)).status, 401);
  console.log('Cuenta cliente: perfil persistente, validación, permisos, auditoría y paginación sin omisiones verificados.');
} finally { await t.db.close(); }
