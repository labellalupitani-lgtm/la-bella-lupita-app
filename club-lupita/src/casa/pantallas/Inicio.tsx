import { type FocusEvent, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { actualizarConActividad } from '../actualizacion-activa'
import { createPortal } from 'react-dom'
import { Boton, EnLaBanda, Icono } from '../componentes/Base'
import { Hoja, Tarjeta } from '../componentes/Superficies'
import { PaseSocio } from '../componentes/PaseSocio'
import { TarjetaDeSellos } from '../componentes/Datos'
import { CabeceraSaludo } from '../componentes/Navegacion'
import { EstadoVacio, VACIOS, conSalida } from '../componentes/Estados'
import { AccesosRapidos, PasaEnLaCasa, type CosaDeLaCasa } from '../componentes/Inicio'
import { cordobas, nivelDe, puntos, useDatos } from '../datos'
import { CARTA } from '../carta'
import { EstadoCuenta, EstadoCupos, EstadoCatalogo } from '../componentes/EstadoDatos'
import { PremioPresentado, usePremio } from '../premio'
import { medir, abrirOferta } from '../medicion'
import { RECARGA } from '../../compartido/reglas'
import '../estilos/redisenio-inicio.css'

const fecha = (iso:string)=>new Intl.DateTimeFormat('es-NI',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Managua'}).format(new Date(iso))
const estados={recibido:'Recibimos tu pedido',aceptado:'Tu pedido está confirmado',preparando:'Estamos preparando tu pedido',listo:'Tu pedido está listo para retirar'}
const destacados=CARTA.filter(p=>['risotto-gallo-pinto','dulce-tentacion','pizza-churrasco'].includes(p.id))
let regresoAPlato:{id:string;cuenta:string;x:number;y:number}|null=null

function mantenerControlVisible(control:HTMLElement) {
  const caja=control.getBoundingClientRect()
  const barra=document.querySelector<HTMLElement>('.casa-nav-movil')?.getBoundingClientRect()
  const limite=barra?.height?barra.top:window.innerHeight
  if(caja.height>limite-24){if(caja.top<12||caja.bottom>limite-12)window.scrollBy({top:caja.top-12,behavior:'instant'})}
  else if(caja.bottom>limite-12)window.scrollBy({top:caja.bottom-limite+12,behavior:'instant'})
  else if(caja.top<12)window.scrollBy({top:caja.top-12,behavior:'instant'})
}

function mostrarPlatoEnfocado(event:FocusEvent<HTMLButtonElement>) {
  const tarjeta=event.currentTarget,lista=tarjeta.parentElement
  if(!lista)return
  const plato=tarjeta.getBoundingClientRect(),ventana=lista.getBoundingClientRect()
  // El foco nativo puede conformarse con una tarjeta parcialmente visible.
  if(lista.scrollWidth>lista.clientWidth&&(plato.left<ventana.left+4||plato.right>ventana.right-4))lista.scrollLeft+=plato.left-ventana.left-4
  mantenerControlVisible(tarjeta)
}

export function Inicio({navegar}:{navegar:(ruta:string)=>void}) {
  const {yo,catalogo,catalogoError,catalogoActualizado,catalogoCargando,cuposCargando,cuentaCargando,cargando,error,refrescar,refrescarCuenta,revalidar,contexto,contextoError,contextoCargando,refrescarContexto}=useDatos()
  const actualizando=cuentaCargando||catalogoCargando||cuposCargando||contextoCargando
  const seguimientoPrioritario=Boolean(contextoError||contexto?.pedido||contexto?.reserva)
  const [saldoVisible,setSaldoVisible]=useState(()=>{try{return sessionStorage.getItem('lupita:saldo-visible')!=='no'}catch{return true}})
  const cambiarSaldo=()=>{setSaldoVisible(!saldoVisible);try{sessionStorage.setItem('lupita:saldo-visible',saldoVisible?'no':'si')}catch{}}
  const [revisionCatalogo,relojCatalogo]=useState(0)
  const horaCatalogo=()=>catalogo?.ahora&&catalogoActualizado?Date.parse(catalogo.ahora)+Date.now()-Date.parse(catalogoActualizado):Date.now()
  useEffect(()=>{
    const siguientes=catalogo?.experiencias.map(e=>Date.parse(e.cuando)-horaCatalogo()).filter(t=>t>0)??[]
    if(!siguientes.length)return
    const reloj=setTimeout(()=>relojCatalogo(n=>n+1),Math.min(2_147_000_000,Math.min(...siguientes)+50))
    return()=>clearTimeout(reloj)
  },[catalogo,catalogoActualizado,revisionCatalogo])
  const [hoja,setHoja]=useState<'pase'|'premio'|'recarga'|null>(null)
  const listaDestacados=useRef<HTMLDivElement>(null)
  const seguimientoElemento=useRef<HTMLElement>(null)
  const [entradaValidada,setEntradaValidada]=useState(false)
  const [destinoHerramientas,setDestinoHerramientas]=useState<HTMLElement|null>(null)
  useLayoutEffect(()=>{setDestinoHerramientas(document.getElementById('inicio-herramientas'))},[])
  useLayoutEffect(()=>{
    const barra=document.querySelector<HTMLElement>('.casa-nav-movil')
    if(!barra)return
    const actualizarAltura=()=>{
      document.documentElement.style.setProperty('--inicio-nav-alto',`${barra.getBoundingClientRect().height}px`)
      const foco=document.activeElement
      if(foco instanceof HTMLElement&&foco.matches('.inicio-redisenado :is(button,a,input,select,textarea,[tabindex])'))mantenerControlVisible(foco)
    }
    const observador=new ResizeObserver(actualizarAltura)
    observador.observe(barra);actualizarAltura()
    return()=>{observador.disconnect();document.documentElement.style.removeProperty('--inicio-nav-alto')}
  },[])
  useLayoutEffect(()=>{
    if(!yo||!entradaValidada||contextoCargando)return
    const estado=window.history.state
    const retorno=estado?.inicioPlato??(estado?.desde?.startsWith('/pedir')?regresoAPlato:null)
    const consumir=()=>{
      regresoAPlato=null
      const {inicioPlato:_consumido,...historial}=window.history.state??{}
      window.history.replaceState(historial,'')
    }
    if(!retorno||typeof retorno.id!=='string'){regresoAPlato=null;return}
    if(retorno.cuenta!==yo.socio.id){consumir();return}
    if(seguimientoPrioritario){
      // El historial puede restaurar el desplazamiento después de popstate.
      // Esperar el contexto actual y dos pintados da prioridad a su acción.
      let segundo=0
      const primero=requestAnimationFrame(()=>{segundo=requestAnimationFrame(()=>{
        const seccion=seguimientoElemento.current
        if(seccion){
          window.scrollTo({top:Math.max(0,window.scrollY+seccion.getBoundingClientRect().top-24),behavior:'instant'})
          seccion.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus({preventScroll:true})
        }
        consumir()
      })})
      return()=>{cancelAnimationFrame(primero);cancelAnimationFrame(segundo)}
    }
    const lista=listaDestacados.current
    const tarjeta=lista?.querySelector<HTMLButtonElement>(`[data-plato="${CSS.escape(retorno.id)}"]`)
    if(!lista||!tarjeta)return
    const marco=requestAnimationFrame(()=>{
      lista.scrollLeft=Number(retorno.x)||0
      window.scrollTo({top:Number(retorno.y)||0,behavior:'instant'})
      tarjeta.focus({preventScroll:true})
      consumir()
    })
    return()=>cancelAnimationFrame(marco)
  },[yo?.socio.id,entradaValidada,contextoCargando,seguimientoPrioritario])
  const abrirPlato=(id:string)=>{
    if(!yo)return
    regresoAPlato={id,cuenta:yo.socio.id,x:listaDestacados.current?.scrollLeft??0,y:window.scrollY}
    window.history.replaceState({...window.history.state,inicioPlato:regresoAPlato},'')
    navegar('/pedir?plato='+encodeURIComponent(id))
  }
  const premio=usePremio(),anterior=useRef<{cuenta:string;sellos:number}|null>(null)
  const vistaMedida=useRef(false)
  useEffect(()=>{if(yo&&!vistaMedida.current){vistaMedida.current=true;medir('vista')}},[yo])
  const [selloReciente,setSelloReciente]=useState(false)
  useEffect(()=>{
    let vigente=true
    void revalidar(true).then(()=>{if(vigente)setEntradaValidada(true)})
    return()=>{vigente=false}
  },[revalidar])
  useEffect(()=>actualizarConActividad(()=>Promise.all([refrescarCuenta(),refrescarContexto()]),60_000),[refrescarCuenta,refrescarContexto])
  useEffect(()=>{
    if(!yo)return
    const nuevo=anterior.current?.cuenta===yo.socio.id&&yo.sellos.length>anterior.current.sellos
    anterior.current={cuenta:yo.socio.id,sellos:yo.sellos.length};setSelloReciente(nuevo)
    if(nuevo){const reloj=setTimeout(()=>setSelloReciente(false),600);return()=>clearTimeout(reloj)}
  },[yo])
  useEffect(()=>{
    if(!hoja)return
    if(hoja==='pase')medir('pase')
    void refrescarCuenta()
    const intervalo=setInterval(()=>{if(document.visibilityState==='visible')void refrescarCuenta()},15_000)
    return()=>clearInterval(intervalo)
  },[hoja,refrescarCuenta])
  if(!yo)return <main id="contenido" tabIndex={-1} className="marco py-8 inicio-redisenado"><Tarjeta>{error?<EstadoVacio {...conSalida(VACIOS.sinConexion,()=>void refrescar())}/>:<p role="status">Cargando tu cuenta…</p>}</Tarjeta></main>
  const nivel=nivelDe(yo)!,miembro=yo.membresia?.numero
  const herramientas=<><Boton tono="contorno" icono="person" className="inicio-pase-rapido" onClick={()=>setHoja('pase')}>Mostrá tu pase</Boton><Boton tono="tenue" className="inicio-actualizar" aria-label="Actualizar Inicio" title={actualizando?'Actualizando Inicio…':'Actualizar Inicio'} cargando={actualizando} onClick={()=>void refrescar()}><svg className="inicio-refrescar-icono" aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11a8 8 0 1 0-2 6"/><path d="M20 4v7h-7"/></svg><span className="sr-only">Actualizar Inicio</span></Boton><span role="status" className="sr-only">{actualizando?'Actualizando los datos de Inicio…':''}</span></>
  const abrirPremio=()=>{setHoja('premio');void premio.emitir()}
  const seguimiento=<section className="inicio-seguimiento" ref={seguimientoElemento} aria-labelledby="seguimiento-titulo">
    <span className="inicio-seguimiento-icono" aria-hidden="true"><Icono nombre="event_seat" tam={24}/></span><div className="inicio-seguimiento-contenido"><div className="inicio-seguimiento-datos"><h2 id="seguimiento-titulo">Tu próxima visita</h2>
    {contextoError?<p role="alert">No pudimos comprobar pedidos, reservas y avisos. {contextoError}</p>
      :contexto?.pedido?<p><strong>{estados[contexto.pedido.estado]}</strong> · #{contexto.pedido.numero}</p>
      :contexto?.reserva?<p><strong>Tu próxima reserva</strong> · {fecha(contexto.reserva.cuando)} · {contexto.reserva.personas} personas</p>
      :contexto?.avisos?<p>Tenés {contexto.avisos} {contexto.avisos===1?'aviso sin leer':'avisos sin leer'}.</p>
      :contexto?<p>Sin pedidos en curso, reservas próximas ni avisos pendientes.</p>:<p role="status">Comprobando tu próxima visita…</p>}</div>
    {contextoError?<Boton tono="tenue" cargando={contextoCargando} onClick={()=>void refrescarContexto()}>Actualizar seguimiento</Boton>
      :contexto?.pedido?<Boton tono="tenue" onClick={()=>navegar('/compras')}>Seguir mi pedido</Boton>
      :contexto?.reserva?<Boton tono="tenue" onClick={()=>navegar('/compras')}>Ver mi reserva</Boton>
      :contexto?.avisos?<Boton tono="tenue" onClick={()=>navegar('/compras')}>Ver mis avisos</Boton>:null}</div>
  </section>
  const cosas:CosaDeLaCasa[]=[]
  if(catalogo&&!catalogoError){
    if(catalogo.bolsa.quedan>0)cosas.push({id:'cosecha',titulo:'Reserva de Cosecha',bajada:`${cordobas(catalogo.bolsa.precio)} · Consultá la entrega y los detalles antes de apartar.`,escasez:`${catalogo.bolsa.quedan} de ${catalogo.bolsa.total} disponibles`,iconoEscasez:'local_mall',cta:'Ver la cosecha',onClick:()=>{abrirOferta('cosecha');navegar('/tienda')}})
    for(const e of catalogo.experiencias.filter(e=>e.libres>0&&Date.parse(e.cuando)>horaCatalogo()).slice(0,2))cosas.push({id:e.id,titulo:e.nombre,bajada:`${fecha(e.cuando)} · ${cordobas(e.precio)}`,escasez:`${e.libres} de ${e.cupos} cupos disponibles`,iconoEscasez:'event_seat',cta:'Ver experiencia',onClick:()=>{abrirOferta('experiencia');navegar('/club')}})
  }
  return <>
    {destinoHerramientas&&createPortal(herramientas,destinoHerramientas)}
    <main id="contenido" tabIndex={-1} className="marco inicio-mejorado inicio-redisenado" onFocusCapture={event=>{if(event.target!==event.currentTarget)mantenerControlVisible(event.target)}}>
      {!destinoHerramientas&&<div className="inicio-encabezado">{herramientas}</div>}
      <div className="inicio-alertas">
        {error&&<EstadoCuenta mostrarCarga={false}/>}
        {catalogoError&&<EstadoCatalogo/>}
        <EstadoCupos/>
      </div>
      {seguimientoPrioritario&&seguimiento}
      <section className="inicio-invitacion" aria-labelledby="pausa-titulo"><div className="inicio-invitacion-foto"><img className="inicio-foto-cafe" src="/images/latte-logo-mesa-480.webp" srcSet="/images/latte-logo-mesa-240.webp 240w, /images/latte-logo-mesa-480.webp 480w, /images/latte-logo-mesa-960.webp 960w" sizes="(min-width: 900px) 40vw, 100vw" alt="Una taza de café con la marca de La Bella Lupita entre las manos" width={960} height={960} fetchPriority="high"/><img className="inicio-foto-mesa" src="/brand/v3/desayuno.webp" srcSet="/brand/v3/desayuno-480.webp 480w, /brand/v3/desayuno.webp 960w" sizes="60vw" alt="Sándwich de huevo y hojas verdes con papas sobre una bandeja de la casa" width={960} height={609} loading="lazy"/></div><div className="inicio-invitacion-texto"><div className="inicio-invitacion-mensaje"><h1 id="pausa-titulo">Una pausa rica</h1><Boton icono="arrow_forward" onClick={()=>navegar('/pedir')}>Explorar la carta</Boton></div></div></section>
      {destacados.length>0&&<section className="casa-antojos" aria-labelledby="antojos-titulo"><div className="casa-seccion-cabecera"><h2 id="antojos-titulo">De nuestra cocina</h2><span className="inicio-seccion-nota">Elegí tu próximo antojo</span></div><div className="casa-antojos-lista" ref={listaDestacados}>{destacados.map(plato=><button type="button" key={plato.id} data-plato={plato.id} className="casa-antojo" onFocus={mostrarPlatoEnfocado} onClick={()=>abrirPlato(plato.id)}>
        {plato.foto&&<span className="casa-antojo-foto"><img src={plato.foto.replace('-960.','-480.')} srcSet={`${plato.foto.replace('-960.','-240.')} 240w, ${plato.foto.replace('-960.','-480.')} ${plato.id==='risotto-gallo-pinto'?283:480}w, ${plato.foto} ${plato.id==='risotto-gallo-pinto'?567:960}w`} sizes="(min-width: 1200px) 384px, (min-width: 600px) 30vw, 45vw" alt="" width={480} height={480} loading="lazy"/></span>}
        <span className="casa-antojo-nombre">{plato.nombre}</span><span className="casa-antojo-precio">{cordobas(plato.precio)}<Icono nombre="arrow_forward" tam={19}/></span></button>)}</div></section>}
      <AccesosRapidos accesos={[{icono:'event_seat',texto:'Reservar mesa',onClick:()=>navegar('/reservar')},{icono:'storefront',texto:'Tienda de la finca',onClick:()=>navegar('/tienda')}]}/>
      {!seguimientoPrioritario&&seguimiento}
      <div className="inicio-resumen">
        <div className="inicio-cuenta-columna">
        <CabeceraSaludo nombre={yo.socio.nombre.trim().split(/\s+/)[0]} nivel={nivel.nombre} detalle={nivel.medido&&nivel.siguiente?`${puntos(nivel.faltan)} para ${nivel.siguiente}`:miembro?`Miembro #${String(miembro).padStart(3,'0')}`:'Desde tu primera visita'} alPerfil={()=>navegar('/perfil')}/>
        <section className="casa-cuenta" aria-labelledby="cuenta-titulo"><EnLaBanda.Provider value={true}>
          <div className="casa-cuenta-cabecera"><span><Icono nombre="workspace_premium" tam={18}/>{miembro?'MESA FUNDADORA':'CLUB LUPITA'}</span><Icono nombre="account_balance_wallet" tam={21}/></div>
          <h2 id="cuenta-titulo">Tu cuenta de casa</h2><p className="casa-cuenta-saldo" aria-label={saldoVisible?undefined:'Saldo oculto'}>{saldoVisible?cordobas(yo.saldo.total):'••••'}</p>
          <div className="casa-cuenta-acciones"><Boton icono="add" onClick={()=>setHoja('recarga')}>Recargar en caja</Boton></div>
          <p className="casa-cuenta-disponible">{yo.saldo.total===0?'Podés ver la carta, reservar mesa y mostrar tu pase.':'Saldo disponible para tus consumos en la casa'}</p>
          {saldoVisible&&yo.saldo.bono>0&&<p className="casa-cuenta-bono">{cordobas(yo.saldo.pagado)} tuyos + {cordobas(yo.saldo.bono)} de la casa</p>}
          <div className="inicio-cuenta-enlaces"><button type="button" className="inicio-movimientos" aria-pressed={!saldoVisible} onClick={cambiarSaldo}>{saldoVisible?'Ocultar saldo en Inicio':'Mostrar saldo en Inicio'}</button>
          <button type="button" className="inicio-movimientos" onClick={()=>navegar('/perfil')}>Ver movimientos <Icono nombre="arrow_forward" tam={16}/></button></div>
        </EnLaBanda.Provider></section>
      <div className="inicio-actualizacion"><EstadoCuenta detalle mostrarCarga={false}/></div>
        </div>
      <div className="inicio-club-resumen">
        <section className="casa-fidelidad" aria-labelledby="tanda-titulo">
          {yo.premiosPendientes>0&&<div className="casa-premio-listo"><p><Icono nombre="redeem" tam={18}/>{yo.premiosPendientes} {yo.premiosPendientes===1?'bebida de cortesía pendiente':'bebidas de cortesía pendientes'}</p><Boton ancho onClick={abrirPremio}>Mostrar mi premio</Boton></div>}
          <div className="casa-fidelidad-titulo"><div><p className="inicio-fidelidad-etiqueta">EL GUSTO DE VOLVER</p><h2 id="tanda-titulo">{yo.premiosPendientes>0?'Tu nueva tanda de café':'Tu tanda de café'}</h2><p>Un sello por cada compra que califique</p></div><span className="casa-fidelidad-contador">{yo.sellos.length}<small>/ 9</small></span></div>
          <div className="inicio-sellos"><TarjetaDeSellos ganados={yo.sellos.length} nuevaTanda={yo.premiosPendientes>0} ultimoReciente={selloReciente}/></div>
          <Boton tono="tenue" ancho onClick={()=>navegar('/club')}>Ver reglas y beneficios</Boton>
        </section>
      {yo.membresia&&!yo.bolsaDelMes&&<button type="button" className="casa-bolsa-lista" onClick={()=>navegar('/club')}><Icono nombre="local_mall" tam={20}/><span>Tu beneficio de bolsa está disponible<small>Consultá las condiciones y generá el código en Mi Club.</small></span><Icono nombre="chevron_right" tam={18}/></button>}
      </div>
      </div>
      <PasaEnLaCasa cosas={cosas}/><footer className="casa-pie"><span>La Bella Lupita · Bistró & Café<small>De nuestra finca, con cariño</small></span><Boton tono="tenue" onClick={()=>navegar('/conoce-tu-club')}>Conocé tu club <Icono nombre="arrow_forward" tam={16}/></Boton></footer>
    </main>
    <Hoja abierta={hoja!==null} alCerrar={()=>setHoja(null)} titulo={hoja==='premio'?'Tu bebida de cortesía':hoja==='pase'?'Tu pase de la casa':'Recargar en caja'} eyebrow="En la casa">
      {hoja==='premio'?<PremioPresentado premio={premio} pendientes={yo.premiosPendientes}/>:hoja==='pase'?<div className="space-y-4">
        <PaseSocio nombre={yo.socio.nombre} fundador={!!miembro} identificador={yo.socio.codigo_club??'Actualizá tu cuenta'} numero={miembro}/>
        <p>Mostrá el código del pase para que el personal encuentre tu cuenta. El pase identifica tu cuenta; el personal confirma cada operación.</p>
        {yo.membresia&&<p>Para tu bebida del día o bolsa de 250 g, generá el código del beneficio en Mi Club.</p>}
        {yo.premiosPendientes>0&&<Boton ancho onClick={abrirPremio}>Mostrar mi premio</Boton>}
        <EstadoCuenta detalle/><Boton tono="tenue" cargando={cargando} onClick={()=>void refrescarCuenta()}>Actualizar mi cuenta</Boton>
      </div>:<div className="space-y-4"><p>Mostrá tu pase en caja y decí cuánto querés agregar. La recarga se paga en el mostrador, con efectivo o tarjeta.</p><p>Por recarga: de {cordobas(RECARGA.minimo)} a {cordobas(RECARGA.maximo)}. El personal confirma el importe y cualquier bono antes de cobrar.</p><p>Cuando caja confirme, actualizá para consultar tu saldo.</p><p className="t-seccion">Saldo: {cordobas(yo.saldo.total)}</p><Boton ancho onClick={()=>setHoja('pase')}>Enseñar mi pase</Boton><EstadoCuenta detalle/><Boton tono="tenue" ancho cargando={cargando} onClick={()=>void refrescarCuenta()}>Actualizar mi saldo</Boton></div>}
    </Hoja>
  </>
}
