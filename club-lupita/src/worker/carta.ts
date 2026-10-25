import type { Hono } from 'hono'
import { neon, type Client } from '@neondatabase/serverless'
import type { Env, Vars, enTransaccion } from './index'
import { CARTA } from '../data/menu'
import { estadoHorario, intencionPedido, normalizarLineas, normalizarRestriccion, opcionesDe, valorarLineas,
  type ConfiguracionCarta, type CotizacionCarta, type LineaPedido, type RestriccionPedido } from '../compartido/carta'
import { transaccion } from './operacion'
import { digest, uuid } from './equipo-sesion'
import { CONTRATO_CLUB } from '../compartido/club'

const referenciaValida = (r: unknown): r is string => typeof r === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(r)
const fallo = (error: string, status = 422) => Response.json({ error }, { status })
function entrada(r: { lineas?: unknown; restriccion?: unknown; ref?: unknown }) {
  if (!referenciaValida(r.ref)) throw Error('Falta una referencia válida del pedido.')
  return { lineas: normalizarLineas(r.lineas), restriccion: normalizarRestriccion(r.restriccion), ref: r.ref }
}
async function configuracion(cli: Client, bloquear = false): Promise<{ config: ConfiguracionCarta; ahora: Date }> {
  const { rows: [r] } = await cli.query('SELECT valor,clock_timestamp() AS ahora FROM carta_configuracion WHERE id=true' + (bloquear ? ' FOR UPDATE' : ''))
  if (!r) throw Error('configuracion-carta-ausente')
  return { config: r.valor, ahora: new Date(r.ahora) }
}
async function comprobarRecepcion(cli: Client, config: ConfiguracionCarta, ahora: Date, lineas: LineaPedido[]) {
  const estado = estadoHorario(config, ahora)
  if (!estado.abierto) return estado.motivo
  for (const l of lineas) {
    const p = CARTA.find(p => p.id === l.id)
    if (!p) return 'Un producto ya no está en la carta. Revisá tu pedido.'
    if (config.agotados.includes(p.id) || config.categoriasPausadas.includes(p.categoria)) return `${p.nombre} no está disponible ahora. Revisá tu pedido.`
  }
  if (config.capacidad !== null) {
    const { rows: [n] } = await cli.query("SELECT count(*)::int AS n FROM operativo_pedido WHERE estado IN ('recibido','aceptado','preparando')")
    if (n.n >= config.capacidad) return 'La cocina alcanzó su capacidad de pedidos. Intentá más tarde o consultá en barra.'
  }
  return null
}
function contenido(lineas: LineaPedido[], restriccion: RestriccionPedido, config: ConfiguracionCarta, reposteria:string[] = []) {
  const valoradas = valorarLineas(lineas).map(l=>reposteria.includes(l.id)?{...l,precioAntes:l.precio,precio:Math.round((l.precio-l.opciones.reduce((n,o)=>n+o.suplemento,0))*(100-CONTRATO_CLUB.descuentoReposteria)/100)+l.opciones.reduce((n,o)=>n+o.suplemento,0),descuentoClub:CONTRATO_CLUB.descuentoReposteria}:l), subtotal = valoradas.reduce((n, l) => n + l.precio * l.cuanto, 0)
  return { lineas: valoradas, restriccion, subtotal, empaque: config.empaque, total: subtotal + config.empaque, minutos: config.minutos }
}
async function reposteriaDelSocio(cli:Client,socioId:string):Promise<string[]>{
  const {rows:[r]}=await cli.query("SELECT reposteria FROM club_config WHERE id=true AND EXISTS(SELECT 1 FROM operativo_membresia WHERE socio_id=$1 AND estado IN ('activa','en_gracia') AND hasta>now())",[socioId])
  return r?.reposteria??[]
}
function comparable(q: ReturnType<typeof contenido>) {
  // El plazo orientativo puede variar sin modificar el precio consentido.
  return JSON.stringify([q.lineas.map(l => [l.id, l.clave, l.nombre, l.precio, l.cuanto, l.opciones.map(o => [o.id, o.nombre, o.valor, o.suplemento])]), q.subtotal, q.empaque, q.total, q.restriccion?.texto ?? null])
}
function configuracionValida(v: unknown): v is ConfiguracionCarta {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const x = v as Record<string, unknown>, hora = (s: unknown): s is string => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)
  return Object.keys(x).length === 8 && Array.isArray(x.horario) && x.horario.length === 7
    && x.horario.every(h => h === null || h && typeof h === 'object' && hora(h.abre) && hora(h.cierra) && h.abre < h.cierra)
    && (x.pausaHasta === null || typeof x.pausaHasta === 'string' && Number.isFinite(Date.parse(x.pausaHasta)))
    && typeof x.motivoPausa === 'string' && x.motivoPausa.length <= 160
    && Array.isArray(x.agotados) && x.agotados.length <= CARTA.length && x.agotados.every(id => CARTA.some(p => p.id === id))
    && Array.isArray(x.categoriasPausadas) && x.categoriasPausadas.length <= 20 && x.categoriasPausadas.every(id => CARTA.some(p => p.categoria === id))
    && typeof x.empaque === 'number' && Number.isInteger(x.empaque) && x.empaque >= 0 && x.empaque <= 10000
    && (x.capacidad === null || typeof x.capacidad === 'number' && Number.isInteger(x.capacidad) && x.capacidad >= 1 && x.capacidad <= 500)
    && (x.minutos === null || typeof x.minutos === 'number' && Number.isInteger(x.minutos) && x.minutos >= 1 && x.minutos <= 180)
}

