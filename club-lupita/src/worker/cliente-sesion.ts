import type { Context, Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { neon } from '@neondatabase/serverless'
import type { Env, Vars } from './index'
import { aleatorio, digest } from './equipo-sesion'
import { verificar, type Sesion } from './sesion'
import { transaccion } from './operacion'

type C=Context<{Bindings:Env;Variables:Vars}>
const COOKIE='__Host-lupita-cliente',CSRF='__Host-lupita-cliente-csrf'
const DIAS=30*24*3600
export const tokenCliente=(c:C)=>c.req.header('x-cliente-solicitud')==='1'?getCookie(c,COOKIE):undefined
export const origenCliente=(c:C)=>c.req.header('x-cliente-solicitud')==='1'&&c.req.header('origin')===new URL(c.req.url).origin
export async function legadoRevocado(c:C,token:string,s?:Sesion|null){
  const sql=neon(c.env.DATABASE_URL),hash=await digest(token)
  const [r]=await sql`SELECT EXISTS(SELECT 1 FROM sesion_cliente_migrada WHERE huella=${hash} AND vence>now())
    OR EXISTS(SELECT 1 FROM operativo_socio WHERE telefono=${s?.tel??''} AND sesiones_revocadas>0 AND sesiones_revocadas>=${s?.iat??0}::bigint) AS revocada`
  return !!r.revocada
}
export async function cargarCliente(c:C,token:string):Promise<{sesion:Sesion;csrf:string}|null>{
  if(!/^[rd]\.[a-f0-9]{64}$/.test(token))return null
  const sql=neon(c.env.DATABASE_URL),hash=await digest(token)
  const [r]=await sql`SELECT s.telefono,c.csrf,c.vence FROM sesion_cliente c JOIN operativo_socio s ON s.id=c.socio_id
    WHERE c.huella=${hash} AND c.revocada IS NULL AND c.vence>now() AND s.baja IS NULL`
  return r?{sesion:{tel:r.telefono,rol:'socio',exp:Date.parse(r.vence)},csrf:r.csrf}:null
}
async function emitir(c:C,tel:string,legado?:{token:string;exp:number}) {
  const token=(c.get('equipoDemo')?'d.':'r.')+aleatorio(),csrf=aleatorio(),hash=await digest(token)
  const revocar=legado?await digest(legado.token):null
  await transaccion(c.env,async cli=>{
    const {rows:[s]}=await cli.query('SELECT id,sesiones_revocadas FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE',[tel])
    if(!s)throw Error('cuenta-inactiva')
    if(legado){
      const anterior=await verificar(c.env.SESION_SECRETO,legado.token)
      if(Number(s.sesiones_revocadas)>0&&Number(s.sesiones_revocadas)>=(anterior?.iat??0))throw Error('sesion-ya-migrada')
      const {rows}=await cli.query('INSERT INTO sesion_cliente_migrada(huella,vence) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING huella',[revocar,new Date(legado.exp).toISOString()])
      if(!rows.length)throw Error('sesion-ya-migrada')
    }
    await cli.query("INSERT INTO sesion_cliente(huella,socio_id,csrf,vence) VALUES($1,$2,$3,now()+interval '30 days')",[hash,s.id,csrf])
  })
  const opciones={httpOnly:true,secure:true,sameSite:'Strict' as const,path:'/',maxAge:DIAS}
  setCookie(c,COOKIE,token,opciones);setCookie(c,CSRF,csrf,{...opciones,httpOnly:false})
}

/** Compatibilidad: los clientes antiguos reciben su respuesta anterior; la app actual pide cookie. */
export function registrarTransporteCliente(app:Hono<{Bindings:Env;Variables:Vars}>) {
  app.use('/api/*',async(c,next)=>{
    const equipo=c.req.header('x-equipo-solicitud')==='1'
    if(!equipo&&c.req.header('x-cliente-solicitud')==='1'&&c.req.method!=='GET'&&!origenCliente(c))return c.json({error:'Realizá esta acción desde la aplicación.'},403)
    await next()
    if(c.req.header('x-cliente-solicitud')!=='1'||!['/api/auth/entrar','/api/auth/correo/verificar','/api/auth/correo/registro'].includes(c.req.path)||!c.res.ok)return
    const datos=await c.res.clone().json() as {token?:string;socio?:unknown}
    if(!datos.token)return
    const s=await verificar(c.env.SESION_SECRETO,datos.token)
    if(!s||s.rol!=='socio')throw Error('sesion-no-valida')
    await emitir(c,s.tel)
    c.res=c.json({autenticado:true,socio:datos.socio})
  })
}
export function registrarSesionCliente(app:Hono<{Bindings:Env;Variables:Vars}>) {
  app.post('/api/auth/sesion/migrar',async c=>{
    if(!origenCliente(c))return c.json({error:'Abrí la aplicación para renovar tu sesión.'},403)
    const token=c.req.header('authorization')?.replace(/^Bearer\s+/i,'')
    const s=await verificar(c.env.SESION_SECRETO,token)
    if(!token||!s||s.rol!=='socio'||await legadoRevocado(c,token,s))return c.json({error:'Ingresá nuevamente.'},401)
    try{await emitir(c,s.tel,{token,exp:s.exp})}catch(error){
      if(error instanceof Error&&['cuenta-inactiva','sesion-ya-migrada'].includes(error.message))return c.json({error:'Ingresá nuevamente para continuar.'},401)
      throw error
    }
    return c.json({autenticado:true})
  })
  app.post('/api/sesion/salir',async c=>{
    if(!origenCliente(c)||!tokenCliente(c))return c.json({error:'Cerrá la sesión desde la aplicación.'},403)
    const sql=neon(c.env.DATABASE_URL),hash=await digest(tokenCliente(c)!)
    await sql`UPDATE sesion_cliente SET revocada=now() WHERE huella=${hash} AND revocada IS NULL`
    deleteCookie(c,COOKIE,{path:'/',secure:true});deleteCookie(c,CSRF,{path:'/',secure:true})
    return c.json({cerrada:true})
  })
  app.post('/api/sesion/salir-todas',async c=>{
    if(c.get('sesion').rol!=='socio'||!origenCliente(c)||!tokenCliente(c))return c.json({error:'Cerrá las sesiones desde tu cuenta en la aplicación.'},403)
    await transaccion(c.env,async cli=>{
      const {rows:[s]}=await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE',[c.get('sesion').tel])
      if(!s)throw Error('cuenta-inactiva')
      await cli.query('UPDATE operativo_socio SET sesiones_revocadas=$2 WHERE id=$1',[s.id,Date.now()])
      await cli.query('UPDATE sesion_cliente SET revocada=coalesce(revocada,now()) WHERE socio_id=$1',[s.id])
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES('socio','cerrar_sesiones',$1,'{}')",[s.id])
    })
    deleteCookie(c,COOKIE,{path:'/',secure:true});deleteCookie(c,CSRF,{path:'/',secure:true})
    return c.json({cerradas:true})
  })
}
