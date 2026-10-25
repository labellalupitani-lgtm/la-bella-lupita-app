/**
 * Estado de la sesión del socio.
 *
 * Funciona primero en el navegador (para que la app sea navegable y demostrable
 * sin conexión) y sincroniza contra el Worker cuando hay API disponible.
 * El dinero siempre es entero de centavos; el saldo se deriva del libro mayor,
 * nunca se guarda como número suelto.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import { NIVELES, type NivelId } from '../data/copy'
import { buscarPlato } from '../data/menu'
import { api, guardarToken, leerToken, olvidarToken, type Resultado } from './api'

export type MovimientoCuenta = {
  id: string
  fecha: string
  concepto: string
  /** centavos; positivo entra, negativo sale */
  monto: number
  /** el bono de la casa se contabiliza aparte para poder medir breakage */
  tipo: 'recarga' | 'bono' | 'consumo' | 'deposito' | 'regalo'
}

export type Sello = {
  n: number
  fecha: string
  motivo: string
  barista: string
}

export type LineaPedido = { platoId: string; cantidad: number; nota?: string }

export type Socio = {
  nombre: string
  telefono: string
  desde: string
  numeroSocio: number | null
  esMiembro: boolean
  membresiaHasta: string | null
  /** mes (AAAA-MM, hora de Managua) en que se retiro la bolsa; null si no */
  bolsaDelMes: string | null
  /** dia (AAAA-MM-DD, hora de Managua) en que se uso la bebida */
  bebidaDelDia: string | null
  tandasCerradas: number
  sellos: Sello[]
  cuenta: MovimientoCuenta[]
  bebidaDeSiempre: string
  alergias: string
  cumple: string
}

export type Estado = {
  socio: Socio
  carrito: LineaPedido[]
  registrado: boolean
  /** vale vivo de la décima, emitido y contado por el servidor */
  vale: { codigo: string } | null
  /** desglose del saldo tal como lo calcula el servidor; manda sobre el local */
  saldoServidor: { pagado: number; bono: number; total: number } | null
  /** cupos vivos, compartidos con el servidor cuando existe */
  cupos: { sociosFundadores: number; bolsasReserva: number; mesaTostador: number }
  /** butacas libres por experiencia, tal como las cuenta el servidor.
   *  Si no hay respuesta, queda vacio y la interfaz dice «ultimas sillas»
   *  sin cifra: nunca una escasez inventada. */
  cuposExperiencia?: Record<string, number>
}

/** El dia y el mes tal como los vive la casa. Managua es UTC-6: a las 18:01
 *  locales el reloj UTC ya cambio de dia, y calcular la ventana en UTC
 *  regalaba dos bebidas de cortesia en doce horas. */
const enManagua = (d = new Date()) => new Date(d.getTime() - 6 * 3_600_000)
export const diaDeCasa = (d = new Date()) => enManagua(d).toISOString().slice(0, 10)
export const mesDeCasa = (d = new Date()) => enManagua(d).toISOString().slice(0, 7)

const HOY = new Date()
const diasAtras = (n: number) => new Date(HOY.getTime() - n * 86_400_000).toISOString()

