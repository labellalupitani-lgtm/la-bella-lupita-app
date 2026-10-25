import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import { codigoDeSeis, firmar, huella, igualEnTiempoConstante } from './sesion'
import { transaccion } from './operacion'
import type { Env, Vars } from './index'
const DEMO='50587442005'
export function telefonoNormalizado(valor:unknown) {
  const digitos=String(valor??'').replace(/\D/g,'')
  return digitos.length===8?'505'+digitos:digitos
}
export function registrarAcceso(app:Hono<{Bindings:Env;Variables:Vars}>) {
  app.post('/api/auth/codigo',async c=>{
    const r=await c.req.json().catch(()=>null),tel=telefonoNormalizado(r?.telefono)
    if(!/^\d{8,15}$/.test(tel))return c.json({error:'Revisá el teléfono, incluido el código de país.'},422)
    const demo=tel===DEMO
    if(!demo&&(c.env.ACCESO_PERSONAL!=='true'||!c.env.OTP_SERVICE))return c.json({error:'El acceso personal todavía no está habilitado.'},503)
    const codigo=demo?'505505':codigoDeSeis(),firma=await huella(c.env.SESION_SECRETO,`${tel}:${codigo}`)
    const sql=neon(c.env.DATABASE_URL)
    if(!demo) {
      const ip=await huella(c.env.SESION_SECRETO,'otp-ip:'+(c.req.header('cf-connecting-ip')??'local'))
      const [limite]=await sql`SELECT limitar_acceso(${ip},20,3600) AND limitar_acceso(${'otp:'+tel},5,3600) AS ok`
      if(!limite.ok)return c.json({error:'Pediste varios códigos. Esperá una hora antes de intentar otra vez.'},429)
    }
    const [emitido]=await sql`SELECT emitir_codigo(${tel},${firma}) AS id`
    if(!demo) {
      try {
        // Contrato de un servicio de envío propio. No se configura ningún proveedor por defecto.
        const enviado=await c.env.OTP_SERVICE!.fetch('https://otp.internal/enviar',{method:'POST',headers:{'content-type':'application/json','idempotency-key':'acceso:'+emitido.id},body:JSON.stringify({telefono:tel,codigo,venceEnMinutos:10}),signal:AbortSignal.timeout(8000)})
        if(!enviado.ok)throw Error('envio')
        const confirmacion=await enviado.json() as {enviado?:boolean}
        if(confirmacion.enviado!==true)throw Error('envio')
      } catch {
        await sql`UPDATE codigo_acceso SET usado=now() WHERE id=${emitido.id}`
        return c.json({error:'No pudimos enviar el código. Intentá de nuevo más tarde.'},503)
      }
    }
    return c.json({enviado:true,...(demo?{codigoDemo:codigo}:{} )})
  })
  app.post('/api/auth/entrar',async c=>{
    const r=await c.req.json().catch(()=>null),tel=telefonoNormalizado(r?.telefono)
    if(!r||typeof r.codigo!=='string'||!/^\d{6}$/.test(r.codigo)||!/^\d{8,15}$/.test(tel))return c.json({error:'Revisá el teléfono y los seis dígitos del código.'},422)
    if(tel!==DEMO&&(c.env.ACCESO_PERSONAL!=='true'||!c.env.OTP_SERVICE))return c.json({error:'El acceso personal todavía no está habilitado.'},503)
    const nombre=typeof r.nombre==='string'?r.nombre.trim():''
    if(nombre&&(nombre.length<2||nombre.length>80||/[\u0000-\u001f]/.test(nombre)))return c.json({error:'Usá un nombre de 2 a 80 caracteres.'},422)
    const firma=await huella(c.env.SESION_SECRETO,`${tel}:${r.codigo}`)
    return transaccion(c.env,async cli=>{
      await cli.query('SELECT pg_advisory_xact_lock(hashtext($1))',['acceso:'+tel])
      const {rows:[codigo]}=await cli.query('SELECT id,huella,intentos,vence>now() AS vigente FROM codigo_acceso WHERE telefono=$1 AND usado IS NULL ORDER BY creado DESC,id DESC LIMIT 1 FOR UPDATE',[tel])
      if(!codigo||!codigo.vigente)return c.json({error:'El código venció o ya se usó. Pedí otro.'},410)
      if(codigo.intentos>=5)return c.json({error:'Demasiados intentos. Pedí un código nuevo.'},429)
      if(!igualEnTiempoConstante(firma,codigo.huella)) {
        await cli.query('UPDATE codigo_acceso SET intentos=intentos+1 WHERE id=$1',[codigo.id])
        return c.json({error:'El código no coincide.'},401)
      }
      const {rows:[existente]}=await cli.query('SELECT id,nombre,baja FROM operativo_socio WHERE telefono=$1',[tel])
      if(existente?.baja)return c.json({error:'Esta cuenta no está activa. Consultá en la casa.'},403)
      if(!existente&&!nombre)return c.json({error:'Escribí tu nombre para crear la cuenta.'},422)
      let socio=existente
      if(!socio) {
        const {rows:[nuevo]}=await cli.query('INSERT INTO socio(telefono,nombre) VALUES($1,$2) RETURNING id,nombre',[tel,nombre]); socio=nuevo
        const {rows:[tanda]}=await cli.query('INSERT INTO tanda(socio_id) VALUES($1) RETURNING id',[socio.id])
        await cli.query("INSERT INTO sello(tanda_id,n,motivo,ref_externa) VALUES($1,1,'De parte de la casa',$2),($1,2,'De parte de la casa',$3)",[tanda.id,'regalo-1-'+socio.id,'regalo-2-'+socio.id])
      }
      await cli.query('UPDATE codigo_acceso SET usado=now() WHERE id=$1',[codigo.id])
      const token=await firmar(c.env.SESION_SECRETO,{tel,rol:'socio',exp:Date.now()+30*24*3600000})
      return c.json({token,socio:{nombre:socio.nombre,telefono:tel}})
    })
  })
}
