import {useState} from 'react'
import {Boton} from '../componentes/Base'
import {Hoja} from '../componentes/Superficies'
import {cordobas} from '../datos'
import {operacion} from '../operacion'
import {Aviso,fechaHora,useAccion,useLectura} from './comun'

type Linea={id:string;nombre:string;cuanto:number;precioAntes:number;precio:number}
type Calculo={nombre:string;ticket:string;hasta:string;lineas:Linea[];subtotal:number;descuento:number;total:number;huella:string}
type Registro={id:string;nombre:string;ticket:string;subtotal:number;descuento:number;total:number;creado:string;anulado:string|null;motivo:string|null}
export function DescuentoClub({token,administrar}:{token:string;administrar:boolean}){
 const productos=useLectura<{porcentaje:number;productos:{id:string;nombre:string;precio:number}[]}>('/operacion/club-caja/productos',token)
 const [pase,setPase]=useState(''),[ticket,setTicket]=useState(''),[cantidades,setCantidades]=useState<Record<string,number>>({})
 const [q,setQ]=useState<Calculo|null>(null),[acepto,setAcepto]=useState(false),[consulta,setConsulta]=useState(''),[busqueda,setBusqueda]=useState('')
 const [anulando,setAnulando]=useState<Registro|null>(null),[motivo,setMotivo]=useState('')
 const registros=useLectura<{registros:Registro[]}>('/operacion/club-caja/registros?ticket='+encodeURIComponent(busqueda),token),a=useAccion()
 const lineas=Object.entries(cantidades).filter(([,cuanto])=>cuanto>0).map(([id,cuanto])=>({id,cuanto}))
 const limpiarRevision=()=>{setQ(null);setAcepto(false);a.fallar('');a.informar('')}
 return <section className="space-y-4"><h2 className="equipo-subtitulo">Descuento de Mesa Fundadora en caja</h2>
  <p>Calculá el {productos.datos?.porcentaje??15}% sobre los productos confirmados por la casa y a los precios de Carta que se muestran aquí. El registro deja constancia del descuento aplicado en el comprobante físico; no cobra ni descuenta saldo de la Cuenta de Casa.</p>
  <p className="equipo-nota">Si el comprobante tiene otro precio, extras u otra promoción, pedí a administración que revise el caso antes de registrarlo. Este total corresponde solamente a los productos seleccionados.</p>
  <Aviso error={productos.error||a.error} mensaje={a.mensaje}/>
  {!productos.cargando&&!productos.datos?.productos.length&&<p role="status">La casa todavía no confirmó productos de repostería. El propietario puede seleccionarlos en Personal → Mi Club.</p>}
  <form className="equipo-formulario space-y-3" onSubmit={e=>{e.preventDefault();setAcepto(false);void a.ejecutar(async()=>setQ(await operacion('/operacion/club-caja/cotizar',{pase,ticket,lineas},token)),'')}}>
   <label className="block">Código del pase del cliente<input className="block w-full" required pattern="[A-F0-9]{12}" minLength={12} maxLength={12} autoComplete="off" disabled={a.ocupado} value={pase} onChange={e=>{setPase(e.target.value.trim().toUpperCase());limpiarRevision()}}/></label>
   <label className="block">Referencia del comprobante físico<input className="block w-full" required minLength={8} maxLength={64} disabled={a.ocupado} value={ticket} onChange={e=>{setTicket(e.target.value);limpiarRevision()}}/></label>
   <fieldset disabled={a.ocupado}><legend>Productos y cantidades</legend>{productos.datos?.productos.map(p=><label className="block my-3" key={p.id}>{p.nombre} · {cordobas(p.precio)}<input className="block w-full" type="number" min={0} max={20} step={1} value={cantidades[p.id]??0} onChange={e=>{setCantidades({...cantidades,[p.id]:Number(e.target.value)});limpiarRevision()}}/></label>)}</fieldset>
   <Boton type="submit" cargando={a.ocupado} disabled={!lineas.length}>Revisar descuento de este comprobante</Boton>
  </form>
  <details className="space-y-3"><summary className="min-h-[44px] cursor-pointer font-semibold">Consultar registros y recuperar una confirmación</summary><p>Si se perdió una respuesta, buscá la misma referencia antes de registrar otro comprobante.</p>
   <form className="flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();setBusqueda(consulta)}}><label>Buscar referencia de comprobante<input className="block" maxLength={64} value={consulta} onChange={e=>setConsulta(e.target.value)}/></label><Boton tono="claro" type="submit">Consultar registros</Boton><Boton tono="tenue" onClick={()=>void registros.refrescar()}>Actualizar registros</Boton></form>
   <Aviso error={registros.error}/><ul className="space-y-4">{registros.datos?.registros.map(r=><li key={r.id}><strong>{r.ticket} · {r.nombre}</strong><p>{fechaHora(r.creado)} · Descuento {cordobas(r.descuento)}. Productos seleccionados: {cordobas(r.total)}.</p>{r.anulado?<p>Anulado: {r.motivo}. El registro original se conserva.</p>:administrar&&<Boton tono="claro" onClick={()=>{setAnulando(r);setMotivo('');a.fallar('')}}>Revisar anulación · {r.ticket}</Boton>}</li>)}</ul>{!registros.cargando&&!registros.datos?.registros.length&&<p>No hay registros para esta consulta.</p>}
  </details>
  <Hoja abierta={!!q} bloqueada={a.ocupado} alCerrar={()=>setQ(null)} titulo="Confirmar descuento de repostería"><div className="space-y-3 mt-3"><p>{q?.nombre} · Comprobante {q?.ticket}</p><ul>{q?.lineas.map(l=><li key={l.id}>{l.cuanto} × {l.nombre}: {cordobas(l.precioAntes)} → {cordobas(l.precio)} por unidad.</li>)}</ul><p>Subtotal elegible: {cordobas(q?.subtotal??0)}. Descuento: {cordobas(q?.descuento??0)}.</p><p className="font-semibold">Importe de estos productos después del descuento: {cordobas(q?.total??0)}.</p><label className="flex gap-3 min-h-[44px]"><input type="checkbox" checked={acepto} disabled={a.ocupado} onChange={e=>setAcepto(e.target.checked)}/>Verifiqué el cliente, las porciones individuales y sus precios; excluí extras y encargos, no acumulé promociones y apliqué este descuento en el comprobante físico.</label><Aviso error={a.error}/><Boton ancho cargando={a.ocupado} disabled={!acepto} onClick={()=>void a.ejecutar(async()=>{if(!q)return;const r=await operacion<{registrado:boolean;anulado?:string}>('/operacion/club-caja/registrar',{pase,ticket,lineas,huella:q.huella,confirmo:true},token);if(!r.registrado||r.anulado)throw Error('El registro fue anulado o no pudo confirmarse. Consultá su historial.');setQ(null);await registros.refrescar()},'Descuento registrado. No se realizó ningún cobro desde la aplicación.')}>Confirmar descuento aplicado</Boton></div></Hoja>
  <Hoja abierta={!!anulando} bloqueada={a.ocupado} alCerrar={()=>setAnulando(null)} titulo="Anular registro de descuento"><p className="my-3">{anulando?.ticket} · {anulando?.nombre}. Esta acción conserva el registro y deja un motivo de anulación. No devuelve dinero ni modifica el comprobante externo; la corrección de caja debe estar resuelta.</p><label className="block">Motivo y corrección realizada<textarea className="w-full my-3" value={motivo} minLength={5} maxLength={500} onChange={e=>setMotivo(e.target.value)}/></label><Aviso error={a.error}/><Boton ancho cargando={a.ocupado} disabled={motivo.trim().length<5} onClick={()=>void a.ejecutar(async()=>{if(!anulando)return;await operacion('/operacion/club-caja/'+anulando.id+'/anular',{motivo,confirmo:true},token);setAnulando(null);await registros.refrescar()},'Anulación registrada con su motivo.')}>Confirmar anulación del registro</Boton></Hoja>
 </section>
}
