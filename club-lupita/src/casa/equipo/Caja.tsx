import { DescuentoClub } from './DescuentoClub'
import { useEffect, useState } from 'react'
import { Boton } from '../componentes/Base'
import { EntregaVale } from '../componentes/EntregaVale'
import { CajaCliente } from '../componentes/CajaCliente'
import { operacion } from '../operacion'
import { Aviso, fechaHora, useAccion } from './comun'

type Beneficio={reposicion?:boolean;contrato_version?:string;cafe_detalle?:string|null;nombre:string;clase:string;vence:string;entregado:string|null;vigente:boolean}
export function CajaEquipo({token,administrar=false}:{token:string;administrar?:boolean}){
  const [vista,setVista]=useState('cliente')
  return <><div className="equipo-pestanas" role="group" aria-label="Tareas de caja">{[['cliente','Cliente y recargas'],['beneficio','Beneficio de membresía'],['vale','Premio por sellos'],['descuento','Descuento de repostería']].map(([id,n],i)=><button key={id} aria-pressed={vista===id} onClick={()=>setVista(id)}><span className="equipo-caja-numero" aria-hidden="true">{String(i+1).padStart(2,'0')}</span>{n}</button>)}</div>
    <p className="equipo-caja-tarea">{vista==='cliente'?'Consultá la cuenta del cliente antes de registrar una recarga o un sello.':vista==='beneficio'?'Verificá el código, la persona y la vigencia antes de entregar su beneficio.':vista==='vale'?'Revisá el premio disponible y confirmá la entrega en caja.':'Consultá el pase y revisá los productos elegibles antes de confirmar el descuento.'}</p><div className="equipo-formulario equipo-caja-contenido" key={vista}>{vista==='cliente'?<CajaCliente token={token}/>:vista==='descuento'?<DescuentoClub token={token} administrar={administrar}/>:vista==='vale'?<EntregaVale token={token}/>:<BeneficioEquipo token={token}/>}</div>
  </>
}
function BeneficioEquipo({token}:{token:string}){
  const [codigo,setCodigo]=useState(''),[beneficio,setBeneficio]=useState<Beneficio|null>(null),[ahora,setAhora]=useState(Date.now()),a=useAccion()
  useEffect(()=>{const t=setInterval(()=>setAhora(Date.now()),1000);return()=>clearInterval(t)},[])
  const vencido=!!beneficio&&(!beneficio.vigente||Date.parse(beneficio.vence)<=ahora)
  return <section className="equipo-panel"><h2>Beneficio de membresía</h2><p className="equipo-nota">Pedí al cliente su código de 12 caracteres. Revisá el titular y la vigencia antes de entregar.</p><form onSubmit={e=>{e.preventDefault();setBeneficio(null);void a.ejecutar(async()=>setBeneficio(await operacion('/operacion/beneficios/consultar',{codigo},token)),'')}}>
    <label className="equipo-campo">Código del beneficio<input required pattern="[A-F0-9]{12}" minLength={12} maxLength={12} autoComplete="off" autoCapitalize="characters" aria-describedby="ayuda-beneficio" value={codigo} disabled={a.ocupado} onChange={e=>{setCodigo(e.target.value.trim().toUpperCase());setBeneficio(null);a.fallar('');a.informar('')}}/></label><p id="ayuda-beneficio" className="equipo-nota">12 caracteres: números y letras de A a F.</p><Aviso error={a.error} mensaje={a.mensaje}/><Boton type="submit" tono="claro" cargando={a.ocupado}>Consultar beneficio</Boton>
    </form>{beneficio&&<div className="equipo-resultado"><h3>{beneficio.nombre}</h3><p>{beneficio.reposicion?'Reposición autorizada · ':''}{beneficio.clase==='bebida_dia'?'Café filtrado del día':beneficio.contrato_version==='anterior'?'Bolsa de 250 g · mes calendario':'Bolsa de 250 g · período pagado'}</p>{beneficio.clase==='bebida_dia'&&beneficio.cafe_detalle&&<p>{beneficio.cafe_detalle}</p>}<p className="equipo-nota">Vence {fechaHora(beneficio.vence)}</p>{beneficio.entregado?<p role="status">Este beneficio ya fue entregado.</p>:vencido?<p className="equipo-aviso equipo-aviso-error" role="alert">El código o la membresía no está vigente. Pedí al cliente que actualice su beneficio.</p>:<><p>Confirmá al entregar el producto al titular.</p><Boton cargando={a.ocupado} onClick={()=>void a.ejecutar(async()=>{await operacion('/operacion/beneficios/entregar',{codigo},token);setBeneficio(null);setCodigo('')},'Entrega de beneficio registrada.')}>Confirmar entrega del beneficio</Boton></>}</div>}
  </section>
}
