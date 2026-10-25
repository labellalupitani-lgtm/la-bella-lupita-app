import { reciboValido } from '../compartido/tienda'
import { reciboReservaValido } from '../compartido/reservas'
import { perfilValido, type PerfilDatos, type PerfilEditable } from '../compartido/perfil'
export type { PerfilDatos, PerfilEditable } from '../compartido/perfil'
/** Datos de cuenta, catálogo y cupos: recursos independientes con respuestas validadas. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { NombreIcono } from './componentes/Base'
import { medir, compraOferta } from './medicion'
import { ErrorPeticion, pedirJSON } from './http'
import { CAMBIO_SESION, LLAVE_SESION, sesion } from './sesion-cliente'
export { sesion } from './sesion-cliente'
export { cordobas } from '../lib/format'

/* ------------------------------------------------------------------
   Contratos — la forma exacta que devuelve el worker
   ------------------------------------------------------------------ */
export type Socio = {
  codigo_club?: string
  id: string
  telefono: string
  nombre: string
  creado: string
  bebida_siempre: string | null
  alergias: string | null
  cumple: string | null
}

export type Sello = { n: number; motivo: string; barista: string; puesto: string }
export type TipoActividad = 'todos' | 'dinero' | 'puntos' | 'sellos' | 'canjes'
export type Actividad = { id: string; tipo: Exclude<TipoActividad, 'todos'>; concepto: string; creado: string; cantidad: number }
export type Saldo = { pagado: number; bono: number; total: number }
export type Membresia = { numero: number; estado: 'activa' | 'en_gracia'; hasta: string; cuota: number; autorenueva: boolean; contrato_version?:string; periodo_inicio?:string }
export type Movimiento = {
  id: string
  monto: number
  tipo: 'recarga' | 'bono' | 'consumo' | 'deposito' | 'regalo'
  concepto: string
  creado: string
}

export type Yo = {
  ahora?: string
  socio: Socio
  vale: { codigo: string; vence: string } | null
  sellos: Sello[]
  saldo: Saldo
  membresia: Membresia | null
  movimientos: Movimiento[]
  tandasCerradas: number
  premiosPendientes: number
  bebidaDelDia: string | null
  bolsaDelMes: string | null
  /** Puntaje calculado por el servidor; nunca se estima desde movimientos parciales. */
  puntaje?: { puntos: number; nivel_nombre: string; siguiente_nombre: string | null; faltan: number; avance: number } | null
}

export type ContextoInicio = {
  pedido: {numero:number;estado:'recibido'|'aceptado'|'preparando'|'listo'} | null
  reserva: {zona:string;cuando:string;personas:number} | null
  avisos:number; ahora:string
}
export type Cupos = {
  sociosFundadores: number
  bolsasReserva: number
  mesaTostador: number
  experiencias?: Record<string, { cupos: number; libres: number }>
}

/** Una experiencia del calendario, tal y como la guarda la casa. */
export type Experiencia = {
  oferta: string
  abre_socios?: string | null; abre_publico?: string | null; duracion_minutos?:number|null; lugar?:string|null; incluye?:string|null; condiciones?:string|null
  id: string
  nombre: string
  /** ISO. La hora es la de Managua, ya resuelta por la base. */
  cuando: string
  /** centavos de córdoba */
  precio: number
  cupos: number
  libres: number
}

/**
 * Una zona de la casa. Sale del worker, no de una lista en el cliente: el
 * aforo, el depósito y el nombre vivían en tres literales distintos y ahora
 * viven en uno.
 */
export type Zona = {
  id: string
  nombre: string
  aforo: number
  /** centavos. Hoy sólo el Salón VIP tiene. */
  deposito: number
  icono: NombreIcono
}

/**
 * Los precios de la casa.
 *
 * Existe para que ninguna pantalla lleve una cifra de dinero escrita a mano.
 * Un precio en el cliente se separa del que cobra la caja en cuanto alguien
 * toca la base, y entonces la pantalla promete lo que el cobro no cumple.
 */
