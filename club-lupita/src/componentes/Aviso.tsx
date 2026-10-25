import { useEffect, useRef } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { RESORTE, CURVA, MS } from '../lib/movimiento'

/** Aviso de la casa. Se retira solo; nunca tapa la barra inferior. */
export function Aviso({
  mensaje,
  onCerrar,
  duracion = 4200,
}: {
  mensaje: string | null
  onCerrar: () => void
  duracion?: number
}) {
  // `onCerrar` suele llegar como funcion nueva en cada render. Si entra en las
  // dependencias, el efecto se reconstruye y el temporizador vuelve a cero: en
  // la pantalla de la Cuenta, donde el jarro re-renderiza a 60 fps, el aviso no
  // se cerraba nunca.
  const cerrar = useRef(onCerrar)
  cerrar.current = onCerrar

  useEffect(() => {
    if (!mensaje) return
    const id = window.setTimeout(() => cerrar.current(), duracion)
    return () => window.clearTimeout(id)
  }, [mensaje, duracion])

  return (
    <AnimatePresence>
      {mensaje && (
        <m.output
          className="aviso"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8, transition: { duration: MS.corta / 1000, ease: CURVA.caida } }}
          transition={RESORTE.entra}
        >
          <span className="aviso__marca" aria-hidden />
          <span>{mensaje}</span>
          <button className="boton-tenue aviso__cerrar" onClick={onCerrar} aria-label="Cerrar el aviso">
            Listo
          </button>
        </m.output>
      )}
    </AnimatePresence>
  )
}
