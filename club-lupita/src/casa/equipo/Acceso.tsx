import { useEffect, useState, type ReactNode } from 'react'
import { Boton } from '../componentes/Base'
import { operacion, TOKEN_PERSONAL } from '../operacion'
import { Aviso, useAccion } from './comun'

export type ResultadoAcceso={codigos?:string[];salir?:boolean}
export function Contraseña({etiqueta,valor,cambiar,nueva=false}:{etiqueta:string;valor:string;cambiar:(s:string)=>void;nueva?:boolean}){
  const [visible,setVisible]=useState(false)
  return <div className="equipo-password"><label className="equipo-campo">{etiqueta}<input type={visible?'text':'password'} autoComplete={nueva?'new-password':'current-password'} required minLength={nueva?15:undefined} maxLength={256} value={valor} onChange={e=>cambiar(e.target.value)}/></label><button type="button" aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?'Ocultar':'Mostrar'} contraseña</button></div>
}
export function Codigo({valor,cambiar}:{valor:string;cambiar:(s:string)=>void}){return <label className="equipo-campo">Código del autenticador<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6} value={valor} onChange={e=>cambiar(e.target.value.replace(/\D/g,''))}/></label>}
export function MarcoAcceso({children}:{children:ReactNode}){return <main className="equipo-acceso" id="contenido-equipo"><section className="equipo-acceso-formulario" aria-label="Acceso individual del equipo">{children}</section><div className="equipo-acceso-marca"><img src="/brand/v3/logo-original.png" width={250} height={120} alt="La Bella Lupita"/><p className="t-eyebrow">ESPACIO DEL EQUIPO</p><h1>La casa, en orden.</h1><p>Pedidos, atención y operación diaria de La Bella Lupita.</p><a href="/">Volver a la aplicación de clientes</a></div></main>}
export function Acceso({aviso,alEntrar}:{aviso:string;alEntrar:(r:ResultadoAcceso)=>void}){
  const [fragmento]=useState(()=>new URLSearchParams(location.hash.slice(1)))
  const [modo,setModo]=useState<'entrar'|'activar'|'recuperar'|'iniciar-propietario'>(fragmento.has('activar')?'activar':'entrar')
  const demo=new URLSearchParams(location.search).get('entorno')==='capacitacion'
  const [estado,setEstado]=useState<{configurado:boolean;capacitacion:boolean}>(),[estadoError,setEstadoError]=useState('')
  const [usuario,setUsuario]=useState(fragmento.get('usuario')??''),[nombre,setNombre]=useState(''),[clave,setClave]=useState(''),[nueva,setNueva]=useState(''),[confirmacion,setConfirmacion]=useState(''),[invitacion,setInvitacion]=useState(fragmento.get('activar')??''),[codigo,setCodigo]=useState(''),[compartido,setCompartido]=useState(true),[dispositivo,setDispositivo]=useState(''),a=useAccion()
  useEffect(()=>{if(location.hash)history.replaceState({},'',location.pathname+location.search);void operacion<{configurado:boolean;capacitacion:boolean}>('/auth/equipo/estado'+(demo?'?entorno=capacitacion':''),undefined,null).then(setEstado).catch(e=>setEstadoError(e.message))},[demo])
  const titulos={entrar:'Ingresar al equipo',activar:'Activar mi acceso',recuperar:'Recuperar mi acceso','iniciar-propietario':'Activar el primer propietario'}
  function cambiar(m:typeof modo){setModo(m);setClave('');setNueva('');setConfirmacion('');a.fallar('')}
  return <MarcoAcceso><p className="t-eyebrow">{demo?'CAPACITACIÓN · DATOS DE PRUEBA':'OPERACIÓN REAL'}</p><h2>{titulos[modo]}</h2><p>{modo==='entrar'?'Cada persona ingresa con su propio usuario.':modo==='activar'?'Creá tu contraseña. La invitación se puede utilizar una sola vez.':modo==='recuperar'?'Usá uno de tus códigos de recuperación guardados. Se cerrarán las sesiones anteriores y configurarás nuevamente tu autenticador.':'Esta transición se realiza una sola vez con la clave anterior del negocio. Después, cada propietario tendrá su propia cuenta.'}</p><Aviso mensaje={aviso} error={estadoError}/>
    <form onSubmit={e=>{e.preventDefault();void a.ejecutar(async()=>{const r=await operacion<ResultadoAcceso>('/auth/equipo/'+modo,{usuario:usuario.trim().toLowerCase(),nombre,clave,actual:clave,nueva,confirmacion,invitacion:invitacion.trim(),codigo:codigo.trim(),demo,compartido,dispositivo},null);setClave('');alEntrar(r)},'')}}>
      <fieldset disabled={a.ocupado} className="equipo-form-grupo">
      {modo==='iniciar-propietario'&&<label className="equipo-campo">Tu nombre<input required minLength={2} maxLength={80} autoComplete="name" value={nombre} onChange={e=>setNombre(e.target.value)}/></label>}
      <label className="equipo-campo">Usuario<input autoComplete="username" autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={40} value={usuario} onChange={e=>setUsuario(e.target.value)}/></label>
      {(modo==='entrar'||modo==='iniciar-propietario')&&<Contraseña etiqueta={modo==='entrar'?'Contraseña':'Clave anterior del propietario'} valor={clave} cambiar={setClave}/>}
      {modo==='activar'&&<label className="equipo-campo">Código de invitación<input required autoComplete="off" value={invitacion} onChange={e=>setInvitacion(e.target.value)} maxLength={64}/></label>}
      {modo==='recuperar'&&<label className="equipo-campo">Código de recuperación<input required autoComplete="off" value={codigo} onChange={e=>setCodigo(e.target.value)} maxLength={32}/></label>}
      {modo!=='entrar'&&<><Contraseña etiqueta="Nueva contraseña" valor={nueva} cambiar={setNueva} nueva/><p className="equipo-nota">Al menos 15 caracteres. Podés usar una frase larga y un gestor de contraseñas.</p><Contraseña etiqueta="Repetí la nueva contraseña" valor={confirmacion} cambiar={setConfirmacion} nueva/></>}
      <label className="equipo-check"><input type="checkbox" checked={compartido} onChange={e=>setCompartido(e.target.checked)}/>Uso un equipo compartido</label>
      </fieldset><Aviso error={a.error}/><Boton type="submit" ancho cargando={a.ocupado}>{modo==='entrar'?'Ingresar':titulos[modo]}</Boton>
      <p className="equipo-nota">Bloqueo tras {compartido?'5':'30'} minutos sin actividad. {compartido?'Cerrá tu sesión antes de cambiar de persona.':'La sesión dura hasta 12 horas.'}</p>
      <details className="equipo-dispositivo"><summary>Nombrar este dispositivo (opcional)</summary><label className="equipo-campo">Nombre de este dispositivo<input value={dispositivo} onChange={e=>setDispositivo(e.target.value)} maxLength={80} placeholder={compartido?'Por ejemplo: Caja principal':'Por ejemplo: Mi teléfono'}/></label></details>
    </form>
    <div className="equipo-acceso-enlaces">{modo!=='entrar'?<button onClick={()=>cambiar('entrar')}>Volver al ingreso</button>:<><button onClick={()=>cambiar('activar')}>Tengo una invitación</button><button onClick={()=>cambiar('recuperar')}>Perdí mi acceso</button></>}{estado&&!estado.configurado&&modo!=='iniciar-propietario'&&<button onClick={()=>cambiar('iniciar-propietario')}>Configurar la primera cuenta de propietario</button>}</div>
    {modo==='recuperar'&&<p className="equipo-nota">Si no guardaste códigos, otro propietario puede renovar tu invitación; eso conserva tu autenticador. Si también lo perdiste, necesitás la recuperación asistida del negocio.</p>}
    {(demo||estado?.capacitacion)&&<p className="equipo-nota"><a href={demo?'/personal':'/personal?entorno=capacitacion'}>{demo?'Volver al acceso de operación real':'Abrir capacitación con datos de prueba'}</a></p>}
  </MarcoAcceso>
}
export function VerificarMfa({alEntrar}:{alEntrar:(r:ResultadoAcceso)=>void}){
  const [codigo,setCodigo]=useState(''),a=useAccion()
  return <form onSubmit={e=>{e.preventDefault();void a.ejecutar(async()=>alEntrar(await operacion('/personal/mfa/verificar',{codigo},TOKEN_PERSONAL)),'')}}><h2>Confirmá tu identidad</h2><p>Ingresá el código actual de tu aplicación autenticadora.</p><Codigo valor={codigo} cambiar={setCodigo}/><Aviso error={a.error}/><Boton type="submit" ancho cargando={a.ocupado}>Verificar e ingresar</Boton></form>
}
export function ConfigurarMfa({alEntrar}:{alEntrar:(r:ResultadoAcceso)=>void}){
  const [datos,setDatos]=useState<{qr:string;secreto:string}>(),[codigo,setCodigo]=useState(''),a=useAccion()
  return <section><h2>Protegé tu cuenta</h2><p>Agregá La Bella Lupita a tu aplicación autenticadora. Conservá el autenticador en un dispositivo personal.</p>{!datos?<Boton cargando={a.ocupado} onClick={()=>void a.ejecutar(async()=>setDatos(await operacion('/personal/mfa/preparar',{},TOKEN_PERSONAL)),'')}>Preparar autenticador</Boton>:<form onSubmit={e=>{e.preventDefault();void a.ejecutar(async()=>alEntrar(await operacion('/personal/mfa/confirmar',{codigo},TOKEN_PERSONAL)),'')}}><img className="equipo-qr" src={datos.qr} width={240} height={240} alt="Código QR para agregar la cuenta al autenticador"/><details><summary>Ingresar la clave manualmente</summary><p className="equipo-clave">{datos.secreto}</p><p>Tipo: código por tiempo (TOTP).</p></details><Codigo valor={codigo} cambiar={setCodigo}/><Boton type="submit" ancho cargando={a.ocupado}>Confirmar autenticador</Boton></form>}<Aviso error={a.error}/></section>
}
export function CodigosGuardados({codigos,continuar}:{codigos:string[];continuar:()=>void}){
  const [guardados,setGuardados]=useState(false),a=useAccion()
  useEffect(()=>{const timer=setTimeout(continuar,5*60000);return()=>clearTimeout(timer)},[continuar])
  return <section><h2>Guardá tus códigos de recuperación</h2><p>Permiten recuperar tu cuenta si perdés el acceso. Se muestran ahora solamente. Cada código sirve una vez; al recuperar la cuenta se invalidan los demás.</p><p className="equipo-nota">Guardalos en tu gestor de contraseñas o en un lugar privado, fuera de este equipo compartido.</p><ul className="equipo-codigos">{codigos.map(c=><li key={c}><code>{c}</code></li>)}</ul><Boton tono="claro" onClick={()=>void a.ejecutar(async()=>{await navigator.clipboard.writeText(codigos.join('\n'))},'Códigos copiados.')}>Copiar códigos</Boton><Aviso error={a.error} mensaje={a.mensaje}/><label className="equipo-check"><input type="checkbox" checked={guardados} onChange={e=>setGuardados(e.target.checked)}/>Los guardé en un lugar privado</label><Boton disabled={!guardados} onClick={continuar}>Continuar</Boton></section>
}
export function CambiarClave({obligatoria=false,alEntrar}:{obligatoria?:boolean;alEntrar:(r:ResultadoAcceso)=>void}){
  const [actual,setActual]=useState(''),[nueva,setNueva]=useState(''),[confirmacion,setConfirmacion]=useState(''),a=useAccion()
  return <form onSubmit={e=>{e.preventDefault();void a.ejecutar(async()=>alEntrar(await operacion('/personal/clave',{actual,nueva,confirmacion},TOKEN_PERSONAL)),'')}}><h2>{obligatoria?'Elegí tu contraseña personal':'Cambiar contraseña'}</h2><p>Usá al menos 15 caracteres. Las sesiones anteriores se cerrarán.</p><Contraseña etiqueta="Contraseña actual" valor={actual} cambiar={setActual}/><Contraseña etiqueta="Nueva contraseña" valor={nueva} cambiar={setNueva} nueva/><Contraseña etiqueta="Repetí la nueva contraseña" valor={confirmacion} cambiar={setConfirmacion} nueva/><Aviso error={a.error}/><Boton type="submit" cargando={a.ocupado}>Guardar contraseña</Boton></form>
}
export function Revalidar({mfa,continuar}:{mfa:boolean;continuar:()=>void}){
  const [actual,setActual]=useState(''),[codigo,setCodigo]=useState(''),a=useAccion()
  return <form onSubmit={e=>{e.preventDefault();void a.ejecutar(async()=>{await operacion('/personal/revalidar',{actual,codigo},TOKEN_PERSONAL);continuar()},'')}}><p>Confirmá que sos vos antes de continuar.</p><Contraseña etiqueta="Tu contraseña" valor={actual} cambiar={setActual}/>{mfa&&<Codigo valor={codigo} cambiar={setCodigo}/>}<Aviso error={a.error}/><Boton type="submit" ancho cargando={a.ocupado}>Confirmar identidad</Boton></form>
}