export type Catalogo = {
  ahora?: string
  experiencias: Experiencia[]
  zonas: Zona[]
  /** `generacion` es un contador interno de corte —1, 2, 3…—, NO un año: sólo
   *  sirve para que la bolsa 117 de este corte no choque con la del anterior
   *  en la guardia de idempotencia. No se pinta en pantalla. */
  bolsa: { precio: number; quedan: number; total: number; generacion: number | null }
  membresia: { cuota: number; total: number }
}

/** Lo que devuelve toda compra: lo cobrado, el saldo que queda, y lo suyo. */
export type Compra<T> = T & { cobrado: number; saldo: Saldo; repetido?: boolean }

/* ------------------------------------------------------------------
   El cliente
   ------------------------------------------------------------------ */
export type Fallo = { ok: false; error: string; codigo?: number; resultadoIncierto?: boolean }
export type Bien<T> = { ok: true; datos: T }
export type Respuesta<T> = Bien<T> | Fallo

const objeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const numero = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
const saldoValido = (v: unknown) => objeto(v) && numero(v.total) && numero(v.bono) && numero(v.pagado)

function respuestaValida(ruta: string, v: unknown): boolean {
  if (!objeto(v)) return false
  if (ruta === '/reserva') return reciboReservaValido(v)
  if (ruta.startsWith('/ocupacion?')) return typeof v.dia === 'string' && objeto(v.aforo) && Object.values(v.aforo).every(n => numero(n) && Number(n) >= 0) && objeto(v.ocupacion) && Object.values(v.ocupacion).every(z => objeto(z) && Object.entries(z).every(([h,n]) => /^\d{1,2}$/.test(h) && Number(h) < 24 && numero(n) && Number(n) >= 0 && Number(n) <= 1))
  if (ruta === '/inicio/contexto') return numero(v.avisos) && typeof v.ahora==='string'
    && (v.pedido===null || objeto(v.pedido)&&numero(v.pedido.numero)&&['recibido','aceptado','preparando','listo'].includes(String(v.pedido.estado)))
    && (v.reserva===null || objeto(v.reserva)&&typeof v.reserva.zona==='string'&&typeof v.reserva.cuando==='string'&&Number.isFinite(Date.parse(v.reserva.cuando))&&numero(v.reserva.personas))
  if (ruta.split('?')[0] === '/perfil') return perfilValido(v.perfil) && (v.guardado === undefined || v.guardado === true)
  if (ruta.startsWith('/actividad?')) return Array.isArray(v.movimientos)
    && v.movimientos.every(m => objeto(m) && typeof m.id === 'string' && typeof m.concepto === 'string'
      && typeof m.creado === 'string' && Number.isFinite(Date.parse(m.creado)) && numero(m.cantidad)
      && ['dinero', 'puntos', 'sellos', 'canjes'].includes(String(m.tipo)))
    && (v.siguiente === null || typeof v.siguiente === 'string')
  if (ruta === '/yo') {
    return objeto(v.socio) && typeof v.socio.id === 'string' && typeof v.socio.nombre === 'string'
      && typeof v.socio.telefono === 'string' && typeof v.socio.creado === 'string'
      && Number.isFinite(Date.parse(v.socio.creado))
      && ['bebida_siempre', 'alergias'].every(k => v.socio && objeto(v.socio) && (v.socio[k] === null || typeof v.socio[k] === 'string'))
      && (v.socio.cumple === null || typeof v.socio.cumple === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v.socio.cumple) && Number.isFinite(Date.parse(v.socio.cumple)))
      && saldoValido(v.saldo) && Array.isArray(v.sellos) && v.sellos.length<=9 && v.sellos.every(s=>objeto(s)&&numero(s.n)&&typeof s.motivo==='string'&&typeof s.barista==='string') && Array.isArray(v.movimientos) && v.movimientos.every(m=>objeto(m)&&typeof m.id==='string'&&numero(m.monto)&&typeof m.concepto==='string'&&typeof m.creado==='string'&&Number.isFinite(Date.parse(m.creado)))
      && (v.vale===null || (objeto(v.vale)&&typeof v.vale.codigo==='string'&&typeof v.vale.vence==='string'&&Number.isFinite(Date.parse(v.vale.vence))))
      && (v.ahora===undefined || typeof v.ahora==='string'&&Number.isFinite(Date.parse(v.ahora)))
      && numero(v.tandasCerradas) && Number(v.tandasCerradas)>=0 && numero(v.premiosPendientes) && Number(v.premiosPendientes)>=0
      && (v.puntaje===null || v.puntaje===undefined || (objeto(v.puntaje)&&numero(v.puntaje.puntos)&&typeof v.puntaje.nivel_nombre==='string'&&(v.puntaje.siguiente_nombre===null||typeof v.puntaje.siguiente_nombre==='string')&&numero(v.puntaje.faltan)&&numero(v.puntaje.avance)))
      && (v.membresia === null || (objeto(v.membresia) && numero(v.membresia.numero)
        && typeof v.membresia.hasta === 'string' && Number.isFinite(Date.parse(v.membresia.hasta)) && ['activa','en_gracia'].includes(String(v.membresia.estado)) && numero(v.membresia.cuota) && typeof v.membresia.autorenueva === 'boolean'))
  }
  if (ruta === '/tanda/canjear') return typeof v.codigo === 'string' && /^[23456789BCDFGHJKLMNPQRSTVWXZ]{8}$/.test(v.codigo) && numero(v.vence) && Number(v.vence)>=0 && typeof v.ahora==='string' && Number.isFinite(Date.parse(v.ahora))
  if (ruta === '/membresia/apartar') return numero(v.numero) && (v.yaEra===true || saldoValido(v.saldo)&&numero(v.cobrado))
  if (ruta === '/catalogo') return Array.isArray(v.experiencias) && v.experiencias.every(e=>objeto(e) && typeof e.id==='string' && typeof e.nombre==='string' && typeof e.cuando==='string' && Number.isFinite(Date.parse(e.cuando)) && numero(e.precio) && numero(e.cupos) && numero(e.libres) && Number(e.libres)>=0 && Number(e.libres)<=Number(e.cupos))
    && Array.isArray(v.zonas) && v.zonas.every(z=>objeto(z) && typeof z.id==='string' && typeof z.nombre==='string' && numero(z.aforo) && numero(z.deposito))
    && objeto(v.bolsa) && ['precio','quedan','total'].every(k=>numero((v.bolsa as Record<string,unknown>)[k])) && Number(v.bolsa.quedan)<=Number(v.bolsa.total)
    && objeto(v.membresia) && numero(v.membresia.cuota) && numero(v.membresia.total)
  if (ruta === '/cupos') return numero(v.bolsasReserva) && numero(v.sociosFundadores)
  if (ruta === '/auth/entrar') return v.autenticado === true
  if (ruta === '/reserva-cosecha/apartar') return reciboValido(v)
  if (ruta === '/cuenta/cobrar' || ruta.endsWith('/apartar') && ruta !== '/membresia/apartar') return saldoValido(v.saldo) && numero(v.cobrado)
  return true
}

