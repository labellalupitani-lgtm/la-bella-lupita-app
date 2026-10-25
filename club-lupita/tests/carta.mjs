import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {join} from 'node:path'
import {preparar,root} from './soporte-perfiles-equipo.mjs'
const t=await preparar(),resultados=[],{db,request,id,staff}=t
const original=t.worker.cartaPrueba.map(p=>({...p}))
const log=console.info;console.info=()=>{}
async function caso(nombre,fn){await fn();resultados.push({nombre,correcto:true});log('PASA '+nombre);await db.exec("UPDATE pedido SET creado=now()-interval '2 minutes'")}
async function config(cambios){const r=await request('/api/operacion/carta',undefined,staff);assert.equal(r.status,200);const s=await request('/api/operacion/carta',{revision:r.body.revision,valor:{...r.body.valor,...cambios}},staff);assert.equal(s.status,200,JSON.stringify(s.body))}
async function cotizar(lineas=[{id:'latte',cuanto:1}],mas={}){const ref=crypto.randomUUID(),r=await request('/api/carta/cotizar',{ref,lineas,...mas});assert.equal(r.status,200,JSON.stringify(r.body));return{lineas,ref,cotizacionId:r.body.id,...mas,q:r.body}}
async function pagar(p){const {q,...r}=p;return request('/api/cuenta/cobrar',r)}
try{
 await caso('horario confirmado respeta Managua, domingo y límites exactos',async()=>{
  const {estadoHorario,CONFIGURACION_CARTA:c,intencionPedido}=t.worker
  for(const [fecha,abierto] of [['2026-10-09T12:59:59Z',false],['2026-10-09T13:00:00Z',true],['2026-10-10T02:59:59Z',true],['2026-10-10T03:00:00Z',false],['2026-10-11T13:59:59Z',false],['2026-10-11T14:00:00Z',true]])assert.equal(estadoHorario(c,new Date(fecha)).abierto,abierto,fecha)
  assert.equal(intencionPedido([{id:'latte',cuanto:1,opciones:{a:'A',b:'B'}}]),intencionPedido([{id:'latte',cuanto:1,opciones:{b:'B',a:'A'}}]))
 })
 await caso('la migración es aditiva e idempotente',async()=>{await db.exec(readFileSync(join(root,'db/022_carta.sql'),'utf8'));assert.equal((await request('/api/operacion/carta',undefined,staff)).body.valor.empaque,4000)})
 await caso('la carta es pública; la configuración y cotización exigen permisos',async()=>{
  assert.equal((await request('/api/carta',undefined,null)).body.platos.length,73)
  assert.equal((await request('/api/operacion/carta')).status,403)
  assert.equal((await request('/api/carta/cotizar',{ref:crypto.randomUUID(),lineas:[{id:'latte',cuanto:1}]},null)).status,401)
  await config({horario:Array.from({length:7},()=>({abre:'00:00',cierra:'23:59'}))})
 })
 await caso('no cobra sin cotización; cobra exactamente producto y empaque aceptados',async()=>{
  const viejo=await request('/api/cuenta/cobrar',{ref:crypto.randomUUID(),lineas:[{id:'latte',cuanto:1}]});assert.equal(viejo.status,409)
  const p=await cotizar();assert.equal(p.q.subtotal,9500);assert.equal(p.q.empaque,4000);assert.equal(p.q.total,13500)
  const a=await pagar(p);assert.equal(a.status,200);assert.equal(a.body.cobrado,p.q.total);assert.equal(a.body.pedido.estado,'recibido')
  const b=await pagar(p);assert.equal(b.body.repetido,true);assert.equal(b.body.pedido.id,a.body.pedido.id)
 })
 await caso('cambiar precio entre cotización y cobro no debita hasta reconfirmar',async()=>{
  const p=await cotizar(),latte=t.worker.cartaPrueba.find(p=>p.id==='latte');latte.precio=10500
  assert.equal((await pagar(p)).status,409)
  assert.equal((await db.query('SELECT count(*)::int n FROM pedido WHERE referencia=$1',[p.ref])).rows[0].n,0)
  const q=await request('/api/carta/cotizar',{ref:p.ref,lineas:p.lineas});assert.equal(q.body.total,14500)
  const r=await pagar({...p,cotizacionId:q.body.id});assert.equal(r.body.cobrado,14500);latte.precio=9500
 })
 await caso('un recibo sobrevive a cambio de precio, nombre y retiro del producto',async()=>{
  const p=await cotizar(),r=await pagar(p),i=t.worker.cartaPrueba.findIndex(p=>p.id==='latte'),latte=t.worker.cartaPrueba[i]
  latte.precio=11000;latte.nombre='Latte nuevo';assert.equal((await pagar(p)).body.pedido.id,r.body.pedido.id)
  t.worker.cartaPrueba.splice(i,1);assert.equal((await pagar(p)).body.pedido.id,r.body.pedido.id)
  const q=await request('/api/carta/intento/'+p.ref);assert.equal(q.body.estado,'confirmado');assert.equal(q.body.recibo.cobrado,13500)
  assert.equal((await request('/api/carta/intento/'+p.ref,undefined,t.otroToken)).body.estado,'ausente')
  t.worker.cartaPrueba.splice(i,0,{...original.find(p=>p.id==='latte')})
  assert.equal((await pagar({...p,lineas:[{id:'latte',cuanto:2}]})).status,409)
 })
 await caso('referencias históricas recuperan su recibo sin revalorar',async()=>{
  const ref=crypto.randomUUID(),respuesta={cobrado:9500,saldo:{pagado:1,bono:0,total:1},pedido:{id:crypto.randomUUID(),numero:51,estado:'recibido'}}
  await db.query("INSERT INTO solicitud_compra(socio_id,referencia,operacion,huella,respuesta) VALUES($1,$2,'pedido',$3,$4)",[id,'pedido:'+ref,JSON.stringify({cent:9500,concepto:'Latte antiguo',lineas:[{id:'latte',cuanto:1}]}),JSON.stringify(respuesta)])
  assert.deepEqual((await request('/api/cuenta/cobrar',{ref,lineas:[{id:'latte',cuanto:1}]})).body,{...respuesta,repetido:true})
 })
 await caso('cotización vencida o alterada no produce pedido',async()=>{
  const p=await cotizar();assert.equal((await pagar({...p,cotizacionId:crypto.randomUUID()})).status,409)
  await db.query("UPDATE carta_intento SET vence=now()-interval '1 second' WHERE referencia=$1",[p.ref]);assert.equal((await pagar(p)).status,409)
 })
 await caso('cierre atómico impide cobrar una petición tardía y preserva recibos existentes',async()=>{
  const p=await cotizar();assert.equal((await request('/api/carta/intento/'+p.ref+'/cerrar',{})).body.estado,'cerrado');assert.equal((await pagar(p)).status,409)
  const b=await cotizar();await pagar(b);assert.equal((await request('/api/carta/intento/'+b.ref+'/cerrar',{})).body.estado,'confirmado')
  const ausente=crypto.randomUUID();assert.equal((await request('/api/carta/intento/'+ausente+'/cerrar',{})).body.estado,'cerrado')
  assert.equal((await request('/api/carta/cotizar',{ref:ausente,lineas:[{id:'latte',cuanto:1}]})).status,409)
 })
 await caso('límites acumulados rechazan fraccionamiento y aceptan el borde exacto',async()=>{
  for(const lineas of [[{id:'latte',cuanto:21}],Array.from({length:40},()=>({id:'latte',cuanto:20})),[{id:'latte',cuanto:20},{id:'latte',cuanto:1}],[{id:'latte',cuanto:20},{id:'espresso',cuanto:20},{id:'americano',cuanto:1}]])assert.equal((await request('/api/carta/cotizar',{ref:crypto.randomUUID(),lineas})).status,422)
  const p=await cotizar([{id:'latte',cuanto:10},{id:'latte',cuanto:10},{id:'espresso',cuanto:20}]);assert.equal(p.q.lineas.length,2);assert.equal(p.q.lineas.reduce((n,l)=>n+l.cuanto,0),40)
 })
 await caso('opciones obligatorias y restricciones llegan a la comanda',async()=>{
  assert.equal((await request('/api/carta/cotizar',{ref:crypto.randomUUID(),lineas:[{id:'ensalada-lupita',cuanto:1}]})).status,422)
  const p=await cotizar([{id:'ensalada-lupita',cuanto:1,opciones:{proteina:'pollo'}},{id:'ensalada-lupita',cuanto:1,opciones:{proteina:'res'}}],{restriccion:{texto:'Restricción confirmada con barra',confirmada:true}})
  assert.equal(p.q.lineas.length,2);const r=await pagar(p);assert.equal(r.status,200)
  const pedido=(await db.query('SELECT * FROM pedido WHERE id=$1',[r.body.pedido.id])).rows[0];assert.equal(pedido.lineas[0].opciones[0].valor,'Pollo');assert.ok(pedido.restriccion_confirmada)
  assert.equal((await request('/api/carta/cotizar',{ref:crypto.randomUUID(),lineas:[{id:'latte',cuanto:1}],restriccion:{texto:'Algo',confirmada:false}})).status,422)
 })
 await caso('agotado, pausa, horario y capacidad se revalidan antes del débito',async()=>{
  for(const cambio of [{agotados:['latte']},{pausaHasta:new Date(Date.now()+60000).toISOString(),motivoPausa:'Pausa de prueba'},{horario:Array(7).fill(null)},{capacidad:1}]){
   const p=await cotizar();await config(cambio);assert.equal((await pagar(p)).status,409)
   await config({agotados:[],pausaHasta:null,motivoPausa:'',horario:Array.from({length:7},()=>({abre:'00:00',cierra:'23:59'})),capacidad:null})
  }
 })
 await caso('el cargo de empaque cambiado requiere nueva aceptación',async()=>{const p=await cotizar();await config({empaque:5000});assert.equal((await pagar(p)).status,409);await config({empaque:4000})})
 await caso('control de versiones evita pisar cambios de otro operador',async()=>{const r=await request('/api/operacion/carta',undefined,staff);await config({minutos:25});assert.equal((await request('/api/operacion/carta',{revision:r.body.revision,valor:r.body.valor},staff)).status,409)})
 await caso('cocina recibe opciones y restricción, pero no importes ni el perfil completo',async()=>{
  const cocina=await t.crearEmpleado({permiso:'cocina'}),r=await request('/api/operacion/pedidos',undefined,cocina.auth)
  assert.equal(r.status,200);const ensalada=r.body.pedidos.find(p=>p.lineas.some(l=>l.id==='ensalada-lupita'))
  assert.ok(ensalada);assert.equal(ensalada.lineas[0].opciones[0].valor,'Pollo');assert.ok(ensalada.restriccion_confirmada)
  assert.equal(ensalada.total,undefined);assert.equal(ensalada.lineas[0].precio,undefined);assert.equal(ensalada.telefono,undefined)
  const conf=await request('/api/operacion/carta',undefined,cocina.auth)
  assert.equal((await request('/api/operacion/carta',{revision:conf.body.revision,valor:{...conf.body.valor,empaque:9000}},cocina.auth)).status,403)
 })
 await caso('cancelación excepcional requiere administración, devuelve una sola vez y deja motivo',async()=>{
  const p=await cotizar(),antes=(await request('/api/yo')).body,compra=await pagar(p),pedido=compra.body.pedido.id,caja=await t.crearEmpleado({permiso:'caja'})
  for(const estado of ['aceptado','preparando'])assert.equal((await request('/api/operacion/pedidos/'+pedido+'/estado',{estado},staff)).status,200)
  const datos={estado:'cancelado',motivo:'Incidencia de preparación probada',excepcional:true}
  assert.equal((await request('/api/operacion/pedidos/'+pedido+'/estado',datos,caja.auth)).status,403)
  assert.equal((await request('/api/operacion/pedidos/'+pedido+'/estado',datos,staff)).status,200)
  assert.equal((await request('/api/operacion/pedidos/'+pedido+'/estado',datos,staff)).body.repetido,true)
  const despues=(await request('/api/yo')).body;assert.deepEqual(despues.saldo,antes.saldo);assert.equal(despues.puntaje.puntos,antes.puntaje.puntos)
  assert.equal((await db.query('SELECT count(*)::int n FROM pedido_evento WHERE pedido_id=$1 AND motivo=$2',[pedido,datos.motivo])).rows[0].n,1)
 })
 await caso('fichas verificadas conservan revisión y permisos sin publicar responsable personal',async()=>{
  const cocina=await t.crearEmpleado({permiso:'cocina'}),ruta='/api/operacion/carta/fichas/pizza-cuatro-estaciones'
  const datos={porcion:'Porción de prueba',componentes:'Ingredientes sintéticos de prueba',fuente:'Prueba aislada con cocina',foto_verificada:false,revision:0,confirmada:true}
  assert.equal((await request(ruta,datos)).status,403)
  assert.equal((await request(ruta,{...datos,confirmada:false},cocina.auth)).status,422)
  const r=await request(ruta,datos,cocina.auth);assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.ficha.revision,1)
  assert.equal((await request(ruta,datos,cocina.auth)).status,409)
  const p=(await request('/api/carta',undefined,null)).body.platos.find(p=>p.id==='pizza-cuatro-estaciones')
  assert.equal(p.informacion.porcion,datos.porcion);assert.equal(p.informacion.responsable,undefined);assert.equal(p.informacion.fuente,undefined)
  assert.equal((await request('/api/operacion/carta/fichas',undefined,cocina.auth)).status,200)
 })
 await caso('medición agregada valida campos y percentil sin guardar contenido sensible',async()=>{
  for(const valor of [1100,1500,2200,4500])assert.equal((await request('/api/carta/rendimiento',{metrica:'LCP',valor,dispositivo:'movil'})).status,200)
  for(const r of [{evento:'busqueda',dispositivo:'movil',texto:'dato privado'},{evento:'desconocido',dispositivo:'movil'}])assert.equal((await request('/api/carta/evento',r)).status,422)
  assert.equal((await request('/api/carta/evento',{evento:'busqueda',dispositivo:'movil'})).status,200)
  assert.equal((await request('/api/carta/rendimiento',{metrica:'LCP',valor:-1,dispositivo:'movil'})).status,422)
  assert.equal((await request('/api/operacion/metricas-carta')).status,403)
  const r=await request('/api/operacion/metricas-carta',undefined,staff);assert.equal(r.status,200);assert.equal(r.body.rendimiento[0].p75_hasta,2200);assert.equal(r.body.rendimiento[0].muestras,4)
 })
 await caso('recuperación pertenece a la cuenta y lápidas cerradas no fingen cotizaciones',async()=>{
  const ref=crypto.randomUUID();await request('/api/carta/intento/'+ref+'/cerrar',{})
  const cerrado=await request('/api/carta/intento/'+ref);assert.equal(cerrado.body.estado,'cerrado');assert.equal(cerrado.body.cotizacion,null)
  assert.ok((await request('/api/carta/recuperacion')).body.intentos.length>0)
  assert.equal((await request('/api/carta/recuperacion',undefined,t.otroToken)).body.intentos.length,0)
 })
 await caso('referencia de soporte enlaza cliente, pedido y registro sin exponer su perfil',async()=>{
  const p=await cotizar(),r=await pagar(p);assert.equal(r.status,200)
  const ruta='/api/operacion/carta/referencia/'+p.ref
  assert.equal((await request(ruta)).status,403)
  const soporte=await request(ruta,undefined,staff);assert.equal(soporte.status,200);assert.equal(soporte.body.intentos[0].numero,r.body.pedido.numero);assert.match(soporte.body.correlacion,/^[a-f0-9]{64}$/);assert.equal(soporte.body.intentos[0].telefono,undefined)
 })
 await caso('el límite de nuevos pedidos conserva la consulta y repetición del recibo',async()=>{
  await db.exec("UPDATE pedido SET creado=now()-interval '2 minutes'")
  const p=await cotizar();const primero=await pagar(p);assert.equal(primero.status,200)
  for(let i=0;i<2;i++)assert.equal((await pagar(await cotizar())).status,200)
  assert.equal((await pagar(await cotizar())).status,429)
  const repetido=await pagar(p);assert.equal(repetido.status,200);assert.equal(repetido.body.pedido.id,primero.body.pedido.id)
 })
}finally{
 console.info=log;const dir=join(root,'entregables/mejoras-carta-2026-10-09/evidencia');mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'servidor-carta.json'),JSON.stringify(resultados,null,2));await t.close()
}
console.log(`${resultados.length} escenarios específicos correctos`)
