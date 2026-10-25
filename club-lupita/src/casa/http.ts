import { csrfCliente, invalidarSesion, sesion } from './sesion-cliente'

export const LIMITE_PETICION = 20_000
export class ErrorPeticion extends Error {
  constructor(message: string, public status: number, public resultadoIncierto = false) { super(message) }
}

/** Transporte compartido: un límite incluye recepción y lectura del cuerpo. */
export async function pedirJSON<T>(ruta: string, init: RequestInit = {}, token = sesion.leer()): Promise<T> {
  const control = new AbortController()
  const abortar = () => control.abort()
  const externa = init.signal
  externa?.addEventListener('abort', abortar, { once: true })
  if (externa?.aborted) control.abort()
  const limite = setTimeout(abortar, LIMITE_PETICION)
  const escritura = !['GET', 'HEAD'].includes((init.method ?? 'GET').toUpperCase())
  const equipo = new Headers(init.headers).get('x-equipo-solicitud') === '1'
  const deCliente = !equipo && !ruta.startsWith('/auth/') && token === sesion.leer()
  try {
    if(!equipo&&sesion.salidaPendiente())throw new ErrorPeticion('El cierre de sesión sigue pendiente. Volvé a conectar este dispositivo para completarlo.',0)
    const r = await fetch('/api' + ruta, { ...init, signal: control.signal,
      headers: { 'content-type': 'application/json', ...(!equipo ? {'x-cliente-solicitud':'1','x-cliente-csrf':csrfCliente()} : {}), ...(token && !token.startsWith('@cookie:') ? { authorization: 'Bearer ' + token } : {}), ...init.headers } })
    // Antes de leer o aplicar la respuesta: ninguna operación de una cuenta
    // anterior debe informar éxito, restaurar datos o cerrar la nueva sesión.
    if (deCliente && token !== sesion.leer()) throw new ErrorPeticion('La cuenta cambió durante la consulta. Volvé a consultar tu cuenta actual.', 409, escritura)
    if (r.status === 401 && !ruta.startsWith('/auth/')) invalidarSesion(token)
    const datos: unknown = await r.json().catch(e => { if (control.signal.aborted) throw e; return null })
    const tokenActual = sesion.leer()
    if (deCliente && token !== tokenActual && !(r.status === 401 && tokenActual === null)) throw new ErrorPeticion('La cuenta cambió durante la consulta. Volvé a consultar tu cuenta actual.', 409, escritura)
    if (!r.ok) throw new ErrorPeticion(datos && typeof datos === 'object' && 'error' in datos
      ? String(datos.error) : 'No pudimos completar la operación. Revisá la información y volvé a intentar.', r.status, escritura && r.status >= 500)
    if (!datos || typeof datos !== 'object') throw new ErrorPeticion(escritura
      ? 'No pudimos confirmar el resultado. Consultá el estado antes de repetir la operación.'
      : 'No pudimos leer la respuesta de la casa. Volvé a intentar.', 502, escritura)
    return datos as T
  } catch (error) {
    if (error instanceof ErrorPeticion) throw error
    if (externa?.aborted) {
      if (escritura) throw new ErrorPeticion('Se interrumpió la consulta y no pudimos confirmar el resultado. Consultá el estado antes de repetir la operación.', 0, true)
      throw error
    }
    if (control.signal.aborted) throw new ErrorPeticion(escritura
      ? 'No pudimos confirmar el resultado. Consultá el estado antes de repetir la operación.'
      : 'La consulta tardó demasiado. Volvé a actualizar.', 408, escritura)
    throw new ErrorPeticion(escritura
      ? 'Se cayó la señal y no pudimos confirmar el resultado. Consultá el estado o reintentá la misma operación.'
      : 'Se cayó la señal. Revisá tu conexión y volvé a intentar.', 0, escritura)
  } finally {
    clearTimeout(limite)
    externa?.removeEventListener('abort', abortar)
  }
}
