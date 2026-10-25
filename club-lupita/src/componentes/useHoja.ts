import { useEffect, useRef } from 'react'

/**
 * Hoja inferior accesible.
 *
 * Sin esto, las tres hojas de la app (pedido, experiencia, reserva) se abrían
 * con `role="dialog"` y nada más: el foco se quedaba detrás del telón, Escape
 * no cerraba, y para llegar al botón de pagar había que tabular por toda la
 * carta que la hoja estaba tapando.
 *
 * Devuelve la ref que se pone en el contenedor de la hoja.
 */
export function useHoja<T extends HTMLElement>(abierta: boolean, cerrar: () => void) {
  const ref = useRef<T>(null)
  const alCerrar = useRef(cerrar)
  alCerrar.current = cerrar

  useEffect(() => {
    if (!abierta) return

    const previo = document.activeElement as HTMLElement | null
    // El título es el primer destino: quien entra oye de qué trata la hoja.
    const titulo = ref.current?.querySelector<HTMLElement>('h2, h3')
    titulo?.setAttribute('tabindex', '-1')
    titulo?.focus()

    const enfocables = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        alCerrar.current()
        return
      }
      if (e.key !== 'Tab') return
      const f = enfocables()
      if (!f.length) return
      const primero = f[0]
      const ultimo = f[f.length - 1]
      // El tabulador da la vuelta dentro de la hoja: no se escapa al fondo.
      // El título tiene tabindex -1 y no está en `enfocables`: sin este caso,
      // Shift+Tab desde la posición inicial se escapaba de la trampa.
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === titulo)) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      } else if (ref.current && !ref.current.contains(document.activeElement)) {
        e.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', alTeclear)

    // La hoja se monta en un portal colgado de <body>, así que ocultar
    // `#contenido` la deja fuera. Antes vivía DENTRO de él y se ocultaba a sí
    // misma: el lector de pantalla veía un documento vacío.
    const raiz = document.getElementById('contenido')
    const barra = document.querySelector('.barra')
    raiz?.setAttribute('aria-hidden', 'true')
    barra?.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', alTeclear)
      raiz?.removeAttribute('aria-hidden')
      barra?.removeAttribute('aria-hidden')
      document.body.style.overflow = ''
      titulo?.removeAttribute('tabindex')
      // Al cerrar, el foco vuelve al botón que abrió la hoja.
      previo?.focus?.()
    }
  }, [abierta])

  return ref
}
