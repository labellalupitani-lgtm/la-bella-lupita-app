import '../estilos/redisenio-comercio.css'
import './TiendaExperiencia.css'
import { useEffect, useRef, useState } from 'react'
import { Boton, Eyebrow, Icono } from '../componentes/Base'
import { Hoja, Tarjeta } from '../componentes/Superficies'
import { CondicionesTienda, diaTienda as dia, rangoRetiroTienda } from '../componentes/CondicionesTienda'
import { cordobas, useDatos } from '../datos'
import { confirmarCompra, referenciaCompra } from '../compras'
import { destinoOferta, compraOferta } from '../medicion'
import { ErrorPeticion } from '../http'
import { ErrorContratoTienda, tienda, medirTienda, leerIntento, guardarIntento } from '../tienda'
import { faltantesFicha, type CotizacionTienda, type OfertaTienda, type ReciboTienda } from '../../compartido/tienda'
const whatsapp=(s:string)=>'https://wa.me/50587442005?text='+encodeURIComponent(s)
const fotoAmbiente='/images/latte-logo-mesa-960.webp'
export function Tienda({navegar}:{navegar:(ruta:string)=>void}){
  const {yo,refrescar}=useDatos(),socio=yo?.socio.id
  const [oferta,setOferta]=useState<OfertaTienda>(),[errorOferta,setErrorOferta]=useState(''),[cargando,setCargando]=useState(true)
  const [q,setQ]=useState<CotizacionTienda>(),[recibo,setRecibo]=useState<ReciboTienda>(),[ref,setRef]=useState<string>()
  const [pendientes,setPendientes]=useState<string[]>([]),[comprobando,setComprobando]=useState(true),[incierto,setIncierto]=useState(false)
  const [errorConsulta,setErrorConsulta]=useState('')
  const [abierta,setAbierta]=useState(false),[acepto,setAcepto]=useState(false),[ocupado,setOcupado]=useState(false),[error,setError]=useState(''),[nota,setNota]=useState('')
  const [recarga,setRecarga]=useState(false),[tipo,setTipo]=useState('Cajas de regalo'),[cantidad,setCantidad]=useState(''),[fecha,setFecha]=useState(''),[zona,setZona]=useState('')
  const [fotoFallida,setFotoFallida]=useState('')
  const [ambienteFallido,setAmbienteFallido]=useState(false)
  const candado=useRef(false),vivo=useRef(true),foco=useRef<HTMLDivElement>(null)
  const ofertaMedida=useRef(''),saldoMedido=useRef('')
  useEffect(()=>{if(!oferta)return;const clave=oferta.generacion+':'+oferta.revision;if(ofertaMedida.current!==clave){ofertaMedida.current=clave;medirTienda('oferta')}if(yo&&yo.saldo.total<oferta.precio&&saldoMedido.current!==clave){saldoMedido.current=clave;medirTienda('saldo_insuficiente')}},[oferta,yo])
  async function ofertaActual(){setCargando(true);try{const o=await tienda.oferta();if(vivo.current){setOferta(o);setErrorOferta('')}}catch(e){if(vivo.current)setErrorOferta((e as Error).message)}finally{if(vivo.current)setCargando(false)}}
  async function recibido(r:ReciboTienda,recuperado=false){
    setRecibo(r);setQ(undefined);setIncierto(false);setError('');setNota('');setAbierta(false)
    medirTienda(recuperado?'recuperado':'compra_ok');compraOferta('cosecha')
    await refrescar();await ofertaActual();requestAnimationFrame(()=>foco.current?.focus())
  }
  function cerrarDialogo(){if(ocupado)return;setAbierta(false);requestAnimationFrame(()=>document.getElementById(incierto?'tienda-consultar':'tienda-apartar')?.focus())}
  useEffect(()=>{if(abierta&&error)requestAnimationFrame(()=>document.getElementById('tienda-error-compra')?.focus())},[error,abierta])
  async function consultar(r:string){
    if(r!==ref)setRecibo(undefined)
    const resultado=await tienda.consultar(r)
    if(!vivo.current)return
    setRef(r);if(socio)guardarIntento(socio,r)
    if(resultado.estado==='confirmado')await recibido(resultado.recibo,true)
    else if(resultado.estado==='cerrado'){if(socio)confirmarCompra(socio,'bolsa');setRef(undefined);setQ(undefined);setIncierto(false);setPendientes(p=>p.filter(x=>x!==r));setNota('Este intento está cerrado. Podés iniciar otra compra.')}
    else {setIncierto(false);setRecibo(undefined);setQ(resultado.cotizacion??undefined);setNota('Consultamos el intento: no tiene un cobro registrado. Podés revisar el precio o descartarlo.');await refrescar()}
  }
  async function accion(f:()=>Promise<void>){if(candado.current)return;candado.current=true;setOcupado(true);setError('');try{await f()}catch(e){if(vivo.current)setError((e as Error).message)}finally{candado.current=false;if(vivo.current)setOcupado(false)}}
  async function comprobarIntentos(){
    if(!socio)return
    setComprobando(true);setErrorConsulta('')
    const local=leerIntento(socio)
    if(local){setRef(local);setIncierto(true)}
    try{
      const p=await tienda.pendientes();if(!vivo.current)return
      const todos=[...new Set([...(local?[local]:[]),...p.intentos.map(i=>i.referencia)])]
      setPendientes(todos)
      if(todos.length){setRef(todos[0]);setIncierto(true);await consultar(todos[0])}
      else setIncierto(false)
    }catch(e){if(vivo.current)setErrorConsulta((e as Error).message)}
    finally{if(vivo.current)setComprobando(false)}
  }
  useEffect(()=>{
    vivo.current=true;destinoOferta('cosecha');medirTienda('vista');void ofertaActual()
    if(socio)void comprobarIntentos()
    else setComprobando(false)
    return()=>{vivo.current=false}
  },[socio])
  async function revisar(){
    if(!socio)return
    setRecibo(undefined);setNota('');setAcepto(false);setQ(undefined)
    let r=ref
    if(r){const cierre=await tienda.cerrar(r);if(cierre.estado==='confirmado'){await recibido(cierre.recibo,true);return}confirmarCompra(socio,'bolsa');setPendientes(p=>p.filter(x=>x!==r));r=undefined;setRef(undefined)}
    r=referenciaCompra(socio,'bolsa')??undefined
    if(!r)throw Error('Activá el almacenamiento del navegador para conservar la referencia de compra.')
    setRef(r);setIncierto(true)
    const cotizacion=await tienda.cotizar(r);setQ(cotizacion);setIncierto(false);setAbierta(true);medirTienda('cotizar')
  }
  async function comprar(){
    if(!q||!acepto)return
    medirTienda('confirmar');setNota('');setRecibo(undefined)
    try{const r=await tienda.comprar(q);if(vivo.current)await recibido(r)}catch(e){setIncierto(true);setAcepto(false);medirTienda('incierto');medirTienda('compra_error');medirTienda(e instanceof ErrorContratoTienda?'error_contrato':e instanceof ErrorPeticion&&[0,408].includes(e.status)?'error_red':e instanceof ErrorPeticion&&e.status>=500?'error_servidor':'error_rechazo');throw e}
  }
  async function cerrarIntento(){
    if(!ref||!socio)return
    const r=await tienda.cerrar(ref,!!recibo)
    if(r.estado==='confirmado'){await recibido(r.recibo,true);return}
    confirmarCompra(socio,'bolsa');setPendientes(p=>p.filter(x=>x!==ref));setRef(undefined);setQ(undefined);setRecibo(undefined);setIncierto(false);setNota('Intento cerrado.');setAbierta(false)
  }
  const saldo=yo?.saldo.total??0,puede=oferta?.disponible&&!errorOferta&&!comprobando&&!errorConsulta&&!incierto&&!ocupado&&!recibo
  const miembroActivo=!!yo?.membresia&&['activa','en_gracia'].includes(yo.membresia.estado)&&Date.parse(yo.membresia.hasta)>Date.parse(yo.ahora??new Date().toISOString())
  const encargo=`Buenas. Quiero cotizar ${tipo.toLowerCase()}. Cantidad: ${cantidad||'por definir'}. Fecha deseada: ${fecha||'por definir'}. Zona de retiro o entrega: ${zona||'por definir'}. ¿Qué opciones y condiciones tienen disponibles?`
  const fotoPublicada=oferta?.ficha.foto&&oferta.ficha.foto!==fotoFallida
  const fichaIncompleta=!!oferta&&(faltantesFicha(oferta.ficha).some(campo=>campo!=='fuente')||oferta.precio<=0)
  const retiroBreve=oferta?rangoRetiroTienda(oferta.ficha):''
  const lugarBreve=oferta?[oferta.ficha.lugar.trim(),oferta.ficha.horario.trim()].filter(Boolean).join(' · '):''
  const datosCafe=oferta?[['Origen',oferta.ficha.origen],['Proceso',oferta.ficha.proceso],['En tu taza',oferta.ficha.perfil]].filter(([,valor])=>valor.trim()):[]
  const fechaConsulta=fecha?(Number.isFinite(Date.parse(fecha+'T12:00:00-06:00'))?dia(fecha):fecha):'Por definir'
  return <><main id="contenido" tabIndex={-1} className="marco casa-tienda comercio-pagina tienda-experiencia">
    <section className="tienda-oferta" aria-labelledby="tienda-reserva">
      {fotoPublicada&&oferta?<figure className="tienda-fotografia tienda-foto-producto"><div className="tienda-imagen-ventana"><img src={oferta.ficha.foto} alt={oferta.ficha.fotoAlt} width={640} height={480} fetchPriority="high" onError={()=>setFotoFallida(oferta.ficha.foto)}/></div><figcaption>El café de este lote</figcaption></figure>:!ambienteFallido?<figure className="tienda-fotografia tienda-foto-ambiente"><div className="tienda-imagen-ventana"><img src={fotoAmbiente} srcSet="/images/latte-logo-mesa-240.webp 240w, /images/latte-logo-mesa-480.webp 480w, /images/latte-logo-mesa-960.webp 960w" sizes="(max-width: 700px) 100vw, 55vw" alt="Una taza de café de La Bella Lupita entre las manos" width={960} height={960} fetchPriority="high" onError={()=>setAmbienteFallido(true)}/></div><figcaption>Café servido en la casa · imagen de ambiente</figcaption></figure>:<div className="tienda-foto-editorial"><Icono nombre="local_cafe" tam={42}/><p>El gusto de llevar<br/>la casa con vos.</p><span>La Bella Lupita</span></div>}
      <div className="tienda-oferta-contenido"><div className="tienda-oferta-titulo"><Eyebrow>Tienda de la finca</Eyebrow><h1 id="tienda-reserva">{oferta?.ficha.nombre||'Reserva de Cosecha'}</h1><p>El café de la casa, para llevar con vos.</p></div>
      {cargando&&!oferta&&<p role="status">Consultando el lote y su precio…</p>}
      {errorOferta&&<div role="alert"><p>No pudimos actualizar la Tienda. {errorOferta}</p><Boton tono="claro" onClick={()=>void ofertaActual()}>Reintentar catálogo</Boton></div>}
      {oferta&&<Tarjeta className="tienda-comprar"><div className="tienda-precio-datos"><div className="tienda-lote-datos"><span>{oferta.ficha.gramos} g</span>{oferta.ficha.presentacion.trim()&&<span>{oferta.ficha.presentacion}</span>}</div>{oferta.precio>0&&<strong className="tienda-precio">{cordobas(oferta.precio)}</strong>}</div>
        <p className="tienda-modalidad">Preventa · retiro en la casa.</p>
        {(retiroBreve||lugarBreve)&&<div className="tienda-retiro-breve"><Icono nombre="storefront" tam={18}/><div>{retiroBreve&&<p>Retiro estimado: {retiroBreve}.</p>}{lugarBreve&&<p>{lugarBreve}</p>}</div></div>}
        {oferta.disponible&&!fichaIncompleta?<><Boton id="tienda-apartar" ancho className="mt-3" disabled={!puede||saldo<oferta.precio} onClick={()=>void accion(revisar)}>Apartar la mía</Boton>{saldo<oferta.precio?<><p className="mt-2 t-caption">Te faltan {cordobas(oferta.precio-saldo)} en la Cuenta de Casa.</p><Boton ancho tono="claro" className="mt-2" onClick={()=>{setRecarga(true);medirTienda('recarga')}}>Cómo recargar y continuar</Boton></>:<p className="mt-2 t-caption">Pagás hoy desde tu Cuenta de Casa. Saldo: {cordobas(saldo)}.</p>}</>:<><p role="status" className="tienda-disponibilidad">{oferta.motivo||'La casa está confirmando los detalles de este lote.'}</p><a className="tienda-consultar-lote" target="_blank" rel="noopener noreferrer" onClick={()=>medirTienda('agotado')} href={whatsapp(`Buenas. Quisiera consultar la disponibilidad y condiciones del lote ${oferta.generacion} de ${oferta.ficha.nombre||'Reserva de Cosecha'}.`)}>Consultar este lote <Icono nombre="arrow_forward" tam={18}/><span className="sr-only">por WhatsApp (abre otra pestaña)</span></a></>}
        {!fichaIncompleta&&oferta.disponible&&<p className="tienda-stock">Lote {oferta.generacion} · {oferta.quedan} de {oferta.total} disponibles</p>}
      </Tarjeta>}
      </div>
    </section>
    {(comprobando||errorConsulta||incierto||ref||recibo||error||nota)&&<div ref={foco} tabIndex={-1} className="tienda-estado space-y-3" aria-label="Estado de tu compra">
      {comprobando&&<p role="status">Comprobando si tenés un intento pendiente…</p>}
      {error&&!abierta&&<p role="alert" className="text-achiote">{error}</p>}{nota&&<p role="status">{nota}</p>}
      {incierto&&<p role="status">Conservamos tu referencia. Consultá el resultado antes de iniciar otra compra.</p>}
      {ref&&!recibo&&<><p className="break-all t-caption">Referencia: {ref}</p><Boton id="tienda-consultar" tono="claro" disabled={ocupado} onClick={()=>void accion(()=>consultar(ref))}>Consultar resultado</Boton>{!incierto&&<Boton tono="tenue" disabled={ocupado} onClick={()=>void accion(cerrarIntento)}>Descartar intento sin cobro</Boton>}</>}
      {errorConsulta&&<div role="alert"><p>No pudimos consultar tus compras pendientes. {errorConsulta} Reintentá antes de iniciar otra compra.</p><Boton id="tienda-reintentar" tono="claro" disabled={ocupado||comprobando} onClick={()=>void accion(async()=>{await comprobarIntentos();requestAnimationFrame(()=>{const destino=document.getElementById('tienda-reintentar')??document.getElementById('tienda-consultar')??document.getElementById('tienda-apartar');if(destino&&!destino.matches(':disabled'))destino.focus();else foco.current?.focus()})})}>Reintentar consulta de compras</Boton></div>}
      {pendientes.filter(p=>p!==ref).map(p=><Boton key={p} tono="claro" disabled={ocupado} onClick={()=>void accion(()=>consultar(p))}>Revisar intento {p.slice(-8)}</Boton>)}
      {recibo&&<Tarjeta><h3 className="t-seccion" role="status">Compra confirmada · bolsa {String(recibo.numero).padStart(3,'0')}</h3><p className="mt-2">Importe pagado: {cordobas(recibo.cobrado)}.</p><p className="t-caption">Saldo después de esa compra: {cordobas(recibo.saldo.total)}. Tu saldo actual se consulta en la Cuenta de Casa.</p>{recibo.compra&&<p className="break-all t-caption mt-2">Comprobante: bolsa:{recibo.compra}</p>}{recibo.cotizacion&&<CondicionesTienda ficha={recibo.cotizacion.oferta.ficha}/>}<Boton ancho className="mt-4" onClick={()=>{medirTienda('comprobante');navegar('/compras')}}>Ver comprobante y estado de entrega</Boton><Boton tono="claro" className="mt-2" disabled={ocupado} onClick={()=>void accion(cerrarIntento)}>Finalizar este intento</Boton></Tarjeta>}
    </div>}
    {oferta&&<section className="tienda-ficha" aria-label="Detalles del lote"><details className="tienda-desplegable"><summary>Sobre el café <Icono nombre="chevron_right" tam={20}/></summary><div className="tienda-ficha-panel" id="tienda-ficha-cafe">{datosCafe.length?<dl className="tienda-cafe-datos">{datosCafe.map(([etiqueta,valor])=><div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor}</dd></div>)}</dl>:<p>Los detalles de origen y proceso todavía no están publicados.</p>}</div></details><details className="tienda-desplegable"><summary>Retiro y condiciones <Icono nombre="chevron_right" tam={20}/></summary><div className="tienda-ficha-panel" id="tienda-ficha-retiro"><CondicionesTienda ficha={oferta.ficha}/></div></details></section>}
    <section className="tienda-beneficio" aria-labelledby="tienda-mes"><Icono nombre="local_cafe" tam={24}/><div className="tienda-beneficio-cuerpo"><h2 id="tienda-mes">La bolsa de tu membresía</h2><p>{miembroActivo?(yo?.bolsaDelMes?(yo.membresia?.contrato_version==='fundadora-2026-10'?'Ya retiraste la bolsa de este período pagado.':'Ya retiraste la bolsa de este mes.'):(yo?.membresia?.contrato_version==='fundadora-2026-10'?'Tu bolsa del período pagado está disponible.':'Tu bolsa de este mes está disponible.')):'Un beneficio de la Mesa Fundadora, aparte de esta compra.'}</p></div><Boton tono="tenue" onClick={()=>{medirTienda('beneficio');navegar('/club?beneficio=bolsa')}}>{miembroActivo&&!yo?.bolsaDelMes?'Mostrar mi beneficio de bolsa':'Ver mi membresía y beneficios'}</Boton></section>
    <details className="tienda-encargo tienda-desplegable"><summary id="tienda-encargo-titulo">Regalos y café para oficina <Icono nombre="chevron_right" tam={20}/></summary><div className="tienda-encargo-interior"><div className="tienda-encargo-intro"><p>Prepará tu consulta. La casa confirma las opciones y el precio.</p></div><div className="tienda-encargo-formulario"><label className="block">Tipo de encargo<select className="mt-1 w-full min-h-[44px] border border-contorno bg-papel p-3 text-tinta" value={tipo} onChange={e=>setTipo(e.target.value)}><option>Cajas de regalo</option><option>Café para oficina</option></select></label><label className="block">Cantidad aproximada (opcional)<input className="mt-1 w-full min-h-[44px] border border-contorno bg-papel p-3 text-tinta" maxLength={80} placeholder="Ej. 12 bolsas" value={cantidad} onChange={e=>setCantidad(e.target.value)}/></label><label className="block">Fecha deseada (opcional)<input className="mt-1 w-full min-h-[44px] border border-contorno bg-papel p-3 text-tinta" type="date" value={fecha} onChange={e=>setFecha(e.target.value)}/></label><label className="block">Zona de retiro o entrega (opcional)<input className="mt-1 w-full min-h-[44px] border border-contorno bg-papel p-3 text-tinta" maxLength={120} placeholder="Ej. retiro en la casa" value={zona} onChange={e=>setZona(e.target.value)}/></label></div><aside className="tienda-nota" aria-label="Vista previa de tu consulta"><div className="tienda-nota-marca"><Icono nombre="local_cafe" tam={26}/><span>Tu consulta, lista para conversar</span></div><p className="tienda-nota-titulo" key={tipo}>{tipo}</p><dl><div><dt>Cantidad</dt><dd>{cantidad||'Por definir'}</dd></div><div><dt>Cuándo</dt><dd>{fechaConsulta}</dd></div><div><dt>Dónde</dt><dd>{zona||'Por definir'}</dd></div></dl><a href={whatsapp(encargo)} target="_blank" rel="noopener noreferrer" onClick={()=>medirTienda('encargo')} className="tienda-encargo-enviar">Preparar consulta por WhatsApp <Icono nombre="arrow_forward" tam={20}/><span className="tienda-enlace-aviso">Abre otra pestaña</span></a><p className="tienda-nota-aclaracion">Revisás el mensaje antes de enviarlo. No es una reserva ni una compra.</p></aside></div></details>
    <Boton tono="tenue" onClick={()=>navegar('/compras')}>Mis compras y ayuda</Boton>
  </main>
  <Hoja abierta={abierta} bloqueada={ocupado} alCerrar={cerrarDialogo} titulo="Confirmá tu Reserva de Cosecha">
    {q&&<><p className="mt-3">Lote {q.oferta.generacion} · {q.oferta.ficha.gramos} g · {q.oferta.ficha.presentacion}</p><p className="font-semibold mt-2">Total a pagar: {cordobas(q.oferta.precio)}</p><CondicionesTienda ficha={q.oferta.ficha}/><label className="flex items-start gap-3 mt-4 min-h-[44px]"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={acepto} disabled={ocupado||incierto} onChange={e=>setAcepto(e.target.checked)}/><span>Acepto el precio y las condiciones de esta preventa.</span></label></>}
    {error&&<p id="tienda-error-compra" tabIndex={-1} role="alert" className="text-achiote mt-3">{error}</p>}{ocupado&&<p role="status">Consultando la compra. Conservamos tu referencia.</p>}
    {incierto?<Boton ancho className="mt-4" disabled={ocupado} onClick={()=>void accion(async()=>{if(ref)await consultar(ref);setAbierta(false)})}>Consultar resultado de la compra</Boton>:<Boton ancho className="mt-4" cargando={ocupado} disabled={!q||!acepto||ocupado} onClick={()=>void accion(comprar)}>Pagar {q?cordobas(q.oferta.precio):''} y apartar</Boton>}
  </Hoja>
  <Hoja abierta={recarga} bloqueada={ocupado} alCerrar={()=>{if(!ocupado)setRecarga(false)}} titulo="Recargá y seguí en Tienda"><p className="mt-3">Pedí una recarga para tu Cuenta de Casa en el mostrador. El equipo confirma el pago y el saldo aparece en tu cuenta.</p><p className="mt-2">Este intento no reserva inventario hasta confirmar el pago de la bolsa.</p><Boton ancho className="mt-4" cargando={ocupado} onClick={()=>void accion(async()=>{await refrescar();await ofertaActual();setRecarga(false)})}>Ya recargué: actualizar saldo</Boton></Hoja></>
}
