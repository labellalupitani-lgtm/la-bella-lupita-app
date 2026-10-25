/**
 * «Lo de Siempre» — la comanda del barista.
 *
 * Problema que resuelve: el socio de más valor viene tres veces por semana y
 * quiere lo mismo. Cada segundo de decisión sobre una red lenta es un pedido
 * que se pierde. Palanca: sentirse conocido (el 50% lo valora por encima de
 * los puntos) + velocidad de recompra.
 *
 * El gesto ELIGE; el cobro se confirma aparte. Nunca se cobra por arrastre.
 * El upsell aparece al 40% del recorrido — en el instante de compromiso,
 * no en el de exploración.
 */
import { m, useMotionValue, useTransform, useReducedMotion } from 'motion/react'
import { RESORTE, acusarRecibo } from '../lib/movimiento'
import { cordobas } from '../lib/format'
import type { PlatoCarta } from '../data/menu'

const RECORRIDO = 148
// 70% del recorrido. Antes era 59% y ademas se disparaba por velocidad:
// un flick de scroll normal supera los 1000 px/s y compraba un cafe.
const UMBRAL = 104

type Props = {
  usual: PlatoCarta
  acompanamiento: PlatoCarta | null
  minutos: number
  onPedir: (conAcompanamiento: boolean) => void
}

export function Comanda({ usual, acompanamiento, minutos, onPedir }: Props) {
  const reduce = useReducedMotion()
  const y = useMotionValue(0)
  const p = useTransform(y, [0, RECORRIDO], [0, 1])
  const opGuia = useTransform(p, [0.5, 0.62], [1, 0])
  const opArma = useTransform(p, [0.5, 0.62], [0, 1])
  const opAttach = useTransform(p, [0.34, 0.46], [0, 1])
  const sombra = useTransform(p, [0, 1], [0.28, 0.72])

  const despachar = (conAcomp: boolean) => {
    acusarRecibo(14)
    onPedir(conAcomp)
  }

  // Nombra la consecuencia, no el gesto — y la consecuencia real: la comanda
  // llena el pedido, no cobra ni manda nada a la barra todavía.
  const etiquetaLectura =
    `Pedir ${usual.nombre}, ${cordobas(usual.precio)}, listo en ${minutos} minutos. ` +
    'Queda anotado en tu pedido; el cobro se confirma aparte.'

  return (
    <div className="comanda-marco">
      <m.article
        className="comanda"
        style={{ y }}
        drag={reduce ? false : 'y'}
        dragConstraints={{ top: 0, bottom: RECORRIDO }}
        dragElastic={0.06}
        dragMomentum={false}
        dragDirectionLock
        onDragEnd={(_, info) => {
          // La velocidad NO compromete: solo la distancia recorrida.
          if (info.offset.y > UMBRAL) despachar(false)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            despachar(false)
          }
        }}
        aria-label={etiquetaLectura}
        aria-describedby="comanda-ayuda"
      >
        <m.div className="comanda__plato" style={{ opacity: sombra }} aria-hidden />

        <p className="etiqueta comanda__hola">Lo de siempre</p>
        <h2 className="titulo-lg comanda__item">{usual.nombre}</h2>
        <p className="caption comanda__meta">
          <span className="lab">{cordobas(usual.precio)}</span>
          <span aria-hidden> · </span>
          listo en <span className="lab">{minutos}</span> min
        </p>

        {acompanamiento && (
          <m.p className="comanda__attach caption" style={{ opacity: opAttach }} aria-hidden>
            ¿le sumás un {acompanamiento.nombre}? {cordobas(acompanamiento.precio)}
          </m.p>
        )}

        <div className="comanda__pistas" aria-hidden hidden={!!reduce}>
          <m.span className="etiqueta" style={{ opacity: opGuia }}>
            Deslizá para pedir
          </m.span>
          <m.span className="etiqueta es-arma" style={{ opacity: opArma }}>
            Soltá — va para la barra
          </m.span>
        </div>

        <span className="comanda__perforacion" aria-hidden />
      </m.article>

      <p id="comanda-ayuda" className="solo-lectura">
        Podés mandarlo a la barra con el botón de abajo, sin necesidad de deslizar.
      </p>

      {/* Ruta completa sin arrastre: teclado, lector de pantalla y movimiento reducido. */}
      <div className="comanda__salidas">
        <button className="boton boton-verde" onClick={() => despachar(false)}>
          Pedir lo de siempre
        </button>
        {acompanamiento && (
          <button className="boton boton-linea" onClick={() => despachar(true)}>
            Con {acompanamiento.nombre}
          </button>
        )}
      </div>
    </div>
  )
}
