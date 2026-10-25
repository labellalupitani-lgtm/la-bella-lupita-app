import '../estilos/redisenio-comercio.css'
/** Carta activa: consulta pública, elección, cotización explícita y recuperación del intento. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actualizarConActividad } from '../actualizacion-activa'
import { sesion } from '../sesion-cliente'
import { medirCarta, medirRendimientoCarta } from '../medicion-carta'
import { CONFIGURACION_CARTA } from '../../compartido/carta'
import { DetalleCarta } from './DetalleCarta'
import './Carta.css'
import { Boton, Icono } from '../componentes/Base'
import { Hoja } from '../componentes/Superficies'
import { FotoCarta } from '../componentes/FotoCarta'
import { CARTA, MOMENTOS, type PlatoCarta } from '../carta'
import { cordobas, useDatos } from '../datos'
import { usePedido } from '../pedido'
import { pedirJSON } from '../http'
import { cartaApi, type CartaActual } from '../carta-api'
import { normalizarCarta, opcionesDe, type CotizacionCarta, type ReciboCarta, type RestriccionPedido } from '../../compartido/carta'

const nombres: Record<string, string> = { 'bebidas-calientes': 'Café caliente', 'bebidas-frias': 'Sobre hielo', gaseosas: 'Refrescos', desayunos: 'Desayunos', bowls: 'Bowls', entradas: 'Para compartir', ensaladas: 'Ensaladas', paninis: 'Paninis', pizzas: 'Pizzas', 'platos-fuertes': 'Platos fuertes', postres: 'Algo dulce' }
const destacados: Record<string, string> = { barra: 'latte', brunch: 'risotto-gallo-pinto', bistro: 'pizza-churrasco', sobremesa: 'delicias-abuela', todos: 'latte' }
function estadoURL() {
  const p = new URLSearchParams(location.search)
  let estado = { momento: p.get('momento') ?? 'barra', busca: p.get('q') ?? '', plato: p.get('plato') ?? '' }
  if (!p.has('momento') && !p.has('q') && !p.has('plato')) {
    try { const anterior = JSON.parse(sessionStorage.getItem('club-lupita:carta-vista') ?? 'null'); if (anterior) estado = { ...estado, momento: anterior.momento, busca: anterior.busca } } catch { /* nueva consulta */ }
  }
  if (!['barra', 'brunch', 'bistro', 'sobremesa', 'todos'].includes(estado.momento)) estado.momento = 'barra'
  return estado
}
export function Pedir({ navegar }: { navegar: (r: string) => void }) {
  const { yo, error: errorCuenta, refrescarCuenta } = useDatos(), pedido = usePedido()
  const [vista, setVista] = useState(estadoURL), [carta, setCarta] = useState<CartaActual | null>(null), [errorCarta, setErrorCarta] = useState('')
  const [verPedido, setVerPedido] = useState(pedido.pendiente), [ocupado, setOcupado] = useState(false), [error, setError] = useState('')
  const [cotizacion, setCotizacion] = useState<CotizacionCarta | null>(null), [mensaje, setMensaje] = useState('')
  const [recuperables, setRecuperables] = useState<{ referencia: string; creado: string; total: string | null; estado: string }[] | null>(null)
  const [restriccion, setRestriccion] = useState(''), [confirmada, setConfirmada] = useState(false)
  const disparador = useRef<HTMLElement | null>(null), vivo = useRef(true), candado = useRef(false), tituloPedido = useRef<HTMLHeadingElement>(null), errorPedido = useRef<HTMLParagraphElement>(null)
  const consultaActual = useRef(0), vistaMedida = useRef(false)
  const busqueda = useRef<HTMLInputElement>(null)
  const alSalir = useRef(pedido); alSalir.current = pedido
  useEffect(() => {
    const inicio = performance.now(); let registrado = false
    const salida = () => { if (!registrado && performance.now() - inicio > 1000 && alSalir.current.articulos && !alSalir.current.pendiente) { registrado = true; medirCarta('salida_con_borrador') } }
    window.addEventListener('pagehide', salida)
    return () => { window.removeEventListener('pagehide', salida); salida() }
  }, [])
  useEffect(() => { if (yo && !vistaMedida.current) { vistaMedida.current = true; medirCarta('vista'); medirRendimientoCarta() } }, [yo])
  useEffect(() => { if (!vista.busca.trim()) return; const t = setTimeout(() => { medirCarta('busqueda') }, 800); return () => clearTimeout(t) }, [vista.busca])
  useEffect(() => {
    let marco = 0
    try { const y = Number(sessionStorage.getItem('club-lupita:carta-scroll')); if (Number.isFinite(y) && y > 0) marco = requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }))) } catch { /* Sin estado previo. */ }
    const guardar = () => { try { sessionStorage.setItem('club-lupita:carta-scroll', String(window.scrollY)) } catch { /* Almacenamiento opcional. */ } }
    window.addEventListener('scroll', guardar, { passive: true })
    return () => { cancelAnimationFrame(marco); window.removeEventListener('scroll', guardar) }
  }, [])
  const actualizarCarta = useCallback(async () => {
    const revision = ++consultaActual.current, r = await cartaApi.leer()
    if (!vivo.current || revision !== consultaActual.current) return
    if (r.ok) { setCarta(r.datos); setErrorCarta('') } else setErrorCarta(r.error)
  }, [])
  useEffect(() => {
    vivo.current = true; void actualizarCarta()
    const detener = actualizarConActividad(actualizarCarta)
    return () => { vivo.current = false; consultaActual.current++; detener() }
  }, [actualizarCarta])
  useEffect(() => {
    const volver = () => setVista(estadoURL())
    window.addEventListener('popstate', volver)
    return () => window.removeEventListener('popstate', volver)
  }, [])
  const guardarVista = (nueva: typeof vista, ficha = false) => {
    const p = new URLSearchParams()
    if (nueva.momento !== 'barra') p.set('momento', nueva.momento)
    if (nueva.busca.trim()) p.set('q', nueva.busca)
    if (nueva.plato) p.set('plato', nueva.plato)
    const url = '/pedir' + (p.size ? '?' + p.toString() : '')
    if (ficha) history.pushState({ ...history.state, cartaFicha: true }, '', url)
    else history.replaceState({ ...history.state, cartaFicha: false }, '', url)
    setVista(nueva)
    try { sessionStorage.setItem('club-lupita:carta-vista', JSON.stringify({ momento: nueva.momento, busca: nueva.busca })) } catch { /* URL conserva la consulta */ }
  }
  const catalogo = carta?.platos ?? CARTA, q = normalizarCarta(vista.busca)
  const platos = useMemo(() => {
    const base = q || vista.momento === 'todos' ? catalogo : catalogo.filter(p => p.momento === vista.momento)
    if (!q) return base
    return base.map(p => {
      const principal = normalizarCarta(p.nombre + ' ' + (p.fruta ?? ''))
      const indice = normalizarCarta([p.nombre, p.fruta, nombres[p.categoria], p.perfil, ...p.etiquetas].filter(Boolean).join(' '))
      const contiene = q.split(' ').every(palabra => indice.includes(palabra))
      return { p, valor: contiene ? principal.includes(q) ? 2 : 1 : 0 }
    }).filter(x => x.valor).sort((a, b) => b.valor - a.valor).map(x => x.p)
  }, [catalogo, q, vista.momento])
  const destacado = catalogo.find(p => p.id === destacados[vista.momento]) ?? catalogo[0]
  const seleccionVisual = useMemo(() => [destacado, ...platos.filter(p => p.foto && p.id !== destacado?.id)].filter((p): p is PlatoCarta => !!p?.foto).slice(0, 3), [destacado, platos])
  const abierto = catalogo.find(p => p.id === vista.plato), empaque = carta?.empaque ?? 4000
  const disponible = (p: PlatoCarta) => !carta || carta.platos.find(x => x.id === p.id)?.disponible !== false
  const ingresar = (plato?: PlatoCarta) => {
    const parametros = new URLSearchParams(location.search)
    parametros.set('acceso', '1')
    if (plato) parametros.set('plato', plato.id)
    navegar('/pedir?' + parametros.toString())
  }
  const abrir = (p: PlatoCarta, elemento: HTMLElement) => { medirCarta('ficha'); disparador.current = elemento; guardarVista({ ...vista, plato: p.id }, true) }
  const cerrarFicha = () => {
    if (history.state?.cartaFicha) { history.back(); setVista(v => ({ ...v, plato: '' })) }
    else guardarVista({ ...vista, plato: '' })
  }
  const grupos = Array.from(new Set(platos.map(p => p.categoria)))
  const totalBorrador = pedido.lineas.reduce((n, l) => n + (catalogo.find(p => p.id === l.id)?.precio ?? 0) * l.cuanto, 0)
  const total = cotizacion?.total ?? totalBorrador + (pedido.articulos ? empaque : 0)
  const confirmado = async (_recibo: ReciboCarta) => { pedido.vaciar(true); setCotizacion(null); setVerPedido(false); await refrescarCuenta(true); if (vivo.current) navegar('/compras') }
  const ejecutar = async (fn: () => Promise<void>) => {
    if (candado.current) return
    candado.current = true; setOcupado(true); setError('')
    try { await fn() } catch { if (vivo.current) setError('No pudimos confirmar el resultado. Consultá este mismo intento antes de repetir el pedido.') }
    finally { candado.current = false; if (vivo.current) setOcupado(false) }
  }
  const consultar = () => ejecutar(async () => {
    const r = await cartaApi.consultar(pedido.referencia)
    if (!vivo.current) return
    if (!r.ok) { setError(r.error); return }
    if (r.datos.estado === 'confirmado') { medirCarta('recuperacion_ok'); await confirmado(r.datos.recibo); return }
    setError('Este intento todavía no tiene un cobro confirmado. Podés consultarlo otra vez o cerrarlo para volver a editar.')
  })
  const cerrarIntento = () => ejecutar(async () => {
    const r = await cartaApi.cerrar(pedido.referencia)
    if (!vivo.current) return
    if (!r.ok) { setError(r.error); return }
    if (r.datos.estado === 'confirmado') await confirmado(r.datos.recibo)
    else if (r.datos.estado === 'cerrado') { pedido.vaciar(true); setCotizacion(null); setMensaje('El intento se cerró sin cobro. Podés armar otro pedido.'); tituloPedido.current?.focus() }
  })
  const cotizar = () => ejecutar(async () => {
    medirCarta('revisar')
    const r: RestriccionPedido = restriccion.trim() ? { texto: restriccion.trim(), confirmada: true } : null
    const resultado = await cartaApi.cotizar(pedido.lineas, pedido.referencia, r)
    if (!vivo.current) return
    if (!resultado.ok) { medirCarta('cotizacion_error'); setError(resultado.error); return }
    medirCarta('cotizacion_ok')
    setCotizacion(resultado.datos); setMensaje('Total actualizado. Revisá el desglose antes de pagar.'); tituloPedido.current?.focus()
  })
  const pagar = () => ejecutar(async () => {
    if (!cotizacion || !await pedido.iniciarEnvio(cotizacion)) return
    medirCarta('confirmar')
    const r = await cartaApi.cobrar(pedido.lineas, pedido.referencia, cotizacion.id, cotizacion.restriccion)
    if (!vivo.current) return
    if (!r.ok) {
      // Ningún conflicto autoriza a olvidar un cobro: se consulta y cierra la referencia antes de editar.
      medirCarta('cobro_incierto'); setError(r.error); return
    }
    medirCarta('cobro_ok'); await confirmado(r.datos)
  })
  const agregar = (p: PlatoCarta, cantidad = 1, opciones: Record<string, string> = {}) => {
    if (pedido.agregar(p.id, cantidad, opciones)) { medirCarta('agregado'); setCotizacion(null); setMensaje(p.nombre + ': agregaste ' + cantidad + '. El pedido tiene ' + (pedido.articulos + cantidad) + ' artículos.') }
  }
  const cambioPedido = () => { setCotizacion(null); setError('') }
  useEffect(() => {
    if (!verPedido || ocupado) return
    if (error) errorPedido.current?.focus()
  }, [error, ocupado, verPedido])
  useEffect(() => { if (q && !platos.length) medirCarta('sin_resultados'); const t = setTimeout(() => setMensaje(platos.length + (platos.length === 1 ? ' resultado' : ' resultados') + (q ? ' en toda la carta.' : ' en esta selección.')), 350); return () => clearTimeout(t) }, [q, vista.momento, platos.length])
  // El navegador puede enfocar debajo de las dos barras fijas; asegurar visibilidad real al tabular.
  useEffect(() => {
    const verFoco = (e: FocusEvent) => {
      const el = e.target
      if (!(el instanceof HTMLElement) || !el.closest('.casa-carta') || el.closest('dialog')) return
      const barras = [...document.querySelectorAll<HTMLElement>('.casa-carta-barra, .casa-nav-movil')]
      const techo = Math.min(innerHeight, ...barras.map(b => b.getBoundingClientRect()).filter(r => r.height > 0).map(r => r.top))
      const r = el.getBoundingClientRect()
      if (r.bottom > techo - 16) window.scrollBy({ top: r.bottom - techo + 24, behavior: 'instant' })
      else if (r.top < 16) window.scrollBy({ top: r.top - 24, behavior: 'instant' })
    }
    document.addEventListener('focusin', verFoco)
    return () => document.removeEventListener('focusin', verFoco)
  }, [pedido.articulos])
  return <>
    <main id="contenido" tabIndex={-1} className={'marco casa-carta comercio-pagina' + (q ? ' carta-buscando' : '')}>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{mensaje}</p>
      {errorCarta && <div className="carta-aviso"><p>Podés consultar la carta guardada. Los precios y la disponibilidad se verificarán antes de pagar.</p><Boton tono="tenue" onClick={() => void actualizarCarta()}>Actualizar carta</Boton></div>}
      {!yo && !sesion.leer() && !sesion.heredada() && <div className="carta-aviso"><p>{errorCuenta ? 'La cuenta no está disponible; podés seguir consultando la carta.' : 'Explorá la carta. Ingresá a tu cuenta para hacer un pedido.'}</p><Boton tono="tenue" onClick={() => ingresar()}>Ingresar a mi cuenta</Boton></div>}
      {pedido.errorGuardado && <div className="carta-aviso" role="alert"><p>{pedido.errorGuardado}</p><Boton tono="tenue" onClick={() => navegar('/compras')}>Consultar Mis compras</Boton>{!pedido.pendiente && <><Boton tono="tenue" onClick={() => void ejecutar(async () => { const r = await pedirJSON<{ intentos: NonNullable<typeof recuperables> }>('/carta/recuperacion'); setRecuperables(r.intentos) })}>Recuperar referencia del servidor</Boton>{recuperables && <ul>{recuperables.map(r => <li key={r.referencia}><Boton tono="tenue" onClick={() => { pedido.recuperarReferencia(r.referencia); setVerPedido(true); setRecuperables(null) }}>{new Date(r.creado).toLocaleString('es-NI')} · {r.total ? cordobas(Number(r.total)) : 'Sin total'} · {r.estado === 'confirmado' ? 'Cobrado' : 'Consultar'}</Boton></li>)}</ul>}{recuperables?.length === 0 && <p>No hay referencias recientes que recuperar. Revisá Mis compras y consultá en barra antes de iniciar otro pedido desde este navegador.</p>}</>}</div>}
      {pedido.pendiente && <div className="carta-aviso"><p>Tu último envío está pendiente de confirmación.</p><Boton tono="claro" onClick={() => setVerPedido(true)}>Revisar pedido pendiente</Boton></div>}
      <div className="casa-carta-composicion">
        <div className="carta-entrada"><h1 className="casa-carta-titulo font-titular text-grande">La <em>carta</em></h1><p>Retirás en barra · Plaza La Fe<br/>Empaque {cordobas(empaque)} por pedido</p></div>
        <div className="casa-carta-buscador">
          <label className="carta-busqueda-etiqueta" htmlFor="carta-busqueda">Buscar en la carta</label>
          <div className="carta-busqueda-control">
            <Icono nombre="search" tam={20}/>
            <input ref={busqueda} id="carta-busqueda" type="search" placeholder="Café, bagel, maracuyá…" value={vista.busca} onChange={e => guardarVista({ ...vista, busca: e.target.value })}/>
            {vista.busca.length > 0 && <button type="button" className="carta-busqueda-limpiar" aria-label="Limpiar búsqueda" onClick={() => { guardarVista({ ...vista, busca: '' }); busqueda.current?.focus() }}>Borrar</button>}
          </div>
        </div>
        <nav className="casa-carta-categorias" aria-label="Momentos de la carta" onFocusCapture={event => {
          const boton = event.target
          if (!(boton instanceof HTMLButtonElement)) return
          const contenedor = event.currentTarget, b = boton.getBoundingClientRect(), c = contenedor.getBoundingClientRect()
          // También al ampliar texto: revelar todo el control y su foco,
          // sin mover verticalmente la página al recorrer las categorías.
          if (b.left < c.left + 6) contenedor.scrollBy({ left: b.left - c.left - 6, behavior: 'instant' })
          else if (b.right > c.right - 6) contenedor.scrollBy({ left: b.right - c.right + 6, behavior: 'instant' })
        }}>
          {[{ id: 'todos', titulo: 'Todo' }, ...MOMENTOS].map(m => <button key={m.id} type="button" aria-pressed={!q && vista.momento === m.id} onClick={() => guardarVista({ ...vista, momento: m.id, busca: '' })}>{m.id === 'barra' ? 'Café' : m.id === 'sobremesa' ? 'Dulce' : m.titulo}</button>)}
        </nav>
        <p role="status" className="carta-recepcion">{errorCarta ? 'Disponibilidad sin confirmar. Actualizá la carta para consultar la recepción de pedidos.' : !carta ? 'Consultando recepción y disponibilidad de pedidos…' : carta.abierto ? 'Recibimos pedidos para retirar en barra. El equipo confirma su preparación.' : carta.motivo}</p>
        {!q && seleccionVisual.length > 0 && <section className={'carta-seleccion' + (seleccionVisual.length === 1 ? ' carta-seleccion-unica' : '')} aria-label="Selección de la casa">
          {seleccionVisual.map((p, i) => <article className="carta-seleccion-producto" key={p.id}>
            <button type="button" className="carta-seleccion-enlace" aria-label={'Ver ' + p.nombre} onClick={e => abrir(p, e.currentTarget)}>
              <span className="carta-seleccion-foto"><FotoCarta foto={p.foto!} nombre={p.nombre} prioridad={i === 0} sizes="(min-width: 900px) 380px, 52vw"/></span>
              <span className="carta-seleccion-datos"><span className="carta-seleccion-nombre">{p.nombre}</span><span className="carta-seleccion-precio">{cordobas(p.precio)} <Icono nombre="arrow_forward" tam={18}/></span></span>
            </button>
            {!disponible(p) && <p className="t-caption">Agotado por ahora</p>}
          </article>)}
        </section>}
        <div className="casa-carta-resultados" key={vista.momento + ":" + q}>
          <p className="t-cuerpo mb-5">{q ? platos.length + (platos.length === 1 ? ' resultado en toda la carta' : ' resultados en toda la carta') : vista.momento === 'todos' ? 'Todos los platos y bebidas de la casa.' : MOMENTOS.find(m => m.id === vista.momento)?.desc}</p>
          {!platos.length && <div className="carta-aviso"><h2>No encontramos ese antojo</h2><p>Probá otro nombre o explorá las categorías.</p><Boton tono="tenue" onClick={() => { guardarVista({ momento: 'todos', busca: '', plato: '' }); busqueda.current?.focus() }}>Ver toda la carta</Boton></div>}
          {grupos.map((grupo, i) => {
            const miembros = platos.filter(p => p.categoria === grupo)
            const lista = <ul className="casa-carta-lista">{miembros.map(p => <li key={p.id} className={p.foto ? 'carta-plato-con-foto' : undefined}>
              <button type="button" className="casa-carta-plato" aria-label={'Ver ' + p.nombre} onClick={e => abrir(p, e.currentTarget)}>{p.foto && <span className="carta-plato-miniatura"><FotoCarta foto={p.foto} nombre={p.nombre} sizes="112px"/></span>}<span className="carta-plato-texto"><span className="font-titular text-seccion">{p.nombre}</span><span className="t-caption">{p.descripcion}</span>{!disponible(p) && <span className="t-caption carta-agotado">Agotado por ahora</span>}</span></button>
              <div className="casa-carta-accion"><span className="carta-precio">{cordobas(p.precio)}</span><button type="button" disabled={pedido.pendiente || !disponible(p) || pedido.disponiblePara(p.id) === 0} aria-label={'Agregar ' + p.nombre + ' al pedido. Cantidad actual: ' + pedido.cuantoDe(p.id)} onClick={e => { if (!yo) ingresar(p); else if (opcionesDe(p.id).length) abrir(p, e.currentTarget); else agregar(p) }}><Icono nombre="add" tam={18}/>{pedido.cuantoDe(p.id) > 0 && <span>{pedido.cuantoDe(p.id)}</span>}</button></div>
            </li>)}</ul>
            return i === 0 || q ? <section key={grupo}><h2 className="casa-carta-grupo t-etiqueta">{nombres[grupo] ?? grupo}</h2>{lista}</section> : <details key={grupo} className="casa-carta-grupo-plegable"><summary className="font-titular text-seccion">{nombres[grupo] ?? grupo}<span className="t-caption">{miembros.length} opciones</span></summary>{lista}</details>
          })}
        </div>
      </div>
      <p className="t-caption mt-6">Horario de pedidos (Managua): {(carta?.horario ?? CONFIGURACION_CARTA.horario).map((h, i) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i] + ' ' + (h ? h.abre + '–' + h.cierra : 'cerrado')).join(' · ')}. El equipo confirma la preparación. Si necesitás una excepción, consultá en barra.</p>
    </main>
    {(pedido.articulos > 0 || pedido.pendiente) && <div className="casa-carta-barra"><button type="button" onClick={() => setVerPedido(true)}><span>{pedido.pendiente ? 'Envío por confirmar' : pedido.articulos + (pedido.articulos === 1 ? ' artículo' : ' artículos') + ' · ' + cordobas(total)}</span><span>Ver tu pedido</span></button></div>}
    {abierto && <DetalleCarta key={abierto.id} plato={abierto} disparador={disparador.current} maximo={pedido.disponiblePara(abierto.id)} empaque={empaque} bloqueo={!disponible(abierto) ? 'agotado' : pedido.pendiente ? 'pendiente' : !yo ? 'sin-cuenta' : undefined} alIngresar={() => ingresar(abierto)} alCerrar={cerrarFicha} alAgregar={(n, opciones) => agregar(abierto, n, opciones)}/>}
    <Hoja abierta={verPedido} alCerrar={() => { if (!candado.current) setVerPedido(false) }} titulo="Tu pedido" eyebrow={<p className="t-eyebrow text-achiote">Retirás en barra · Plaza La Fe</p>}>
      <h3 ref={tituloPedido} tabIndex={-1} className="t-cuerpo mt-3">{pedido.pendiente ? 'Consultá el envío antes de repetirlo' : cotizacion ? 'Revisá el total antes de pagar' : 'Elegí y revisá tu pedido'}</h3>
      {pedido.pendiente ? <>
        <p className="mt-3">Conservamos la referencia del envío aunque cambie la carta. Consultar su resultado no vuelve a cobrarlo.</p>
        {pedido.cotizacion && <p className="mt-3">Total enviado: {cordobas(pedido.cotizacion.total)}</p>}
        <p className="t-caption mt-3">Referencia: {pedido.referencia}</p>
        <Boton ancho className="mt-4" cargando={ocupado} onClick={() => void consultar()}>Consultar resultado</Boton>
        <Boton ancho tono="tenue" className="mt-2" disabled={ocupado} onClick={() => void cerrarIntento()}>Cerrar intento sin cobro</Boton>
        <p className="t-caption mt-3">Si ya se cobró, te mostraremos la compra. Solo se cierra cuando el servidor confirma que no hubo cobro.</p>
      </> : pedido.articulos === 0 ? <div className="mt-4"><p>Tu pedido está vacío.</p><Boton className="mt-3" onClick={() => setVerPedido(false)}>Seguir explorando Carta</Boton></div> : <>
        <ul className="mt-4 divide-y divide-filete">{pedido.detalle.map(({ plato, cuanto, opciones, clave }) => <li key={clave} className="casa-carta-linea-pedido">
          <span><strong>{plato.nombre}</strong>{Object.entries(opciones).map(([k, v]) => <small key={k}>{opcionesDe(plato.id).find(o => o.id === k)?.nombre}: {opcionesDe(plato.id).find(o => o.id === k)?.valores?.find(x => x.id === v)?.nombre ?? v}</small>)}<small>{cordobas(catalogo.find(p => p.id === plato.id)?.precio ?? plato.precio)} c/u</small></span>
          <span className="carta-contador"><button type="button" disabled={ocupado} aria-label={'Quitar un ' + plato.nombre} onClick={() => { pedido.quitar(clave); cambioPedido(); tituloPedido.current?.focus() }}><Icono nombre="remove" tam={18}/></button><span>{cuanto}</span><button type="button" disabled={ocupado || pedido.disponiblePara(plato.id) === 0} aria-label={'Agregar otro ' + plato.nombre} onClick={() => { agregar(plato, 1, opciones); cambioPedido() }}><Icono nombre="add" tam={18}/></button></span>
        </li>)}</ul>
        {!cotizacion && <details className="carta-restriccion mt-4"><summary>Alergias o restricciones para este pedido</summary><p className="t-caption mt-2">La información del perfil no se envía automáticamente. Antes de pagar, confirmá con el equipo si pueden atender tu restricción.</p>{yo?.socio.alergias && <Boton tono="tenue" onClick={() => { setRestriccion(yo.socio.alergias ?? ''); setConfirmada(false) }}>Usar la información de mi perfil</Boton>}<label>Información confirmada para cocina<textarea maxLength={240} value={restriccion} onChange={e => { setRestriccion(e.target.value); setConfirmada(false) }}/></label>{restriccion.trim() && <label><input type="checkbox" checked={confirmada} onChange={e => setConfirmada(e.target.checked)}/>Ya confirmé con el equipo que pueden atender esta restricción.</label>}</details>}
        <dl className="carta-totales mt-5"><div><dt>Productos</dt><dd>{cordobas(cotizacion?.subtotal ?? totalBorrador)}</dd></div><div><dt>Empaque para llevar</dt><dd>{cordobas(cotizacion?.empaque ?? empaque)}</dd></div><div><dt>Total</dt><dd>{cordobas(total)}</dd></div></dl>
        {cotizacion && <><ul className="t-caption mt-3">{cotizacion.lineas.map(l => <li key={l.clave}>{l.cuanto} × {l.nombre}: {cordobas(l.precio * l.cuanto)}{l.descuentoClub&&<span> · Mesa Fundadora: {l.descuentoClub}% incluido (antes {cordobas((l.precioAntes??l.precio)*l.cuanto)})</span>}{l.opciones.map(o => ' · ' + o.valor).join('')}</li>)}</ul><p className="t-caption mt-3">Este total vence a las {new Date(cotizacion.vence).toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })}. Si cambia, te pediremos revisarlo antes de cobrar.</p>{cotizacion.restriccion && <p className="t-caption">Para cocina: {cotizacion.restriccion.texto}</p>}</>}
        <p className="mt-3">Cuenta de Casa: {cordobas(yo?.saldo.total ?? 0)}</p>
        {errorCuenta && <p role="alert">{errorCuenta}</p>}
        {(yo?.saldo.total ?? 0) < total && <p className="mt-3">Recargá en caja con efectivo o tarjeta. Conservamos tu pedido; después actualizá el saldo para continuar.</p>}
        <Boton tono="tenue" className="mt-2" disabled={ocupado} onClick={() => void ejecutar(async () => { medirCarta('actualizar_saldo'); await refrescarCuenta(true); if (vivo.current) setMensaje('Consulta de saldo completada.') })}>Actualizar saldo</Boton>
        {cotizacion ? <><Boton ancho className="mt-5" cargando={ocupado} disabled={!yo || !!errorCuenta || (yo?.saldo.total ?? 0) < cotizacion.total} onClick={() => void pagar()}>Pagar {cordobas(cotizacion.total)} con mi Cuenta de Casa</Boton><Boton tono="tenue" ancho className="mt-2" disabled={ocupado} onClick={() => setCotizacion(null)}>Volver a revisar el pedido</Boton></> : <Boton ancho className="mt-5" cargando={ocupado} disabled={!yo || !!restriccion.trim() && !confirmada || carta?.abierto === false} onClick={() => void cotizar()}>Revisar total para pagar</Boton>}
        <Boton tono="tenue" ancho className="mt-2" disabled={ocupado} onClick={() => { pedido.vaciar(); cambioPedido(); tituloPedido.current?.focus() }}>Vaciar el pedido</Boton>
        <p className="mt-4 t-caption">El cargo se hace al pagar. El equipo recibe el pedido y confirma su preparación. Consultá el estado en Mis compras y reservas. Si surge una incidencia, pedí atención a la casa; una cancelación la confirma el equipo.</p>
      </>}
      {error && <p ref={errorPedido} tabIndex={-1} role="alert" className="carta-aviso mt-3">{error}</p>}
      {pedido.errorGuardado && <p role="alert" className="carta-aviso mt-3">{pedido.errorGuardado}</p>}
    </Hoja>
  </>
}

