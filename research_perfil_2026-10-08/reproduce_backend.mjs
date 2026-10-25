import { preparar } from '../club-lupita/tests/soporte-perfiles-equipo.mjs';
import { writeFileSync } from 'node:fs';
import { build } from '../club-lupita/node_modules/esbuild/lib/main.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';

const t = await preparar();
const results = [];
const perfil = { nombre: 'Cliente de pruebas', bebida_siempre: 'Latte', alergias: 'Maní', cumple: '2000-09-14' };
try {
  const contexts = [
    ['bearer_solo', t.token, {}],
    ['cookie_sola', t.staff, {}],
    ['ambos_sin_csrf', t.token, { headers: { cookie: t.staff.cookie, origin: t.origen } }],
    ['ambos_con_csrf', t.token, { headers: { cookie: t.staff.cookie, origin: t.origen, 'x-equipo-csrf': t.staff.csrf } }],
    ['bearer_con_cookie_expirada', t.token, { headers: { cookie: '__Host-lupita-equipo=r.sesion-fixture-inexistente', origin: t.origen } }],
  ];
  for (const [context, auth, options] of contexts) {
    for (const [path, body] of [['/api/yo', undefined], ['/api/actividad', undefined], ['/api/perfil', perfil]]) {
      const response = await t.request(path, body, auth, options);
      results.push({ context, path, status: response.status, error: response.body.error ?? null, cache: response.headers.get('cache-control') });
    }
  }
  // Replacements made from two drafts based on the same profile lose unrelated edits.
  const initial = { nombre: 'Inicial', bebida_siempre: 'Latte', alergias: '', cumple: '2000-09-14' };
  await t.request('/api/perfil', initial);
  const editA = await t.request('/api/perfil', { ...initial, nombre: 'Nombre actualizado' });
  const editB = await t.request('/api/perfil', { ...initial, bebida_siempre: 'Espresso' });
  const final = await t.request('/api/yo');
  results.push({ context: 'dos_borradores_misma_version', path: '/api/perfil', firstStatus: editA.status, secondStatus: editB.status, firstChangePreserved: final.body.socio.nombre === 'Nombre actualizado', finalBeverage: final.body.socio.bebida_siempre });
  // Count database HTTP statements for the full account fetch.
  globalThis.__testHttpCalls = 0;
  const measured = await t.request('/api/yo');
  results.push({ context: 'consultas_yo_sin_membresia_activa', path: '/api/yo', status: measured.status, httpStatements: globalThis.__testHttpCalls });
  delete globalThis.__testHttpCalls;
  // The UI logout calls this exact module; check whether the saved credential survives remotely.
  const sessionOutput = join(t.output, 'perfil-sesion-cliente.mjs');
  await build({ entryPoints: [fileURLToPath(new URL('../club-lupita/src/casa/sesion-cliente.ts', import.meta.url))], bundle: true, platform: 'node', format: 'esm', outfile: sessionOutput });
  const storage = new Map();
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  globalThis.window = new EventTarget();
  const { sesion } = await import(pathToFileURL(sessionOutput));
  sesion.guardar(t.token);
  const copiedToken = sesion.leer();
  sesion.borrar();
  const replay = await t.request('/api/yo', undefined, copiedToken);
  results.push({ context: 'reuso_credencial_tras_logout_real', path: '/api/yo', clientSessionCleared: sesion.leer() === null, replayStatus: replay.status });
  delete globalThis.localStorage;
  delete globalThis.window;
  // Sensitive preference exists in CRM but never reaches active-order payloads.
  await t.request('/api/perfil', perfil);
  await t.db.query("INSERT INTO pedido(socio_id,referencia,lineas,total) VALUES($1,'perfil-alergias-auditoria','[{\"id\":\"fixture\",\"nombre\":\"Pedido sintético\",\"cuanto\":1}]'::jsonb,100)", [t.id]);
  const kitchen = await t.crearEmpleado({ permiso: 'cocina', usuario: 'cocina.perfil' });
  const ficha = await t.request('/api/operacion/clientes/' + t.id, undefined, t.staff);
  for (const [path, key] of [['/api/operacion/pedidos', 'pedidos'], ['/api/operacion/listas/pedidos', 'filas']]) {
    const response = await t.request(path, undefined, kitchen.auth);
    results.push({ context: 'alergias_en_preparacion', path, status: response.status, profileHasAllergy: ficha.body.alergias === perfil.alergias, orderCount: response.body[key].length, kitchenPayloadHasAllergy: JSON.stringify(response.body).includes(perfil.alergias) });
  }
  for (const [label, input] of [['unicode_bidi', 'Ana\u202eTEST'], ['unicode_C1', 'Ana\u0085TEST'], ['surrogate_aislado', 'Ana\ud800']]) {
    const response = await t.request('/api/perfil', { ...initial, nombre: input });
    results.push({ context: label, path: '/api/perfil', status: response.status, error: response.body.error ?? null });
  }
  const unicodeLength = await t.request('/api/perfil', { ...initial, nombre: '𠮷'.repeat(41) });
  results.push({ context: '41_caracteres_unicode_no_BMP', path: '/api/perfil', status: unicodeLength.status });
  writeFileSync(new URL('./reproduce_backend.json', import.meta.url), JSON.stringify({ date: '2026-10-08', environment: 'PGlite in memory; synthetic data; no network database; no production', results }, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally { await t.close(); }
