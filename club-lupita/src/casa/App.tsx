import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { BarraDePestanas, CabeceraPantalla, CabeceraCasa } from './componentes/Navegacion'
import { Esqueleto, EstadoVacio } from './componentes/Estados'
import { Tarjeta } from './componentes/Superficies'
import { DatosProvider, useDatos, sesion } from './datos'
const Inicio = lazy(() => import('./pantallas/Inicio').then(m => ({ default: m.Inicio })))
const Kit = lazy(() => import('./pantallas/Kit').then(m => ({ default: m.Kit })))
const Umbral = lazy(() => import('./pantallas/Umbral').then(m => ({ default: m.Umbral })))
const Pedir = lazy(() => import('./pantallas/Pedir').then(m => ({ default: m.Pedir })))
const Perfil = lazy(() => import('./pantallas/Perfil').then(m => ({ default: m.Perfil })))
const MisCompras = lazy(() => import('./pantallas/MisCompras').then(m => ({ default: m.MisCompras })))
const Personal = lazy(() => import('./pantallas/Personal').then(m => ({ default: m.Personal })))
const Tienda = lazy(() => import('./pantallas/Tienda').then(m => ({ default: m.Tienda })))
const ConoceClub = lazy(() => import('./pantallas/ConoceClub').then(m => ({ default: m.ConoceClub })))
const Club = lazy(() => import('./pantallas/Club').then(m => ({ default: m.Club })))
const MisReservas = lazy(() => import('./pantallas/MisReservas').then(m => ({ default: m.MisReservas })))
const Reservar = lazy(() => import('./pantallas/Reservar').then(m => ({ default: m.Reservar })))
import { PedidoProvider, usePedido } from './pedido'
import { LimiteError } from './componentes/LimiteError'
import { EstadoCuenta } from './componentes/EstadoDatos'

/* ------------------------------------------------------------------
   Enrutador
   ------------------------------------------------------------------ */
