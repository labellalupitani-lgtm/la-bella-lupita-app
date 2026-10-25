/**
 * Sesión firmada. Sin dependencias: WebCrypto, que el runtime de Workers ya trae.
 *
 * El teléfono viaja DENTRO del token firmado, nunca en el cuerpo de la petición.
 * Esa es toda la diferencia entre «decime a nombre de quién cobro» y
 * «demostrame que sos vos».
 */

import { timingSafeEqual } from 'node:crypto'
const cod = new TextEncoder()

const b64url = (b: ArrayBuffer | Uint8Array): string => {
  const bytes = b instanceof Uint8Array ? b : new Uint8Array(b)
  let s = ''
  for (const x of bytes) s += String.fromCharCode(x)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const deB64url = (s: string): string =>
  atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '='))

async function clave(secreto: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', cod.encode(secreto), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

/** Huella estable de un código de acceso: nunca se guarda el código en claro. */
export async function huella(secreto: string, valor: string): Promise<string> {
  const firma = await crypto.subtle.sign('HMAC', await clave(secreto), cod.encode(valor))
  return b64url(firma)
}

/**
 * Comparación que tarda lo mismo acierte o falle.
 *
 * `a !== b` corta en el primer carácter distinto, así que el tiempo de
 * respuesta filtra cuántos caracteres iban bien: con suficientes intentos,
 * un secreto se reconstruye letra a letra sin haberlo adivinado nunca entero.
 *
 * Vivía suelta dentro de `verificar`, que es donde primero hizo falta. Está
 * aquí arriba porque el secreto de la caja necesitaba exactamente lo mismo y
 * se estaba comparando con `!==`.
 */
export function igualEnTiempoConstante(a: string, b: string): boolean {
  const aa=cod.encode(a),bb=cod.encode(b)
  return aa.byteLength===bb.byteLength&&timingSafeEqual(aa,bb)
}

export type Sesion = { tel: string; exp: number; rol: 'socio' | 'casa'; iat?: number; empleado?: string; demo?: boolean; versionClave?: number }

export async function firmar(secreto: string, s: Sesion): Promise<string> {
  if(s.rol==='socio')s={...s,iat:Date.now()}
  const cuerpo = b64url(cod.encode(JSON.stringify(s)))
  const firma = await crypto.subtle.sign('HMAC', await clave(secreto), cod.encode(cuerpo))
  return `${cuerpo}.${b64url(firma)}`
}

export async function verificar(secreto: string, token: string | undefined): Promise<Sesion | null> {
  if (!token) return null
  if(token.length>4096)return null
  const partes=token.split('.'),[cuerpo,firma]=partes
  if(partes.length!==2||!cuerpo||!firma||!/^[A-Za-z0-9_-]+$/.test(cuerpo)||!/^[A-Za-z0-9_-]{43}$/.test(firma))return null
  try {
    const firmaBytes=Uint8Array.from(deB64url(firma),c=>c.charCodeAt(0))
    if(!await crypto.subtle.verify('HMAC',await clave(secreto),firmaBytes,cod.encode(cuerpo)))return null

    const s = JSON.parse(deB64url(cuerpo)) as Sesion
    if (typeof s.tel !== 'string' || typeof s.exp !== 'number' || !Number.isFinite(s.exp) || !['socio','casa'].includes(s.rol)) return null
    return s.exp > Date.now() ? s : null
  } catch {
    return null
  }
}

/** Seis dígitos, de una fuente aleatoria de verdad. */
export function codigoDeSeis(): string {
  const b = new Uint32Array(1)
  crypto.getRandomValues(b)
  return String(b[0] % 1_000_000).padStart(6, '0')
}
