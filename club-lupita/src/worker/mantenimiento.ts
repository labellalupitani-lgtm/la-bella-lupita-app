import { neon } from '@neondatabase/serverless'
import type { Env } from './index'
import { procesarCorreosReservas } from './reservas-correo'
import { esCuotaAgotada } from './cuota'

export const DIA = 86_400_000
export const HORA = 3_600_000
export function identidadBase(direccion?: string): string | null {
  if (!direccion) return null
  try { const u = new URL(direccion); return u.hostname.toLowerCase().replace(/-pooler(?=\.)/, '') + ':' + (u.port || '5432') + decodeURIComponent(u.pathname) } catch { return null }
}
export async function mantenerMembresias(env: Env) {
  const sql = neon(env.DATABASE_URL)
  const [resultado] = await sql`SELECT * FROM mantener_membresias_club()`
  if (Number(resultado.fallidos) > 0) throw Error(`Renovaciones pendientes de revisión: ${resultado.fallidos}`)
}
export async function limpiarDatos(env: Env) {
  const sql = neon(env.DATABASE_URL)
  // Una transacción HTTP: las diez limpiezas comparten una conexión y un viaje.
  await sql.transaction([
    sql`DELETE FROM sesion_cliente WHERE vence<now() OR revocada<now()-interval '1 day'`,
    sql`DELETE FROM sesion_cliente_migrada WHERE vence<now()`,
    sql`DELETE FROM inicio_metrica WHERE dia<(now() AT TIME ZONE 'America/Managua')::date-90`,
    sql`DELETE FROM carta_metrica WHERE dia<(now() AT TIME ZONE 'America/Managua')::date-90`,
    sql`DELETE FROM carta_rendimiento WHERE dia<(now() AT TIME ZONE 'America/Managua')::date-90`,
    sql`DELETE FROM club_rendimiento WHERE dia<(now() AT TIME ZONE 'America/Managua')::date-90`,
    sql`DELETE FROM club_tiempo WHERE dia<(now() AT TIME ZONE 'America/Managua')::date-90`,
    sql`DELETE FROM club_metrica WHERE dia<(now() AT TIME ZONE 'America/Managua')::date-90`,
    sql`DELETE FROM reserva_metrica WHERE dia<(now() AT TIME ZONE 'America/Managua')::date-90`,
    sql`DELETE FROM reserva_metrica_intento WHERE dia<(now() AT TIME ZONE 'America/Managua')::date-90`,
  ])
}
export async function siguienteTrabajo(env: Env, ahora: number): Promise<number> {
  const sql = neon(env.DATABASE_URL)
  const correo = env.RESERVAS_CORREO === 'true' && !!env.RESEND_API_KEY && !!env.EMAIL_FROM
  const [fila] = await sql`
    SELECT min(instante) AS siguiente FROM (
      SELECT min(m.hasta) AS instante FROM operativo_membresia m
      JOIN operativo_socio s ON s.id=m.socio_id
      WHERE m.estado IN ('activa','en_gracia') AND s.baja IS NULL
      UNION ALL
      SELECT min(GREATEST(disponible,COALESCE(tomado+interval '2 minutes',disponible)))
      FROM reserva_correo WHERE ${correo} AND enviado IS NULL AND descartado IS NULL
        AND intentos<5 AND (iniciado IS NULL OR iniciado>now()-interval '23 hours')
    ) pendientes`
  const fecha = fila?.siguiente ? new Date(fila.siguiente).getTime() : Infinity
  // La reconciliación diaria también descubre cambios realizados por SQL externo.
  return Math.min(ahora + DIA, Number.isFinite(fecha) ? Math.max(ahora + 60_000, fecha) : Infinity)
}
export async function trabajarBase(env: Env, limpiar: boolean, ahora: number) {
  let fallo: unknown
  try { await mantenerMembresias(env) } catch (e) { if (esCuotaAgotada(e)) throw e; fallo = e }
  // Un problema en una membresía no bloquea los recordatorios de otras cuentas.
  try { await procesarCorreosReservas(env, 20) } catch (e) { fallo ??= e }
  if (limpiar) { try { await limpiarDatos(env) } catch (e) { fallo ??= e } }
  if (fallo) throw fallo
  return siguienteTrabajo(env, ahora)
}

export type EstadoMantenimiento = { revision: number; siguiente: number; limpieza: number; ultimoExito: number; ultimoIntento: number; fallos: number; error: boolean; escrituras: Record<string, number> }
export const estadoInicial = (): EstadoMantenimiento => ({ revision: 0, siguiente: 0, limpieza: 0, ultimoExito: 0, ultimoIntento: 0, fallos: 0, error: false, escrituras: {} })
export type AlmacenPlan = { leer(): EstadoMantenimiento; guardar(estado: EstadoMantenimiento): void }
/** Sólo persiste una señal; jamás consulta PostgreSQL. */
export function marcarCambio(almacen: AlmacenPlan) {
  const estado = almacen.leer()
  almacen.guardar({ ...estado, revision: estado.revision + 1, siguiente: 0 })
}
/** El DO serializa ejecuciones; las señales que llegan durante el SQL no se pierden. */
export async function ejecutarPlan(almacen: AlmacenPlan, trabajo: (limpiar: boolean) => Promise<number>, ahora: number) {
  const antes = almacen.leer()
  // Una señal se guarda antes de la escritura SQL. Si se pierde su cierre,
  // el siguiente cron reconcilia tras vencer este plazo, sin perder el trabajo.
  if (Object.values(antes.escrituras).some(vence => vence > ahora)) return { ejecutado: false }
  if (ahora < antes.siguiente) return { ejecutado: false }
  almacen.guardar({ ...antes, ultimoIntento: ahora })
  const limpiar = ahora - antes.limpieza >= DIA
  try {
    const siguiente = await trabajo(limpiar)
    const actual = almacen.leer()
    const escrituras = Object.fromEntries(Object.entries(actual.escrituras).filter(([, vence]) => vence > ahora))
    almacen.guardar({ ...actual, escrituras, siguiente: actual.revision === antes.revision ? siguiente : 0,
      limpieza: limpiar ? ahora : actual.limpieza, ultimoExito: ahora, fallos: 0, error: false })
    return { ejecutado: true }
  } catch (error) {
    const actual = almacen.leer(), fallos = actual.fallos + 1
    const espera = esCuotaAgotada(error) ? Math.min(6, 2 ** Math.min(fallos - 1, 3)) : 1
    almacen.guardar({ ...actual, siguiente: ahora + espera * HORA, fallos, error: true })
    console.error(JSON.stringify({ evento: 'mantenimiento', estado: 'error', fallos }))
    return { ejecutado: true, error: true }
  }
}