/** Socia demo con historial creíble de cuatro meses. */
const SOCIA_DEMO: Socio = {
  nombre: 'María',
  telefono: '8744-2005',
  desde: diasAtras(124),
  numeroSocio: 37,
  esMiembro: true,
  membresiaHasta: new Date(HOY.getTime() + 15 * 86_400_000).toISOString(),
  bolsaDelMes: null,
  bebidaDelDia: null,
  tandasCerradas: 2,
  sellos: [
    { n: 1, fecha: diasAtras(26), motivo: 'Cappuccino', barista: 'Iveth' },
    { n: 2, fecha: diasAtras(23), motivo: 'Bagel de Salmón', barista: 'Iveth' },
    { n: 3, fecha: diasAtras(19), motivo: 'Cortadito', barista: 'Denis' },
    { n: 4, fecha: diasAtras(16), motivo: 'Risotto de Gallo Pinto', barista: 'Iveth' },
    { n: 5, fecha: diasAtras(12), motivo: 'Latte', barista: 'Marlon' },
    { n: 6, fecha: diasAtras(9), motivo: 'Dulce Tentación', barista: 'Denis' },
    { n: 7, fecha: diasAtras(4), motivo: 'Espresso', barista: 'Iveth' },
  ],
  cuenta: [
    { id: 'm1', fecha: diasAtras(31), concepto: 'Recarga en caja', monto: 100000, tipo: 'recarga' },
    { id: 'm2', fecha: diasAtras(31), concepto: 'La casa puso', monto: 10000, tipo: 'bono' },
    { id: 'm3', fecha: diasAtras(26), concepto: 'Cappuccino', monto: -9500, tipo: 'consumo' },
    { id: 'm4', fecha: diasAtras(23), concepto: 'Bagel de Salmón', monto: -43000, tipo: 'consumo' },
    { id: 'm5', fecha: diasAtras(19), concepto: 'Cortadito', monto: -9000, tipo: 'consumo' },
    { id: 'm6', fecha: diasAtras(16), concepto: 'Risotto de Gallo Pinto', monto: -28000, tipo: 'consumo' },
    { id: 'm7', fecha: diasAtras(12), concepto: 'Recarga en caja', monto: 100000, tipo: 'recarga' },
    { id: 'm8', fecha: diasAtras(12), concepto: 'La casa puso', monto: 10000, tipo: 'bono' },
    { id: 'm9', fecha: diasAtras(9), concepto: 'Dulce Tentación', monto: -32000, tipo: 'consumo' },
    { id: 'm10', fecha: diasAtras(4), concepto: 'Espresso', monto: -8000, tipo: 'consumo' },
  ],
  bebidaDeSiempre: 'Cappuccino con leche de almendra',
  alergias: 'Nueces',
  cumple: '09-14',
}

const INICIAL: Estado = {
  socio: SOCIA_DEMO,
  carrito: [],
  vale: null,
  saldoServidor: null,
  // Nadie entra sin pasar por el umbral. Entrar automáticamente a la cuenta
  // de demostración hacía que dos visitantes compartieran monedero y tanda,
  // y desde que las compras escriben en el servidor, que se corrompieran.
  registrado: false,
  cupos: { sociosFundadores: 18, bolsasReserva: 34, mesaTostador: 4 },
}

/** Lo que devuelve `GET /api/yo`. Es la forma de la verdad del servidor. */
export type RespuestaYo = {
  vale: { codigo: string; vence: string } | null
  socio: { telefono: string; nombre: string; creado: string; bebida_siempre: string | null; alergias: string | null; cumple: string | null }
  sellos: { n: number; motivo: string; barista: string; puesto: string }[]
  saldo: { pagado: number; bono: number; total: number }
  membresia: { numero: number; estado: string; hasta: string } | null
  movimientos: { id: number; monto: number; tipo: string; concepto: string; creado: string }[]
  tandasCerradas: number
  bebidaDelDia: string | null
  bolsaDelMes: string | null
}

type Accion =
  | { tipo: 'registrar'; nombre: string; telefono: string }
  | { tipo: 'sellar'; motivo: string; barista?: string }
  | { tipo: 'canjearTanda' }
  | { tipo: 'recargar'; monto: number; bono: number }
  | { tipo: 'agregarAlCarrito'; platoId: string; cantidad?: number }
  | { tipo: 'quitarDelCarrito'; platoId: string }
  | { tipo: 'ajustarCantidad'; platoId: string; cantidad: number }
  | { tipo: 'vaciarCarrito' }
  | { tipo: 'pagarPedido' }
  | { tipo: 'retirarBolsa' }
  | { tipo: 'usarBebidaDelDia' }
  | { tipo: 'hacerseMiembro' }
  | { tipo: 'cancelarMembresia' }
  | { tipo: 'apartarBolsaReserva' }
  | { tipo: 'apartarExperiencia'; experienciaId: string; nombre: string; precio: number }
  | { tipo: 'actualizarPerfil'; campos: Partial<Socio> }
  | { tipo: 'cobrar'; monto: number; concepto: string; ref: string }
  | { tipo: 'hidratar'; datos: RespuestaYo }
  | { tipo: 'cuposDelServidor'; cupos: Estado['cupos']; experiencias?: Record<string, number> }
  | { tipo: 'salir' }
  | { tipo: 'verComoNuevo' }
  | { tipo: 'volverALaDemo' }
  | { tipo: 'restaurar'; estado: Estado }

