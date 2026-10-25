import { useEffect, useRef, useState } from 'react'
import { Boton } from './Base'
import { operacion } from '../operacion'
import { medirClub, medirTiempoClub } from '../club'
import { useDatos } from '../datos'

export function CodigoBeneficio({clase,reposicion,entregada=false,alConsultar}:{clase:'bebida_dia'|'bolsa_mes';reposicion?:string;entregada?:boolean;alConsultar?:()=>Promise<void>}){
  const {yo,refrescarCuenta}=useDatos(),[vale,setVale]=useState<{codigo:string;limite:number}|null>(null),[restan,setRestan]=useState(0),[ocupado,setOcupado]=useState(false),[error,setError]=useState('')
  const bloqueo=useRef(false),vivo=useRef(true)
  const entregado=reposicion?entregada:clase==='bebida_dia'?yo?.bebidaDelDia:yo?.bolsaDelMes
  useEffect(()=>{vivo.current=true;return()=>{vivo.current=false}},[])
  async function emitir(){
    if(bloqueo.current)return;bloqueo.current=true;setOcupado(true);setError('');medirClub('beneficio_intento')
    const inicio=performance.now()
    try{const r=await operacion<{codigo:string;vence:string;ahora:string}>(reposicion?'/club/reposiciones/'+reposicion+'/codigo':'/beneficios/solicitar',{clase});if(!vivo.current){medirTiempoClub('codigo','cancelado',performance.now()-inicio);return}
      if(!r||typeof r.codigo!=='string'||!/^[A-Z0-9]{6,12}$/.test(r.codigo)||!Number.isFinite(Date.parse(r.vence))||!Number.isFinite(Date.parse(r.ahora)))throw Error('No pudimos comprobar el código. Reintentá sin consumir tu beneficio.')
      const segundos=Math.max(0,Math.floor((Date.parse(r.vence)-Date.parse(r.ahora)-(performance.now()-inicio))/1000))
      setVale({codigo:r.codigo,limite:performance.now()+segundos*1000});setRestan(segundos);medirClub('beneficio_ok');medirTiempoClub('codigo','correcto',performance.now()-inicio)
    }catch(e){medirTiempoClub('codigo',vivo.current?'error':'cancelado',performance.now()-inicio);if(vivo.current){setError((e as Error).message);medirClub('beneficio_error');void refrescarCuenta(true)}}finally{bloqueo.current=false;if(vivo.current)setOcupado(false)}
  }
  useEffect(()=>{void emitir()},[clase])
  useEffect(()=>{if(!vale)return;const tic=()=>setRestan(Math.max(0,Math.ceil((vale.limite-performance.now())/1000)));const reloj=setInterval(tic,500);document.addEventListener('visibilitychange',tic);return()=>{clearInterval(reloj);document.removeEventListener('visibilitychange',tic)}},[vale])
  useEffect(()=>{const reloj=setInterval(()=>{if(document.visibilityState==='visible'){void refrescarCuenta(true);void alConsultar?.()}},10000);return()=>clearInterval(reloj)},[refrescarCuenta,alConsultar])
  return <div className="cuenta-codigo-beneficio space-y-4" aria-busy={ocupado}>
    <p>La entrega la confirma el personal. Mostrar el código no consume tu beneficio.</p>
    {entregado?<p role="status">La casa registró la entrega de este beneficio.</p>:vale&&restan>0?<><p className="club-codigo">{vale.codigo}</p><p>Vence en {Math.floor(restan/60)} min {restan%60} s.</p></>:vale?<p role="status">El código venció. Podés generar otro sin perder el beneficio.</p>:<p role="status">Preparando tu código…</p>}
    {error&&<p role="alert" className="text-achiote">{error}</p>}
    {!entregado&&<Boton ancho cargando={ocupado} disabled={!!vale&&restan>0} onClick={()=>void emitir()}>{error?'Reintentar código':'Generar código vigente'}</Boton>}
    <Boton ancho tono="tenue" onClick={()=>{void refrescarCuenta(true);void alConsultar?.()}}>Comprobar entrega</Boton>
  </div>
}
