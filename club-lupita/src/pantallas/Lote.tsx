/**
 * «El Ascenso» — ficha del lote con transparencia radical.
 *
 * Una bolsa de finca propia cuesta dos o tres veces la del supermercado. La
 * objeción no es el precio: es que el precio no está explicado. Aquí el scroll
 * ES la subida a los 1,340 metros, y cada dato aparece al cruzar su cota.
 *
 * Cero secuestro de scroll: useScroll solo LEE. Un enlace de salto lleva
 * directo a la ficha técnica y al precio para quien no quiera subir la montaña.
 */
import { useRef } from 'react'
import { m, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react'
import { useRouter } from '../lib/router'
import { useEstado } from '../lib/estado'
import { cordobas } from '../lib/format'
import { CURVA, MS } from '../lib/movimiento'
import { lote as copy } from '../data/copy'

const CIMA = 1340
const PRECIO_LOTE = 89000 // C$890 la bolsa de 340 g

export function Lote() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { navigate } = useRouter()
  const { estado } = useEstado()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const altura = useSpring(useTransform(scrollYProgress, [0, 1], [0, CIMA]), {
    stiffness: 120,
    damping: 26,
    mass: 1,
  })
  const metros = useTransform(altura, (v) => Math.round(v / 5) * 5)
  const sierra = useTransform(scrollYProgress, [0, 1], [0, -180])
  const frio = useTransform(scrollYProgress, [0.45, 1], [0, 1])
  const barra = useTransform(scrollYProgress, [0.9, 1], [72, 0])

  return (
    <article ref={ref} className="lote">
      {/* Dos capas de gradiente en crossfade: el aire se enfría al subir.
          Nunca se anima background-color. */}
      <m.div className="lote__frio" style={{ opacity: reduce ? 0.5 : frio }} aria-hidden />
      <m.div className="lote__sierra" style={{ y: reduce ? 0 : sierra }} aria-hidden>
        <svg viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
          <path
            d="M0 120 L46 62 L78 82 L112 38 L152 74 L196 26 L238 68 L282 44 L330 78 L366 52 L400 88 L400 120 Z"
            fill="currentColor"
          />
        </svg>
      </m.div>

      <div className="marco lote__cabeza">
        <button className="volver" onClick={() => navigate('/finca')}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver a la finca
        </button>

        {/* Primer elemento enfocable: nadie tiene que subir la montaña para ver el precio. */}
        <a className="lote__atajo" href="#ficha-tecnica">
          Ir a la ficha técnica y el precio
        </a>

        <p className="etiqueta">{copy.subtitulo}</p>
        <h1 className="display-xl lote__nombre">{copy.nombre}</h1>
        <p className="etiqueta lote__perfil">{copy.perfil}</p>
      </div>

      {/* Altímetro: ruido puro para un lector de pantalla, por eso va oculto. */}
      <div className="lote__altimetro" aria-hidden>
        <m.span className="lab-lg">{metros}</m.span>
        <span className="lab-sm lote__unidad">m s. n. m.</span>
      </div>

      <div className="marco lote__cuerpo">
        {copy.datos.map((d, i) => (
          <m.section
            key={d.label}
            className="lote__hito"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5, margin: '0px 0px -12% 0px' }}
            transition={{ duration: MS.media / 1000, ease: CURVA.extraccion, delay: Math.min(i, 3) * 0.03 }}
          >
            <p className="lab-sm lote__cota">{d.altura.toLocaleString('es-NI')} m</p>
            <h2 className="etiqueta">{d.label}</h2>
            <p className="display-md lote__valor">{d.valor}</p>
            <p className="cuerpo-sm">{d.detalle}</p>
          </m.section>
        ))}

        <m.section
          className="lote__origen"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: MS.larga / 1000, ease: CURVA.extraccion }}
        >
          <hr className="regla-oro" />
          <p className="cuerpo-lg voz-editorial lote__origen-texto">{copy.origen}</p>
        </m.section>

        {/* La curva de tueste: el gráfico más honesto que puede tener esta marca. */}
        <section className="lote__tueste" aria-label="Perfil de tueste">
          <p className="etiqueta">Perfil de tueste</p>
          <svg
            className="curva-tueste"
            viewBox="0 0 320 120"
            fill="none"
            preserveAspectRatio="none"
            role="img"
            aria-label="Perfil de tueste: 9 minutos 40 segundos, primer crack al minuto 7:12"
          >
            <defs>
              <linearGradient id="tueste" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="var(--tueste-a)" />
                <stop offset=".55" stopColor="var(--tueste-b)" />
                <stop offset="1" stopColor="var(--tueste-c)" />
              </linearGradient>
            </defs>
            <path d="M0 82H320M0 44H320" stroke="var(--line)" strokeWidth="1" />
            <path
              className="curva-tueste__trazo"
              d="M0 112C46 108 74 92 104 70S168 26 214 18S288 12 320 10"
              stroke="url(#tueste)"
              strokeWidth="2"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            <path d="M214 18V120" stroke="var(--line-gold)" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="214" cy="18" r="3.5" fill="var(--gold-bright)" />
            <circle cx="214" cy="18" r="8" fill="none" stroke="var(--line-gold)" strokeWidth="1" />
          </svg>
          <p className="caption">
            Primer crack a los <span className="lab">7:12</span> · descarga a los <span className="lab">9:40</span> ·
            tandas de 12 kg en la casa
          </p>
        </section>

        {/* Ficha técnica: existe siempre, en texto, sin condiciones de scroll. */}
        <section className="lote__ficha" id="ficha-tecnica" aria-label="Ficha técnica y precio">
          <h2 className="titulo-lg">Ficha técnica</h2>
          <dl className="lote__tabla">
            {copy.datos.map((d) => (
              <div key={d.label} className="dato">
                <dt className="caption">{d.label}</dt>
                <dd className="dato__valor lab">{d.valor}</dd>
              </div>
            ))}
          </dl>
          <p className="cuerpo-sm lote__transparencia">{copy.transparencia}</p>

          <div className="lote__compra">
            <div>
              <p className="etiqueta">Bolsa de 340 g</p>
              <p className="lab-lg">{cordobas(PRECIO_LOTE)}</p>
            </div>
            <span className="chip">quedan {estado.cupos.bolsasReserva} de 150</span>
          </div>
          <button className="boton boton-verde boton-lleno" onClick={() => navigate('/finca')}>
            {copy.cta}
          </button>
        </section>
      </div>

      {/* Barra de acción: sube al final del ascenso. */}
      <m.div className="lote__barra" style={{ y: reduce ? 0 : barra }}>
        <span className="lab">{cordobas(PRECIO_LOTE)}</span>
        <button className="boton boton-verde" onClick={() => navigate('/finca')}>
          Reservá de esta cosecha
        </button>
      </m.div>
    </article>
  )
}
