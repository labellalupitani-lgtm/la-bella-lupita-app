import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import type { Env, Vars } from './index'
import { digest } from './equipo-sesion'
import { EVENTOS_CARTA, METRICAS_CARTA } from '../compartido/metricas-carta'

export function registrarMetricasCarta(app: Hono<{ Bindings: Env; Variables: Vars }>) {
  app.get('/api/operacion/carta/referencia/:ref', async c => {
    if (c.get('sesion').rol !== 'casa' || !['propietario', 'encargado'].includes(c.get('permiso'))) return c.json({ error: 'Acceso exclusivo de administración.' }, 403)
    const ref = c.req.param('ref')
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(ref)) return c.json({ error: 'Referencia inválida.' }, 422)
    const sql = neon(c.env.DATABASE_URL)
    const intentos = await sql`SELECT i.creado,i.cerrado,p.numero,p.estado FROM carta_intento i JOIN operativo_socio s ON s.id=i.socio_id LEFT JOIN operativo_pedido p ON p.socio_id=i.socio_id AND p.referencia=i.referencia WHERE i.referencia=${ref} ORDER BY i.creado DESC LIMIT 20`
    return c.json({ referencia: ref, correlacion: await digest(ref), intentos })
  })
  for (const tipo of ['evento', 'rendimiento']) app.post('/api/carta/' + tipo, async c => {
    if (c.get('sesion').rol !== 'socio') return c.json({ error: 'Entrá con tu cuenta.' }, 403)
    const r = await c.req.json(), rendimiento = tipo === 'rendimiento'
    if (!r || typeof r !== 'object' || Object.keys(r).some(k => !(rendimiento ? ['metrica', 'valor', 'dispositivo'] : ['evento', 'dispositivo']).includes(k)) || !['movil', 'tableta', 'escritorio'].includes(r.dispositivo)) return c.json({ error: 'Medición inválida.' }, 422)
    const regla = METRICAS_CARTA[r.metrica as keyof typeof METRICAS_CARTA]
    if (rendimiento ? !regla || typeof r.valor !== 'number' || !Number.isFinite(r.valor) || r.valor < 0 || r.valor > regla.maximo : !EVENTOS_CARTA.includes(r.evento)) return c.json({ error: 'Medición inválida.' }, 422)
    const sql = neon(c.env.DATABASE_URL), clave = await digest('carta-metrica:' + c.get('sesion').tel)
    const [limite] = await sql`SELECT limitar_acceso(${clave},120,60) AS ok`
    if (!limite.ok) return c.json({ error: 'Límite de medición.' }, 429)
    if (rendimiento) {
      const cubeta = Math.ceil(r.valor / regla.paso)
      await sql`INSERT INTO carta_rendimiento(metrica,dispositivo,cubeta) VALUES(${r.metrica},${r.dispositivo},${cubeta}) ON CONFLICT(dia,metrica,dispositivo,cubeta) DO UPDATE SET cantidad=carta_rendimiento.cantidad+1`
    } else await sql`INSERT INTO carta_metrica(evento,dispositivo) VALUES(${r.evento},${r.dispositivo}) ON CONFLICT(dia,evento,dispositivo) DO UPDATE SET cantidad=carta_metrica.cantidad+1`
    return c.json({ registrado: true })
  })
  app.get('/api/operacion/metricas-carta', async c => {
    if (c.get('sesion').rol !== 'casa' || !['propietario', 'encargado'].includes(c.get('permiso'))) return c.json({ error: 'Acceso exclusivo de administración.' }, 403)
    const sql = neon(c.env.DATABASE_URL)
    const [eventos, cubetas, alertas] = await Promise.all([
      sql`SELECT evento,dispositivo,sum(cantidad)::int AS cantidad FROM carta_metrica WHERE dia>=(now() AT TIME ZONE 'America/Managua')::date-29 GROUP BY evento,dispositivo ORDER BY evento,dispositivo`,
      sql`SELECT metrica,dispositivo,cubeta,sum(cantidad)::int AS cantidad FROM carta_rendimiento WHERE dia>=(now() AT TIME ZONE 'America/Managua')::date-29 GROUP BY metrica,dispositivo,cubeta ORDER BY metrica,dispositivo,cubeta`,
      sql`SELECT numero,estado,creado,estimacion_minutos FROM operativo_pedido WHERE estado IN ('recibido','aceptado','preparando') AND estimacion_minutos IS NOT NULL AND creado<now()-estimacion_minutos*interval '1 minute' ORDER BY creado LIMIT 100`,
    ])
    const rendimiento = Object.entries(METRICAS_CARTA).flatMap(([metrica, regla]) => ['movil', 'tableta', 'escritorio'].flatMap(dispositivo => {
      const filas = cubetas.filter(r => r.metrica === metrica && r.dispositivo === dispositivo), n = filas.reduce((s, f) => s + Number(f.cantidad), 0)
      if (!n) return []
      let acumulado = 0
      const f = filas.find(f => (acumulado += Number(f.cantidad)) >= Math.ceil(n * .75))!
      return [{ metrica, dispositivo, muestras: n, p75_hasta: Number((Number(f.cubeta) * regla.paso).toFixed(2)), precision: regla.paso, objetivo: regla.bueno }]
    }))
    return c.json({ dias: 30, eventos, rendimiento, alertas })
  })
}
