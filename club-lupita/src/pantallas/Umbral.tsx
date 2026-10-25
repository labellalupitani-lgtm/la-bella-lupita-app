/**
 * El umbral — entrar a la casa.
 *
 * Aquí se cierra la puerta que estaba abierta: la app entraba sola a la cuenta
 * de demostración, así que todo el que abría la URL escribía en el mismo libro
 * mayor. Dos visitantes compartían monedero, tanda y bolsas.
 *
 * Ahora se entra por el número de WhatsApp, con un código de seis dígitos que
 * solo recibe quien tiene ese teléfono. La cuenta de demostración sigue a un
 * toque de distancia, pero declarada como lo que es.
 *
 * Endowed progress: los dos sellos de regalo los pone el servidor al abrir la
 * cuenta. Suben la finalización de la tarjeta del 19% al 34%.
 */
import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { useEstado } from '../lib/estado'
import { useRouter } from '../lib/router'
import { RESORTE, CURVA, MS, acusarRecibo } from '../lib/movimiento'
import { casa, onboarding as copy, errores } from '../data/copy'

const PASOS = [copy.p1, copy.p2, copy.p3] as const
type Fase = 'historia' | 'telefono' | 'codigo' | 'nombre'

export function Umbral() {
  const { entrar, entrarComoDemo, conServidor } = useEstado()
  const { navigate } = useRouter()

  const [paso, setPaso] = useState(0)
  const [fase, setFase] = useState<Fase>('historia')
  const [telefono, setTelefono] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  // El envío por WhatsApp es integración de tercero y todavía no existe.
  // Mientras no exista, la pantalla lo dice en vez de hacer esperar.
  const [esDemo, setEsDemo] = useState(false)

  const actual = PASOS[paso]
  const soloDigitos = (s: string) => s.replace(/\D/g, '')

  const seguir = () => {
    if (paso < PASOS.length - 1) setPaso(paso + 1)
    else setFase('telefono')
  }

  const pedirCodigo = async () => {
    const limpio = soloDigitos(telefono)
    if (limpio.length !== 8) {
      setError(errores.telefonoMalo)
      return
    }
    setError(null)
    setOcupado(true)
    const { api } = await import('../lib/api')
    const r = await api.pedirCodigo(`505${limpio}`)
    setOcupado(false)
    if (!r.ok) {
      setError(r.error)
      return
    }
    // La cuenta de demostración enseña su código en pantalla; cualquier otra
    // lo recibe por WhatsApp. Se dice, no se esconde.
    setEsDemo(!!r.datos.codigoDemo)
    if (r.datos.codigoDemo) setCodigo(r.datos.codigoDemo)
    setFase('codigo')
  }

  const confirmarCodigo = () => {
    if (soloDigitos(codigo).length !== 6) {
      setError(errores.codigoMalo)
      return
    }
    setError(null)
    setFase('nombre')
  }

  const abrirCuenta = async () => {
    const limpio = nombre.trim()
    if (limpio.length < 2) {
      setError('Escribí el nombre con el que te llaman en la barra.')
      return
    }
    setOcupado(true)
    const r = await entrar(`505${soloDigitos(telefono)}`, soloDigitos(codigo), limpio)
    setOcupado(false)
    if (!r.ok) {
      setError(r.error)
      setFase('codigo')
      return
    }
    acusarRecibo(18)
    navigate('/')
  }

  const verLaDemo = async () => {
    setOcupado(true)
    const r = await entrarComoDemo()
    setOcupado(false)
    if (!r.ok) {
      setError(r.error)
      return
    }
    navigate('/')
  }

  return (
    <div className="umbral">
      <div className="umbral__foto" aria-hidden>
        <img src="/images/lbl-v2-hero-poster-mobile.webp" alt="" width={720} height={1280} fetchPriority="high" />
      </div>
      <span className="umbral__velo" aria-hidden />

      <div className="marco umbral__contenido">
        <header className="umbral__marca">
          <p className="etiqueta">{casa.nombre}</p>
          <p className="etiqueta umbral__perfil">{casa.perfil}</p>
        </header>

        <AnimatePresence mode="wait">
          {fase === 'historia' && (
            <m.section
              key={paso}
              className="umbral__paso"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: MS.corta / 1000, ease: CURVA.caida } }}
              transition={{ duration: MS.larga / 1000, ease: CURVA.extraccion }}
            >
              <p className="etiqueta">{actual.subtitle}</p>
              <h1 className="display-lg umbral__display">
                {actual.display.split('\n').map((linea, i) => (
                  <span key={i} className="umbral__linea">
                    {linea}
                  </span>
                ))}
              </h1>
              <p className="cuerpo-lg">{actual.body}</p>

              {paso === 2 && (
                <div className="umbral__regalo" aria-hidden>
                  {[0, 1].map((i) => (
                    <m.span
                      key={i}
                      className="grano es-lleno umbral__grano"
                      initial={{ scale: 1.4, y: -20, rotate: -18, opacity: 0 }}
                      animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
                      transition={{ ...RESORTE.cae, delay: 0.2 + i * 0.12 }}
                    >
                      <span className="grano__cuerpo" />
                    </m.span>
                  ))}
                  {[2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <span key={i} className="grano umbral__grano" />
                  ))}
                </div>
              )}
            </m.section>
          )}

          {fase === 'telefono' && (
            <m.section
              key="telefono"
              className="umbral__paso"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MS.media / 1000, ease: CURVA.extraccion }}
            >
              <p className="etiqueta">Tu número</p>
              <h1 className="display-md">¿A qué WhatsApp te escribimos?</h1>
              <label className="campo umbral__campo">
                <span className="solo-lectura">Número de WhatsApp, ocho dígitos</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && pedirCodigo()}
                  placeholder="8888 8888"
                  aria-invalid={!!error}
                  aria-describedby="umbral-legal"
                />
              </label>
              <p className="caption umbral__legal" id="umbral-legal">
                {copy.p3.legal}
              </p>
            </m.section>
          )}

          {fase === 'codigo' && (
            <m.section
              key="codigo"
              className="umbral__paso"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MS.media / 1000, ease: CURVA.extraccion }}
            >
              <p className="etiqueta">Verificación</p>
              <h1 className="display-md">{copy.verif.title}</h1>
              {esDemo ? (
                <p className="cuerpo">
                  Este es el número de la cuenta de muestra, así que el código te lo dejamos escrito aquí abajo. Pasá
                  y recorré la casa.
                </p>
              ) : (
                <p className="cuerpo">
                  Todavía no estamos mandando los códigos por WhatsApp: esa conexión se enciende cuando la casa abra
                  el club de verdad. Mientras tanto, entrá con la cuenta de muestra y mirá todo por dentro.
                </p>
              )}
              <label className="campo umbral__campo">
                <span className="solo-lectura">Los seis números que te llegaron</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmarCodigo()}
                  placeholder="000000"
                  aria-invalid={!!error}
                />
              </label>
              <div className="umbral__acciones">
                {esDemo && (
                  <button className="boton-tenue" onClick={pedirCodigo} disabled={ocupado}>
                    {copy.verif.resend}
                  </button>
                )}
                <button
                  className="boton-tenue"
                  onClick={() => {
                    setCodigo('')
                    setError(null)
                    setFase('telefono')
                  }}
                >
                  {copy.verif.change}
                </button>
              </div>
            </m.section>
          )}

          {fase === 'nombre' && (
            <m.section
              key="nombre"
              className="umbral__paso"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MS.media / 1000, ease: CURVA.extraccion }}
            >
              <p className="etiqueta">Casi</p>
              <h1 className="display-md">{copy.nombre.title}</h1>
              <p className="cuerpo">{copy.nombre.body}</p>
              <label className="campo umbral__campo">
                <span className="solo-lectura">Tu nombre</span>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && abrirCuenta()}
                  placeholder="María"
                  aria-invalid={!!error}
                />
              </label>
            </m.section>
          )}
        </AnimatePresence>

        {error && (
          <p className="umbral__error cuerpo-sm" role="alert">
            {error}
          </p>
        )}

        <footer className="umbral__pie">
          {fase === 'historia' && (
            <>
              <button className="boton boton-verde boton-lleno" onClick={seguir}>
                {paso === PASOS.length - 1 ? copy.p3.cta : actual.cta}
              </button>
              <div className="umbral__pasos" aria-hidden>
                {PASOS.map((_, i) => (
                  <span key={i} className={i === paso ? 'umbral__punto es-activo' : 'umbral__punto'} />
                ))}
              </div>
            </>
          )}
          {fase === 'telefono' && (
            <button className="boton boton-verde boton-lleno" onClick={pedirCodigo} disabled={ocupado}>
              {ocupado ? 'Mandando el código…' : 'Mandame el código'}
            </button>
          )}
          {fase === 'codigo' && (
            <button className="boton boton-verde boton-lleno" onClick={confirmarCodigo} disabled={ocupado}>
              Seguir
            </button>
          )}
          {fase === 'nombre' && (
            <button className="boton boton-verde boton-lleno" onClick={abrirCuenta} disabled={ocupado}>
              {ocupado ? 'Abriendo tu cuenta…' : copy.nombre.cta}
            </button>
          )}

          <p className="caption umbral__casa">{casa.direccion}</p>

          {/* La cuenta de demostración, dicha por su nombre. */}
          <button className="boton-tenue umbral__demo" onClick={verLaDemo} disabled={ocupado || !conServidor}>
            {conServidor ? 'Recorrer la casa con la cuenta de muestra' : 'Sin señal con la casa'}
          </button>
        </footer>
      </div>
    </div>
  )
}
