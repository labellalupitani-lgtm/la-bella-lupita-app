import { TOTP } from 'otpauth'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { preparar } from './soporte.mjs'
const t=await preparar(),{db,request:call,staff}=t
const migrar=async n=>db.exec(readFileSync(new URL('../db/'+n+'.sql',import.meta.url),'utf8'))
const get=async(path,token=staff)=>{const r=await call(path,undefined,token);assert.equal(r.status,200,JSON.stringify(r.body));return r.body}
const directorio=(q='',token=staff)=>get('/api/operacion/clientes?'+q,token)
const historial=(id=t.id,q='',token=staff)=>get('/api/operacion/clientes/'+id+'/historial?'+q,token)
const snapshot=async()=>JSON.stringify((await db.query(`SELECT
 (SELECT jsonb_agg(a ORDER BY id) FROM asiento a) AS dinero,
 (SELECT jsonb_agg(s ORDER BY id) FROM sello s) AS sellos,
 (SELECT jsonb_agg(p ORDER BY id) FROM punto p) AS puntos,
 (SELECT jsonb_agg(jsonb_build_object('id',s.id,'saldo',to_jsonb(d)) ORDER BY s.id) FROM socio s CROSS JOIN LATERAL saldo_de(s.id) d) AS saldos`)).rows)
