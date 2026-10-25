import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import type { Env, Vars } from './index'
import { EVENTOS_INICIO } from '../compartido/metricas-inicio'
import { digest } from './equipo-sesion'

export function registrarInicio(app:Hono<{Bindings:Env;Variables:Vars}>) {
  app.post('/api/inicio/evento',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const r=await c.req.json()
    if(Object.keys(r).some(k=>!['evento','duracion','dispositivo'].includes(k))||!['movil','tableta','escritorio'].includes(r.dispositivo)||!EVENTOS_INICIO.includes(r.evento)||!Number.isInteger(r.duracion)||r.duracion<0||r.duracion>30_000)return c.json({error:'Evento inválido.'},422)
    const sql=neon(c.env.DATABASE_URL),clave=await digest('medicion:'+c.get('sesion').tel)
    const [limite]=await sql`SELECT limitar_acceso(${clave},120,60) AS ok`
    if(!limite.ok)return c.json({error:'Intentá más tarde.'},429)
    const ms=r.evento.startsWith('actualizacion_')?r.duracion:0
    await sql`INSERT INTO inicio_metrica(evento,cuenta,dispositivo,cantidad,duracion_ms)
      SELECT ${r.evento},CASE WHEN EXISTS(SELECT 1 FROM operativo_membresia m JOIN operativo_socio s ON s.id=m.socio_id WHERE s.telefono=${c.get('sesion').tel} AND m.estado IN ('activa','en_gracia') AND m.hasta>now()) THEN 'fundador' ELSE 'cliente' END,${r.dispositivo},1,${ms}
      ON CONFLICT(dia,evento,cuenta,dispositivo) DO UPDATE SET cantidad=inicio_metrica.cantidad+1,duracion_ms=inicio_metrica.duracion_ms+EXCLUDED.duracion_ms`
    return c.json({registrado:true})
  })
  app.get('/api/operacion/metricas-inicio',async c=>{
    if(c.get('sesion').rol!=='casa'||!['propietario','encargado'].includes(c.get('permiso')))return c.json({error:'Acceso exclusivo de administración.'},403)
    const dias=Number(c.req.query('dias')??30)
    if(![1,7,30,90].includes(dias))return c.json({error:'Período inválido.'},422)
    const sql=neon(c.env.DATABASE_URL)
    const eventos=await sql`SELECT evento,sum(cantidad)::bigint AS cantidad,sum(duracion_ms)::bigint AS duracion_ms FROM inicio_metrica
      WHERE dia>=(now() AT TIME ZONE 'America/Managua')::date-${dias-1}::int GROUP BY evento ORDER BY evento`
    const segmentos=await sql`SELECT cuenta,dispositivo,evento,sum(cantidad)::bigint AS cantidad FROM inicio_metrica WHERE dia>=(now() AT TIME ZONE 'America/Managua')::date-${dias-1}::int GROUP BY cuenta,dispositivo,evento ORDER BY cuenta,dispositivo,evento`
    return c.json({dias,eventos:eventos.map(e=>({...e,cantidad:Number(e.cantidad),duracion_ms:Number(e.duracion_ms)})),segmentos:segmentos.map(s=>({...s,cantidad:Number(s.cantidad)}))})
  })
  app.get('/api/inicio/contexto',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const sql=neon(c.env.DATABASE_URL),tel=c.get('sesion').tel
    const [pedido]=await sql`SELECT p.numero,p.estado FROM operativo_pedido p JOIN operativo_socio s ON s.id=p.socio_id
      WHERE s.telefono=${tel} AND p.estado IN ('recibido','aceptado','preparando','listo')
      ORDER BY (p.estado='listo') DESC,p.creado LIMIT 1`
    const [reserva]=await sql`SELECT r.zona,r.cuando,r.personas FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id
      WHERE s.telefono=${tel} AND r.cancelada IS NULL AND r.termina>now() ORDER BY r.cuando LIMIT 1`
    const [avisos]=await sql`SELECT count(*)::int AS n FROM operativo_aviso_cliente a JOIN operativo_socio s ON s.id=a.socio_id WHERE s.telefono=${tel} AND a.leido IS NULL`
    return c.json({pedido:pedido??null,reserva:reserva??null,avisos:Number(avisos?.n??0),ahora:new Date().toISOString()})
  })
}
