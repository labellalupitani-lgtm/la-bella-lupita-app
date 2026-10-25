import { operacion } from './operacion'
import { CONTRATO_CLUB, type EventoClub } from '../compartido/club'
import { csrfCliente, sesion } from './sesion-cliente'
export type ConfigClub={reglas_version?:string|null;reposteria_productos?:string[];version:number;cafe_detalle:string|null;sellos_regla:string|null;premio_detalle:string|null;vip_regla:string|null}
export type ContratoGuardado=typeof CONTRATO_CLUB&{operacion:ConfigClub}
export type EstadoClub={descuentos?:{id:string;ticket:string;subtotal:number;descuento:number;total:number;creado:string;anulado:string|null;motivo:string|null}[];reposiciones:{id:string;clase:'bebida_dia'|'bolsa_mes';creada:string;motivo:string;entregada:string|null}[];contrato:typeof CONTRATO_CLUB;config:ConfigClub;ultima:{numero:number;hasta:string;estado:string;cuota:number;autorenueva:boolean;motivo_fin:string|null;contrato_version:string;contrato_detalle?:ContratoGuardado|null}|null;espera:{creada:string;contactada:string|null}|null;eventos:{id:string;evento:string;creado:string;detalle:{hasta?:string;cuota?:number;version?:string;condiciones?:ContratoGuardado|null}}[];ahora:string}
export const leerClub=()=>operacion<EstadoClub>('/club')
/** Recuperar únicamente compras propias del módulo antes de reutilizar sus llaves. */
export async function recuperarComprasClub(socio:string){
  const prefijo='club-lupita:compra:'+socio+':'
  let pendientes:{clave:string;ref:string}[]=[]
  try{pendientes=Object.keys(localStorage).filter(k=>k===prefijo+'membresia'||k.startsWith(prefijo+'experiencia:')).slice(0,20).map(clave=>({clave,ref:localStorage.getItem(clave)??''}))}catch{return 0}
  let recuperadas=0
  for(const p of pendientes){
    if(!/^[A-Za-z0-9_-]{8,64}$/.test(p.ref))continue
    const inicio=performance.now()
    let r:{estado:string;recibo?:{cobrado:number}}
    try{r=await operacion('/club/compra/'+encodeURIComponent(p.ref));medirTiempoClub('recuperacion','correcto',performance.now()-inicio)}catch(e){medirTiempoClub('recuperacion','error',performance.now()-inicio);throw e}
    if(r.estado==='confirmado'&&typeof r.recibo?.cobrado==='number'){
      try{if(localStorage.getItem(p.clave)===p.ref)localStorage.removeItem(p.clave)}catch{/* El reintento sigue protegido en servidor. */}
      recuperadas++
    }
  }
  return recuperadas
}
export function medirClub(evento:EventoClub){
  if(!sesion.leer()||navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return
  void fetch('/api/club/evento',{method:'POST',credentials:'same-origin',signal:AbortSignal.timeout(5000),headers:{'content-type':'application/json','x-cliente-solicitud':'1','x-cliente-csrf':csrfCliente()},body:JSON.stringify({evento,dispositivo:innerWidth<768?'movil':innerWidth<1024?'tableta':'escritorio'})}).catch(()=>{})
}
let rendimientoInstalado=false
export function medirRendimientoClub(){
  if(rendimientoInstalado||!sesion.leer()||navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl||new URL(performance.getEntriesByType('navigation')[0]?.name??location.href).pathname!=='/club')return
  rendimientoInstalado=true
  void import('web-vitals').then(({onLCP,onINP,onCLS})=>{
    const enviar=({name,value}:{name:string;value:number})=>{void fetch('/api/club/rendimiento',{method:'POST',credentials:'same-origin',keepalive:true,signal:AbortSignal.timeout(5000),headers:{'content-type':'application/json','x-cliente-solicitud':'1','x-cliente-csrf':csrfCliente()},body:JSON.stringify({metrica:name,valor:value,dispositivo:innerWidth<768?'movil':innerWidth<1024?'tableta':'escritorio'})}).catch(()=>{})}
    onLCP(enviar);onINP(enviar);onCLS(enviar)
  }).catch(()=>{})
}

let entradaClub:'directa'|'interna'='interna',visitasClub=0
export function registrarEntradaClub(){
 entradaClub=visitasClub++===0&&new URL(performance.getEntriesByType('navigation')[0]?.name??location.href).pathname==='/club'?'directa':'interna'
}
export function medirTiempoClub(operacion:'codigo'|'recuperacion'|'vista',resultado:'correcto'|'error'|'cancelado',duracion:number){
 if(!sesion.leer()||navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl||!Number.isFinite(duracion)||duracion<0||duracion>300000)return
 void fetch('/api/club/tiempo',{method:'POST',credentials:'same-origin',keepalive:true,signal:AbortSignal.timeout(5000),headers:{'content-type':'application/json','x-cliente-solicitud':'1','x-cliente-csrf':csrfCliente()},body:JSON.stringify({operacion,resultado,entrada:entradaClub,dispositivo:innerWidth<768?'movil':innerWidth<1024?'tableta':'escritorio',milisegundos:Math.round(duracion)})}).catch(()=>{})
}
