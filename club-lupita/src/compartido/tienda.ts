export type FichaTienda = {
  nombre: string; presentacion: string; gramos: number; origen: string; proceso: string; perfil: string
  retiroDesde: string; retiroHasta: string; lugar: string; horario: string; politica: string
  foto: string; fotoAlt: string; fuente: string; habilitada: boolean
}
export const FICHA_TIENDA: FichaTienda = { nombre: 'Reserva de Cosecha', presentacion: '', gramos: 250, origen: '', proceso: '', perfil: '', retiroDesde: '', retiroHasta: '', lugar: '', horario: '', politica: '', foto: '', fotoAlt: '', fuente: '', habilitada: false }
const objeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const entero = (v: unknown, min = 0): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= min
const fecha = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v
export function fichaValida(v: unknown): v is FichaTienda {
  if (!objeto(v) || Object.keys(v).length !== Object.keys(FICHA_TIENDA).length) return false
  return Object.keys(FICHA_TIENDA).filter(k => !['gramos','habilitada'].includes(k)).every(k => typeof v[k] === 'string' && (v[k] as string).length <= (k === 'politica' ? 2000 : 400))
    && entero(v.gramos,1) && v.gramos <= 10000 && typeof v.habilitada === 'boolean'
    && (v.retiroDesde === '' || fecha(v.retiroDesde)) && (v.retiroHasta === '' || fecha(v.retiroHasta))
    && (v.foto === '' || typeof v.foto === 'string' && /^\/(?!\/)[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp)$/.test(v.foto) && !v.foto.includes('..') && !!String(v.fotoAlt).trim())
}
export function faltantesFicha(f: FichaTienda) {
  const campos: (keyof FichaTienda)[] = ['nombre','presentacion','origen','retiroDesde','retiroHasta','lugar','horario','politica','fuente']
  return campos.filter(k => !String(f[k]).trim()).concat(f.retiroDesde > f.retiroHasta ? ['retiroHasta'] : [])
}
export type OfertaTienda = { generacion: number; revision: number; precio: number; quedan: number; total: number; ficha: FichaTienda; disponible: boolean; motivo: string }
export type CotizacionTienda = { id: string; referencia: string; vence: string; oferta: OfertaTienda }
export type ReciboTienda = { numero: number; cobrado: number; saldo: { total: number; pagado: number; bono: number }; compra?: string; cotizacion?: CotizacionTienda; repetido?: boolean }
export function ofertaValida(v: unknown): v is OfertaTienda {
  return objeto(v) && ['generacion','revision','precio','quedan','total'].every(k => entero(v[k])) && Number(v.quedan) <= Number(v.total) && fichaValida(v.ficha) && typeof v.disponible === 'boolean' && typeof v.motivo === 'string'
}
export function cotizacionValida(v: unknown): v is CotizacionTienda {
  return objeto(v) && typeof v.id === 'string' && /^[a-f0-9-]{36}$/.test(v.id) && typeof v.referencia === 'string' && typeof v.vence === 'string' && Number.isFinite(Date.parse(v.vence)) && ofertaValida(v.oferta) && v.oferta.precio > 0
}
export function reciboValido(v: unknown): v is ReciboTienda {
  return objeto(v) && entero(v.numero,1) && entero(v.cobrado,1) && objeto(v.saldo) && ['total','pagado','bono'].every(k => entero((v.saldo as Record<string,unknown>)[k]))
    && (v.compra === undefined || typeof v.compra === 'string' && /^[a-f0-9-]{36}$/.test(v.compra)) && (v.cotizacion === undefined || cotizacionValida(v.cotizacion))
}
export const EVENTOS_TIENDA = ['vista','oferta','saldo_insuficiente','comprobante','error_red','error_contrato','error_servidor','error_rechazo','cotizar','confirmar','compra_ok','compra_error','incierto','recuperado','recarga','agotado','encargo','beneficio'] as const
export type EventoTienda = typeof EVENTOS_TIENDA[number]
