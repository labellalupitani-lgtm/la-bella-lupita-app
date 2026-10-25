import { useEffect, useRef, useState } from 'react'
import { Boton } from '../componentes/Base'
import { Hoja } from '../componentes/Superficies'
import { cordobas } from '../datos'
import { operacion, type PedidoOperativo } from '../operacion'
import { Aviso, Estado, fechaHora, Lista, useAccion, type ContextoLista } from './comun'
import { CartaOperacion } from './CartaOperacion'
import { FichasCarta } from './FichasCarta'
import { MetricasCarta } from './MetricasCarta'

export function PedidosEquipo({token,cocina,administrar=false}:{token:string;cocina:boolean;administrar?:boolean}){
  return <><Lista<PedidoOperativo> tipo="pedidos" token={token} inicial="activos" conFecha buscar="Cliente o número de pedido" estados={[
    ['activos','Activos'],['recibido','Recibidos'],['aceptado','Aceptados'],['preparando','En preparación'],['listo','Listos'],['entregado','Entregados'],['cancelado','Cancelados'],['todos','Todo el historial'],
  ]}>{ctx=><Bandeja {...ctx} token={token} cocina={cocina} administrar={administrar}/>}</Lista>{(cocina||administrar)&&<section className="equipo-herramientas"><h2>Herramientas de la carta</h2><CartaOperacion token={token} cocina={cocina}/><FichasCarta token={token}/>{administrar&&<MetricasCarta token={token}/>}</section>}</>
}
function Bandeja({filas,refrescar,token,cocina,administrar,actualizado}:ContextoLista<PedidoOperativo>&{token:string;cocina:boolean;administrar:boolean}){
  const a=useAccion(),[cancelar,setCancelar]=useState<PedidoOperativo|null>(null),[motivo,setMotivo]=useState(''),[nuevos,setNuevos]=useState(0)
  const vistos=useRef<Set<string>>()
  const [reconocidas,reconocer]=useState<Record<string,boolean>>({})
  useEffect(()=>{const ids=new Set(filas.map(p=>p.id));if(vistos.current)setNuevos(filas.filter(p=>!vistos.current!.has(p.id)&&p.estado==='recibido').length);vistos.current=ids},[filas])
  const pasos:Record<string,[string,string]>={recibido:['aceptado','Aceptar pedido'],aceptado:['preparando','Comenzar preparación'],preparando:['listo','Marcar listo'],listo:['entregado','Confirmar entrega']}
  const cambiar=async(p:PedidoOperativo,estado:string)=>{if(await a.ejecutar(async()=>{await operacion('/operacion/pedidos/'+p.id+'/estado',{estado,...(estado==='preparando'&&p.restriccion_confirmada?{restriccionReconocida:reconocidas[p.id]===true}:{}),...(estado==='cancelado'?{motivo,excepcional:['preparando','listo'].includes(p.estado)}: {})},token)},`Pedido #${p.numero}: ${estado}.`)){setCancelar(null);await refrescar()}}
  return <><Aviso flotante error={a.error} mensaje={a.mensaje}/>{nuevos>0&&<p role="status" className="equipo-aviso">{nuevos} {nuevos===1?'pedido nuevo en esta página':'pedidos nuevos en esta página'}</p>}
    <div className="equipo-pedidos">{filas.map(p=>{
      const paso=pasos[p.estado],minutos=Math.max(0,Math.floor((Date.parse(actualizado)-Date.parse(p.creado))/60000))
      return <article className="equipo-pedido" data-estado={p.estado} key={p.id}><div className="equipo-fila-titulo"><h2>Pedido #{p.numero}</h2><Estado valor={p.estado}/></div>
        <p className="equipo-cliente">{p.nombre}</p><p className="equipo-nota">{fechaHora(p.creado)}{!['entregado','cancelado'].includes(p.estado)&&` · ${minutos} min desde el ingreso`}</p>
        {p.restriccion_confirmada&&<p className="equipo-aviso"><strong>Restricción confirmada para este pedido:</strong> {p.restriccion_confirmada}</p>}
        {p.restriccion_confirmada&&p.estado==='aceptado'&&<label className="flex items-start gap-3 my-3"><input type="checkbox" className="size-5 shrink-0" checked={reconocidas[p.id]===true} onChange={e=>reconocer({...reconocidas,[p.id]:e.target.checked})}/>Leí la restricción y confirmé con el equipo cómo atenderla antes de preparar. Si no podemos, hay que coordinar con el cliente.</label>}
        {p.estimacion_minutos&&minutos>p.estimacion_minutos&&!['entregado','cancelado','listo'].includes(p.estado)&&<p role="status" className="equipo-aviso">Superó la estimación de {p.estimacion_minutos} minutos. Revisá el pedido e informá al cliente.</p>}
        <ul>{p.lineas.map((l,i)=><li key={i}><span>{l.cuanto} × {l.nombre}{l.opciones?.map((o,n)=><small key={n} className="block">{o.nombre}: {o.valor}</small>)}</span>{!cocina&&l.precio!==undefined&&<span>{cordobas(l.cuanto*l.precio)}</span>}</li>)}</ul>
        {!cocina&&!!p.empaque&&<p className="equipo-nota">Empaque incluido: {cordobas(p.empaque)}</p>}
        {!cocina&&p.total!==undefined&&<p className="equipo-total">Total <strong>{cordobas(p.total)}</strong></p>}{!cocina&&p.motivo&&<p className="equipo-nota">Cancelación: {p.motivo}</p>}
        <div className="equipo-acciones">{paso&&(!cocina||['preparando','listo'].includes(paso[0]))&&<Boton disabled={a.ocupado||!!p.restriccion_confirmada&&paso[0]==='preparando'&&!reconocidas[p.id]} onClick={()=>void cambiar(p,paso[0])}>{paso[1]}</Boton>}
          {!cocina&&(['recibido','aceptado'].includes(p.estado)||administrar&&['preparando','listo'].includes(p.estado))&&<Boton tono="tenue" disabled={a.ocupado} onClick={()=>{a.fallar('');setCancelar(p);setMotivo('')}}>{['preparando','listo'].includes(p.estado)?'Cancelar por incidencia':'Cancelar pedido'}</Boton>}
          {cocina&&p.estado==='recibido'&&<p className="equipo-nota">Caja debe aceptar este pedido para comenzar.</p>}
        </div></article>
    })}</div>
    <Hoja abierta={!!cancelar} alCerrar={()=>{if(!a.ocupado)setCancelar(null)}} titulo="Cancelar y devolver saldo">
      <p>Pedido #{cancelar?.numero} · {cancelar?.nombre}</p><p>Se devolverán {cordobas(cancelar?.total??0)} a la Cuenta de Casa. Esta acción no se puede deshacer.</p>
      <label className="equipo-campo">Motivo<textarea minLength={3} maxLength={240} value={motivo} onChange={e=>setMotivo(e.target.value)} disabled={a.ocupado}/></label>
      <Aviso error={a.error}/><Boton ancho cargando={a.ocupado} disabled={motivo.trim().length<3} onClick={()=>cancelar&&void cambiar(cancelar,'cancelado')}>Confirmar cancelación y devolución</Boton>
    </Hoja></>
}
