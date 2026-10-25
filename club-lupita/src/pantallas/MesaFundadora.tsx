/**
 * «El Carnet que Pesa» — la membresía.
 *
 * Un socio paga C$950 al mes por algo que, en la app, es un div con bordes
 * redondeados. Si la membresía no se siente como un objeto, la renovación se
 * cancela al segundo mes. El carnet responde a la inclinación del teléfono, y
 * su patrón de grano se genera del número de socio: dos socios no tienen el
 * mismo carnet. Eso es lo que hace que la captura circule por WhatsApp.
 *
 * El permiso del sensor se pide desde un toque del usuario, nunca al cargar.
 */
import { useEffect, useRef, useState } from 'react'
import { m, useMotionValue, useSpring, useTransform, animate, useReducedMotion } from 'motion/react'
import { bebidaDisponible, bolsaDisponible, useEstado } from '../lib/estado'
import { api } from '../lib/api'
import { useRouter } from '../lib/router'
import { cordobas, fechaCorta, numeroSocio } from '../lib/format'
import { RESORTE, acusarRecibo, equipoModesto } from '../lib/movimiento'
import { membresia as copy, t } from '../data/copy'
import { Aviso } from '../componentes/Aviso'

const tope = (v: number, l: number) => Math.max(-l, Math.min(l, v))

