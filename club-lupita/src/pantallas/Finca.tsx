/**
 * «La Última Bolsa» — la tienda de la finca.
 *
 * «Quedan 34 de 150» es un string. La escasez solo mueve si es verificable y
 * tocable: por eso la bolsa lleva TU número escrito antes de que la apartés, y
 * el mazo se renderiza con tres nodos aunque haya 150 bolsas.
 *
 * El número de restantes viene del estado compartido con el servidor. Si no se
 * puede confirmar, la interfaz dice «últimas bolsas» sin cifra. Jamás una cifra
 * decorativa: en Managua dos clientes comparan pantallas.
 */
import { useRef, useState } from 'react'
import { m, useMotionValue, useTransform, animate, useReducedMotion, AnimatePresence } from 'motion/react'
import { useEstado } from '../lib/estado'
import { api } from '../lib/api'
import { useRouter } from '../lib/router'
import { cordobas, numeroBolsa } from '../lib/format'
import { RESORTE, CURVA, MS, acusarRecibo } from '../lib/movimiento'
import { tienda as copy, t } from '../data/copy'
import { Aviso } from '../componentes/Aviso'
import { Foto } from '../componentes/Foto'

const RASGAR = 96
const PRECIO_RESERVA = 89000
const TOTAL_BOLSAS = 150

