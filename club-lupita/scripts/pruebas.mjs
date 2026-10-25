// Pruebas de las correcciones de integridad. Cada una debe FALLAR donde toca.
import { neon } from '@neondatabase/serverless'
const url = process.env.TEST_DATABASE_URL
if (!url || process.env.ALLOW_DESTRUCTIVE_TESTS !== 'isolated-database') {
  throw new Error('Este script antiguo modifica registros. Usá npm test, que trabaja en una base aislada. Para una base descartable explícita se requieren TEST_DATABASE_URL y ALLOW_DESTRUCTIVE_TESTS=isolated-database.')
}
const sql = neon(url)
const ok = (t) => console.log('  PASA  ', t)
const mal = (t, e) => { console.log('  FALLA ', t, '->', e); process.exitCode = 1 }

// 1. La ventana del dia en hora de Managua
const [z] = await sql`
  SELECT (timestamptz '2026-08-21 18:01-06')::date        AS utc_dice,
         dia_managua(timestamptz '2026-08-21 18:01-06')   AS casa_dice,
         dia_managua(timestamptz '2026-08-22 05:00-06')   AS manana_temprano`
console.log('1) Ventana del dia a las 18:01 de Managua')
console.log('   UTC dice', z.utc_dice, '| la casa dice', z.casa_dice, '| 5am siguiente:', z.manana_temprano)
String(z.casa_dice) !== String(z.utc_dice) && String(z.casa_dice) !== String(z.manana_temprano)
  ? ok('18:01 y las 5am del dia siguiente son dias DISTINTOS, y 18:01 no salta a manana')
  : mal('la ventana sigue calculandose mal', z)

// 2. Doble uso de la bebida del dia en la misma ventana
console.log('2) Bebida del dia dos veces')
const [m] = await sql`SELECT id FROM membresia WHERE numero = 37`
await sql`DELETE FROM beneficio_uso WHERE membresia_id = ${m.id} AND clase = 'bebida_dia'`
await sql`INSERT INTO beneficio_uso (membresia_id, clase, usado_en) VALUES (${m.id}, 'bebida_dia', timestamptz '2026-08-21 18:01-06')`
try {
  await sql`INSERT INTO beneficio_uso (membresia_id, clase, usado_en) VALUES (${m.id}, 'bebida_dia', timestamptz '2026-08-21 20:30-06')`
  mal('permitio dos bebidas en el mismo dia de Managua')
} catch (e) { ok('segunda bebida del mismo dia rechazada: ' + e.message.slice(0, 58)) }
await sql`DELETE FROM beneficio_uso WHERE membresia_id = ${m.id} AND clase = 'bebida_dia'`

// 3. El libro mayor no se edita
console.log('3) Editar un asiento ya escrito')
const [a] = await sql`SELECT id FROM asiento LIMIT 1`
try {
  await sql`UPDATE asiento SET monto = 999999 WHERE id = ${a.id}`
  mal('permitio editar el libro mayor')
} catch (e) { ok('UPDATE bloqueado: ' + e.message.slice(0, 62)) }
try {
  await sql`DELETE FROM asiento WHERE id = ${a.id}`
  mal('permitio borrar del libro mayor')
} catch (e) { ok('DELETE bloqueado: ' + e.message.slice(0, 62)) }

// 4. Salon VIP solapado
console.log('4) Dos reservas del Salon VIP a la misma hora')
const [s] = await sql`SELECT id FROM socio WHERE telefono = '50587442005'`
await sql`DELETE FROM reserva WHERE zona = 'vip'`
await sql`INSERT INTO reserva (socio_id, zona, cuando, termina, personas, deposito)
          VALUES (${s.id}, 'vip', timestamptz '2026-09-01 19:00-06', timestamptz '2026-09-01 22:00-06', 8, 50000)`
try {
  await sql`INSERT INTO reserva (socio_id, zona, cuando, termina, personas, deposito)
            VALUES (${s.id}, 'vip', timestamptz '2026-09-01 20:00-06', timestamptz '2026-09-01 23:00-06', 6, 50000)`
  mal('permitio solapar el Salon VIP')
} catch (e) { ok('solape rechazado: ' + e.message.slice(0, 62)) }
await sql`DELETE FROM reserva WHERE zona = 'vip'`

// 5. Cuadre diario limpio
console.log('5) Cuadre diario')
const cuadre = await sql`SELECT * FROM cuadre`
const sucio = cuadre.filter((c) => c.filas > 0)
sucio.length === 0 ? ok('las cuatro pruebas de cuadre en cero') : mal('cuadre sucio', JSON.stringify(sucio))
