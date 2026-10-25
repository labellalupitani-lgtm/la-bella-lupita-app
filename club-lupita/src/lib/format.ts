/** Formato de moneda, fechas y números — español de Nicaragua. */

/** Centavos de córdoba → «C$ 1,240» (sin decimales si son .00). */
export function cordobas(centavos: number, opts?: { signo?: boolean; decimales?: boolean }): string {
  const neg = centavos < 0
  const v = Math.abs(centavos) / 100
  const decimales = opts?.decimales ?? v % 1 !== 0
  const cuerpo = v.toLocaleString('es-NI', {
    minimumFractionDigits: decimales ? 2 : 0,
    maximumFractionDigits: decimales ? 2 : 0,
  })
  const signo = opts?.signo ? (neg ? '−' : '+') : neg ? '−' : ''
  return `${signo}C$ ${cuerpo}`
}

/** Solo la cifra, sin el símbolo — para composiciones tipográficas. */
export function cifra(centavos: number): string {
  const v = Math.abs(centavos) / 100
  return v.toLocaleString('es-NI', {
    minimumFractionDigits: v % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: v % 1 !== 0 ? 2 : 0,
  })
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

/** «14 de septiembre» */
export const fechaCorta = (d: Date) => `${d.getDate()} de ${MESES[d.getMonth()]}`

/** «viernes 14 de septiembre» */
export const fechaLarga = (d: Date) => `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`

/** «14 SEP» — para etiquetas compactas en mayúsculas. */
export const fechaSello = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()].slice(0, 3).toUpperCase()}`

/** «3:45 p.m.» */
export function hora(d: Date): string {
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m} ${h < 12 ? 'a.m.' : 'p.m.'}`
}

/** «hace 3 días», «ayer», «hoy» — en voz de casa. */
export function haceCuanto(d: Date, ahora = new Date()): string {
  const dias = Math.floor((ahora.getTime() - d.getTime()) / 86_400_000)
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'ayer'
  if (dias < 7) return `hace ${dias} días`
  if (dias < 14) return 'la semana pasada'
  if (dias < 60) return `hace ${Math.floor(dias / 7)} semanas`
  return `hace ${Math.floor(dias / 30)} meses`
}

/** 037 → «#037». Número de socio con tres cifras. */
export const numeroSocio = (n: number) => `#${String(n).padStart(3, '0')}`

/** Ordinal femenino corto para bolsas numeradas: 034 → «034». */
export const numeroBolsa = (n: number) => String(n).padStart(3, '0')

/** Enlace de WhatsApp con mensaje pre-escrito. */
export function enlaceWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

/** Elige un elemento estable a partir de una semilla (no cambia entre renders). */
export function elegirEstable<T>(lista: readonly T[], semilla: number): T {
  return lista[Math.abs(Math.floor(semilla)) % lista.length]
}

/** Pluraliza sin la muleta de «(s)». */
export const plural = (n: number, uno: string, muchos: string) => (n === 1 ? uno : muchos)
