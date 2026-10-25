/**
 * «El Plano de la Casa» — reservas.
 *
 * Tres cosas a la vez: el depósito del Salón VIP se acepta mucho más cuando ya
 * elegiste ESE lugar; el salón deja de venderse uno a uno por WhatsApp; y el
 * selector de hora mueve gente del pico de las 12:30 al valle de las 3:00 sin
 * regalar un solo descuento.
 *
 * El plano es la vista rápida. La lista de zonas en texto, debajo, es la
 * fuente de verdad y funciona con teclado y lector de pantalla.
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { m, AnimatePresence } from 'motion/react'
import { useEstado } from '../lib/estado'
import { api } from '../lib/api'
import { useRouter } from '../lib/router'
import { cordobas, enlaceWhatsApp, fechaLarga } from '../lib/format'
import { RESORTE, CURVA, MS, acusarRecibo } from '../lib/movimiento'
import { casa, reservas as copy, t } from '../data/copy'
import { Aviso } from '../componentes/Aviso'
import { useHoja } from '../componentes/useHoja'

const HORAS = Array.from({ length: 15 }, (_, i) => 7 + i) // 7:00 a 21:00
const DEPOSITO_VIP = 50000

type Zona = {
  id: string
  nombre: string
  d: string
  deposito?: number
  nota: string
}

const ZONAS: Zona[] = [
  {
    id: 'terraza',
    nombre: 'Terraza',
    d: 'M14 18 H132 V96 H14 Z',
    nota: 'Al aire libre, entre palmeras. La mejor luz de la casa entre 4 y 6.',
  },
  {
    id: 'ventanal',
    nombre: 'Ventanal',
    d: 'M144 18 H240 V60 H144 Z',
    nota: 'Mesa junto al vidrio. Para leer, escribir o mirar la carretera sur.',
  },
  {
    id: 'barra',
    nombre: 'Barra',
    d: 'M144 72 H240 V96 H144 Z',
    nota: 'De pie o en banco alto, frente al espresso. Rotación rápida.',
  },
  {
    id: 'bistro',
    nombre: 'Bistró',
    d: 'M14 108 H180 V186 H14 Z',
    nota: 'Mesa puesta, cocina completa. Almuerzo y cena.',
  },
  {
    id: 'vip',
    nombre: 'Salón VIP',
    d: 'M192 108 H306 V186 H192 Z',
    deposito: DEPOSITO_VIP,
    nota: 'Puerta cerrada, pantalla y servicio propio. Hasta 10 personas, mínimo 2 horas.',
  },
]

export function Reservar() {
  const { estado, comprar, saldo } = useEstado()
  const { navigate } = useRouter()
  const [hora, setHora] = useState(11)
  const [zona, setZona] = useState<Zona | null>(null)
  const [personas, setPersonas] = useState(2)
  const [aviso, setAviso] = useState<string | null>(null)
  const [hecha, setHecha] = useState(false)
  const hoja = useHoja<HTMLElement>(!!zona && !hecha, () => setZona(null))

  const [apartando, setApartando] = useState(false)
  // Ocupación real por zona y hora, contada sobre las reservas del día. Los
  // arrays literales eran una ocupación inventada en una app que prohíbe las
  // cifras decorativas: si el servidor no responde, no se pinta densidad.
  //
  // Se declara ARRIBA a propósito: `ocupacionDe` la lee y `libres` la llama en
  // el mismo render. Declararla más abajo la dejaba en zona muerta temporal y
  // tumbaba la app entera al entrar a esta pantalla.
  const [ocupacionReal, setOcupacionReal] = useState<Record<string, Record<number, number>> | null>(null)

  useEffect(() => {
    let vivo = true
    const dia = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
    api.ocupacion(dia).then((r) => {
      if (vivo && r.ok) setOcupacionReal(r.datos.ocupacion)
    })
    return () => {
      vivo = false
    }
  }, [])


  const manana = new Date(Date.now() + 86_400_000)
  // `null` significa «todavía no sé», y no sé no es «vacío».
  const seSabe = ocupacionReal !== null
  const ocupacionDe = (z: Zona) => ocupacionReal?.[z.id]?.[hora] ?? 0
  const libres = ZONAS.filter((z) => ocupacionDe(z) < 0.7)
  // La sugerencia nombra la zona que de verdad está más libre a esa hora.
  const mejorHora = HORAS.find((h) => ZONAS.every((z) => (ocupacionReal?.[z.id]?.[h] ?? 0) < 0.5))
  const zonaMasLibre = mejorHora
    ? [...ZONAS].sort(
        (a, b) => (ocupacionReal?.[a.id]?.[mejorHora] ?? 0) - (ocupacionReal?.[b.id]?.[mejorHora] ?? 0),
      )[0]
    : null


  // La reserva se persiste en el servidor. Antes se cobraba el depósito y la
  // mesa no quedaba anotada en ninguna parte: un cobro sin contraprestación.
  const confirmar = async () => {
    if (!zona || apartando) return
    setApartando(true)
    try {
      if (zona.deposito && saldo < zona.deposito) {
        setAviso(`Te faltan ${cordobas(zona.deposito - saldo)} para el depósito del Salón VIP.`)
        return
      }
      const cuando = new Date(manana)
      cuando.setHours(hora, 0, 0, 0)
      const r = await comprar(() => api.reservar(zona.id, cuando.toISOString(), personas, 2), {
        tipo: 'cobrar',
        monto: zona.deposito ?? 0,
        concepto: 'Depósito del Salón VIP',
        ref: `dep:${zona.id}:${cuando.toISOString()}`,
      })
      if (!r.ok) {
        setAviso(r.error)
        return
      }
      acusarRecibo(18)
      setHecha(true)
      setAviso(
        t(copy.ok.body, {
          personas: `${personas} ${personas === 1 ? 'persona' : 'personas'}`,
          fecha: fechaLarga(manana),
          hora: `${hora}:00`,
        }),
      )
    } finally {
      setApartando(false)
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
        <p className="etiqueta encabezado__eyebrow">{copy.horario}</p>
        <h1 className="display-md">{copy.title}</h1>
        <p className="cuerpo encabezado__bajada">{copy.subtitle}</p>
      </header>

      <section className="marco" aria-label="Plano de la casa">
        <svg viewBox="0 0 320 200" className="plano" role="group" aria-label="Plano de La Bella Lupita">
          <rect x="6" y="10" width="308" height="184" rx="6" className="plano__muro" />
          {ZONAS.map((z) => {
            const o = ocupacionDe(z)
            const lleno = o >= 0.7
            const elegida = zona?.id === z.id
            return (
              <m.path
                key={z.id}
                d={z.d}
                className={`plano__zona${elegida ? ' es-elegida' : ''}${lleno ? ' es-llena' : ''}`}
                style={{ opacity: seSabe ? 0.15 + o * 0.7 : 0.15, transformOrigin: 'center', transformBox: 'fill-box' }}
                animate={{ scale: elegida ? 1.03 : 1, y: elegida ? -4 : 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.9 }}
                // El plano es la vista rápida; la lista de abajo es la interfaz.
                // Dejarlo enfocable duplicaba a diez las cinco paradas de teclado.
                aria-hidden
                tabIndex={-1}
                onClick={() => !lleno && setZona(z)}
              />
            )
          })}
          {ZONAS.map((z) => {
            const [, xs, ys] = /M(\d+) (\d+)/.exec(z.d) ?? []
            return (
              <text key={z.id} x={Number(xs) + 10} y={Number(ys) + 20} className="plano__rotulo">
                {z.nombre.toUpperCase()}
              </text>
            )
          })}
        </svg>

        <div className="plano__hora campo">
          <label className="etiqueta campo__etiqueta" htmlFor="hora-reserva">
            Hora de la reserva
          </label>
          <input
            id="hora-reserva"
            type="range"
            min={7}
            max={21}
            step={1}
            value={hora}
            onChange={(e) => setHora(Number(e.target.value))}
            aria-valuetext={`${hora}:00, ${libres.length} de ${ZONAS.length} zonas con lugar`}
          />
          <span className="lab-lg plano__salida" aria-hidden>
            {hora}:00
          </span>
        </div>

        {seSabe && libres.length <= 1 && mejorHora && (
          <m.p
            className="cuerpo-sm plano__sugerencia"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MS.corta / 1000, ease: CURVA.extraccion }}
          >
            A las <span className="lab">{hora}:00</span> queda poco lugar. A las{' '}
            <span className="lab">{mejorHora}:00</span> {zonaMasLibre?.nombre ?? 'la Terraza'} está más tranquila.
          </m.p>
        )}
      </section>

      {/* Fuente de verdad en texto: teclado, lector de pantalla y sin JS. */}
      <section className="marco seccion" aria-label="Zonas y disponibilidad">
        <div className="seccion__titulo">
          <h2 className="titulo-md">Zonas de la casa</h2>
          <span className="caption">a las {hora}:00</span>
        </div>
        <ul className="zonas">
          {ZONAS.map((z) => {
            const o = ocupacionDe(z)
            const lleno = o >= 0.7
            return (
              <li key={z.id}>
                <button
                  className={zona?.id === z.id ? 'zona es-elegida' : 'zona'}
                  disabled={lleno}
                  onClick={() => setZona(z)}
                >
                  <span className="zona__cabeza">
                    <span className="titulo-sm">{z.nombre}</span>
                    <span className={!seSabe ? 'chip chip-neutro' : lleno ? 'chip chip-aviso' : 'chip chip-servido'}>
                      {!seSabe ? 'consultando' : lleno ? 'sin lugar' : o > 0.45 ? 'poco lugar' : 'con lugar'}
                    </span>
                  </span>
                  <span className="cuerpo-sm">{z.nota}</span>
                  {z.deposito && (
                    <span className="caption zona__deposito">
                      Depósito de {cordobas(z.deposito)} — se abona íntegro a tu cuenta esa noche.
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {createPortal(
        <AnimatePresence>
          {zona && !hecha && (
            <>
              <m.div className="telon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZona(null)} />
            <m.aside
              ref={hoja}
              className="hoja"
              role="dialog"
              aria-modal="true"
              aria-label={`Reservar en ${zona.nombre}`}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%', transition: { duration: MS.media / 1000, ease: CURVA.caida } }}
              transition={RESORTE.despacha}
            >
              <span className="hoja__tirador" aria-hidden />
              <p className="etiqueta">
                {fechaLarga(manana)} · {hora}:00
              </p>
              <h2 className="titulo-lg">{zona.nombre}</h2>
              <p className="cuerpo">{zona.nota}</p>

              <label className="campo">
                <span className="etiqueta campo__etiqueta">¿Cuántos vienen?</span>
                <select value={personas} onChange={(e) => setPersonas(Number(e.target.value))}>
                  {Array.from({ length: zona.id === 'vip' ? 10 : 8 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </label>

              {zona.deposito && (
                <div className="deposito">
                  <h3 className="titulo-sm">{copy.vip.depositoTitle}</h3>
                  <p className="cuerpo-sm">{copy.vip.depositoBody}</p>
                  <p className="caption">{copy.vip.depositoNota}</p>
                  <p className="caption">
                    {saldo >= zona.deposito
                      ? `Sale de tu Cuenta de Casa. Te quedarían ${cordobas(saldo - zona.deposito)}.`
                      : `Te faltan ${cordobas(zona.deposito - saldo)} en la Cuenta de Casa.`}
                  </p>
                </div>
              )}

              <button
                className="boton boton-verde boton-lleno"
                disabled={apartando || (!!zona.deposito && saldo < zona.deposito)}
                onClick={confirmar}
              >
                {apartando ? 'Apartando…' : zona.deposito ? copy.vip.cta : 'Apartar la mesa'}
              </button>
              <button className="boton boton-tenue boton-lleno" onClick={() => setZona(null)}>
                Ver otra zona
              </button>
            </m.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {hecha && zona && (
        <section className="marco seccion" aria-label="Reserva confirmada">
          <div className="tarjeta-lg reserva-ok">
            <p className="etiqueta">{copy.ok.title}</p>
            <h2 className="titulo-lg">
              {zona.nombre}, {personas} {personas === 1 ? 'persona' : 'personas'}, {hora}:00
            </h2>
            <p className="cuerpo-sm">{copy.ok.nota}</p>
            <p className="caption">{copy.ok.espera}</p>
            <a
              className="boton boton-linea"
              href={enlaceWhatsApp(
                casa.whatsapp,
                `Hola, soy ${estado.socio.nombre}. Confirmo mi mesa en ${zona.nombre} para ${personas} el ${fechaLarga(manana)} a las ${hora}:00.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              Abrir la confirmación en WhatsApp
            </a>
          </div>
        </section>
      )}

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  )
}