/** El saldo vive en el libro mayor. El reducer lo recalcula antes de cobrar:
 *  la vista puede deshabilitar un boton, pero la capa del dinero no confia. */
const saldoDe = (s: Socio) => s.cuenta.reduce((acc, m) => acc + m.monto, 0)

export const bebidaDisponible = (s: Socio) => s.esMiembro && s.bebidaDelDia !== diaDeCasa()
export const bolsaDisponible = (s: Socio) => s.esMiembro && s.bolsaDelMes !== mesDeCasa()

function reducer(e: Estado, a: Accion): Estado {
  switch (a.tipo) {
    case 'registrar':
      return {
        ...e,
        registrado: true,
        socio: {
          ...e.socio,
          nombre: a.nombre,
          telefono: a.telefono,
          desde: new Date().toISOString(),
          numeroSocio: null,
          esMiembro: false,
          membresiaHasta: null,
          tandasCerradas: 0,
          // dos sellos de regalo: endowed progress
          sellos: [
            { n: 1, fecha: new Date().toISOString(), motivo: 'De parte de la casa', barista: 'La casa' },
            { n: 2, fecha: new Date().toISOString(), motivo: 'De parte de la casa', barista: 'La casa' },
          ],
          cuenta: [],
          // Nadie hereda la alergia de otro: esta ficha la lee el barista.
          bebidaDeSiempre: '',
          alergias: '',
          cumple: '',
        },
      }

    case 'sellar': {
      if (e.socio.sellos.length >= 9) return e
      const n = e.socio.sellos.length + 1
      return {
        ...e,
        socio: {
          ...e.socio,
          sellos: [
            ...e.socio.sellos,
            { n, fecha: new Date().toISOString(), motivo: a.motivo, barista: a.barista ?? 'Iveth' },
          ],
        },
      }
    }

    case 'canjearTanda':
      if (e.socio.sellos.length < 9) return e
      return {
        ...e,
        socio: { ...e.socio, sellos: [], tandasCerradas: e.socio.tandasCerradas + 1 },
      }

    case 'recargar': {
      const ahora = new Date().toISOString()
      const id = `r${Date.now()}`
      return {
        ...e,
        socio: {
          ...e.socio,
          cuenta: [
            ...e.socio.cuenta,
            { id, fecha: ahora, concepto: 'Recarga', monto: a.monto, tipo: 'recarga' },
            { id: `${id}b`, fecha: ahora, concepto: 'La casa puso', monto: a.bono, tipo: 'bono' },
          ],
        },
      }
    }

    case 'agregarAlCarrito': {
      const existe = e.carrito.find((l) => l.platoId === a.platoId)
      if (existe) {
        return {
          ...e,
          carrito: e.carrito.map((l) =>
            l.platoId === a.platoId ? { ...l, cantidad: l.cantidad + (a.cantidad ?? 1) } : l,
          ),
        }
      }
      return { ...e, carrito: [...e.carrito, { platoId: a.platoId, cantidad: a.cantidad ?? 1 }] }
    }

    case 'quitarDelCarrito':
      return { ...e, carrito: e.carrito.filter((l) => l.platoId !== a.platoId) }

    case 'ajustarCantidad':
      return {
        ...e,
        carrito: a.cantidad <= 0
          ? e.carrito.filter((l) => l.platoId !== a.platoId)
          : e.carrito.map((l) => (l.platoId === a.platoId ? { ...l, cantidad: a.cantidad } : l)),
      }

    case 'vaciarCarrito':
      return { ...e, carrito: [] }

    case 'pagarPedido': {
      const total = e.carrito.reduce((s, l) => {
        const p = buscarPlato(l.platoId)
        return s + (p ? p.precio * l.cantidad : 0)
      }, 0)
      if (total === 0 || total > saldoDe(e.socio)) return e
      const ahora = new Date().toISOString()
      const detalle = e.carrito
        .map((l) => buscarPlato(l.platoId)?.nombre ?? '')
        .filter(Boolean)
        .slice(0, 2)
        .join(', ')
      return {
        ...e,
        carrito: [],
        socio: {
          ...e.socio,
          cuenta: [
            ...e.socio.cuenta,
            {
              id: `p${Date.now()}`,
              fecha: ahora,
              concepto: e.carrito.length > 2 ? `${detalle} y ${e.carrito.length - 2} más` : detalle,
              monto: -total,
              tipo: 'consumo',
            },
          ],
          // Un sello por VISITA. Sin esta guarda, nueve micro-pedidos seguidos
          // desde el sofa cerraban la tanda sin pisar la casa.
          sellos:
            e.socio.sellos.length < 9 &&
            !e.socio.sellos.some((x) => diaDeCasa(new Date(x.fecha)) === diaDeCasa(new Date(ahora)))
              ? [
                  ...e.socio.sellos,
                  {
                    n: e.socio.sellos.length + 1,
                    fecha: ahora,
                    motivo: detalle || 'Pedido',
                    barista: 'Pedido anticipado',
                  },
                ]
              : e.socio.sellos,
        },
      }
    }

    case 'retirarBolsa':
      if (!bolsaDisponible(e.socio)) return e
      return { ...e, socio: { ...e.socio, bolsaDelMes: mesDeCasa() } }

    case 'usarBebidaDelDia':
      if (!bebidaDisponible(e.socio)) return e
      return { ...e, socio: { ...e.socio, bebidaDelDia: diaDeCasa() } }

    case 'hacerseMiembro': {
      const CUOTA = 95000
      if (e.cupos.sociosFundadores <= 0) return e
      if (e.socio.esMiembro) return e
      // La cuota se cobra en el mismo acto en que se toma el cupo.
      if (saldoDe(e.socio) < CUOTA) return e
      return {
        ...e,
        cupos: { ...e.cupos, sociosFundadores: e.cupos.sociosFundadores - 1 },
        socio: {
          ...e.socio,
          esMiembro: true,
          numeroSocio: e.socio.numeroSocio ?? 100 - e.cupos.sociosFundadores + 1,
          membresiaHasta: new Date(Date.now() + 30 * 86_400_000).toISOString(),
          cuenta: [
            ...e.socio.cuenta,
            {
              id: 'mem' + Date.now(),
              fecha: new Date().toISOString(),
              concepto: 'Mesa Fundadora - primer mes',
              monto: -CUOTA,
              tipo: 'consumo',
            },
          ],
        },
      }
    }

    case 'cancelarMembresia':
      if (!e.socio.esMiembro) return e
      return {
        ...e,
        cupos: { ...e.cupos, sociosFundadores: e.cupos.sociosFundadores + 1 },
        socio: { ...e.socio, esMiembro: false },
      }

    case 'apartarBolsaReserva': {
      const PRECIO = 89000
      if (e.cupos.bolsasReserva <= 0) return e
      if (saldoDe(e.socio) < PRECIO) return e
      const numero = 150 - e.cupos.bolsasReserva + 1
      return {
        ...e,
        cupos: { ...e.cupos, bolsasReserva: e.cupos.bolsasReserva - 1 },
        socio: {
          ...e.socio,
          cuenta: [
            ...e.socio.cuenta,
            {
              id: 'bolsa' + numero,
              fecha: new Date().toISOString(),
              concepto: 'Reserva de Cosecha - bolsa ' + String(numero).padStart(3, '0'),
              monto: -PRECIO,
              tipo: 'consumo',
            },
          ],
        },
      }
    }

    case 'apartarExperiencia': {
      if (saldoDe(e.socio) < a.precio) return e
      const esTostador = a.experienciaId === 'mesa-tostador'
      if (esTostador && e.cupos.mesaTostador <= 0) return e
      return {
        ...e,
        cupos: esTostador ? { ...e.cupos, mesaTostador: e.cupos.mesaTostador - 1 } : e.cupos,
        socio: {
          ...e.socio,
          cuenta: [
            ...e.socio.cuenta,
            {
              id: 'exp' + a.experienciaId + Date.now(),
              fecha: new Date().toISOString(),
              concepto: 'Experiencia - ' + a.nombre,
              monto: -a.precio,
              tipo: 'consumo',
            },
          ],
        },
      }
    }

    case 'actualizarPerfil':
      return { ...e, socio: { ...e.socio, ...a.campos } }

    case 'hidratar': {
      // Cuando el Worker responde, manda él. El estado local deja de ser la
      // verdad y pasa a ser lo que se pinta mientras llega la respuesta.
      const d = a.datos
      return {
        ...e,
        registrado: true,
        vale: d.vale ? { codigo: d.vale.codigo } : null,
        saldoServidor: d.saldo,
        socio: {
          nombre: d.socio.nombre,
          telefono: d.socio.telefono,
          desde: d.socio.creado,
          numeroSocio: d.membresia?.numero ?? null,
          esMiembro: !!d.membresia,
          membresiaHasta: d.membresia?.hasta ?? null,
          bolsaDelMes: d.bolsaDelMes,
          bebidaDelDia: d.bebidaDelDia,
          tandasCerradas: d.tandasCerradas,
          sellos: d.sellos.map((s) => ({ n: s.n, fecha: s.puesto, motivo: s.motivo, barista: s.barista })),
          cuenta: d.movimientos
            .slice()
            .reverse()
            .map((m) => ({
              id: String(m.id),
              fecha: m.creado,
              concepto: m.concepto,
              monto: Number(m.monto),
              tipo: (['recarga', 'bono', 'consumo', 'deposito', 'regalo'].includes(m.tipo)
                ? m.tipo
                : Number(m.monto) >= 0
                  ? 'recarga'
                  : 'consumo') as MovimientoCuenta['tipo'],
            })),
          bebidaDeSiempre: d.socio.bebida_siempre ?? '',
          alergias: d.socio.alergias ?? '',
          cumple: d.socio.cumple ?? '',
        },
      }
    }

    case 'cobrar': {
      if (!Number.isInteger(a.monto) || a.monto <= 0) return e
      if (saldoDe(e.socio) < a.monto) return e
      if (e.socio.cuenta.some((m) => m.id === a.ref)) return e // no se cobra dos veces
      return {
        ...e,
        socio: {
          ...e.socio,
          cuenta: [
            ...e.socio.cuenta,
            {
              id: a.ref,
              fecha: new Date().toISOString(),
              concepto: a.concepto,
              monto: -a.monto,
              tipo: 'consumo',
            },
          ],
        },
      }
    }

    case 'salir':
      return { ...INICIAL, cupos: e.cupos, cuposExperiencia: e.cuposExperiencia }

    case 'verComoNuevo':
      // Para enseñar el umbral en una demostración: deja la cuenta como la de
      // alguien que nunca ha entrado, sin tocar los cupos del servidor.
      return {
        ...e,
        registrado: false,
        carrito: [],
        socio: {
          ...e.socio,
          nombre: '',
          telefono: '',
          numeroSocio: null,
          esMiembro: false,
          membresiaHasta: null,
          bolsaDelMes: null,
          bebidaDelDia: null,
          tandasCerradas: 0,
          sellos: [],
          cuenta: [],
          bebidaDeSiempre: '',
          alergias: '',
        },
      }

    case 'volverALaDemo':
      return { ...INICIAL, cupos: e.cupos }

    case 'cuposDelServidor':
      // El servidor manda: la escasez que se muestra tiene que ser verificable.
      return { ...e, cupos: a.cupos, cuposExperiencia: a.experiencias ?? e.cuposExperiencia }

    case 'restaurar':
      return a.estado

    default:
      return e
  }
}

