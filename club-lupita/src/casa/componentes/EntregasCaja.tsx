import { useEffect, useState } from 'react'
import { Boton } from './Base'
import { Hoja,Tarjeta } from './Superficies'
import { operacion } from '../operacion'
type Entrega={id:string;tipo:string;nombre:string;detalle:string;fecha:string}
type Reserva={id:string;nombre:string;zona:string;cuando:string;personas:number}
export function EntregasCaja({token}:{token:string}) {
  const [entregas,listar]=useState<Entrega[]>([]),[reservas,mesas]=useState<Reserva[]>([]),[confirmando,confirmar]=useState<Entrega|null>(null),[error,fallar]=useState(''),[ocupado,ocupar]=useState(false)
  async function cargar(){const r=await operacion<{entregas:Entrega[];reservas:Reserva[]}>('/operacion/entregas',undefined,token);listar(r.entregas);mesas(r.reservas)}
  useEffect(()=>{void cargar().catch(e=>fallar(e.message))},[])
  return <Tarjeta><h2 className="t-seccion">Entregas y agenda</h2><Boton tono="claro" className="my-3" onClick={()=>void cargar().catch(e=>fallar(e.message))}>Actualizar entregas</Boton>
    <ul className="space-y-3">{entregas.map(e=><li key={e.id} className="flex flex-wrap items-center justify-between gap-3"><span>{e.nombre} · {e.detalle}</span><Boton tono="claro" onClick={()=>confirmar(e)}>{e.tipo==='bolsa'?'Registrar entrega':'Registrar asistencia'}</Boton></li>)}</ul>
    {!entregas.length&&<p className="t-caption">No hay entregas pendientes en esta vista</p>}
    <h3 className="mt-5 t-seccion">Próximas mesas</h3><ul className="mt-3 space-y-3">{reservas.map(r=><li key={r.id}>{r.nombre} · {r.zona} · {r.personas} personas · {new Intl.DateTimeFormat('es-NI',{dateStyle:'short',timeStyle:'short',timeZone:'America/Managua'}).format(new Date(r.cuando))}</li>)}</ul>
    {error&&<p role="alert" className="mt-3 text-achiote">{error}</p>}
    <Hoja abierta={!!confirmando} alCerrar={()=>confirmar(null)} titulo="Confirmar atención"><p>{confirmando?.nombre} · {confirmando?.detalle}</p><p className="my-3 t-caption">Confirmá después de atender a esta persona Quedará registrado con tu acceso</p>{error&&<p role="alert" className="my-3 text-achiote">{error}</p>}<Boton ancho disabled={ocupado} onClick={()=>{if(!confirmando)return;ocupar(true);fallar('');void operacion('/operacion/entregas/'+confirmando.tipo+'/'+confirmando.id,{},token).then(async()=>{confirmar(null);await cargar()}).catch(e=>fallar(e.message)).finally(()=>ocupar(false))}}>Confirmar registro</Boton></Hoja>
  </Tarjeta>
}