async function pedir<T>(ruta: string, init?: RequestInit): Promise<Respuesta<T>> {
  try {
    const cuerpo = await pedirJSON<T>(ruta, init)
    if (!respuestaValida(ruta, cuerpo)) {
      const escritura = !['GET', 'HEAD'].includes((init?.method ?? 'GET').toUpperCase())
      return { ok: false, error: escritura ? 'No pudimos confirmar el resultado. Consultá el estado antes de repetir la operación.' : 'No pudimos leer la respuesta de la casa. Volvé a intentar.', resultadoIncierto: escritura }
    }
    if(ruta==='/reserva-cosecha/apartar')compraOferta('cosecha')
    if(ruta.startsWith('/experiencia/')&&ruta.endsWith('/apartar'))compraOferta('experiencia')
    return { ok: true, datos: cuerpo as T }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'No pudimos completar la operación.',
      ...(e instanceof ErrorPeticion ? { codigo: e.status, resultadoIncierto: e.resultadoIncierto } : {}) }
  }
}

export const api = {
  contexto: () => pedir<ContextoInicio>('/inicio/contexto'),
  perfil: () => pedir<{ perfil: PerfilDatos }>('/perfil'),
  recuperarPerfil: () => pedir<{ perfil: PerfilDatos }>('/perfil?recuperacion=1'),
  guardarPerfil: (perfil: PerfilEditable & { version: number }) => pedir<{ guardado: true; perfil: PerfilDatos }>('/perfil', { method: 'POST', body: JSON.stringify(perfil) }),
  actividad: (tipo: TipoActividad, cursor?: string) => pedir<{ movimientos: Actividad[]; siguiente: string | null }>(
    '/actividad?' + new URLSearchParams({ tipo, ...(cursor ? { cursor } : {}) }).toString()),
  salud: () => pedir<{ ok: boolean; casa: string }>('/health'),
  cupos: () => pedir<Cupos>('/cupos'),
  yo: () => pedir<Yo>('/yo'),
  pedirCodigo: (telefono: string) =>
    pedir<{ codigoDemo?: string }>('/auth/codigo', {
      method: 'POST',
      body: JSON.stringify({ telefono }),
    }),
  entrar: async (telefono: string, codigo: string, nombre?: string) => {
    const r = await pedir<{ autenticado: true; socio: { nombre: string; telefono: string } }>(
      '/auth/entrar',
      { method: 'POST', body: JSON.stringify({ telefono, codigo, nombre }) },
    )
    // El servidor ya fijó la cookie HttpOnly; sólo notificamos el cambio de cuenta.
    if (r.ok) sesion.confirmar()
    return r
  },
  /**
   * El servidor pone el precio, no la app: se mandan líneas —`{id, cuanto}`—
   * y el importe sale de la carta del worker. Mandar `monto` devuelve 422.
   * Reproducible contra producción:
   *
   *   curl -s -o /dev/null -w '%{http_code}' -X POST \
   *     https://club-lupita.labellalupita.workers.dev/api/cuenta/cobrar \
   *     -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
   *     -d '{"monto":1,"concepto":"sonda","ref":"sonda-precio-cliente"}'
   *   # 422 — «El pedido se cobra por líneas, no por monto.»
   *
   * `ref` es la llave de idempotencia: repetir la misma no vuelve a cobrar,
   * devuelve `repetido: true`.
   */
  cobrarPedido: (lineas: { id: string; cuanto: number }[], ref: string) =>
    pedir<{ saldo: Saldo; cobrado: number; repetido?: boolean; pedido?:{id:string;numero:number;estado:string} }>('/cuenta/cobrar', {
      method: 'POST',
      body: JSON.stringify({ lineas, ref }),
    }),
  usarBeneficio: (clase: 'bebida_dia' | 'bolsa_mes') =>
    pedir<{ ok: true }>(`/beneficio/${clase}`, { method: 'POST', body: '{}' }),
  canjearTanda: () => pedir<{ codigo: string; vence: number; ahora: string }>('/tanda/canjear', { method: 'POST', body: '{}' }),

  /**
   * El catálogo con los precios de la base.
   *
   * Ninguna pantalla escribe una cifra de dinero a mano. El precio que se
   * enseña y el que se cobra salen de la misma consulta, y por eso no se
   * pueden separar.
   */
  catalogo: () => pedir<Catalogo>('/catalogo'),

  /* --- Compras. Todas cobran contra la Cuenta de Casa. --- */

  /**
   * Aparta la primera bolsa libre. El número lo elige el servidor.
   *
   * `ref` es la llave de idempotencia de LA SOLICITUD. Sin ella, el servidor
   * armaba la suya con la bolsa que acababa de tomar, y un reintento se
   * llevaba la bolsa siguiente: dos peticiones, dos bolsas, dos cobros.
   * Con la misma llave, el reintento no cobra y el cupo vuelve al montón.
   */
  apartarBolsa: (ref: string, cotizacionId: string) =>
    pedir<Compra<{ numero: number; quedan: number; total: number }>>('/reserva-cosecha/apartar', {
      method: 'POST',
      body: JSON.stringify({ ref, cotizacionId }),
    }),

  /** Aparta una butaca. Cuál, lo decide el servidor: la primera libre.
   *  `ref` cumple el mismo papel que en `apartarBolsa`. */
  apartarExperiencia: (id: string, ref: string, oferta: string) =>
    pedir<Compra<{ butaca: number; quedan: number }>>(`/experiencia/${id}/apartar`, {
      method: 'POST',
      body: JSON.stringify({ ref, oferta }),
    }),

  /** Contrata una plaza según las condiciones vigentes. `yaEra` si ya la tenía. */
  apartarMembresia: (ref: string, version: string, configVersion: number) =>
    pedir<Compra<{ numero: number; quedan?: number; yaEra?: boolean }>>('/membresia/apartar', {
      method: 'POST',
      body: JSON.stringify({ref,version,configVersion,acepto:true}),
    }),

  /**
   * Deja de renovar. NO devuelve el mes pagado ni suelta la plaza: el socio
   * pagó treinta días y los conserva hasta `hasta`. Cancelar no puede ser
   * perder lo que ya se pagó.
   */
  cancelarMembresia: () =>
    pedir<{ cancelada: true; numero: number; hasta: string }>('/membresia/cancelar', {
      method: 'POST',
      body: '{}',
    }),
  activarRenovacion: () => pedir<{ activada: true; hasta: string }>('/membresia/renovacion', { method: 'POST', body: '{}' }),

  /**
   * Qué proporción del aforo está tomada, por zona y por hora, para un día.
   * `dia` es `YYYY-MM-DD` en hora de Managua. Abierto: la ocupación de la casa
   * no es de nadie en particular.
   */
  ocupacion: (dia: string) =>
    pedir<{ dia: string; aforo: Record<string, number>; ocupacion: Record<string, Record<number, number>> }>(
      `/ocupacion?dia=${encodeURIComponent(dia)}`,
    ),

  /**
   * Aparta mesa. `cuando` es ISO con zona.
   *
   * El servidor valida siete cosas —pasada, con menos de media hora, a más de
   * noventa días, fuera de horario, de menos de una hora o más de seis, que se
   * pase del cierre, y para menos de una o más de doce personas— y el Salón
   * VIP además requiere un anticipo aplicable al consumo. La pantalla no repite ninguna: sólo ofrece lo
   * que existe y deja que el que dice que no sea el servidor.
   */
  reservar: (r: { zona: string; cuando: string; personas: number; horas: number }) =>
    pedir<Compra<{ reserva: { id: string; zona: string; cuando: string; termina: string; personas: number; deposito: number }; yaEstaba: boolean }>>(
      '/reserva',
      { method: 'POST', body: JSON.stringify(r) },
    ),
}

