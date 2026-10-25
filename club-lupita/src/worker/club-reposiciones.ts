import type {Hono} from 'hono'
import {neon,type Client} from '@neondatabase/serverless'
import type {Env,Vars} from './index'
import {transaccion} from './operacion'
import {idBigintPositivo} from './validacion'

export async function consultarReposicion(db:string,codigo:string){
  const sql=neon(db),[r]=await sql`SELECT s.nombre,r.clase,r.vence,r.entregada AS entregado,(r.entregada IS NULL AND r.vence>now()) AS vigente,true AS reposicion FROM club_reposicion r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.codigo=${codigo} AND s.baja IS NULL`
  return r
}
/** El llamador ya bloqueó la cuenta del cliente antes de llegar aquí. */
export async function entregarReposicion(cli:Client,codigo:string,quien:string){
  const {rows:[r]}=await cli.query('SELECT * FROM club_reposicion WHERE codigo=$1 FOR UPDATE',[codigo])
  if(!r)return null
  if(r.entregada||!r.vence||new Date(r.vence).getTime()<=Date.now())return {error:'La reposición ya se entregó o el código venció.'}
  await cli.query('UPDATE club_reposicion SET entregada=now(),entregada_por=$2 WHERE id=$1',[r.id,quien])
  await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'club_reposicion_entregada',$2,$3::jsonb)",[quien,r.socio_id,JSON.stringify({reposicion:r.id,uso:r.uso_id,clase:r.clase})])
  return {entregado:true,clase:r.clase,reposicion:true}
}
export function registrarReposicionesClub(app:Hono<{Bindings:Env;Variables:Vars}>){
  app.get('/api/operacion/club/beneficios',async c=>{
    const buscar=(c.req.query('buscar')??'').trim().slice(0,80),sql=neon(c.env.DATABASE_URL)
    const usos=await sql`SELECT b.id::text,b.clase,b.usado_en AS usado,s.nombre,s.codigo_club,r.id AS reposicion,r.entregada AS reposicion_entregada
      FROM operativo_beneficio_uso b JOIN operativo_membresia m ON m.id=b.membresia_id JOIN operativo_socio s ON s.id=m.socio_id LEFT JOIN club_reposicion r ON r.uso_id=b.id
      WHERE (${buscar}='' OR s.nombre ILIKE ${'%'+buscar+'%'} OR s.codigo_club=${buscar.toUpperCase()}) ORDER BY b.usado_en DESC,b.id DESC LIMIT 50`
    return c.json({usos})
  })
  app.post('/api/operacion/club/reposiciones',async c=>{
    const r=await c.req.json().catch(()=>null)
    if(!r||!idBigintPositivo(String(r.uso??''))||typeof r.motivo!=='string'||r.motivo.trim().length<5||r.motivo.length>500||r.confirmo!==true)return c.json({error:'Elegí una entrega, explicá el error y confirmá la reposición.'},422)
    return transaccion(c.env,async cli=>{
      const {rows:[uso]}=await cli.query('SELECT b.id,b.clase,m.socio_id FROM operativo_beneficio_uso b JOIN operativo_membresia m ON m.id=b.membresia_id WHERE b.id=$1',[r.uso])
      if(!uso)return c.json({error:'Entrega no encontrada.'},404)
      const {rows:[s]}=await cli.query('SELECT id FROM operativo_socio WHERE id=$1 AND baja IS NULL FOR UPDATE',[uso.socio_id])
      if(!s)return c.json({error:'La cuenta no está activa.'},409)
      const {rows:[anterior]}=await cli.query('SELECT id,motivo FROM club_reposicion WHERE uso_id=$1',[uso.id])
      if(anterior)return anterior.motivo===r.motivo.trim()?c.json({registrada:true,id:anterior.id,repetida:true}):c.json({error:'Esta entrega ya tiene una reposición. Revisá su historial.'},409)
      const quien=c.get('sesion').empleado??'propietario'
      const {rows:[nueva]}=await cli.query('INSERT INTO club_reposicion(uso_id,socio_id,clase,motivo,creada_por) VALUES($1,$2,$3,$4,$5) RETURNING id',[uso.id,s.id,uso.clase,r.motivo.trim(),quien])
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'club_reposicion_autorizada',$2,$3::jsonb)",[quien,s.id,JSON.stringify({reposicion:nueva.id,uso:uso.id,motivo:r.motivo.trim()})])
      await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3)',[s.id,'reposicion:'+nueva.id,'La casa autorizó la reposición de tu '+(uso.clase==='bebida_dia'?'café':'bolsa')+'. Encontrala en Mi Club.'])
      return c.json({registrada:true,id:nueva.id})
    })
  })
  app.post('/api/club/reposiciones/:id/codigo',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const id=c.req.param('id');if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id))return c.json({error:'Reposición inválida.'},422)
    return transaccion(c.env,async cli=>{
      const {rows:[s]}=await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE',[c.get('sesion').tel])
      if(!s)return c.json({error:'La cuenta no está activa.'},403)
      const {rows:[r]}=await cli.query('SELECT * FROM club_reposicion WHERE id=$1 AND socio_id=$2 FOR UPDATE',[id,s.id])
      if(!r)return c.json({error:'Reposición no encontrada.'},404)
      if(r.entregada)return c.json({error:'Esta reposición ya fue entregada.'},409)
      if(!r.codigo||new Date(r.vence).getTime()<=Date.now()){
        const codigo=crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase()
        await cli.query("UPDATE club_reposicion SET codigo=$2,vence=now()+interval '10 minutes' WHERE id=$1",[id,codigo])
      }
      const {rows:[vale]}=await cli.query('SELECT codigo,vence FROM club_reposicion WHERE id=$1',[id])
      return c.json({...vale,ahora:new Date().toISOString()})
    })
  })
}
