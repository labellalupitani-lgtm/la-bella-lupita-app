import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import { cambiarBolsa } from './tienda'
import { transaccion } from './operacion'
import { telefonoNormalizado } from './acceso'
import type { Env,Vars } from './index'
export function registrarMostrador(app:Hono<{Bindings:Env;Variables:Vars}>) {
  app.get('/api/operacion/flotante',async c=>{
    if(c.get('sesion').rol!=='casa'||!['propietario','encargado'].includes(c.get('permiso')))return c.json({error:'Acceso exclusivo de administración.'},403)
    const sql=neon(c.env.DATABASE_URL)
    const [flotante]=await sql`SELECT COALESCE(sum(d.pagado),0)::bigint AS pagado,COALESCE(sum(d.bono),0)::bigint AS bono,COALESCE(sum(d.total),0)::bigint AS total FROM operativo_socio s CROSS JOIN LATERAL saldo_de(s.id) d`
    return c.json({flotante})
  })
  app.post('/api/operacion/vale/consultar',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')==='cocina')return c.json({error:'Acceso exclusivo de caja.'},403)
    const r=await c.req.json().catch(()=>null)
    if(typeof r?.codigo!=='string'||!/^[A-Z0-9]{8}$/.test(r.codigo))return c.json({error:'Código inválido.'},422)
    const sql=neon(c.env.DATABASE_URL)
    const [vale]=await sql`SELECT s.nombre,v.vence,v.usado,t.reglas_version FROM operativo_vale v JOIN operativo_tanda t ON t.id=v.tanda_id JOIN operativo_socio s ON s.id=v.socio_id WHERE v.codigo=${r.codigo}`
    return vale?c.json(vale):c.json({error:'Vale no encontrado.'},404)
  })
  app.post('/api/operacion/cliente',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')==='cocina')return c.json({error:'Acceso exclusivo de caja.'},403)
    const r=await c.req.json().catch(()=>null),telefono=telefonoNormalizado(r?.telefono)
    const codigo=typeof r?.telefono==='string'?r.telefono.trim().toUpperCase():''
    if(!/^\d{8,15}$/.test(telefono)&&!/^[A-F0-9]{12}$/.test(codigo))return c.json({error:'Ingresá el teléfono o el código del pase.'},422)
    const sql=neon(c.env.DATABASE_URL)
    const [cliente]=await sql`SELECT s.id,s.nombre,s.telefono,to_jsonb(d) AS saldo FROM operativo_socio s CROSS JOIN LATERAL saldo_de(s.id) d WHERE (s.telefono=${telefono} OR s.codigo_club=${codigo}) AND s.baja IS NULL`
    if(!cliente)return c.json({error:'No encontramos ese cliente.'},404)
    const movimientos=await sql`SELECT id,creado,concepto,monto,tipo FROM operativo_asiento WHERE socio_id=${cliente.id} ORDER BY creado DESC,id DESC LIMIT 10`
    return c.json({...cliente,movimientos})
  })
  app.get('/api/operacion/entregas',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')==='cocina')return c.json({error:'Acceso exclusivo de caja.'},403)
    const sql=neon(c.env.DATABASE_URL)
    const entregas=await sql`SELECT b.id,'bolsa' AS tipo,s.nombre,'Bolsa '||b.numero AS detalle,b.creada AS fecha FROM operativo_compra_bolsa b JOIN operativo_socio s ON s.id=b.socio_id WHERE b.estado IN ('pagada','lista')
      UNION ALL SELECT a.id,'experiencia',s.nombre,e.nombre||' · Butaca '||a.butaca,e.cuando FROM operativo_asiento_experiencia a JOIN operativo_socio s ON s.id=COALESCE(a.cedido_a,a.socio_id) JOIN experiencia e ON e.id=a.experiencia_id WHERE a.asistencia IS NULL AND a.reembolsada IS NULL AND e.cancelada IS NULL AND e.cuando>now()-interval '1 day' ORDER BY fecha LIMIT 100`
    const reservas=await sql`SELECT r.id,r.zona,r.cuando,r.termina,r.personas,r.deposito,s.nombre FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.cancelada IS NULL AND r.termina>now() ORDER BY r.cuando LIMIT 100`
    return c.json({entregas,reservas})
  })
  app.post('/api/operacion/entregas/:tipo/:id',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')==='cocina')return c.json({error:'Acceso exclusivo de caja.'},403)
    const tipo=c.req.param('tipo'),id=c.req.param('id')
    if(!['bolsa','experiencia'].includes(tipo)||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id))return c.json({error:'Comprobante inválido.'},422)
    const sql=neon(c.env.DATABASE_URL),quien=c.get('sesion').empleado??'propietario'
    if(tipo==='bolsa')return cambiarBolsa(c,id,'entregada')
    return transaccion(c.env,async cli=>{
      const {rows:[evento]}=await cli.query('SELECT e.id,e.cancelada FROM experiencia e JOIN operativo_asiento_experiencia a ON a.experiencia_id=e.id WHERE a.id=$1 FOR UPDATE OF e',[id])
      if(!evento||evento.cancelada)return c.json({error:'La experiencia está cancelada o la entrada no existe.'},409)
      const {rows}=await cli.query('UPDATE operativo_asiento_experiencia SET asistencia=now(),asistencia_por=$2 WHERE id=$1 AND asistencia IS NULL AND reembolsada IS NULL RETURNING socio_id,cedido_a',[id,quien])
      if(!rows.length)return c.json({error:'Ya estaba registrada o fue reembolsada.'},409)
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'asistencia_experiencia',$2,$3::jsonb)",[quien,rows[0].cedido_a??rows[0].socio_id,JSON.stringify({entrada:id})])
      return c.json({registrado:true})
    })
  })
  app.get('/api/operacion/metricas',async c=>{
    if(c.get('sesion').rol!=='casa'||(c.get('permiso')&&!['propietario','encargado'].includes(c.get('permiso'))))return c.json({error:'Acceso exclusivo del encargado.'},403)
    const dias=Number(c.req.query('dias')??30)
    if(![1,7,30,90].includes(dias))return c.json({error:'Período inválido.'},422)
    const sql=neon(c.env.DATABASE_URL)
    const [metricas]=await sql`SELECT count(*)::int AS pedidos,count(*) FILTER(WHERE estado='entregado')::int AS entregados,count(*) FILTER(WHERE estado='cancelado')::int AS cancelados,COALESCE(sum(total) FILTER(WHERE estado<>'cancelado'),0)::bigint AS ventas, count(DISTINCT socio_id)::int AS clientes FROM operativo_pedido WHERE creado>now()-${dias}::int*interval '1 day'`
    return c.json({...metricas,dias,actualizado:new Date().toISOString()})
  })
}
