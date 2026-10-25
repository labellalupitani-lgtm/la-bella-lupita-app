import type { Hono } from 'hono'
import { neon } from '@neondatabase/serverless'
import type { Env, Vars } from './index'
import { CARTA } from '../data/menu'
import { transaccion } from './operacion'
export function registrarFichasCarta(app: Hono<{ Bindings: Env; Variables: Vars }>) {
  app.get('/api/operacion/carta/fichas', async c => {
    if (c.get('sesion').rol !== 'casa' || !['propietario', 'encargado', 'cocina'].includes(c.get('permiso'))) return c.json({ error: 'Acceso exclusivo de operación.' }, 403)
    const sql = neon(c.env.DATABASE_URL)
    return c.json({ fichas: await sql`SELECT * FROM carta_ficha ORDER BY producto` })
  })
  app.post('/api/operacion/carta/fichas/:id', async c => {
    if (c.get('sesion').rol !== 'casa' || !['propietario', 'encargado', 'cocina'].includes(c.get('permiso'))) return c.json({ error: 'Acceso exclusivo de operación.' }, 403)
    const producto = c.req.param('id'), r = await c.req.json()
    const texto = (v: unknown, n: number) => typeof v === 'string' && v.trim().length <= n && !/[\u0000-\u001f<>]/.test(v)
    if (!CARTA.some(p => p.id === producto) || !r || r.confirmada !== true || !Number.isInteger(r.revision) || r.revision < 0 || !texto(r.porcion, 120) || !texto(r.componentes, 600) || !texto(r.fuente, 200) || !r.fuente.trim() || typeof r.foto_verificada !== 'boolean') return c.json({ error: 'Revisá la ficha e indicá cómo se verificó con cocina.' }, 422)
    return transaccion(c.env, async cli => {
      // Serializa altas y revisiones, incluso la primera edición de un producto.
      await cli.query('SELECT id FROM carta_configuracion WHERE id=true FOR UPDATE')
      const { rows: [antes] } = await cli.query('SELECT * FROM carta_ficha WHERE producto=$1', [producto])
      if ((antes?.revision ?? 0) !== r.revision) return c.json({ error: 'La ficha cambió. Recargá y revisá antes de guardar.' }, 409)
      const responsable = c.get('sesion').empleado ?? 'propietario'
      const { rows: [ficha] } = await cli.query(`INSERT INTO carta_ficha(producto,porcion,componentes,fuente,foto_verificada,responsable) VALUES($1,$2,$3,$4,$5,$6)
        ON CONFLICT(producto) DO UPDATE SET porcion=EXCLUDED.porcion,componentes=EXCLUDED.componentes,fuente=EXCLUDED.fuente,foto_verificada=EXCLUDED.foto_verificada,responsable=EXCLUDED.responsable,revision=carta_ficha.revision+1,revisado=now() RETURNING *`, [producto,r.porcion.trim(),r.componentes.trim(),r.fuente.trim(),r.foto_verificada,responsable])
      await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'carta_ficha',$2::jsonb)", [responsable, JSON.stringify({ anterior: antes ?? null, ficha })])
      return c.json({ ficha })
    })
  })
}