try{
  await db.exec(`INSERT INTO socio(nombre,telefono,correo,correo_verificado,creado,baja,origen)
    SELECT 'Cliente '||n,'5058'||lpad(n::text,7,'0'),'cliente-'||n||'@example.test',CASE WHEN n%2=0 THEN now() END,
    '2026-10-01 12:00:00+00'::timestamptz,CASE WHEN n%10=0 THEN now() END,'correo' FROM generate_series(1,105) n;
    INSERT INTO socio(nombre,telefono,creado) VALUES('Literal % _','50599998888','2026-10-02 05:59:59+00'),('Día siguiente','50599997777','2026-10-02 06:00:00+00');`)
  let d=await directorio();assert.equal(d.total,109);assert.equal(d.registrados,109);assert.equal(d.activos,99);assert.equal(d.verificados,52)
  const ids=new Set()
  for(let pagina=0;pagina<6;pagina++)for(const r of (await directorio('pagina='+pagina)).filas){assert.ok(!ids.has(r.id));ids.add(r.id)}
  assert.equal(ids.size,109,'Incluye todos los registros sin compras ni duplicados, aun con la misma fecha')
  assert.equal((await directorio('pagina=6')).filas.length,0)
  assert.equal((await directorio('q=cliente-17%40example.test')).total,1)
  assert.equal((await directorio('q=Cliente%20105')).total,1,'El dígito del nombre no amplía la búsqueda a teléfonos')
  assert.equal((await directorio('q=%2B505%208000%200017')).total,1)
  assert.equal((await directorio('q=%25')).total,1);assert.equal((await directorio('q=_')).total,1)
  assert.equal((await directorio('estado=bajas')).total,10)
  assert.equal((await directorio('origen=correo')).total,105)
  assert.equal((await directorio('desde=2026-10-01&hasta=2026-10-01')).total,106,'Fechas inclusivas en Nicaragua')
  assert.equal((await directorio('desde=2026-10-02&hasta=2026-10-02')).total,1)
  for(const q of ['pagina=-1','pagina=1.5','estado=otro','origen=otro','archivo=otro','desde=2026-02-31','hasta=0000-01-01','desde=2026-10-02&hasta=2026-10-01','q='+('a'.repeat(101))])assert.equal((await call('/api/operacion/clientes?'+q,undefined,staff)).status,422)
  console.log('PASA directorio: 109 cuentas, sin compras, búsqueda literal y normalizada, estado, origen, fechas y paginación estable')

  await db.query(`INSERT INTO asiento(socio_id,monto,tipo,concepto,creado) SELECT $1,-100,'consumo','Movimiento sintético '||n,'2026-10-03 12:00:00.123456+00' FROM generate_series(1,105) n`,[t.id])
  await db.query(`INSERT INTO pedido(socio_id,referencia,lineas,total) VALUES($1,'historial-prueba','[{"nombre":"Café","cuanto":1,"precio":100}]',100);
  `,[t.id])
  await db.query(`INSERT INTO pedido_evento(pedido_id,estado,quien) SELECT id,'recibido','propietario' FROM pedido WHERE socio_id=$1`,[t.id])
  await db.query(`INSERT INTO reserva(socio_id,zona,cuando,termina,personas,deposito) VALUES($1,'vip',now()+interval '10 days',now()+interval '10 days 2 hours',2,10000)`,[t.id])
  await db.query(`INSERT INTO compra_bolsa(socio_id,numero,generacion,total) VALUES($1,1,1,89000)`,[t.id])
  await db.query(`UPDATE reserva_cosecha SET socio_id=$1,apartada=now(),pagada=now() WHERE numero=1`,[t.id])
  await db.query(`INSERT INTO asiento_experiencia(socio_id,experiencia_id,butaca,pagado) VALUES($1,'mesa-tostador',1,85000)`,[t.id])
  await db.query(`INSERT INTO tanda(socio_id,abierta,cerrada,canjeada) VALUES($1,now()-interval '3 days',now()-interval '2 days',now()-interval '1 day')`,[t.id])
  await db.query(`INSERT INTO beneficio_uso(membresia_id,clase) SELECT id,'bebida_dia' FROM membresia WHERE socio_id=$1`,[t.id])
  await db.query(`INSERT INTO solicitud_atencion(socio_id,referencia,mensaje) VALUES($1,gen_random_uuid(),'Consulta de ejemplo')`,[t.id])
  const antes=snapshot(),mAntes=JSON.stringify((await db.query('SELECT * FROM membresia ORDER BY id')).rows)
  const ficha=await get('/api/operacion/clientes/'+t.id);assert.equal(ficha.membresia.estado,'vencida');assert.equal(ficha.pedidos,1);assert.ok(ficha.ultimo_pedido);assert.equal(typeof ficha.saldo.total,'number')
  assert.equal((await get('/api/operacion/clientes/'+t.otro)).pedidos,0)
  const vistos=new Set(),tipos=new Set();let cursor=''
  do{const h=await historial(t.id,'cursor='+encodeURIComponent(cursor));for(const a of h.filas){assert.ok(!vistos.has(a.id));vistos.add(a.id);tipos.add(a.tipo)}cursor=h.siguiente}while(cursor)
  for(const tipo of ['dinero','pedidos','reservas','bolsas','experiencias','sellos','canjes','puntos','membresias','beneficios','atencion']){
    assert.ok(tipos.has(tipo),tipo);assert.ok((await historial(t.id,'tipo='+tipo)).filas.every(a=>a.tipo===tipo))
  }
  assert.equal([...vistos].filter(id=>id.startsWith('dinero:')).length,107,'Historial completo con fechas idénticas y precisión de microsegundos')
  assert.ok((await historial(t.otro)).filas.every(a=>a.titulo!=='Consulta de ejemplo'))
  assert.equal(await snapshot(),await antes,'Las consultas no modifican libro, sellos, puntos ni saldos')
  assert.equal(JSON.stringify((await db.query('SELECT * FROM membresia ORDER BY id')).rows),mAntes,'Consultar no renueva membresías')
  assert.equal((await call('/api/operacion/clientes/no-valido',undefined,staff)).status,404)
  for(const q of ['tipo=otro','cursor=basura','cursor='+encodeURIComponent(btoa(JSON.stringify({fecha:'2026-02-31T00:00:00.000000Z',id:'dinero:1'})))])assert.equal((await call('/api/operacion/clientes/'+t.id+'/historial?'+q,undefined,staff)).status,422)
  console.log('PASA ficha y 11 clases de historial, cursor sin omisiones, privacidad y consultas sin mutaciones')

  const roles={}
  for(const permiso of ['caja','cocina','encargado']){
    const nuevo=await t.crearEmpleado({nombre:'Prueba '+permiso,usuario:'clientes.'+permiso,permiso});
    roles[permiso]={...nuevo,token:nuevo.auth}
  }
  for(const token of [roles.caja.token,roles.cocina.token,t.token]){
    for(const ruta of ['/api/operacion/clientes','/api/operacion/clientes/'+t.id,'/api/operacion/clientes/'+t.id+'/historial'])assert.equal((await call(ruta,undefined,token)).status,403)
  }
  await directorio('',roles.encargado.token);await get('/api/operacion/clientes/'+t.id,roles.encargado.token)
  await get('/api/operacion/listas/equipo',roles.encargado.token);await get('/api/operacion/metricas',roles.encargado.token)
  for(const token of [roles.encargado.token,roles.caja.token,roles.cocina.token,t.token]){
    assert.equal((await call('/api/personal/equipo',{nombre:'Prohibido',usuario:'prohibido',permiso:'encargado'},token)).status,403)
    for(const accion of ['permiso','desactivar','reactivar','restablecer-clave'])assert.equal((await call('/api/personal/equipo/'+roles.caja.id+'/'+accion,{version:0,permiso:'encargado',actual:'irrelevante'},token)).status,403)
  }
  const e=roles.caja,base=(await db.query('SELECT id,usuario,nombre,clave_huella FROM empleado WHERE id=$1',[e.id])).rows[0]
  assert.equal((await call('/api/personal/equipo/'+e.id+'/permiso',{version:1,permiso:'invalido'},staff)).status,422)
  assert.equal((await call('/api/personal/equipo/'+e.id+'/permiso',{version:1,permiso:'encargado'},staff)).status,200)
  assert.equal((await call('/api/personal/yo',undefined,e.token)).status,401)
  const login=async()=>{let r=await t.entrarEquipo(e.usuario,e.clave);assert.equal(r.status,200);if(r.body.fase==='configurar'){const m=await t.configurarMfa(r.auth);e.secretoMfa=m.secretoMfa;return m.auth}await db.query('UPDATE empleado SET mfa_ultimo=-1 WHERE id=$1',[e.id]);r=await call('/api/personal/mfa/verificar',{codigo:new TOTP({secret:e.secretoMfa}).generate()},r.auth);assert.equal(r.status,200);return r.auth}
  let renovado=await login();assert.equal((await get('/api/personal/yo',renovado)).permiso,'encargado')
  await directorio('',renovado)
  assert.equal((await call('/api/personal/equipo/'+e.id+'/desactivar',{version:0},staff)).status,409)
  assert.equal((await call('/api/personal/equipo/'+e.id+'/desactivar',{version:2},staff)).status,200)
  assert.equal((await call('/api/personal/yo',undefined,renovado)).status,401)
  assert.equal((await t.entrarEquipo(e.usuario,e.clave)).status,401)
  assert.equal((await call('/api/personal/equipo/'+e.id+'/reactivar',{version:3},staff)).status,200)
  for(const viejo of [renovado,e.token])assert.equal((await call('/api/personal/yo',undefined,viejo)).status,401)
  renovado=await login();assert.equal((await get('/api/personal/yo',renovado)).permiso,'encargado')
  const simultaneas=await Promise.all(['cocina','caja'].map(permiso=>call('/api/personal/equipo/'+e.id+'/permiso',{version:4,permiso},staff)))
  assert.deepEqual(simultaneas.map(r=>r.status).sort(),[200,409])
  assert.equal((await call('/api/personal/yo',undefined,renovado)).status,401)
  assert.deepEqual((await db.query('SELECT id,usuario,nombre,clave_huella FROM empleado WHERE id=$1',[e.id])).rows[0],base)
  assert.equal((await db.query("SELECT count(*)::int n FROM auditoria WHERE accion IN ('permiso_empleado','desactivar_empleado','reactivar_empleado')")).rows[0].n,4)
  console.log('PASA política del propietario, cinco perfiles, cambio de rol, reactivación, auditoría, revocación y conflicto concurrente')

  await db.query("UPDATE socio SET nombre='María' WHERE id=$1",[t.id])
  await db.exec(`INSERT INTO socio(nombre,telefono,correo,correo_verificado) SELECT 'Socio '||n,'5055'||lpad(n::text,7,'0'),CASE WHEN n=81 THEN 'legitimo@example.test' END,CASE WHEN n=81 THEN now() END FROM generate_series(1,81) n`)
  await migrar('018_clientes_equipo')
  assert.equal((await db.query("SELECT count(*)::int n FROM socio WHERE origen='muestra'")).rows[0].n,81)
  assert.equal((await db.query("SELECT origen FROM socio WHERE correo='legitimo@example.test'")).rows[0].origen,'correo')
  await db.query('UPDATE asiento_experiencia SET cedido_a=$1 WHERE socio_id=$2',[t.otro,t.id])
  await assert.rejects(()=>migrar('019_archivar_muestras'),/cesiones/);await db.exec('ROLLBACK')
  await db.query('UPDATE asiento_experiencia SET cedido_a=NULL WHERE socio_id=$1',[t.id])
  const integridad=await snapshot(),reales=JSON.stringify((await db.query("SELECT * FROM socio WHERE origen<>'muestra' ORDER BY id")).rows)
  await migrar('019_archivar_muestras')
  assert.equal(await snapshot(),integridad,'El archivo conserva todos los saldos y movimientos')
  assert.equal(JSON.stringify((await db.query("SELECT * FROM socio WHERE origen<>'muestra' ORDER BY id")).rows),reales)
  d=await directorio();assert.equal(d.registrados,109);assert.equal(d.muestras_archivadas,81)
  assert.equal((await directorio('archivo=muestras')).total,81)
  assert.equal((await call('/api/operacion/clientes?archivo=muestras',undefined,roles.encargado.token)).status,403)
  assert.equal((await call('/api/operacion/clientes/'+t.id,undefined,roles.encargado.token)).status,404)
  assert.equal((await call('/api/operacion/clientes/'+t.id+'/historial',undefined,roles.encargado.token)).status,404)
  assert.ok((await get('/api/operacion/clientes/'+t.id)).archivado_muestra);assert.ok((await historial()).filas.length>0)
  assert.equal((await call('/api/yo',undefined,t.token)).status,401)
  assert.equal((await call('/api/operacion/cliente',{telefono:t.tel},staff)).status,404)
  assert.equal((await call('/api/cuenta/recargar',{telefono:t.tel,monto:20000,ref:'archivo-inmutable'},staff)).status,404)
  const resumen=await get('/api/operacion/resumen');assert.equal(resumen.pedidos,0);assert.equal(resumen.entregas,0)
  assert.equal((await get('/api/operacion/metricas')).clientes,0)
  for(const lista of ['pedidos','entregas','agenda','atencion'])assert.equal((await get('/api/operacion/listas/'+lista+'?estado=todos')).total,0)
  assert.equal((await db.query('SELECT count(*)::int n FROM reserva_cosecha WHERE socio_id IS NOT NULL')).rows[0].n,0)
  await db.query(`INSERT INTO compra_bolsa(socio_id,numero,generacion,total) VALUES($1,1,1,89000)`,[t.otro])
  await db.query(`INSERT INTO asiento_experiencia(socio_id,experiencia_id,butaca,pagado) VALUES($1,'mesa-tostador',1,85000)`,[t.otro])
  await db.query(`INSERT INTO membresia(socio_id,numero,cuota,hasta) VALUES($1,1,95000,now()+interval '30 days')`,[t.otro])
  await db.query(`INSERT INTO reserva(socio_id,zona,cuando,termina,personas,deposito) SELECT $1,zona,cuando,termina,personas,deposito FROM reserva WHERE socio_id=$2`,[t.otro,t.id])
  const trasNuevasCompras=await snapshot()
  const archivo=JSON.stringify((await db.query('SELECT * FROM archivo_muestra ORDER BY tabla,clave')).rows)
  await migrar('018_clientes_equipo');await migrar('019_archivar_muestras')
  assert.equal(JSON.stringify((await db.query('SELECT * FROM archivo_muestra ORDER BY tabla,clave')).rows),archivo)
  assert.equal(await snapshot(),trasNuevasCompras)
  await db.query('SELECT mantener_membresia($1)',[t.id]);assert.equal(await snapshot(),trasNuevasCompras)
  assert.equal((await db.query('SELECT count(*)::int n FROM operativo_membresia')).rows[0].n,1)
  console.log('PASA archivo exacto, correos reales preservados, bloqueo de cruces, historial intacto, sin acceso operativo, cupos liberados e idempotencia')
}catch(e){console.error(e.stack);if(e.query)console.error(e.query);process.exitCode=1}finally{await db.close()}
