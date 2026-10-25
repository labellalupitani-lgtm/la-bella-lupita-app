/**
 * «El Grano que Cae» — la tarjeta de la tanda.
 *
 * Dos mecánicas de negocio en una pantalla:
 *  · Goal-gradient: las casillas vacías se aprietan conforme avanza la tanda
 *    (+20% de aceleración de compra documentada en cafés reales).
 *  · Anti-canje accidental: la décima no tiene botón, tiene un sostener de
 *    600 ms. Quemar la bebida de cortesía dentro del bolsillo es la queja
 *    número uno de los programas de sellos.
 */
import { useEffect, useRef, useState } from 'react'
import { m, useMotionValue, useTransform, animate, useReducedMotion, AnimatePresence } from 'motion/react'
import { useEstado } from '../lib/estado'
import { api } from '../lib/api'
import { useRouter } from '../lib/router'
import { fechaSello, haceCuanto } from '../lib/format'
import { RESORTE, acusarRecibo, MS, CURVA } from '../lib/movimiento'
import { tanda as copy } from '../data/copy'
import { Aviso } from '../componentes/Aviso'

const TOTAL = 9
const SOSTENER_MS = 600

function Volver() {
  const { navigate } = useRouter()
  return (
    <button className="volver" onClick={() => navigate('/')}>
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
        <path
          d="M10 3 5 8l5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Volver a la casa
    </button>
  )
}

