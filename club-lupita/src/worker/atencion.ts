import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import { transaccion } from './operacion'
import type { Env,Vars } from './index'
export function registrarAtencion(app:Hono<{Bindings:Env;Variables:Vars}>) {
  app.get('/api/atencion',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const sql=neon(c.env.DATABASE_URL)
    return c.json({solicitudes:await sql`SELECT a.id,a.categoria,a.mensaje,a.estado,a.respuesta,a.creada FROM operativo_solicitud_atencion a JOIN operativo_socio s ON s.id=a.socio_id WHERE s.telefono=${c.get('sesion').tel} ORDER BY a.creada DESC LIMIT 30`})
  })
  app.post('/api/atencion',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const r=await c.req.json().catch(()=>null)
    const categoria=r?.categoria??'compra'
    if(!['compra','cuenta','acceso','datos','baja'].includes(categoria))return c.json({error:'Elegí un motivo válido.'},422)
    if(!r||typeof r.mensaje!=='string'||r.mensaje.trim().length<5||r.mensaje.length>1000||typeof r.referencia!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(r.referencia))return c.json({error:'Escribí un mensaje de 5 a 1,000 caracteres.'},422)
    const sql=neon(c.env.DATABASE_URL)
    const [limite]=await sql`SELECT limitar_acceso(${'atencion:'+c.get('sesion').tel},20,3600) AS ok`
    if(!limite.ok)return c.json({error:'Recibimos varias solicitudes. Esperá antes de enviar otra.'},429)
    const [solicitud]=await sql`INSERT INTO solicitud_atencion(socio_id,referencia,mensaje,categoria) SELECT id,${r.referencia}::uuid,${r.mensaje.trim()},${categoria} FROM operativo_socio WHERE telefono=${c.get('sesion').tel} AND baja IS NULL ON CONFLICT(socio_id,referencia) DO UPDATE SET referencia=EXCLUDED.referencia RETURNING id,mensaje,categoria`
    if(!solicitud)return c.json({error:'Cuenta no encontrada.'},404)
    if(solicitud.mensaje!==r.mensaje.trim()||solicitud.categoria!==categoria)return c.json({error:'Esa referencia ya corresponde a otra solicitud.'},409)
    return c.json({id:solicitud.id})
  })
  app.get('/api/operacion/atencion',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')==='cocina')return c.json({error:'Acceso exclusivo de caja.'},403)
    const sql=neon(c.env.DATABASE_URL)
    const privada=['propietario','encargado'].includes(c.get('permiso')??'')
    return c.json({solicitudes:await sql`SELECT a.id,a.categoria,a.mensaje,a.creada,s.nombre FROM operativo_solicitud_atencion a JOIN operativo_socio s ON s.id=a.socio_id WHERE a.estado='pendiente' AND (${privada} OR a.categoria='compra') ORDER BY a.creada LIMIT 100`})
  })
  app.post('/api/operacion/atencion/:id/responder',async c=>{
    if(c.get('sesion').rol!=='casa'||c.get('permiso')==='cocina')return c.json({error:'Acceso exclusivo de caja.'},403)
    const r=await c.req.json().catch(()=>null),id=c.req.param('id')
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)||!r||typeof r.respuesta!=='string'||r.respuesta.trim().length<5||r.respuesta.length>1000)return c.json({error:'Escribí la resolución de la solicitud.'},422)
    const sql=neon(c.env.DATABASE_URL),quien=c.get('sesion').empleado??'propietario'
    const privada=['propietario','encargado'].includes(c.get('permiso')??'')
    const [cambio]=await sql`WITH cambio AS (UPDATE operativo_solicitud_atencion SET estado='resuelta',respuesta=${r.respuesta.trim()},resuelta=now(),resuelta_por=${quien} WHERE id=${id}::uuid AND estado='pendiente' AND (${privada} OR categoria='compra') RETURNING socio_id), aviso AS (INSERT INTO aviso_cliente(socio_id,referencia,texto) SELECT socio_id,${'atencion:'+id},'La casa respondió tu solicitud. Revisá la respuesta en Ayuda.' FROM cambio), log AS (INSERT INTO auditoria(quien,accion,socio_id,detalle) SELECT ${quien},'resolver_atencion',socio_id,jsonb_build_object('solicitud',${id}::text) FROM cambio) SELECT socio_id FROM cambio`
    return cambio?c.json({resuelta:true}):c.json({error:'La solicitud ya fue resuelta o no existe.'},409)
  })
}
