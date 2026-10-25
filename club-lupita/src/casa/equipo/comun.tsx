import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Boton } from '../componentes/Base'
import { operacion } from '../operacion'

export const fechaHora=(s:string)=>new Intl.DateTimeFormat('es-NI',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Managua'}).format(new Date(s))
export const errorTexto=(e:unknown)=>e instanceof TypeError?'No pudimos conectar. Revisá la conexión y volvé a intentar.':e instanceof Error?e.message:'No pudimos completar la operación.'

export function useLectura<T>(ruta:string,token:string) {
  const [datos,setDatos]=useState<T>(),[error,setError]=useState(''),[cargando,setCargando]=useState(true),[hora,setHora]=useState<Date>()
  const ejecutar=useRef<()=>Promise<void>>(async()=>{})
  useEffect(()=>{
    let vivo=true,pendiente=false
    const control=new AbortController()
    setDatos(undefined);setError('');setHora(undefined);setCargando(true)
    const cargar=async()=>{
      if(pendiente||!vivo)return
      pendiente=true;setCargando(true)
      try {const r=await operacion<T>(ruta,undefined,token,{},control.signal);if(vivo){setDatos(r);setError('');setHora(new Date())}}
      catch(e){if(vivo)setError(errorTexto(e))}
      finally{pendiente=false;if(vivo)setCargando(false)}
    }
    ejecutar.current=cargar
    void cargar()
    const reanudar=()=>{if(document.visibilityState==='visible')void cargar()}
    const intervalo=setInterval(reanudar,30000)
    window.addEventListener('online',reanudar);window.addEventListener('focus',reanudar);document.addEventListener('visibilitychange',reanudar)
    return()=>{vivo=false;control.abort();clearInterval(intervalo);window.removeEventListener('online',reanudar);window.removeEventListener('focus',reanudar);document.removeEventListener('visibilitychange',reanudar)}
  },[ruta,token])
  const refrescar=useCallback(()=>ejecutar.current(),[])
  return {datos,error,cargando,hora,refrescar}
}

export function useAccion(){
  const [error,fallar]=useState(''),[mensaje,informar]=useState(''),[ocupado,ocupar]=useState(false)
  const candado=useRef(false)
  const ejecutar=async(trabajo:()=>Promise<void>,exito='Operación registrada.')=>{
    if(candado.current)return false
    candado.current=true;ocupar(true);fallar('');informar('')
    try{await trabajo();informar(exito);return true}catch(e){fallar(errorTexto(e));return false}finally{candado.current=false;ocupar(false)}
  }
  return {error,mensaje,ocupado,ejecutar,fallar,informar}
}
export function Aviso({error,mensaje,flotante=false}:{error?:string;mensaje?:string;flotante?:boolean}){
  if(!error&&!mensaje)return null
  return <div className={flotante?'equipo-notificacion':undefined}>{error&&<p className="equipo-aviso equipo-aviso-error" role="alert">{error}</p>}{mensaje&&<p className="equipo-aviso" role="status">{mensaje}</p>}</div>
}
export function Sincronizacion({cargando,hora,error,refrescar}:{cargando:boolean;hora?:Date;error:string;refrescar:()=>Promise<void>}){
  return <div className="equipo-sincronizacion" aria-busy={cargando}><span className="equipo-sincronizacion-texto"><strong>{error?'Información sin actualizar':cargando?'Actualizando información…':hora?'Actualizado '+hora.toLocaleTimeString('es-NI',{hour:'2-digit',minute:'2-digit',timeZone:'America/Managua'}):'Consultando información…'}</strong><small>Actualización automática cada 30 s</small></span><Boton tono="claro" compacto cargando={cargando} onClick={()=>void refrescar()}>Actualizar</Boton></div>
}
export type Pagina<T>={filas:T[];total:number;pagina:number;tamano:number;actualizado:string}
export type ContextoLista<T>={filas:T[];refrescar:()=>Promise<void>;total:number;cargando:boolean;actualizado:string}
export function Lista<T>({tipo,token,estados,inicial,conFecha=false,buscar='Nombre o referencia',children}:{tipo:string;token:string;estados:[string,string][];inicial:string;conFecha?:boolean;buscar?:string;children:(ctx:ContextoLista<T>)=>ReactNode}){
  const [pagina,setPagina]=useState(0),[estado,setEstado]=useState(inicial),[q,setQ]=useState(''),[busqueda,setBusqueda]=useState(''),[fecha,setFecha]=useState('')
  const buscador=useRef<HTMLInputElement>(null)
  const parametros=new URLSearchParams({pagina:String(pagina),estado,q,fecha})
  const lectura=useLectura<Pagina<T>>('/operacion/listas/'+tipo+'?'+parametros,token)
  const {datos,cargando,error}=lectura
  useEffect(()=>{if(datos&&pagina>0&&pagina*20>=datos.total)setPagina(Math.max(0,Math.ceil(datos.total/20)-1))},[datos,pagina])
  return <>
    <form className="equipo-filtros" role="search" onSubmit={e=>{e.preventDefault();setQ(busqueda.trim());setPagina(0)}}>
      <label>Buscar<input ref={buscador} type="search" maxLength={80} placeholder={buscar} value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></label>
      {estados.length>1&&<label>Estado<select value={estado} onChange={e=>{setEstado(e.target.value);setPagina(0)}}>{estados.map(([id,n])=><option key={id} value={id}>{n}</option>)}</select></label>}
      {conFecha&&<label>Fecha<input type="date" value={fecha} onChange={e=>{setFecha(e.target.value);setPagina(0)}}/></label>}
      <Boton type="submit" tono="claro">Buscar</Boton>
      {(q||fecha||estado!==inicial)&&<Boton tono="tenue" onClick={()=>{setQ('');setBusqueda('');setFecha('');setEstado(inicial);setPagina(0);buscador.current?.focus()}}>Limpiar filtros</Boton>}
    </form>
    <Sincronizacion {...lectura}/><Aviso error={error}/>
    {!datos&&cargando&&<p role="status" className="equipo-vacio">Cargando registros…</p>}
    {!datos&&!cargando&&error&&<p className="equipo-vacio">No pudimos consultar esta sección. Usá Actualizar para reintentar.</p>}
    {datos&&<>
      <div className="equipo-paginacion"><p role="status">{datos.total===0?'Sin resultados':`${pagina*20+1}–${Math.min((pagina+1)*20,datos.total)} de ${datos.total} registros`}</p><nav aria-label="Páginas de resultados"><Boton tono="claro" compacto disabled={cargando||pagina===0} onClick={()=>setPagina(p=>p-1)}>Anterior</Boton><span>Página {pagina+1} de {Math.max(1,Math.ceil(datos.total/20))}</span><Boton tono="claro" compacto disabled={cargando||(pagina+1)*20>=datos.total} onClick={()=>setPagina(p=>p+1)}>Siguiente</Boton></nav></div>
      {datos.filas.length===0&&<p className="equipo-vacio">No hay registros para estos filtros.</p>}
      {children({filas:datos.filas,refrescar:lectura.refrescar,total:datos.total,cargando,actualizado:datos.actualizado})}
    </>}
  </>
}
export function Estado({valor}:{valor:string}){return <span className={'equipo-estado equipo-estado-'+valor}>{valor.replaceAll('_',' ')}</span>}
