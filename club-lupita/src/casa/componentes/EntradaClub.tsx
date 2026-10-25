import {useRef,useState} from 'react'
import '../estilos/redisenio-cuenta.css'
import {Boton} from './Base'
import {Hoja} from './Superficies'
import {operacion,type CompraOperativa} from '../operacion'
const fecha=(s?:string)=>s?new Intl.DateTimeFormat('es-NI',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Managua'}).format(new Date(s)):'Por confirmar'
export function EntradaClub({compra,actualizar}:{compra:CompraOperativa;actualizar:()=>Promise<void>}){
 const d=compra.detalle,[abierta,setAbierta]=useState(false),[codigo,setCodigo]=useState(''),[confirmo,setConfirmo]=useState(false),[ocupado,setOcupado]=useState(false),[error,setError]=useState(''),[mensaje,setMensaje]=useState(''),lock=useRef(false)
 async function ceder(){if(lock.current)return;lock.current=true;setOcupado(true);setError('');try{const r=await operacion<{nombre:string}>('/club/entrada/'+compra.id.slice('experiencia:'.length)+'/ceder',{codigo,confirmo});setMensaje('Entrada cedida a '+r.nombre+'. Conservás el comprobante de pago.');setAbierta(false);await actualizar()}catch(e){setError((e as Error).message)}finally{lock.current=false;setOcupado(false)}}
 return <div className="cuenta-entrada mt-3 space-y-3"><p>{fecha(d.cuando)} · Butaca {d.butaca}</p>
  <p role="status">{d.cancelada?d.reembolsada?'Cancelada por la casa · importe devuelto al comprador.':'Cancelada por la casa · devolución por revisar con el equipo.':d.cedida?'Entrada cedida: este comprobante conserva el pago, pero ya no da acceso.':d.asistencia?'Asistencia registrada.':d.recibida?'Entrada recibida a tu nombre.':'Entrada registrada a tu nombre.'}</p>
  {d.lugar&&<p>{d.lugar}{d.duracion_minutos?` · ${d.duracion_minutos} minutos`:''}</p>}{d.incluye&&<p>{d.incluye}</p>}{d.condiciones&&<p>{d.condiciones}</p>}
  {d.puede_ceder&&<Boton tono="claro" onClick={()=>{setError('');setConfirmo(false);setAbierta(true)}}>Ceder entrada · {d.nombre}</Boton>}{mensaje&&<p role="status">{mensaje}</p>}
  <Hoja abierta={abierta} bloqueada={ocupado} alCerrar={()=>setAbierta(false)} titulo="Ceder esta entrada"><p className="my-3">{d.nombre} · butaca {d.butaca}. El destinatario podrá verla en su cuenta. La cesión se registra una sola vez; para corregirla, solicitá ayuda a la casa antes del evento.</p><label className="block">Código del pase del destinatario<input className="w-full border border-filete p-3 my-3" value={codigo} autoCapitalize="characters" maxLength={12} onChange={e=>{setCodigo(e.target.value.trim().toUpperCase());setConfirmo(false)}}/></label><label className="flex items-start gap-3 my-3"><input type="checkbox" checked={confirmo} onChange={e=>setConfirmo(e.target.checked)}/>Confirmé con el destinatario que este es su código y acepto transferirle mi derecho de entrada.</label>{error&&<p role="alert" className="text-achiote">{error}</p>}<Boton ancho cargando={ocupado} disabled={!confirmo||!/^[A-F0-9]{12}$/.test(codigo)} onClick={()=>void ceder()}>Confirmar cesión de entrada</Boton></Hoja>
 </div>
}
