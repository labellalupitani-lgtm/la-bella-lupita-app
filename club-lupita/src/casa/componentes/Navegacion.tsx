import { useLayoutEffect, useRef, type ReactNode, type MouseEvent } from 'react'
import { Icono, type NombreIcono } from './Base'
import { useDatos } from '../datos'

function seguir(e:MouseEvent<HTMLAnchorElement>,ruta:string,navegar:(r:string)=>void){if(e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.shiftKey){e.preventDefault();navegar(ruta)}}
export const PESTANAS = [
  { ruta: '/', nombre: 'Inicio', icono: 'home' },
  { ruta: '/pedir', nombre: 'Carta', icono: 'local_cafe' },
  { ruta: '/tienda', nombre: 'Tienda', icono: 'storefront' },
  { ruta: '/club', nombre: 'Mi Club', icono: 'military_tech' },
  { ruta: '/perfil', nombre: 'Perfil', icono: 'person' },
] as const satisfies ReadonlyArray<{ ruta: string; nombre: string; icono: NombreIcono }>

/** Marca y navegación amplia; las cinco secciones siguen al alcance en móvil. */
export function CabeceraCasa({ ruta, alNavegar, articulos }: { ruta: string; alNavegar: (r: string) => void; articulos: number }) {
  const { yo, perfil } = useDatos()
  const nombre = (perfil?.nombre ?? yo?.socio.nombre)?.split(' ')[0] ?? 'Mi cuenta'
  return <header className="casa-cabecera">
    <div className="casa-cabecera-interior">
      <button className="casa-marca" aria-label="La Bella Lupita, ir al inicio" onClick={() => alNavegar('/')}>
        <img src="/brand/v3/logo-320.webp" srcSet="/brand/v3/logo-160.webp 160w, /brand/v3/logo-320.webp 320w" sizes="(min-width: 900px) 144px, 120px" alt="La Bella Lupita Bistró-Café" width={760} height={360} />
      </button>
      <span className="casa-nav-etiqueta">EL CLUB DE LA CASA</span>
      <nav className="casa-nav-amplia" aria-label="Navegación principal">
        {PESTANAS.map(p => <a href={p.ruta} key={p.ruta} onClick={e=>seguir(e,p.ruta,alNavegar)} aria-current={ruta === p.ruta ? 'page' : undefined}>
          <Icono nombre={p.icono} tam={21} />
          {p.nombre}
          {p.ruta === '/pedir' && articulos > 0 && <span className="casa-nav-cantidad" aria-label={`${articulos} productos en el pedido`}>{articulos}</span>}
        </a>)}
      </nav>
      {ruta==='/'?<div id="inicio-herramientas" className="inicio-encabezado"/>:<button className="casa-reservar" onClick={() => alNavegar('/reservar')} aria-current={ruta === '/reservar' ? 'page' : undefined}><Icono nombre="event_seat" tam={21} /> Reservar una mesa <Icono nombre="arrow_forward" tam={17} /></button>}
      <div className="casa-nav-final">
        <div className="casa-nav-invitacion"><Icono nombre="local_cafe" tam={28} /><p>Lo bueno se comparte</p><span>Un café, una mesa y tiempo para vos</span><a href="/conoce-tu-club" onClick={e=>seguir(e,'/conoce-tu-club',alNavegar)} aria-current={ruta==='/conoce-tu-club'?'page':undefined}>Conocé tu club <Icono nombre="arrow_forward" tam={16} /></a></div>
        <button className="casa-nav-perfil" type="button" onClick={() => alNavegar('/perfil')}><span className="casa-avatar" aria-hidden="true">{[...nombre][0]}</span><span><strong>{nombre}</strong><small>{yo?.membresia ? 'Miembro fundador' : 'Tu cuenta de casa'}</small></span><Icono nombre="chevron_right" tam={18} /></button>
      </div>
    {ruta!=='/conoce-tu-club'&&<a className={'casa-conocer-acceso'+(ruta==='/club'?' es-club':'')} href="/conoce-tu-club" onClick={e=>seguir(e,'/conoce-tu-club',alNavegar)}>Conocé tu club <Icono nombre="arrow_forward" tam={16}/></a>}
    </div>
  </header>
}