/**
 * La cuenta de demostración.
 *
 * Existe en el servidor y es la única que enseña su código en pantalla: todas
 * las demás lo reciben por WhatsApp. Sirve para que el cliente recorra la app
 * con datos de verdad sin tener que darse de alta.
 */
export const CUENTA_DEMO = '50587442005'

export async function entrarComoDemo(): Promise<Respuesta<unknown>> {
  const c = await api.pedirCodigo(CUENTA_DEMO)
  if (!c.ok) return c
  if (!c.datos.codigoDemo) {
    return { ok: false, error: 'La cuenta de demostración no está disponible ahora mismo' }
  }
  return api.entrar(CUENTA_DEMO, c.datos.codigoDemo)
}

/* ------------------------------------------------------------------
   El nivel
   ------------------------------------------------------------------ */
export const NIVELES = [
  { clave: 'casa', nombre: 'Gente de la Casa', umbral: 0 },
  { clave: 'barista', nombre: 'Barista', umbral: 1000 },
  { clave: 'reserva', nombre: 'Reserva Lupita', umbral: 2500 },
] as const

/**
 * El nivel que se puede probar hoy, y sólo ése.
 *
 * Con `009_puntos.sql` aplicada, el servidor manda `puntaje` y el nivel sale
 * de ahí. Sin ella no hay puntos en ninguna parte, y estimarlos desde los
 * cuarenta últimos movimientos daría una cifra inventada con aspecto de dato.
 * La pantalla dice que falta, que es lo que hace el resto del sistema.
 */
