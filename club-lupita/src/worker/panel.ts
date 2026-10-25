import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import type { Env, Vars } from './index'
import { fechaCalendario } from './validacion'
import { pedidoParaCocina } from './pedido-publico'
import { plazasOcupadas } from './membresias'

/** Lecturas del equipo: parámetros enlazados, orden estable y total en la misma consulta. */
export function registrarPanel(app: Hono<{ Bindings: Env; Variables: Vars }>) {
  app.get('/api/operacion/listas/:tipo', async c => {
    const tipo = c.req.param('tipo')
    const permiso = c.get('permiso') ?? 'encargado'
    if (c.get('sesion').rol !== 'casa' || (permiso === 'cocina' && tipo !== 'pedidos') ||
      (['equipo', 'auditoria'].includes(tipo) && !['propietario','encargado'].includes(permiso))) return c.json({ error: 'Tu acceso no permite consultar esta sección.' }, 403)
    if (!['pedidos', 'entregas', 'agenda', 'atencion', 'equipo', 'auditoria'].includes(tipo)) return c.json({ error: 'Sección no encontrada.' }, 404)
    const pagina = Number(c.req.query('pagina') ?? 0)
    const q = (c.req.query('q') ?? '').trim()
    const estado = c.req.query('estado') ?? ({ pedidos: 'activos', entregas: 'pendientes', agenda: 'proximas', atencion: 'pendiente', equipo: 'todos', auditoria: 'todos' }[tipo]!)
    const fecha = c.req.query('fecha') ?? ''
    const estados: Record<string, string[]> = {
      pedidos: ['activos', 'todos', 'recibido', 'aceptado', 'preparando', 'listo', 'entregado', 'cancelado'],
      entregas: ['pendientes', 'entregadas', 'todos', 'bolsa', 'experiencia'],
      agenda: ['proximas', 'todos', 'canceladas'], atencion: ['pendiente', 'resuelta', 'todos'],
      equipo: ['todos', 'activos', 'desactivados'], auditoria: ['todos'],
    }
    if (!Number.isSafeInteger(pagina) || pagina < 0 || pagina > 100000 || q.length > 80 || !estados[tipo].includes(estado) ||
      (fecha && !fechaCalendario(fecha))) {
      return c.json({ error: 'Revisá los filtros o la página solicitada.' }, 422)
    }
    const sql = neon(c.env.DATABASE_URL), offset = pagina * 20
    const busqueda = '%' + q.replace(/[\\%_]/g, '\\$&') + '%'
    let resultado
    if (tipo === 'pedidos') {
      ;[resultado] = await sql`WITH filtradas AS (
        SELECT p.id,p.numero,p.estado,p.total,p.lineas,p.creado,p.actualizado,p.motivo,p.restriccion_confirmada,p.empaque,p.estimacion_minutos,s.nombre
        FROM operativo_pedido p JOIN operativo_socio s ON s.id=p.socio_id
        WHERE (${estado}='todos' OR (${estado}='activos' AND p.estado NOT IN ('entregado','cancelado')) OR p.estado=${estado})
          AND (s.nombre ILIKE ${busqueda} OR p.numero::text ILIKE ${busqueda})
          AND (${fecha}='' OR (p.creado AT TIME ZONE 'America/Managua')::date::text=${fecha})
      ), pagina AS (SELECT * FROM filtradas ORDER BY creado DESC,id DESC LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY creado DESC,id DESC) FROM pagina p),'[]'::jsonb) AS filas`
    } else if (tipo === 'entregas') {
      ;[resultado] = await sql`WITH todas AS (
        SELECT b.id,'bolsa' AS tipo,s.nombre,s.telefono,'Bolsa '||b.numero||' · lote '||b.generacion||' · '||b.estado AS detalle,b.creada AS fecha,b.entregada AS completada,b.entregada_por AS responsable
        FROM operativo_compra_bolsa b JOIN operativo_socio s ON s.id=b.socio_id WHERE b.estado<>'reembolsada'
        UNION ALL SELECT a.id,'experiencia',s.nombre,s.telefono,e.nombre||' · Butaca '||a.butaca,e.cuando,a.asistencia,a.asistencia_por
        FROM operativo_asiento_experiencia a JOIN operativo_socio s ON s.id=COALESCE(a.cedido_a,a.socio_id) JOIN experiencia e ON e.id=a.experiencia_id WHERE e.cancelada IS NULL AND a.reembolsada IS NULL
      ), filtradas AS (SELECT * FROM todas WHERE
        (${estado}='todos' OR (${estado}='entregadas' AND completada IS NOT NULL) OR (${estado}='pendientes' AND completada IS NULL) OR (tipo=${estado} AND completada IS NULL))
        AND (nombre ILIKE ${busqueda} OR detalle ILIKE ${busqueda} OR telefono ILIKE ${busqueda} OR id::text ILIKE ${busqueda})
        AND (${fecha}='' OR (fecha AT TIME ZONE 'America/Managua')::date::text=${fecha})
      ), pagina AS (SELECT * FROM filtradas ORDER BY fecha,id,tipo LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY fecha,id,tipo) FROM pagina p),'[]'::jsonb) AS filas`
    } else if (tipo === 'agenda') {
      ;[resultado] = await sql`WITH filtradas AS (
        SELECT r.id,r.zona,r.cuando,r.termina,r.personas,r.deposito,r.cancelada,s.nombre,s.telefono
        FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id
        WHERE (${estado}='todos' OR (${estado}='canceladas' AND r.cancelada IS NOT NULL) OR (${estado}='proximas' AND r.cancelada IS NULL AND r.termina>now()))
        AND (s.nombre ILIKE ${busqueda} OR s.telefono ILIKE ${busqueda} OR r.zona ILIKE ${busqueda})
        AND (${fecha}='' OR (r.cuando AT TIME ZONE 'America/Managua')::date::text=${fecha})
      ), pagina AS (SELECT * FROM filtradas ORDER BY cuando,id LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY cuando,id) FROM pagina p),'[]'::jsonb) AS filas`
    } else if (tipo === 'atencion') {
      ;[resultado] = await sql`WITH filtradas AS (
        SELECT a.id,a.categoria,a.mensaje,a.creada,a.estado,a.respuesta,a.resuelta,s.nombre
        FROM operativo_solicitud_atencion a JOIN operativo_socio s ON s.id=a.socio_id
        WHERE (${estado}='todos' OR a.estado=${estado}) AND (s.nombre ILIKE ${busqueda} OR a.mensaje ILIKE ${busqueda})
          AND (${['propietario','encargado'].includes(permiso)} OR a.categoria='compra')
      ), pagina AS (SELECT * FROM filtradas ORDER BY creada DESC,id DESC LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY creada DESC,id DESC) FROM pagina p),'[]'::jsonb) AS filas`
    } else if (tipo === 'equipo') {
      ;[resultado] = await sql`WITH filtradas AS (
        SELECT id,nombre,usuario,permiso,activo,version_clave,requiere_cambio,clave_temporal_vence FROM empleado
        WHERE (${estado}='todos' OR (${estado}='activos' AND activo) OR (${estado}='desactivados' AND NOT activo))
        AND (nombre ILIKE ${busqueda} OR usuario ILIKE ${busqueda})
      ), pagina AS (SELECT * FROM filtradas ORDER BY nombre,id LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY nombre,id) FROM pagina p),'[]'::jsonb) AS filas`
    } else {
      ;[resultado] = await sql`WITH filtradas AS (
        SELECT a.id,a.cuando,a.accion,COALESCE(e.nombre,a.quien) AS responsable,s.nombre AS cliente,a.detalle
        FROM operativo_auditoria a LEFT JOIN empleado e ON e.id::text=a.quien LEFT JOIN operativo_socio s ON s.id=a.socio_id
        WHERE (a.accion ILIKE ${busqueda} OR COALESCE(e.nombre,a.quien) ILIKE ${busqueda} OR s.nombre ILIKE ${busqueda})
        AND (${fecha}='' OR (a.cuando AT TIME ZONE 'America/Managua')::date::text=${fecha})
      ), pagina AS (SELECT * FROM filtradas ORDER BY cuando DESC,id DESC LIMIT 20 OFFSET ${offset})
      SELECT (SELECT count(*)::int FROM filtradas) AS total,COALESCE((SELECT jsonb_agg(p ORDER BY cuando DESC,id DESC) FROM pagina p),'[]'::jsonb) AS filas`
    }
    if (permiso === 'cocina' && tipo === 'pedidos') resultado = { ...resultado, filas: resultado.filas.map(pedidoParaCocina) }
    return c.json({ ...resultado, pagina, tamano: 20, actualizado: new Date().toISOString() })
  })

  app.get('/api/operacion/resumen', async c => {
    if (c.get('sesion').rol !== 'casa' || (c.get('permiso') && !['propietario','encargado'].includes(c.get('permiso')))) return c.json({ error: 'Acceso exclusivo del encargado.' }, 403)
    const sql = neon(c.env.DATABASE_URL)
    const [r] = await sql`SELECT
      (SELECT count(*)::int FROM operativo_pedido WHERE estado NOT IN ('entregado','cancelado')) AS pedidos,
      (SELECT count(*)::int FROM operativo_pedido WHERE estado='recibido') AS nuevos,
      (SELECT count(*)::int FROM operativo_compra_bolsa WHERE estado IN ('pagada','lista')) + (SELECT count(*)::int FROM operativo_asiento_experiencia a JOIN experiencia e ON e.id=a.experiencia_id WHERE a.asistencia IS NULL AND a.reembolsada IS NULL AND e.cancelada IS NULL) AS entregas,
      (SELECT count(*)::int FROM operativo_solicitud_atencion WHERE estado='pendiente') AS solicitudes,
      (SELECT count(*)::int FROM operativo_reserva WHERE cancelada IS NULL AND (cuando AT TIME ZONE 'America/Managua')::date=(now() AT TIME ZONE 'America/Managua')::date) AS mesas,
      (SELECT COALESCE(sum(total),0)::bigint FROM operativo_pedido WHERE estado<>'cancelado' AND (creado AT TIME ZONE 'America/Managua')::date=(now() AT TIME ZONE 'America/Managua')::date) AS importe`
    const membresias = await plazasOcupadas(c.env.DATABASE_URL)
    return c.json({ ...r, membresiasVivas: membresias.n, bajasAnunciadas: membresias.salen, actualizado: new Date().toISOString() })
  })
}
