/**
 * «La Jarra» — la Cuenta de Casa.
 *
 * La tabla de bonos es un texto que nadie lee. La jarra la convierte en algo
 * que se arrastra: el nivel del líquido es el monto, las marcas grabadas en
 * el vidrio son los tramos con bono, y bajo la siguiente marca aparece la
 * línea fantasma «te faltan C$180 para +C$100» — que es exactamente lo que
 * sube el ticket de recarga.
 *
 * Soltar no cobra nada. El botón cobra.
 */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  m,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  useAnimationFrame,
  useReducedMotion,
  AnimatePresence,
} from 'motion/react'
import { useEstado } from '../lib/estado'
import { api } from '../lib/api'
import { useRouter } from '../lib/router'
import { cordobas, fechaSello, haceCuanto } from '../lib/format'
import { acusarRecibo, RESORTE, CURVA, MS } from '../lib/movimiento'
import { cuenta as copy, t } from '../data/copy'
import { Aviso } from '../componentes/Aviso'
import { useHoja } from '../componentes/useHoja'

const MIN = 20000 // C$200 en centavos
const MAX = 300000 // C$3,000
const TRAMOS = copy.recarga.opciones // 500 / 1,000 / 2,000
const IMAN = 6000 // ±C$60
const cortar = (v: number) => Math.min(1, Math.max(0, v))

/** Bono correspondiente a un monto: solo se gana al alcanzar el tramo. */
function bonoDe(centavos: number): { bono: number; siguiente: (typeof TRAMOS)[number] | null } {
  let bono = 0
  for (const tramo of TRAMOS) if (centavos >= tramo.monto) bono = tramo.bono
  const siguiente = TRAMOS.find((x) => x.monto > centavos) ?? null
  return { bono, siguiente }
}

