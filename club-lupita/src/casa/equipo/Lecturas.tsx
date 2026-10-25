import { MetricasInicio } from './MetricasInicio'
import { useState } from 'react'
import { Boton } from '../componentes/Base'
import { Hoja } from '../componentes/Superficies'
import { cordobas } from '../datos'
import { operacion } from '../operacion'
import { Aviso, Estado, fechaHora, Lista, Sincronizacion, useAccion, useLectura, type ContextoLista } from './comun'

type Entrega={id:string;tipo:string;nombre:string;telefono:string;detalle:string;fecha:string;completada:string|null;responsable:string|null}
export function EntregasEquipo({token}:{token:string}){
  return <Lista<Entrega> tipo="entregas" token={token} inicial="pendientes" conFecha buscar="Cliente, teléfono o comprobante" estados={[
    ['pendientes','Pendientes'],['bolsa','Bolsas pendientes'],['experiencia','Asistencias pendientes'],['entregadas','Completadas'],['todos','Todo el historial'],
  ]}>{ctx=><Entregas {...ctx} token={token}/>}</Lista>
}
function Entregas({filas,refrescar,token}:ContextoLista<Entrega>&{token:string}){
  const a=useAccion(),[seleccion,setSeleccion]=useState<Entrega|null>(null)
  return <><Aviso flotante error={a.error} mensaje={a.mensaje}/><div className="equipo-registros">{filas.map(e=><article className="equipo-registro" key={e.tipo+e.id}>
    <div><h2>{e.detalle}</h2><p>{e.nombre} · {e.telefono}</p><p className="equipo-nota">{e.tipo==='bolsa'?'Compra':'Actividad'}: {fechaHora(e.fecha)}</p><p className="equipo-nota">Comprobante {e.id.slice(0,8)}</p>{e.completada&&<p className="equipo-nota">Registrado {fechaHora(e.completada)}</p>}</div>
    {e.completada?<Estado valor="completada"/>:<Boton tono="claro" disabled={a.ocupado} aria-label={`${e.tipo==='bolsa'?'Registrar entrega':'Registrar asistencia'} de ${e.detalle}, ${e.nombre}`} onClick={()=>{a.fallar('');setSeleccion(e)}}>{e.tipo==='bolsa'?'Registrar entrega':'Registrar asistencia'}</Boton>}
  </article>)}</div>
    <Hoja abierta={!!seleccion} alCerrar={()=>{if(!a.ocupado)setSeleccion(null)}} titulo={seleccion?.tipo==='bolsa'?'Confirmar entrega':'Confirmar asistencia'}>
      <p><strong>{seleccion?.nombre}</strong> · {seleccion?.telefono}</p><p>{seleccion?.detalle}</p><p className="equipo-nota">{seleccion&&fechaHora(seleccion.fecha)} · Comprobante {seleccion?.id.slice(0,8)}</p><p className="my-4">Confirmá después de atender a esta persona. El registro quedará asociado a tu acceso.</p><Aviso error={a.error}/>
      <Boton ancho cargando={a.ocupado} onClick={()=>void (async()=>{if(!seleccion)return;const e=seleccion;if(await a.ejecutar(async()=>{await operacion('/operacion/entregas/'+e.tipo+'/'+e.id,{},token)},`${e.detalle}: registro confirmado para ${e.nombre}.`)){setSeleccion(null);await refrescar()}})()}>Confirmar registro</Boton>
    </Hoja></>
}
export { AgendaEquipo } from './ReservasEquipo'

