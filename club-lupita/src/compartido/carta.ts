import { CARTA, type PlatoCarta } from '../data/menu'

export const LIMITES_CARTA = { porProducto: 20, porPedido: 40, lineas: 40 } as const
export type Elecciones = Record<string, string>
export type LineaPedido = { id: string; cuanto: number; opciones?: Elecciones }
export type RestriccionPedido = { texto: string; confirmada: true } | null
export type OpcionCarta = { id: string; nombre: string; obligatoria: boolean; valores?: { id: string; nombre: string; suplemento: number }[] }
export type OpcionElegida = { id: string; nombre: string; valor: string; suplemento: number }
export type LineaCotizada = { id: string; clave: string; nombre: string; precio: number; cuanto: number; opciones: OpcionElegida[]; precioAntes?:number; descuentoClub?:number }
export type CotizacionCarta = { id: string; referencia: string; vence: string; lineas: LineaCotizada[]; subtotal: number; empaque: number; total: number; restriccion: RestriccionPedido; minutos: number | null }
export type ReciboCarta = { cobrado: number; saldo: { pagado: number; bono: number; total: number }; pedido: { id: string; numero: number; estado: string }; cotizacion?: CotizacionCarta; repetido?: boolean }
export type HorarioCarta = { abre: string; cierra: string } | null
export type ConfiguracionCarta = {
  horario: HorarioCarta[]; pausaHasta: string | null; motivoPausa: string;
  agotados: string[]; categoriasPausadas: string[]; empaque: number;
  capacidad: number | null; minutos: number | null;
}
/** Reglas de horario y empaque confirmadas por el propietario el 9/10/2026. */
export const CONFIGURACION_CARTA: ConfiguracionCarta = {
  horario: [{ abre: '08:00', cierra: '21:00' }, ...Array.from({ length: 6 }, () => ({ abre: '07:00', cierra: '21:00' }))],
  pausaHasta: null, motivoPausa: '', agotados: [], categoriasPausadas: [], empaque: 4000, capacidad: null, minutos: null,
}
const valores = (...nombres: string[]) => nombres.map(nombre => ({ id: normalizarCarta(nombre).replaceAll(' ', '-'), nombre, suplemento: 0 }))
export function opcionesDe(id: string): OpcionCarta[] {
  if (id === 'ensalada-lupita') return [{ id: 'proteina', nombre: 'Proteína', obligatoria: true, valores: valores('Camarón', 'Pollo', 'Res') }]
  if (id === 'agua') return [{ id: 'temperatura', nombre: 'Temperatura', obligatoria: true, valores: valores('Fría', 'Al tiempo') }]
  if (['risotto-gallo-pinto', 'la-bella-lupita'].includes(id)) return [{ id: 'huevo', nombre: '¿Cómo querés el huevo?', obligatoria: true }]
  return []
}
export function normalizarCarta(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/capuchino|capuccino|cappucino/g, 'cappuccino')
}
export function claveLinea(l: Pick<LineaPedido, 'id' | 'opciones'>): string {
  return JSON.stringify([l.id, Object.entries(l.opciones ?? {}).sort(([a], [b]) => a.localeCompare(b))])
}
/** Valida la intención sin consultar el catálogo: también sirve para recibos antiguos. */
export function normalizarLineas(entrada: unknown): LineaPedido[] {
  if (!Array.isArray(entrada) || !entrada.length || entrada.length > LIMITES_CARTA.lineas) throw Error('Elegí entre 1 y 40 líneas para tu pedido.')
  const agrupadas = new Map<string, LineaPedido>(), cantidades = new Map<string, number>()
  let total = 0
  for (const l of entrada) {
    if (!l || typeof l !== 'object' || typeof l.id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(l.id)
      || !Number.isInteger(l.cuanto) || l.cuanto < 1 || l.cuanto > LIMITES_CARTA.porProducto) throw Error('Cada producto admite entre 1 y 20 unidades.')
    const opciones: Elecciones = {}
    if (l.opciones !== undefined) {
      if (!l.opciones || typeof l.opciones !== 'object' || Array.isArray(l.opciones) || Object.keys(l.opciones).length > 8) throw Error('Revisá las opciones del pedido.')
      for (const [k, v] of Object.entries(l.opciones).sort(([a], [b]) => a.localeCompare(b))) {
        if (!/^[a-z][a-z0-9-]{0,39}$/.test(k) || typeof v !== 'string' || !v.trim() || v.trim().length > 120 || /[\u0000-\u001f]/.test(v)) throw Error('Revisá las opciones del pedido.')
        opciones[k] = v.trim()
      }
    }
    const linea: LineaPedido = { id: l.id, cuanto: l.cuanto, ...(Object.keys(opciones).length ? { opciones } : {}) }
    const key = claveLinea(linea), antes = agrupadas.get(key)
    agrupadas.set(key, { ...linea, cuanto: (antes?.cuanto ?? 0) + linea.cuanto })
    cantidades.set(linea.id, (cantidades.get(linea.id) ?? 0) + linea.cuanto)
    total += linea.cuanto
  }
  if ([...cantidades.values()].some(n => n > LIMITES_CARTA.porProducto)) throw Error('El máximo es 20 unidades por producto, sumando sus opciones.')
  if (total > LIMITES_CARTA.porPedido) throw Error('El máximo es 40 artículos por pedido. Para pedidos mayores, consultá en barra.')
  return [...agrupadas.values()].sort((a, b) => claveLinea(a).localeCompare(claveLinea(b)))
}
export function normalizarRestriccion(r: unknown): RestriccionPedido {
  if (r === undefined || r === null) return null
  if (!r || typeof r !== 'object' || !('texto' in r) || typeof r.texto !== 'string' || !r.texto.trim()
    || r.texto.trim().length > 240 || !('confirmada' in r) || r.confirmada !== true || /[\u0000-\u001f]/.test(r.texto)) throw Error('Confirmá con el equipo la restricción antes de enviar el pedido.')
  return { texto: r.texto.trim(), confirmada: true }
}
export function intencionPedido(lineas: LineaPedido[], restriccion: RestriccionPedido = null) {
  return JSON.stringify({ version: 2, lineas: normalizarLineas(lineas), restriccion })
}
export function valorarLineas(lineas: LineaPedido[], catalogo: PlatoCarta[] = CARTA): LineaCotizada[] {
  return lineas.map(l => {
    const p = catalogo.find(p => p.id === l.id)
    if (!p) throw Error('Un producto ya no está en la carta. Revisá tu pedido.')
    const definiciones = opcionesDe(l.id), opciones: OpcionElegida[] = []
    if (Object.keys(l.opciones ?? {}).some(k => !definiciones.some(d => d.id === k))) throw Error('Una opción ya no está disponible. Revisá tu pedido.')
    for (const d of definiciones) {
      const v = l.opciones?.[d.id]
      if (!v && d.obligatoria) throw Error(`Elegí ${d.nombre.toLowerCase()} de ${p.nombre}.`)
      if (!v) continue
      const elegida = d.valores?.find(x => x.id === v)
      if (d.valores && !elegida) throw Error(`Revisá ${d.nombre.toLowerCase()} de ${p.nombre}.`)
      opciones.push({ id: d.id, nombre: d.nombre, valor: elegida?.nombre ?? v, suplemento: elegida?.suplemento ?? 0 })
    }
    return { id: p.id, clave: claveLinea(l), nombre: p.nombre, precio: p.precio + opciones.reduce((n, o) => n + o.suplemento, 0), cuanto: l.cuanto, opciones }
  })
}
export function estadoHorario(config: ConfiguracionCarta, ahora: Date) {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Managua', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(ahora)
  const get = (tipo: string) => partes.find(p => p.type === tipo)?.value ?? ''
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), hora = get('hour') + ':' + get('minute')
  const horario = config.horario[dia]
  if (config.pausaHasta && Date.parse(config.pausaHasta) > ahora.getTime()) return { abierto: false, motivo: config.motivoPausa || 'La recepción de pedidos está pausada temporalmente.' }
  if (!horario || hora < horario.abre || hora >= horario.cierra) return { abierto: false, motivo: 'Estamos fuera del horario de pedidos. Podés seguir consultando la carta.' }
  return { abierto: true, motivo: '' }
}
