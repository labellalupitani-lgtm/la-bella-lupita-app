/**
 * Un solo vocabulario de movimiento para toda la app.
 *
 * Principio: nada aparece — todo se sirve. La materia entra con peso,
 * desacelera como líquido denso sobre crema, y no rebota. El único
 * sobrepaso del sistema es el del lacre.
 */

export const RESORTE = {
  /** algo cae */
  cae: { type: 'spring', stiffness: 520, damping: 26, mass: 0.9 },
  /** algo tiene peso */
  pesa: { type: 'spring', stiffness: 140, damping: 18, mass: 1.1 },
  /** algo regresa a su sitio */
  vuelve: { type: 'spring', stiffness: 500, damping: 40, mass: 1 },
  /** algo aparece */
  entra: { type: 'spring', stiffness: 380, damping: 32, mass: 1 },
  /** algo acusa recibo */
  acusa: { type: 'spring', stiffness: 700, damping: 18, mass: 0.7 },
  /** la comanda se va a la barra */
  despacha: { type: 'spring', stiffness: 420, damping: 34, mass: 1 },
  /** el nivel del líquido */
  liquido: { type: 'spring', stiffness: 260, damping: 30, mass: 1.1 },
} as const

export const CURVA = {
  extraccion: [0.16, 0.84, 0.24, 1],
  crema: [0.32, 0.72, 0.18, 1],
  caida: [0.55, 0, 0.86, 0.3],
  vapor: [0.62, 0.02, 0.2, 1],
} as const

export const MS = {
  micro: 120,
  corta: 200,
  media: 320,
  larga: 520,
  ritual: 840,
} as const

/** Entrada estándar de una sección. Máximo 6 por pantalla, stagger ≤ 40 ms. */
export const entraDesdeAbajo = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: MS.media / 1000, ease: CURVA.extraccion },
}

/** Aparición al entrar en viewport, una sola vez. */
export const alAparecer = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4, margin: '0px 0px -10% 0px' },
  transition: { duration: MS.media / 1000, ease: CURVA.extraccion },
}

/** Perfil sobrio para gama baja: la heurística puede fallar, así que
 *  el usuario también puede forzarlo desde su perfil. */
export function equipoModesto(): boolean {
  if (typeof navigator === 'undefined') return false
  const n = navigator as Navigator & { deviceMemory?: number }
  const memoria = n.deviceMemory ?? 8
  const nucleos = n.hardwareConcurrency ?? 8
  return memoria <= 4 || nucleos <= 4
}

/** Vibración corta como acuse de recibo. Nunca es el único acuse:
 *  iOS Safari no tiene Vibration API. */
export function acusarRecibo(patron: number | number[] = 14) {
  try {
    navigator.vibrate?.(patron)
  } catch {
    /* sin soporte: el cambio visual ya comunicó */
  }
}
