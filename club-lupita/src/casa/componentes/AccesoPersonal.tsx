import { useEffect, useRef, useState, type FormEvent } from 'react'
import { sesion } from '../datos'
import { operacion } from '../operacion'
import { Boton } from './Base'

type EstadoServicio = 'cargando' | 'listo' | 'deshabilitado' | 'error'
type Acceso = { autenticado?: boolean; requierePerfil?: boolean; registro?: string }
export function AccesoPersonal({alEntrar}:{alEntrar:()=>void}) {
  const [servicio, setServicio] = useState<EstadoServicio>('cargando')
  const [revision, revisar] = useState(0)
  const [paso, setPaso] = useState<'correo'|'codigo'|'perfil'>('correo')
  const [correo, setCorreo] = useState(''), [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState(''), [telefono, setTelefono] = useState('')
  const [solicitud, setSolicitud] = useState(''), [registro, setRegistro] = useState('')
  const [promociones, setPromociones] = useState(false)
  const [error, setError] = useState(''), [ocupado, setOcupado] = useState(false)
  const [espera, setEspera] = useState(0)
  const titulo = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    let vivo = true; setServicio('cargando')
    void operacion<{accesoCorreo:boolean}>('/capacidades').then(r => { if(vivo)setServicio(r.accesoCorreo?'listo':'deshabilitado') }).catch(() => {if(vivo)setServicio('error')})
    return () => {vivo=false}
  }, [revision])
  useEffect(() => { if(paso!=='correo')titulo.current?.focus() }, [paso])
  useEffect(() => {
    if(!espera)return
    const reloj=setTimeout(()=>setEspera(n=>Math.max(0,n-1)),1000)
    return ()=>clearTimeout(reloj)
  }, [espera])
  async function pedirCodigo() {
    const r=await operacion<{solicitud:string}>('/auth/correo/codigo',{correo})
    setSolicitud(r.solicitud);setCodigo('');setEspera(60);setPaso('codigo')
  }
  async function enviar(e:FormEvent) {
    e.preventDefault();setOcupado(true);setError('')
    try {
      if(paso==='correo') {await pedirCodigo();return}
      const r=await operacion<Acceso>(paso==='codigo'?'/auth/correo/verificar':'/auth/correo/registro',paso==='codigo'?{correo,solicitud,codigo}:{solicitud,registro,nombre,telefono,promociones})
      if(r.autenticado===true) {sesion.confirmar();alEntrar();return}
      if(paso==='codigo'&&r.requierePerfil&&typeof r.registro==='string') {setRegistro(r.registro);setPaso('perfil');return}
      throw Error('No pudimos completar tu acceso. Intentá de nuevo.')
    }catch(e){setError(e instanceof Error?e.message:'No pudimos completar tu acceso. Intentá de nuevo.')}
    finally{setOcupado(false)}
  }
  async function reenviar() {
    setOcupado(true);setError('')
    try{await pedirCodigo()}catch(e){setError(e instanceof Error?e.message:'No pudimos reenviar el código.')}
    finally{setOcupado(false)}
  }
  function volver() {setPaso('correo');setCodigo('');setRegistro('');setError('')}
  const estilo='mt-2 min-h-12 w-full rounded-troquel border border-contorno bg-papel px-3 py-2 text-tinta'
  return <form onSubmit={enviar} className="entrada-registro" aria-busy={ocupado} aria-describedby={error?'acceso-error':undefined}>
    <ol className="entrada-registro-pasos" aria-label="Pasos del acceso">
      {(['correo','codigo','perfil'] as const).map((etapa,i)=><li key={etapa} aria-current={paso===etapa?'step':undefined}><span aria-hidden="true">{i+1}</span>{['Correo','Verificación','Tu cuenta'][i]}</li>)}
    </ol>
    <h2 ref={titulo} tabIndex={-1} className="t-seccion">{paso==='correo'?'Tu lugar en Club Lupita':paso==='codigo'?'Revisá tu correo':'Un gusto conocerte'}</h2>
    <p className="entrada-registro-ayuda">{paso==='correo'?'Creá tu cuenta o entrá con tu correo. Te enviaremos un código, sin contraseñas.':paso==='codigo'?`Enviamos un código a ${correo.trim()}. Vence en 10 minutos. Si no lo ves, revisá la carpeta de correo no deseado.`:'Tu correo ya está verificado. Completá estos datos para crear tu cuenta.'}</p>
    {paso==='correo'&&<label className="block text-cuerpo">Correo electrónico<input className={estilo} type="email" autoComplete="email" inputMode="email" maxLength={254} required disabled={ocupado} value={correo} onChange={e=>setCorreo(e.target.value)} /></label>}
    {paso==='codigo'&&<label className="block text-cuerpo">Código de verificación<input className={estilo} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required disabled={ocupado} value={codigo} onChange={e=>setCodigo(e.target.value.replace(/\D/g,''))} /></label>}
    {paso==='perfil'&&<>
      <label className="block text-cuerpo">Tu nombre<input className={estilo} autoComplete="name" minLength={2} maxLength={80} required disabled={ocupado} value={nombre} onChange={e=>setNombre(e.target.value)} /></label>
      <label className="block text-cuerpo">Número de teléfono<input className={estilo} type="tel" autoComplete="tel" maxLength={24} required disabled={ocupado} aria-describedby="telefono-ayuda" value={telefono} onChange={e=>setTelefono(e.target.value)} /></label>
      <p id="telefono-ayuda" className="entrada-registro-ayuda">En Nicaragua, escribí tus 8 dígitos. Para otro país, incluí el código de país. Lo guardaremos como contacto; tus códigos de acceso llegarán al correo.</p>
      <label className="flex min-h-12 items-start gap-3 py-2 text-cuerpo"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-tinta" checked={promociones} disabled={ocupado} onChange={e=>setPromociones(e.target.checked)} /><span>Quiero recibir promociones y novedades de La Bella Lupita por correo electrónico (opcional)</span></label>
      <p className="entrada-registro-ayuda">Podés crear tu cuenta sin aceptar promociones. Los códigos de acceso llegarán siempre a tu correo.</p>
    </>}
    {servicio==='cargando'&&<p role="status" className="entrada-registro-ayuda">Comprobando disponibilidad…</p>}
    {servicio==='deshabilitado'&&<p role="status" className="entrada-registro-ayuda">Estamos preparando el registro por correo. Todavía no podemos enviarte un código.</p>}
    {servicio==='error'&&<p role="alert" className="entrada-registro-ayuda">No pudimos comprobar el acceso. Revisá tu conexión y volvé a intentar.</p>}
    {error&&<p id="acceso-error" role="alert" className="text-achiote text-cuerpo">{error}</p>}
    <Boton type="submit" ancho cargando={ocupado} disabled={servicio!=='listo'}>{ocupado?'Un momento…':paso==='correo'?'Continuar con mi correo':paso==='codigo'?'Verificar y continuar':'Crear mi cuenta'}</Boton>
    {(servicio==='error'||servicio==='deshabilitado')&&<Boton tono="tenue" onClick={()=>revisar(n=>n+1)}>Volver a comprobar</Boton>}
    {paso==='codigo'&&<div className="entrada-registro-acciones">
      <Boton tono="tenue" disabled={ocupado||espera>0} onClick={()=>void reenviar()}>{espera?`Reenviar en ${espera} s`:'Reenviar código'}</Boton>
      <Boton tono="tenue" disabled={ocupado} onClick={volver}>Cambiar correo</Boton>
    </div>}
    {paso==='perfil'&&<Boton tono="tenue" disabled={ocupado} onClick={volver}>Volver a verificar mi correo</Boton>}
    {paso==='correo'&&<p className="entrada-registro-ayuda">¿Ya tenés cuenta? Usá tu mismo correo para entrar.</p>}
  </form>
}
