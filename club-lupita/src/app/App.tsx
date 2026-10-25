import { LazyMotion, MotionConfig, m } from 'motion/react'
import { Suspense, lazy, useEffect } from 'react'
import { RouterProvider, useRouter, matchRoute } from '../lib/router'
import { EstadoProvider, useEstado } from '../lib/estado'
import { CURVA, MS } from '../lib/movimiento'
import { BarraDeLaCasa } from './BarraDeLaCasa'
import { Barrera } from './Barrera'
import { Casa } from '../pantallas/Casa'
import '../styles/app.css'
import '../styles/pantallas.css'

// domMax trae el arrastre, que usan la comanda, la jarra, la bolsa y el pase.
const cargarMovimiento = () => import('motion/react').then((r) => r.domMax)

const Tanda = lazy(() => import('../pantallas/Tanda').then((m) => ({ default: m.Tanda })))
const Cuenta = lazy(() => import('../pantallas/Cuenta').then((m) => ({ default: m.Cuenta })))
const Carta = lazy(() => import('../pantallas/Carta').then((m) => ({ default: m.Carta })))
const Finca = lazy(() => import('../pantallas/Finca').then((m) => ({ default: m.Finca })))
const Lote = lazy(() => import('../pantallas/Lote').then((m) => ({ default: m.Lote })))
const MesaFundadora = lazy(() =>
  import('../pantallas/MesaFundadora').then((m) => ({ default: m.MesaFundadora })),
)
const Experiencias = lazy(() =>
  import('../pantallas/Experiencias').then((m) => ({ default: m.Experiencias })),
)
const Reservar = lazy(() => import('../pantallas/Reservar').then((m) => ({ default: m.Reservar })))
const Perfil = lazy(() => import('../pantallas/Perfil').then((m) => ({ default: m.Perfil })))
const Umbral = lazy(() => import('../pantallas/Umbral').then((m) => ({ default: m.Umbral })))
const Mostrador = lazy(() => import('../pantallas/Mostrador').then((m) => ({ default: m.Mostrador })))

const RUTAS = [
  { patron: '/', Vista: Casa },
  { patron: '/tanda', Vista: Tanda },
  { patron: '/cuenta', Vista: Cuenta },
  { patron: '/carta', Vista: Carta },
  { patron: '/finca', Vista: Finca },
  { patron: '/finca/lote', Vista: Lote },
  { patron: '/mesa-fundadora', Vista: MesaFundadora },
  { patron: '/experiencias', Vista: Experiencias },
  { patron: '/reservar', Vista: Reservar },
  { patron: '/perfil', Vista: Perfil },
  { patron: '/umbral', Vista: Umbral },
  { patron: '/mostrador', Vista: Mostrador },
] as const

function Sirviendo() {
  return (
    <div className="sirviendo" role="status">
      <span className="anillo anillo-cargando" style={{ ['--d' as string]: '44px' }} aria-hidden />
      <p className="caption">Un momento, que se está extrayendo.</p>
    </div>
  )
}

function NoHay() {
  const { navigate } = useRouter()
  return (
    <div className="marco vacio-pantalla">
      <p className="etiqueta">Sin mesa</p>
      <h1 className="display-md">Esa puerta no da a ningún lado.</h1>
      <p className="cuerpo">Volvamos a la casa, que ahí siempre hay algo servido.</p>
      <button className="boton boton-verde" onClick={() => navigate('/')}>
        Volver a la casa
      </button>
    </div>
  )
}

/**
 * Tres pantallas de doce nacen oscuras, y cada una se lo gana por una razón
 * funcional, nunca de ánimo:
 *   /umbral          todavía no sos socio: es la puerta de noche.
 *   /mesa-fundadora  el oro sólo modula luz sobre sustrato oscuro; sobre papel
 *                    rinde 2,09:1. La oscuridad es requisito material del objeto.
 *   /mostrador       panel de la casa, salón en penumbra, decenas de usos por
 *                    turno: menos deslumbramiento.
 * Las otras nueve nacen en papel.
 */
const RUTAS_TINTA = new Set(['/umbral', '/mesa-fundadora', '/mostrador'])

function Vistas() {
  const { path } = useRouter()

  const ruta = RUTAS.find((r) => matchRoute(r.patron, path))
  const { estado } = useEstado()
  const enUmbral = path === '/umbral'

  // El tema del cuarto va en <body>, no en <main>: así el teñido alcanza
  // también a la barra de la casa. <html> conserva lo que el socio eligió.
  const enTinta = RUTAS_TINTA.has(path)
  useEffect(() => {
    const raiz = document.documentElement
    // Al cruzar de papel a tinta, el fondo cambia de golpe pero el color de
    // texto viene transicionado: durante ~200 ms se lee tinta de papel sobre
    // fondo de tinta. Se congelan las transiciones y se sueltan al frame
    // siguiente, que es el mismo remedio que usa el interruptor de Perfil.
    raiz.classList.add('tema-cambiando')
    document.body.classList.toggle('tema-tinta', enTinta)
    // Mostrador es panel de personal: decenas de usos por turno. Ahi la
    // animacion deja de ser deleite y pasa a ser friccion, asi que las cinco
    // duraciones del sistema se ponen en cero por decreto.
    if (path === '/mostrador') document.body.dataset.chrome = 'admin'
    else delete document.body.dataset.chrome
    // El doble rAF es lo correcto cuando la pestaña compone, pero en una
    // pestaña de fondo rAF se pausa y la clase se queda pegada: y como lleva
    // `transition: none !important`, dejaria MUERTAS todas las transiciones
    // de la app hasta la siguiente navegacion. El temporizador es la red.
    const soltar = () => raiz.classList.remove('tema-cambiando')
    const id = requestAnimationFrame(() => requestAnimationFrame(soltar))
    const red = setTimeout(soltar, 120)
    return () => {
      cancelAnimationFrame(id)
      clearTimeout(red)
      raiz.classList.remove('tema-cambiando')
      document.body.classList.remove('tema-tinta')
      delete document.body.dataset.chrome
    }
  }, [enTinta, path])

  // Quien no ha entrado va al umbral. Con `replaceState` a secas la URL
  // cambiaba y la vista se quedaba donde estaba: el router no se enteraba.
  const { navigate } = useRouter()
  useEffect(() => {
    if (!estado.registrado && !enUmbral) navigate('/umbral', { replace: true })
  }, [estado.registrado, enUmbral, navigate])

  const Vista = ruta?.Vista

  return (
    <>
      <a className="salto" href="#contenido">
        Ir al contenido
      </a>
      <main id="contenido" className={enUmbral ? 'lienzo lienzo-umbral' : 'lienzo'}>
        {/* Sin AnimatePresence: una salida animada retrasa cada navegación y,
            con rutas perezosas, la espera del chunk puede dejar la presencia
            colgada. La vista nueva entra sola; la vieja se va sin ceremonia. */}
        <Barrera ruta={path} alVolver={() => navigate('/')}>
          <Suspense fallback={<Sirviendo />}>
            <m.div
              key={path}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MS.corta / 1000, ease: CURVA.extraccion }}
            >
              {Vista ? <Vista /> : <NoHay />}
            </m.div>
          </Suspense>
        </Barrera>
      </main>
      {!enUmbral && <BarraDeLaCasa />}
    </>
  )
}

export function App() {
  return (
    <LazyMotion features={cargarMovimiento} strict>
      <MotionConfig reducedMotion="user">
        <EstadoProvider>
          <RouterProvider>
            <Vistas />
          </RouterProvider>
        </EstadoProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
