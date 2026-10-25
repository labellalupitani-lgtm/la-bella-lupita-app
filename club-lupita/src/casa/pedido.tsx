/** Borrador por pestaña e intento enviado durable por cuenta. Nunca se revalora un pendiente. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CARTA } from './carta'
import { claveLinea, LIMITES_CARTA, normalizarLineas, type CotizacionCarta, type Elecciones, type LineaPedido, type RestriccionPedido } from '../compartido/carta'
import { cotizacionValida } from './carta-api'

export type Linea = LineaPedido
type Guardado = { version: 2; lineas: Linea[]; referencia: string; pendiente: boolean; cotizacion?: CotizacionCarta; restriccion?: RestriccionPedido }
const vacio = (): Guardado => ({ version: 2, lineas: [], referencia: crypto.randomUUID(), pendiente: false })
const referenciaValida = (s: unknown): s is string => typeof s === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(s)
function leer(clave: string, durable: string): { valor: Guardado; error: string } {
  try {
    const enviado = localStorage.getItem(durable), borrador = sessionStorage.getItem(clave), texto = enviado ?? borrador
    if (!texto) return { valor: vacio(), error: '' }
    const g = JSON.parse(texto)
    if (!referenciaValida(g.referencia)) throw Error('esquema')
    if (!Array.isArray(g.lineas) && enviado) return { valor: { version: 2, referencia: g.referencia, lineas: [], pendiente: true }, error: 'El contenido guardado está incompleto. Conservamos la referencia para consultar el cobro.' }
    if (!Array.isArray(g.lineas)) throw Error('esquema')
    const pendiente = !!enviado || g.pendiente === true
    // El documento pendiente conserva hasta los productos retirados, para consultar su referencia.
    const candidatas = g.lineas.filter((l: Linea) => l && CARTA.some(p => p.id === l.id))
    const lineas = pendiente ? g.lineas : candidatas.length ? normalizarLineas(candidatas) : []
    if (pendiente && g.lineas.some((l: Linea) => !l || typeof l.id !== 'string' || !Number.isInteger(l.cuanto) || l.cuanto < 1)) return { valor: { version: 2, referencia: g.referencia, lineas: [], pendiente: true }, error: 'El contenido guardado está incompleto. Consultá esta referencia antes de repetir el pedido.' }
    return { valor: { version: 2, referencia: g.referencia, lineas, pendiente, ...(cotizacionValida(g.cotizacion) ? { cotizacion: g.cotizacion } : {}), restriccion: cotizacionValida(g.cotizacion) ? g.cotizacion.restriccion : null }, error: '' }
  } catch { return { valor: vacio(), error: 'No pudimos recuperar el pedido guardado. Consultá Mis compras antes de enviar uno nuevo.' } }
}
function useValor(cuenta: string) {
  const clave = 'club-lupita:pedido:' + cuenta, durable = 'club-lupita:envio:' + cuenta
  const [inicial] = useState(() => leer(clave, durable)), [g, setG] = useState(inicial.valor), [errorGuardado, setError] = useState(inicial.error)
  const vigente = useRef(g)
  const guardar = useCallback((nuevo: Guardado) => {
    vigente.current = nuevo; setG(nuevo)
    try { sessionStorage.setItem(clave, JSON.stringify(nuevo)) } catch { setError('El borrador solo se conserva mientras esta pantalla permanezca abierta.') }
  }, [clave])
  useEffect(() => {
    const cambiar = (e: StorageEvent) => { if (e.key === durable) { const r = leer(clave, durable); vigente.current = r.valor; setG(r.valor); setError(r.error) } }
    window.addEventListener('storage', cambiar)
    return () => window.removeEventListener('storage', cambiar)
  }, [clave, durable])
  const cambiar = useCallback((lineas: Linea[]) => {
    if (vigente.current.pendiente) return false
    try { guardar({ ...vigente.current, lineas: lineas.length ? normalizarLineas(lineas) : [], cotizacion: undefined }); return true }
    catch (e) { setError((e as Error).message); return false }
  }, [guardar])
  const agregar = (id: string, cantidad = 1, opciones: Elecciones = {}) => cambiar([...vigente.current.lineas, { id, cuanto: cantidad, ...(Object.keys(opciones).length ? { opciones } : {}) }])
  const quitar = (claveDeLinea: string) => cambiar(vigente.current.lineas.flatMap(l => claveLinea(l) === claveDeLinea ? l.cuanto > 1 ? [{ ...l, cuanto: l.cuanto - 1 }] : [] : [l]))
  const vaciar = useCallback((confirmado = false) => {
    if (vigente.current.pendiente && !confirmado) return
    try {
      if (localStorage.getItem(durable) && !confirmado) { setError('Hay una referencia guardada. Consultá y cerrá el intento antes de vaciarlo.'); return }
      localStorage.removeItem(durable)
    } catch { setError('No pudimos limpiar la referencia local. Consultá Mis compras antes de repetir un pedido.'); return }
    setError(''); guardar(vacio())
  }, [durable, guardar])
  const iniciarEnvio = async (q: CotizacionCarta): Promise<boolean> => {
    if (!navigator.locks) { setError('Este navegador no permite proteger el envío entre pestañas. Actualizalo o pedí ayuda en barra.'); return false }
    return navigator.locks.request(durable, () => {
    const nuevo: Guardado = { ...vigente.current, pendiente: true, cotizacion: q, restriccion: q.restriccion }
    try {
      const otro = localStorage.getItem(durable)
      if (otro && JSON.parse(otro).referencia !== nuevo.referencia) { setError('Hay un envío pendiente en otra pestaña. Recargá para consultarlo.'); return false }
      localStorage.setItem(durable, JSON.stringify(nuevo))
      if (localStorage.getItem(durable) !== JSON.stringify(nuevo)) throw Error('persistencia')
    } catch { setError('No podemos conservar la referencia del envío en este navegador. Habilitá el almacenamiento o pedí ayuda en barra antes de pagar.'); return false }
    guardar(nuevo); return true
    })
  }
  const recuperarReferencia = (referencia: string) => {
    if (!referenciaValida(referencia)) return
    const nuevo: Guardado = { version: 2, referencia, lineas: [], pendiente: true }
    try { localStorage.setItem(durable, JSON.stringify(nuevo)) } catch { setError('No pudimos conservar la referencia. Consultá Mis compras.'); return }
    setError(''); guardar(nuevo)
  }
  const detalle = useMemo(() => g.lineas.flatMap(l => {
    const plato = CARTA.find(p => p.id === l.id)
    return plato ? [{ plato, cuanto: l.cuanto, opciones: l.opciones ?? {}, clave: claveLinea(l) }] : []
  }), [g.lineas])
  return { ...g, errorGuardado, detalle, articulos: g.lineas.reduce((s, l) => s + l.cuanto, 0), total: detalle.reduce((s, d) => s + d.plato.precio * d.cuanto, 0), agregar, quitar, vaciar, iniciarEnvio, recuperarReferencia,
    cuantoDe: (id: string) => g.lineas.filter(l => l.id === id).reduce((s, l) => s + l.cuanto, 0),
    disponiblePara: (id: string) => Math.max(0, Math.min(LIMITES_CARTA.porProducto - g.lineas.filter(l => l.id === id).reduce((s, l) => s + l.cuanto, 0), LIMITES_CARTA.porPedido - g.lineas.reduce((s, l) => s + l.cuanto, 0))),
  }
}
const Ctx = createContext<ReturnType<typeof useValor> | null>(null)
export function PedidoProvider({ children, cuenta }: { children: ReactNode; cuenta: string }) { const valor = useValor(cuenta); return <Ctx.Provider value={valor}>{children}</Ctx.Provider> }
export function usePedido() { const v = useContext(Ctx); if (!v) throw Error('usePedido fuera del PedidoProvider'); return v }
