import { pedirJSON, ErrorPeticion } from './http'
import { CONTRATO_CLUB } from '../compartido/club'
import type { PlatoCarta } from '../data/menu'
import type { Respuesta } from './datos'
import type { CotizacionCarta, HorarioCarta, LineaPedido, OpcionCarta, ReciboCarta, RestriccionPedido } from '../compartido/carta'

export type CartaActual = { platos: (PlatoCarta & { disponible: boolean; opciones: OpcionCarta[] })[]; abierto: boolean; motivo: string; horario: HorarioCarta[]; empaque: number; minutos: number | null; ahora: string; revision: number }
export type ResultadoIntento = { estado: 'confirmado'; recibo: ReciboCarta } | { estado: 'cerrado' | 'ausente' | 'sin_cobro'; cotizacion?: CotizacionCarta | null }
const objeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const entero = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0
export function cotizacionValida(v: unknown): v is CotizacionCarta {
  return objeto(v) && (v.minutos === null || entero(v.minutos) && v.minutos >= 1 && v.minutos <= 180) && typeof v.id === 'string' && typeof v.referencia === 'string' && typeof v.vence === 'string' && Number.isFinite(Date.parse(v.vence))
    && entero(v.subtotal) && entero(v.empaque) && entero(v.total) && v.total === v.subtotal + v.empaque
    && Array.isArray(v.lineas) && v.lineas.length > 0 && v.lineas.every(l => objeto(l) && typeof l.id === 'string' && typeof l.clave === 'string'
      && typeof l.nombre === 'string' && entero(l.precio) && entero(l.cuanto) && l.cuanto > 0 && Array.isArray(l.opciones)
      && (l.precioAntes===undefined&&l.descuentoClub===undefined || entero(l.precioAntes)&&l.descuentoClub===CONTRATO_CLUB.descuentoReposteria&&l.precio===Math.round(l.precioAntes*(100-CONTRATO_CLUB.descuentoReposteria)/100))
      && l.opciones.every(o => objeto(o) && typeof o.id === 'string' && typeof o.nombre === 'string' && typeof o.valor === 'string' && entero(o.suplemento)))
    && v.lineas.reduce((s, l) => s + l.precio * l.cuanto, 0) === v.subtotal
    && (v.restriccion === null || objeto(v.restriccion) && typeof v.restriccion.texto === 'string' && v.restriccion.confirmada === true)
}
export function reciboValido(v: unknown): v is ReciboCarta {
  return objeto(v) && entero(v.cobrado) && v.cobrado > 0 && objeto(v.saldo) && ['pagado', 'bono', 'total'].every(k => entero((v.saldo as Record<string, unknown>)[k]))
    && (v.saldo.pagado as number) + (v.saldo.bono as number) === v.saldo.total
    && objeto(v.pedido) && typeof v.pedido.id === 'string' && /^[a-f0-9-]{36}$/.test(v.pedido.id) && entero(v.pedido.numero) && v.pedido.numero > 0
    && ['recibido', 'aceptado', 'preparando', 'listo', 'entregado', 'cancelado'].includes(String(v.pedido.estado))
    && (v.cotizacion === undefined || cotizacionValida(v.cotizacion) && v.cotizacion.total === v.cobrado)
}
async function pedir<T>(ruta: string, validar: (v: unknown) => boolean, cuerpo?: unknown): Promise<Respuesta<T>> {
  try {
    const datos = await pedirJSON<T>(ruta, cuerpo === undefined ? {} : { method: 'POST', body: JSON.stringify(cuerpo) })
    if (!validar(datos)) return { ok: false, resultadoIncierto: cuerpo !== undefined, error: 'La respuesta está incompleta. Consultá el estado del intento antes de repetir el pedido.' }
    return { ok: true, datos }
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : 'No pudimos consultar la carta.', ...(e instanceof ErrorPeticion ? { codigo: e.status, resultadoIncierto: e.resultadoIncierto } : {}) } }
}
const resultadoValido = (v: unknown) => objeto(v) && (v.estado === 'confirmado' ? reciboValido(v.recibo) : ['cerrado', 'ausente', 'sin_cobro'].includes(String(v.estado)) && (v.cotizacion == null || cotizacionValida(v.cotizacion)))
export const cartaApi = {
  leer: () => pedir<CartaActual>('/carta', v => objeto(v) && Array.isArray(v.platos) && v.platos.length > 0 && v.platos.every(p => objeto(p) && typeof p.id === 'string' && typeof p.nombre === 'string' && typeof p.descripcion === 'string' && entero(p.precio) && typeof p.disponible === 'boolean' && typeof p.categoria === 'string' && ['barra','brunch','bistro','sobremesa'].includes(String(p.momento)) && (p.foto === null || typeof p.foto === 'string' && p.foto.startsWith('/')) && Array.isArray(p.etiquetas) && p.etiquetas.every(x => typeof x === 'string') && Array.isArray(p.opciones)) && typeof v.abierto === 'boolean' && typeof v.motivo === 'string' && entero(v.empaque) && Array.isArray(v.horario) && v.horario.length === 7 && v.horario.every(h => h === null || objeto(h) && typeof h.abre === 'string' && typeof h.cierra === 'string')),
  cotizar: (lineas: LineaPedido[], ref: string, restriccion: RestriccionPedido) => pedir<CotizacionCarta>('/carta/cotizar', cotizacionValida, { lineas, ref, restriccion }),
  cobrar: (lineas: LineaPedido[], ref: string, cotizacionId?: string, restriccion: RestriccionPedido = null) => pedir<ReciboCarta>('/cuenta/cobrar', reciboValido, { lineas, ref, cotizacionId, restriccion }),
  consultar: (ref: string) => pedir<ResultadoIntento>('/carta/intento/' + encodeURIComponent(ref), resultadoValido),
  cerrar: (ref: string) => pedir<ResultadoIntento>('/carta/intento/' + encodeURIComponent(ref) + '/cerrar', resultadoValido, {}),
}
