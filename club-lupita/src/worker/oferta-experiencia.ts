import { digest } from './equipo-sesion'

/** Huella de la oferta pública, no del inventario. Se recalcula con la fila
 * bloqueada antes de cobrar; el cliente nunca determina el importe. */
export async function ofertaExperiencia(e: Record<string, unknown>) {
  const instante = (v: unknown) => v ? new Date(String(v)).toISOString() : null
  return digest(JSON.stringify([
    e.id, e.nombre, Number(e.precio), instante(e.cuando),
    instante(e.abre_socios), instante(e.abre_publico),
    e.duracion_minutos == null ? null : Number(e.duracion_minutos),
    e.lugar ?? null, e.incluye ?? null, e.condiciones ?? null,
  ]))
}