export function Finca() {
  const { estado, despachar, comprar, saldo } = useEstado()
  const { navigate } = useRouter()
  const reduce = useReducedMotion()
  const [aviso, setAviso] = useState<string | null>(null)
  const [mia, setMia] = useState<number | null>(null)

  const x = useMotionValue(0)
  const rot = useTransform(x, [-140, 140], [-9, 9])
  const sello = useTransform(x, [40, 110], [0, 1])
  const sombra = useTransform(x, [0, 140], [0.25, 0.6])

  const restantes = estado.cupos.bolsasReserva
  const serie = TOTAL_BOLSAS - restantes + 1
  const agotado = restantes <= 0

  // Guarda SÍNCRONA, fijada antes del primer `await`. Con la guarda basada en
  // estado, el botón seguía vivo durante los 240 ms de la animación y un doble
  // clic cobraba dos veces y se llevaba dos bolsas.
  const enCurso = useRef(false)

  const decidir = async (offsetX: number, vx = 0) => {
    if (agotado || mia !== null || enCurso.current) return
    if (offsetX < RASGAR && vx < 700) {
      animate(x, 0, RESORTE.vuelve)
      return
    }
    enCurso.current = true
    try {
      if (saldo < PRECIO_RESERVA) {
        animate(x, 0, RESORTE.vuelve)
        setAviso(`Te faltan ${cordobas(PRECIO_RESERVA - saldo)} en la Cuenta de Casa.`)
        return
      }
      // La bolsa sale volando y la petición viaja a la vez. Antes se esperaba a
      // que la animación terminara: si el navegador deja de emitir cuadros, esa
      // promesa no resuelve nunca y la compra se queda colgada.
      animate(x, 320, { duration: 0.24, ease: CURVA.caida })
      const r = await comprar(() => api.apartarBolsa(), { tipo: 'apartarBolsaReserva' })
      if (!r.ok) {
        animate(x, 0, RESORTE.vuelve)
        setAviso(r.error)
        return
      }
      acusarRecibo(14)
      // El número lo dice el servidor. Calcularlo aquí hacía que dos
      // compradores simultáneos leyeran los dos «te tocó la 117», en el
      // producto cuya tesis es que cada bolsa lleva su número.
      const asignada = (r.datos as { numero?: number } | undefined)?.numero ?? serie
      setMia(asignada)
      setAviso(t(copy.reserva.numero, { n: numeroBolsa(asignada) }))
    } finally {
      enCurso.current = false
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
        <p className="etiqueta encabezado__eyebrow">Desde 1971 · Matagalpa y Jinotega</p>
        <h1 className="display-md">{copy.title}</h1>
        <p className="cuerpo encabezado__bajada">{copy.subtitle}</p>
      </header>

      {/* Reserva de Cosecha: el mazo numerado. */}
      <section className="marco seccion" aria-label="Reserva de Cosecha">
        <div className="seccion__titulo">
          <h2 className="titulo-md">{copy.reserva.title}</h2>
          <span className="chip">
            {agotado ? 'apartadas' : `quedan ${restantes} de ${TOTAL_BOLSAS}`}
          </span>
        </div>
        <p className="cuerpo-sm reserva__intro">{copy.reserva.body}</p>

        {agotado ? (
          <div className="vacio cuerpo-sm">{copy.reserva.agotada}</div>
        ) : (
          <div className="mazo">
            <span className="mazo__sombra mazo__sombra-2" aria-hidden />
            <span className="mazo__sombra mazo__sombra-1" aria-hidden />
            <m.div
              className={mia !== null ? 'bolsa es-mia' : 'bolsa'}
              style={{ x, rotate: reduce ? 0 : rot }}
              drag={reduce || mia !== null ? false : 'x'}
              dragConstraints={{ left: -140, right: 140 }}
              dragElastic={0.35}
              dragMomentum={false}
              dragDirectionLock
              onDragEnd={(_, info) => decidir(info.offset.x, info.velocity.x)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  decidir(200)
                }
              }}
              aria-label={
                mia !== null
                  ? `Bolsa número ${numeroBolsa(mia)} apartada a tu nombre.`
                  : `Bolsa número ${numeroBolsa(serie)} de ${TOTAL_BOLSAS}. Quedan ${restantes}. Deslizá a la derecha o presioná Enter para apartarla.`
              }
            >
              <p className="etiqueta bolsa__casa">La Bella Lupita · Cosecha 2026</p>
              <p className="lab-xl bolsa__serie">N.º {numeroBolsa(mia ?? serie)}</p>
              <p className="caption bolsa__resto">
                {mia !== null ? 'a tu nombre' : `quedan ${restantes} de ${TOTAL_BOLSAS}`}
              </p>
              <p className="lab bolsa__precio">{cordobas(PRECIO_RESERVA)} · 340 g</p>
              <m.span className="bolsa__sello etiqueta" style={{ opacity: mia !== null ? 1 : sello }} aria-hidden>
                Apartada
              </m.span>
              <m.span className="bolsa__oclusion" style={{ opacity: sombra }} aria-hidden />
            </m.div>
          </div>
        )}

        {!agotado && mia === null && (
          <button className="boton boton-linea boton-lleno mazo__salida" onClick={() => decidir(200)}>
            {copy.reserva.cta}
          </button>
        )}
        <p className="caption mazo__entrega">{copy.reserva.entrega}</p>
      </section>

      {/* Transparencia: el lote que se está tostando. */}
      <section className="marco seccion" aria-label="El lote del mes">
        <button className="tarjeta-lg lote-tarjeta" onClick={() => navigate('/finca/lote')}>
          <div className="foto foto-finca lote-tarjeta__foto">
            <Foto src="/images/terraza-atardecer-960.webp" alt="" sizes="(min-width: 560px) 34rem, 100vw" width={640} height={427} />
          </div>
          <span className="etiqueta">Lote 04 · El Aguacatal</span>
          <span className="titulo-lg">
            <span className="lab">86.5</span> puntos, a <span className="lab">1,340</span> metros.
          </span>
          <span className="cuerpo-sm">
            Publicamos el puntaje, la altura, la fecha del tueste y lo que se le paga al corte.
          </span>
          <span className="chip chip-neutro">Subir a la ficha completa</span>
        </button>
      </section>

      {/* Suscripción y Espresso Portable. */}
      <section className="marco seccion" aria-label="Suscripción y producto">
        <article className="tarjeta finca__bloque">
          <h2 className="titulo-md">{copy.susc.title}</h2>
          <p className="cuerpo-sm">{copy.susc.body}</p>
          <div className="finca__planes">
            <button className="boton boton-linea">
              250 g <span className="lab">{cordobas(39000)}</span> al mes
            </button>
            <button className="boton boton-linea">
              500 g <span className="lab">{cordobas(69000)}</span> al mes
            </button>
          </div>
          <p className="caption">{copy.susc.molienda}</p>
          <p className="caption">{copy.susc.entrega}</p>
          <p className="caption acento">{copy.susc.nota}</p>
        </article>

        <article className="tarjeta finca__bloque">
          <div className="foto finca__foto">
            <Foto
              src="/images/espresso-portable-product-clean-960.webp"
              alt="Espresso Portable de La Bella Lupita"
              sizes="(min-width: 560px) 34rem, 100vw"
              width={640}
              height={800}
            />
          </div>
          <h2 className="titulo-md">{copy.portable.title}</h2>
          <p className="etiqueta">{copy.portable.tagline}</p>
          <p className="cuerpo-sm">{copy.portable.body}</p>
          <p className="cuerpo-sm acento">{copy.portable.usos}</p>
          <div className="finca__planes">
            <button className="boton boton-linea">
              1 unidad <span className="lab">{cordobas(9500)}</span>
            </button>
            <button className="boton boton-verde">
              6 unidades <span className="lab">{cordobas(50000)}</span>
            </button>
          </div>
          <p className="caption">{copy.portable.dato}</p>
        </article>
      </section>

      <AnimatePresence>
        {mia !== null && (
          <m.div
            className="marco"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MS.media / 1000, ease: CURVA.extraccion }}
          >
            <p className="cuerpo-sm finca__confirmada">
              Bolsa <span className="lab">{numeroBolsa(mia)}</span> apartada. Se tuesta el 15 de enero y se retira
              desde el 20, con tu nombre escrito en la etiqueta.
            </p>
          </m.div>
        )}
      </AnimatePresence>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  )
}