export function nivelDe(yo: Yo | null) {
  if (!yo) return null
  if (yo.puntaje) {
    return {
      medido: true as const,
      nombre: yo.puntaje.nivel_nombre,
      siguiente: yo.puntaje.siguiente_nombre,
      faltan: yo.puntaje.faltan,
      avance: yo.puntaje.avance,
      puntos: yo.puntaje.puntos,
    }
  }
  return {
    medido: false as const,
    // Lo único demostrable sin el motor de puntos: si paga la membresía,
    // pertenece a la Mesa Fundadora. El resto es Gente de la Casa.
    nombre: yo.membresia ? 'Mesa Fundadora' : 'Gente de la Casa',
    siguiente: null,
    faltan: 0,
    avance: 0,
    puntos: null,
  }
}

/* ------------------------------------------------------------------
   El estado de la app
   ------------------------------------------------------------------ */
type Valor = {
  perfil: PerfilDatos | null
  perfilError: string | null
  perfilCargando: boolean
  refrescarPerfil: (forzar?: boolean) => Promise<void>
  aplicarPerfil: (perfil: PerfilDatos) => void
  contexto: ContextoInicio | null
  contextoError: string | null
  contextoCargando: boolean
  refrescarContexto: () => Promise<void>
  yo: Yo | null
  cupos: Cupos | null
  /** Los precios de la casa. `null` sólo antes de la primera respuesta. */
  catalogo: Catalogo | null
  cargando: boolean
  /** Lectura de la cuenta, independiente del estado agregado de acceso. */
  cuentaCargando: boolean
  error: string | null
  actualizado: string | null
  catalogoCargando: boolean
  catalogoError: string | null
  catalogoActualizado: string | null
  cuposCargando: boolean
  cuposError: string | null
  cuposActualizado: string | null
  /** `false` mientras no haya sesión: la app manda al umbral. */
  dentro: boolean
  refrescar: (forzar?: boolean) => Promise<void>
  refrescarCuenta: (forzar?: boolean) => Promise<void>
  refrescarCatalogo: () => Promise<void>
  refrescarCupos: () => Promise<void>
  revalidar: (forzar?: boolean) => Promise<void>
  salir: (todas?: boolean) => Promise<void>
}

