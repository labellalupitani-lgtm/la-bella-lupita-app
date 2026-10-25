import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import type { Env, Vars } from './index'
import { transaccion } from './operacion'
import { CONTRATO_CLUB, EVENTOS_CLUB } from '../compartido/club'
import { digest } from './equipo-sesion'
import { REGLAS_CLUB } from '../compartido/reglas-club'
import { RECARGA } from '../compartido/reglas'
import { CARTA } from '../data/menu'

const uuid = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v)
const camposTexto = ['cafe_detalle','sellos_regla','premio_detalle','vip_regla'] as const
const camposCosto = ['costo_cafe','costo_bolsa','costo_fijo_periodo'] as const

export function registrarClub(app: Hono<{Bindings: Env; Variables: Vars}>) {
  app.get('/api/club/informacion', async c => {
    const sql=neon(c.env.DATABASE_URL)
    // Lista explícita: nunca publicar costos, socios, lista de espera ni historial.
    const [config]=await sql`SELECT cafe_detalle,sellos_regla,premio_detalle,vip_regla,version,reposteria,reglas_version FROM club_config WHERE id=true`
    if(!config)return c.json({error:'No pudimos consultar las condiciones del club.'},503)
    return c.json({contrato:CONTRATO_CLUB,config:{...config,reposteria_productos:CARTA.filter(p=>config.reposteria.includes(p.id)).map(p=>p.nombre)},recarga:RECARGA,ahora:new Date().toISOString()})
  })
  app.get('/api/club', async c => {
    if(c.get('sesion').rol !== 'socio') return c.json({error:'Entrá con tu cuenta.'},403)
    const sql=neon(c.env.DATABASE_URL)
    const [s]=await sql`SELECT id FROM operativo_socio WHERE telefono=${c.get('sesion').tel} AND baja IS NULL`
    const [config]=await sql`SELECT cafe_detalle,sellos_regla,premio_detalle,vip_regla,version,reposteria,reglas_version FROM club_config WHERE id=true`
    const [ultima]=await sql`SELECT numero,estado,hasta,cuota,(autorenueva AND renovacion_consentida IS NOT NULL) AS autorenueva,contrato_version,periodo_inicio,motivo_fin,contrato_detalle FROM operativo_membresia WHERE socio_id=${s.id} ORDER BY desde DESC LIMIT 1`
    const eventos=await sql`SELECT id::text,evento,detalle,creado FROM club_evento WHERE socio_id=${s.id} ORDER BY id DESC LIMIT 30`
    const [espera]=await sql`SELECT creada,consentimiento,contactada FROM club_espera WHERE socio_id=${s.id} AND cancelada IS NULL`
    const reposiciones=await sql`SELECT id,clase,creada,motivo,entregada FROM club_reposicion WHERE socio_id=${s.id} ORDER BY creada DESC LIMIT 20`
    const descuentos=await sql`SELECT d.id,d.ticket,d.subtotal,d.descuento,d.total,d.lineas,d.creado,a.creado AS anulado,a.motivo FROM club_descuento_caja d LEFT JOIN club_descuento_anulacion a ON a.descuento_id=d.id WHERE d.socio_id=${s.id} ORDER BY d.creado DESC LIMIT 30`
    return c.json({contrato:CONTRATO_CLUB,config:{...config,reposteria_productos:CARTA.filter(p=>config.reposteria.includes(p.id)).map(p=>p.nombre)},ultima:ultima??null,eventos,reposiciones,descuentos,espera:espera??null,ahora:new Date().toISOString()})
  })
  app.post('/api/club/sincronizar',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const sql=neon(c.env.DATABASE_URL)
    await sql`SELECT mantener_membresia(id) FROM operativo_socio WHERE telefono=${c.get('sesion').tel} AND baja IS NULL`
    const [actual]=await sql`SELECT m.numero,m.hasta FROM operativo_membresia m JOIN operativo_socio s ON s.id=m.socio_id WHERE s.telefono=${c.get('sesion').tel} AND m.estado IN ('activa','en_gracia') AND m.hasta>now()`
    return c.json({actualizado:true,vigente:!!actual,membresia:actual??null})
  })
  app.get('/api/club/compra/:ref',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const ref=c.req.param('ref')
    if(!/^[A-Za-z0-9_-]{8,64}$/.test(ref))return c.json({error:'Referencia inválida.'},422)
    return transaccion(c.env,async cli=>{
      const {rows:[s]}=await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE',[c.get('sesion').tel])
      if(!s)return c.json({error:'Cuenta no encontrada.'},404)
      const {rows:[r]}=await cli.query("SELECT operacion,respuesta FROM operativo_solicitud_compra WHERE socio_id=$1 AND referencia=$2 AND operacion IN ('membresia','experiencia')",[s.id,'sol:'+ref])
      return c.json(r?{estado:'confirmado',operacion:r.operacion,recibo:r.respuesta}:{estado:'sin_cobro'})
    })
  })
  app.post('/api/club/espera',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const r=await c.req.json().catch(()=>null)
    if(typeof r?.acepto!=='boolean')return c.json({error:'Indicá si querés que la casa te contacte por una plaza.'},422)
    const sql=neon(c.env.DATABASE_URL)
    if(r.acepto)await sql`INSERT INTO club_espera(socio_id,consentimiento) SELECT id,now() FROM operativo_socio WHERE telefono=${c.get('sesion').tel} AND baja IS NULL
      ON CONFLICT(socio_id) DO UPDATE SET consentimiento=CASE WHEN club_espera.cancelada IS NOT NULL THEN now() ELSE club_espera.consentimiento END,creada=CASE WHEN club_espera.cancelada IS NOT NULL THEN now() ELSE club_espera.creada END,cancelada=NULL`
    else await sql`UPDATE club_espera SET cancelada=now() WHERE socio_id=(SELECT id FROM operativo_socio WHERE telefono=${c.get('sesion').tel}) AND cancelada IS NULL`
    return c.json({inscrita:r.acepto})
  })
  app.post('/api/club/evento',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const r=await c.req.json().catch(()=>null)
    if(!r||Object.keys(r).some(k=>!['evento','dispositivo'].includes(k))||!EVENTOS_CLUB.includes(r.evento)||!['movil','tableta','escritorio'].includes(r.dispositivo))return c.json({error:'Evento inválido.'},422)
    const sql=neon(c.env.DATABASE_URL)
    const clave=await digest('club-metrica:'+c.get('sesion').tel)
    const [limite]=await sql`SELECT limitar_acceso(${clave},60,60) AS permite`
    if(!limite.permite)return c.json({error:'Demasiadas solicitudes.'},429)
    await sql`INSERT INTO club_metrica(dia,evento,dispositivo) VALUES((now() AT TIME ZONE 'America/Managua')::date,${r.evento},${r.dispositivo}) ON CONFLICT(dia,evento,dispositivo) DO UPDATE SET cantidad=club_metrica.cantidad+1`
    return c.json({registrado:true})
  })
  app.use('/api/operacion/club/*',async(c,next)=>{
    if(c.get('sesion').rol!=='casa'||!['propietario','encargado'].includes(c.get('permiso')))return c.json({error:'Acceso exclusivo de administración.'},403)
    return next()
  })
  app.post('/api/club/rendimiento',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const r=await c.req.json().catch(()=>null)
    if(!r||Object.keys(r).some(k=>!['metrica','valor','dispositivo'].includes(k))||!['LCP','INP','CLS'].includes(r.metrica)||typeof r.valor!=='number'||!Number.isFinite(r.valor)||r.valor<0||r.valor>(r.metrica==='CLS'?100:300000)||!['movil','tableta','escritorio'].includes(r.dispositivo))return c.json({error:'Medición inválida.'},422)
    const sql=neon(c.env.DATABASE_URL),clave=await digest('club-vitals:'+c.get('sesion').tel),[limite]=await sql`SELECT limitar_acceso(${clave},30,60) AS permite`
    if(!limite.permite)return c.json({error:'Demasiadas solicitudes.'},429)
    await sql`INSERT INTO club_rendimiento(metrica,valor,dispositivo) VALUES(${r.metrica},${r.valor},${r.dispositivo})`
    await sql`DELETE FROM club_rendimiento WHERE dia<current_date-90`
    return c.json({registrado:true})
  })
  app.post('/api/club/tiempo',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const r=await c.req.json().catch(()=>null)
    if(!r||Object.keys(r).some(k=>!['operacion','resultado','entrada','dispositivo','milisegundos'].includes(k))||!['codigo','recuperacion','vista'].includes(r.operacion)||!['correcto','error','cancelado'].includes(r.resultado)||!['directa','interna'].includes(r.entrada)||!['movil','tableta','escritorio'].includes(r.dispositivo)||!Number.isInteger(r.milisegundos)||r.milisegundos<0||r.milisegundos>300000)return c.json({error:'Medición inválida.'},422)
    const sql=neon(c.env.DATABASE_URL),clave=await digest('club-tiempo:'+c.get('sesion').tel),[limite]=await sql`SELECT limitar_acceso(${clave},60,60) AS permite`
    if(!limite.permite)return c.json({error:'Demasiadas solicitudes.'},429)
    await sql`INSERT INTO club_tiempo(operacion,resultado,entrada,dispositivo,milisegundos) VALUES(${r.operacion},${r.resultado},${r.entrada},${r.dispositivo},${r.milisegundos})`
    return c.json({registrado:true})
  })
  app.get('/api/operacion/club/panel',async c=>{
    const sql=neon(c.env.DATABASE_URL)
    const [config]=await sql`SELECT version,cafe_detalle,sellos_regla,premio_detalle,vip_regla,costo_cafe,costo_bolsa,costo_fijo_periodo,reposteria FROM club_config WHERE id=true`
    const espera=await sql`SELECT w.socio_id,s.nombre,s.codigo_club,w.creada,w.contactada FROM club_espera w JOIN operativo_socio s ON s.id=w.socio_id WHERE w.cancelada IS NULL AND s.baja IS NULL ORDER BY w.creada LIMIT 100`
    const experiencias=await sql`SELECT e.*,(SELECT count(*)::int FROM operativo_asiento_experiencia a WHERE a.experiencia_id=e.id AND a.reembolsada IS NULL AND a.asistencia IS NULL) AS pendientes_reembolso FROM experiencia e ORDER BY cuando DESC LIMIT 50`
    const metricas=await sql`SELECT evento,sum(cantidad)::int AS cantidad FROM club_metrica WHERE dia>=current_date-30 GROUP BY evento ORDER BY evento`
    const rendimiento=await sql`SELECT metrica,dispositivo,count(*)::int AS muestras,percentile_cont(0.75) WITHIN GROUP(ORDER BY valor) AS p75 FROM club_rendimiento WHERE dia>=current_date-30 GROUP BY metrica,dispositivo`
    const tiempos=await sql`SELECT operacion,resultado,entrada,dispositivo,count(*)::int AS muestras,percentile_cont(0.75) WITHIN GROUP(ORDER BY milisegundos) AS p75 FROM club_tiempo WHERE dia>=current_date-30 GROUP BY operacion,resultado,entrada,dispositivo`
    const cohortes=await sql`SELECT to_char(m.desde AT TIME ZONE 'America/Managua','YYYY-MM') AS mes,count(*)::int AS altas,count(*) FILTER(WHERE m.hasta>now() AND m.estado IN ('activa','en_gracia'))::int AS vigentes FROM operativo_membresia m GROUP BY 1 ORDER BY 1 DESC LIMIT 12`
    const retencion=await sql`SELECT CASE WHEN e.evento='fin' THEN 'fin_'||COALESCE(e.detalle->>'motivo','sin_motivo') ELSE e.evento END AS causa,count(*)::int AS cantidad
      FROM club_evento e JOIN operativo_socio s ON s.id=e.socio_id WHERE e.creado>=now()-interval '30 days' AND e.evento IN ('alta','renovacion','consentimiento','cancelacion_renovacion','fin') GROUP BY 1 ORDER BY 1`
    const [operacion]=await sql`SELECT
      (SELECT count(*)::int FROM operativo_beneficio_uso WHERE clase='bebida_dia' AND usado_en>=now()-interval '30 days')+(SELECT count(*)::int FROM club_reposicion r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.clase='bebida_dia' AND r.entregada>=now()-interval '30 days') AS cafes,
      (SELECT count(*)::int FROM operativo_beneficio_uso WHERE clase='bolsa_mes' AND usado_en>=now()-interval '30 days')+(SELECT count(*)::int FROM club_reposicion r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.clase='bolsa_mes' AND r.entregada>=now()-interval '30 days') AS bolsas,
      (SELECT COALESCE(sum((COALESCE((l->>'precioAntes')::int,(l->>'precio')::int)-(l->>'precio')::int)*(l->>'cuanto')::int),0)::bigint FROM operativo_pedido p CROSS JOIN LATERAL jsonb_array_elements(p.lineas) l WHERE p.estado<>'cancelado' AND p.creado>=now()-interval '30 days' AND (l->>'descuentoClub')::int=15) AS descuentos_carta,
      (SELECT COALESCE(sum(d.descuento),0)::bigint FROM club_descuento_caja d JOIN operativo_socio s ON s.id=d.socio_id WHERE d.creado>=now()-interval '30 days' AND NOT EXISTS(SELECT 1 FROM club_descuento_anulacion a WHERE a.descuento_id=d.id)) AS descuentos_caja,
      (SELECT COALESCE(-sum(monto),0)::bigint FROM operativo_asiento WHERE creado>=now()-interval '30 days' AND (ref_externa LIKE 'mem:%' OR ref_externa LIKE 'renovacion:%')) AS cobros,
      (SELECT count(*)::int FROM club_periodo p JOIN operativo_membresia m ON m.id=p.membresia_id WHERE p.inicio>=now()-interval '30 days') AS periodos`
    return c.json({config,espera,experiencias,metricas,rendimiento,tiempos,cohortes,retencion,operacion,contrato:CONTRATO_CLUB,productos:CARTA.map(p=>({id:p.id,nombre:p.nombre,categoria:p.categoria}))})
  })
  app.post('/api/operacion/club/configuracion',async c=>{
    if(c.get('permiso')!=='propietario')return c.json({error:'Las condiciones y costos los confirma el propietario.'},403)
    const r=await c.req.json().catch(()=>null)
    if(!r||!Number.isInteger(r.version)||Object.keys(r).some(k=>!['version','reposteria',...camposTexto,...camposCosto].includes(k)))return c.json({error:'Configuración inválida.'},422)
    if(!Array.isArray(r.reposteria)||r.reposteria.length>CARTA.length||new Set(r.reposteria).size!==r.reposteria.length||r.reposteria.some((id:unknown)=>!CARTA.some(p=>p.id===id)))return c.json({error:'Elegí productos existentes para el descuento de repostería.'},422)
    for(const k of camposTexto)if(r[k]!==null&&(typeof r[k]!=='string'||r[k].trim().length<5||r[k].length>1000))return c.json({error:'Completá las condiciones o dejalas pendientes.'},422)
    for(const k of camposCosto)if(r[k]!==null&&(!Number.isInteger(r[k])||r[k]<0||r[k]>10000000))return c.json({error:'Los costos se registran en centavos y no pueden ser negativos.'},422)
    return transaccion(c.env,async cli=>{
      const {rows:[vigente]}=await cli.query('SELECT reglas_version FROM club_config WHERE id=true FOR UPDATE')
      if(vigente.reglas_version===REGLAS_CLUB.version&&(camposTexto.some(k=>r[k]?.trim()!==REGLAS_CLUB[k])||JSON.stringify([...r.reposteria].sort())!==JSON.stringify([...REGLAS_CLUB.reposteria].sort())))return c.json({error:'Estas reglas activas tienen controles asociados. Para cambiarlas, prepará una nueva versión que conserve los derechos anteriores. Podés actualizar costos sin alterar las reglas.'},409)
      const {rows:[config]}=await cli.query('UPDATE club_config SET cafe_detalle=$1,sellos_regla=$2,premio_detalle=$3,vip_regla=$4,costo_cafe=$5,costo_bolsa=$6,costo_fijo_periodo=$7,reposteria=$9::jsonb,version=version+1,actualizado=now() WHERE id=true AND version=$8 RETURNING version,cafe_detalle,sellos_regla,premio_detalle,vip_regla,costo_cafe,costo_bolsa,costo_fijo_periodo,reposteria',[...camposTexto.map(k=>r[k]?.trim()??null),...camposCosto.map(k=>r[k]),r.version,JSON.stringify(r.reposteria)])
      if(!config)return c.json({error:'Otra persona cambió la configuración. Actualizá antes de guardar.'},409)
      await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'club_configuracion',$2::jsonb)",[c.get('sesion').empleado,JSON.stringify(config)])
      return c.json({config})
    })
  })
  app.post('/api/operacion/club/espera/:id',async c=>{
    if(!uuid(c.req.param('id')))return c.json({error:'Solicitud inválida.'},422)
    const sql=neon(c.env.DATABASE_URL)
    const rows=await sql`UPDATE club_espera SET contactada=COALESCE(contactada,now()),atendida_por=${c.get('sesion').empleado??'propietario'} WHERE socio_id=${c.req.param('id')} AND cancelada IS NULL RETURNING socio_id`
    return rows.length?c.json({registrado:true}):c.json({error:'La persona ya no está en espera.'},409)
  })
  app.post('/api/operacion/club/experiencias',async c=>{
    const r=await c.req.json().catch(()=>null)
    if(!r||typeof r.id!=='string'||!/^[a-z0-9-]{3,64}$/.test(r.id)||typeof r.nombre!=='string'||r.nombre.length<3||r.nombre.length>120||!Number.isInteger(r.cupos)||r.cupos<1||r.cupos>1000||!Number.isInteger(r.precio)||r.precio<1||r.precio>10000000||!Number.isInteger(r.duracion_minutos)||r.duracion_minutos<15||r.duracion_minutos>720)return c.json({error:'Revisá nombre, precio, cupos y duración.'},422)
    if(['lugar','incluye','condiciones'].some(k=>typeof r[k]!=='string'||r[k].trim().length<5||r[k].length>1000))return c.json({error:'Completá lugar, contenido y condiciones de cambio o cancelación.'},422)
    const fechas=['cuando','abre_socios','abre_publico'].map(k=>Date.parse(r[k]))
    if(fechas.some(n=>!Number.isFinite(n))||fechas[0]<=Date.now()||fechas[2]>=fechas[0]||fechas[2]-fechas[1]!==48*3600000)return c.json({error:'La apertura a socios debe ser 48 horas antes de la pública, y ambas anteriores al evento.'},422)
    return transaccion(c.env,async cli=>{
      const {rows:compras}=await cli.query('SELECT id FROM operativo_asiento_experiencia WHERE experiencia_id=$1 LIMIT 1',[r.id])
      if(compras.length)return c.json({error:'Esta experiencia ya tiene entradas. Conservá sus condiciones; contactá a sus titulares para cualquier cambio.'},409)
      const {rows}=await cli.query(`INSERT INTO experiencia(id,nombre,cuando,cupos,precio,abre_socios,abre_publico,duracion_minutos,lugar,incluye,condiciones)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(id) DO NOTHING RETURNING id`,[r.id,r.nombre.trim(),r.cuando,r.cupos,r.precio,r.abre_socios,r.abre_publico,r.duracion_minutos,r.lugar.trim(),r.incluye.trim(),r.condiciones.trim()])
      if(!rows.length)return c.json({error:'Ese identificador ya existe. Usá uno nuevo.'},409)
      await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'experiencia_creada',$2::jsonb)",[c.get('sesion').empleado,JSON.stringify(r)])
      return c.json({creada:true})
    })
  })
  app.post('/api/club/entrada/:id/ceder',async c=>{
    if(c.get('sesion').rol!=='socio')return c.json({error:'Entrá con tu cuenta.'},403)
    const r=await c.req.json().catch(()=>null),id=c.req.param('id')
    if(!uuid(id)||typeof r?.codigo!=='string'||!/^[A-F0-9]{12}$/.test(r.codigo)||r.confirmo!==true)return c.json({error:'Indicá el código de pase del destinatario y confirmá la cesión.'},422)
    return transaccion(c.env,async cli=>{
      const {rows:[s]}=await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE',[c.get('sesion').tel])
      const {rows:[a]}=await cli.query('SELECT a.*,e.cuando,e.cancelada FROM operativo_asiento_experiencia a JOIN experiencia e ON e.id=a.experiencia_id WHERE a.id=$1 FOR UPDATE OF a',[id])
      if(!a||a.socio_id!==s.id)return c.json({error:'Entrada no encontrada.'},404)
      const {rows:[destino]}=await cli.query('SELECT id,nombre FROM operativo_socio WHERE codigo_club=$1 AND baja IS NULL',[r.codigo])
      if(!destino||destino.id===s.id)return c.json({error:'Revisá el código del destinatario.'},422)
      if(a.cedido_a===destino.id)return c.json({cedida:true,nombre:destino.nombre,repetido:true})
      if(a.cedido_a||a.asistencia||a.cancelada||a.reembolsada||new Date(a.cuando).getTime()<=Date.now())return c.json({error:'Esta entrada ya no se puede ceder. Pedí ayuda a la casa.'},409)
      await cli.query('UPDATE asiento_experiencia SET cedido_a=$2 WHERE id=$1',[id,destino.id])
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'entrada_cedida',$2,$3::jsonb)",['cliente:'+s.id,s.id,JSON.stringify({entrada:id,destino:destino.id})])
      await cli.query("INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,'Recibiste una entrada. Consultala en Mis compras.') ON CONFLICT DO NOTHING",[destino.id,'cesion:'+id])
      return c.json({cedida:true,nombre:destino.nombre})
    })
  })
  app.post('/api/operacion/club/experiencias/:id/cancelar',async c=>{
    const id=c.req.param('id'),r=await c.req.json().catch(()=>null)
    if(!/^[a-z0-9-]{3,64}$/.test(id)||typeof r?.motivo!=='string'||r.motivo.trim().length<5||r.motivo.length>500||r.confirmo!==true)return c.json({error:'Confirmá la cancelación e indicá el motivo.'},422)
    const quien=c.get('sesion').empleado??'propietario'
    // Primero se cierra la venta con el mismo bloqueo de la compra. Las
    // devoluciones siguientes son idempotentes y reanudables por entrada.
    const cerrada=await transaccion(c.env,async cli=>{
      const {rows:[e]}=await cli.query('SELECT * FROM experiencia WHERE id=$1 FOR UPDATE',[id])
      if(!e)return null
      if(!e.cancelada){
        await cli.query('UPDATE experiencia SET cancelada=now(),motivo_cancelacion=$2 WHERE id=$1',[id,r.motivo.trim()])
        await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'experiencia_cancelada',$2::jsonb)",[quien,JSON.stringify({id,motivo:r.motivo.trim()})])
      }
      return e
    })
    if(!cerrada)return c.json({error:'Experiencia no encontrada.'},404)
    const sql=neon(c.env.DATABASE_URL)
    const entradas=await sql`SELECT id,socio_id FROM operativo_asiento_experiencia WHERE experiencia_id=${id} AND reembolsada IS NULL AND asistencia IS NULL ORDER BY (cobro_ref IS NULL),comprado,id LIMIT 20`
    let devueltas=0,sinComprobante=0
    for(const entrada of entradas){
      const resultado=await transaccion(c.env,async cli=>{
        await cli.query('SELECT id FROM operativo_socio WHERE id=$1 FOR UPDATE',[entrada.socio_id])
        const {rows:[a]}=await cli.query('SELECT * FROM operativo_asiento_experiencia WHERE id=$1 FOR UPDATE',[entrada.id])
        if(!a||a.reembolsada||a.asistencia)return false
        if(!a.cobro_ref)return null
        const {rows:[original]}=await cli.query('SELECT id,monto FROM operativo_asiento WHERE socio_id=$1 AND ref_externa=$2 AND monto=$3',[a.socio_id,a.cobro_ref,-a.pagado])
        if(!original)return null
        const ref='devolucion-experiencia:'+a.id
        await cli.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa,quien,nota,devolucion_de) VALUES($1,$2,'ajuste',$3,$4,$5,$6,$7)",[a.socio_id,a.pagado,'Devolución · '+cerrada.nombre,ref,quien,r.motivo.trim(),original.id])
        await cli.query("INSERT INTO punto(socio_id,puntos,motivo,origen_id,concepto) SELECT $1,-puntos,'ajuste',$2,$3 FROM operativo_punto WHERE socio_id=$1 AND origen_id=$4 AND motivo='consumo' ON CONFLICT DO NOTHING",[a.socio_id,ref,'Devolución · '+cerrada.nombre,String(original.id)])
        await cli.query('UPDATE asiento_experiencia SET reembolsada=now() WHERE id=$1',[a.id])
        await cli.query("INSERT INTO auditoria(quien,accion,socio_id,monto,detalle) VALUES($1,'experiencia_reembolsada',$2,$3,$4::jsonb)",[quien,a.socio_id,a.pagado,JSON.stringify({entrada:a.id,motivo:r.motivo.trim(),original:String(original.id)})])
        await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[a.socio_id,ref,'La casa canceló '+cerrada.nombre+'. Devolvimos el importe a tu Cuenta de Casa. Motivo: '+r.motivo.trim()])
        if(a.cedido_a)await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[a.cedido_a,ref,'La casa canceló '+cerrada.nombre+'. La entrada quedó sin efecto y el importe se devolvió al comprador.'])
        return true
      })
      if(resultado===true)devueltas++;if(resultado===null)sinComprobante++
    }
    const [faltan]=await sql`SELECT count(*)::int AS n FROM operativo_asiento_experiencia WHERE experiencia_id=${id} AND reembolsada IS NULL AND asistencia IS NULL`
    return c.json({cancelada:true,devueltas,pendientes:faltan.n,sinComprobante})
  })
}
