import type { CotizacionTienda } from '../compartido/tienda'
import { sesion } from './sesion-cliente'
import { ErrorPeticion, pedirJSON } from './http'
export type CompraOperativa={id:string;tipo:'pedido'|'reserva'|'bolsa'|'experiencia';creado:string;detalle:{titular?:boolean;recibida?:boolean;puede_ceder?:boolean;lugar?:string;duracion_minutos?:number;incluye?:string;condiciones?:string;numero?:number;estado?:string;total?:number;empaque?:number;restriccion_confirmada?:string|null;lineas?:{nombre:string;cuanto:number;precio:number;precioAntes?:number;descuentoClub?:number;opciones?:{nombre:string;valor:string}[]}[];motivo?:string;zona?:string;cuando?:string;personas?:number;fin?:string;deposito?:number;cancelada?:string;generacion?:number;cotizacion?:CotizacionTienda;lista?:string;reembolsada?:string;entregada?:string;nombre?:string;butaca?:number;asistencia?:string;cedida?:boolean}}
export type PedidoOperativo={id:string;numero:number;nombre:string;estado:string;total?:number;empaque?:number;restriccion_confirmada?:string|null;estimacion_minutos?:number|null;lineas:{nombre:string;cuanto:number;precio?:number;opciones?:{nombre:string;valor:string}[]}[];creado:string;actualizado?:string;motivo?:string|null}
export type PersonalIdentidad={id:string;nombre:string;permiso:'propietario'|'encargado'|'caja'|'cocina';demo?:boolean;usuario?:string;requiereCambio?:boolean;claveCambiada?:string|null;fase:'completa'|'clave'|'mfa'|'configurar';mfa:boolean;compartido:boolean;dispositivo:string;bloqueada:boolean;reciente:boolean;sesion:string;hasta:string}
export const TOKEN_PERSONAL='@equipo-cookie'
export const avisarEquipo=()=>window.dispatchEvent(new Event('personal:actualizar'))
export type Empleado=PersonalIdentidad&{usuario:string;activo:boolean;version_clave:number;requiere_cambio:boolean;clave_temporal_vence:string|null}
export { ErrorPeticion as ErrorOperacion }
export async function operacion<T>(ruta:string,body?:unknown,token=sesion.leer(),cabeceras:Record<string,string>={},signal?:AbortSignal):Promise<T> {
  const equipo=token===TOKEN_PERSONAL||ruta.startsWith('/auth/equipo/')
  const csrf=equipo?document.cookie.split('; ').find(c=>c.startsWith('__Host-lupita-equipo-csrf='))?.split('=')[1]:undefined
  try{
    const resultado=await pedirJSON<T>(ruta,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:{...cabeceras,...(equipo?{'x-equipo-solicitud':'1',...(csrf?{'x-equipo-csrf':csrf}:{})}:{})},signal,...(body===undefined?{}:{body:JSON.stringify(body)})},equipo?null:token)
    // Una respuesta anterior al cambio de persona nunca repuebla la pantalla.
    const identidadActual=document.cookie.split('; ').find(c=>c.startsWith('__Host-lupita-equipo-csrf='))?.split('=')[1]
    if(equipo&&body===undefined&&csrf!==identidadActual){avisarEquipo();throw new Error('El acceso cambió. Actualizá la pantalla.')}
    return resultado
  }catch(e){
    if(equipo&&e instanceof ErrorPeticion&&csrf===document.cookie.split('; ').find(c=>c.startsWith('__Host-lupita-equipo-csrf='))?.split('=')[1]){
      if(e.status===401&&csrf&&!ruta.startsWith('/auth/'))window.dispatchEvent(new CustomEvent('personal:sesion-caducada',{detail:TOKEN_PERSONAL}))
      if(e.status===423)avisarEquipo()
      if(e.status===428)window.dispatchEvent(new Event('personal:revalidar'))
    }
    throw e
  }
}