// v2: el socio cambió de forma (los topes pasaron de booleano a fecha). Un
// merge superficial sobre v1 dejaba los campos nuevos en `undefined`, y eso
// devolvía la bebida y la bolsa que ya se habían usado.
const CLAVE = 'club-lupita:v2'
const CLAVE_VIEJA = 'club-lupita:v1'
const CUENTA_DEMO = '50587442005'

type Contexto = {
  estado: Estado
  despachar: (a: Accion) => void
  /** true cuando el Worker responde: entonces la verdad vive allá. */
  conServidor: boolean
  /**
   * Único camino de compra. Con servidor, cobra el Worker dentro de una
   * transacción y el estado se rehidrata con lo que él diga. Sin servidor,
   * cae al reducer para que la app siga siendo navegable en una demostración.
   */
  comprar: (
    llamada: () => Promise<Resultado<unknown>>,
    respaldo: Accion,
  ) => Promise<{ ok: true; datos?: unknown } | { ok: false; error: string }>
  /** Canjea un código de acceso por una sesión y trae la cuenta. */
  entrar: (telefono: string, codigo: string, nombre?: string) => Promise<{ ok: true } | { ok: false; error: string }>
  /** La cuenta de demostración, para enseñar la app sin dar un número real. */
  entrarComoDemo: () => Promise<{ ok: true } | { ok: false; error: string }>
  salir: () => void
  saldo: number
  saldoPagado: number
  saldoBono: number
  totalCarrito: number
  nivel: (typeof NIVELES)[number]
  siguienteNivel: (typeof NIVELES)[number] | null
  sellosParaSiguienteNivel: number
}

