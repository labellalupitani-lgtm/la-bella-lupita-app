/**
 * «La Mesa Larga» — el cupo de una experiencia, hecho objeto.
 *
 * Experiencias era la última pantalla de socio sin nada con autoría propia:
 * tres tarjetas apiladas, y es la que cobra más caro de toda la app. Vende una
 * silla en una mesa de doce y no había ninguna mesa en pantalla; el cupo vivía
 * en un chip que decía «quedan 4».
 *
 * La Tanda tiene el lacre, la Cuenta la jarra, la Finca la bolsa numerada, la
 * Mesa Fundadora el carnet. Esto es el objeto que le faltaba: las sillas que de
 * verdad hay, las tomadas apagadas, y la tuya encendiéndose cuando la apartás.
 *
 * El número sale de `/api/cupos`, igual que el chip. Si el servidor no
 * responde, la mesa no se dibuja: una mesa con sillas inventadas sería
 * exactamente lo que esta app lleva seis rondas prometiendo que no hace.
 */
import { m, useReducedMotion } from 'motion/react'
import { RESORTE, CURVA, MS } from '../lib/movimiento'

type Props = {
  /** sillas totales de la sesión */
  cupos: number
  /** sillas libres según el servidor; null = todavía no se sabe */
  libres: number | null
  /** número de butaca que devolvió el servidor al apartar, si fue ahora */
  mia?: number | null
}

export function MesaLarga({ cupos, libres, mia }: Props) {
  const reduce = useReducedMotion()
  if (libres === null) return null

  const tomadas = cupos - libres
  const arriba = Math.ceil(cupos / 2)
  const abajo = cupos - arriba

  // El servidor manda el CONTEO de sillas tomadas, no quién se sienta dónde.
  // Llenarlas de izquierda a derecha dejaba la fila de arriba entera apagada y
  // las tomadas amontonadas abajo: el dibujo afirmaba una disposición que nadie
  // reportó. Se ocupan alternando entre las dos filas, así que ninguna queda
  // vacía mientras la otra se llena. El número es el mismo; el dibujo deja de
  // decir algo que no sabe.

  // La mesa crece con las sillas: doce y veinte no ocupan lo mismo.
  const ancho = 40 + arriba * 30
  const alto = 96

  const silla = (i: number, fila: 'arriba' | 'abajo') => {
    const idx = fila === 'arriba' ? i : arriba + i
    const total = fila === 'arriba' ? arriba : abajo
    const x = 28 + ((ancho - 56) / Math.max(1, total - 1)) * i
    const y = fila === 'arriba' ? 18 : alto - 18
    // Turno de ocupación: arriba impares del reparto, abajo pares, alternando.
    const turno = fila === 'arriba' ? i * 2 : i * 2 + 1
    const ocupada = turno < tomadas
    // La butaca que devolvió el servidor viene numerada desde 1.
    const esMia = mia != null && idx === mia - 1
    return (
      <m.g
        key={`${fila}-${i}`}
        className={esMia ? 'mesa__silla es-mia' : ocupada ? 'mesa__silla es-tomada' : 'mesa__silla'}
        initial={esMia && !reduce ? { scale: 0.7, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={RESORTE.acusa}
        style={{ transformOrigin: `${x}px ${y}px`, transformBox: 'view-box' }}
      >
        {/* Respaldo y asiento: una silla de mesa larga vista desde arriba. */}
        <rect x={x - 7} y={y - 5} width="14" height="10" rx="2.5" className="mesa__asiento" />
        <rect
          x={x - 7}
          y={fila === 'arriba' ? y - 9.5 : y + 5.5}
          width="14"
          height="4"
          rx="1.6"
          className="mesa__respaldo"
        />
      </m.g>
    )
  }

  return (
    <figure className="mesa">
      <div className="mesa__riel">
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        className="mesa__lienzo"
        role="img"
        aria-label={
          libres <= 0
            ? `Mesa de ${cupos} sillas, todas tomadas.`
            : `Mesa de ${cupos} sillas: ${tomadas} tomadas, ${libres} ${libres === 1 ? 'libre' : 'libres'}.`
        }
      >
        {/* La madera. */}
        <rect x="20" y="30" width={ancho - 40} height={alto - 60} rx="4" className="mesa__tabla" />
        {/* La veta: dos líneas, no una textura. */}
        <line x1="30" x2={ancho - 30} y1={alto / 2 - 4} y2={alto / 2 - 4} className="mesa__veta" />
        <line x1="34" x2={ancho - 26} y1={alto / 2 + 5} y2={alto / 2 + 5} className="mesa__veta" />

        {Array.from({ length: arriba }, (_, i) => silla(i, 'arriba'))}
        {Array.from({ length: abajo }, (_, i) => silla(i, 'abajo'))}
      </svg>
      </div>

      <figcaption className="caption mesa__pie">
        {libres <= 0 ? (
          'La mesa está completa. La próxima fecha se abre en el calendario.'
        ) : (
          <>
            <m.span
              key={libres}
              className="lab mesa__cuenta"
              initial={reduce ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MS.corta / 1000, ease: CURVA.extraccion }}
            >
              {libres}
            </m.span>{' '}
            {libres === 1 ? 'silla libre' : 'sillas libres'} de {cupos}
          </>
        )}
      </figcaption>
    </figure>
  )
}
