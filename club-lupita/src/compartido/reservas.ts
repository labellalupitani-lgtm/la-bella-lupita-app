/** Contrato compartido: centavos de córdoba y hora civil de Managua. */
export const ZONAS_RESERVA = [
  { id: 'terraza', nombre: 'Terraza' }, { id: 'ventanal', nombre: 'Ventanal' },
  { id: 'barra', nombre: 'Barra' }, { id: 'bistro', nombre: 'Bistró' }, { id: 'vip', nombre: 'Salón VIP' },
] as const
export const nombreZona = (id: string) => ZONAS_RESERVA.find(z => z.id === id)?.nombre ?? id
export const nombreEstadoReserva = (id: string) => ({confirmada:'Confirmada',llego:'Llegada registrada',sentada:'Mesa ocupada',finalizada:'Visita finalizada',no_asistio:'Inasistencia registrada',cancelada:'Cancelada'} as Record<string,string>)[id] ?? id
export const HORA_RESERVA = 'America/Managua'
export const REEMBOLSO_RESERVAS = {
  cancelacion: 'Al cancelar, el anticipo pendiente se devuelve íntegramente a tu Cuenta de Casa.',
  inasistencia: 'Si no asistís, el anticipo pendiente se devuelve íntegramente a tu Cuenta de Casa cuando el personal registre la inasistencia.',
}
export type MesaReserva = { id: string; plazas: number }
export type ZonaReserva = { id: string; descripcion: string; accesibilidad: string; mesas: MesaReserva[]; combinaciones: string[][] }
export type ConfiguracionReservas = {
  version: number; dias: number; anticipacion: number; maxHoras: number; maxActivas: number
  horario: { abre: number; cierra: number }[]
  excepciones: { dia: string; abre: number; cierra: number; cerrada: boolean }[]
  cierres: { dia: string; zona: string; desde: number; hasta: number; motivo: string }[]
  zonas: ZonaReserva[]
  politica: { version: number; tipo: 'anticipo'; importe: number; cancelacion: string; inasistencia: string }
}
export const CONFIGURACION_RESERVAS: ConfiguracionReservas = {
  version: 1, dias: 90, anticipacion: 30, maxHoras: 6, maxActivas: 3,
  horario: Array.from({ length: 7 }, (_, i) => ({ abre: i === 0 ? 8 : 7, cierra: 21 })), excepciones: [], cierres: [],
  zonas: ZONAS_RESERVA.map(z => ({ id: z.id, descripcion: '', accesibilidad: '', mesas: [], combinaciones: [] })),
  politica: { version: 1, tipo: 'anticipo', importe: 50000, ...REEMBOLSO_RESERVAS },
}
export function diaReserva(n = 0, ahora = Date.now()) { return new Date(ahora - 21600000 + n * 86400000).toISOString().slice(0, 10) }
export function zonaCerrada(c: ConfiguracionReservas, zona: string, cuando: string, horas: number) {
  const dia=diaReserva(0,Date.parse(cuando)),hora=new Date(Date.parse(cuando)-21600000).getUTCHours()
  return c.cierres.some(x=>x.zona===zona&&x.dia===dia&&hora<x.hasta&&hora+horas>x.desde)
}
export function fechaReserva(d: unknown): d is string {
  return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d + 'T12:00:00Z')) && new Date(d + 'T12:00:00Z').toISOString().slice(0, 10) === d
}
/** Rechaza normalizaciones silenciosas y precisión distinta de la ofrecida. */
export function instanteReserva(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:00:00(?:\.000)?(?:Z|-06:00)$/.test(v)) return false
  return fechaReserva(v.slice(0, 10)) && Number(v.slice(11, 13)) < 24 && Number.isFinite(Date.parse(v))
}
export function horarioReserva(c: ConfiguracionReservas, dia: string) {
  const excepcion = c.excepciones.find(e => e.dia === dia)
  return excepcion ?? { ...c.horario[new Date(dia + 'T12:00:00Z').getUTCDay()], cerrada: false }
}
export function errorFechaReserva(c: ConfiguracionReservas, cuando: unknown, horas: unknown, personas: unknown, ahora = Date.now()): string | null {
  if (!instanteReserva(cuando)) return 'Elegí una fecha válida y una hora exacta en Managua.'
  if (!Number.isInteger(horas) || Number(horas) < 1 || Number(horas) > c.maxHoras) return `Elegí entre 1 y ${c.maxHoras} horas.`
  if (!Number.isInteger(personas) || Number(personas) < 1 || Number(personas) > 12) return 'Elegí entre 1 y 12 personas. Para grupos mayores, consultá con la casa.'
  const t = Date.parse(cuando), local = new Date(t - 21600000), dia = local.toISOString().slice(0, 10), h = local.getUTCHours()
  if (t < ahora + c.anticipacion * 60000) return `Reservá con al menos ${c.anticipacion} minutos de anticipación.`
  if (dia > diaReserva(c.dias, ahora)) return `La agenda abre hasta ${c.dias} días adelante.`
  const horario = horarioReserva(c, dia)
  if (horario.cerrada) return 'La casa no recibe reservas ese día.'
  if (h < horario.abre || h + Number(horas) > horario.cierra) return 'Elegí una visita dentro del horario de la casa.'
  return null
}
const objeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const entero = (v: unknown, min: number, max: number) => Number.isInteger(v) && Number(v) >= min && Number(v) <= max
export function configuracionReservasValida(v: unknown): v is ConfiguracionReservas {
  if (!objeto(v) || !entero(v.version, 1, 1e9) || !entero(v.dias, 1, 90) || !entero(v.anticipacion, 30, 1440) || !entero(v.maxHoras, 1, 6) || !entero(v.maxActivas, 1, 10)) return false
  const horario = (h: unknown) => objeto(h) && entero(h.abre, 0, 23) && entero(h.cierra, 1, 24) && Number(h.abre) < Number(h.cierra)
  if (!Array.isArray(v.horario) || v.horario.length !== 7 || !v.horario.every(horario)) return false
  if (!Array.isArray(v.excepciones) || v.excepciones.length > 120 || !v.excepciones.every(e => objeto(e) && fechaReserva(e.dia) && typeof e.cerrada === 'boolean' && horario(e)) || new Set(v.excepciones.map(e => e.dia)).size !== v.excepciones.length) return false
  if (!Array.isArray(v.cierres) || v.cierres.length > 200 || !v.cierres.every(x=>objeto(x)&&fechaReserva(x.dia)&&ZONAS_RESERVA.some(z=>z.id===x.zona)&&entero(x.desde,0,23)&&entero(x.hasta,1,24)&&Number(x.desde)<Number(x.hasta)&&typeof x.motivo==='string'&&x.motivo.trim().length>=5&&x.motivo.length<=300)) return false
  if (!Array.isArray(v.zonas) || v.zonas.length !== 5 || !v.zonas.every(objeto) || new Set(v.zonas.map(z => z.id)).size !== 5) return false
  for (const z of v.zonas) {
    if (!objeto(z) || !ZONAS_RESERVA.some(x => x.id === z.id) || typeof z.descripcion !== 'string' || z.descripcion.length > 600 || typeof z.accesibilidad !== 'string' || z.accesibilidad.length > 600 || !Array.isArray(z.mesas) || z.mesas.length > 100 || !Array.isArray(z.combinaciones) || z.combinaciones.length > 100) return false
    if (!z.mesas.every(m => objeto(m) && typeof m.id === 'string' && /^[a-zA-Z0-9_-]{1,32}$/.test(m.id) && entero(m.plazas, 1, 12)) || new Set(z.mesas.map(m => m.id)).size !== z.mesas.length) return false
    if (!z.combinaciones.every(g => Array.isArray(g) && g.length >= 2 && g.length <= 12 && new Set(g).size === g.length && g.every(id => (z.mesas as MesaReserva[]).some(m => m.id === id)))) return false
  }
  return objeto(v.politica) && entero(v.politica.version, 1, 1e9) && v.politica.tipo === 'anticipo' && v.politica.importe === 50000 && v.politica.cancelacion === REEMBOLSO_RESERVAS.cancelacion && v.politica.inasistencia === REEMBOLSO_RESERVAS.inasistencia
}
export type ComprobanteReserva = {
  id: string; zona: string; cuando: string; termina: string; personas: number; deposito: number
  estado: 'confirmada' | 'llego' | 'sentada' | 'finalizada' | 'no_asistio' | 'cancelada'
  version: number; cancelada: string | null; mesas: string[]; politica: ConfiguracionReservas['politica'] | null
  anticipo_aplicado: number; anticipo_devuelto: number; referencia: string | null
}
export type ReciboReserva = { reserva: ComprobanteReserva; yaEstaba: boolean; cobrado: number }
const fechaISO = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(v) && fechaReserva(v.slice(0,10)) && Number(v.slice(11,13)) < 24 && Number(v.slice(14,16)) < 60 && Number(v.slice(17,19)) < 60 && Number.isFinite(Date.parse(v))
export function comprobanteReservaValido(v: unknown): v is ComprobanteReserva {
  if (objeto(v) && v.politica !== null && (!objeto(v.politica) || !entero(v.politica.version,1,1e9) || typeof v.politica.cancelacion !== 'string' || typeof v.politica.inasistencia !== 'string')) return false
  return objeto(v) && typeof v.id === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(v.id) && ZONAS_RESERVA.some(z => z.id === v.zona) && fechaISO(v.cuando) && fechaISO(v.termina) && Date.parse(String(v.termina)) > Date.parse(String(v.cuando)) && entero(v.personas, 1, 12) && entero(v.deposito, 0, 50000) && entero(v.version, 1, 1e9) && ['confirmada', 'llego', 'sentada', 'finalizada', 'no_asistio', 'cancelada'].includes(String(v.estado)) && (v.cancelada === null || fechaISO(v.cancelada)) && Array.isArray(v.mesas) && v.mesas.every(m => typeof m === 'string') && entero(v.anticipo_aplicado, 0, Number(v.deposito)) && entero(v.anticipo_devuelto, 0, Number(v.deposito)) && Number(v.anticipo_aplicado) + Number(v.anticipo_devuelto) <= Number(v.deposito) && (v.referencia === null || typeof v.referencia === 'string') && (v.politica === null || objeto(v.politica) && v.politica.tipo === 'anticipo' && v.politica.importe === 50000)
}
export function reciboReservaValido(v: unknown): v is ReciboReserva { return objeto(v) && comprobanteReservaValido(v.reserva) && typeof v.yaEstaba === 'boolean' && entero(v.cobrado, 0, 50000) }
export type DisponibilidadReservas = { dia: string; actualizado: string; version: number; zonas: Record<string, { configurada: boolean; horas: number[] }> }
export function disponibilidadReservasValida(v: unknown, diaEsperado?:string): v is DisponibilidadReservas {
  return objeto(v) && fechaReserva(v.dia) && (!diaEsperado||v.dia===diaEsperado) && fechaISO(v.actualizado) && entero(v.version, 1, 1e9) && objeto(v.zonas) && ZONAS_RESERVA.every(z => { const r = (v.zonas as Record<string, unknown>)[z.id]; return objeto(r) && typeof r.configurada === 'boolean' && Array.isArray(r.horas) && r.horas.every(h => entero(h, 0, 23)) && new Set(r.horas).size===r.horas.length && (r.configurada||!r.horas.length) })
}
export function calendarioReserva(r: ComprobanteReserva) {
  const utc = (s: string) => new Date(s).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//La Bella Lupita//Reservas//ES', 'BEGIN:VEVENT', `UID:${r.id}@labellalupita`, `DTSTAMP:${utc(new Date().toISOString())}`, `DTSTART:${utc(r.cuando)}`, `DTEND:${utc(r.termina)}`, `SUMMARY:Reserva en La Bella Lupita - ${nombreZona(r.zona)}`, `DESCRIPTION:${r.personas} personas. Comprobante ${r.id}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n')
}