export function Tanda() {
  const { estado, despachar, comprar } = useEstado()
  const reduce = useReducedMotion()
  const [aviso, setAviso] = useState<string | null>(null)
  const [canjeada, setCanjeada] = useState(false)

  const sellos = estado.socio.sellos.length
  const lista = sellos >= TOTAL
  const p = Math.min(1, sellos / TOTAL)
  const compresion = p * p * 7

  const sostener = useMotionValue(0)
  const haloOp = useTransform(sostener, [0, 1], [0, 0.9])
  const haloEsc = useTransform(sostener, [0, 1], [0.86, 1.12])
  // La muesca del troquel se abre mientras se sostiene: el papel se tensa
  // antes de romper. Es el mismo gesto de 600 ms que ya existia, pero ahora
  // produce el desgarro en vez de un halo que no significaba nada.
  const muesca = useTransform(sostener, [0, 1], ['10px', '13px'])
  const control = useRef<{ stop: () => void } | null>(null)
  const vale = useRef<HTMLDivElement>(null)

  // Al canjearse, el boton que tenia el foco se desmonta y el foco cae a
  // <body>: quien navega con teclado o lector pierde el hilo justo cuando
  // aparece un codigo que vence en noventa segundos. Se lo lleva al vale.
  useEffect(() => {
    if (canjeada) vale.current?.focus()
  }, [canjeada])

  // El código lo emite el servidor, es aleatorio y vence en noventa segundos.
  // Antes era `LUP-037-03`: determinista, mostrado antes de consumir la tanda,
  // y una captura de pantalla servía dos veces.
  const [codigo, setCodigo] = useState<string | null>(null)

  const armar = () => {
    if (!lista || canjeada) return
    control.current = animate(sostener, 1, {
      // El sostener es proteccion antitoque, no adorno: se mantiene en 600 ms
      // aunque el sistema pida movimiento reducido. Lo que se apaga es el
      // halo y la muesca, nunca el temporizador de seguridad.
      duration: SOSTENER_MS / 1000,
      ease: CURVA.crema,
      onComplete: async () => {
        acusarRecibo(18)
        const r = await comprar(() => api.canjearTanda(), { tipo: 'canjearTanda' })
        if (!r.ok) {
          setAviso(r.error)
          sostener.set(0)
          return
        }
        setCodigo((r.datos as { codigo?: string } | undefined)?.codigo ?? null)
        setCanjeada(true)
      },
    })
  }

  const soltar = () => {
    control.current?.stop()
    if (!canjeada) animate(sostener, 0, RESORTE.vuelve)
  }

  // La tanda ya se consumió al emitir el vale: aquí solo se cierra la tarjeta.
  const confirmarCanje = () => {
    setCanjeada(false)
    setCodigo(null)
    sostener.set(0)
    setAviso(copy.canje.hecho)
  }

  return (
    <>
      <header className="marco encabezado">
        <Volver />
        <p className="etiqueta encabezado__eyebrow">{copy.regla}</p>
        <h1 className="display-md">{copy.nombre}</h1>
        <p className="cuerpo encabezado__bajada">{copy.comoFunciona}</p>
      </header>

      <section className="marco" aria-label="Tu tarjeta de sellos">
        <div className={lista ? 'tarjeta-lg tarjeta-tanda es-lista' : 'tarjeta-lg tarjeta-tanda'}>

          <m.div
            className={canjeada ? 'tanda__rejilla se-rasga' : 'tanda__rejilla'}
            style={{ ['--muesca' as string]: muesca }}
            role="img"
            aria-label={
              `Tarjeta de la tanda: ${sellos} de ${TOTAL} troqueles cerrados, ` +
              `${TOTAL - sellos} todavia abiertos. La decima la pone la casa` +
              `${lista ? ', y ya esta lista para canjear.' : '.'}`
            }
          >
            {Array.from({ length: TOTAL }, (_, i) => {
              const lleno = i < sellos
              const registro = estado.socio.sellos[i]
              const vacios = Math.max(0, i - sellos + 1)
              const casiUltimo = !lleno && i === sellos && sellos === TOTAL - 1
              return (
                <m.div
                  key={i}
                  className={
                    lleno
                      ? i === sellos - 1
                        ? 'casilla es-llena es-nueva'
                        : 'casilla es-llena'
                      : 'casilla'
                  }
                  animate={{ x: lleno || reduce ? 0 : -compresion * vacios }}
                  transition={{ type: 'spring', stiffness: 180, damping: 24, mass: 1 }}
                >
                  {lleno ? (
                    <m.span
                      className="casilla__grano"
                      initial={i === sellos - 1 ? { scale: 1.35, y: -18, rotate: -18, opacity: 0 } : false}
                      animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
                      transition={RESORTE.cae}
                      title={registro ? `${registro.motivo} · ${fechaSello(new Date(registro.fecha))}` : undefined}
                    />
                  ) : (
                    <m.span
                      className="casilla__hueco"
                      animate={
                        casiUltimo && !reduce ? { opacity: [0.55, 1, 0.55], scale: [1, 1.06, 1] } : { opacity: 0.55 }
                      }
                      transition={casiUltimo && !reduce ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } : {}}
                    />
                  )}
                  <span className="casilla__n lab-sm" aria-hidden>
                    {i + 1}
                  </span>
                </m.div>
              )
            })}

          </m.div>

          {/* La décima vive FUERA del elemento enmascarado: `mask-clip` vale
              border-box, asi que si estuviera dentro, la animacion de
              arrancar el talon quedaria recortada y no se veria nunca. */}
          <div className={canjeada ? 'casilla-decima se-arranca' : 'casilla-decima'}>
            <span className={lista ? 'sello sello-impacto' : 'sello es-apagado'} style={{ ['--s' as string]: '52px' }}>
              10
            </span>
          </div>

          {/* Mitigacion (c) del riesgo de §6.1: diez circulos oscuros sobre
              papel pueden leerse como diez imagenes que no cargaron. Esta
              linea lo desarma con palabras, y ademas nombra el regalo que
              el Worker ya daba sin que nadie lo dijera. */}
          <p className="caption tanda__cortesia">
            Las dos primeras las puso la casa el día que te diste de alta.
          </p>

          <p className="tanda__estado">
            {lista ? (
              <span className="titulo-sm">{copy.completa.title}</span>
            ) : sellos === TOTAL - 1 ? (
              <span className="titulo-sm">{copy.faltaUno.title}</span>
            ) : sellos === 0 ? (
              <span className="titulo-sm">{copy.vacia.title}</span>
            ) : (
              <span className="titulo-sm">{copy.sello[sellos - 1]}</span>
            )}
          </p>
        </div>
      </section>

      {/* El canje: sostener, no tocar. */}
      <section className="marco seccion" aria-label="Canjear la décima">
        {lista && !canjeada && (
          <m.button
            className="canje"
            onPointerDown={armar}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            onPointerLeave={soltar}
            onKeyDown={(e) => {
              // Sin esto, el auto-repeat del teclado (~30 ms) reinicia la
              // animacion en cada repeticion y el sostener nunca completa:
              // la decima era inalcanzable sin raton.
              if (e.repeat) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                armar()
              }
            }}
            onKeyUp={soltar}
            onBlur={soltar}
            aria-label="Canjear tu décima bebida de la casa. Sostené un segundo para confirmar."
          >
            <m.span className="canje__halo" style={{ opacity: haloOp, scale: haloEsc }} aria-hidden />
            <svg viewBox="0 0 72 72" className="canje__anillo" aria-hidden>
              <circle cx="36" cy="36" r="33" fill="none" stroke="var(--line)" strokeWidth="2.5" />
              <m.circle
                cx="36"
                cy="36"
                r="33"
                fill="none"
                stroke="var(--brand-gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ pathLength: sostener, rotate: -90, transformOrigin: 'center' }}
              />
            </svg>
            <span className="canje__texto etiqueta">Sostené para canjear</span>
          </m.button>
        )}

        {!lista && (
          <div className="tanda__pista">
            <p className="cuerpo-sm">
              {sellos === 0
                ? copy.vacia.body
                : sellos === TOTAL - 1
                  ? copy.faltaUno.body
                  : `Te ${TOTAL - sellos === 1 ? 'falta' : 'faltan'} ${TOTAL - sellos} para cerrar la tanda. Se pone uno por visita, sin importar lo que pidás.`}
            </p>
          </div>
        )}

        <AnimatePresence>
          {canjeada && (
            <m.div
              className="brasa canje__vale"
              role="status"
              aria-live="assertive"
              tabIndex={-1}
              ref={vale}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: MS.corta / 1000 } }}
              transition={RESORTE.entra}
            >
              <p className="etiqueta">{copy.canje.title}</p>
              <p className="cuerpo-sm">{copy.canje.body}</p>
              <p className="lab-xl canje__codigo">{codigo ?? '········'}</p>
              <p className="caption">vale por una bebida de la casa · vence en 90 segundos</p>
              <p className="caption canje__aviso">{copy.canje.aviso}</p>
              <div className="canje__botones">
                <button className="boton boton-verde boton-lleno" onClick={confirmarCanje}>
                  {copy.canje.confirmar}
                </button>
                <button
                  className="boton boton-tenue"
                  onClick={() => {
                    setCanjeada(false)
                    sostener.set(0)
                    setAviso('Guardado. El código sigue vivo noventa segundos; pasado ese rato, pedí otro.')
                  }}
                >
                  {copy.completa.luego}
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </section>

      {/* Historial: cada sello con su nombre y su día. Es memoria, no lista. */}
      {estado.socio.sellos.length > 0 && (
        <section className="marco seccion" aria-label="Historial de la tanda">
          <div className="seccion__titulo">
            <h2 className="titulo-md">Lo que llevás en esta tanda</h2>
          </div>
          <ul className="historial">
            {[...estado.socio.sellos].reverse().map((s) => (
              <li key={s.n} className="dato">
                <span>
                  <span className="lab-sm historial__n">{String(s.n).padStart(2, '0')}</span> {s.motivo}
                </span>
                <span className="dato__valor caption">
                  {haceCuanto(new Date(s.fecha))} · {s.barista}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  )
}
