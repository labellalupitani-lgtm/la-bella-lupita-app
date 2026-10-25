import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import QRCode from 'qrcode'
import { TOTP } from 'otpauth'
import type { Env,Vars } from './index'
import { comprobarClave,comprobarPropietario,guardarClave,propietario,validarNuevaClave } from './credenciales'
import { transaccion } from './operacion'
import { nombrePersonalValido } from './validacion'
import { acierto,aleatorio,auditar,autorizacionReciente,borrarCookies,cifrarMfa,codigosRecuperacion,descifrarMfa,digest,emitirSesion,esPropietario,fallo,limites,nuevoTotp,privilegio,secretoCredencial,uuid,validarMfa,type EquipoContexto,type Permiso } from './equipo-sesion'

type Persona={id:string;nombre:string;usuario:string;permiso:Permiso;activo:boolean;version_clave:number;requiere_cambio:boolean;clave_huella:string;mfa_secreto:string|null}
const usuarioValido=(v:unknown):v is string=>typeof v==='string'&&/^[a-z0-9._-]{3,40}$/.test(v)
const nombreValido=nombrePersonalValido
const permisos=['propietario','encargado','caja','cocina']
const espera=(c:EquipoContexto,n:number)=>{c.header('Retry-After',String(n||3));return c.json({error:`Esperá ${n||3} segundos antes de volver a intentar.`},429)}
const personal=(c:EquipoContexto)=>c.get('personal')
const propietarioReciente=(c:EquipoContexto)=>!esPropietario(c)?c.json({error:'Solo un propietario administra los accesos.'},403):!autorizacionReciente(c)?c.json({error:'Confirmá tu identidad para administrar accesos.',revalidar:true},428):null
async function revocar(c:EquipoContexto,id:string){const sql=neon(c.env.DATABASE_URL);await sql`UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=${id}::uuid`}
async function buscar(c:EquipoContexto,usuario:string){const sql=neon(c.env.DATABASE_URL);const [e]=await sql`SELECT * FROM empleado WHERE usuario=${usuario} AND activo AND (clave_temporal_vence IS NULL OR clave_temporal_vence>now())`;return e as Persona|undefined}
// El mismo bcrypt se ejecuta para un usuario inexistente. El hash es público,
// no una credencial válida, y sólo iguala el trabajo del rechazo.
const HASH_INEXISTENTE='$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW'
async function password(c:EquipoContexto,e:Persona|undefined,clave:string){const ok=await comprobarClave(neon(c.env.DATABASE_URL),secretoCredencial(c.env),clave,e?.clave_huella??HASH_INEXISTENTE,'empleado');return !!e&&ok}
async function invitacion(c:EquipoContexto,id:string,version:number){
  const token=aleatorio(),hash=await digest(token),sql=neon(c.env.DATABASE_URL)
  await sql`UPDATE invitacion_personal SET usada=COALESCE(usada,now()) WHERE empleado_id=${id}::uuid`
  const [r]=await sql`INSERT INTO invitacion_personal(huella,empleado_id,version_clave) VALUES(${hash},${id}::uuid,${version}) RETURNING vence`
  return {invitacion:token,vence:r.vence}
}

