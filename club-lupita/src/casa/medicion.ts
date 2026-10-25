import { csrfCliente, sesion } from './sesion-cliente'
import type { EventoInicio } from '../compartido/metricas-inicio'

/** Contadores agregados opcionales. Nunca envía contenido, identidad ni códigos. */
export function medir(evento:EventoInicio,duracion=0) {
  if(!sesion.leer()||navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return
  const signal=AbortSignal.timeout(5000)
  void fetch('/api/inicio/evento',{method:'POST',credentials:'same-origin',signal,headers:{'content-type':'application/json','x-cliente-solicitud':'1','x-cliente-csrf':csrfCliente()},body:JSON.stringify({evento,dispositivo:innerWidth<768?'movil':innerWidth<1024?'tableta':'escritorio',duracion:Math.min(30_000,Math.max(0,Math.round(duracion)))})}).catch(()=>{})
}
let atribucion:{clase:'cosecha'|'experiencia';cuenta:string|null;hasta:number}|null=null
export function abrirOferta(clase:'cosecha'|'experiencia') {atribucion={clase,cuenta:sesion.leer(),hasta:performance.now()+30*60_000};medir('oferta_'+clase as EventoInicio)}
export function destinoOferta(clase:'cosecha'|'experiencia'){if(atribuible(clase))medir('destino_'+clase as EventoInicio)}
function atribuible(clase:string){return atribucion?.clase===clase&&atribucion.cuenta===sesion.leer()&&atribucion.hasta>performance.now()}
export function compraOferta(clase:'cosecha'|'experiencia'){if(atribuible(clase)){medir('compra_'+clase as EventoInicio);atribucion=null}}
