import { pedirJSON, ErrorPeticion } from './http'
import { sesion } from './sesion-cliente'
import { configuracionReservasValida, disponibilidadReservasValida, reciboReservaValido, comprobanteReservaValido, type ComprobanteReserva, type DisponibilidadReservas } from '../compartido/reservas'
async function leer<T>(ruta: string, validar: (v: unknown) => v is T, datos?: unknown): Promise<T> {
  const r: unknown = await pedirJSON(ruta, datos === undefined ? undefined : { method: 'POST', body: JSON.stringify(datos) })
  if (!validar(r)) throw new ErrorPeticion('No pudimos verificar la respuesta. Conservamos tu intento para consultar su estado.', 502, datos !== undefined)
  return r
}
export function medirReserva(evento: 'consulta' | 'fecha_grupo' | 'revision' | 'conflicto' | 'sin_saldo' | 'borrador_recuperado' | 'resultado_incierto', referencia: string) {
  if (!sesion.leer() || navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return
  void pedirJSON('/reservas/evento', { method: 'POST', body: JSON.stringify({ evento, referencia }) }).catch(() => {})
}
export const reservasApi = {
  configuracion: () => leer('/reservas/configuracion', configuracionReservasValida),
  disponibilidad: (dia: string, personas: number, horas: number) => leer('/reservas/disponibilidad?' + new URLSearchParams({ dia, personas: String(personas), horas: String(horas) }), (v):v is DisponibilidadReservas=>disponibilidadReservasValida(v,dia)),
  disponibilidadCambio: (id: string, dia: string, personas: number, horas: number) => leer('/reservas/' + id + '/disponibilidad?' + new URLSearchParams({ dia, personas: String(personas), horas: String(horas) }), (v):v is DisponibilidadReservas=>disponibilidadReservasValida(v,dia)),
  crear: (datos: unknown) => leer('/reserva', reciboReservaValido, datos),
  recuperar: (referencia: string) => leer('/reservas/intento/' + encodeURIComponent(referencia), reciboReservaValido),
  mias: () => leer('/reservas/mias', (v): v is { reservas: ComprobanteReserva[] } => !!v && typeof v === 'object' && 'reservas' in v && Array.isArray(v.reservas) && v.reservas.every(comprobanteReservaValido)),
  cambiar: (id: string, accion: 'cambiar' | 'cancelar', datos: unknown) => leer('/reservas/' + id + '/' + accion, (v): v is { reserva: ComprobanteReserva } => !!v && typeof v === 'object' && 'reserva' in v && comprobanteReservaValido(v.reserva), datos),
}
