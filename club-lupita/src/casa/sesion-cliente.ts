/** La credencial queda en cookie HttpOnly. JS sólo lee un valor CSRF no autenticante. */
export const LLAVE_SESION='club-lupita:sesion'
export const CAMBIO_SESION='club-lupita:salida'
export const csrfCliente=()=>document.cookie.split('; ').find(c=>c.startsWith('__Host-lupita-cliente-csrf='))?.split('=')[1]??''
let preparacion:Promise<void>|null=null
const SALIDA_PENDIENTE='club-lupita:salida-pendiente'
type SalidaPendiente={csrf:string;todas:boolean}
function salidaPendiente():SalidaPendiente|null {
  try { const v=JSON.parse(localStorage.getItem(SALIDA_PENDIENTE)??'null');return v&&typeof v.csrf==='string'&&typeof v.todas==='boolean'?v:null }catch{return null}
}
const avisoPendiente='Saliste localmente. El cierre en el servidor sigue pendiente de conexión; una sesión remota podría seguir activa. Volvé a conectar este dispositivo para completarlo.'
function legado(){try{return localStorage.getItem(LLAVE_SESION)}catch{return null}}
function quitarLegado(){try{localStorage.removeItem(LLAVE_SESION)}catch{/* La cookie no depende de localStorage. */}}
function avisar(){
  try{localStorage.setItem('club-lupita:cliente-cambio',crypto.randomUUID())}catch{/* Modo privado: el estado local sigue funcionando. */}
  window.dispatchEvent(new Event(CAMBIO_SESION))
}
async function solicitud(ruta:string,token?:string){
  const control=new AbortController(),limite=setTimeout(()=>control.abort(),20_000)
  try{return await fetch('/api'+ruta,{method:'POST',credentials:'same-origin',signal:control.signal,headers:{'content-type':'application/json','x-cliente-solicitud':'1','x-cliente-csrf':csrfCliente(),...(token?{authorization:'Bearer '+token}:{})},body:'{}'})}
  finally{clearTimeout(limite)}
}
export const sesion={
  salidaPendiente:()=>!!salidaPendiente(),
  heredada(){return !!legado()},
  leer():string|null {const csrf=csrfCliente();return csrf&&!salidaPendiente()?'@cookie:'+csrf:null},
  confirmar(){quitarLegado();avisar()},
  preparar():Promise<void>{
    if(preparacion)return preparacion
    const pendiente=salidaPendiente()
    if(pendiente){
      preparacion=(async()=>{
        if(csrfCliente()!==pendiente.csrf){localStorage.removeItem(SALIDA_PENDIENTE);return}
        try {
          const r=await solicitud(pendiente.todas?'/sesion/salir-todas':'/sesion/salir')
          if(!r.ok&&r.status!==401)throw Error()
          localStorage.removeItem(SALIDA_PENDIENTE);this.borrar()
        }catch{throw Error(avisoPendiente)}
      })().finally(()=>{preparacion=null})
      return preparacion
    }
    const anterior=legado()
    if(!anterior)return Promise.resolve()
    preparacion=(async()=>{
      // Dos pestañas se coordinan para no consumir dos veces la credencial heredada.
      const migrar=async()=>{
        const token=legado();if(!token)return
        const r=await solicitud('/auth/sesion/migrar',token)
        if(r.ok){quitarLegado();return}
        if(r.status===401){quitarLegado();return}
        throw Error('No pudimos renovar tu acceso. Revisá la conexión e intentá de nuevo.')
      }
      if(navigator.locks)await navigator.locks.request('lupita-migrar-cliente',migrar)
      else await migrar()
    })().finally(()=>{preparacion=null})
    return preparacion
  },
  borrar(){
    quitarLegado()
    document.cookie='__Host-lupita-cliente-csrf=; Path=/; Secure; SameSite=Strict; Max-Age=0'
    avisar()
  },
  async salir(todas=false){
    const csrf=csrfCliente()
    try{
      const r=await solicitud(todas?'/sesion/salir-todas':'/sesion/salir')
      if(!r.ok&&r.status!==401)throw Error('No pudimos cerrar la sesión. Intentá de nuevo.')
      this.borrar()
    }catch{
      // Se conserva solamente el nonce CSRF (no autentica). Bloquea las lecturas locales hasta revocar la cookie HttpOnly.
      if(csrfCliente()!==csrf)return
      try{localStorage.setItem(SALIDA_PENDIENTE,JSON.stringify({csrf,todas}));quitarLegado();avisar()}
      catch{throw Error('No pudimos confirmar el cierre ni bloquear el acceso local. Revisá tu conexión y volvé a intentar antes de dejar este dispositivo.')}
    }
  },
}
/** Un 401 de una petición antigua no cierra la cuenta que se abrió después. */
export function invalidarSesion(identidad:string|null){if(identidad&&sesion.leer()===identidad)sesion.borrar()}
