/** Bienvenida pública y registro personal de Club Lupita. */
import { useState } from 'react'
import { Boton } from '../componentes/Base'
import { ErrorDeCampo } from '../componentes/Estados'
import { entrarComoDemo } from '../datos'
import { AccesoPersonal } from '../componentes/AccesoPersonal'

export function Umbral({ alEntrar, volver }: { alEntrar: () => void; volver?: { texto: string; accion: () => void } }) {
  const [error, setError] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const mostrarMuestra = new URLSearchParams(window.location.search).has('demo')
  const verLaMuestra = async () => {
    setOcupado(true)
    setError(null)
    try {
      const r = await entrarComoDemo()
      if (!r.ok) { setError(r.error); return }
      alEntrar()
    } catch {
      setError('No pudimos abrir la demostración. Revisá tu conexión y volvé a intentar.')
    } finally {
      setOcupado(false)
    }
  }
  return (
    <main id="contenido" tabIndex={-1} className="casa-entrada">
      <header className="entrada-marca">
        <img src="/brand/v3/logo-320.webp" alt="La Bella Lupita Bistró-Café" width={760} height={360} />
        <div><span>Club Lupita</span><p>La casa digital de La Bella Lupita</p></div>
      </header>
      <figure className="entrada-foto">
        <img src="/images/latte-logo-mesa-960.webp"
          srcSet="/images/latte-logo-mesa-480.webp 480w, /images/latte-logo-mesa-960.webp 960w"
          sizes="(max-width: 899px) 100vw, 50vw"
          alt="Una taza de café de La Bella Lupita entre las manos."
          width={960} height={960} fetchPriority="high" />
        <figcaption>El gusto de volver</figcaption>
      </figure>
      <section className="entrada-contenido" aria-labelledby="entrada-titulo">
        <div className="entrada-interior">
          <p className="entrada-origen">Desde 1971 · Matagalpa y Jinotega</p>
          <h1 id="entrada-titulo">Tu lugar en la casa</h1>
          <p className="entrada-descripcion">Tus sellos, tu cuenta y algo rico para tu próxima visita.</p>
          <div className="entrada-acceso">
            {volver && <div className="mb-4"><Boton tono="tenue" onClick={volver.accion}>{volver.texto}</Boton><p className="entrada-registro-ayuda">Después de ingresar, podrás continuar donde estabas.</p></div>}
            <AccesoPersonal alEntrar={alEntrar} />
            {mostrarMuestra && <div className="entrada-muestra">
            <p className="entrada-demo">Versión de demostración</p>
            <Boton ancho cargando={ocupado} aria-describedby="entrada-aviso" onClick={() => void verLaMuestra()}>
              {ocupado ? 'Abriendo la demostración…' : 'Explorar la demostración'}
            </Boton>
            <p id="entrada-aviso" className="entrada-aviso">Usarás una cuenta compartida. Tus acciones pueden cambiar sus datos.</p>
            {error && <ErrorDeCampo id="muestra-error">{error}</ErrorDeCampo>}
            </div>}
          </div>
          <nav className="entrada-explorar" aria-label="Explorar sin iniciar sesión">
            <a href="/pedir">Ver la carta</a>
            <a href="/reservar">Reservar una mesa</a>
            <a href="/conoce-tu-club">Beneficios y condiciones del club</a>
          </nav>
        </div>
      </section>
    </main>
  )
}
