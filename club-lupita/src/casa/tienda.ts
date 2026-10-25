import { pedirJSON, ErrorPeticion } from './http'
import { ofertaValida, cotizacionValida, reciboValido, type OfertaTienda, type CotizacionTienda, type ReciboTienda, type EventoTienda } from '../compartido/tienda'
import { sesion } from './sesion-cliente'
export class ErrorContratoTienda extends ErrorPeticion {}
export type ConsultaTienda = { estado: 'confirmado'; recibo: ReciboTienda } | { estado: 'sin_cobro'|'ausente'|'cerrado'; cotizacion?: CotizacionTienda|null }
async function pedir<T>(ruta: string, validar: (v: unknown) => boolean, body?: unknown): Promise<T> {
  const r=await pedirJSON<unknown>(ruta,body===undefined?{}:{method:'POST',body:JSON.stringify(body)})
  if(!validar(r))throw new ErrorContratoTienda('No pudimos verificar la respuesta de la Tienda. Volvé a consultar antes de continuar.',502,body!==undefined)
  return r as T
}
const consultaValida=(v:unknown)=>{
  if(!v||typeof v!=='object')return false
  const r=v as Record<string,unknown>
  return r.estado==='confirmado'?reciboValido(r.recibo):['sin_cobro','ausente','cerrado'].includes(String(r.estado))&&(r.cotizacion===undefined||r.cotizacion===null||cotizacionValida(r.cotizacion))
}
export const tienda={
  oferta:()=>pedir<OfertaTienda>('/tienda',ofertaValida),
  cotizar:(ref:string)=>pedir<CotizacionTienda>('/tienda/cotizar',v=>cotizacionValida(v)&&v.referencia===ref,{ref}),
  comprar:(q:CotizacionTienda)=>pedir<ReciboTienda>('/reserva-cosecha/apartar',v=>reciboValido(v)&&!!v.compra&&v.cotizacion?.id===q.id&&v.cobrado===q.oferta.precio,{ref:q.referencia,cotizacionId:q.id}),
  consultar:(ref:string)=>pedir<ConsultaTienda>('/tienda/intento/'+encodeURIComponent(ref),consultaValida),
  cerrar:(ref:string,confirmado=false)=>pedir<ConsultaTienda>('/tienda/intento/'+encodeURIComponent(ref)+'/cerrar',consultaValida,{confirmado}),
  pendientes:()=>pedir<{intentos:{referencia:string;creado:string}[]}>('/tienda/recuperacion',v=>!!v&&typeof v==='object'&&'intentos'in v&&Array.isArray(v.intentos)&&v.intentos.every(i=>i&&typeof i.referencia==='string'&&/^[A-Za-z0-9_-]{8,64}$/.test(i.referencia)&&typeof i.creado==='string'&&Number.isFinite(Date.parse(i.creado)))),
}
export function medirTienda(evento:EventoTienda){
  if(!sesion.leer()||navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl)return
  void pedirJSON('/tienda/evento',{method:'POST',body:JSON.stringify({evento,dispositivo:innerWidth<768?'movil':innerWidth<1024?'tableta':'escritorio'})}).catch(()=>{})
}
const llave=(socio:string)=>'club-lupita:compra:'+socio+':bolsa'
export function leerIntento(socio:string){try{return localStorage.getItem(llave(socio))}catch{return null}}
export function guardarIntento(socio:string,ref:string){try{localStorage.setItem(llave(socio),ref);return true}catch{return false}}