const Ctx = createContext<Valor | null>(null)

/** Cada recurso termina y se recupera por separado; los reintentos se comparten. */
function useRecurso<T>(solicitar: () => Promise<Respuesta<T>>, cuenta = false) {
  const [datos, setDatos] = useState<T | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actualizado, setActualizado] = useState<string | null>(null)
  const generacion = useRef(0)
  const pendiente = useRef<{ token: string | null; promesa: Promise<void> } | null>(null)
  const siguiente = useRef<{token:string|null;promesa:Promise<void>}|null>(null)
  const limpiar = useCallback(() => {
    generacion.current++
    pendiente.current = null
    siguiente.current = null
    setDatos(null)
    setActualizado(null)
    setError(null)
    setCargando(false)
  }, [])
  const aplicar = useCallback((actualizar: (previo: T | null) => T | null) => {
    // Una lectura iniciada antes del guardado no puede restaurar el dato anterior.
    generacion.current++; pendiente.current = null; siguiente.current = null
    setDatos(actualizar); setCargando(false); setError(null); setActualizado(new Date().toISOString())
  }, [])
  const refrescar = useCallback(function consultar(forzar=false): Promise<void> {
    const token = sesion.leer()
    if (pendiente.current?.token === token) {
      if(!forzar)return pendiente.current.promesa
      if(siguiente.current?.token===token)return siguiente.current.promesa
      // Un evento nuevo no se pierde detrás de una lectura que empezó antes.
      const revision=generacion.current
      const promesa=pendiente.current.promesa.then(()=>revision===generacion.current&&token===sesion.leer()?consultar():undefined).finally(()=>{if(siguiente.current?.promesa===promesa)siguiente.current=null})
      siguiente.current={token,promesa}
      return promesa
    }
    const turno = ++generacion.current
    setCargando(true)
    const inicio=performance.now()
    const promesa = solicitar().then(r => {
      if (turno !== generacion.current || token !== sesion.leer()) return
      if(cuenta&&token&&window.location.pathname==='/')medir(r.ok?'actualizacion_ok':'actualizacion_error',performance.now()-inicio)
      if (r.ok) { setDatos(r.datos); setActualizado(new Date().toISOString()); setError(null) }
      else if (cuenta && r.codigo === 401) { setDatos(null); setActualizado(null); setError(null) }
      else setError(r.error)
    }).finally(() => {
      if (turno === generacion.current) { pendiente.current = null; setCargando(false) }
    })
    pendiente.current = { token, promesa }
    return promesa
  }, [solicitar, cuenta])
  useEffect(() => () => { generacion.current++; pendiente.current = null }, [])
  return { datos, cargando, error, actualizado, refrescar, limpiar, aplicar }
}