export function BarraDePestanas({
  ruta,
  alNavegar,
  aviso,
}: {
  ruta: string
  alNavegar: (r: string) => void
  /** Punto de atención por pestaña: `{ '/pedir': 2 }` pinta el contador del carrito. */
  aviso?: Partial<Record<string, number>>
}) {
  const barra = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const elemento = barra.current
    if (!elemento) return
    const medir = () => document.documentElement.style.setProperty('--casa-nav-alto', `${elemento.getBoundingClientRect().height}px`)
    const observador = new ResizeObserver(medir)
    observador.observe(elemento)
    medir()
    // El foco nativo no considera la navegación fija como una zona cubierta.
    const mostrarFoco = (e: FocusEvent) => {
      const destino = e.target
      if (!(destino instanceof HTMLElement) || !destino.matches('a,button,input,select,textarea') || !destino.closest('main') || destino.closest('dialog,.casa-carta')) return
      const nav = elemento.getBoundingClientRect(), r = destino.getBoundingClientRect()
      if (nav.height > 0 && r.height < nav.top - 24 && r.bottom > nav.top - 16) window.scrollBy({ top: r.bottom - nav.top + 24, behavior: 'instant' })
    }
    document.addEventListener('focusin', mostrarFoco)
    return () => { observador.disconnect(); document.removeEventListener('focusin', mostrarFoco); document.documentElement.style.removeProperty('--casa-nav-alto') }
  }, [])
  return (
    <nav
      ref={barra}
      aria-label="Secciones de Club Lupita"
      className="casa-nav-movil fixed inset-x-0 bottom-0 z-40 rounded-none border-t-2 border-t-contorno bg-banda pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {PESTANAS.map(({ ruta: r, nombre, icono }) => {
          const activo = r === '/' ? ruta === '/' : ruta.startsWith(r)
          const n = aviso?.[r]
          return (
            <li key={r} className="flex-1">
              <a
                href={r}
                onClick={e=>seguir(e,r,alNavegar)}
                aria-current={activo ? 'page' : undefined}
                aria-label={n ? `${nombre}, ${n} productos en el pedido` : nombre}
                className={[
                  'relative flex min-h-[56px] w-full flex-col items-center justify-center gap-1 rounded-none px-2 py-2',
                  'transition-colors duration-tactil ease-extraccion',
                  // La activa no es una píldora tintada: es la pestaña de una
                  // carpeta, marcada por un filete de contorno arriba. La píldora
                  // está reservada para lo que se aprieta una vez, no para lo
                  // que indica dónde estás.
                  activo
                    ? 'border-t-2 border-t-rosa text-rosa'
                    : 'border-t-2 border-t-transparent text-papel/70 hover:text-papel',
                ].join(' ')}
              >
                <Icono nombre={icono} tam={22} lleno={activo} />
                <span className="font-texto text-micro font-semibold uppercase tracking-wider">
                  {nombre}
                </span>
                {n ? (
                  <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-achiote font-texto text-micro font-bold tabular-nums text-papel">
                    {n}
                  </span>
                ) : null}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------
   CABECERA DE SALUDO — la banda superior del Inicio: avatar, saludo,
   nivel y campana.

   El avatar dejó de ser un círculo. En este sistema el círculo es una
   píldora y la píldora es para apretar; una fotografía se enmarca, no se
   redondea. Va en troquel de 2 px con filete de contorno, como el retrato
   impreso en una etiqueta.
   ------------------------------------------------------------------ */
export function CabeceraSaludo({
  nombre,
  nivel,
  detalle,
  avatar,
  sinVer = 0,
  alPerfil,
  alAvisos,
}: {
  nombre: string
  nivel: string
  /** Lo que la casa puede probar del nivel: puntos que faltan, o el número de miembro. */
  detalle: string
  /**
   * El prototipo dibuja una foto. La casa no guarda ninguna, así que sin
   * `avatar` va la inicial: una silueta genérica dice menos que una letra que
   * es de verdad tuya, y un `<img>` roto dice todavía menos.
   */
  avatar?: string | null
  sinVer?: number
  alPerfil: () => void
  alAvisos?: () => void
}) {
  // `viewport-fit=cover` mete el contenido bajo la barra de estado: sin la
  // franja segura, el avatar y el saludo se cortan arriba.
  //
  // `sticky` y no `fixed`: siendo fija, el `<main>` tenía que esquivarla con
  // un `pt-24` medido a ojo, y entre la cabecera y el carnet —que son la
  // MISMA banda verde— quedaba una franja de avena de veinte píxeles. En el
  // flujo, el carnet arranca donde termina la cabecera y la banda es una sola.
  return (
    <header className="casa-saludo">
      <div className="casa-saludo-interior">
        <div className="casa-saludo-texto"><p>Tu casa, {nombre}</p></div>
        <button type="button" onClick={alPerfil} className="casa-saludo-perfil" aria-label={`Ver perfil de ${nombre}`}>
          <span className="casa-avatar">
            {avatar ? (
              <img src={avatar} alt="" width={88} height={88} className="size-full object-cover" />
            ) : (
              <span aria-hidden="true">
                {nombre.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <span><strong>{nivel}</strong><small>{detalle}</small></span>
          <Icono nombre="chevron_right" tam={18} />
        </button>
        {alAvisos && <button
          type="button"
          onClick={alAvisos}
          aria-label={sinVer ? `Avisos, ${sinVer} sin leer` : 'Avisos'}
          className="relative flex size-11 shrink-0 items-center justify-center rounded-troquel text-papel transition-colors duration-tactil hover:bg-banda-honda active:scale-95"
        >
          <Icono nombre="notifications" tam={24} />
          {sinVer > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-achiote" />
          )}
        </button>}
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------
   CABECERA DE PANTALLA — flecha atrás y título centrado, sobre la banda.
   Es el patrón de todas las vistas de segundo nivel.
   ------------------------------------------------------------------ */
export function CabeceraPantalla({
  titulo,
  alVolver,
  acción,
}: {
  titulo: string
  alVolver: () => void
  acción?: ReactNode
}) {
  return (
    <header className="casa-subcabecera sticky top-0 z-30 rounded-none bg-banda pt-[env(safe-area-inset-top)]">
      <div className="mx-auto grid max-w-md grid-cols-[44px_1fr_44px] items-center px-2 py-3">
        <button
          type="button"
          onClick={alVolver}
          aria-label="Volver"
          className="flex size-11 items-center justify-center rounded-troquel text-papel transition-colors duration-tactil hover:bg-banda-honda active:scale-95"
        >
          <Icono nombre="arrow_back" tam={22} />
        </button>
        <h1 className="min-w-0 text-center font-titular text-seccion font-bold tracking-tight text-papel">
          {titulo}
        </h1>
        <span className="flex justify-end">{acción}</span>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------
   SUB-BANDA — la línea de contexto que cuelga de la cabecera de pantalla:
   «Retirás en barra, en Plaza La Fe». Va en el verde hondo para que se lea
   como parte del mismo bloque impreso y no como una tarjeta más.
   ------------------------------------------------------------------ */
export function SubBanda({ icono, children }: { icono?: NombreIcono; children: ReactNode }) {
  return (
    <div className="casa-contexto bg-banda-honda">
      <p className="mx-auto flex max-w-md items-center gap-2 px-4 py-2 font-texto text-menuda font-semibold uppercase tracking-wider text-papel/70">
        {icono && <Icono nombre={icono} tam={15} />}
        {children}
      </p>
    </div>
  )
}
