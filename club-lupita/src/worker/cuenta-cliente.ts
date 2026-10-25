import type { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { neon } from '@neondatabase/serverless'
import type { Env, Vars } from './index'
import { camposPerfil, erroresPerfil, normalizarPerfil, type PerfilEditable } from '../compartido/perfil'
import { transaccion } from './operacion'
import { digest } from './equipo-sesion'
import { EVENTOS_PERFIL, MAXIMO_TIEMPO_PERFIL } from '../compartido/metricas-perfil'

export const columnasPerfil = `id,telefono,correo,correo_verificado,creado,perfil_version AS version,nombre,
  coalesce(bebida_siempre,'') AS bebida_siempre,coalesce(alergias,'') AS alergias,
  coalesce(cumple_mes_dia,to_char(cumple,'MM-DD'),'') AS cumple,promociones_correo`

/** Autogestión de la cuenta: identidad firmada, campos permitidos y datos acotados. */
export function registrarCuentaCliente(app: Hono<{ Bindings: Env; Variables: Vars }>) {
  app.post('/api/metricas-perfil', bodyLimit({ maxSize: 512, onError: c => c.json({ error: 'Medición demasiado larga.' }, 413) }), async c => {
    if (c.get('sesion').rol !== 'socio') return c.json({ error: 'Entrá con tu cuenta.' }, 403)
    const r = await c.req.json().catch(() => null)
    if (!r || typeof r !== 'object' || Array.isArray(r) || Object.keys(r).some(k => !['evento', 'duracion', 'dispositivo'].includes(k))
      || !EVENTOS_PERFIL.includes(r.evento) || !Number.isInteger(r.duracion) || r.duracion < 0 || r.duracion > MAXIMO_TIEMPO_PERFIL
      || !['movil', 'tableta', 'escritorio'].includes(r.dispositivo)) return c.json({ error: 'Medición inválida.' }, 422)
    if (c.req.header('DNT') === '1' || c.req.header('Sec-GPC') === '1') return c.json({ registrado: false })
    const sql = neon(c.env.DATABASE_URL), clave = await digest('perfil-metrica:' + c.get('sesion').tel)
    const [limite] = await sql`SELECT limitar_acceso(${clave},60,60) AS ok`
    if (!limite.ok) return c.json({ error: 'Límite de medición.' }, 429)
    console.info(JSON.stringify({ evento: 'perfil_cliente', resultado: r.evento, duracion_ms: r.duracion, dispositivo: r.dispositivo }))
    return c.json({ registrado: true })
  })
  app.use('/api/perfil', async (c, next) => {
    const solicitud = crypto.randomUUID(), inicio = performance.now()
    c.set('perfilSolicitud', solicitud); c.header('X-Perfil-Solicitud', solicitud)
    try { await next() }
    finally { console.info(JSON.stringify({ evento: 'perfil', solicitud, operacion: c.req.method === 'GET' ? c.req.query('recuperacion') === '1' ? 'recuperacion' : 'lectura' : 'guardado', estado: c.res.status, duracion_ms: Math.max(0, Math.round(performance.now() - inicio)) })) }
  })
  app.get('/api/perfil', async c => {
    c.header('Cache-Control', 'no-store')
    const sesion = c.get('sesion')
    if (sesion.rol !== 'socio') return c.json({ error: 'Entrá con tu cuenta para ver tu perfil.' }, 403)
    const sql = neon(c.env.DATABASE_URL)
    const [perfil] = await sql`SELECT id,telefono,correo,correo_verificado,creado,perfil_version AS version,nombre,
      coalesce(bebida_siempre,'') AS bebida_siempre,coalesce(alergias,'') AS alergias,
      coalesce(cumple_mes_dia,to_char(cumple,'MM-DD'),'') AS cumple,promociones_correo
      FROM operativo_socio WHERE telefono=${sesion.tel} AND baja IS NULL`
    return perfil ? c.json({ perfil }) : c.json({ error: 'No encontramos una cuenta activa.' }, 404)
  })
  app.post('/api/perfil', bodyLimit({ maxSize: 4096, onError: c => c.json({ error: 'El perfil es demasiado largo.' }, 413) }), async c => {
    c.header('Cache-Control', 'no-store')
    const sesion = c.get('sesion')
    if (sesion.rol !== 'socio') return c.json({ error: 'Entrá con tu cuenta para editar tu perfil.' }, 403)
    const raw: unknown = await c.req.json().catch(() => null)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return c.json({ error: 'Revisá los datos del perfil.' }, 422)
    const datos = raw as Record<string, unknown>
    if (datos.version === undefined) return c.json({ error: 'Actualizá la aplicación antes de editar tu perfil.' }, 428)
    if (!Number.isSafeInteger(datos.version) || Number(datos.version) < 0
      || Object.keys(datos).some(k => ![...camposPerfil, 'version'].includes(k))
      || ['nombre', 'bebida_siempre', 'alergias', 'cumple'].some(k => typeof datos[k] !== 'string')
      || typeof datos.promociones_correo !== 'boolean') return c.json({ error: 'Revisá los campos del perfil.' }, 422)
    const valores = normalizarPerfil(datos as PerfilEditable)
    const errores = erroresPerfil(valores)
    if (Object.keys(errores).length) return c.json({ error: Object.values(errores)[0], campos: errores }, 422)
    // El bloqueo y la comparación ocurren en la misma transacción, también ante ediciones del equipo.
    return transaccion(c.env, async cli => {
      const { rows: [actual] } = await cli.query(`SELECT ${columnasPerfil} FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE`, [sesion.tel])
      if (!actual) return c.json({ error: 'No encontramos una cuenta activa.' }, 404)
      if (actual.version !== datos.version) return c.json({ error: 'Tu perfil cambió desde que abriste el editor. Revisá la versión guardada antes de continuar.' }, 409)
      const cambios = camposPerfil.filter(k => valores[k] !== actual[k])
      if (!cambios.length) return c.json({ guardado: true, perfil: actual, cambios: [] })
      const { rows: [perfil] } = await cli.query(`UPDATE operativo_socio SET nombre=$2,bebida_siempre=$3,alergias=$4,
        cumple_mes_dia=$5,cumple=CASE WHEN $6 THEN NULL ELSE cumple END,
        promociones_correo=$7,
        promociones_aceptadas=CASE WHEN $8 AND $7 THEN now() ELSE promociones_aceptadas END,
        promociones_version=CASE WHEN $8 THEN 'perfil-correo-v1' ELSE promociones_version END
        WHERE id=$1 RETURNING ${columnasPerfil}`,
        [actual.id, valores.nombre, valores.bebida_siempre || null, valores.alergias || null, valores.cumple || null,
          cambios.includes('cumple'), valores.promociones_correo, cambios.includes('promociones_correo')])
      await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES('socio','editar_perfil',$1,$2::jsonb)",
        [actual.id, JSON.stringify({ campos: cambios, version: perfil.version, solicitud: c.get('perfilSolicitud') })])
      return c.json({ guardado: true, perfil, cambios })
    })
  })

  app.get('/api/actividad', async c => {
    c.header('Cache-Control', 'no-store')
    const sesion = c.get('sesion')
    if (sesion.rol !== 'socio') return c.json({ error: 'Entrá con tu cuenta para ver tu actividad.' }, 403)
    const tipo = c.req.query('tipo') ?? 'todos'
    if (!['todos','dinero','puntos','sellos','canjes'].includes(tipo)) return c.json({ error: 'Elegí un filtro válido.' }, 422)
    let antes: string | null = null
    let clave: string | null = null
    const cursor = c.req.query('cursor')
    if (cursor) {
      try {
        if (cursor.length > 512) throw new Error('cursor')
        const v = JSON.parse(atob(cursor))
        if (!v || typeof v.fecha !== 'string' || typeof v.id !== 'string'
          || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(v.fecha)
          || v.fecha < '0001-01-01' || !Number.isFinite(Date.parse(v.fecha)) || new Date(v.fecha).toISOString().slice(0,19) !== v.fecha.slice(0,19)
          || !/^(dinero|puntos|sellos|canjes|beneficios):[a-f0-9-]{1,40}$/.test(v.id)) throw new Error('cursor')
        antes = v.fecha; clave = v.id
      } catch { return c.json({ error: 'No pudimos leer esa página. Volvé al inicio del historial.' }, 422) }
    }
    const sql = neon(c.env.DATABASE_URL)
    // Cursor compuesto: conserva microsegundos y desempata registros de la misma compra.
    const filas = await sql`
      WITH miembro AS (SELECT id FROM operativo_socio WHERE telefono=${sesion.tel} AND baja IS NULL), actividad AS (
        SELECT 'dinero:'||a.id AS id,'dinero' AS tipo,a.concepto,a.creado AS fecha,a.monto AS cantidad FROM operativo_asiento a JOIN miembro m ON m.id=a.socio_id
        UNION ALL
        SELECT 'puntos:'||p.id,'puntos',p.concepto,p.creado,p.puntos FROM operativo_punto p JOIN miembro m ON m.id=p.socio_id
        UNION ALL
        SELECT 'sellos:'||s.id,'sellos',s.motivo,s.puesto,1 FROM operativo_sello s JOIN operativo_tanda t ON t.id=s.tanda_id JOIN miembro m ON m.id=t.socio_id
        UNION ALL
        SELECT 'canjes:'||t.id,'canjes','Bebida de cortesía entregada',t.canjeada,1 FROM operativo_tanda t JOIN miembro m ON m.id=t.socio_id WHERE t.canjeada IS NOT NULL
        UNION ALL
        SELECT 'beneficios:'||b.id,'canjes',CASE b.clase WHEN 'bolsa_mes' THEN 'Uso registrado: bolsa del mes' ELSE 'Uso registrado: bebida del día' END,b.usado,1
        FROM operativo_beneficio_uso b JOIN operativo_membresia ms ON ms.id=b.membresia_id JOIN miembro m ON m.id=ms.socio_id
      ) SELECT id,tipo,concepto,to_char(fecha AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS creado,cantidad FROM actividad
      WHERE (${tipo}='todos' OR tipo=${tipo}) AND (${antes}::timestamptz IS NULL OR (fecha,id)<(${antes}::timestamptz,${clave}::text))
      ORDER BY fecha DESC,id DESC LIMIT 21`
    const movimientos = filas.slice(0,20)
    const ultimo = movimientos.at(-1)
    return c.json({ movimientos, siguiente: filas.length > 20 && ultimo ? btoa(JSON.stringify({ fecha: ultimo.creado, id: ultimo.id })) : null })
  })
}
