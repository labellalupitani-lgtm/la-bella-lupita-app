import { vistaAislada } from './soporte-ui.mjs'
import { createInterface } from 'node:readline'
const t=await vistaAislada()
await t.db.query(`INSERT INTO pedido(socio_id,referencia,lineas,total,estado,creado)
 SELECT $1,'vista-panel-'||n,'[{"nombre":"Latte de la casa","cuanto":2,"precio":8500},{"nombre":"Croissant","cuanto":1,"precio":6500}]'::jsonb,23500,
 (ARRAY['recibido','aceptado','preparando','listo','entregado','cancelado'])[1+(n%6)],now()-n*interval '3 minutes' FROM generate_series(1,24) n`,[t.id])
await t.db.query(`INSERT INTO compra_bolsa(socio_id,numero,generacion,total) SELECT $1,n,10,89000 FROM generate_series(1,105) n`,[t.id])
await t.db.query(`INSERT INTO solicitud_atencion(socio_id,referencia,mensaje) VALUES($1,gen_random_uuid(),'Necesito coordinar el retiro de mi bolsa de café.')`,[t.id])
await t.db.query("UPDATE membresia SET hasta=now()+interval '30 days',estado='activa' WHERE socio_id=$1",[t.id])
for(const permiso of ['caja','cocina','encargado']){
  const creado=await t.request('/api/personal/equipo',{nombre:'Equipo de '+permiso,usuario:'vista.'+permiso,permiso},t.staff)
  console.log('Acceso local '+permiso+': '+creado.body.clave)
}
console.log('VISTA AISLADA '+t.url+'/personal')
console.log('Propietario: local-test-staff-secret. Cliente sintético: '+t.tel)
process.on('SIGINT',async()=>{await t.close();process.exit(0)})
createInterface({input:process.stdin}).on('line',async comando=>{
  if(comando==='caducar') {t.env.SESION_SECRETO='local-test-session-expired';console.log('Sesiones locales invalidadas.')}
  if(comando==='nuevo') {
    await t.db.query(`INSERT INTO pedido(socio_id,referencia,lineas,total,estado) VALUES($1,gen_random_uuid(),'[{"nombre":"Pedido de actualización automática","cuanto":1,"precio":8500}]'::jsonb,8500,'recibido')`,[t.id])
    console.log('Nuevo pedido sintético disponible.')
  }
})
