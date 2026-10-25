/** Contrato de autogestión, compartido por formulario y Worker. */
export type PerfilEditable = {
  nombre: string
  bebida_siempre: string
  alergias: string
  cumple: string // MM-DD, o vacío. No se pide año de nacimiento.
  promociones_correo: boolean
}
export type PerfilDatos = {
  id: string; telefono: string; correo: string | null; correo_verificado: string | null
  creado: string; version: number
} & PerfilEditable
export const camposPerfil = ['nombre', 'bebida_siempre', 'alergias', 'cumple', 'promociones_correo'] as const
export type ErroresPerfil = Partial<Record<keyof PerfilEditable, string>>
export const textoPerfilValido = (v: string, min: number, max: number) => {
  const n = [...v.trim()].length
  return n >= min && n <= max && !/[\p{Cc}\p{Cs}\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(v)
}
export const cumpleValido = (v: string) => !v || /^\d{2}-\d{2}$/.test(v)
  && Number.isFinite(Date.parse('2000-' + v + 'T12:00:00Z'))
  && new Date('2000-' + v + 'T12:00:00Z').toISOString().slice(5, 10) === v
export function erroresPerfil(v: PerfilEditable): ErroresPerfil {
  v = normalizarPerfil(v)
  const errores: ErroresPerfil = {}
  if (!textoPerfilValido(v.nombre, 2, 80)) errores.nombre = 'Usá entre 2 y 80 caracteres, sin caracteres de control.'
  if (!textoPerfilValido(v.bebida_siempre, 0, 120)) errores.bebida_siempre = 'Usá hasta 120 caracteres, sin caracteres de control.'
  if (!textoPerfilValido(v.alergias, 0, 240)) errores.alergias = 'Usá hasta 240 caracteres, sin caracteres de control.'
  if (!cumpleValido(v.cumple)) errores.cumple = 'Indicá un día y mes válidos, o dejá ambos vacíos.'
  return errores
}
export function editableDe(v: PerfilDatos): PerfilEditable {
  return { nombre: v.nombre, bebida_siempre: v.bebida_siempre, alergias: v.alergias, cumple: v.cumple, promociones_correo: v.promociones_correo }
}
export function normalizarPerfil(v: PerfilEditable): PerfilEditable {
  const [mes, dia] = v.cumple.split('-')
  const cumple = v.cumple === '' || v.cumple === '-' ? '' : /^\d{1,2}-\d{1,2}$/.test(v.cumple) ? `${mes.padStart(2, '0')}-${dia.padStart(2, '0')}` : v.cumple
  return { ...v, cumple, nombre: v.nombre.trim(), bebida_siempre: v.bebida_siempre.trim(), alergias: v.alergias.trim() }
}
export function perfilValido(v: unknown): v is PerfilDatos {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const p = v as Record<string, unknown>
  return typeof p.id === 'string' && typeof p.telefono === 'string'
    && typeof p.creado === 'string' && Number.isFinite(Date.parse(p.creado))
    && (p.correo === null || typeof p.correo === 'string')
    && (p.correo_verificado === null || typeof p.correo_verificado === 'string' && Number.isFinite(Date.parse(p.correo_verificado)))
    && Number.isSafeInteger(p.version) && Number(p.version) >= 0
    && ['nombre', 'bebida_siempre', 'alergias', 'cumple'].every(k => typeof p[k] === 'string')
    && typeof p.promociones_correo === 'boolean'
    && cumpleValido(p.cumple as string)
    && Object.keys(erroresPerfil(p as PerfilDatos)).length === 0
}
