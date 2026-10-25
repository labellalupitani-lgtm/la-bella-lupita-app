/** Entradas de calendario e identificadores se validan antes de sus casts SQL. */
import { textoPerfilValido } from '../compartido/perfil'
export function fechaCalendario(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || valor < '0001-01-01') return false
  const fecha = new Date(valor + 'T00:00:00Z')
  return Number.isFinite(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor
}

export function idBigintPositivo(valor: string): boolean {
  return /^[1-9]\d{0,18}$/.test(valor)
    && (valor.length < 19 || valor <= '9223372036854775807')
}

/** Contar Unicode completo conserva nombres acentuados y caracteres no BMP. */
export function nombrePersonalValido(valor: unknown): valor is string {
  return typeof valor === 'string' && textoPerfilValido(valor, 2, 80)
}
