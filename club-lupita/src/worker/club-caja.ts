import type {Hono} from 'hono'
import {neon} from '@neondatabase/serverless'
import type {Env,Vars} from './index'
import {transaccion} from './operacion'
import {CARTA} from '../data/menu'
import {CONTRATO_CLUB} from '../compartido/club'
import {digest} from './equipo-sesion'

const ticketValido=(v:unknown)=>typeof v==='string'?v.normalize('NFKC').trim().toUpperCase():''
const uuid=(v:string)=>/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v)
export function registrarCajaClub(app:Hono<{Bindings:Env;Variables:Vars}>){
 app.use('/api/operacion/club-caja/*',async(c,next)=>{
  if(c.get('sesion').rol!=='casa'||!['caja','encargado','propietario'].includes(c.get('permiso')))return c.json({error:'Acceso exclusivo de caja.'},403)
  return next()
 })
 app.get('/api/operacion/club-caja/productos',async c=>{
  const sql=neon(c.env.DATABASE_URL),[config]=await sql`SELECT reposteria FROM club_config WHERE id=true`
  return c.json({porcentaje:CONTRATO_CLUB.descuentoReposteria,productos:CARTA.filter(p=>config.reposteria.includes(p.id)).map(p=>({id:p.id,nombre:p.nombre,precio:p.precio}))})
 })
 app.get('/api/operacion/club-caja/registros',async c=>{
  const ticket=ticketValido(c.req.query('ticket')??'');if(ticket.length>64)return c.json({error:'Referencia demasiado larga.'},422)
  const sql=neon(c.env.DATABASE_URL)
  const registros=await sql`SELECT d.id,d.ticket,d.subtotal,d.descuento,d.total,d.lineas,d.creado,s.nombre,a.creado AS anulado,a.motivo
   FROM club_descuento_caja d JOIN operativo_socio s ON s.id=d.socio_id LEFT JOIN club_descuento_anulacion a ON a.descuento_id=d.id
   WHERE (${ticket}='' OR d.ticket=${ticket}) ORDER BY d.creado DESC,d.id DESC LIMIT 30`
  return c.json({registros})
 })
 for(const accion of ['cotizar','registrar'] as const)app.post('/api/operacion/club-caja/'+accion,async c=>{
  const r=await c.req.json().catch(()=>null),ticket=ticketValido(r?.ticket),pase=typeof r?.pase==='string'?r.pase.trim().toUpperCase():''
  if(!/^[A-F0-9]{12}$/.test(pase)||ticket.length<8||ticket.length>64||/[\u0000-\u001f]/.test(ticket)||!Array.isArray(r?.lineas)||r.lineas.length<1||r.lineas.length>50||r.lineas.some((l:any)=>!l||typeof l.id!=='string'||!Number.isInteger(l.cuanto)||l.cuanto<1||l.cuanto>20)||new Set(r.lineas.map((l:any)=>l.id)).size!==r.lineas.length)return c.json({error:'Revisá pase, referencia del comprobante y cantidades de productos.'},422)
  if(accion==='registrar'&&(r.confirmo!==true||typeof r.huella!=='string'||!/^[a-f0-9]{64}$/.test(r.huella)))return c.json({error:'Revisá el cálculo y confirmá el descuento aplicado en el comprobante.'},422)
  const intencion=r.lineas.map((l:{id:string;cuanto:number})=>({id:l.id,cuanto:l.cuanto})).sort((a:{id:string},b:{id:string})=>a.id.localeCompare(b.id))
  return transaccion(c.env,async cli=>{
   // La referencia externa serializa dos cajas, incluso si eligieron clientes diferentes.
   await cli.query('SELECT pg_advisory_xact_lock(hashtext($1))',['club-descuento:'+ticket])
   const {rows:[s]}=await cli.query('SELECT id,nombre FROM operativo_socio WHERE codigo_club=$1 AND baja IS NULL FOR UPDATE',[pase])
   if(!s)return c.json({error:'Pase no encontrado o cuenta inactiva.'},404)
   const {rows:[anterior]}=await cli.query('SELECT d.*,a.creado AS anulado FROM club_descuento_caja d LEFT JOIN club_descuento_anulacion a ON a.descuento_id=d.id WHERE d.ticket=$1',[ticket])
   if(anterior){
    if(anterior.socio_id!==s.id||anterior.huella!==r.huella||JSON.stringify(anterior.lineas.map((l:any)=>({id:l.id,cuanto:l.cuanto})))!==JSON.stringify(intencion))return c.json({error:'Ese comprobante ya tiene un registro. Consultalo antes de continuar.'},409)
    return c.json({registrado:true,repetido:true,id:anterior.id,ticket,subtotal:anterior.subtotal,descuento:anterior.descuento,total:anterior.total,anulado:anterior.anulado})
   }
   const {rows:[m]}=await cli.query("SELECT id,hasta FROM operativo_membresia WHERE socio_id=$1 AND estado IN ('activa','en_gracia') AND hasta>now() FOR SHARE",[s.id])
   if(!m)return c.json({error:'La membresía no está vigente. El cliente puede revisar su renovación en Mi Club.'},409)
   const {rows:[config]}=await cli.query('SELECT version,reposteria FROM club_config WHERE id=true FOR SHARE')
   const lineas=[]
   for(const l of intencion){
    const p=CARTA.find(p=>p.id===l.id)
    if(!p||!config.reposteria.includes(p.id))return c.json({error:'Un producto no está confirmado como repostería. Actualizá la selección.'},409)
    lineas.push({id:p.id,nombre:p.nombre,cuanto:l.cuanto,precioAntes:p.precio,precio:Math.round(p.precio*(100-CONTRATO_CLUB.descuentoReposteria)/100),descuentoClub:CONTRATO_CLUB.descuentoReposteria})
   }
   const subtotal=lineas.reduce((n,l)=>n+l.precioAntes*l.cuanto,0),total=lineas.reduce((n,l)=>n+l.precio*l.cuanto,0),descuento=subtotal-total
   if(!Number.isSafeInteger(subtotal)||subtotal>10000000)return c.json({error:'Revisá el importe de esta compra.'},422)
   const huella=await digest(JSON.stringify({socio:s.id,membresia:m.id,ticket,version:config.version,lineas}))
   if(accion==='cotizar')return c.json({nombre:s.nombre,ticket,hasta:m.hasta,lineas,subtotal,descuento,total,huella})
   if(huella!==r.huella)return c.json({error:'El cálculo o la membresía cambió. Revisá una nueva cotización antes de aplicar el descuento.'},409)
   const quien=c.get('sesion').empleado??'propietario'
   const {rows:[d]}=await cli.query('INSERT INTO club_descuento_caja(socio_id,membresia_id,ticket,config_version,huella,lineas,subtotal,descuento,total,creado_por) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10) RETURNING id',[s.id,m.id,ticket,config.version,huella,JSON.stringify(lineas),subtotal,descuento,total,quien])
   await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'club_descuento_caja',$2,$3::jsonb)",[quien,s.id,JSON.stringify({registro:d.id,ticket,descuento,total})])
   await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3)',[s.id,'descuento-caja:'+d.id,'La casa registró tu descuento de repostería en el comprobante '+ticket+'. Podés revisarlo en Mi Club.'])
   return c.json({registrado:true,id:d.id,ticket,subtotal,descuento,total})
  })
 })
 app.post('/api/operacion/club-caja/:id/anular',async c=>{
  if(!['propietario','encargado'].includes(c.get('permiso')))return c.json({error:'La anulación la revisa administración.'},403)
  const r=await c.req.json().catch(()=>null),id=c.req.param('id')
  if(!uuid(id)||typeof r?.motivo!=='string'||r.motivo.trim().length<5||r.motivo.length>500||r.confirmo!==true)return c.json({error:'Indicá el motivo y confirmá la anulación del registro.'},422)
  return transaccion(c.env,async cli=>{
   const {rows:[d]}=await cli.query('SELECT d.* FROM club_descuento_caja d JOIN operativo_socio s ON s.id=d.socio_id WHERE d.id=$1 FOR UPDATE OF d',[id])
   if(!d)return c.json({error:'Registro no encontrado.'},404)
   const {rows:[anterior]}=await cli.query('SELECT motivo FROM club_descuento_anulacion WHERE descuento_id=$1',[id])
   if(anterior)return anterior.motivo===r.motivo.trim()?c.json({anulado:true,repetido:true}):c.json({error:'Ya fue anulado con otro motivo. Consultá el registro.'},409)
   const quien=c.get('sesion').empleado??'propietario'
   await cli.query('INSERT INTO club_descuento_anulacion(descuento_id,motivo,creado_por) VALUES($1,$2,$3)',[id,r.motivo.trim(),quien])
   await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'club_descuento_anulado',$2,$3::jsonb)",[quien,d.socio_id,JSON.stringify({registro:id,motivo:r.motivo.trim()})])
   await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3)',[d.socio_id,'descuento-anulado:'+id,'La casa anuló el registro de descuento del comprobante '+d.ticket+'. Revisá el motivo en Mi Club.'])
   return c.json({anulado:true})
  })
 })
}