export function Cuenta() {
  const { estado, comprar, saldo, saldoPagado, saldoBono } = useEstado()
  const { navigate } = useRouter()
  const reduce = useReducedMotion()
  const [aviso, setAviso] = useState<string | null>(null)
  // El asiento abierto. No flota: tapa lo de atras con telon (nivel 5).
  const [detalle, setDetalle] = useState<(typeof estado.socio.cuenta)[number] | null>(null)
  const hoja = useHoja<HTMLElement>(!!detalle, () => setDetalle(null))

  const caja = useRef<HTMLDivElement>(null)
  const yPrev = useRef(0)
  const [monto, setMonto] = useState(100000)
  const crudo = useMotionValue((100000 - MIN) / (MAX - MIN))
  const nivel = useSpring(crudo, RESORTE.liquido)
  const menisco = useMotionValue(0)

  // El monto vive en una ref mientras se arrastra y solo sube a estado de React
  // al soltar. Antes cada escalón de C$20 repintaba la pantalla entera: hasta
  // 140 renders por gesto, arrastrando la lista de movimientos con ellos.
  const montoVivo = useRef(monto)
  const [arrastrando, setArrastrando] = useState(false)

  useMotionValueEvent(nivel, 'change', (v) => {
    const bruto = MIN + v * (MAX - MIN)
    const marca = TRAMOS.find((x) => Math.abs(x.monto - bruto) < IMAN)
    const val = marca ? marca.monto : Math.round(bruto / 2000) * 2000
    if (val === montoVivo.current) return
    montoVivo.current = val
    if (marca) acusarRecibo(12)
    // Mientras el dedo está abajo, la cifra la escribe el DOM directamente.
    if (arrastrando) {
      const cifra = document.getElementById('jarra-cifra')
      if (cifra) cifra.textContent = cordobas(val)
    } else {
      setMonto(val)
    }
  })

  // El menisco solo se mueve cuando la jarra está a la vista y el socio no pidió
  // movimiento reducido. Un bucle a 60 fps para dos píxeles, corriendo tres
  // pantallazos más abajo, es batería regalada.
  const [aLaVista, setALaVista] = useState(true)
  useEffect(() => {
    const el = caja.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const ojo = new IntersectionObserver(([e]) => setALaVista(e.isIntersecting), { threshold: 0.05 })
    ojo.observe(el)
    // Sin la forma funcional, este cierre leía un `aLaVista` congelado del
    // primer render y reanimaba la jarra estando fuera de vista.
    const alOcultar = () => setALaVista((antes) => (document.hidden ? false : antes))
    document.addEventListener('visibilitychange', alOcultar)
    return () => {
      ojo.disconnect()
      document.removeEventListener('visibilitychange', alOcultar)
    }
  }, [])

  useAnimationFrame((tiempo) => {
    if (!reduce && aLaVista) menisco.set(Math.sin(tiempo / 414) * 2)
  })

  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (!el.hasPointerCapture(e.pointerId) || !caja.current) return
    crudo.set(cortar(crudo.get() + (yPrev.current - e.clientY) / caja.current.clientHeight))
    yPrev.current = e.clientY
  }

  const fijar = (centavos: number) => {
    montoVivo.current = centavos
    setMonto(centavos)
    crudo.set(cortar((centavos - MIN) / (MAX - MIN)))
  }

  const { bono, siguiente } = bonoDe(monto)
  const faltan = siguiente ? siguiente.monto - monto : 0

  const [recargando, setRecargando] = useState(false)

  const recargar = async () => {
    if (recargando) return
    setRecargando(true)
    try {
      // El bono lo decide el servidor, nunca el cliente: aquí solo se pide el monto.
      const r = await comprar(() => api.recargar(monto, `recarga:${Date.now()}`), {
        tipo: 'recargar',
        monto,
        bono,
      })
      if (!r.ok) {
        setAviso(r.error)
        return
      }
      acusarRecibo(18)
      setAviso(
        t(copy.recarga.ok.body, {
          monto: cordobas(monto).replace('C$ ', ''),
          bono: cordobas(bono).replace('C$ ', ''),
          saldo: cordobas(saldo + monto + bono).replace('C$ ', ''),
        }),
      )
    } finally {
      setRecargando(false)
    }
  }

  return (
    <>
      <header className="marco encabezado">
        <button className="volver" onClick={() => navigate('/')}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver a la casa
        </button>
        <p className="etiqueta encabezado__eyebrow">{copy.subtitle}</p>
        <h1 className="display-md">{copy.nombre}</h1>
        <p className="cuerpo encabezado__bajada">{copy.explica}</p>
      </header>

      <section className="marco" aria-label="Tu saldo">
        <div className="brasa saldo">
          <p className="etiqueta">{copy.saldoLabel}</p>
          <p className="lab-xl saldo__cifra">{cordobas(saldo)}</p>
          <p className="caption saldo__desglose">
            <span className="lab">{cordobas(saldoPagado)}</span> tuyos ·{' '}
            <span className="lab">{cordobas(saldoBono)}</span> que puso la casa
          </p>
        </div>
      </section>

      {/* La jarra. */}
      <section className="marco seccion" aria-label="Dejar saldo">
        <div className="seccion__titulo">
          <h2 className="titulo-md">{copy.recarga.title}</h2>
        </div>
        <p className="cuerpo-sm jarra__intro">{copy.recarga.body}</p>

        <div className="jarra-fila">
          <div className="jarra" ref={caja}>
            <m.div className="jarra__liquido" style={{ scaleY: nivel, transformOrigin: 'bottom' }} aria-hidden />
            <m.div className="jarra__menisco" style={{ y: menisco }} aria-hidden />

            {TRAMOS.map((tramo) => (
              <div
                key={tramo.monto}
                className={monto >= tramo.monto ? 'jarra__marca es-alcanzada' : 'jarra__marca'}
                style={{ bottom: `${((tramo.monto - MIN) / (MAX - MIN)) * 100}%` }}
                aria-hidden
              >
                <span className="jarra__marca-linea" />
                <span className="lab-sm jarra__marca-texto">
                  {cordobas(tramo.monto)} <span className="jarra__bono">+{cordobas(tramo.bono)}</span>
                </span>
              </div>
            ))}

            <div
              className="jarra__mano"
              role="slider"
              tabIndex={0}
              aria-label="Monto a dejar en la Cuenta de Casa"
              aria-valuemin={MIN / 100}
              aria-valuemax={MAX / 100}
              aria-valuenow={monto / 100}
              aria-valuetext={`${monto / 100} córdobas${bono > 0 ? `, la casa pone ${bono / 100}` : ''}`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                yPrev.current = e.clientY
                setArrastrando(true)
              }}
              onPointerUp={() => {
                setArrastrando(false)
                setMonto(montoVivo.current)
              }}
              onPointerCancel={() => {
                setArrastrando(false)
                setMonto(montoVivo.current)
              }}
              onPointerMove={mover}
              onKeyDown={(e) => {
                const paso = e.shiftKey ? 50000 : 10000
                if (e.key === 'ArrowUp') { e.preventDefault(); fijar(Math.min(MAX, monto + paso)) }
                if (e.key === 'ArrowDown') { e.preventDefault(); fijar(Math.max(MIN, monto - paso)) }
                if (e.key === 'Home') { e.preventDefault(); fijar(MIN) }
                if (e.key === 'End') { e.preventDefault(); fijar(MAX) }
              }}
            />
          </div>

          <div className="jarra__lectura">
            <p className="etiqueta">Vas a dejar</p>
            <p className="lab-xl" id="jarra-cifra">
              {cordobas(monto)}
            </p>
            {bono > 0 ? (
              <p className="cuerpo-sm jarra__gana">
                La casa pone <span className="lab jarra__gana-cifra">{cordobas(bono)}</span>
                <br />
                Quedás con <span className="lab">{cordobas(monto + bono)}</span>
              </p>
            ) : (
              <p className="cuerpo-sm">Sin tramo alcanzado todavía.</p>
            )}
            {siguiente && (
              <p className="caption jarra__fantasma">
                te faltan <span className="lab">{cordobas(faltan)}</span> para que la casa ponga{' '}
                <span className="lab">{cordobas(siguiente.bono)}</span>
              </p>
            )}
            {TRAMOS.find((x) => x.monto === monto)?.nota && (
              <p className="caption jarra__nota acento">{TRAMOS.find((x) => x.monto === monto)!.nota}</p>
            )}
          </div>
        </div>

        {/* Ruta primaria para teclado y lector de pantalla. */}
        <div className="jarra__atajos">
          {TRAMOS.map((tramo) => (
            <button
              key={tramo.monto}
              className={monto === tramo.monto ? 'boton boton-linea es-elegido' : 'boton boton-linea'}
              onClick={() => fijar(tramo.monto)}
            >
              {cordobas(tramo.monto)}
              <span className="jarra__atajo-bono lab-sm">+{cordobas(tramo.bono)}</span>
            </button>
          ))}
        </div>

        <button className="boton boton-verde boton-lleno jarra__cobrar" onClick={recargar} disabled={recargando}>
          {recargando ? 'Guardando el saldo…' : `Dejar ${cordobas(monto)}`}
          {bono > 0 && <span> · recibís {cordobas(monto + bono)}</span>}
        </button>
        <p className="caption jarra__legal">{copy.recarga.legal}</p>
      </section>

      {/* Movimientos. */}
      <section className="marco seccion" aria-label="Movimientos de la cuenta">
        <div className="seccion__titulo">
          <h2 className="titulo-md">Movimientos</h2>
        </div>
        {estado.socio.cuenta.length === 0 ? (
          <p className="vacio cuerpo-sm">{copy.vacia.body}</p>
        ) : (
          <table className="libro">
            <caption className="salto-visual">
              Cada asiento de tu cuenta, del más reciente al más viejo. Tocá uno para ver
              el detalle.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="etiqueta">
                  Concepto
                </th>
                <th scope="col" className="etiqueta libro__col-num">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody>
              {[...estado.socio.cuenta].reverse().map((mv) => (
                <tr key={mv.id} className={detalle?.id === mv.id ? 'es-activa' : undefined}>
                  <td>
                    <button
                      type="button"
                      className="libro__asiento"
                      onClick={() => setDetalle(mv)}
                      aria-expanded={detalle?.id === mv.id}
                    >
                      <span className="libro__concepto">{mv.concepto}</span>
                      <span className="caption libro__cuando">
                        {fechaSello(new Date(mv.fecha))} · {haceCuanto(new Date(mv.fecha))}
                      </span>
                    </button>
                  </td>
                  <td className="libro__col-num">
                    <span className={mv.monto >= 0 ? 'lab movimiento-entra' : 'lab'}>
                      {cordobas(mv.monto, { signo: true })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {createPortal(
        <AnimatePresence>
          {detalle && (
            <>
              <m.div
                className="telon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: MS.corta / 1000 }}
                onClick={() => setDetalle(null)}
              />
              <m.aside
                ref={hoja}
                className="hoja hoja-asiento"
                role="dialog"
                aria-modal="true"
                aria-label="Detalle del asiento"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%', transition: { duration: MS.media / 1000, ease: CURVA.caida } }}
                transition={RESORTE.despacha}
              >
                <span className="hoja__tirador" aria-hidden />
                <p className="etiqueta">Asiento {detalle.id.slice(-6).toUpperCase()}</p>
                <h2 className="titulo-lg">{detalle.concepto}</h2>
                <p
                  className={
                    detalle.monto >= 0 ? 'lab-xl movimiento-entra' : 'lab-xl'
                  }
                >
                  {cordobas(detalle.monto, { signo: true })}
                </p>
                <ul className="ficha-asiento">
                  <li className="dato">
                    <span className="etiqueta">Fecha</span>
                    <span className="lab dato__valor">{fechaSello(new Date(detalle.fecha))}</span>
                  </li>
                  <li className="dato">
                    <span className="etiqueta">Cuando</span>
                    <span className="lab dato__valor">{haceCuanto(new Date(detalle.fecha))}</span>
                  </li>
                  <li className="dato">
                    <span className="etiqueta">Direccion</span>
                    <span className="lab dato__valor">
                      {detalle.monto >= 0 ? 'Entro a la cuenta' : 'Salio de la cuenta'}
                    </span>
                  </li>
                </ul>
                <p className="cuerpo-sm">
                  Este asiento no se puede editar ni borrar: el libro de la casa solo suma
                  renglones. Si algo no cuadra, deci en la barra y lo corregimos con otro
                  asiento, a la vista.
                </p>
                <button
                  type="button"
                  className="boton boton-linea boton-lleno"
                  onClick={() => setDetalle(null)}
                >
                  Cerrar
                </button>
              </m.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  )
}
