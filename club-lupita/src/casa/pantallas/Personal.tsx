import { useCallback, useEffect, useRef, useState } from 'react'
import { Boton } from '../componentes/Base'
import { operacion, TOKEN_PERSONAL, ErrorOperacion, type PersonalIdentidad } from '../operacion'
import { Hoja } from '../componentes/Superficies'
import { Acceso, MarcoAcceso, VerificarMfa, ConfigurarMfa, CambiarClave, CodigosGuardados, Revalidar, type ResultadoAcceso } from '../equipo/Acceso'
import { Aviso, useAccion } from '../equipo/comun'
import { PedidosEquipo } from '../equipo/Pedidos'
import { TiendaEquipo } from '../equipo/Tienda'
import { ClubEquipo } from '../equipo/Club'
import { CajaEquipo } from '../equipo/Caja'
import { AgendaEquipo, AtencionPersonal, EntregasEquipo, InformesEquipo, ResumenEquipo } from '../equipo/Lecturas'
import { Equipo } from '../equipo/Equipo'
import { ClientesEquipo } from '../equipo/Clientes'
import { SeguridadEquipo } from '../equipo/Seguridad'
import '../estilos/equipo.css'
import '../estilos/redisenio-equipo.css'

const secciones=[
  {id:'resumen',nombre:'Resumen',detalle:'Lo que necesita atención'},
  {id:'pedidos',nombre:'Pedidos',detalle:'Preparación e historial'},
  {id:'caja',nombre:'Caja',detalle:'Clientes, recargas y canjes'},
  {id:'club',nombre:'Mi Club',detalle:'Condiciones, experiencias, espera y medición'},
  {id:'tienda',nombre:'Tienda',detalle:'Lotes, condiciones, bolsas y devoluciones'},
  {id:'entregas',nombre:'Entregas',detalle:'Bolsas y asistencias'},
  {id:'agenda',nombre:'Agenda',detalle:'Mesas y reservas'},
  {id:'atencion',nombre:'Atención',detalle:'Solicitudes de clientes'},
  {id:'informes',nombre:'Informes',detalle:'Cifras y actividad'},
  {id:'clientes',nombre:'Clientes',detalle:'Directorio y fichas de las cuentas registradas'},
  {id:'equipo',nombre:'Equipo y permisos',detalle:'Perfiles y accesos individuales'},
  {id:'seguridad',nombre:'Cuenta y seguridad',detalle:'Tu acceso y tu clave'},
]
function seccionURL(){return new URLSearchParams(location.search).get('seccion')??''}