const Ctx = createContext<Contexto | null>(null)

export function EstadoProvider({ children }: { children: ReactNode }) {
  const [estado, despacharRaw] = useReducer(reducer, INICIAL, (base) => {
    try {
      localStorage.removeItem(CLAVE_VIEJA)
      const crudo = localStorage.getItem(CLAVE)
      if (crudo) {
        const guardado = JSON.parse(crudo) as Estado
        // Se valida campo por campo: nada de merge superficial.
        return {
          ...base,
          ...guardado,
          socio: { ...base.socio, ...guardado.socio },
          cupos: { ...base.cupos, ...guardado.cupos },
        }
      }
    } catch {
      /* almacenamiento bloqueado: seguimos con el estado base */
    }
    return base
  })

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      /* modo privado: la sesión vive solo en memoria */
    }
  }, [estado])

  const [conServidor, setConServidor] = useState(false)

  const refrescarCupos = useCallback(async () => {
    const r = await api.cupos()
    if (!r.ok) return
    const { experiencias, ...cupos } = r.datos
    const libres: Record<string, number> = {}
    for (const [id, x] of Object.entries(experiencias ?? {})) libres[id] = x.libres
    despacharRaw({ tipo: 'cuposDelServidor', cupos, experiencias: libres })
  }, [])

  const hidratar = useCallback(async () => {
    const yo = await api.yo()
    if (!yo.ok) return false
    despacharRaw({ tipo: 'hidratar', datos: yo.datos as unknown as RespuestaYo })
    return true
  }, [])

  // Arranque: cupos, sesión y hidratación. Si el Worker no está, la app sigue
  // funcionando contra el estado local y `conServidor` queda en falso, que es
  // lo que hace que las compras caigan al reducer en vez de mentir.
  useEffect(() => {
    let vivo = true
    ;(async () => {
      await refrescarCupos()
      if (!vivo) return
      // Sin token no se abre sesión sola: se entra por el umbral. Antes se
      // entraba automáticamente como la cuenta de demostración, así que todo
      // el que abría la URL escribía en el mismo libro mayor.
      if (!leerToken()) {
        const vivoServidor = await api.salud()
        if (vivo) setConServidor(vivoServidor.ok)
        return
      }
      const ok = await hidratar()
      if (vivo) setConServidor(ok)
    })()
    return () => {
      vivo = false
    }
  }, [refrescarCupos, hidratar])

  const entrar = useCallback<Contexto['entrar']>(
    async (telefono, codigo, nombre) => {
      const r = await api.entrar(telefono, codigo, nombre)
      if (!r.ok) return { ok: false, error: r.error }
      guardarToken(r.datos.token)
      const ok = await hidratar()
      setConServidor(ok)
      await refrescarCupos()
      return { ok: true }
    },
    [hidratar, refrescarCupos],
  )

  const entrarComoDemo = useCallback<Contexto['entrarComoDemo']>(async () => {
    const c = await api.pedirCodigo(CUENTA_DEMO)
    if (!c.ok) return { ok: false, error: c.error }
    if (!c.datos.codigoDemo) return { ok: false, error: 'La cuenta de demostración no está disponible.' }
    return entrar(CUENTA_DEMO, c.datos.codigoDemo)
  }, [entrar])

  const salir = useCallback(() => {
    olvidarToken()
    despacharRaw({ tipo: 'salir' })
    setConServidor(false)
  }, [])

  const comprar = useCallback<Contexto['comprar']>(
    async (llamada, respaldo) => {
      if (!conServidor) {
        despacharRaw(respaldo)
        return { ok: true }
      }
      const r = await llamada()
      if (!r.ok) return { ok: false, error: r.error }
      await hidratar()
      await refrescarCupos()
      // Se devuelve lo que dijo el servidor: el número de bolsa o de butaca
      // sale de ahí, no de una cuenta hecha en el navegador.
      return { ok: true, datos: r.datos }
    },
    [conServidor, hidratar, refrescarCupos],
  )

  const despachar = useCallback((a: Accion) => despacharRaw(a), [])

  const valor = useMemo<Contexto>(() => {
    // El consumo descuenta PRIMERO el bono de la casa (regla declarada en
    // db/006). Calcularlo con la fórmula vieja pintaba un «tuyos» negativo
    // debajo de un total positivo. Si el servidor respondió, manda él.
    const entroBono = estado.socio.cuenta
      .filter((m) => m.tipo === 'bono' && m.monto > 0)
      .reduce((s, m) => s + m.monto, 0)
    const entroPagado = estado.socio.cuenta
      .filter((m) => m.tipo !== 'bono' && m.monto > 0)
      .reduce((s, m) => s + m.monto, 0)
    const salio = -estado.socio.cuenta.filter((m) => m.monto < 0).reduce((s, m) => s + m.monto, 0)
    const bonoGastado = Math.min(salio, entroBono)
    const local = {
      pagado: entroPagado - (salio - bonoGastado),
      bono: entroBono - bonoGastado,
      total: entroPagado + entroBono - salio,
    }
    const d = estado.saldoServidor ?? local
    const saldoPagado = d.pagado
    const saldoBono = d.bono
    const saldo = d.total
    const totalCarrito = estado.carrito.reduce((s, l) => {
      const p = buscarPlato(l.platoId)
      return s + (p ? p.precio * l.cantidad : 0)
    }, 0)

    const tandas = estado.socio.tandasCerradas
    const idx = tandas >= 5 ? 2 : tandas >= 2 ? 1 : 0
    const nivel = NIVELES[idx]
    const siguienteNivel = idx < 2 ? NIVELES[idx + 1] : null
    const sellosParaSiguienteNivel = siguienteNivel
      ? Math.max(0, siguienteNivel.tandas * 9 - (tandas * 9 + estado.socio.sellos.length))
      : 0

    return {
      estado,
      despachar,
      conServidor,
      comprar,
      entrar,
      entrarComoDemo,
      salir,
      saldo,
      saldoPagado,
      saldoBono,
      totalCarrito,
      nivel,
      siguienteNivel,
      sellosParaSiguienteNivel,
    }
  }, [estado, despachar, conServidor, comprar, entrar, entrarComoDemo, salir])

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useEstado() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useEstado fuera del EstadoProvider')
  return c
}

export type { NivelId }
