import { useEffect,useRef,useState } from 'react'
import { Boton } from './Base'
import { Tarjeta } from './Superficies'
import { operacion } from '../operacion'
const campo='mt-2 min-h-24 w-full rounded-troquel border border-filete bg-papel px-3 py-2 text-tinta'
const motivos=[['cuenta','Ayuda con mi cuenta'],['acceso','Cambiar correo o teléfono de acceso'],['datos','Solicitar copia o revisión de mis datos'],['baja','Solicitar baja de mi cuenta'],['compra','Compra o reserva']] as const
export function AtencionCliente({cuenta=false,mostrarMotivoCompleto=false,progresiva=false}:{cuenta?:boolean;mostrarMotivoCompleto?:boolean;progresiva?:boolean}){
  const [categoria,setCategoria]=useState(cuenta?'cuenta':'compra')
  const [formularioVisible,verFormulario]=useState(!progresiva)
  const motivo=useRef<HTMLSelectElement>(null),texto=useRef<HTMLTextAreaElement>(null)
  const [mensaje,escribir]=useState(''),[referencia,ref]=useState(()=>crypto.randomUUID()),[error,fallar]=useState(''),[ocupado,ocupar]=useState(false),[confirmado,confirmar]=useState(false)
  const [solicitudes,listar]=useState<{id:string;mensaje:string;estado:string;respuesta:string|null}[]>([])
  const [avisos,avisar]=useState<{id:string;texto:string;leido:string|null}[]>([])
  const [leyendo,setLeyendo]=useState(true),[errorLectura,setErrorLectura]=useState('')
  async function cargar(){
    setLeyendo(true)
    try{const [a,b]=await Promise.all([operacion<{solicitudes:typeof solicitudes}>('/atencion'),operacion<{avisos:typeof avisos}>('/avisos')]);listar(a.solicitudes);avisar(b.avisos);setErrorLectura('')}
    catch(e){setErrorLectura(e instanceof Error?e.message:'Revisá tu conexión y volvé a intentar.')}
    finally{setLeyendo(false)}
  }
  useEffect(()=>{void cargar()},[])
  const seguimiento=<ul className="mt-4 space-y-3">{solicitudes.map(s=><li key={s.id}><p className="font-semibold">{s.estado==='resuelta'?'Respondida':'Pendiente de atención'}</p><p>{s.mensaje}</p>{s.respuesta&&<p className="mt-2 text-banda">La casa: {s.respuesta}</p>}</li>)}</ul>
  const selector=<label className="block t-caption">Motivo<select ref={motivo} aria-label="Motivo" className="block mt-2 min-h-12 w-full border border-filete bg-papel p-2" disabled={ocupado} value={progresiva&&!formularioVisible?'':categoria} onChange={e=>{setCategoria(e.target.value);verFormulario(true);ref(crypto.randomUUID());confirmar(false);if(progresiva)requestAnimationFrame(()=>texto.current?.focus())}}>
    {progresiva&&<option value="" disabled>Elegí…</option>}
    {motivos.map(([valor,etiqueta])=><option key={valor} value={valor}>{etiqueta}</option>)}
  </select>{mostrarMotivoCompleto&&formularioVisible&&<span className="atencion-motivo-actual" aria-hidden="true">Motivo elegido: {motivos.find(([valor])=>valor===categoria)?.[1]}</span>}</label>
  return <Tarjeta className="cuenta-atencion"><h2 className="t-seccion">{cuenta?'Ayuda con mi cuenta':'Avisos y ayuda de la casa'}</h2><Boton tono="claro" className="my-3" cargando={leyendo} onClick={()=>void cargar()}>Actualizar avisos</Boton>
    {leyendo&&<p role="status" className="t-caption">Consultando avisos y solicitudes…</p>}
    {errorLectura&&<p role="alert" className="t-caption text-achiote">No pudimos actualizar tus avisos y solicitudes. {errorLectura}</p>}
    {!leyendo&&!errorLectura&&!avisos.length&&!solicitudes.length&&<p className="t-caption">No tenés avisos ni solicitudes para mostrar.</p>}
    <div className="atencion-avisos">{progresiva&&avisos.length>0&&<h3>Avisos de la casa</h3>}<ul className="space-y-3">{avisos.slice(0,10).map(a=><li key={a.id}><p>{a.texto}</p>{!a.leido&&<Boton tono="tenue" onClick={()=>void operacion('/avisos/'+a.id+'/leido',{}).then(cargar).catch(e=>fallar(e.message))}>Marcar leído</Boton>}</li>)}</ul></div>
    {progresiva&&solicitudes.length>0&&<section className="atencion-solicitudes"><h3>Tus solicitudes</h3>{seguimiento}</section>}
    {progresiva&&<div className="atencion-nueva"><h3>Una nueva consulta</h3>{selector}{!formularioVisible&&mensaje&&<><p className="t-caption">Consulta sin enviar. Conservamos el borrador mientras permanezcas en Perfil.</p><Boton tono="claro" onClick={()=>{verFormulario(true);requestAnimationFrame(()=>texto.current?.focus())}}>Continuar solicitud</Boton></>}</div>}
    <form hidden={!formularioVisible} className="mt-5 space-y-3" onSubmit={e=>{e.preventDefault();if(ocupado)return;ocupar(true);fallar('');confirmar(false);void operacion('/atencion',{mensaje,referencia,categoria}).then(async()=>{escribir('');ref(crypto.randomUUID());confirmar(true);await cargar()}).catch(e=>fallar(e.message)).finally(()=>ocupar(false))}}>
      {!progresiva&&selector}
      <label className="block t-caption">Contanos qué necesitás<textarea ref={texto} disabled={ocupado} className={campo} required minLength={5} maxLength={1000} value={mensaje} onChange={e=>{escribir(e.target.value);ref(crypto.randomUUID());confirmar(false)}}/></label>
      <p className="t-caption">{categoria==='compra'?'Incluí el número del pedido o comprobante. El equipo de la casa atiende esta solicitud.':'El propietario o encargado recibe tu solicitud de cuenta y verificará tu identidad cuando corresponda. No envíes contraseñas, códigos de acceso ni documentos personales aquí.'} La solicitud no cambia el acceso ni cancela compras, membresías o saldos automáticamente.</p>
      <Boton type="submit" cargando={ocupado}>Enviar solicitud a la casa</Boton>
      {progresiva&&<Boton tono="tenue" disabled={ocupado} onClick={()=>{verFormulario(false);motivo.current?.focus()}}>Volver sin enviar</Boton>}
    </form>
    {confirmado&&<p role="status" className="mt-3 text-banda">Solicitud registrada. La respuesta aparecerá aquí.</p>}
    {!progresiva&&seguimiento}
    {error&&<p role="alert" className="mt-3 text-achiote">{error}</p>}
  </Tarjeta>
}
export function AtencionEquipo({token}:{token:string}) {
  const [solicitudes,listar]=useState<{id:string;nombre:string;mensaje:string}[]>([]),[respuestas,escribir]=useState<Record<string,string>>({}),[error,fallar]=useState(''),[ocupado,ocupar]=useState(false)
  async function cargar(){listar((await operacion<{solicitudes:typeof solicitudes}>('/operacion/atencion',undefined,token)).solicitudes)}
  useEffect(()=>{void cargar().catch(e=>fallar(e.message))},[])
  return <Tarjeta><h2 className="t-seccion">Solicitudes de clientes</h2><Boton tono="claro" className="my-3" onClick={()=>void cargar().catch(e=>fallar(e.message))}>Actualizar solicitudes</Boton>
    {!solicitudes.length&&<p className="t-caption">No hay solicitudes pendientes en esta vista</p>}
    {solicitudes.map(s=><form key={s.id} className="my-4 space-y-3" onSubmit={e=>{e.preventDefault();ocupar(true);fallar('');void operacion('/operacion/atencion/'+s.id+'/responder',{respuesta:respuestas[s.id]},token).then(cargar).catch(e=>fallar(e.message)).finally(()=>ocupar(false))}}><h3 className="font-semibold">{s.nombre}</h3><p>{s.mensaje}</p><label className="block t-caption">Respuesta y resolución<textarea disabled={ocupado} className={campo} required minLength={5} maxLength={1000} value={respuestas[s.id]??''} onChange={e=>escribir({...respuestas,[s.id]:e.target.value})}/></label><p className="t-caption">La respuesta se muestra al cliente Registrar una respuesta no mueve dinero ni modifica una reserva</p><Boton type="submit" disabled={ocupado}>Responder y cerrar solicitud</Boton></form>)}
    {error&&<p role="alert" className="text-achiote">{error}</p>}
  </Tarjeta>
}