export function registrarCarta(app: Hono<{ Bindings: Env; Variables: Vars }>, cobrar: typeof enTransaccion) {
  app.get('/api/carta', async c => {
    const sql = neon(c.env.DATABASE_URL), [r] = await sql`SELECT valor,revision,clock_timestamp() AS ahora FROM carta_configuracion WHERE id=true`
    const config: ConfiguracionCarta = r.valor, ahora = new Date(r.ahora)
    const fichas = await sql`SELECT producto,porcion,componentes,foto_verificada,revisado FROM carta_ficha`
    return c.json({ platos: CARTA.map(p => { const f = fichas.find(f => f.producto === p.id); return { ...p, ...(f ? { informacion: { porcion: f.porcion, componentes: f.componentes, fotoVerificada: f.foto_verificada, revisado: f.revisado } } : {}), opciones: opcionesDe(p.id), disponible: !config.agotados.includes(p.id) && !config.categoriasPausadas.includes(p.categoria) } }),
      revision: r.revision, ahora: ahora.toISOString(), horario: config.horario, empaque: config.empaque, minutos: config.minutos, ...estadoHorario(config, ahora) })
  })
  app.post('/api/carta/cotizar', async c => {
    if (c.get('sesion').rol !== 'socio') return fallo('Entrá con tu cuenta para confirmar un pedido.', 403)
    let e: ReturnType<typeof entrada>
    try { e = entrada(await c.req.json()) } catch (error) { return fallo((error as Error).message) }
    return transaccion(c.env, async cli => {
      const { rows: [s] } = await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE', [c.get('sesion').tel])
      if (!s) return fallo('Cuenta no encontrada.', 404)
      const { rows: [recibo] } = await cli.query("SELECT respuesta FROM operativo_solicitud_compra WHERE socio_id=$1 AND referencia=$2", [s.id, 'pedido:' + e.ref])
      if (recibo) return fallo('Este pedido ya fue confirmado. Consultá su resultado antes de iniciar otro.', 409)
      const { rows: [limite] } = await cli.query('SELECT limitar_acceso($1,30,60) AS ok', ['cotizacion:' + s.id])
      if (!limite.ok) return fallo('Esperá un minuto antes de actualizar el presupuesto.', 429)
      const { config, ahora } = await configuracion(cli)
      const impedimento = await comprobarRecepcion(cli, config, ahora, e.lineas)
      if (impedimento) return fallo(impedimento, 409)
      let q: CotizacionCarta
      const reposteria=await reposteriaDelSocio(cli,s.id)
      try { q = { ...contenido(e.lineas, e.restriccion, config,reposteria), id: crypto.randomUUID(), referencia: e.ref, vence: new Date(ahora.getTime() + 10 * 60_000).toISOString() } }
      catch (error) { return fallo((error as Error).message) }
      const { rows } = await cli.query(`INSERT INTO carta_intento(socio_id,referencia,cotizacion_id,intencion,cotizacion,vence) VALUES($1,$2,$3,$4,$5::jsonb,$6)
        ON CONFLICT(socio_id,referencia) DO UPDATE SET cotizacion_id=EXCLUDED.cotizacion_id,intencion=EXCLUDED.intencion,cotizacion=EXCLUDED.cotizacion,vence=EXCLUDED.vence,actualizado=now()
        WHERE NOT carta_intento.cerrado RETURNING referencia`, [s.id, e.ref, q.id, intencionPedido(e.lineas, e.restriccion), JSON.stringify(q), q.vence])
      if (!rows.length) return fallo('Ese intento está cerrado. Iniciá un nuevo pedido.', 409)
      return c.json(q)
    })
  })
  app.get('/api/carta/intento/:ref', async c => {
    if (c.get('sesion').rol !== 'socio') return fallo('Entrá con tu cuenta.', 403)
    const ref = c.req.param('ref')
    if (!referenciaValida(ref)) return fallo('Referencia inválida.')
    // Bloquear igual que el cobro: un resultado no confirmado no se interpreta como ausencia mientras otra transacción escribe.
    return transaccion(c.env, async cli => {
      const { rows: [s] } = await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE', [c.get('sesion').tel])
      if (!s) return fallo('Cuenta no encontrada.', 404)
      const { rows: [recibo] } = await cli.query('SELECT respuesta FROM operativo_solicitud_compra WHERE socio_id=$1 AND referencia=$2 AND operacion=$3', [s.id, 'pedido:' + ref, 'pedido'])
      if (recibo) return c.json({ estado: 'confirmado', recibo: recibo.respuesta })
      const { rows: [intento] } = await cli.query('SELECT cotizacion,cerrado FROM carta_intento WHERE socio_id=$1 AND referencia=$2', [s.id, ref])
      return c.json({ estado: intento?.cerrado ? 'cerrado' : intento ? 'sin_cobro' : 'ausente', cotizacion: intento?.cerrado ? null : intento?.cotizacion ?? null })
    })
  })
  app.get('/api/carta/recuperacion', async c => {
    if (c.get('sesion').rol !== 'socio') return fallo('Entrá con tu cuenta.', 403)
    const sql = neon(c.env.DATABASE_URL)
    const intentos = await sql`SELECT i.referencia,i.creado,i.cotizacion->>'total' AS total,
      CASE WHEN EXISTS(SELECT 1 FROM operativo_solicitud_compra r WHERE r.socio_id=i.socio_id AND r.referencia='pedido:'||i.referencia) THEN 'confirmado' ELSE 'por_consultar' END AS estado
      FROM carta_intento i JOIN operativo_socio s ON s.id=i.socio_id WHERE s.telefono=${c.get('sesion').tel} AND NOT i.cerrado ORDER BY i.creado DESC LIMIT 20`
    return c.json({ intentos })
  })
  app.post('/api/carta/intento/:ref/cerrar', async c => {
    if (c.get('sesion').rol !== 'socio') return fallo('Entrá con tu cuenta.', 403)
    const ref = c.req.param('ref')
    if (!referenciaValida(ref)) return fallo('Referencia inválida.')
    return transaccion(c.env, async cli => {
      const { rows: [s] } = await cli.query('SELECT id FROM operativo_socio WHERE telefono=$1 AND baja IS NULL FOR UPDATE', [c.get('sesion').tel])
      if (!s) return fallo('Cuenta no encontrada.', 404)
      const { rows: [recibo] } = await cli.query('SELECT respuesta FROM operativo_solicitud_compra WHERE socio_id=$1 AND referencia=$2', [s.id, 'pedido:' + ref])
      if (recibo) return c.json({ estado: 'confirmado', recibo: recibo.respuesta })
      // La lápida también protege un intento histórico ausente de una petición retrasada.
      await cli.query(`INSERT INTO carta_intento(socio_id,referencia,intencion,cotizacion,vence,cerrado) VALUES($1,$2,'','{}',now(),true)
        ON CONFLICT(socio_id,referencia) DO UPDATE SET cerrado=true,actualizado=now()`, [s.id, ref])
      return c.json({ estado: 'cerrado' })
    })
  })
  // Esta ruta se registra antes de la caja de monto libre. Las compras de Carta siempre pasan por cotización.
  app.post('/api/cuenta/cobrar', async (c, next) => {
    const r = await c.req.json(), sesion = c.get('sesion')
    if (r.lineas === undefined && sesion.rol === 'casa') return next()
    if (sesion.rol !== 'socio') return fallo('Usá la cuenta del cliente para un pedido de Carta.', 403)
    let e: ReturnType<typeof entrada>
    try { e = entrada(r) } catch (error) { return fallo((error as Error).message) }
    const intencion = intencionPedido(e.lineas, e.restriccion)
    const coincide = (guardada: string) => {
      if (guardada === intencion) return true
      try {
        const antigua = JSON.parse(guardada)
        return antigua.version === undefined && e.restriccion === null && intencionPedido(normalizarLineas(antigua.lineas)) === intencion
      } catch { return false }
    }
    const resultado = await cobrar(c, sesion.tel, async (cli, socioId, saldo) => {
      const { rows: [intento] } = await cli.query('SELECT cotizacion,cotizacion_id,intencion,cerrado,vence FROM carta_intento WHERE socio_id=$1 AND referencia=$2', [socioId, e.ref])
      if (intento?.cerrado) return fallo('Este intento fue cerrado sin cobro. Iniciá un nuevo pedido.', 409)
      if (!uuid(r.cotizacionId) || !intento || intento.cotizacion_id !== r.cotizacionId || intento.intencion !== intencion) return fallo('Revisá y aceptá el total actualizado antes de pagar.', 409)
      const { config, ahora } = await configuracion(cli, true)
      if (Date.parse(intento.vence) <= ahora.getTime()) return fallo('La cotización venció. Actualizá el total antes de pagar.', 409)
      const impedimento = await comprobarRecepcion(cli, config, ahora, e.lineas)
      if (impedimento) return fallo(impedimento, 409)
      let actual: ReturnType<typeof contenido>
      const reposteria=await reposteriaDelSocio(cli,socioId)
      try { actual = contenido(e.lineas, e.restriccion, config,reposteria) } catch (error) { return fallo((error as Error).message, 409) }
      const q = intento.cotizacion as CotizacionCarta
      if (comparable(actual) !== comparable(q)) return fallo('El precio o las opciones cambiaron. Revisá el nuevo total antes de pagar.', 409)
      if (saldo < q.total) return fallo('El saldo no alcanza. Recargá en caja y actualizá tu saldo; conservamos el pedido.', 409)
      const { rows: [ritmo] } = await cli.query('SELECT count(*)::int AS n FROM operativo_pedido WHERE socio_id=$1 AND creado>now()-interval \'1 minute\'', [socioId])
      if (ritmo.n >= 3) return fallo('Recibimos varios pedidos seguidos. Esperá un minuto para enviar otro.', 429)
      const { rows: [pedido] } = await cli.query(`INSERT INTO pedido(socio_id,referencia,lineas,total,restriccion_confirmada,empaque,estimacion_minutos)
        VALUES($1,$2,$3::jsonb,$4,$5,$6,$7) RETURNING id,numero,estado`, [socioId, e.ref, JSON.stringify(q.lineas), q.total, e.restriccion?.texto ?? null, q.empaque, q.minutos])
      await cli.query("INSERT INTO pedido_evento(pedido_id,estado,quien) VALUES($1,'recibido','socio')", [pedido.id])
      await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3)', [socioId, 'pedido:' + pedido.id + ':recibido', `Recibimos tu pedido #${pedido.numero}. Seguí su preparación en Mis compras y reservas.`])
      const concepto = q.lineas.map(l => `${l.cuanto}× ${l.nombre}`).join(', ')
      return { monto: q.total, concepto: concepto.length <= 120 ? concepto : `Pedido de ${q.lineas.reduce((n, l) => n + l.cuanto, 0)} artículos`, ref: 'pedido:' + e.ref, datos: { pedido, cotizacion: q } }
    }, { referencia: 'pedido:' + e.ref, operacion: 'pedido', huella: intencion, coincide })
    console.info(JSON.stringify({ evento: 'carta_cobro', intento: await digest(e.ref), estado: resultado.status }))
    return resultado
  })
  app.get('/api/operacion/carta', async c => {
    if (c.get('sesion').rol !== 'casa' || !['propietario', 'encargado', 'cocina'].includes(c.get('permiso'))) return fallo('Acceso exclusivo de operación.', 403)
    const sql = neon(c.env.DATABASE_URL), [r] = await sql`SELECT valor,revision,actualizado,responsable FROM carta_configuracion WHERE id=true`
    return c.json(r)
  })
  app.post('/api/operacion/carta', async c => {
    if (c.get('sesion').rol !== 'casa' || !['propietario', 'encargado', 'cocina'].includes(c.get('permiso'))) return fallo('Acceso exclusivo de operación.', 403)
    const r = await c.req.json()
    if (!configuracionValida(r.valor) || !Number.isInteger(r.revision)) return fallo('Revisá horarios, disponibilidad y cargos.')
    return transaccion(c.env, async cli => {
      const { rows: [antes] } = await cli.query('SELECT valor,revision FROM carta_configuracion WHERE id=true FOR UPDATE')
      if (antes.revision !== r.revision) return fallo('Otra persona actualizó la Carta. Recargá antes de guardar.', 409)
      if (c.get('permiso') === 'cocina' && ['horario', 'empaque', 'capacidad'].some(k => JSON.stringify(antes.valor[k]) !== JSON.stringify(r.valor[k]))) return fallo('Los horarios, cargos y capacidad los define administración.', 403)
      const responsable = c.get('sesion').empleado ?? 'propietario'
      const { rows: [guardado] } = await cli.query('UPDATE carta_configuracion SET valor=$1::jsonb,revision=revision+1,actualizado=now(),responsable=$2 WHERE id=true RETURNING revision', [JSON.stringify(r.valor), responsable])
      await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'carta_configuracion',$2::jsonb)", [responsable, JSON.stringify({ anterior: antes.valor, valor: r.valor, revision: guardado.revision })])
      return c.json({ guardado: true, revision: guardado.revision })
    })
  })
}