export function DatosProvider({ children }: { children: ReactNode }) {
  const [preparando,setPreparando]=useState(true),[errorAcceso,setErrorAcceso]=useState<string|null>(null)
  const contexto = useRecurso(api.contexto), cuenta = useRecurso(api.yo, true), precios = useRecurso(api.catalogo), plazas = useRecurso(api.cupos)
  const perfil = useRecurso(api.perfil, true)
  const refrescarPerfil = perfil.refrescar, limpiarPerfil = perfil.limpiar, confirmarPerfil = perfil.aplicar, confirmarCuenta = cuenta.aplicar
  const aplicarPerfil = useCallback((p: PerfilDatos) => {
    confirmarPerfil(() => ({ perfil: p }))
    confirmarCuenta(previo => previo?.socio.id === p.id ? { ...previo, socio: { ...previo.socio, nombre: p.nombre, bebida_siempre: p.bebida_siempre || null, alergias: p.alergias || null } } : previo)
  }, [confirmarPerfil, confirmarCuenta])
  const refrescarContexto=contexto.refrescar, limpiarContexto=contexto.limpiar
  const refrescarCuenta = cuenta.refrescar, refrescarCatalogo = precios.refrescar, refrescarCupos = plazas.refrescar
  const limpiarCuenta = cuenta.limpiar, limpiarCatalogo = precios.limpiar, limpiarCupos = plazas.limpiar
  const refrescar = useCallback(async (forzar=false) => {
    try {
      await sesion.preparar();setErrorAcceso(null);setPreparando(false)
      await Promise.all([refrescarPerfil(forzar), refrescarCuenta(forzar), refrescarCatalogo(forzar), refrescarCupos(forzar), refrescarContexto(forzar)])
    }catch(e){setErrorAcceso(e instanceof Error?e.message:'No pudimos abrir la sesión. Intentá de nuevo.')}finally{setPreparando(false)}
  }, [refrescarPerfil, refrescarCuenta, refrescarCatalogo, refrescarCupos, refrescarContexto])
  const ultimaRevision=useRef(-Infinity)
  const revalidar=useCallback(async(forzar=false)=>{
    if((!sesion.leer()&&!sesion.heredada()&&!sesion.salidaPendiente()) || (!forzar && performance.now()-ultimaRevision.current<15_000))return
    ultimaRevision.current=performance.now()
    await refrescar(forzar)
  },[refrescar])
  useEffect(()=>{
    const alFoco=()=>{if(document.visibilityState==='visible')void revalidar()}
    const alConectar=()=>void revalidar(true)
    window.addEventListener('focus',alFoco);window.addEventListener('online',alConectar);document.addEventListener('visibilitychange',alFoco)
    return ()=>{window.removeEventListener('focus',alFoco);window.removeEventListener('online',alConectar);document.removeEventListener('visibilitychange',alFoco)}
  },[revalidar])
  const limpiar = useCallback(() => { limpiarPerfil(); limpiarCuenta(); limpiarCatalogo(); limpiarCupos(); limpiarContexto() }, [limpiarPerfil, limpiarCuenta, limpiarCatalogo, limpiarCupos, limpiarContexto])
  const salir = useCallback((todas=false) => sesion.salir(todas), [])

  useEffect(() => {
    const cambiar = () => { limpiar(); void refrescar() }
    const almacenamiento = (e: StorageEvent) => { if (e.key === LLAVE_SESION || e.key === 'club-lupita:cliente-cambio' || e.key === null) cambiar() }
    window.addEventListener(CAMBIO_SESION, cambiar)
    window.addEventListener('storage', almacenamiento)
    void refrescar()
    return () => { window.removeEventListener(CAMBIO_SESION, cambiar); window.removeEventListener('storage', almacenamiento) }
  }, [limpiar, refrescar])

  const valor = useMemo(
    () => ({ perfil: perfil.datos?.perfil ?? null, perfilError: perfil.error, perfilCargando: perfil.cargando, refrescarPerfil, aplicarPerfil,
      contexto:contexto.datos, contextoError:contexto.error, contextoCargando:contexto.cargando, refrescarContexto, yo: cuenta.datos, cupos: plazas.datos, catalogo: precios.datos,
      cargando: errorAcceso?false:preparando||(cuenta.cargando && perfil.cargando), error: errorAcceso??cuenta.error, actualizado: cuenta.actualizado, dentro: !!cuenta.datos || !!perfil.datos,
      cuentaCargando: cuenta.cargando, catalogoCargando: precios.cargando, catalogoError: precios.error, catalogoActualizado: precios.actualizado,
      cuposCargando: plazas.cargando, cuposError: plazas.error, cuposActualizado: plazas.actualizado,
      refrescar, refrescarCuenta, refrescarCatalogo, refrescarCupos, revalidar, salir }),
    [perfil.datos, perfil.error, perfil.cargando, refrescarPerfil, aplicarPerfil, preparando,errorAcceso,contexto.datos, contexto.error, contexto.cargando, refrescarContexto, cuenta.datos, cuenta.cargando, cuenta.error, cuenta.actualizado, plazas.datos, plazas.cargando, plazas.error, plazas.actualizado,
      precios.datos, precios.cargando, precios.error, precios.actualizado, refrescar, refrescarCuenta, refrescarCatalogo, refrescarCupos, revalidar, salir],
  )
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}

export function useDatos() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDatos fuera del DatosProvider')
  return v
}

/* ------------------------------------------------------------------
   Formato — una sola manera de escribir cada cosa (SPEC §10)
   ------------------------------------------------------------------ */
const NUM = new Intl.NumberFormat('es-NI')

export function puntos(n: number) {
  return `${NUM.format(n)} pts`
}

export function fechaCorta(iso: string) {
  return new Intl.DateTimeFormat('es-NI', { day: 'numeric', month: 'short', timeZone:'America/Managua' }).format(new Date(iso))
}
