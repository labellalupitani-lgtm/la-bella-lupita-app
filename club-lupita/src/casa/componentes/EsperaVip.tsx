import {useState} from 'react'
import {Boton} from './Base'
import {Tarjeta} from './Superficies'
import {operacion} from '../operacion'
import {Aviso,fechaHora,useAccion,useLectura} from '../equipo/comun'
import {diaReserva} from '../../compartido/reservas'

export type SolicitudVip={id:string;cuando:string;horas:number;personas:number;creada:string;ofrecida:string|null;version:number;nombre?:string;codigo_club?:string;miembro?:boolean}
export function EsperaVip(){
  const l=useLectura<{activa:boolean;solicitudes:SolicitudVip[]}>('/club/vip-espera',''),a=useAccion()
  const [dia,setDia]=useState(diaReserva(1)),[hora,setHora]=useState('10'),[horas,setHoras]=useState(1),[personas,setPersonas]=useState(2),[acepto,setAcepto]=useState(false)
  return <Tarjeta className="cuenta-espera-vip"><h2 className="t-seccion">Lista de espera del Salón VIP</h2><p>Solicitá una fecha y un horario en Managua. Esto no confirma una reserva ni cobra un anticipo. Hasta tres solicitudes abiertas.</p>
    <p>Para un mismo horario, duración y grupo, tienen preferencia los miembros vigentes; dentro de cada grupo se respeta el orden de solicitud. La casa confirma disponibilidad sin desplazar reservas existentes.</p>
    <Aviso error={l.error||a.error} mensaje={a.mensaje}/>
    {l.datos?.activa&&<form className="space-y-3 mt-4" onSubmit={e=>{e.preventDefault();void a.ejecutar(async()=>{await operacion('/club/vip-espera',{cuando:dia+'T'+hora.padStart(2,'0')+':00:00-06:00',horas,personas,acepto});setAcepto(false);await l.refrescar()},'Solicitud registrada. Podés consultar su estado aquí.')}}>
      <label className="block">Fecha<input className="block min-h-12 w-full" type="date" min={diaReserva()} max={diaReserva(90)} required value={dia} onChange={e=>setDia(e.target.value)}/></label>
      <div className="grid grid-cols-2 gap-3"><label>Hora en Managua<select className="block min-h-12 w-full" value={hora} onChange={e=>setHora(e.target.value)}>{Array.from({length:24},(_,h)=><option key={h} value={String(h)}>{String(h).padStart(2,'0')}:00</option>)}</select></label><label>Duración (horas)<input className="block min-h-12 w-full" type="number" min={1} max={6} required value={horas} onChange={e=>setHoras(Number(e.target.value))}/></label></div>
      <label className="block">Personas<input className="block min-h-12 w-full" type="number" min={1} max={12} required value={personas} onChange={e=>setPersonas(Number(e.target.value))}/></label>
      <label className="flex gap-3 min-h-12 items-center"><input type="checkbox" checked={acepto} onChange={e=>setAcepto(e.target.checked)}/>Acepto que la casa gestione esta solicitud. La espera no garantiza mesa.</label>
      <Boton type="submit" cargando={a.ocupado} disabled={!acepto}>Solicitar espera VIP</Boton>
    </form>}
    <Boton tono="tenue" className="mt-3" disabled={a.ocupado} onClick={()=>void l.refrescar()}>Actualizar solicitudes VIP</Boton>
    <ul className="space-y-3">{l.datos?.solicitudes.map(s=><li key={s.id}><p>{fechaHora(s.cuando)} · {s.horas} h · {s.personas} personas. {s.ofrecida?'La casa registró la gestión de una oferta; confirmá con el equipo.':'Pendiente de disponibilidad.'}</p><Boton tono="claro" disabled={a.ocupado} onClick={()=>void a.ejecutar(async()=>{await operacion('/club/vip-espera/'+s.id+'/cancelar',{});await l.refrescar()},'Solicitud VIP cancelada. No se modificó ninguna reserva.')}>Cancelar solicitud del {fechaHora(s.cuando)}</Boton></li>)}</ul>
  </Tarjeta>
}