function useRuta() {
  const [ruta, setRuta] = useState(() => window.location.pathname + window.location.search || '/')
  // La primera pantalla no roba el foco: quien acaba de abrir la app no ha
  // navegado a ningún lado, y moverle el foco al montar es justo lo que hace
  // que un lector empiece a hablar solo.
  const primera = useRef(true)

  useEffect(() => {
    const alVolver = () => setRuta(window.location.pathname + window.location.search || '/')
    window.addEventListener('popstate', alVolver)
    return () => window.removeEventListener('popstate', alVolver)
  }, [])

  /*
    Cambiar de pestaña no movía el foco.

    Los seis `<main id="contenido" tabIndex={-1}>` estaban preparados para
    recibirlo desde la primera iteración y nadie los enfocaba nunca: para un
    lector de pantalla el cambio de pantalla no ocurría —el foco se quedaba en
    la pestaña pulsada y el contenido nuevo no se anunciaba—, y la tecla Tab
    seguía recorriendo desde la barra de abajo. WCAG 2.4.3.

    Va en un efecto y no dentro de `navegar` porque el `<main>` de la pantalla
    nueva todavía no existe cuando `navegar` corre: se enfoca después de que
    React lo haya pintado.
  */
  useEffect(() => {
    if (primera.current) {
      primera.current = false
      return
    }
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [ruta.split('?')[0]])

  const navegar = useCallback((a: string) => {
    if (a === window.location.pathname + window.location.search) return
    window.history.pushState({desde:window.location.pathname + window.location.search}, '', a)
    setRuta(new URL(a, window.location.origin).pathname + new URL(a, window.location.origin).search)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  return { ruta:ruta.split('?')[0], ubicacion:ruta, navegar }
}

function NoHay({ navegar }: { navegar: (r: string) => void }) {
  return (
    <>
      <CabeceraPantalla titulo="Sin mesa" alVolver={() => navegar('/')} />
      <main id="contenido" tabIndex={-1} className="marco pb-28 pt-8">
        <Tarjeta>
          <EstadoVacio
            icono="search"
            titulo="Esa puerta no da a ningún lado"
            cuerpo="Volvamos a la casa, que ahí siempre hay algo servido."
            accion={{ texto: 'Volver a la casa', onClick: () => navegar('/') }}
          />
        </Tarjeta>
      </main>
    </>
  )
}

/* ------------------------------------------------------------------
   Vistas
   ------------------------------------------------------------------ */
function Vistas() {
  const { ruta, ubicacion, navegar } = useRuta()
  const { dentro, cargando, refrescar, error } = useDatos()
  const { articulos } = usePedido()
  const cartaPublica = ['/pedir', '/reservar', '/conoce-tu-club'].includes(ruta) && !new URLSearchParams(window.location.search).has('acceso')

  if (sesion.salidaPendiente()) return <main id="contenido" tabIndex={-1} className="marco pt-8"><Tarjeta>
    <h1 className="t-seccion">Saliste de este dispositivo</h1>
    <p role="status" className="my-4">El cierre en el servidor sigue pendiente de conexión; una sesión remota podría seguir activa. Tu información queda oculta aquí. Volvé a conectar este dispositivo para completar el cierre.</p>
    <BotonReintentarSalida refrescar={refrescar}/>
  </Tarjeta></main>

  // Quien no ha entrado ve la puerta, no una app vacía con la barra abajo.
  if (cargando && !dentro && !cartaPublica) {
    return (
      <main id="contenido" tabIndex={-1} className="marco space-y-4 pt-8" role="status" aria-label="Abriendo la casa">
        <Esqueleto alto="h-40" ancho="w-full" className="rounded-none" />
        <Esqueleto alto="h-24" ancho="w-full" className="rounded-none" />
      </main>
    )
  }
  if (!dentro && ruta !== '/kit' && !cartaPublica) {
    if (error) return (
      <main id="contenido" tabIndex={-1} className="marco pt-8">
        <Tarjeta><EstadoVacio icono="info" titulo="No pudimos abrir tu cuenta" cuerpo={error}
          accion={{ texto: 'Volver a intentar', onClick: () => void refrescar() }} /></Tarjeta>
      </main>
    )
    const regreso = new URLSearchParams(window.location.search)
    const destinoPublico = ['/pedir', '/reservar', '/conoce-tu-club'].includes(ruta) && regreso.has('acceso')
    regreso.delete('acceso')
    return <Suspense fallback={<p className="marco py-8" role="status">Abriendo el acceso…</p>}><EnfoqueRuta ubicacion={ubicacion} acceso/><Umbral alEntrar={() => void refrescar()} volver={destinoPublico ? { texto: ruta === '/pedir' ? 'Volver a la carta' : ruta === '/reservar' ? 'Volver a mi visita' : 'Volver a los beneficios', accion: () => navegar(ruta + (regreso.size ? '?' + regreso.toString() : '')) } : undefined} /></Suspense>
  }

  let vista
  if (ruta === '/') vista = <Inicio navegar={navegar} />
  else if (ruta === '/pedir') vista = <Pedir navegar={navegar} />
  else if (ruta === '/tienda') vista = <Tienda navegar={navegar} />
  else if (ruta === '/conoce-tu-club') vista = <ConoceClub navegar={navegar} />
  else if (ruta === '/club') vista = <Club navegar={navegar} />
  else if (ruta === '/reservas') vista = <MisReservas navegar={navegar} />
  else if (ruta === '/reservar') vista = <Reservar navegar={navegar} />
  else if (ruta === '/perfil') vista = <Perfil navegar={navegar} />
  else if (ruta === '/compras') vista = <MisCompras navegar={navegar} />
  else if (ruta === '/kit') vista = <Kit navegar={navegar} />
  else vista = <NoHay navegar={navegar} />

  return (
    <>
      <a className="salto" href="#contenido">
        Ir al contenido
      </a>
      <div className={ruta === '/kit' ? undefined : 'casa-aplicacion'}>
        {ruta !== '/kit' && <CabeceraCasa ruta={ruta} alNavegar={navegar} articulos={articulos} />}
        <div className="casa-contenido"><div className="marco">{ruta!=='/'&&ruta!=='/pedir'&&ruta!=='/conoce-tu-club'&&<EstadoCuenta />}</div><LimiteError key={ruta}><Suspense fallback={<p className="marco py-8" role="status">Abriendo la sección…</p>}><EnfoqueRuta ubicacion={ubicacion}/>{vista}</Suspense></LimiteError></div>
      </div>
      {/* Dos rutas sin barra de pestañas, por motivos distintos:
          · `/kit` es herramienta de la casa, no pantalla del socio.
          · `/reservar` es un flujo con su propia barra de accion abajo. Dos
            barras fijas apiladas se comen media pantalla en un telefono, y la
            pestaña activa no seria ninguna de las cinco. Se sale por la
            flecha de la cabecera, que vuelve al Club. */}
      {ruta !== '/kit' && ruta !== '/reservar' && (
        <BarraDePestanas
          ruta={ruta}
          alNavegar={navegar}
          aviso={articulos > 0 ? { '/pedir': articulos } : undefined}
        />
      )}
    </>
  )
}

function BotonReintentarSalida({refrescar}:{refrescar:()=>Promise<void>}) {
  const [ocupado,setOcupado]=useState(false)
  return <button className="min-h-12 underline" disabled={ocupado} onClick={()=>{setOcupado(true);void refrescar().finally(()=>setOcupado(false))}}>{ocupado?'Confirmando cierre…':'Reintentar cierre en el servidor'}</button>
}

function EnfoqueRuta({ubicacion,acceso=false}:{ubicacion:string;acceso?:boolean}) {
  const ruta = ubicacion.split('?')[0]
  useEffect(()=>{
    const titulos:Record<string,string>={'/':'Inicio','/pedir':'Carta','/club':'Mi Club','/conoce-tu-club':'Conocé tu club','/tienda':'Tienda','/perfil':'Perfil','/compras':'Mis compras y reservas','/reservas':'Mis reservas','/reservar':'Reservar mesa'}
    document.title=(acceso?'Acceso':titulos[ubicacion.split('?')[0]]??'Club')+' · La Bella Lupita'
    if(window.history.state?.desde)document.getElementById('contenido')?.focus({preventScroll:true})
  },[ruta,acceso])
  return null
}
export function App() {
  if(window.location.pathname==='/personal')return <Suspense fallback={<p role="status" className="marco pt-8">Abriendo el panel del equipo…</p>}><Personal/></Suspense>
  return (
    <DatosProvider>
      <PedidoDeCuenta />
    </DatosProvider>
  )
}

function PedidoDeCuenta() {
  const { yo, perfil } = useDatos()
  const cuenta = perfil?.id ?? yo?.socio.id ?? 'fuera'
  return <PedidoProvider key={cuenta} cuenta={cuenta}><Vistas /></PedidoProvider>
}