export function Personal(){
  useEffect(()=>{document.title='Acceso del equipo · La Bella Lupita'},[])
  const [yo,setYo]=useState<PersonalIdentidad>(),[cargando,setCargando]=useState(true),[error,setError]=useState(''),[aviso,setAviso]=useState(''),[revalidar,setRevalidar]=useState(false),[codigos,setCodigos]=useState<string[]>(),[forzarBloqueo,setForzarBloqueo]=useState(false)
  const canal=useRef<BroadcastChannel>(),epoca=useRef(0),a=useAccion()
  const recargar=useCallback(async()=>{const n=++epoca.current;try{const r=await operacion<PersonalIdentidad>('/personal/yo',undefined,TOKEN_PERSONAL);if(n===epoca.current){setYo(r);setError('')}}catch(e){if(n!==epoca.current)return;if(e instanceof ErrorOperacion&&[401,403].includes(e.status)){setYo(undefined);setError('')}else setError(e instanceof Error?e.message:'No pudimos comprobar tu sesión.')}finally{if(n===epoca.current)setCargando(false)}},[])
  const anunciar=()=>canal.current?.postMessage('actualizar')
  function terminado(r:ResultadoAcceso){setRevalidar(false);setForzarBloqueo(false);anunciar();if(r.codigos?.length){setCodigos(r.codigos);setYo(undefined);return}if(r.salir)setAviso('Contraseña actualizada. Ingresá nuevamente.');void recargar()}
  useEffect(()=>{try{sessionStorage.removeItem('club-lupita:personal')}catch{};void recargar();const c=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('lupita-equipo'):undefined;canal.current=c;if(c)c.onmessage=()=>{setYo(undefined);setCodigos(undefined);setCargando(true);void recargar()};const caducada=(e:Event)=>{if((e as CustomEvent).detail!==TOKEN_PERSONAL)return;epoca.current++;setYo(undefined);setCodigos(undefined);setCargando(false);setAviso('Tu sesión terminó. Ingresá con tu acceso vigente.')};const actualizar=()=>void recargar();const confirmar=()=>setRevalidar(true);window.addEventListener('personal:sesion-caducada',caducada);window.addEventListener('personal:actualizar',actualizar);window.addEventListener('personal:revalidar',confirmar);return()=>{c?.close();window.removeEventListener('personal:sesion-caducada',caducada);window.removeEventListener('personal:actualizar',actualizar);window.removeEventListener('personal:revalidar',confirmar)}},[recargar])
  const salir=()=>void a.ejecutar(async()=>{await operacion('/personal/salir',{},TOKEN_PERSONAL);epoca.current++;setYo(undefined);setCodigos(undefined);setRevalidar(false);setForzarBloqueo(false);setAviso('Sesión cerrada. Ya puede ingresar otra persona.');anunciar()},'')
  const bloquear=useCallback(()=>{setForzarBloqueo(true);void operacion('/personal/bloquear',{},TOKEN_PERSONAL).then(()=>canal.current?.postMessage('actualizar')).catch(()=>setError('La pantalla está bloqueada. No pudimos confirmar el bloqueo remoto; revisá la conexión.'))},[])
  useEffect(()=>{
    if(!yo||yo.fase!=='completa'||yo.bloqueada||forzarBloqueo||codigos)return
    let ultima=Date.now(),enviada=ultima,pendiente=false,termino=false
    const limite=(yo.compartido?5:30)*60000
    const actividad=(e:Event)=>{if(!e.isTrusted)return;if(Date.now()-ultima>=limite){if(!termino){termino=true;bloquear()}return}ultima=Date.now()}
    const revisar=()=>{if(termino)return;if(Date.now()-ultima>=limite){termino=true;bloquear();return}if(!pendiente&&ultima>enviada&&Date.now()-enviada>=45000){pendiente=true;const momento=ultima;void operacion('/personal/actividad',{},TOKEN_PERSONAL).then(()=>{enviada=momento}).catch(()=>{}).finally(()=>{pendiente=false})}}
    const intervalo=setInterval(revisar,1000),consultar=setInterval(()=>{if(document.visibilityState==='visible')void recargar()},30000)
    for(const tipo of ['pointerdown','keydown','touchstart','scroll'])window.addEventListener(tipo,actividad,{passive:true})
    document.addEventListener('visibilitychange',revisar)
    return()=>{clearInterval(intervalo);clearInterval(consultar);for(const tipo of ['pointerdown','keydown','touchstart','scroll'])window.removeEventListener(tipo,actividad);document.removeEventListener('visibilitychange',revisar)}
  },[yo?.sesion,yo?.fase,yo?.bloqueada,yo?.compartido,forzarBloqueo,!!codigos,bloquear,recargar])
  if(codigos)return <div className="equipo-app"><MarcoAcceso><CodigosGuardados codigos={codigos} continuar={()=>{setCodigos(undefined);void recargar()}}/></MarcoAcceso></div>
  if(!yo)return <div className="equipo-app">{cargando||error?<MarcoAcceso><h2>Comprobando tu acceso</h2><Aviso error={error}/><Boton onClick={()=>void recargar()} cargando={cargando}>Reintentar</Boton></MarcoAcceso>:<Acceso aviso={aviso} alEntrar={terminado}/>}</div>
  if(location.hash.startsWith('#activar=')&&yo.fase==='completa')return <div className="equipo-app"><MarcoAcceso><h2>Invitación individual</h2><p>Hay una sesión abierta como {yo.nombre}. Cerrala antes de activar el acceso de otra persona.</p><Aviso error={a.error}/><Boton cargando={a.ocupado} onClick={salir}>Cerrar sesión para activar</Boton></MarcoAcceso></div>
  const bloqueada=yo.bloqueada||forzarBloqueo
  const contenido=yo.fase!=='completa'||bloqueada?<MarcoAcceso><p className="t-eyebrow">{yo.demo?'CAPACITACIÓN':'OPERACIÓN REAL'} · {yo.nombre}</p>{bloqueada?<><h2>Sesión bloqueada</h2><Revalidar mfa={yo.mfa} continuar={()=>{setForzarBloqueo(false);anunciar();void recargar()}}/></>:yo.fase==='mfa'?<VerificarMfa alEntrar={terminado}/>:yo.fase==='configurar'?<ConfigurarMfa alEntrar={terminado}/>:<CambiarClave obligatoria alEntrar={terminado}/>}<Aviso error={a.error||error}/><Boton tono="tenue" cargando={a.ocupado} onClick={salir}>Cerrar sesión / cambiar de persona</Boton></MarcoAcceso>:<SesionEquipo key={yo.sesion} token={TOKEN_PERSONAL} yo={yo} salir={salir} bloquear={bloquear} terminar={terminado} error={error||a.error}/>
  return <div className="equipo-app">{contenido}<Hoja abierta={revalidar&&!bloqueada} alCerrar={()=>setRevalidar(false)} titulo="Confirmar identidad"><Revalidar mfa={yo.mfa} continuar={()=>{setRevalidar(false);setAviso('Identidad confirmada. Volvé a realizar la acción.');void recargar()}}/><p className="equipo-nota">Después de confirmar, volvé a realizar la acción que solicitaste.</p></Hoja></div>
}
function SesionEquipo({token,yo,salir,bloquear,terminar,error}:{token:string;yo:PersonalIdentidad;salir:()=>void;bloquear:()=>void;terminar:(r:ResultadoAcceso)=>void;error:string}){
  const [seccion,setSeccion]=useState(seccionURL),[conectado,setConectado]=useState(navigator.onLine)
  const [menuAbierto,setMenuAbierto]=useState(false)
  const botonMenu=useRef<HTMLButtonElement>(null)
  useEffect(()=>{const pop=()=>setSeccion(seccionURL());const red=()=>setConectado(navigator.onLine);window.addEventListener('popstate',pop);window.addEventListener('online',red);window.addEventListener('offline',red);return()=>{window.removeEventListener('popstate',pop);window.removeEventListener('online',red);window.removeEventListener('offline',red)}},[])
  const permitidas=secciones.filter(s=>s.id==='seguridad'||(!yo?.requiereCambio&&((yo?.permiso==='encargado'||yo?.permiso==='propietario')||(yo?.permiso==='cocina'?s.id==='pedidos':!['resumen','informes','equipo','clientes','club'].includes(s.id)))))
  const inicial=yo?.requiereCambio?'seguridad':(yo?.permiso==='encargado'||yo?.permiso==='propietario')?'resumen':yo?.permiso==='cocina'?'pedidos':'caja'
  const actual=permitidas.find(s=>s.id===seccion)?.id??inicial
  const direccion=(s:string)=>'/personal?'+(yo.demo?'entorno=capacitacion&':'')+'seccion='+s
  useEffect(()=>{if(yo&&actual!==seccion){history.replaceState({},'',direccion(actual));setSeccion(actual)}},[yo,actual,seccion])
  function navegar(s:string){history.pushState({},'',direccion(s));setSeccion(s);setMenuAbierto(false);window.scrollTo({top:0,behavior:'instant'});requestAnimationFrame(()=>document.getElementById('contenido-equipo')?.focus({preventScroll:true}))}
  const titulo=secciones.find(s=>s.id===actual)!
  useEffect(()=>{document.title=titulo.nombre+' · Equipo · La Bella Lupita';return()=>{document.title='Acceso del equipo · La Bella Lupita'}},[titulo.nombre])
  const grupos=[{nombre:'Servicio',ids:['resumen','pedidos','caja','entregas','agenda','atencion']},{nombre:'Gestión',ids:['club','tienda','informes','clientes','equipo']},{nombre:'Tu cuenta',ids:['seguridad']}]
  return <><a className="equipo-salto" href="#contenido-equipo">Ir al contenido</a><aside className="equipo-lateral"><div className="equipo-marca-fila"><a href={yo.demo?"/personal?entorno=capacitacion":"/personal"} className="equipo-marca"><img src="/brand/v3/logo-original.png" width={180} height={86} alt="La Bella Lupita"/></a><button ref={botonMenu} className="equipo-menu-control" type="button" aria-controls="equipo-navegacion" aria-expanded={menuAbierto} onClick={()=>setMenuAbierto(v=>!v)}><span>Secciones</span><strong>{titulo.nombre}</strong><span className="equipo-menu-flecha" aria-hidden="true"/></button></div><p className="equipo-nav-rotulo">OPERACIÓN DE LA CASA</p><nav id="equipo-navegacion" className={menuAbierto?'equipo-menu-abierto':undefined} aria-label="Secciones del equipo" onKeyDown={e=>{if(e.key==='Escape'&&menuAbierto){setMenuAbierto(false);botonMenu.current?.focus()}}}>{grupos.map(g=>{const visibles=permitidas.filter(s=>g.ids.includes(s.id));return visibles.length>0&&<div className="equipo-nav-grupo" key={g.nombre}><p>{g.nombre}</p>{visibles.map(s=><a key={s.id} href={direccion(s.id)} aria-current={actual===s.id?'page':undefined} onClick={e=>{if(e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();navegar(s.id)}}}><span>{s.nombre}</span><span className="equipo-nav-direccion" aria-hidden="true">↗</span></a>)}</div>})}</nav><div className="equipo-lateral-pie"><p>{yo.nombre}</p><span>{yo.permiso}</span><Boton tono="claro" onClick={bloquear}>Bloquear</Boton><Boton tono="tenue" onClick={salir}>Cerrar sesión / cambiar persona</Boton></div></aside>
    <div className="equipo-trabajo"><header className={'equipo-barra '+(yo.demo?'equipo-barra-prueba':'equipo-barra-real')}><div><strong>{yo.demo?'Modo de prueba':'Operación real'}</strong><span>{yo.demo?'Datos de demostración':'Datos reales del negocio'}</span></div><div className="equipo-conexion"><span role="status">{conectado?(error?'Acceso sin verificar':'Conectado'):'Sin conexión'}</span><span>{yo.nombre} · {yo.permiso}</span><button className="equipo-salir-movil" onClick={bloquear}>Bloquear</button><button className="equipo-salir-movil" onClick={salir}>Cerrar sesión</button></div></header>
      <main id="contenido-equipo" tabIndex={-1} className="equipo-contenido" data-seccion={actual}><div className="equipo-titulo"><div><p className="t-eyebrow">{new Intl.DateTimeFormat('es-NI',{weekday:'long',day:'numeric',month:'long',timeZone:'America/Managua'}).format(new Date())}</p><h1>{titulo.nombre}</h1><p>{titulo.detalle}</p></div><span className="equipo-turno">La Bella Lupita · equipo</span></div>
        {!conectado&&<Aviso error="Sin conexión. Los datos pueden estar desactualizados; recuperaremos las consultas cuando vuelva la conexión."/>}<Aviso error={error}/>
        <div key={actual} className="equipo-modulo">{actual==='resumen'?<ResumenEquipo token={token} navegar={navegar}/>:actual==='pedidos'?<PedidosEquipo token={token} administrar={yo.permiso==='propietario'||yo.permiso==='encargado'} cocina={yo.permiso==='cocina'}/>:actual==='caja'?<CajaEquipo token={token} administrar={yo.permiso==='propietario'||yo.permiso==='encargado'}/>:actual==='tienda'?<TiendaEquipo token={token} propietario={yo.permiso==='propietario'} administrar={yo.permiso==='propietario'||yo.permiso==='encargado'}/>:actual==='club'?<ClubEquipo token={token} propietario={yo.permiso==='propietario'}/>:actual==='entregas'?<EntregasEquipo token={token}/>:actual==='agenda'?<AgendaEquipo token={token} administrar={yo.permiso==='propietario'||yo.permiso==='encargado'}/>:actual==='atencion'?<AtencionPersonal token={token}/>:actual==='informes'?<InformesEquipo token={token}/>:actual==='clientes'?<ClientesEquipo token={token} propietario={yo.permiso==='propietario'}/>:actual==='seguridad'?<SeguridadEquipo token={token} yo={yo} terminar={terminar}/>:<Equipo token={token} yo={yo}/>}</div>
      </main></div></>
}

