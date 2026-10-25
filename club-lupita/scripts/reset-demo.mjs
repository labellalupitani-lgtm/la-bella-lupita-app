/**
 * Devuelve la demo a su estado narrativo: 7 sellos, 34 bolsas, 4 butacas,
 * saldo C$905.
 *
 * El libro mayor no se puede borrar (es append-only por trigger, a propósito),
 * así que un movimiento de prueba no se elimina: se COMPENSA con un asiento de
 * ajuste firmado. Es como se corrige una caja de verdad.
 */
import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'
const url = readFileSync('.dev.vars', 'utf8').match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/)[1].trim()
const sql = neon(url)

const [s] = await sql`SELECT id FROM socio WHERE telefono = '50587442005'`
const SALDO_DEMO = 90500

// Sellos: un sello anulado por el barista sí se borra (no es dinero).
await sql`DELETE FROM sello
          WHERE tanda_id IN (SELECT id FROM tanda WHERE socio_id = ${s.id} AND canjeada IS NULL)
            AND (ref_externa LIKE 'tkt-%' OR n > 7)`
// Solo se reabre la tanda EN CURSO. Las tandas ya canjeadas son historia del
// socio y reabrirlas rompe la regla de una sola tanda abierta por persona.
await sql`UPDATE tanda SET cerrada = NULL
          WHERE socio_id = ${s.id} AND canjeada IS NULL AND cerrada IS NOT NULL`
await sql`DELETE FROM vale WHERE socio_id = ${s.id}`

// Cupos
// Liberar una bolsa ya pagada sin cambiar de generación la regalaría: la
// referencia del pago anterior seguiría viva y la guardia de idempotencia
// saltaría el cobro. Cada reinicio abre una cosecha nueva.
await sql`UPDATE reserva_cosecha
          SET socio_id = NULL, apartada = NULL, generacion = generacion + 1
          WHERE numero > 116 AND apartada IS NOT NULL`
await sql`DELETE FROM asiento_experiencia WHERE butaca > 8`
await sql`DELETE FROM reserva WHERE zona = 'vip'`
await sql`DELETE FROM beneficio_uso WHERE membresia_id IN (SELECT id FROM membresia WHERE numero = 37)`

// Dinero: se compensa la diferencia, no se borra el historial.
const [{ total }] = await sql`SELECT total FROM saldo_de(${s.id})`
const diferencia = SALDO_DEMO - Number(total)
if (diferencia !== 0) {
  await sql`
    INSERT INTO asiento (socio_id, monto, tipo, concepto, quien, nota)
    VALUES (${s.id}, ${diferencia}, 'ajuste', 'Ajuste de demostración',
            'scripts/reset-demo', 'Devuelve la cuenta al estado narrativo de la demo')`
}

const [sel] = await sql`SELECT count(*)::int n FROM sello`
const [bol] = await sql`SELECT count(*)::int n FROM reserva_cosecha WHERE apartada IS NULL`
const [but] = await sql`SELECT 12 - count(*)::int n FROM asiento_experiencia WHERE experiencia_id='mesa-tostador'`
const [fin] = await sql`SELECT total FROM saldo_de(${s.id})`
const cuadre = await sql`SELECT * FROM cuadre WHERE filas > 0`
console.log('sellos', sel.n, '| bolsas libres', bol.n, '| butacas libres', but.n,
  '| saldo', 'C$' + (Number(fin.total) / 100).toFixed(2))
console.log(cuadre.length ? 'CUADRE SUCIO: ' + JSON.stringify(cuadre) : 'cuadre limpio')
