import assert from 'node:assert/strict'
import { preparar } from './soporte.mjs'
const t=await preparar()
try {
  const {db,request:call,staff}=t
  await db.query(`INSERT INTO pedido(socio_id,referencia,lineas,total,estado,creado)
    SELECT $1,'panel-'||n,'[{"nombre":"Café","cuanto":1,"precio":10000}]'::jsonb,10000,CASE WHEN n=105 THEN 'entregado' ELSE 'recibido' END,now()-n*interval '1 minute' FROM generate_series(1,105) n`,[t.id])
  await db.query(`INSERT INTO compra_bolsa(socio_id,numero,generacion,total) SELECT $1,n,10,89000 FROM generate_series(1,105) n`,[t.id])
  await db.query(`INSERT INTO solicitud_atencion(socio_id,referencia,mensaje) SELECT $1,gen_random_uuid(),'Consulta de prueba '||n FROM generate_series(1,105) n`,[t.id])
  for(const tipo of ['pedidos','entregas','atencion']) {
    const a=await call('/api/operacion/listas/'+tipo,undefined,staff)
    assert.equal(a.status,200,JSON.stringify(a.body));assert.equal(a.body.filas.length,20)
    assert.equal(a.body.total,tipo==='pedidos'?104:105)
    const ids=new Set()
    for(let pagina=0;pagina<6;pagina++){
      const r=await call('/api/operacion/listas/'+tipo+'?pagina='+pagina,undefined,staff)
      assert.equal(r.status,200,JSON.stringify(r.body));r.body.filas.forEach(f=>{assert.ok(!ids.has(f.id));ids.add(f.id)})
    }
    assert.equal(ids.size,a.body.total,'Ningún registro debe quedar oculto: '+tipo)
  }
  assert.equal((await call('/api/operacion/listas/pedidos?estado=entregado',undefined,staff)).body.total,1)
  assert.equal((await call('/api/operacion/listas/pedidos?q=no-existe',undefined,staff)).body.total,0)
  assert.equal((await call('/api/operacion/listas/atencion?q=105',undefined,staff)).body.total,1)
  assert.equal((await call('/api/operacion/listas/pedidos?q=%25',undefined,staff)).body.total,0,'La búsqueda % es literal')
  for(const consulta of ['pagina=-1','pagina=1.1','estado=ilegítimo','fecha=2026-02-31','q='+('a'.repeat(81))])assert.equal((await call('/api/operacion/listas/pedidos?'+encodeURI(consulta),undefined,staff)).status,422)
  for(const tipo of ['agenda','equipo','auditoria']) {
    const r=await call('/api/operacion/listas/'+tipo,undefined,staff);assert.equal(r.status,200,JSON.stringify(r.body));assert.ok(Array.isArray(r.body.filas))
  }
  const roles={}
  for(const permiso of ['caja','cocina','encargado']) {
    roles[permiso]=(await t.crearEmpleado({nombre:'Equipo '+permiso,usuario:'panel.'+permiso,permiso})).auth
  }
  assert.equal((await call('/api/operacion/listas/pedidos',undefined,roles.cocina)).status,200)
  for(const tipo of ['entregas','agenda','atencion','equipo','auditoria'])assert.equal((await call('/api/operacion/listas/'+tipo,undefined,roles.cocina)).status,403)
  for(const tipo of ['equipo','auditoria'])assert.equal((await call('/api/operacion/listas/'+tipo,undefined,roles.caja)).status,403)
  for(const tipo of ['pedidos','entregas','agenda','atencion','equipo','auditoria'])assert.equal((await call('/api/operacion/listas/'+tipo)).status,403)
  assert.equal((await call('/api/operacion/resumen',undefined,roles.caja)).status,403)
  const resumen=await call('/api/operacion/resumen',undefined,staff)
  assert.equal(resumen.status,200,JSON.stringify(resumen.body));assert.equal(resumen.body.pedidos,104);assert.equal(resumen.body.entregas,105)
  for(const dias of [1,7,30,90])assert.equal((await call('/api/operacion/metricas?dias='+dias,undefined,staff)).status,200)
  assert.equal((await call('/api/operacion/metricas?dias=500',undefined,staff)).status,422)
  const cliente=await call('/api/operacion/cliente',{telefono:t.tel},staff);assert.equal(cliente.status,200);assert.ok(cliente.body.movimientos.length>0)
  await db.query("UPDATE membresia SET hasta=now()+interval '30 days',estado='activa' WHERE socio_id=$1",[t.id])
  const beneficio=(await call('/api/beneficios/solicitar',{clase:'bebida_dia'})).body
  assert.ok(beneficio.codigo,JSON.stringify(beneficio))
  assert.equal((await call('/api/operacion/beneficios/consultar',{codigo:beneficio.codigo},staff)).body.vigente,true)
  await db.query("UPDATE beneficio_solicitud SET vence=now()-interval '1 second' WHERE codigo=$1",[beneficio.codigo])
  assert.equal((await call('/api/operacion/beneficios/consultar',{codigo:beneficio.codigo},staff)).body.vigente,false)
  assert.equal((await call('/api/operacion/beneficios/entregar',{codigo:beneficio.codigo},staff)).status,409)
  const auditoria=await call('/api/operacion/listas/auditoria',undefined,staff);assert.ok(auditoria.body.total>=3)
  console.log('PASA panel: más de 100 registros, paginación sin pérdida, filtros, historial, roles, resumen, métricas, movimientos y beneficio vencido.')
}finally{await t.db.close()}
