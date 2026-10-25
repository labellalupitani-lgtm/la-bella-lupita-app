/**
 * Cliente del Worker. La app funciona sin él (estado local), pero cuando la API
 * responde, ella manda: los cupos y el saldo son verdades del servidor.
 */

export type Resultado<T> = { ok: true; datos: T } | { ok: false; error: string; codigo?: number }

const BASE = '/api'

async function pedir<T>(ruta: string, init?: RequestInit): Promise<Resultado<T>> {
  try {
    const token = leerToken()
    const r = await fetch(`${BASE}${ruta}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    })
    if (!r.ok) {
      const cuerpo = await r.text()
      let mensaje = 'Algo se nos quemó del lado de la cocina. No es culpa tuya. Ya lo estamos viendo.'
      try {
        const j = JSON.parse(cuerpo) as { error?: string }
        if (j.error) mensaje = j.error
      } catch {
        /* respuesta no-JSON: dejamos el mensaje de la casa */
      }
      return { ok: false, error: mensaje, codigo: r.status }
    }
    return { ok: true, datos: (await r.json()) as T }
  } catch {
    return { ok: false, error: 'Se cayó la señal. Aquí también pasa, sobre todo cuando llueve. Probá otra vez en un momento.' }
  }
}

export type Cupos = {
  sociosFundadores: number
  bolsasReserva: number
  mesaTostador: number
  experiencias?: Record<string, { cupos: number; libres: number }>
}

/** Token de sesion. El telefono viaja firmado dentro; nunca en el cuerpo. */
const CLAVE_TOKEN = 'club-lupita:token'
export const guardarToken = (t: string) => localStorage.setItem(CLAVE_TOKEN, t)
export const olvidarToken = () => localStorage.removeItem(CLAVE_TOKEN)
export const leerToken = () => {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

type Saldo = { pagado: number; bono: number; total: number }

export const api = {
  salud: () => pedir<{ ok: boolean; casa: string }>('/health'),
  cupos: () => pedir<Cupos>('/cupos'),

  // --- sesion ---
  pedirCodigo: (telefono: string) =>
    pedir<{ enviado: boolean; codigoDemo?: string }>('/auth/codigo', {
      method: 'POST',
      body: JSON.stringify({ telefono }),
    }),
  entrar: (telefono: string, codigo: string, nombre?: string) =>
    pedir<{ token: string; socio: { nombre: string; telefono: string } }>('/auth/entrar', {
      method: 'POST',
      body: JSON.stringify({ telefono, codigo, nombre }),
    }),

  // --- cuenta del socio (el telefono sale del token) ---
  yo: () => pedir<Record<string, unknown>>('/yo'),
  sellar: (motivo: string, ticket: string) =>
    pedir<{ sellos: number; nuevo: number | null; cerrada: boolean }>('/tanda/sellar', {
      method: 'POST',
      body: JSON.stringify({ motivo, ticket }),
    }),
  canjearTanda: () =>
    pedir<{ codigo: string; vence: number }>('/tanda/canjear', { method: 'POST', body: '{}' }),
  ocupacion: (dia: string) =>
    pedir<{ dia: string; aforo: Record<string, number>; ocupacion: Record<string, Record<number, number>> }>(
      `/ocupacion?dia=${dia}`,
    ),
  recargar: (monto: number, ref?: string) =>
    pedir<{ monto: number; bono: number; saldo: Saldo }>('/cuenta/recargar', {
      method: 'POST',
      body: JSON.stringify({ monto, ref }),
    }),
  cobrar: (monto: number, concepto: string, ref?: string) =>
    pedir<{ cobrado: number; saldo: Saldo; repetido?: boolean }>('/cuenta/cobrar', {
      method: 'POST',
      body: JSON.stringify({ monto, concepto, ref }),
    }),
  usarBeneficio: (clase: 'bebida_dia' | 'bolsa_mes') =>
    pedir<{ clase: string; ventana: string }>(`/beneficio/${clase}`, { method: 'POST', body: '{}' }),
  apartarSocio: () =>
    pedir<{ numero: number; quedan: number; cobrado: number }>('/membresia/apartar', { method: 'POST', body: '{}' }),
  cancelarMembresia: () =>
    pedir<{ cancelada: boolean }>('/membresia/cancelar', { method: 'POST', body: '{}' }),
  apartarBolsa: () =>
    pedir<{ numero: number; quedan: number; cobrado: number }>('/reserva-cosecha/apartar', {
      method: 'POST',
      body: '{}',
    }),
  apartarExperiencia: (id: string) =>
    pedir<{ butaca: number; quedan: number; cobrado: number }>(`/experiencia/${id}/apartar`, {
      method: 'POST',
      body: '{}',
    }),
  reservar: (zona: string, cuando: string, personas: number, horas = 2) =>
    pedir<{ reserva: Record<string, unknown> }>('/reserva', {
      method: 'POST',
      body: JSON.stringify({ zona, cuando, personas, horas }),
    }),
}

/** ¿Hay Worker del otro lado? Se consulta una vez al arrancar. */
export async function hayServidor(): Promise<boolean> {
  const r = await api.salud()
  return r.ok
}
