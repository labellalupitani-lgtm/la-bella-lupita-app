import { useState } from 'react'
import { Boton } from '../componentes/Base'
import { Hoja } from '../componentes/Superficies'
import { operacion, type PersonalIdentidad } from '../operacion'
import { Aviso, fechaHora, useAccion, useLectura } from './comun'
import { CambiarClave, ConfigurarMfa, CodigosGuardados, type ResultadoAcceso } from './Acceso'

export function SeguridadEquipo({token,yo,terminar}:{token:string;yo:PersonalIdentidad;terminar:(r:ResultadoAcceso)=>void}){
  const sesiones=useLectura<{sesiones:{id:string;dispositivo:string;compartido:boolean;creada:string;actividad:string;vence:string}[]}>('/personal/sesiones',token)
  const eventos=useLectura<{eventos:{id:string;cuando:string;accion:string;responsable:string}[]}>('/personal/eventos',token)
  const [codigos,setCodigos]=useState<string[]>(),[renovar,setRenovar]=useState(false),a=useAccion()
  return <><section className="equipo-panel"><h2>{yo.nombre}</h2><p>{yo.usuario} · {yo.permiso}</p><p>Autenticador: {yo.mfa?'activado':'sin configurar'}. Dispositivo: {yo.dispositivo}.</p><Boton tono="claro" onClick={()=>window.dispatchEvent(new Event('personal:revalidar'))}>Confirmar mi identidad</Boton><p className="equipo-nota">Los cambios sensibles requieren una confirmación de los últimos cinco minutos.</p></section>
    <section className="equipo-panel"><CambiarClave alEntrar={terminar}/></section>
    {!yo.mfa&&<section className="equipo-panel"><ConfigurarMfa alEntrar={terminar}/></section>}
    <section className="equipo-panel"><h2>Recuperación</h2><p>Guardá tus códigos fuera de un dispositivo compartido. Renovarlos invalida los anteriores.</p><Boton tono="claro" onClick={()=>setRenovar(true)}>Renovar códigos de recuperación</Boton></section>
    <Hoja abierta={renovar} alCerrar={()=>setRenovar(false)} titulo="Renovar códigos"><p>Los códigos anteriores dejarán de servir. Guardá los nuevos al terminar.</p><Aviso error={a.error}/><Boton cargando={a.ocupado} onClick={()=>void a.ejecutar(async()=>{const r=await operacion<{codigos:string[]}>('/personal/recuperacion/codigos',{},token);setCodigos(r.codigos);setRenovar(false)},'')}>Invalidar anteriores y generar nuevos</Boton></Hoja>
    <Hoja abierta={!!codigos} alCerrar={()=>{}} titulo="Códigos nuevos">{codigos&&<CodigosGuardados codigos={codigos} continuar={()=>setCodigos(undefined)}/>}</Hoja>
    <section className="equipo-panel"><h2>Mis sesiones</h2><Aviso error={sesiones.error||a.error} mensaje={a.mensaje}/><div className="equipo-registros">{sesiones.datos?.sesiones.map(s=><article className="equipo-registro" key={s.id}><div><h3>{s.dispositivo}{s.id===yo.sesion?' · Esta sesión':''}</h3><p>{s.compartido?'Equipo compartido':'Dispositivo personal'} · Última actividad: {fechaHora(s.actividad)}</p><p className="equipo-nota">Vence: {fechaHora(s.vence)}</p></div><Boton tono="claro" cargando={a.ocupado} onClick={()=>void a.ejecutar(async()=>{const r=await operacion<ResultadoAcceso>('/personal/sesiones/'+s.id+'/revocar',{},token);if(r.salir)terminar(r);else await sesiones.refrescar()},'Sesión cerrada.')}>Cerrar esta sesión</Boton></article>)}</div><Boton tono="tenue" onClick={()=>void a.ejecutar(async()=>terminar(await operacion('/personal/sesiones/todas/revocar',{},token)),'')}>Cerrar todas mis sesiones</Boton></section>
    <section className="equipo-panel"><h2>Actividad de seguridad</h2><p>{yo.permiso==='propietario'?'Últimos eventos de acceso del negocio.':'Últimos eventos de tu cuenta.'}</p><Aviso error={eventos.error}/><ul className="equipo-eventos">{eventos.datos?.eventos.map(e=><li key={e.id}><strong>{e.accion.replaceAll('_',' ')}</strong> · {e.responsable}<br/><time dateTime={e.cuando}>{fechaHora(e.cuando)}</time></li>)}</ul></section></>
}
