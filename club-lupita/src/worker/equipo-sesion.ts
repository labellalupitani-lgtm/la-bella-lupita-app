import type { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { neon } from '@neondatabase/serverless'
import { TOTP, Secret } from 'otpauth'
import type { Env, Vars } from './index'
import { transaccion } from './operacion'

export type EquipoContexto=Context<{Bindings:Env;Variables:Vars}>
export type Permiso='propietario'|'encargado'|'caja'|'cocina'
export type SesionPersonal={id:string;empleado_id:string;version_clave:number;csrf:string;fase:'completa'|'clave'|'configurar'|'mfa';fuerte:boolean;compartido:boolean;dispositivo:string;vence:string;bloqueada:string|null;inactiva:boolean;reciente:boolean;nombre:string;usuario:string;permiso:Permiso;requiere_cambio:boolean;clave_cambiada:string|null;mfa_secreto:string|null;mfa_ultimo:number;clave_huella:string}
export const COOKIE='__Host-lupita-equipo'
export const CSRF='__Host-lupita-equipo-csrf'
export const uuid=(x:unknown):x is string=>typeof x==='string'&&/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(x)
export const privilegio=(p:string)=>p==='propietario'||p==='encargado'
export const esPropietario=(c:EquipoContexto)=>c.get('sesion')?.rol==='casa'&&c.get('permiso')==='propietario'
export const aleatorio=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('')}
export function secretoCredencial(env:Env){if(!env.PERSONAL_CREDENCIAL_SECRETO)throw Error('credenciales-no-configuradas');return env.PERSONAL_CREDENCIAL_SECRETO}
export function cookiesEquipo(c:EquipoContexto,token:string,csrf:string){
  const options={httpOnly:true,secure:true,sameSite:'Strict' as const,path:'/' as const,maxAge:12*3600}
  setCookie(c,COOKIE,token,options);setCookie(c,CSRF,csrf,{...options,httpOnly:false})
}
export function borrarCookies(c:EquipoContexto){deleteCookie(c,COOKIE,{path:'/',secure:true});deleteCookie(c,CSRF,{path:'/',secure:true})}
export function tokenEquipo(c:EquipoContexto){return c.req.header('x-equipo-solicitud')==='1'?getCookie(c,COOKIE):undefined}
export function origenEquipo(c:EquipoContexto){
  if(c.req.header('x-equipo-solicitud')!=='1')return false
  const origin=c.req.header('origin')
  return !origin?c.req.method==='GET':origin===new URL(c.req.url).origin
}
export async function auditar(c:EquipoContexto,accion:string,persona:string|null,detalle:Record<string,unknown>={}){
  const sql=neon(c.env.DATABASE_URL)
  const ip=await digest(c.req.header('cf-connecting-ip')??'local')
  await sql`INSERT INTO auditoria(quien,accion,detalle) VALUES(${persona??'acceso-equipo'},${accion},${JSON.stringify({...detalle,ip})}::jsonb)`
}
export async function limites(c:EquipoContexto,identificador:string){
  const sql=neon(c.env.DATABASE_URL),ip=await digest(c.req.header('cf-connecting-ip')??'local')
  const clave=await digest('cuenta:'+identificador)
  const [trafico]=await sql`SELECT limitar_acceso(${'equipo-trafico:'+ip},300,300) AS ok`
  if(!trafico.ok)return {ok:false,clave,segundos:60}
  const [f]=await sql`SELECT GREATEST(0,ceil(extract(epoch FROM espera-now())))::int AS segundos FROM fallo_personal WHERE clave=${clave}`
  return {ok:!f?.segundos,clave,segundos:Number(f?.segundos??0)}
}
export async function fallo(c:EquipoContexto,clave:string,persona:string|null,motivo='credencial'){
  const sql=neon(c.env.DATABASE_URL);await sql`SELECT fallo_acceso_personal(${clave})`
  await auditar(c,'acceso_rechazado',persona,{motivo})
}
export async function acierto(c:EquipoContexto,clave:string){const sql=neon(c.env.DATABASE_URL);await sql`DELETE FROM fallo_personal WHERE clave=${clave}`}
export async function emitirSesion(c:EquipoContexto,e:{id:string;version_clave:number;requiere_cambio:boolean;permiso:Permiso;mfa_secreto:string|null},options:{compartido?:boolean;dispositivo?:string;fuerte?:boolean;fase?:SesionPersonal['fase']}={}){
  const compartido=options.compartido!==false,token=(c.get('equipoDemo')?'d.':'r.')+aleatorio(),csrf=aleatorio(),hash=await digest(token)
  const fase=options.fase??(e.requiere_cambio?'clave':e.mfa_secreto&&!options.fuerte?'mfa':privilegio(e.permiso)&&!e.mfa_secreto?'configurar':'completa')
  const dispositivo=(options.dispositivo?.trim()|| (compartido?'Equipo compartido':'Dispositivo personal')).slice(0,80)
  const sql=neon(c.env.DATABASE_URL),horas=fase==='completa'?(compartido?8:12):0.25
  const [s]=await sql`INSERT INTO sesion_personal(token_huella,empleado_id,version_clave,csrf,fase,fuerte,compartido,dispositivo,vence,verificada)
    VALUES(${hash},${e.id}::uuid,${e.version_clave},${csrf},${fase},${!!options.fuerte},${compartido},${dispositivo},now()+make_interval(secs=>${Math.round(horas*3600)}),CASE WHEN ${!!options.fuerte||!privilegio(e.permiso)} THEN now() END) RETURNING id,vence`
  cookiesEquipo(c,token,csrf)
  await auditar(c,'sesion_iniciada',e.id,{sesion:s.id,fase,dispositivo,compartido})
  return {autenticado:true,fase,hasta:s.vence}
}
export async function cargarSesion(c:EquipoContexto,token:string){
  if(!/^[rd]\.[a-f0-9]{64}$/.test(token))return null
  const sql=neon(c.env.DATABASE_URL),hash=await digest(token)
  const [s]=await sql`SELECT s.*,e.nombre,e.usuario,e.permiso,e.requiere_cambio,e.clave_cambiada,e.mfa_secreto,e.mfa_ultimo,e.clave_huella,
    s.actividad<now()-CASE WHEN s.compartido THEN interval '5 minutes' ELSE interval '30 minutes' END AS inactiva,
    s.verificada>now()-interval '5 minutes' AS reciente
    FROM sesion_personal s JOIN empleado e ON e.id=s.empleado_id
    WHERE s.token_huella=${hash} AND s.revocada IS NULL AND s.vence>now() AND e.activo AND s.version_clave=e.version_clave
      AND (e.clave_temporal_vence IS NULL OR e.clave_temporal_vence>now())`
  return s as SesionPersonal|undefined??null
}
export function autorizacionReciente(c:EquipoContexto){const s=c.get('personal');return !!s&&s.fase==='completa'&&s.reciente&&(!privilegio(s.permiso)||s.fuerte)}
async function aes(env:Env){
  if(!env.PERSONAL_MFA_SECRETO||env.PERSONAL_MFA_SECRETO.length<32)throw Error('mfa-no-configurado')
  const key=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.PERSONAL_MFA_SECRETO))
  return crypto.subtle.importKey('raw',key,'AES-GCM',false,['encrypt','decrypt'])
}
const encode=(a:Uint8Array)=>btoa(Array.from(a,b=>String.fromCharCode(b)).join(''))
const decode=(s:string)=>Uint8Array.from(atob(s),x=>x.charCodeAt(0))
export async function cifrarMfa(env:Env,id:string,value:string){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(id)},await aes(env),new TextEncoder().encode(value));return encode(iv)+'.'+encode(new Uint8Array(encrypted))}
export async function descifrarMfa(env:Env,id:string,value:string){const [iv,data]=value.split('.');return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(iv),additionalData:new TextEncoder().encode(id)},await aes(env),decode(data)))}
export function nuevoTotp(usuario:string){return new TOTP({issuer:'La Bella Lupita',label:usuario,algorithm:'SHA1',digits:6,period:30,secret:new Secret({size:20})})}
export async function validarMfa(c:EquipoContexto,e:{id:string;mfa_secreto:string|null},codigo:unknown){
  if(!e.mfa_secreto||typeof codigo!=='string'||!/^\d{6}$/.test(codigo))return false
  const secret=await descifrarMfa(c.env,e.id,e.mfa_secreto),totp=new TOTP({secret,algorithm:'SHA1',digits:6,period:30}),timestamp=Date.now()
  const delta=totp.validate({token:codigo,window:1,timestamp});if(delta===null)return false
  const counter=Math.floor(timestamp/30000)+delta,sql=neon(c.env.DATABASE_URL)
  const [used]=await sql`UPDATE empleado SET mfa_ultimo=${counter} WHERE id=${e.id}::uuid AND mfa_ultimo<${counter} AND mfa_secreto=${e.mfa_secreto} RETURNING id`
  return !!used
}
export async function codigosRecuperacion(c:EquipoContexto,id:string){
  const codigos=Array.from({length:8},()=>aleatorio().slice(0,32)),hashes=await Promise.all(codigos.map(digest))
  await transaccion(c.env,async cli=>{
    await cli.query('DELETE FROM recuperacion_personal WHERE empleado_id=$1',[id])
    for(const h of hashes)await cli.query('INSERT INTO recuperacion_personal(huella,empleado_id) VALUES($1,$2)',[h,id])
  })
  return codigos
}