/** Patrón determinista a partir del número de socio: se calcula una vez. */
function granoDeSocio(n: number): string {
  const puntos: string[] = []
  let semilla = n * 9301 + 49297
  const azar = () => {
    semilla = (semilla * 9301 + 49297) % 233280
    return semilla / 233280
  }
  for (let i = 0; i < 34; i++) {
    const cx = (azar() * 100).toFixed(1)
    const cy = (azar() * 100).toFixed(1)
    const r = (0.5 + azar() * 1.7).toFixed(2)
    puntos.push(`<circle cx="${cx}" cy="${cy}" r="${r}"/>`)
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="%23C9A456" opacity="0.5">${puntos.join('')}</g></svg>`
  return `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23')}")`
}

export function MesaFundadora() {
  const { estado, despachar, comprar, saldo } = useEstado()
  const { navigate } = useRouter()
  const reduce = useReducedMotion()
  const [aviso, setAviso] = useState<string | null>(null)
  const [volteado, setVolteado] = useState(false)

  const tiltX = useSpring(0, RESORTE.pesa)
  const tiltY = useSpring(0, RESORTE.pesa)
  const giro = useMotionValue(0)
  const rotY = useTransform([tiltY, giro], ([a, b]: number[]) => a + b)
  const brilloX = useTransform(tiltY, [-14, 14], ['-55%', '55%'])
  const brilloOp = useTransform(tiltY, [-14, 0, 14], [0.42, 0.1, 0.42])
  const cuadro = useRef(0)

  const socio = estado.socio
  const esMiembro = socio.esMiembro
  const quedan = estado.cupos.sociosFundadores
  const lleno = quedan <= 0
  const grano = granoDeSocio(socio.numeroSocio ?? 37)
  const modesto = equipoModesto()

  useEffect(() => {
    if (reduce || modesto || typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return
    const alInclinar = (e: DeviceOrientationEvent) => {
      if (++cuadro.current % 2) return // 60 Hz → 30 Hz
      tiltX.set(tope(-(e.beta ?? 0) * 0.35, 12))
      tiltY.set(tope((e.gamma ?? 0) * 0.45, 14))
    }
    window.addEventListener('deviceorientation', alInclinar, { passive: true })
    const alOcultar = () => {
      if (document.hidden) {
        tiltX.set(0)
        tiltY.set(0)
      }
    }
    document.addEventListener('visibilitychange', alOcultar)
    return () => {
      window.removeEventListener('deviceorientation', alInclinar)
      document.removeEventListener('visibilitychange', alOcultar)
    }
  }, [reduce, modesto, tiltX, tiltY])

  const voltear = async () => {
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof D?.requestPermission === 'function') {
      try {
        await D.requestPermission()
      } catch {
        /* sin permiso: el carnet queda con su deriva lenta */
      }
    }
    const v = !volteado
    setVolteado(v)
    animate(giro, v ? 180 : 0, { type: 'spring', stiffness: 200, damping: 24, mass: 1 })
  }

  const codigo = `LUP-${numeroSocio(socio.numeroSocio ?? 0).replace('#', '')}-${socio.telefono.replace(/\D/g, '').slice(-4)}`

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
      </header>

      {esMiembro ? (
        <section className="marco" aria-label="Tu carnet">
          <div className="carnet-escena">
            <m.button
              className="carnet"
              onClick={voltear}
              aria-pressed={volteado}
              style={{ rotateX: tiltX, rotateY: rotY, transformStyle: 'preserve-3d' }}
              aria-label={
                `Carnet de ${socio.nombre}, socia fundadora ${socio.numeroSocio} de 100. ` +
                (volteado ? 'Mostrando tu código de pago.' : 'Tocá para mostrar tu código de pago.')
              }
            >
              <div className="carnet__cara" style={{ backgroundImage: grano }}>
                <m.span className="carnet__lamina" style={{ x: brilloX, opacity: brilloOp }} aria-hidden />
                <p className="etiqueta carnet__casa">La Bella Lupita · Mesa Fundadora</p>
                <p className="display-lg carnet__nombre voz-editorial">{socio.nombre}</p>
                <div className="carnet__pie">
                  <span className="lab-lg carnet__num">
                    {numeroSocio(socio.numeroSocio ?? 0)}
                    <span className="carnet__de"> / 100</span>
                  </span>
                  <span className="lab-sm">
                    hasta {socio.membresiaHasta ? fechaCorta(new Date(socio.membresiaHasta)) : '—'}
                  </span>
                </div>
              </div>
              <div className="carnet__dorso">
                <p className="etiqueta">Tu código en la barra</p>
                <p className="lab-xl carnet__codigo">{codigo}</p>
                <p className="caption">Dictalo o mostralo. Sirve para pagar y para tu bebida del día.</p>
              </div>
            </m.button>
          </div>
          <p className="caption carnet__pista">
            {volteado ? 'Tocá otra vez para volver a la cara.' : 'Tocá para que el oro atrape la luz y salga tu código.'}
          </p>

          <div className="seccion">
            <h2 className="titulo-md">Este mes te toca</h2>
            <ul className="beneficios">
              <li className="dato">
                <span>Tu bolsa de 250 g del lote</span>
                <span className={bolsaDisponible(socio) ? 'chip' : 'chip chip-neutro'}>
                  {bolsaDisponible(socio) ? 'lista' : 'retirada este mes'}
                </span>
              </li>
              <li className="dato">
                <span>Tu bebida de hoy</span>
                <span className={bebidaDisponible(socio) ? 'chip chip-servido' : 'chip chip-neutro'}>
                  {bebidaDisponible(socio) ? 'sin usar' : 'usada hoy'}
                </span>
              </li>
              <li className="dato">
                <span>Repostería</span>
                <span className="dato__valor lab">−15%</span>
              </li>
              <li className="dato">
                <span>Salón VIP</span>
                <span className="dato__valor caption">tu solicitud se ve primero</span>
              </li>
            </ul>
            {bebidaDisponible(socio) && (
              <button
                className="boton boton-linea boton-lleno"
                onClick={async () => {
                  const r = await comprar(() => api.usarBeneficio('bebida_dia'), { tipo: 'usarBebidaDelDia' })
                  setAviso(r.ok ? 'Bebida del día marcada. Pedila en la barra sin pagar.' : r.error)
                }}
              >
                Usar la bebida de hoy
              </button>
            )}
          </div>

          <div className="seccion">
            <h2 className="titulo-md">{copy.renov.title}</h2>
            <p className="cuerpo-sm">{copy.renov.body}</p>
            <ul className="lista-puntos">
              {copy.renov.puntos.map((p) => (
                <li key={p} className="cuerpo-sm">
                  {p}
                </li>
              ))}
            </ul>
            <details className="cancelar">
              <summary className="boton-tenue">{copy.cancel.title}</summary>
              <p className="cuerpo-sm">{copy.cancel.body}</p>
              <p className="caption">
                {t(copy.cancel.detalle, {
                  fecha: socio.membresiaHasta ? fechaCorta(new Date(socio.membresiaHasta)) : '—',
                })}
              </p>
              <button
                className="boton boton-linea"
                onClick={async () => {
                  const r = await comprar(() => api.cancelarMembresia(), { tipo: 'cancelarMembresia' })
                  setAviso(
                    r.ok
                      ? `Listo: no se vuelve a cobrar. Seguís siendo socio hasta el ${
                          socio.membresiaHasta ? fechaCorta(new Date(socio.membresiaHasta)) : 'fin del período'
                        }, con todo incluido.`
                      : r.error,
                  )
                }}
              >
                {copy.cancel.cta}
              </button>
            </details>
          </div>
        </section>
      ) : (
        <section className="marco" aria-label="Hacerte socio">
          <div className="tarjeta-lg oferta">
            <p className="cuerpo-lg oferta__pitch">{copy.pitch}</p>
            <p className="lab-xl oferta__precio">{cordobas(copy.precio)}</p>
            <p className="caption">{copy.precioNota}</p>
          </div>

          <div className="seccion">
            <h2 className="titulo-md">{copy.cupo.title}</h2>
            <p className="cuerpo-sm">{t(copy.cupo.body, { n: quedan })}</p>
            <div className="cupo">
              <span className="lab-xl">{lleno ? '100' : 100 - quedan}</span>
              <span className="etiqueta">de 100 tomados</span>
              <div className="cupo__barra" aria-hidden>
                <span style={{ width: `${((100 - quedan) / 100) * 100}%` }} />
              </div>
            </div>
            <p className="caption acento">{copy.cupo.honesto}</p>
          </div>

          <div className="seccion">
            <h2 className="titulo-md">Lo que incluye</h2>
            <ul className="beneficios">
              {copy.beneficios.map((b) => (
                <li key={b.title} className="beneficio">
                  <h3 className="titulo-sm">{b.title}</h3>
                  <p className="cuerpo-sm">{b.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="seccion">
            <p className="cuerpo-sm">{copy.renov.body}</p>
            <button
              className="boton boton-oro boton-lleno"
              disabled={lleno || saldo < copy.precio}
              onClick={async () => {
                const r = await comprar(() => api.apartarSocio(), { tipo: 'hacerseMiembro' })
                if (!r.ok) {
                  setAviso(r.error)
                  return
                }
                acusarRecibo(18)
                setAviso(
                  t(copy.cupo.contador, { n: quedan - 1 }) + ' — tu primera bolsa se aparta el primero del mes.',
                )
              }}
            >
              {lleno ? copy.cupo.espera : copy.renov.cta}
            </button>
            {!lleno && saldo < copy.precio && (
              <p className="caption">
                Te faltan {cordobas(copy.precio - saldo)} en la Cuenta de Casa.{' '}
                <button className="enlace-fino" onClick={() => navigate('/cuenta')}>
                  Dejar saldo
                </button>
              </p>
            )}
          </div>
        </section>
      )}

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  )
}
