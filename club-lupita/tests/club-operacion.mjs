import assert from 'node:assert/strict'
import {writeFileSync} from 'node:fs'
import {preparar} from './soporte.mjs'
const t=await preparar(),{db,request,id,staff}=t,resultados=[]
const caso=async(nombre,fn)=>{await fn();resultados.push({nombre,correcto:true});console.log('PASA '+nombre)}
try{
 const caja=(await t.crearEmpleado({permiso:'caja'})).auth,cocina=(await t.crearEmpleado({permiso:'cocina'})).auth
 await db.query("UPDATE membresia SET hasta=now()+interval '5 days' WHERE socio_id=$1",[id])
 const pase=(await request('/api/yo')).body.socio.codigo_club,paseOtro=(await request('/api/yo',undefined,t.otroToken)).body.socio.codigo_club
 const cuerpo={pase,ticket:'  comprobante-club-01  ',lineas:[{id:'cheesecake-cafe',cuanto:2}]}
 const ledger=JSON.stringify((await db.query('SELECT * FROM asiento ORDER BY id')).rows)
 let config=(await request('/api/operacion/club/panel',undefined,staff)).body.config,q,recibo
 await caso('caja solo calcula productos confirmados; cliente y cocina no administran descuentos',async()=>{
  assert.equal((await request('/api/operacion/club-caja/productos',undefined,caja)).body.productos.length,0)
  assert.equal((await request('/api/operacion/club-caja/cotizar',cuerpo,caja)).status,409)
  assert.equal((await request('/api/operacion/club-caja/productos')).status,403)
  assert.equal((await request('/api/operacion/club-caja/productos',undefined,cocina)).status,403)
  config=(await request('/api/operacion/club/configuracion',{...config,reposteria:['cheesecake-cafe']},staff)).body.config
  q=await request('/api/operacion/club-caja/cotizar',cuerpo,caja);assert.equal(q.status,200,JSON.stringify(q.body))
  assert.equal(q.body.subtotal,48000);assert.equal(q.body.descuento,7200);assert.equal(q.body.total,40800)
  assert.equal((await request('/api/operacion/club-caja/cotizar',{...cuerpo,lineas:[{id:'cheesecake-cafe',cuanto:-1}]},caja)).status,422)
  assert.equal((await request('/api/operacion/club-caja/cotizar',{...cuerpo,lineas:[...cuerpo.lineas,...cuerpo.lineas]},caja)).status,422)
 })
 await caso('cambio de condiciones o pérdida de vigencia exige revisión antes de registrar',async()=>{
  config=(await request('/api/operacion/club/configuracion',{...config,cafe_detalle:'Detalle sintético revisado'},staff)).body.config
  assert.equal((await request('/api/operacion/club-caja/registrar',{...cuerpo,huella:q.body.huella,confirmo:true},caja)).status,409)
  q=await request('/api/operacion/club-caja/cotizar',cuerpo,caja)
  await db.query("UPDATE membresia SET hasta=now()-interval '1 second' WHERE socio_id=$1",[id])
  assert.equal((await request('/api/operacion/club-caja/registrar',{...cuerpo,huella:q.body.huella,confirmo:true},caja)).status,409)
  await db.query("UPDATE membresia SET hasta=now()+interval '5 days' WHERE socio_id=$1",[id])
  assert.equal((await db.query('SELECT count(*)::int n FROM club_descuento_caja')).rows[0].n,0)
 })
 await caso('comprobante normalizado se registra una vez; respuesta recuperable conserva historial y saldo',async()=>{
  const cuerpoRegistro={...cuerpo,huella:q.body.huella,confirmo:true}
  recibo=await request('/api/operacion/club-caja/registrar',cuerpoRegistro,caja);assert.equal(recibo.status,200,JSON.stringify(recibo.body))
  await db.query("UPDATE membresia SET hasta=now()-interval '1 second' WHERE socio_id=$1",[id])
  assert.equal((await request('/api/operacion/club-caja/registrar',{...cuerpoRegistro,ticket:'COMPROBANTE-CLUB-01'},caja)).body.repetido,true)
  assert.equal((await request('/api/operacion/club-caja/registrar',{...cuerpoRegistro,pase:paseOtro},caja)).status,409)
  assert.equal((await request('/api/operacion/club-caja/registros?ticket=comprobante-club-01',undefined,caja)).body.registros.length,1)
  assert.equal((await request('/api/club')).body.descuentos[0].ticket,'COMPROBANTE-CLUB-01')
  assert.equal((await request('/api/club',undefined,t.otroToken)).body.descuentos.length,0)
  assert.equal((await request('/api/operacion/club/panel',undefined,staff)).body.operacion.descuentos_caja,7200)
  assert.equal(JSON.stringify((await db.query('SELECT * FROM asiento ORDER BY id')).rows),ledger)
 })
 await caso('anulación exclusiva de administración mantiene registro original y no mueve dinero',async()=>{
  const ruta='/api/operacion/club-caja/'+recibo.body.id+'/anular',cuerpo={confirmo:true,motivo:'Comprobante corregido en ensayo'}
  assert.equal((await request(ruta,cuerpo,caja)).status,403)
  assert.equal((await request(ruta,cuerpo,staff)).status,200)
  assert.equal((await request(ruta,cuerpo,staff)).body.repetido,true)
  assert.equal((await request(ruta,{...cuerpo,motivo:'Otro motivo de anulación'},staff)).status,409)
  assert.equal((await request('/api/operacion/club/panel',undefined,staff)).body.operacion.descuentos_caja,0)
  assert.ok((await request('/api/club')).body.descuentos[0].anulado)
  await assert.rejects(db.query('DELETE FROM club_descuento_caja'))
  await assert.rejects(db.query('UPDATE club_descuento_anulacion SET motivo=$1',['Cambio posterior']))
  assert.equal(JSON.stringify((await db.query('SELECT * FROM asiento ORDER BY id')).rows),ledger)
 })
 await caso('tiempos anónimos incluyen navegación interna y separan fallos; rechazan identificadores',async()=>{
  const medida={operacion:'codigo',resultado:'correcto',entrada:'interna',dispositivo:'movil',milisegundos:1000}
  assert.equal((await request('/api/club/tiempo',{...medida,telefono:'50500000001'})).status,422)
  assert.equal((await request('/api/club/tiempo',{...medida,milisegundos:-1})).status,422)
  assert.equal((await request('/api/club/tiempo',medida,staff)).status,403)
  for(const milisegundos of [1000,2000,3000,4000])assert.equal((await request('/api/club/tiempo',{...medida,milisegundos})).status,200)
  assert.equal((await request('/api/club/tiempo',{...medida,resultado:'error',milisegundos:9000})).status,200)
  const tiempos=(await request('/api/operacion/club/panel',undefined,staff)).body.tiempos
  assert.equal(tiempos.find(x=>x.resultado==='correcto').p75,3250);assert.equal(tiempos.find(x=>x.resultado==='correcto').muestras,4)
  assert.equal(tiempos.find(x=>x.resultado==='error').p75,9000)
  const columnas=(await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='club_tiempo' ORDER BY ordinal_position")).rows.map(r=>r.column_name)
  assert.deepEqual(columnas,['id','dia','operacion','resultado','entrada','dispositivo','milisegundos'])
 })
}finally{writeFileSync('entregables/mejoras-mi-club-2026-10-09/segunda-etapa/evidencia/servidor.json',JSON.stringify({resultados},null,2));await t.close()}