export function registrarAccesoEquipo(app:Hono<{Bindings:Env;Variables:Vars}>){
  app.use('/api/auth/equipo/*',async(c,next)=>{
    if(c.req.method==='POST'){
      const r=await c.req.json()
      if(!r||typeof r!=='object'||Array.isArray(r))return c.json({error:'Revisá los datos del acceso.'},422)
      if((r.compartido!==undefined&&typeof r.compartido!=='boolean')||(r.demo!==undefined&&typeof r.demo!=='boolean')||(r.dispositivo!==undefined&&(typeof r.dispositivo!=='string'||r.dispositivo.length>80||/[\p{Cc}\p{Cs}\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(r.dispositivo))))return c.json({error:'Revisá el nombre y el tipo de dispositivo.'},422)
    }
    await next()
  })
  app.get('/api/auth/equipo/estado',async c=>{
    const sql=neon(c.env.DATABASE_URL),[r]=await sql`SELECT EXISTS(SELECT 1 FROM empleado WHERE permiso='propietario') AS configurado`
    return c.json({configurado:r.configurado,capacitacion:!!c.env.DEMO_DATABASE_URL,demo:!!c.get('equipoDemo')})
  })
  app.post('/api/auth/equipo/iniciar-propietario',async c=>{
    const r=await c.req.json(),limit=await limites(c,'activar-primer-propietario')
    if(!limit.ok)return espera(c,limit.segundos)
    const error=validarNuevaClave({actual:r.actual,nueva:r.nueva,confirmacion:r.confirmacion})
    if(error||!usuarioValido(r.usuario)||!nombreValido(r.nombre))return c.json({error:error??'Revisá el nombre y el usuario (3 a 40 letras, números, puntos o guiones).'},422)
    const central=c.get('basePropietario')
    if(!await comprobarPropietario(central,secretoCredencial(c.env),c.env.CASA_SECRETO,r.actual,await propietario(central))){await fallo(c,limit.clave,null);return c.json({error:'No pudimos verificar el acceso anterior.'},401)}
    const hash=await guardarClave(neon(c.env.DATABASE_URL),secretoCredencial(c.env),r.nueva,'empleado')
    const result=await transaccion(c.env,async cli=>{
      await cli.query('LOCK TABLE empleado IN SHARE ROW EXCLUSIVE MODE')
      const {rows:owners}=await cli.query("SELECT id FROM empleado WHERE permiso='propietario'")
      if(owners.length)return null
      const {rows:[e]}=await cli.query("INSERT INTO empleado(nombre,usuario,permiso,clave_huella,requiere_cambio,clave_cambiada) VALUES($1,$2,'propietario',$3,false,now()) ON CONFLICT(usuario) DO NOTHING RETURNING *",[r.nombre.trim(),r.usuario,hash])
      return e as Persona|undefined
    })
    if(!result)return c.json({error:'La activación inicial ya se realizó o ese usuario existe. Ingresá con tu cuenta individual.'},409)
    await acierto(c,limit.clave);await auditar(c,'propietario_activado',result.id)
    return c.json(await emitirSesion(c,result,{compartido:r.compartido,dispositivo:r.dispositivo}))
  })
  app.post('/api/auth/equipo/entrar',async c=>{
    const r=await c.req.json(),usuario=typeof r.usuario==='string'?r.usuario.trim().toLowerCase():''
    if(!usuarioValido(usuario)||typeof r.clave!=='string'||r.clave.length>256)return c.json({error:'No pudimos verificar tu usuario y contraseña.'},401)
    const limit=await limites(c,'login:'+usuario);if(!limit.ok)return espera(c,limit.segundos)
    const e=await buscar(c,usuario)
    if(!await password(c,e,r.clave)){await fallo(c,limit.clave,e?.id??null);return c.json({error:'No pudimos verificar tu usuario y contraseña.'},401)}
    await acierto(c,limit.clave)
    return c.json(await emitirSesion(c,e!,{compartido:r.compartido,dispositivo:r.dispositivo}))
  })
  app.post('/api/auth/equipo/activar',async c=>{
    const r=await c.req.json(),usuario=typeof r.usuario==='string'?r.usuario.trim().toLowerCase():''
    if(!usuarioValido(usuario)||typeof r.invitacion!=='string'||!/^[a-f0-9]{64}$/.test(r.invitacion))return c.json({error:'La invitación no es válida. Solicitá una nueva.'},410)
    const limit=await limites(c,'activar:'+usuario);if(!limit.ok)return espera(c,limit.segundos)
    const error=validarNuevaClave({actual:r.invitacion,nueva:r.nueva,confirmacion:r.confirmacion});if(error)return c.json({error},422)
    const hash=await digest(r.invitacion),clave=await guardarClave(neon(c.env.DATABASE_URL),secretoCredencial(c.env),r.nueva,'empleado')
    const e=await transaccion(c.env,async cli=>{
      const {rows:[i]}=await cli.query('SELECT i.* FROM invitacion_personal i JOIN empleado e ON e.id=i.empleado_id WHERE i.huella=$1 AND e.usuario=$2 AND e.activo AND i.usada IS NULL AND i.vence>now() AND i.version_clave=e.version_clave FOR UPDATE OF i,e',[hash,usuario])
      if(!i)return null
      await cli.query('UPDATE invitacion_personal SET usada=now() WHERE huella=$1',[hash])
      const {rows:[p]}=await cli.query('UPDATE empleado SET clave_huella=$2,requiere_cambio=false,clave_temporal_vence=NULL,clave_cambiada=now(),version_clave=version_clave+1 WHERE id=$1 RETURNING *',[i.empleado_id,clave])
      await cli.query('UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=$1',[p.id])
      return p as Persona
    })
    if(!e){await fallo(c,limit.clave,null,'invitacion');return c.json({error:'La invitación venció o ya se utilizó. Solicitá una nueva.'},410)}
    await acierto(c,limit.clave);await auditar(c,'invitacion_aceptada',e.id)
    const codigos=!e.mfa_secreto&&!privilegio(e.permiso)?await codigosRecuperacion(c,e.id):undefined
    return c.json({...await emitirSesion(c,e,{compartido:r.compartido,dispositivo:r.dispositivo}),codigos})
  })
  app.post('/api/auth/equipo/recuperar',async c=>{
    const r=await c.req.json(),usuario=typeof r.usuario==='string'?r.usuario.trim().toLowerCase():''
    if(!usuarioValido(usuario)||typeof r.codigo!=='string'||!/^[a-f0-9]{32}$/.test(r.codigo))return c.json({error:'No pudimos recuperar este acceso.'},401)
    const limit=await limites(c,'recuperar:'+usuario);if(!limit.ok)return espera(c,limit.segundos)
    const error=validarNuevaClave({actual:r.codigo,nueva:r.nueva,confirmacion:r.confirmacion});if(error)return c.json({error},422)
    const hash=await digest(r.codigo),clave=await guardarClave(neon(c.env.DATABASE_URL),secretoCredencial(c.env),r.nueva,'empleado')
    const e=await transaccion(c.env,async cli=>{
      const {rows:[b]}=await cli.query('SELECT r.empleado_id FROM recuperacion_personal r JOIN empleado e ON e.id=r.empleado_id WHERE r.huella=$1 AND r.usada IS NULL AND e.usuario=$2 AND e.activo FOR UPDATE OF r,e',[hash,usuario])
      if(!b)return null
      // Una recuperación revoca también las demás vías pendientes de acceso.
      await cli.query('UPDATE recuperacion_personal SET usada=COALESCE(usada,now()) WHERE empleado_id=$1',[b.empleado_id])
      await cli.query('UPDATE invitacion_personal SET usada=COALESCE(usada,now()) WHERE empleado_id=$1',[b.empleado_id])
      await cli.query('UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=$1',[b.empleado_id])
      const {rows:[p]}=await cli.query('UPDATE empleado SET clave_huella=$2,version_clave=version_clave+1,requiere_cambio=false,clave_temporal_vence=NULL,clave_cambiada=now(),mfa_secreto=NULL,mfa_ultimo=-1 WHERE id=$1 RETURNING *',[b.empleado_id,clave])
      return p as Persona
    })
    if(!e){await fallo(c,limit.clave,null,'recuperacion');return c.json({error:'No pudimos recuperar este acceso. El código puede haberse utilizado.'},401)}
    await acierto(c,limit.clave);await auditar(c,'cuenta_recuperada',e.id,{factoresAnterioresRevocados:true})
    // Recuperación siempre exige configurar de nuevo el autenticador antes de operar.
    return c.json(await emitirSesion(c,e,{compartido:r.compartido,dispositivo:r.dispositivo,fase:'configurar'}))
  })
  app.get('/api/personal/yo',c=>{
    const s=personal(c)
    if(!s)return c.json({error:'Acceso exclusivo del equipo.'},403)
    return c.json({id:s.empleado_id,nombre:s.nombre,usuario:s.usuario,permiso:s.permiso,demo:!!c.get('equipoDemo'),requiereCambio:s.requiere_cambio,claveCambiada:s.clave_cambiada,fase:s.fase,mfa:!!s.mfa_secreto,compartido:s.compartido,dispositivo:s.dispositivo,bloqueada:s.fase==='completa'&&(!!s.bloqueada||s.inactiva),reciente:autorizacionReciente(c),sesion:s.id,hasta:s.vence})
  })
  app.post('/api/personal/salir',async c=>{
    const s=personal(c),sql=neon(c.env.DATABASE_URL)
    if(s){await sql`UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE id=${s.id}::uuid`;await auditar(c,'sesion_cerrada',s.empleado_id,{sesion:s.id})}
    borrarCookies(c);return c.json({cerrada:true})
  })
  app.post('/api/personal/bloquear',async c=>{const s=personal(c),sql=neon(c.env.DATABASE_URL);await sql`UPDATE sesion_personal SET bloqueada=COALESCE(bloqueada,now()) WHERE id=${s.id}::uuid`;await auditar(c,'sesion_bloqueada',s.empleado_id,{sesion:s.id});return c.json({bloqueada:true})})
  app.post('/api/personal/actividad',async c=>{
    const s=personal(c);if(s.bloqueada||s.inactiva)return c.json({error:'Desbloqueá tu acceso para continuar.',bloqueada:true},423)
    const sql=neon(c.env.DATABASE_URL);await sql`UPDATE sesion_personal SET actividad=now() WHERE id=${s.id}::uuid`
    return c.json({actualizada:true})
  })
  app.post('/api/personal/revalidar',async c=>{
    const s=personal(c),r=await c.req.json(),limit=await limites(c,'revalidar:'+s.empleado_id)
    if(!limit.ok)return espera(c,limit.segundos)
    const e=await buscar(c,s.usuario)
    if(typeof r.actual!=='string'||r.actual.length>256||!await password(c,e,r.actual)|| (!!e?.mfa_secreto&&!await validarMfa(c,e,r.codigo))){await fallo(c,limit.clave,s.empleado_id);return c.json({error:'No pudimos confirmar tu identidad. Revisá la contraseña y el código vigente.'},422)}
    await acierto(c,limit.clave)
    const sql=neon(c.env.DATABASE_URL);await sql`UPDATE sesion_personal SET verificada=now(),actividad=now(),bloqueada=NULL,fuerte=${!!e?.mfa_secreto} WHERE id=${s.id}::uuid`
    await auditar(c,'identidad_revalidada',s.empleado_id,{sesion:s.id})
    return c.json({verificada:true})
  })
  app.post('/api/personal/mfa/verificar',async c=>{
    const s=personal(c),r=await c.req.json(),limit=await limites(c,'mfa:'+s.empleado_id)
    if(!limit.ok)return espera(c,limit.segundos)
    if(s.fase!=='mfa')return c.json({error:'Ingresá nuevamente para verificar tu acceso.'},409)
    if(!await validarMfa(c,{id:s.empleado_id,mfa_secreto:s.mfa_secreto},r.codigo)){await fallo(c,limit.clave,s.empleado_id,'segundo-factor');return c.json({error:'El código no es válido o ya se usó. Usá el siguiente código del autenticador.'},422)}
    await acierto(c,limit.clave);const sql=neon(c.env.DATABASE_URL)
    const [claimed]=await sql`UPDATE sesion_personal SET revocada=now() WHERE id=${s.id}::uuid AND revocada IS NULL RETURNING id`
    if(!claimed)return c.json({error:'Este acceso ya se verificó. Actualizá la página.'},409)
    return c.json(await emitirSesion(c,{...s,id:s.empleado_id},{compartido:s.compartido,dispositivo:s.dispositivo,fuerte:true}))
  })
  app.post('/api/personal/mfa/preparar',async c=>{
    const s=personal(c)
    if(s.mfa_secreto||s.requiere_cambio||(s.fase!=='configurar'&&!autorizacionReciente(c)))return c.json({error:'Confirmá tu identidad antes de configurar el autenticador.',revalidar:true},428)
    const sql=neon(c.env.DATABASE_URL),[pending]=await sql`SELECT mfa_pendiente FROM sesion_personal WHERE id=${s.id}::uuid AND mfa_pendiente_vence>now()`
    let totp:TOTP
    if(pending?.mfa_pendiente)totp=new TOTP({issuer:'La Bella Lupita',label:s.usuario,secret:await descifrarMfa(c.env,s.empleado_id,String(pending.mfa_pendiente))})
    else {totp=nuevoTotp(s.usuario);const encrypted=await cifrarMfa(c.env,s.empleado_id,totp.secret.base32);await sql`UPDATE sesion_personal SET mfa_pendiente=${encrypted},mfa_pendiente_vence=now()+interval '10 minutes' WHERE id=${s.id}::uuid`}
    const svg=await QRCode.toString(totp.toString(),{type:'svg',width:240,margin:2})
    return c.json({secreto:totp.secret.base32,qr:'data:image/svg+xml;base64,'+btoa(svg)})
  })
  app.post('/api/personal/mfa/confirmar',async c=>{
    const s=personal(c),r=await c.req.json(),limit=await limites(c,'mfa:'+s.empleado_id)
    if(!limit.ok)return espera(c,limit.segundos)
    const sql=neon(c.env.DATABASE_URL),[pending]=await sql`SELECT mfa_pendiente FROM sesion_personal WHERE id=${s.id}::uuid AND mfa_pendiente_vence>now()`
    if(s.mfa_secreto||!pending?.mfa_pendiente)return c.json({error:'La configuración venció. Volvé a prepararla.'},410)
    const totp=new TOTP({secret:await descifrarMfa(c.env,s.empleado_id,String(pending.mfa_pendiente))}),timestamp=Date.now()
    const delta=typeof r.codigo==='string'&&/^\d{6}$/.test(r.codigo)?totp.validate({token:r.codigo,window:1,timestamp}):null
    if(delta===null){await fallo(c,limit.clave,s.empleado_id,'alta-segundo-factor');return c.json({error:'Revisá el código del autenticador.'},422)}
    const e=await transaccion(c.env,async cli=>{
      const {rows:[current]}=await cli.query('SELECT id FROM sesion_personal WHERE id=$1 AND revocada IS NULL AND mfa_pendiente=$2 AND mfa_pendiente_vence>now() FOR UPDATE',[s.id,pending.mfa_pendiente])
      if(!current)return null
      const {rows:[p]}=await cli.query('UPDATE empleado SET mfa_secreto=$2,mfa_ultimo=$3 WHERE id=$1 AND mfa_secreto IS NULL RETURNING *',[s.empleado_id,pending.mfa_pendiente,Math.floor(timestamp/30000)+delta])
      if(!p)return null
      await cli.query('UPDATE sesion_personal SET revocada=COALESCE(revocada,now()),mfa_pendiente=NULL WHERE empleado_id=$1',[s.empleado_id])
      return p as Persona
    })
    if(!e)return c.json({error:'La configuración cambió. Ingresá nuevamente.'},409)
    await acierto(c,limit.clave);await auditar(c,'mfa_activado',s.empleado_id)
    const codigos=await codigosRecuperacion(c,s.empleado_id)
    return c.json({...await emitirSesion(c,e,{compartido:s.compartido,dispositivo:s.dispositivo,fuerte:true}),codigos})
  })
  app.post('/api/personal/recuperacion/codigos',async c=>{
    const s=personal(c)
    if(!autorizacionReciente(c))return c.json({error:'Confirmá tu identidad para renovar tus códigos.',revalidar:true},428)
    const codigos=await codigosRecuperacion(c,s.empleado_id);await auditar(c,'recuperacion_renovada',s.empleado_id)
    return c.json({codigos})
  })
  app.get('/api/personal/sesiones',async c=>{
    const s=personal(c),sql=neon(c.env.DATABASE_URL)
    return c.json({sesiones:await sql`SELECT id,dispositivo,compartido,creada,actividad,vence,bloqueada FROM sesion_personal WHERE empleado_id=${s.empleado_id}::uuid AND revocada IS NULL AND vence>now() ORDER BY creada DESC LIMIT 50`})
  })
  app.post('/api/personal/sesiones/:id/revocar',async c=>{
    const s=personal(c),id=c.req.param('id'),sql=neon(c.env.DATABASE_URL)
    if(id!=='todas'&&!uuid(id))return c.json({error:'Sesión no encontrada.'},404)
    const rows=await sql`UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=${s.empleado_id}::uuid AND (${id}='todas' OR id::text=${id}) RETURNING id`
    await auditar(c,'sesion_revocada',s.empleado_id,{sesiones:rows.map(x=>x.id)})
    if(id==='todas'||id===s.id)borrarCookies(c)
    return c.json({revocadas:rows.length,salir:id==='todas'||id===s.id})
  })
  app.get('/api/personal/eventos',async c=>{
    const s=personal(c),sql=neon(c.env.DATABASE_URL)
    return c.json({eventos:await sql`SELECT a.id,a.cuando,a.accion,COALESCE(e.nombre,a.quien) AS responsable,a.detalle FROM auditoria a LEFT JOIN empleado e ON e.id::text=a.quien
      WHERE (${s.permiso==='propietario'} OR a.quien=${s.empleado_id}) AND (a.accion LIKE 'sesion_%' OR a.accion LIKE 'acceso_%' OR a.accion LIKE 'mfa_%' OR a.accion LIKE 'recuperacion_%' OR a.accion LIKE 'invitacion_%' OR a.accion IN ('identidad_revalidada','cuenta_recuperada','propietario_activado','crear_empleado','cambiar_clave','permiso_empleado','desactivar_empleado','reactivar_empleado','restablecer_clave')) ORDER BY a.cuando DESC,a.id DESC LIMIT 50`})
  })
  app.post('/api/personal/clave',async c=>{
    const s=personal(c),r=await c.req.json(),error=validarNuevaClave(r)
    if(error)return c.json({error},422)
    if(s.fase!=='clave'&&!autorizacionReciente(c))return c.json({error:'Confirmá tu identidad antes de cambiar la contraseña.',revalidar:true},428)
    const limit=await limites(c,'clave:'+s.empleado_id);if(!limit.ok)return espera(c,limit.segundos)
    const e=await buscar(c,s.usuario)
    if(!await password(c,e,r.actual)){await fallo(c,limit.clave,s.empleado_id);return c.json({error:'La contraseña actual no es correcta.'},422)}
    const hash=await guardarClave(neon(c.env.DATABASE_URL),secretoCredencial(c.env),r.nueva,'empleado'),sql=neon(c.env.DATABASE_URL)
    const [changed]=await sql`UPDATE empleado SET clave_huella=${hash},version_clave=version_clave+1,requiere_cambio=false,clave_temporal_vence=NULL,clave_cambiada=now() WHERE id=${s.empleado_id}::uuid AND version_clave=${s.version_clave} AND activo RETURNING *`
    if(!changed)return c.json({error:'Tu acceso cambió. Ingresá nuevamente.'},401)
    await revocar(c,s.empleado_id);await acierto(c,limit.clave);await auditar(c,'cambiar_clave',s.empleado_id)
    const codigos=s.fase==='clave'&&!s.mfa_secreto&&!privilegio(s.permiso)?await codigosRecuperacion(c,s.empleado_id):undefined
    if(s.fase==='clave')return c.json({...await emitirSesion(c,changed as Persona,{compartido:s.compartido,dispositivo:s.dispositivo}),codigos})
    borrarCookies(c);return c.json({actualizada:true,salir:true})
  })
  app.get('/api/personal/equipo',async c=>{
    if(!privilegio(c.get('permiso')))return c.json({error:'Acceso exclusivo de administración.'},403)
    const sql=neon(c.env.DATABASE_URL);return c.json({empleados:await sql`SELECT id,nombre,usuario,permiso,activo,version_clave,requiere_cambio,clave_temporal_vence FROM empleado ORDER BY nombre`})
  })
  app.post('/api/personal/equipo',async c=>{
    const denied=propietarioReciente(c);if(denied)return denied
    const r=await c.req.json()
    if(!nombreValido(r.nombre)||!usuarioValido(r.usuario)||!permisos.includes(r.permiso))return c.json({error:'Revisá nombre, usuario y permiso.'},422)
    const sql=neon(c.env.DATABASE_URL),hash=await guardarClave(sql,secretoCredencial(c.env),aleatorio(),'empleado')
    const [e]=await sql`INSERT INTO empleado(nombre,usuario,permiso,clave_huella,requiere_cambio,clave_temporal_vence) VALUES(${r.nombre.trim()},${r.usuario},${r.permiso},${hash},true,now()+interval '24 hours') ON CONFLICT(usuario) DO NOTHING RETURNING id,version_clave`
    if(!e)return c.json({error:'Ese usuario ya existe.'},409)
    const invite=await invitacion(c,String(e.id),Number(e.version_clave))
    await auditar(c,'crear_empleado',personal(c).empleado_id,{empleado:e.id,permiso:r.permiso})
    return c.json({id:e.id,usuario:r.usuario,...invite})
  })
  for(const accion of ['desactivar','reactivar','permiso'] as const)app.post('/api/personal/equipo/:id/'+accion,async c=>{
    const denied=propietarioReciente(c);if(denied)return denied
    const r=await c.req.json(),id=c.req.param('id')
    if(!uuid(id)||!Number.isSafeInteger(r.version)||r.version<0||(accion==='permiso'&&!permisos.includes(r.permiso)))return c.json({error:'Actualizá la lista y revisá los datos.'},422)
    try{
      const result=await transaccion(c.env,async cli=>{
        await cli.query('LOCK TABLE empleado IN SHARE ROW EXCLUSIVE MODE')
        const {rows:[before]}=await cli.query('SELECT * FROM empleado WHERE id=$1 AND version_clave=$2 FOR UPDATE',[id,r.version])
        if(!before||(accion==='permiso'&&before.permiso===r.permiso)||(accion==='reactivar'&&before.activo)||(accion==='desactivar'&&!before.activo))return null
        const {rows:[e]}=await cli.query('UPDATE empleado SET activo=$2,permiso=$3,version_clave=version_clave+1 WHERE id=$1 RETURNING id,permiso,activo,version_clave',[id,accion==='permiso'?before.activo:accion==='reactivar',accion==='permiso'?r.permiso:before.permiso])
        await cli.query('UPDATE sesion_personal SET revocada=COALESCE(revocada,now()) WHERE empleado_id=$1',[id])
        await cli.query('INSERT INTO auditoria(quien,accion,detalle) VALUES($1,$2,$3::jsonb)',[personal(c).empleado_id,accion+'_empleado',JSON.stringify({empleado:id,antes:{permiso:before.permiso,activo:before.activo},despues:e})])
        return e
      })
      return result?c.json(result):c.json({error:'El acceso cambió. Actualizá la lista.'},409)
    }catch(e){if(e instanceof Error&&e.message.includes('ultimo_propietario'))return c.json({error:'Debe quedar otro propietario activo con su autenticador configurado antes de realizar este cambio.'},409);throw e}
  })
  app.post('/api/personal/equipo/:id/restablecer-clave',async c=>{
    const denied=propietarioReciente(c);if(denied)return denied
    const id=c.req.param('id'),r=await c.req.json()
    if(!uuid(id)||!Number.isSafeInteger(r.version)||r.version<0)return c.json({error:'Actualizá la lista y revisá el acceso.'},422)
    if(id===personal(c).empleado_id)return c.json({error:'Cambiá tu propia contraseña desde Cuenta y seguridad.'},422)
    const sql=neon(c.env.DATABASE_URL),hash=await guardarClave(sql,secretoCredencial(c.env),aleatorio(),'empleado')
    const [e]=await sql`UPDATE empleado SET clave_huella=${hash},requiere_cambio=true,clave_temporal_vence=now()+interval '24 hours',version_clave=version_clave+1 WHERE id=${id}::uuid AND activo AND version_clave=${r.version} RETURNING usuario,version_clave`
    if(!e)return c.json({error:'El acceso cambió o está desactivado.'},409)
    await revocar(c,id);const invite=await invitacion(c,id,Number(e.version_clave))
    await auditar(c,'restablecer_clave',personal(c).empleado_id,{empleado:id,mfaConservado:true})
    return c.json({usuario:e.usuario,...invite})
  })
}
