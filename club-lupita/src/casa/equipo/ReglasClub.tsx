import {useState} from 'react'
import {Boton} from '../componentes/Base'
import {operacion} from '../operacion'
import {Aviso,fechaHora,useAccion,useLectura} from './comun'
import {REGLAS_CLUB} from '../../compartido/reglas-club'
import type {SolicitudVip} from '../componentes/EsperaVip'

export function ReglasClubEquipo({token,propietario,alActualizar}:{token:string;propietario:boolean;alActualizar:()=>Promise<void>}){
  const l=useLectura<{activa:boolean;config:{version:number;validacion_operativa:string|null}}>('/operacion/reglas-club',token),a=useAccion()
  const lista=useLectura<{solicitudes:SolicitudVip[]}>('/operacion/club/vip-espera',token)
  const [evidencia,setEvidencia]=useState(''),[confirmo,setConfirmo]=useState(false),[notas,setNotas]=useState<Record<string,string>>({})
  return <section className="space-y-4"><h2 className="equipo-subtitulo">Reglas aprobadas del club</h2>
    <Aviso error={l.error||lista.error||a.error} mensaje={a.mensaje}/>
    <p>Versión {REGLAS_CLUB.version}. {l.datos?.activa?'Activa para la operación; se conservan los premios y contratos anteriores.':'Pendiente de validación operativa y activación por el propietario.'}</p>
    <details><summary className="min-h-12 py-3 cursor-pointer">Revisar las cinco reglas aprobadas</summary><ul className="list-disc pl-5 space-y-3"><li>{REGLAS_CLUB.cafe_detalle}</li><li>{REGLAS_CLUB.sellos_regla}</li><li>{REGLAS_CLUB.premio_detalle}</li><li>15% en las ocho porciones de postres de la carta, sin extras, encargos ni acumulación de promociones.</li><li>{REGLAS_CLUB.vip_regla}</li></ul></details>
    {propietario&&l.datos&&!l.datos.activa&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();void a.ejecutar(async()=>{await operacion('/operacion/club/activar-reglas',{version:l.datos!.config.version,evidencia,confirmo},token);setConfirmo(false);await l.refrescar();await alActualizar()},'Reglas activadas con versión y comprobación operativa.')} }>
      <p>Antes de activar: registrar costos reales en la configuración, verificar vasos de 8 oz y presentaciones del premio, revisar margen de los ocho postres, configurar mesas VIP reales y ensayar la cola con dos solicitudes. No usar datos de ejemplo como validación.</p>
      <label className="block">Comprobación realizada: fecha, responsable y resultados<textarea className="block w-full" rows={4} required minLength={30} maxLength={1500} value={evidencia} onChange={e=>{setEvidencia(e.target.value);setConfirmo(false)}}/></label>
      <label className="flex min-h-12 gap-3 items-center"><input type="checkbox" checked={confirmo} onChange={e=>setConfirmo(e.target.checked)}/>Verificamos estos puntos en la operación real y autorizo la activación.</label>
      <Boton type="submit" disabled={!confirmo||evidencia.trim().length<30||a.ocupado}>Activar las cinco reglas aprobadas</Boton>
      <Boton tono="claro" onClick={()=>void l.refrescar()}>Actualizar versión para activar</Boton>
    </form>}
    {l.datos?.config.validacion_operativa&&<p>Validación registrada: {l.datos.config.validacion_operativa}</p>}
    <h3 className="font-semibold">Gestionar espera VIP</h3><p>El orden se recalcula con la vigencia de la membresía. Solo se puede ofrecer a la primera solicitud del mismo horario, duración y grupo. Resolvé una oferta pendiente antes de pasar a otra. Registrar una gestión no envía mensajes ni crea una reserva.</p>
    <Boton tono="claro" onClick={()=>void lista.refrescar()}>Actualizar espera VIP</Boton>
    {!lista.datos?.solicitudes.length&&<p>No hay solicitudes VIP pendientes.</p>}
    <ul className="space-y-4">{lista.datos?.solicitudes.map(s=><li className="border-t border-filete pt-4" key={s.id}><p><strong>{s.nombre}</strong> · pase {s.codigo_club} · {s.miembro?'Miembro vigente':'Cuenta gratuita'}</p><p>{fechaHora(s.cuando)} · {s.horas} h · {s.personas} personas · solicitada {fechaHora(s.creada)}. {s.ofrecida?'Oferta pendiente de resolver.':''}</p>
      <label className="block">Gestión con {s.nombre}<input className="block min-h-12 w-full" maxLength={500} value={notas[s.id]??''} onChange={e=>setNotas({...notas,[s.id]:e.target.value})}/></label>
      <div className="flex flex-wrap gap-3">{!s.ofrecida&&<Boton disabled={a.ocupado||(notas[s.id]??'').trim().length<5} onClick={()=>void a.ejecutar(async()=>{await operacion('/operacion/club/vip-espera/'+s.id+'/ofrecer',{version:s.version,motivo:notas[s.id]},token);await lista.refrescar()},'Oferta registrada; acordá la reserva con su titular por el flujo habitual.')}>Registrar oferta a {s.nombre}</Boton>}<Boton tono="claro" disabled={a.ocupado||(notas[s.id]??'').trim().length<5} onClick={()=>void a.ejecutar(async()=>{await operacion('/operacion/club/vip-espera/'+s.id+'/cerrar',{version:s.version,motivo:notas[s.id]},token);await lista.refrescar()},'Gestión de espera cerrada. Las reservas mantienen su estado.')}>Cerrar solicitud de {s.nombre}</Boton></div>
    </li>)}</ul>
  </section>
}
