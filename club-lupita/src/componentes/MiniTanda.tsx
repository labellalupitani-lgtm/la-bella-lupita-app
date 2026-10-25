/**
 * La tanda comprimida — versión de bolsillo del «Grano que Cae».
 *
 * El truco es la compresión goal-gradient: las casillas vacías cierran filas
 * conforme avanzás. Desplazamiento de la casilla vacía i: x = −(p² · 7px · i).
 * A 7/9 (p² = 0.60) la última se corre 8.4 px hacia la anterior. No se lee:
 * se siente. Es el gradiente de meta hecho espacio.
 */
import { m, useReducedMotion } from 'motion/react'
import { RESORTE } from '../lib/movimiento'

const TOTAL = 9

export function MiniTanda({ sellos, onAbrir }: { sellos: number; onAbrir: () => void }) {
  const reduce = useReducedMotion()
  const p = Math.min(1, sellos / TOTAL)
  const compresion = p * p * 7

  return (
    <button
      className="minitanda"
      onClick={onAbrir}
      aria-label={
        sellos >= TOTAL
          ? 'Tanda cerrada. La décima la pone la casa. Abrí la tarjeta para canjear.'
          : `Llevás ${sellos} de ${TOTAL} sellos. Te falta${TOTAL - sellos > 1 ? 'n' : ''} ${TOTAL - sellos}.`
      }
    >
      <span className="minitanda__granos" aria-hidden>
        {Array.from({ length: TOTAL }, (_, i) => {
          const lleno = i < sellos
          const vacios = Math.max(0, i - sellos + 1)
          return (
            <m.span
              key={i}
              className={lleno ? 'grano es-lleno' : 'grano'}
              animate={{ x: lleno || reduce ? 0 : -compresion * vacios }}
              transition={{ type: 'spring', stiffness: 180, damping: 24, mass: 1 }}
            >
              {lleno && (
                <m.span
                  className="grano__cuerpo"
                  initial={i === sellos - 1 ? { scale: 1.35, y: -14, rotate: -18, opacity: 0 } : false}
                  animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
                  transition={RESORTE.cae}
                />
              )}
            </m.span>
          )
        })}
      </span>

      <span className="minitanda__cuenta">
        <span className="lab-lg">{sellos}</span>
        <span className="caption"> de {TOTAL}</span>
      </span>
    </button>
  )
}
