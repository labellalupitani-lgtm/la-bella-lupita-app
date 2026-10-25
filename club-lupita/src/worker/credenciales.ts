import { neon, type NeonQueryFunction } from '@neondatabase/serverless'
import { huella, igualEnTiempoConstante } from './sesion'

type SQL = NeonQueryFunction<false,false>
export type CredencialPropietario = { clave_huella: string | null; version_clave: number; clave_cambiada: string | null }

export async function propietario(db: string): Promise<CredencialPropietario> {
  const sql = neon(db)
  const [fila] = await sql`SELECT clave_huella,version_clave,clave_cambiada FROM seguridad_propietario WHERE id=true`
  if (!fila) throw new Error('Credencial del propietario sin inicializar')
  return fila as CredencialPropietario
}

// bcrypt recibe un HMAC de 43 caracteres: evita truncar frases Unicode y agrega
// un secreto externo a la base. El costo 12 se ejecuta en pgcrypto, ya instalado.
export async function guardarClave(sql: SQL, secreto: string, clave: string, tipo: 'empleado' | 'propietario'): Promise<string> {
  const material = await huella(secreto, tipo + ':' + clave)
  const [fila] = await sql`SELECT crypt(${material},gen_salt('bf',12)) AS hash`
  return String(fila.hash)
}

export async function comprobarClave(sql: SQL, secreto: string, clave: string, hash: string, tipo: 'empleado' | 'propietario'): Promise<boolean> {
  const material = await huella(secreto, tipo + ':' + clave)
  // Compatibilidad con claves aleatorias anteriores, hasta su primer cambio.
  if (!hash.startsWith('$2')) return tipo === 'empleado' && igualEnTiempoConstante(material, hash)
  const [fila] = await sql`SELECT crypt(${material},${hash}) AS hash`
  return igualEnTiempoConstante(String(fila.hash), hash)
}

export async function comprobarPropietario(db: string, secretoSesion: string, inicial: string, clave: string, fila: CredencialPropietario): Promise<boolean> {
  if (!clave || clave.length > 256) return false
  if (fila.clave_huella) return comprobarClave(neon(db), secretoSesion, clave, fila.clave_huella, 'propietario')
  return !!inicial && igualEnTiempoConstante(clave, inicial)
}

export function validarNuevaClave(r: {actual?:unknown;nueva?:unknown;confirmacion?:unknown} | null): string | null {
  if (!r || typeof r !== 'object' || Array.isArray(r)) return 'Revisá los datos del cambio de clave.'
  if (typeof r.actual !== 'string' || !r.actual || r.actual.length > 256) return 'Ingresá tu clave actual.'
  if (typeof r.nueva !== 'string' || [...r.nueva].length < 15 || [...r.nueva].length > 128 || !r.nueva.trim()) return 'La nueva clave debe tener entre 15 y 128 caracteres.'
  const normal=r.nueva.normalize('NFKC').toLowerCase().replace(/[\s._!-]/g,'')
  const frecuentes=['password','contraseña','contrasena','123456789','qwerty','labellalupita','bellalupita','administrador']
  if(new Set(normal).size<5||/^(\w{1,6})\1+$/.test(normal)||frecuentes.some(x=>normal===x||new RegExp('^'+x+'[0-9]*$').test(normal)))return 'Esta contraseña es demasiado previsible. Elegí una frase personal que no uses en otros sitios.'
  if (r.nueva !== r.confirmacion) return 'La confirmación no coincide con la nueva clave.'
  if (r.actual === r.nueva) return 'Elegí una clave diferente a la actual.'
  return null
}
