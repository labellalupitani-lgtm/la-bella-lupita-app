/**
 * «Camino de altura» — los niveles del club como una subida real.
 *
 * Antes esto eran tres puntos en un borde izquierdo con `opacity: 0.5`. Una de
 * las mecánicas centrales del sistema resuelta en cuarenta píxeles.
 *
 * La idea que lo salva ya estaba en la marca y no se estaba usando: la casa
 * tiene una finca a 1.340 metros, y la ficha del lote es una subida. El nivel
 * del socio es la misma subida, medida en visitas en vez de en metros. Casa
 * Abierta está en la barra, al nivel del mar; Reserva de Altura está arriba,
 * donde crece el café que se bebe abajo.
 *
 * Se dibuja con un solo SVG: la ladera, la senda punteada y la posición del
 * socio. Cero imágenes.
 */
import { m, useReducedMotion } from 'motion/react'
import { NIVELES } from '../data/copy'
import { CURVA, MS } from '../lib/movimiento'

/** Cota de cada nivel, en metros. La cima es la finca de la familia. */
const COTAS = [40, 620, 1340]
const CIMA = 1340

type Props = {
  /** índice del nivel alcanzado, 0 a 2 */
  nivel: number
  /** sellos que faltan para el siguiente; 0 si ya está arriba */
  faltan: number
  tandas: number
}

export function CaminoDeAltura({ nivel, faltan, tandas }: Props) {
  const reduce = useReducedMotion()

  // Posición del socio: la cota de su nivel más lo que lleva avanzado hacia
  // el siguiente. Si no falta nada, está en la cima.
  //
  // El tramo NO son nueve sellos. De Casa Abierta a Mesa de Siempre hay dos
  // tandas (18) y de ahí a Reserva de Altura hay tres (27). Dividir entre 9
  // dejaba el avance en negativo durante los primeros dos tercios de cada
  // nivel, `Math.max` lo aplastaba a cero, y la senda —que es la firma de esta
  // pieza— se quedaba clavada en el hito sin un milímetro andado.
  const siguiente = COTAS[nivel + 1]
  const tramo = siguiente ? (NIVELES[nivel + 1].tandas - NIVELES[nivel].tandas) * 9 : 0
  const avance = tramo && faltan > 0 ? Math.max(0, Math.min(1, 1 - faltan / tramo)) : 0
  const cota = siguiente ? COTAS[nivel] + (siguiente - COTAS[nivel]) * avance : CIMA
  const alturaRel = cota / CIMA

  // 0 m abajo, 1.340 arriba: el eje del dibujo va al revés que el del SVG.
  const y = (metros: number) => 300 - (metros / CIMA) * 268

  return (
    <div className="camino">
      <svg viewBox="0 0 220 320" className="camino__lienzo" role="img" aria-label={`Estás a ${Math.round(cota)} metros del camino: ${NIVELES[nivel].nombre}.`}>
        {/* La ladera: la misma silueta del ascenso de la ficha de lote. */}
        <path
          d="M0 320 L34 250 L58 268 L92 196 L128 232 L156 150 L184 186 L220 96 L220 320 Z"
          className="camino__ladera"
        />

        {/* La senda: punteada donde falta por subir, continua donde ya se anduvo. */}
        <path d="M28 300 C70 292, 84 236, 110 214 S168 150, 196 60" className="camino__senda" />
        <m.path
          d="M28 300 C70 292, 84 236, 110 214 S168 150, 196 60"
          className="camino__andado"
          pathLength={1}
          strokeDasharray="1"
          initial={reduce ? { strokeDashoffset: 1 - alturaRel } : { strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 1 - alturaRel }}
          transition={{ duration: MS.ritual / 1000, ease: CURVA.extraccion }}
        />

        {/* Las tres cotas. */}
        {COTAS.map((metros, i) => (
          <g key={metros} className={i <= nivel ? 'camino__hito es-alcanzado' : 'camino__hito'}>
            <line x1="14" x2="206" y1={y(metros)} y2={y(metros)} className="camino__cota" />
            <circle cx="28" cy={y(metros)} r={i === nivel ? 5.5 : 3.5} className="camino__marca" />
            <text x="206" y={y(metros) - 6} className="camino__metros" textAnchor="end">
              {metros.toLocaleString('es-NI')} m
            </text>
          </g>
        ))}
      </svg>

      <ol className="camino__niveles">
        {NIVELES.map((n, i) => (
          <li key={n.id} className={i === nivel ? 'camino__nivel es-actual' : i < nivel ? 'camino__nivel es-pasado' : 'camino__nivel'}>
            <p className="lab-sm camino__nivel-cota">{COTAS[i].toLocaleString('es-NI')} m</p>
            <p className="titulo-sm">{n.nombre}</p>
            <p className="cuerpo-sm">{n.tagline}</p>
            <p className="caption">{n.rango}</p>
          </li>
        ))}
      </ol>

      <p className="caption camino__pie">
        {tandas === 0
          ? 'Todavía no cerrás tu primera tanda. El camino empieza en la barra.'
          : `Llevás ${tandas} ${tandas === 1 ? 'tanda cerrada' : 'tandas cerradas'}. Arriba está la finca, a 1,340 metros.`}
      </p>
    </div>
  )
}
