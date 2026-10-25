import { useEffect, useState } from 'react'
import { Boton } from './Base'
import { Tarjeta } from './Superficies'
import { REGLAS_CLUB } from '../../compartido/reglas-club'
import { operacion } from '../operacion'
export function EntregaVale({token}:{token:string}) {
  const [ahora,actualizarHora]=useState(Date.now())
  useEffect(()=>{const t=setInterval(()=>actualizarHora(Date.now()),1000);return()=>clearInterval(t)},[])
  const [codigo,escribir]=useState(''),[vale,mostrar]=useState<{nombre:string;vence:string;usado:string|null;reglas_version?:string|null}|null>(null),[error,fallar]=useState(''),[mensaje,informar]=useState(''),[ocupado,ocupar]=useState(false)
  const [bebida,setBebida]=useState(''),[bebidas,setBebidas]=useState<{id:string;nombre:string}[]>([])
  useEffect(()=>{void operacion<{bebidas:{id:string;nombre:string}[]}>('/operacion/reglas-club',undefined,token).then(r=>setBebidas(r.bebidas)).catch(e=>fallar(e.message))},[token])
  async function ejecutar(fn:()=>Promise<void>){if(ocupado)return;ocupar(true);fallar('');informar('');try{await fn()}catch(e){fallar((e as Error).message)}finally{ocupar(false)}}
  return <Tarjeta><h2 className="t-seccion">Premio por sellos</h2><p className="equipo-nota mt-3">Validá el código de 8 caracteres antes de entregar la bebida de cortesía.</p>
    <form className="mt-3 space-y-3" onSubmit={e=>{e.preventDefault();void ejecutar(async()=>mostrar(await operacion('/operacion/vale/consultar',{codigo},token)))}}>
      <label className="block t-caption">Código del vale<input disabled={ocupado} className="mt-2 min-h-12 w-full rounded-troquel border border-filete bg-papel px-3 py-2 text-tinta" required pattern="[A-Z0-9]{8}" maxLength={8} value={codigo} onChange={e=>{escribir(e.target.value.trim().toUpperCase());mostrar(null);setBebida('')}}/></label>
      <Boton type="submit" tono="claro" cargando={ocupado}>Consultar vale</Boton>
    </form>
    {vale&&<div className="mt-3 space-y-3"><p>{vale.nombre}</p>{vale.usado?<p>Este vale ya fue entregado</p>:Date.parse(vale.vence)<=ahora?<p role="alert">Este vale venció. Pedí un código actualizado.</p>:<><p className="t-caption">Confirmá solo al entregar la bebida al titular.</p>{vale.reglas_version===REGLAS_CLUB.version?<label className="block">Bebida entregada, presentación regular y sin extras<select className="block w-full min-h-12" value={bebida} onChange={e=>setBebida(e.target.value)}><option value="">Elegí la bebida</option>{bebidas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}</select></label>:<p>Premio anterior: respetá las condiciones con las que se ganó.</p>}<Boton disabled={vale.reglas_version===REGLAS_CLUB.version&&!bebida} cargando={ocupado} onClick={()=>void ejecutar(async()=>{await operacion('/vale/quemar',{codigo,bebida},token);mostrar(null);escribir('');informar('Bebida entregada y vale utilizado.')})}>Confirmar entrega de la bebida</Boton></>}</div>}
    {error&&<p role="alert" className="mt-3 text-achiote">{error}</p>}{mensaje&&<p role="status" className="mt-3 text-banda">{mensaje}</p>}
  </Tarjeta>
}
