import { m } from 'motion/react'
import { useRouter } from '../lib/router'
import { useEstado } from '../lib/estado'
import { RESORTE } from '../lib/movimiento'

/**
 * Barra inferior. Iconografía propia: nada de librería, nada de emoji.
 * Trazo 1.25, caja 20, esquinas redondeadas — la línea fina de la marca.
 */

const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** El portal de la casa: el arco del sitio hecho icono. */
const IconoCasa = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
    <path {...trazo} d="M4 17V9a6 6 0 0 1 12 0v8" />
    <path {...trazo} d="M2.5 17h15" />
    <path {...trazo} d="M8.5 17v-4.2a1.5 1.5 0 0 1 3 0V17" />
  </svg>
)

/** La carta: un plato visto de canto con su cubierto. */
const IconoCarta = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
    <path {...trazo} d="M3 12.5h14" />
    <path {...trazo} d="M4.5 12.5a5.5 5.5 0 0 1 11 0" />
    <path {...trazo} d="M10 7V4.2" />
    <path {...trazo} d="M6.4 15.4h7.2" />
  </svg>
)

/** La tanda: el grano dentro de su casilla. */
const IconoTanda = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
    <circle {...trazo} cx="10" cy="10" r="7" />
    <path {...trazo} d="M10 3.6c-1.9 2.1-1.9 10.7 0 12.8" />
  </svg>
)

/** La finca: la ladera de Matagalpa. */
const IconoFinca = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
    <path {...trazo} d="M2 15.5l4.6-7 3.1 4.4 2.4-3.4 5.9 6z" />
    <path {...trazo} d="M6.6 8.5L8 6.2" />
  </svg>
)

/** La cuenta: la taza con su asa. */
const IconoCuenta = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden>
    <path {...trazo} d="M4 6.5h9.5v5a4 4 0 0 1-4 4h-1.5a4 4 0 0 1-4-4z" />
    <path {...trazo} d="M13.5 8h1.6a2 2 0 0 1 0 4h-1.6" />
    <path {...trazo} d="M3 17.5h12" />
  </svg>
)

const PUESTOS = [
  { ruta: '/', nombre: 'Casa', Icono: IconoCasa },
  { ruta: '/carta', nombre: 'Carta', Icono: IconoCarta },
  { ruta: '/tanda', nombre: 'Tanda', Icono: IconoTanda },
  { ruta: '/finca', nombre: 'Finca', Icono: IconoFinca },
  { ruta: '/cuenta', nombre: 'Cuenta', Icono: IconoCuenta },
]

export function BarraDeLaCasa() {
  const { path, navigate } = useRouter()
  const { estado } = useEstado()
  const enCarrito = estado.carrito.reduce((s, l) => s + l.cantidad, 0)
  const sellos = estado.socio.sellos.length

  return (
    <nav className="barra" aria-label="Secciones de Club Lupita">
      <ul className="barra__lista">
        {PUESTOS.map(({ ruta, nombre, Icono }) => {
          const activo = path === ruta || (ruta !== '/' && path.startsWith(ruta))
          const aviso =
            ruta === '/carta' && enCarrito > 0
              ? enCarrito
              : ruta === '/tanda' && sellos >= 8
                ? sellos === 9
                  ? '·'
                  : 1
                : null
          return (
            <li key={ruta}>
              <button
                className={activo ? 'barra__puesto es-activo' : 'barra__puesto'}
                onClick={() => navigate(ruta)}
                aria-current={activo ? 'page' : undefined}
                aria-label={
                  aviso !== null
                    ? `${nombre}. ${ruta === '/carta' ? `${enCarrito} en el pedido` : sellos === 9 ? 'tanda cerrada' : 'te falta un sello'}`
                    : nombre
                }
              >
                <span className="barra__icono">
                  <Icono />
                  {aviso !== null && (
                    <m.span
                      className="barra__aviso lab-sm"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={RESORTE.acusa}
                      aria-hidden
                    >
                      {aviso}
                    </m.span>
                  )}
                </span>
                <span className="barra__nombre">{nombre}</span>
                {activo && (
                  <m.span className="barra__filo" layoutId="filo-barra" transition={RESORTE.entra} aria-hidden />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
