import { neon } from '@neondatabase/serverless'
import type { Env } from './index'
import { transaccion } from './operacion'
import { nombreZona, nombreEstadoReserva } from '../compartido/reservas'

/** Cola persistente; el correo nunca decide si una reserva se confirmó. */
export async function procesarCorreosReservas(env: Env, limite = 3) {
  if (env.RESERVAS_CORREO !== 'true') return
  // Las cuentas de capacitación jamás envían correo a personas reales.
  const identidad = (url: string) => { try { const u = new URL(url); return u.hostname.replace('-pooler', '') + u.pathname } catch { return url } }
  if (env.DEMO_DATABASE_URL && identidad(env.DATABASE_URL) === identidad(env.DEMO_DATABASE_URL)) return
  // Una configuración incompleta no consume la ventana de reintentos del proveedor.
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return
  const sql = neon(env.DATABASE_URL)
  await sql`UPDATE reserva_correo e SET descartado=now(),error='sustituido' FROM reserva r WHERE r.id=e.reserva_id AND e.enviado IS NULL AND e.descartado IS NULL AND (r.version<>e.version OR (e.tipo='recordatorio' AND (r.estado<>'confirmada' OR r.cuando<=now())))`
  for (let n = 0; n < limite; n++) {
    const e = await transaccion(env, async cli => {
      const { rows: [r] } = await cli.query(`UPDATE reserva_correo SET tomado=now(),intentos=intentos+1,iniciado=COALESCE(iniciado,now()) WHERE id=(SELECT id FROM reserva_correo WHERE enviado IS NULL AND descartado IS NULL AND disponible<=now() AND intentos<5 AND (iniciado IS NULL OR iniciado>now()-interval '23 hours') AND (tomado IS NULL OR tomado<now()-interval '2 minutes') ORDER BY disponible,id FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`)
      if (!r) return null
      const { rows: [reserva] } = await cli.query('SELECT r.*,s.correo,s.correo_verificado FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.id=$1 AND s.baja IS NULL', [r.reserva_id])
      if (!reserva?.correo_verificado || !reserva.correo || reserva.version !== r.version) {
        await cli.query("UPDATE reserva_correo SET descartado=now(),tomado=NULL,error='sin_destinatario_vigente' WHERE id=$1", [r.id]); return { omitido: true }
      }
      const fecha = new Intl.DateTimeFormat('es-NI', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Managua' }).format(new Date(reserva.cuando))
      const texto = `Reserva ${reserva.id}\n${nombreZona(reserva.zona)} · ${fecha} (Managua) · ${reserva.personas} personas.\nEstado: ${nombreEstadoReserva(reserva.estado)}.\n${reserva.deposito ? `Anticipo de C$${reserva.deposito/100}: aplicado C$${reserva.anticipo_aplicado/100}; devuelto C$${reserva.anticipo_devuelto/100}; pendiente C$${(reserva.deposito-reserva.anticipo_aplicado-reserva.anticipo_devuelto)/100}.` : 'Sin anticipo.'}\nConsultá y gestioná tu comprobante actualizado en https://app.labellalupita.com/reservas`
      const mensaje = r.mensaje ?? { from: `La Bella Lupita <${env.EMAIL_FROM}>`, to: [reserva.correo], subject: r.tipo === 'recordatorio' ? 'Tu próxima visita a La Bella Lupita' : 'Actualización de tu reserva en La Bella Lupita', text: texto }
      if (mensaje.to[0] !== reserva.correo) { await cli.query("UPDATE reserva_correo SET descartado=now(),error='destinatario_cambio',tomado=NULL WHERE id=$1", [r.id]); return { omitido: true } }
      await cli.query('UPDATE reserva_correo SET mensaje=$2::jsonb WHERE id=$1', [r.id, JSON.stringify(mensaje)])
      return { omitido: false, id: r.id, mensaje }
    })
    if (!e) break
    if (e.omitido || !e.id) continue
    try {
      const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json', 'Idempotency-Key': 'reserva-' + e.id }, body: JSON.stringify(e.mensaje), signal: AbortSignal.timeout(8000) })
      const resultado = await r.json().catch(() => null) as { id?: unknown } | null
      if (!r.ok || typeof resultado?.id !== 'string' || !resultado.id) throw Error('envio_pendiente')
      await sql`UPDATE reserva_correo SET enviado=now(),tomado=NULL,error=NULL,mensaje=NULL WHERE id=${e.id}`
    } catch {
      // El proveedor conserva la referencia 24 h; después de 23 h dejamos revisión humana.
      await sql`UPDATE reserva_correo SET tomado=NULL,error='envio_pendiente',disponible=now()+interval '30 minutes' WHERE id=${e.id}`
    }
  }
  await sql`UPDATE reserva_correo SET error='requiere_revision' WHERE enviado IS NULL AND descartado IS NULL AND (intentos>=5 OR iniciado<=now()-interval '23 hours')`
}
