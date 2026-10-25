import type { Context, Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import type { Env, Vars } from './index'

type C = Context<{ Bindings: Env; Variables: Vars }>
const autorizado = (c:C) => c.get('sesion').rol==='casa' && ['propietario','encargado'].includes(c.get('permiso'))
const uuid = (s:string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s)
const fechaValida = (s:string) => !s || (/^\d{4}-\d{2}-\d{2}$/.test(s) && s>='0001-01-01' && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s)

export function registrarClientes(app:Hono<{Bindings:Env;Variables:Vars}>){
  app.get('/api/operacion/clientes',async c=>{
    if(!autorizado(c))return c.json({error:'El directorio es exclusivo del propietario y del encargado.'},403)
    const pagina=Number(c.req.query('pagina')??0),q=(c.req.query('q')??'').trim(),estado=c.req.query('estado')??'todos',origen=c.req.query('origen')??'todos'
    const desde=c.req.query('desde')??'',hasta=c.req.query('hasta')??'',archivo=c.req.query('archivo')??'operativos'
    if(!Number.isSafeInteger(pagina)||pagina<0||pagina>100000||q.length>100||!['todos','activos','bajas'].includes(estado)||!['todos','correo','anterior','muestra'].includes(origen)||!['operativos','muestras'].includes(archivo)||!fechaValida(desde)||!fechaValida(hasta)||(desde&&hasta&&desde>hasta))return c.json({error:'Revisá la búsqueda, las fechas o los filtros.'},422)
    if(archivo==='muestras'&&c.get('permiso')!=='propietario')return c.json({error:'Solo el propietario consulta el archivo de muestras.'},403)
    const sql=neon(c.env.DATABASE_URL),busqueda='%'+q.replace(/[\\%_]/g,'\\$&')+'%',digitos=/^[+\d\s().-]+$/.test(q)?q.replace(/\D/g,''):'',offset=pagina*20
    // El archivo se consulta expresamente; las lecturas operativas usan las vistas.
    const [r]=await sql`WITH filtradas AS (
      SELECT id,nombre,telefono,correo,correo_verificado,creado,baja,origen,archivado_muestra
      FROM socio WHERE ((${archivo}='operativos' AND archivado_muestra IS NULL) OR (${archivo}='muestras' AND archivado_muestra IS NOT NULL))
        AND (${estado}='todos' OR (${estado}='activos' AND baja IS NULL) OR (${estado}='bajas' AND baja IS NOT NULL))
        AND (${origen}='todos' OR origen=${origen})
        AND (nombre ILIKE ${busqueda} OR correo ILIKE ${busqueda} OR telefono ILIKE ${busqueda} OR (${digitos}<>'' AND telefono LIKE ${'%'+digitos+'%'}))
        AND (${desde}='' OR (creado AT TIME ZONE 'America/Managua')::date>=NULLIF(${desde},'')::date)
        AND (${hasta}='' OR (creado AT TIME ZONE 'America/Managua')::date<=NULLIF(${hasta},'')::date)
    ), pagina AS (SELECT * FROM filtradas ORDER BY creado DESC,id DESC LIMIT 20 OFFSET ${offset})
    SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY creado DESC,id DESC) FROM pagina p),'[]'::jsonb) AS filas,
      (SELECT count(*)::int FROM socio WHERE archivado_muestra IS NULL) AS registrados,
      (SELECT count(*)::int FROM socio WHERE archivado_muestra IS NULL AND baja IS NULL) AS activos,
      (SELECT count(*)::int FROM socio WHERE archivado_muestra IS NULL AND correo_verificado IS NOT NULL) AS verificados,
      (SELECT count(*)::int FROM socio WHERE archivado_muestra IS NOT NULL) AS muestras_archivadas`
    return c.json({...r,pagina,tamano:20,actualizado:new Date().toISOString()})
  })

  app.get('/api/operacion/clientes/:id',async c=>{
    if(!autorizado(c))return c.json({error:'La ficha es exclusiva del propietario y del encargado.'},403)
    const id=c.req.param('id');if(!uuid(id))return c.json({error:'Cliente no encontrado.'},404)
    const sql=neon(c.env.DATABASE_URL),propietario=c.get('permiso')==='propietario'
    const [r]=await sql`SELECT s.id,s.nombre,s.telefono,s.correo,s.correo_verificado,s.creado,s.baja,s.origen,s.archivado_muestra,
      s.bebida_siempre,s.alergias,s.cumple,s.cumple_mes_dia,s.promociones_correo,
      (SELECT to_jsonb(d) FROM saldo_de(s.id) d) AS saldo,
      (SELECT jsonb_build_object('puntos',puntos,'nivel',nivel_nombre) FROM puntaje WHERE socio_id=s.id) AS puntos,
      (SELECT jsonb_build_object('numero',numero,'estado',CASE WHEN estado IN ('activa','en_gracia') AND hasta<=now() THEN 'vencida' ELSE estado::text END,'desde',desde,'hasta',hasta,'autorenueva',autorenueva,'consentida',renovacion_consentida IS NOT NULL) FROM membresia WHERE socio_id=s.id ORDER BY hasta DESC,id DESC LIMIT 1) AS membresia,
      (SELECT count(*)::int FROM pedido WHERE socio_id=s.id) AS pedidos,
      (SELECT max(creado) FROM pedido WHERE socio_id=s.id) AS ultimo_pedido
      FROM socio s WHERE s.id=${id}::uuid AND (${propietario} OR s.archivado_muestra IS NULL)`
    if(!r)return c.json({error:'Cliente no encontrado.'},404)
    return c.json(r)
  })

  app.get('/api/operacion/clientes/:id/historial',async c=>{
    if(!autorizado(c))return c.json({error:'El historial es exclusivo del propietario y del encargado.'},403)
    const id=c.req.param('id'),tipo=c.req.query('tipo')??'todos'
    if(!uuid(id))return c.json({error:'Cliente no encontrado.'},404)
    if(!['todos','dinero','pedidos','reservas','bolsas','experiencias','sellos','canjes','puntos','membresias','beneficios','atencion'].includes(tipo))return c.json({error:'Elegí un tipo de actividad válido.'},422)
    let fecha:string|null=null,clave:string|null=null
    const cursor=c.req.query('cursor')
    if(cursor){try{if(cursor.length>512)throw Error();const r=JSON.parse(atob(cursor));if(!r||typeof r.fecha!=='string'||typeof r.id!=='string'||r.fecha<'0001-01-01'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(r.fecha)||!Number.isFinite(Date.parse(r.fecha))||new Date(r.fecha).toISOString().slice(0,19)!==r.fecha.slice(0,19)||!/^[a-z]+:[0-9a-f-]{1,40}$/.test(r.id))throw Error();fecha=r.fecha;clave=r.id}catch{return c.json({error:'La página del historial no es válida. Volvé al inicio.'},422)}}
    const sql=neon(c.env.DATABASE_URL),propietario=c.get('permiso')==='propietario'
    const [s]=await sql`SELECT id FROM socio WHERE id=${id}::uuid AND (${propietario} OR archivado_muestra IS NULL)`
    if(!s)return c.json({error:'Cliente no encontrado.'},404)
    const rows=await sql`WITH actividad AS (
      SELECT 'dinero:'||id AS id,'dinero' AS tipo,creado AS fecha,concepto AS titulo,jsonb_build_object('monto',monto,'tipo',tipo,'referencia',ref_externa) AS detalle FROM asiento WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'pedidos:'||id,'pedidos',creado,'Pedido #'||numero,jsonb_build_object('estado',estado,'total',total,'lineas',lineas,'motivo',motivo) FROM pedido WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'estados:'||e.id,'pedidos',e.creado,'Pedido #'||p.numero||' · '||e.estado,jsonb_build_object('responsable',COALESCE(em.nombre,e.quien),'motivo',e.motivo) FROM pedido_evento e JOIN pedido p ON p.id=e.pedido_id LEFT JOIN empleado em ON em.id::text=e.quien WHERE p.socio_id=${id}::uuid
      UNION ALL SELECT 'reservas:'||id,'reservas',creada,'Reserva · '||zona,jsonb_build_object('cuando',cuando,'termina',termina,'personas',personas,'deposito',deposito,'cancelada',cancelada) FROM reserva WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'bolsas:'||id,'bolsas',creada,'Bolsa '||numero,jsonb_build_object('generacion',generacion,'total',total,'entregada',entregada) FROM compra_bolsa WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'experiencias:'||a.id,'experiencias',a.comprado,e.nombre,jsonb_build_object('cuando',e.cuando,'butaca',a.butaca,'total',a.pagado,'asistencia',a.asistencia,'cedida',a.cedido_a IS NOT NULL) FROM asiento_experiencia a JOIN experiencia e ON e.id=a.experiencia_id WHERE a.socio_id=${id}::uuid OR a.cedido_a=${id}::uuid
      UNION ALL SELECT 'sellos:'||s.id,'sellos',s.puesto,s.motivo,jsonb_build_object('numero',s.n,'responsable',COALESCE(em.nombre,s.barista)) FROM sello s JOIN tanda t ON t.id=s.tanda_id LEFT JOIN empleado em ON em.id::text=s.barista WHERE t.socio_id=${id}::uuid
      UNION ALL SELECT 'canjes:'||id,'canjes',canjeada,'Décima de tanda entregada',jsonb_build_object('abierta',abierta,'cerrada',cerrada) FROM tanda WHERE socio_id=${id}::uuid AND canjeada IS NOT NULL
      UNION ALL SELECT 'puntos:'||id,'puntos',creado,concepto,jsonb_build_object('puntos',puntos) FROM punto WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'membresias:'||id,'membresias',desde,'Membresía #'||numero,jsonb_build_object('estado',CASE WHEN estado IN ('activa','en_gracia') AND hasta<=now() THEN 'vencida' ELSE estado::text END,'hasta',hasta,'cuota',cuota) FROM membresia WHERE socio_id=${id}::uuid
      UNION ALL SELECT 'beneficios:'||b.id,'beneficios',b.usado,CASE b.clase WHEN 'bolsa_mes' THEN 'Bolsa de membresía entregada' ELSE 'Bebida de membresía entregada' END,'{}'::jsonb FROM beneficio_uso b JOIN membresia m ON m.id=b.membresia_id WHERE m.socio_id=${id}::uuid
      UNION ALL SELECT 'atencion:'||id,'atencion',creada,'Solicitud de atención',jsonb_build_object('estado',estado,'mensaje',mensaje,'respuesta',respuesta,'resuelta',resuelta) FROM solicitud_atencion WHERE socio_id=${id}::uuid
    ) SELECT id,tipo,titulo,detalle,to_char(fecha AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS fecha FROM actividad
      WHERE (${tipo}='todos' OR tipo=${tipo}) AND (${fecha}::timestamptz IS NULL OR (fecha,id)<(${fecha}::timestamptz,${clave}::text))
      ORDER BY fecha DESC,id DESC LIMIT 21`
    const filas=rows.slice(0,20),ultima=filas.at(-1)
    return c.json({filas,siguiente:rows.length>20&&ultima?btoa(JSON.stringify({fecha:ultima.fecha,id:ultima.id})):null})
  })
}