type Solicitud={categoria:string;id:string;nombre:string;mensaje:string;creada:string;estado:string;respuesta:string|null;resuelta:string|null}
export function AtencionPersonal({token}:{token:string}){
  return <Lista<Solicitud> tipo="atencion" token={token} inicial="pendiente" buscar="Cliente o texto de la solicitud" estados={[
    ['pendiente','Pendientes'],['resuelta','Resueltas'],['todos','Todo el historial'],
  ]}>{ctx=><Solicitudes {...ctx} token={token}/>}</Lista>
}
function Solicitudes({filas,refrescar,token}:ContextoLista<Solicitud>&{token:string}){
  const [elegida,setElegida]=useState<Solicitud|null>(null),[respuesta,setRespuesta]=useState(''),a=useAccion()
  return <><Aviso flotante error={a.error} mensaje={a.mensaje}/><div className="equipo-registros">{filas.map(s=><article className="equipo-registro" key={s.id}><div><h2>{s.nombre}</h2><p className="equipo-nota">{fechaHora(s.creada)} · Solicitud {s.id.slice(0,8)}</p><p className="equipo-nota">Motivo: {s.categoria}</p><p>{s.mensaje}</p>{s.respuesta&&<blockquote><strong>Respuesta de la casa:</strong> {s.respuesta}</blockquote>}</div>{s.estado==='pendiente'?<Boton tono="claro" onClick={()=>{setElegida(s);setRespuesta('');a.fallar('')}}>Responder a {s.nombre}</Boton>:<Estado valor="resuelta"/>}</article>)}</div>
    <Hoja abierta={!!elegida} alCerrar={()=>{if(!a.ocupado)setElegida(null)}} titulo="Responder solicitud"><p><strong>{elegida?.nombre}</strong></p><p>{elegida?.mensaje}</p><form onSubmit={e=>{e.preventDefault();void (async()=>{if(!elegida)return;if(await a.ejecutar(async()=>{await operacion('/operacion/atencion/'+elegida.id+'/responder',{respuesta},token)},'Respuesta enviada y solicitud resuelta.')){setElegida(null);await refrescar()}})()}}>
      <label className="equipo-campo">Respuesta al cliente<textarea required minLength={5} maxLength={1000} value={respuesta} disabled={a.ocupado} onChange={e=>setRespuesta(e.target.value)}/></label><p className="equipo-nota">Esta respuesta cierra la solicitud. No cambia el acceso, los datos, las reservas ni el dinero. En solicitudes de cuenta, documentá qué se verificó y qué se resolvió; nunca pidas contraseñas ni códigos. Si falta una gestión, explicá el siguiente paso y no afirmes que se completó.</p><Aviso error={a.error}/><Boton type="submit" ancho cargando={a.ocupado} disabled={respuesta.trim().length<5}>Enviar respuesta y resolver</Boton>
    </form></Hoja></>
}
type Resumen={pedidos:number;nuevos:number;entregas:number;solicitudes:number;mesas:number;importe:number}
export function ResumenEquipo({token,navegar}:{token:string;navegar:(s:string)=>void}){
  const l=useLectura<Resumen>('/operacion/resumen',token)
  return <><Sincronizacion {...l}/><Aviso error={l.error}/>{!l.datos&&l.cargando&&<p role="status">Preparando el resumen…</p>}{l.datos&&<>
    <div className="equipo-indicadores">{[
      ['Pedidos activos',l.datos.pedidos,'pedidos',`${l.datos.nuevos} por aceptar`],['Entregas pendientes',l.datos.entregas,'entregas','Bolsas y asistencias'],['Mesas de hoy',l.datos.mesas,'agenda','Reservas no canceladas'],['Solicitudes abiertas',l.datos.solicitudes,'atencion','Clientes esperando respuesta'],
    ].map(([titulo,valor,seccion,detalle])=><button key={titulo} onClick={()=>navegar(String(seccion))}><span>{titulo}</span><strong>{valor}</strong><small>{detalle}</small><span className="equipo-ver">Ver sección →</span></button>)}</div>
    <section className="equipo-resumen-inferior"><div><p className="t-eyebrow">HOY EN LA APLICACIÓN</p><h2>{cordobas(Number(l.datos.importe))}</h2><p>Importe de pedidos no cancelados. No incluye recargas, membresías ni ventas externas.</p><Boton tono="claro" onClick={()=>navegar('informes')}>Consultar informes</Boton></div><div><h2>Atención en caja</h2><p>Buscá un cliente para registrar sellos o recargas. Consultá códigos para entregar premios y beneficios.</p><Boton onClick={()=>navegar('caja')}>Abrir caja</Boton></div></section>
  </>}</>
}
type Metricas={pedidos:number;entregados:number;cancelados:number;ventas:number;clientes:number;actualizado:string;dias:number}
type Auditoria={id:string;cuando:string;accion:string;responsable:string;cliente:string|null;detalle:Record<string,unknown>}
export function InformesEquipo({token}:{token:string}){
  const [dias,setDias]=useState('30'),l=useLectura<Metricas>('/operacion/metricas?dias='+dias,token)
  function exportar(){if(!l.datos)return;const d=l.datos;const csv='\uFEFFIndicador,Valor\r\nDías,'+d.dias+'\r\nPedidos,'+d.pedidos+'\r\nEntregados,'+d.entregados+'\r\nCancelados,'+d.cancelados+'\r\nClientes con pedidos,'+d.clientes+'\r\nImporte de pedidos (C$),'+(Number(d.ventas)/100).toFixed(2)+'\r\nActualizado,'+d.actualizado;const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='pedidos-'+d.dias+'-dias.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  return <><div className="equipo-filtros"><label>Período<select value={dias} onChange={e=>setDias(e.target.value)}>{[1,7,30,90].map(d=><option value={d} key={d}>{d===1?'Últimas 24 horas':'Últimos '+d+' días'}</option>)}</select></label><Boton tono="claro" disabled={!l.datos||!!l.error||l.cargando} onClick={exportar}>Exportar cifras CSV</Boton></div><Sincronizacion {...l}/><Aviso error={l.error}/><p className="equipo-nota">Importe de pedidos registrados en la aplicación, excluyendo cancelados. No incluye recargas, membresías ni ventas externas.</p>
    {!l.datos&&l.cargando&&<p role="status">Calculando cifras…</p>}{l.datos&&<dl className="equipo-cifras">{[['Pedidos',l.datos.pedidos],['Entregados',l.datos.entregados],['Cancelados',l.datos.cancelados],['Clientes con pedidos',l.datos.clientes],['Importe de pedidos',cordobas(Number(l.datos.ventas))]].map(([n,v])=><div key={n}><dt>{n}</dt><dd>{v}</dd></div>)}</dl>}
    <MetricasInicio token={token} dias={dias}/><h2 className="equipo-subtitulo">Registro de actividad</h2><p className="equipo-nota">Operaciones registradas y su responsable.</p><Lista<Auditoria> tipo="auditoria" token={token} inicial="todos" conFecha buscar="Acción, responsable o cliente" estados={[["todos","Todas"]]}>{({filas})=><div className="equipo-registros">{filas.map(a=><article className="equipo-registro" key={a.id}><div><h3>{a.accion.replaceAll('_',' ')}</h3><p>{a.responsable}{a.cliente?' · '+a.cliente:''}</p><p className="equipo-nota">{fechaHora(a.cuando)} · Registro {a.id}</p><details><summary>Ver detalle del registro</summary><pre>{JSON.stringify(a.detalle,null,2)}</pre></details></div></article>)}</div>}</Lista>
  </>
}
