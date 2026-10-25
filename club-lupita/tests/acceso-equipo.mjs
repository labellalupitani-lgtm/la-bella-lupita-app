import assert from 'node:assert/strict'
import { TOTP } from 'otpauth'
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs'
import { preparar } from './soporte-perfiles-equipo.mjs'
const resultados=[]
const t=await preparar(),{request:call,db}=t
const ok=(nombre)=>{resultados.push(nombre);console.log('PASA '+nombre)}
const version=async id=>(await db.query('SELECT version_clave FROM empleado WHERE id=$1',[id])).rows[0].version_clave
const completar=async(r,p)=>{assert.equal(r.status,200,JSON.stringify(r.body));if(r.body.fase==='mfa'){// Fixture de reloj: usar la ventana siguiente sin esperar 30 s.
  await db.query('UPDATE empleado SET mfa_ultimo=-1 WHERE id=$1',[p.id])
  r=await call('/api/personal/mfa/verificar',{codigo:new TOTP({secret:p.secretoMfa}).generate()},r.auth)
}assert.equal(r.status,200,JSON.stringify(r.body));return r.auth}
try{
  assert.equal((await call('/api/auth/equipo/iniciar-propietario',{nombre:'Otro propietario',usuario:'otro.prop',actual:t.env.CASA_SECRETO,nueva:'Una frase privada para iniciar',confirmacion:'Una frase privada para iniciar'},null)).status,409)
  for(const path of ['/api/auth/casa','/api/auth/personal'])assert.equal((await call(path,{clave:t.env.CASA_SECRETO},null)).status,410)
  assert.equal((await call('/api/panel',undefined,null)).status,410)
  const legacy=await t.firmar(t.env.SESION_SECRETO,{tel:'',rol:'casa',exp:Date.now()+3600000})
  assert.equal((await call('/api/operacion/resumen',undefined,legacy)).status,401)
  ok('Transición de un uso, propietario nominal, MFA obligatorio y legado cerrado')

  const cajera=await t.crearEmpleado({usuario:'caja.control'}),cocina=await t.crearEmpleado({usuario:'cocina.control',permiso:'cocina'}),encargado=await t.crearEmpleado({usuario:'encargado.control',permiso:'encargado'}),socia=await t.crearEmpleado({usuario:'socia.control',permiso:'propietario'})
  assert.notEqual(socia.id,t.owner.id)
  assert.equal((await call('/api/personal/equipo',undefined,socia.auth)).status,200)
  for(const p of [cajera,cocina,encargado])assert.equal((await call('/api/personal/equipo',{nombre:'Sin permiso',usuario:'sin.permiso',permiso:'propietario'},p.auth)).status,403)
  for(const [p,path,status] of [[cocina,'/api/operacion/pedidos',200],[cocina,'/api/operacion/clientes',403],[cajera,'/api/operacion/metricas',403],[encargado,'/api/operacion/metricas',200]])assert.equal((await call(path,undefined,p.auth)).status,status)
  ok('Varios propietarios y matriz de Caja, Cocina, Encargado y Cliente')

  assert.equal((await call('/api/personal/bloquear',{},cajera.auth,{headers:{'x-equipo-csrf':'incorrecto'}})).status,403)
  assert.equal((await call('/api/personal/bloquear',{},cajera.auth,{headers:{origin:'https://otro.example'}})).status,403)
  assert.equal((await call('/api/yo',undefined,t.token,{headers:{cookie:t.staff.cookie}})).status,200)
  assert.equal((await call('/api/personal/yo',undefined,t.staff,{headers:{authorization:'Bearer '+t.token}})).body.id,t.owner.id)
  const entrada=await t.entrarEquipo(cajera.usuario,cajera.clave)
  assert.equal(entrada.body.token,undefined)
  assert.match(entrada.headers.get('set-cookie'),/HttpOnly/)
  assert.match(entrada.headers.get('set-cookie'),/Secure/)
  assert.match(entrada.headers.get('set-cookie'),/SameSite=Strict/)
  assert.equal((await call('/api/personal/salir',{},entrada.auth)).status,200)
  assert.equal((await call('/api/personal/yo',undefined,entrada.auth)).status,401)
  assert.equal((await call('/api/personal/yo',undefined,cajera.auth)).status,200)
  ok('Cookie segura, CSRF/origen, coexistencia cliente-equipo y cierre revocable por sesión')

  await db.query("UPDATE sesion_personal SET actividad=now()-interval '31 minutes' WHERE empleado_id=$1",[cajera.id])
  assert.equal((await call('/api/personal/yo',undefined,cajera.auth)).body.bloqueada,true)
  assert.equal((await call('/api/operacion/pedidos',undefined,cajera.auth)).status,423)
  assert.equal((await call('/api/personal/actividad',{},cajera.auth)).status,423)
  assert.equal((await call('/api/personal/revalidar',{actual:cajera.clave},cajera.auth)).status,200)
  assert.equal((await call('/api/operacion/pedidos',undefined,cajera.auth)).status,200)
  await db.query("UPDATE sesion_personal SET verificada=now()-interval '6 minutes' WHERE empleado_id=$1",[socia.id])
  assert.equal((await call('/api/personal/equipo',{nombre:'Sin confirmar',usuario:'reciente.prueba',permiso:'caja'},socia.auth)).status,428)
  ok('Inactividad no renovada por consultas y revalidación de acciones privilegiadas')

  const invitada=await t.crearEmpleado({usuario:'invitada.control',activar:false})
  await db.query("UPDATE invitacion_personal SET vence=now()-interval '1 second' WHERE empleado_id=$1",[invitada.id])
  assert.equal((await call('/api/auth/equipo/activar',{usuario:invitada.usuario,invitacion:invitada.invitacion,nueva:cajera.clave,confirmacion:cajera.clave},null)).status,410)
  const reinvitar=await call('/api/personal/equipo/'+invitada.id+'/restablecer-clave',{version:await version(invitada.id)},t.staff)
  const aceptada=await t.activarInvitacion(reinvitar.body)
  assert.equal((await call('/api/auth/equipo/activar',{...reinvitar.body,nueva:cajera.clave,confirmacion:cajera.clave},null)).status,410)
  assert.equal(aceptada.codigos.length,8)
  ok('Invitación de 24 horas, renovación, consumo único y contraseña elegida por la persona')

  const inicio=await t.entrarEquipo(encargado.usuario,encargado.clave)
  assert.equal(inicio.body.fase,'mfa')
  assert.equal((await call('/api/operacion/metricas',undefined,inicio.auth)).status,403)
  await db.query('UPDATE empleado SET mfa_ultimo=-1 WHERE id=$1',[encargado.id])
  const codigo=new TOTP({secret:encargado.secretoMfa}).generate()
  const confirmado=await call('/api/personal/mfa/verificar',{codigo},inicio.auth)
  assert.equal(confirmado.status,200)
  assert.equal((await call('/api/personal/yo',undefined,inicio.auth)).status,401)
  const segundo=await t.entrarEquipo(encargado.usuario,encargado.clave)
  assert.equal((await call('/api/personal/mfa/verificar',{codigo},segundo.auth)).status,422)
  const registro=(await db.query('SELECT mfa_secreto FROM empleado WHERE id=$1',[encargado.id])).rows[0]
  assert.ok(!registro.mfa_secreto.includes(encargado.secretoMfa))
  ok('Desafío MFA limitado, sesión rotada, código no reutilizable y secreto cifrado')

  const recuperar=()=>call('/api/auth/equipo/recuperar',{usuario:aceptada.usuario,codigo:aceptada.codigos[0],nueva:'Mi nueva frase privada de recuperación',confirmacion:'Mi nueva frase privada de recuperación'},null)
  const recuperada=await recuperar();assert.equal(recuperada.status,200);assert.equal(recuperada.body.fase,'configurar')
  assert.equal((await call('/api/personal/yo',undefined,aceptada.auth)).status,401)
  assert.equal((await recuperar()).status,401)
  assert.equal((await db.query('SELECT count(*)::int n FROM recuperacion_personal WHERE empleado_id=$1 AND usada IS NULL',[aceptada.id])).rows[0].n,0)
  await t.configurarMfa(recuperada.auth)
  ok('Recuperación con código de un uso, revocación total y nuevo autenticador')

  await db.query("UPDATE sesion_personal SET verificada=now() WHERE empleado_id=$1",[t.owner.id])
  assert.equal((await call('/api/personal/equipo/'+socia.id+'/desactivar',{version:await version(socia.id)},t.staff)).status,200)
  assert.equal((await call('/api/personal/yo',undefined,socia.auth)).status,401)
  assert.equal((await call('/api/personal/equipo/'+t.owner.id+'/desactivar',{version:await version(t.owner.id)},t.staff)).status,409)
  assert.equal((await call('/api/personal/equipo/'+t.owner.id+'/permiso',{version:await version(t.owner.id),permiso:'caja'},t.staff)).status,409)
  const pendiente=await t.crearEmpleado({usuario:'propietario.pendiente',permiso:'propietario',activar:false})
  assert.ok(pendiente.id)
  assert.equal((await call('/api/personal/equipo/'+t.owner.id+'/desactivar',{version:await version(t.owner.id)},t.staff)).status,409)
  ok('Último propietario protegido; invitaciones pendientes no cuentan como relevo')

  for(let i=0;i<10;i++)assert.equal((await t.entrarEquipo(cajera.usuario,cajera.clave)).status,200)
  for(let i=0;i<5;i++)assert.equal((await t.entrarEquipo(cajera.usuario,'clave incorrecta')).status,401)
  assert.equal((await t.entrarEquipo(cajera.usuario,cajera.clave)).status,429)
  assert.equal((await t.entrarEquipo(cocina.usuario,cocina.clave)).status,200)
  for(const dispositivo of [123,{},'mal\0nombre'])assert.equal((await call('/api/auth/equipo/entrar',{usuario:cocina.usuario,clave:cocina.clave,dispositivo},null)).status,422)
  assert.equal((await call('/api/personal/equipo',{nombre:'mal\0nombre',usuario:'mal.nombre',permiso:'caja'},t.staff)).status,422)
  ok('Éxitos sin penalización, retraso por fallos y entradas inválidas sin 500')

  assert.equal((await call('/api/auth/equipo/estado?entorno=capacitacion',undefined,null)).status,503)
  t.env.DEMO_DATABASE_URL=t.env.DATABASE_URL
  assert.equal((await call('/api/auth/equipo/estado?entorno=capacitacion',undefined,null)).status,503)
  delete t.env.DEMO_DATABASE_URL
  const otro=await preparar()
  try{t.env.DEMO_DATABASE_URL=otro.env.DATABASE_URL;const enDemo=await call('/api/auth/equipo/estado?entorno=capacitacion',undefined,null);assert.equal(enDemo.status,200);assert.equal(enDemo.body.demo,true);assert.equal((await call('/api/personal/yo',undefined,{...t.staff,cookie:t.staff.cookie.replace('=r.','=d.')})).status,401)}finally{await otro.close();delete t.env.DEMO_DATABASE_URL}
  const eventos=await call('/api/personal/eventos',undefined,t.staff)
  assert.equal(eventos.status,200);assert.ok(eventos.body.eventos.some(e=>e.accion==='acceso_rechazado'));assert.ok(!JSON.stringify(eventos.body).includes(t.owner.clave))
  const antes=JSON.stringify((await db.query('SELECT * FROM asiento ORDER BY id')).rows)
  await db.exec(readFileSync(new URL('../db/020_acceso_equipo.sql',import.meta.url),'utf8'))
  assert.equal(JSON.stringify((await db.query('SELECT * FROM asiento ORDER BY id')).rows),antes)
  ok('Capacitación falla cerrada, aislamiento de sesión, auditoría sin secretos y migración aditiva idempotente')
}finally{await t.close();mkdirSync('entregables/acceso-equipo-2026-10-07/evidencia',{recursive:true});writeFileSync('entregables/acceso-equipo-2026-10-07/evidencia/acceso-local.json',JSON.stringify({fecha:new Date().toISOString(),grupos:resultados},null,2))}
