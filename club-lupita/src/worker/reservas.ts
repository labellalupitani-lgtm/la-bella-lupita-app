import type { Hono, Context } from 'hono'
import { neon, type Client } from '@neondatabase/serverless'
import type { Env, Vars, enTransaccion } from './index'
import { transaccion } from './operacion'
import { digest } from './equipo-sesion'
import { procesarCorreosReservas } from './reservas-correo'
import { CONFIGURACION_RESERVAS, configuracionReservasValida, diaReserva, errorFechaReserva, fechaReserva, horarioReserva, zonaCerrada, type ConfiguracionReservas, type ZonaReserva } from '../compartido/reservas'

type C = Context<{ Bindings: Env; Variables: Vars }>
const uuid = (s: string) => /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(s)
const equipo = (c: C) => c.get('sesion').rol === 'casa' && ['propietario', 'encargado', 'caja'].includes(c.get('permiso') ?? '')
const administra = (c: C) => equipo(c) && ['propietario', 'encargado'].includes(c.get('permiso') ?? '')
const campos = 'id,zona,cuando,termina,personas,deposito,estado,version,cancelada,mesas,politica,anticipo_aplicado,anticipo_devuelto,referencia'
const bloqueo = (cli: Client) => cli.query("SELECT pg_advisory_xact_lock(hashtext('reservas-inventario'))")
async function configuracion(cli: Client): Promise<ConfiguracionReservas> {
  const { rows: [r] } = await cli.query('SELECT datos,version FROM reserva_config WHERE id=true')
  return r ? { cierres: [], ...r.datos, version: r.version } : structuredClone(CONFIGURACION_RESERVAS)
}
export async function leerConfiguracionReservas(env: Env) {
  const sql=neon(env.DATABASE_URL), [r]=await sql`SELECT datos,version FROM reserva_config WHERE id=true`
  return r ? { cierres: [], ...r.datos, version:r.version } as ConfiguracionReservas : structuredClone(CONFIGURACION_RESERVAS)
}
async function medir(cli: Client, evento: string) { await cli.query('INSERT INTO reserva_metrica(evento,cantidad) VALUES($1,1) ON CONFLICT(dia,evento) DO UPDATE SET cantidad=reserva_metrica.cantidad+1', [evento]) }

// Siempre dentro de la transacción que bloquea al titular y a la reserva.
// La devolución completa restaura el origen pagado/bono y revierte sus puntos.
async function liberarAnticipo(cli: Client, actual: { id: string; socio_id: string; version: number; anticipo_pendiente_ref: string | null }, pendiente: number, quien: string, motivo: string | null) {
  const origen = actual.anticipo_pendiente_ref ?? 'dep:' + actual.id
  const referencia = 'reserva-anticipo:' + actual.id + (actual.anticipo_pendiente_ref ? ':' + actual.version : '')
  const { rows } = await cli.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa,quien,nota,devolucion_de) SELECT $1,$2,'ajuste','Resolución de anticipo VIP',$3,$4,$5,id FROM operativo_asiento WHERE socio_id=$1 AND ref_externa=$6 AND monto=-$2::integer RETURNING id", [actual.socio_id, pendiente, referencia, quien, motivo, origen])
  if (rows.length !== 1) throw new Error('No se verificó el anticipo original')
  await cli.query("INSERT INTO punto(socio_id,puntos,motivo,origen_id,concepto) SELECT $1,-p.puntos,'ajuste',$2,'Resolución de anticipo de reserva' FROM operativo_punto p JOIN operativo_asiento a ON p.origen_id=a.id::text WHERE a.socio_id=$1 AND a.ref_externa=$3 AND p.motivo='consumo' ON CONFLICT DO NOTHING", [actual.socio_id, referencia, origen])
}
type Ocupada = { mesas: string[]; cuando: Date | string; termina: Date | string }
function asignar(z: ZonaReserva, personas: number, ocupadas: Ocupada[], inicio: number, fin: number) {
  const solapadas = ocupadas.filter(r => +new Date(r.cuando) < fin && +new Date(r.termina) > inicio)
  if (z.id === 'vip' && solapadas.length) return null // El salón conserva su exclusividad por visita.
  // Una reserva histórica sin asignación bloquea la zona: no adivinamos su mesa.
  if (solapadas.some(r => !r.mesas.length)) return null
  const usadas = new Set(solapadas.flatMap(r => r.mesas))
  const opciones = [...z.mesas.map(m => [m.id]), ...z.combinaciones].map(ids => ({ ids, plazas: ids.reduce((n, id) => n + (z.mesas.find(m => m.id === id)?.plazas ?? 0), 0) }))
  return opciones.filter(o => o.plazas >= personas && o.ids.every(id => !usadas.has(id))).sort((a, b) => a.plazas - b.plazas || a.ids.length - b.ids.length || a.ids.join().localeCompare(b.ids.join(), 'en', { numeric: true }))[0]?.ids ?? null
}
async function disponibilidad(cli: Client, z: ZonaReserva, personas: number, inicio: string, fin: string, excluir: string | null = null) {
  const { rows } = await cli.query("SELECT mesas,cuando,termina FROM operativo_reserva WHERE zona=$1 AND cancelada IS NULL AND estado IN ('confirmada','llego','sentada') AND cuando<$3 AND termina>$2 AND ($4::uuid IS NULL OR id<>$4)", [z.id, inicio, fin, excluir])
  return asignar(z, personas, rows, Date.parse(inicio), Date.parse(fin))
}
async function evento(cli: Client, id: string, version: number, socio: string, accion: string, quien: string, motivo: string | null = null) {
  await cli.query('INSERT INTO reserva_evento(reserva_id,version,accion,quien,motivo) VALUES($1,$2,$3,$4,$5)', [id, version, accion, quien, motivo])
  await cli.query('INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,$2,$3,$4::jsonb)', [quien, 'reserva_' + accion, socio, JSON.stringify({ reserva: id, version, motivo })])
  await cli.query('INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [socio, `reserva:${id}:${version}`, `Reserva ${id.slice(0, 8)}: ${accion.replaceAll('_', ' ')}. Consultá los detalles en Mis reservas.`])
  await cli.query('INSERT INTO reserva_correo(reserva_id,version,tipo) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [id, version, accion])
}

export function registrarReservas(app: Hono<{ Bindings: Env; Variables: Vars }>, comprar: typeof enTransaccion) {
  async function avisar(c: C, resultado: Promise<Response>) { const r = await resultado; if (r.ok && c.env.RESERVAS_CORREO === 'true') c.executionCtx.waitUntil(procesarCorreosReservas(c.env)); return r }
  app.get('/api/reservas/configuracion', async c => c.json(await leerConfiguracionReservas(c.env)))
  app.post('/api/reservas/evento', async c => {
    if (c.get('sesion').rol !== 'socio') return c.json({ error: 'Entrá con tu cuenta.' }, 403)
    const r = await c.req.json()
    if (Object.keys(r).some(k => !['evento', 'referencia'].includes(k)) || !['consulta', 'fecha_grupo', 'revision', 'conflicto', 'sin_saldo', 'borrador_recuperado', 'resultado_incierto'].includes(r.evento) || !uuid(r.referencia ?? '')) return c.json({ error: 'Medición inválida.' }, 422)
    const sql = neon(c.env.DATABASE_URL), clave = await digest('reserva-metrica:' + c.get('sesion').tel)
    const [limite] = await sql`SELECT limitar_acceso(${clave},30,60) AS ok`
    if (!limite.ok) return c.json({ error: 'Límite de medición.' }, 429)
    await sql`WITH nuevo AS (INSERT INTO reserva_metrica_intento(referencia,evento) VALUES(${r.referencia},${r.evento}) ON CONFLICT DO NOTHING RETURNING evento) INSERT INTO reserva_metrica(evento,cantidad) SELECT evento,1 FROM nuevo ON CONFLICT(dia,evento) DO UPDATE SET cantidad=reserva_metrica.cantidad+1`
    return c.json({ registrado: true })
  })

  async function consultarDisponibilidad(c: C, excluir: string | null = null) {
    const dia = c.req.query('dia'), personas = Number(c.req.query('personas')), horas = Number(c.req.query('horas'))
    if (!fechaReserva(dia) || !Number.isInteger(personas) || personas < 1 || personas > 12 || !Number.isInteger(horas) || horas < 1 || horas > 6) return c.json({ error: 'Revisá fecha, personas y duración.' }, 422)
    return transaccion(c.env, async cli => {
      if (excluir) {
        if (!uuid(excluir) || c.get('sesion').rol !== 'socio') return c.json({ error: 'Reserva no encontrada.' }, 404)
        const {rows:[propia]}=await cli.query('SELECT r.id FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.id=$1 AND s.telefono=$2',[excluir,c.get('sesion').tel])
        if (!propia) return c.json({error:'Reserva no encontrada.'},404)
      }
      const cfg = await configuracion(cli)
      if (dia < diaReserva() || dia > diaReserva(cfg.dias)) return c.json({ error: 'Esa fecha está fuera de la agenda.' }, 422)
      const inicioDia = `${dia}T00:00:00-06:00`, finDia = new Date(Date.parse(inicioDia) + 86400000).toISOString()
      const { rows } = await cli.query("SELECT zona,mesas,cuando,termina FROM operativo_reserva WHERE cancelada IS NULL AND estado IN ('confirmada','llego','sentada') AND cuando<$2 AND termina>$1 AND ($3::uuid IS NULL OR id<>$3)", [inicioDia, finDia, excluir])
      const horario = horarioReserva(cfg, dia), zonas: Record<string, { configurada: boolean; horas: number[] }> = {}
      for (const z of cfg.zonas) {
        const configurada = z.mesas.length > 0 && (z.id !== 'vip' || !!cfg.politica.cancelacion.trim() && !!cfg.politica.inasistencia.trim())
        const libres: number[] = []
        if (configurada && !horario.cerrada) for (let h = horario.abre; h + horas <= horario.cierra; h++) {
          const cuando = `${dia}T${String(h).padStart(2, '0')}:00:00-06:00`, inicio = Date.parse(cuando)
          if (!errorFechaReserva(cfg, cuando, horas, personas) && !zonaCerrada(cfg,z.id,cuando,horas) && asignar(z, personas, rows.filter(r => r.zona === z.id), inicio, inicio + horas * 3600000)) libres.push(h)
        }
        zonas[z.id] = { configurada, horas: libres }
      }
      return c.json({ dia, version: cfg.version, actualizado: new Date().toISOString(), zonas })
    })
  }
  app.get('/api/reservas/disponibilidad', c => consultarDisponibilidad(c))
  app.get('/api/reservas/:id/disponibilidad', c => consultarDisponibilidad(c, c.req.param('id')))

  async function crear(c: C, manual = false) {
    if (manual ? !equipo(c) : c.get('sesion').rol !== 'socio') return c.json({ error: 'Ingresá con el acceso correspondiente.' }, 403)
    const r = await c.req.json().catch(() => null)
    if (!r || typeof r.zona !== 'string' || typeof r.cuando !== 'string' || !Number.isInteger(r.personas) || !Number.isInteger(r.horas ?? 2)) return c.json({ error: 'Revisá los datos de tu reserva.' }, 422)
    const intencion = { zona: r.zona, cuando: r.cuando, personas: r.personas, horas: r.horas ?? 2 }
    // Compatibilidad con clientes anteriores: la huella incluye todos los campos.
    const huella = JSON.stringify(intencion)
    const legado = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(huella))), b => b.toString(16).padStart(2, '0')).join('')
    const ref = r.referencia ?? 'anterior-' + legado
    if (typeof ref !== 'string' || !/^[A-Za-z0-9_-]{8,96}$/.test(ref)) return c.json({ error: 'La referencia del intento no es válida.' }, 422)
    const telefono = manual ? r.telefono : c.get('sesion').tel
    if (typeof telefono !== 'string' || !/^\d{8,15}$/.test(telefono)) return c.json({ error: 'Elegí una cuenta existente para registrar la reserva.' }, 422)
    if (manual && (typeof r.motivo !== 'string' || r.motivo.trim().length < 5 || r.motivo.length > 500)) return c.json({ error: 'Registrá el origen y motivo de la reserva manual.' }, 422)
    return comprar(c, telefono, async (cli, socio, saldo) => {
      const { rows: [previa] } = await cli.query(`SELECT ${campos},intencion FROM operativo_reserva WHERE socio_id=$1 AND referencia=$2`, [socio, ref])
      if (previa) {
        if (JSON.stringify(previa.intencion) !== JSON.stringify(JSON.parse(huella)) && Object.entries(intencion).some(([k, v]) => previa.intencion?.[k] !== v)) return c.json({ error: 'Esa referencia corresponde a otra visita. Revisá el comprobante antes de cambiarla.' }, 409)
        const { intencion: _original, ...reserva } = previa
        return { monto: 0, concepto: '', ref: '', datos: { reserva, yaEstaba: true } }
      }
      await bloqueo(cli)
      const cfg = await configuracion(cli), z = cfg.zonas.find(z => z.id === r.zona)
      const error = errorFechaReserva(cfg, r.cuando, intencion.horas, r.personas)
      if (error) return c.json({ error }, 422)
      if (!z) return c.json({ error: 'Esa zona no existe.' }, 422)
      if (zonaCerrada(cfg,z.id,r.cuando,intencion.horas)) return c.json({error:'Esa zona está cerrada en el horario elegido. Consultá otra zona u hora.'},409)
      if (!z.mesas.length) return c.json({ error: 'La capacidad de esta zona todavía está por confirmar. Coordiná tu visita con la casa.' }, 409)
      if (r.zona === 'vip' && (!cfg.politica.cancelacion.trim() || !cfg.politica.inasistencia.trim())) return c.json({ error: 'La casa está definiendo las condiciones del anticipo VIP. Consultá antes de reservar.' }, 409)
      if (r.zona === 'vip' && (r.configuracion === undefined || manual && r.autorizacionVip !== true)) return c.json({ error: 'Revisá las condiciones vigentes del anticipo y verificá la autorización del titular antes de confirmar.' }, 422)
      if (r.configuracion !== undefined && r.configuracion !== cfg.version) return c.json({ error: 'Las condiciones cambiaron. Actualizá y revisá tu reserva.' }, 409)
      const inicio = new Date(r.cuando).toISOString(), fin = new Date(Date.parse(inicio) + intencion.horas * 3600000).toISOString()
      const { rows: [limites] } = await cli.query("SELECT count(*) FILTER(WHERE termina>now())::int AS activas,count(*) FILTER(WHERE cuando<$3 AND termina>$2)::int AS solapes FROM operativo_reserva WHERE socio_id=$1 AND cancelada IS NULL AND estado IN ('confirmada','llego','sentada')", [socio, inicio, fin])
      const excepcion = manual && administra(c) && r.excepcionGrupo === true
      if(manual && r.excepcionGrupo === true && !administra(c))return c.json({error:'La excepción de grupo requiere administración.'},403)
      if (!excepcion && (limites.solapes > 0 || limites.activas >= cfg.maxActivas)) return c.json({ error: limites.solapes ? 'Ya tenés una reserva que coincide con esta visita. Podés cambiarla desde Mis reservas.' : `Podés mantener hasta ${cfg.maxActivas} reservas activas. Gestioná las existentes antes de agregar otra.` }, 409)
      const { rows: [ritmo] } = await cli.query("SELECT count(*)::int AS n FROM operativo_reserva WHERE socio_id=$1 AND creada>now()-interval '1 hour'", [socio])
      if (ritmo.n >= 10) return c.json({ error: 'Registraste varios intentos. Esperá antes de reservar otra vez.' }, 429)
      const mesas = await disponibilidad(cli, z, r.personas, inicio, fin)
      if (!mesas) return c.json({ error: 'Ese horario ya no tiene una mesa adecuada para tu grupo. Consultá otras horas.' }, 409)
      const deposito = r.zona === 'vip' ? cfg.politica.importe : 0
      if (saldo < deposito) return c.json({ error: 'Tu saldo no alcanza para el anticipo. El borrador se conserva; la recarga se realiza en caja.' }, 409)
      const { rows: [reserva] } = await cli.query(`INSERT INTO reserva(socio_id,zona,cuando,termina,personas,deposito,referencia,intencion,mesas,politica) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10::jsonb) RETURNING ${campos}`, [socio, r.zona, inicio, fin, r.personas, deposito, ref, huella, mesas, deposito ? JSON.stringify(cfg.politica) : null])
      await evento(cli, reserva.id, 1, socio, 'confirmada', manual ? c.get('sesion').empleado ?? 'personal' : 'socio', manual ? (excepcion ? 'Excepción de grupo autorizada: ' : '') + r.motivo : null)
      await medir(cli, 'confirmada')
      await cli.query("INSERT INTO reserva_correo(reserva_id,version,tipo,disponible) VALUES($1,1,'recordatorio',GREATEST(now(),$2::timestamptz-interval '24 hours')) ON CONFLICT DO NOTHING", [reserva.id, inicio])
      // Apartar saldo no es consumo: los puntos se ganan al registrar el consumo real.
      return { monto: deposito, tipo: 'deposito' as const, concepto: 'Anticipo aplicable al consumo · Salón VIP', ref: 'dep:' + reserva.id, datos: { reserva, yaEstaba: false } }
    })
  }
  app.post('/api/reserva', c => avisar(c, crear(c)))
  app.post('/api/operacion/reservas', c => avisar(c, crear(c, true)))

  app.get('/api/reservas/intento/:referencia', async c => {
    if (c.get('sesion').rol !== 'socio') return c.json({ error: 'Entrá con tu cuenta.' }, 403)
    const sql = neon(c.env.DATABASE_URL)
    const [r] = await sql`SELECT r.* FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id WHERE s.telefono=${c.get('sesion').tel} AND r.referencia=${c.req.param('referencia')}`
    if (!r) return c.json({ error: 'Todavía no hay una reserva registrada con esa referencia.' }, 404)
    return c.json({ reserva: publico(r), yaEstaba: true, cobrado: 0 })
  })
  app.get('/api/reservas/mias', async c => {
    if (c.get('sesion').rol !== 'socio') return c.json({ error: 'Entrá con tu cuenta.' }, 403)
    const sql = neon(c.env.DATABASE_URL)
    const filas = await sql`SELECT r.* FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id WHERE s.telefono=${c.get('sesion').tel} ORDER BY cuando DESC LIMIT 100`
    return c.json({ reservas: filas.map(publico) })
  })

  async function cambiar(c: C, accionFija?: string) {
    const personal = equipo(c), id = c.req.param('id') ?? '', r = await c.req.json().catch(() => null), accion = accionFija ?? r?.accion
    if (!uuid(id) || !r) return c.json({ error: 'Reserva no encontrada.' }, 404)
    if (!personal && c.get('sesion').rol !== 'socio') return c.json({ error: 'Entrá con tu cuenta.' }, 403)
    if (!personal && !['cancelar', 'cambiar'].includes(accion)) return c.json({ error: 'Esta operación la registra el personal.' }, 403)
    if (personal && (typeof r.motivo !== 'string' || r.motivo.trim().length < 5 || r.motivo.length > 500)) return c.json({ error: 'Registrá un motivo de 5 a 500 caracteres.' }, 422)
    return transaccion(c.env, async cli => {
      const { rows: [dueno] } = await cli.query('SELECT s.id,s.telefono FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.id=$1', [id])
      if (!dueno || !personal && dueno.telefono !== c.get('sesion').tel) return c.json({ error: 'Reserva no encontrada.' }, 404)
      await cli.query('SELECT id FROM operativo_socio WHERE id=$1 FOR UPDATE', [dueno.id])
      await bloqueo(cli)
      const { rows: [actual] } = await cli.query('SELECT * FROM operativo_reserva WHERE id=$1 FOR UPDATE', [id])
      const pendienteActual = actual.deposito - actual.anticipo_aplicado - actual.anticipo_devuelto
      if ((accion === 'cancelar' && actual.estado === 'cancelada' || personal && accion === 'no_asistio' && actual.estado === 'no_asistio') && pendienteActual === 0) return c.json({ reserva: publico(actual), cancelada: actual.estado === 'cancelada', repetido: true })
      if (r.version !== actual.version) return c.json({ error: 'La reserva cambió. Actualizá su comprobante antes de continuar.' }, 409)
      const quien = personal ? c.get('sesion').empleado ?? 'personal' : 'socio'
      let estado = actual.estado
      if (accion === 'cambiar') {
        if (!['confirmada'].includes(actual.estado) || +new Date(actual.cuando) <= Date.now()) return c.json({ error: 'Esta visita ya comenzó o terminó. Consultá con la casa.' }, 409)
        const cfg = await configuracion(cli), error = errorFechaReserva(cfg, r.cuando, r.horas, r.personas)
        if (error) return c.json({ error }, 422)
        // El cambio de zona conlleva otro contrato financiero; no se hace implícitamente.
        const z = cfg.zonas.find(z => z.id === actual.zona)!, inicio = new Date(r.cuando).toISOString(), fin = new Date(Date.parse(inicio) + r.horas * 3600000).toISOString()
        if(zonaCerrada(cfg,z.id,inicio,r.horas))return c.json({error:'La zona está cerrada en ese horario. Tu reserva original sigue vigente.'},409)
        const { rows: [solape] } = await cli.query("SELECT count(*)::int AS n FROM operativo_reserva WHERE socio_id=$1 AND id<>$2 AND cancelada IS NULL AND estado IN ('confirmada','llego','sentada') AND cuando<$4 AND termina>$3", [dueno.id, id, inicio, fin])
        if (solape.n) return c.json({ error: 'La nueva visita coincide con otra reserva de tu cuenta.' }, 409)
        const mesas = await disponibilidad(cli, z, r.personas, inicio, fin, id)
        if (!mesas) return c.json({ error: 'No hay una mesa adecuada a esa hora. Tu reserva original sigue vigente.' }, 409)
        await cli.query('UPDATE operativo_reserva SET cuando=$2,termina=$3,personas=$4,mesas=$5 WHERE id=$1', [id, inicio, fin, r.personas, mesas])
      } else if (accion === 'cancelar') {
        if (!['confirmada', 'llego', 'cancelada'].includes(estado)) return c.json({ error: 'Esta visita ya fue atendida o cerrada. Consultá con la casa.' }, 409)
        estado = 'cancelada'
        await cli.query('UPDATE operativo_reserva SET cancelada=COALESCE(cancelada,now()) WHERE id=$1', [id])
      } else if (['llego', 'sentada', 'finalizada', 'no_asistio'].includes(accion)) {
        const pasos: Record<string, string[]> = { confirmada: ['llego', 'no_asistio'], llego: ['sentada'], sentada: ['finalizada'], no_asistio: ['no_asistio'] }
        if (!pasos[estado]?.includes(accion) || Date.now() < +new Date(actual.cuando) - 3600000 || accion === 'no_asistio' && Date.now() < +new Date(actual.termina)) return c.json({ error: 'Ese estado no corresponde a esta visita o a su horario.' }, 409)
        estado = accion
      } else if (accion === 'devolver' || accion === 'aplicar') {
        if (!administra(c) && accion === 'devolver') return c.json({ error: 'La devolución requiere administración.' }, 403)
        const pendiente = actual.deposito - actual.anticipo_aplicado - actual.anticipo_devuelto
        if (pendiente <= 0) return c.json({ error: 'El anticipo ya está resuelto o esta reserva no lo tiene.' }, 409)
        let aplicado = 0, consumo = 0
        if (accion === 'aplicar') {
          if (!['llego', 'sentada', 'finalizada'].includes(estado)) return c.json({ error: 'Registrá la llegada antes de aplicar el anticipo al consumo.' }, 422)
          if (r.consumo !== undefined) {
            if (!Number.isInteger(r.consumo) || r.consumo <= 0 || r.consumo > 100000000 || typeof r.comprobante !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(r.comprobante)) return c.json({ error: 'Indicá el consumo en centavos y una referencia de caja única de 8–64 letras, números o guiones.' }, 422)
            const { rows: [previo] } = await cli.query('SELECT id FROM asiento WHERE ref_externa=$1', ['pedido:' + r.comprobante])
            if (previo) return c.json({ error: 'Ese comprobante ya fue cobrado. Actualizá la agenda; no vuelvas a registrar el consumo.' }, 409)
            const { rows: [saldo] } = await cli.query('SELECT total FROM saldo_de($1)', [dueno.id])
            consumo = r.consumo; aplicado = Math.min(pendiente, consumo)
            if (consumo > pendiente + saldo.total) return c.json({ error: 'El anticipo y el saldo disponible no cubren el consumo. Completá el saldo en caja antes de cobrar.' }, 409)
          } else {
          if (!uuid(String(r.pedido ?? ''))) return c.json({ error: 'Elegí un pedido pagado de esta visita.' }, 422)
          const { rows: [pedido] } = await cli.query("SELECT p.id,p.total FROM operativo_pedido p WHERE p.id=$1 AND p.socio_id=$2 AND p.estado IN ('aceptado','preparando','listo','entregado') AND p.creado BETWEEN $3::timestamptz-interval '1 hour' AND $4::timestamptz+interval '1 day' AND EXISTS(SELECT 1 FROM operativo_asiento a WHERE a.socio_id=p.socio_id AND a.ref_externa='pedido:'||p.referencia AND a.monto=-p.total) FOR UPDATE OF p", [r.pedido, dueno.id, actual.cuando, actual.termina])
          const { rows: [aplicado] } = await cli.query("SELECT COALESCE(sum((detalle->>'importe')::int),0)::int AS n FROM auditoria WHERE accion='reserva_aplicar' AND detalle->>'pedido'=$1", [r.pedido])
          if (!pedido || pedido.total <= aplicado.n) return c.json({ error: 'Ese pedido no tiene consumo pagado pendiente de aplicar.' }, 409)
          consumo = pedido.total - aplicado.n
          }
          aplicado = Math.min(pendiente, consumo)
        }
        // saldo_de restaura la composición pagado/bono mediante devoluciones completas.
        // Se libera el tramo pendiente entero y se vuelve a apartar su remanente
        // dentro de esta misma transacción, sin ponerlo a disposición del cliente.
        await liberarAnticipo(cli, actual, pendiente, quien, r.motivo)
        if (accion === 'aplicar' && r.consumo !== undefined) await cli.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa,quien,nota) VALUES($1,$2,'consumo','Consumo de visita VIP',$3,$4,$5)", [dueno.id,-consumo,'pedido:'+r.comprobante,quien,r.motivo])
        const restante = accion === 'aplicar' ? pendiente - aplicado : 0
        const nuevaRef = restante ? 'reserva-pendiente:' + id + ':' + actual.version : null
        if (restante) await cli.query("INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa,quien,nota) VALUES($1,$2,'ajuste','Anticipo VIP restante pendiente de resolución',$3,$4,$5)", [dueno.id,-restante,nuevaRef,quien,r.motivo])
        await cli.query('UPDATE operativo_reserva SET anticipo_aplicado=anticipo_aplicado+$2,anticipo_devuelto=anticipo_devuelto+$3,anticipo_pendiente_ref=$4 WHERE id=$1', [id,aplicado,accion==='devolver'?pendiente:0,nuevaRef])
        if (accion === 'aplicar') await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'reserva_aplicar',$2,$3::jsonb)", [quien, dueno.id, JSON.stringify({ reserva: id, pedido: r.consumo===undefined?r.pedido:null, comprobante:r.comprobante, consumo, importe:aplicado, pendiente:restante })])
      } else return c.json({ error: 'Operación inválida.' }, 422)
      if ((accion === 'cancelar' || accion === 'no_asistio') && pendienteActual > 0) {
        await liberarAnticipo(cli, actual, pendienteActual, quien, personal ? r.motivo : 'Devolución por cancelación del titular')
        await cli.query('UPDATE operativo_reserva SET anticipo_devuelto=anticipo_devuelto+$2,anticipo_pendiente_ref=NULL WHERE id=$1', [id, pendienteActual])
        await cli.query("INSERT INTO auditoria(quien,accion,socio_id,detalle) VALUES($1,'reserva_devolucion_automatica',$2,$3::jsonb)", [quien, dueno.id, JSON.stringify({ reserva: id, causa: accion, importe: pendienteActual, version: actual.version + 1 })])
      }
      const { rows: [final] } = await cli.query(`UPDATE operativo_reserva SET estado=$2,version=version+1,actualizado=now() WHERE id=$1 RETURNING ${campos}`, [id, estado])
      await evento(cli, id, final.version, dueno.id, accion, quien, personal ? r.motivo : null)
      if (accion === 'cambiar' || accion === 'cancelar') await medir(cli, accion === 'cambiar' ? 'cambio' : 'cancelada')
      if (accion === 'cambiar') await cli.query("INSERT INTO reserva_correo(reserva_id,version,tipo,disponible) VALUES($1,$2,'recordatorio',GREATEST(now(),$3::timestamptz-interval '24 hours')) ON CONFLICT DO NOTHING", [id, final.version, final.cuando])
      return c.json({ reserva: final, cancelada: estado === 'cancelada' })
    })
  }
  app.post('/api/reservas/:id/cancelar', c => avisar(c, cambiar(c, 'cancelar')))
  app.post('/api/reservas/:id/cambiar', c => avisar(c, cambiar(c, 'cambiar')))
  app.post('/api/operacion/reservas/:id', c => avisar(c, cambiar(c)))

  app.get('/api/operacion/reservas', async c => {
    if (!equipo(c)) return c.json({ error: 'Acceso exclusivo del personal.' }, 403)
    const dia = c.req.query('dia') ?? diaReserva()
    if (!fechaReserva(dia)) return c.json({ error: 'Fecha inválida.' }, 422)
    const sql = neon(c.env.DATABASE_URL)
    const reservas = await sql`SELECT r.*,s.nombre,s.telefono,(SELECT count(*)::int FROM reserva_correo e WHERE e.reserva_id=r.id AND e.enviado IS NULL AND e.descartado IS NULL AND e.disponible<=now()) AS correos_pendientes FROM operativo_reserva r JOIN operativo_socio s ON s.id=r.socio_id WHERE r.cuando>=${dia}::date AT TIME ZONE 'America/Managua' AND r.cuando<(${dia}::date+1) AT TIME ZONE 'America/Managua' ORDER BY cuando,id LIMIT 500`
    const metricas = await sql`SELECT evento,sum(cantidad)::int AS cantidad FROM reserva_metrica WHERE dia>=(now() AT TIME ZONE 'America/Managua')::date-30 GROUP BY evento`
    const servicio = await sql`SELECT estado,count(*)::int AS cantidad,sum(personas)::int AS personas FROM operativo_reserva WHERE cuando>now()-interval '30 days' AND cuando<=now() GROUP BY estado`
    const [atencion] = await sql`WITH tiempos AS (SELECT e.reserva_id,min(e.creado) FILTER(WHERE e.accion='llego') AS llegada,min(e.creado) FILTER(WHERE e.accion='sentada') AS mesa FROM reserva_evento e JOIN operativo_reserva r ON r.id=e.reserva_id WHERE r.cuando>now()-interval '30 days' GROUP BY e.reserva_id) SELECT count(*)::int AS visitas,avg(extract(epoch FROM mesa-llegada)/60)::float AS media_minutos,percentile_cont(0.95) WITHIN GROUP(ORDER BY extract(epoch FROM mesa-llegada)/60)::float AS p95_minutos FROM tiempos WHERE mesa>=llegada`
    return c.json({ reservas, metricas, servicio, atencion, correoHabilitado: c.env.RESERVAS_CORREO === 'true' && !!c.env.RESEND_API_KEY && !!c.env.EMAIL_FROM })
  })
  app.post('/api/operacion/reservas-configuracion', async c => {
    if (!administra(c)) return c.json({ error: 'La configuración requiere administración.' }, 403)
    const datos: unknown = await c.req.json().catch(() => null)
    if (!configuracionReservasValida(datos)) return c.json({ error: 'Revisá horarios, mesas, combinaciones y condiciones.' }, 422)
    return transaccion(c.env, async cli => {
      await bloqueo(cli)
      const previa = await configuracion(cli)
      if (datos.version !== previa.version) return c.json({ error: 'Otra persona cambió la configuración. Actualizá antes de guardar.' }, 409)
      const { rows: pendientes } = await cli.query("SELECT zona,mesas,personas,cuando,termina FROM operativo_reserva WHERE cancelada IS NULL AND estado IN ('confirmada','llego','sentada') AND termina>now()")
      for (const r of pendientes) {
        const z = datos.zonas.find(z => z.id === r.zona)!
        if(zonaCerrada(datos,r.zona,new Date(r.cuando).toISOString(),(+new Date(r.termina)-+new Date(r.cuando))/3600000)||r.mesas.length>1&&!z.combinaciones.some(g=>g.length===r.mesas.length&&g.every(id=>r.mesas.includes(id))))return c.json({error:'El cierre o la combinación afecta una visita activa. Reprogramala antes de guardar.'},409)
        const horario = horarioReserva(datos, diaReserva(0, +new Date(r.cuando)))
        const hora = new Date(+new Date(r.cuando) - 21600000).getUTCHours(), fin = new Date(+new Date(r.termina) - 21600000).getUTCHours()
        if (horario.cerrada || hora < horario.abre || fin > horario.cierra || r.mesas.length && (r.mesas.some((id: string) => !z.mesas.some(m => m.id === id)) || r.mesas.reduce((n: number, id: string) => n + (z.mesas.find(m => m.id === id)?.plazas ?? 0), 0) < r.personas)) return c.json({ error: 'Ese cambio afecta visitas activas. Reprogramalas antes de cambiar horarios o mesas.' }, 409)
      }
      const version = previa.version + 1, politica = { ...datos.politica, version: JSON.stringify({ ...datos.politica, version: 0 }) === JSON.stringify({ ...previa.politica, version: 0 }) ? previa.politica.version : previa.politica.version + 1 }
      const final = { ...datos, version, politica }
      await cli.query('INSERT INTO reserva_config(id,version,datos) VALUES(true,$1,$2::jsonb) ON CONFLICT(id) DO UPDATE SET version=EXCLUDED.version,datos=EXCLUDED.datos,actualizado=now()', [version, JSON.stringify(final)])
      await cli.query("INSERT INTO auditoria(quien,accion,detalle) VALUES($1,'reservas_configuracion',$2::jsonb)", [c.get('sesion').empleado ?? 'personal', JSON.stringify({ version, anterior: previa, configuracion: final })])
      return c.json(final)
    })
  })
}
function publico(r: Record<string, unknown>) { return Object.fromEntries(campos.split(',').map(k => [k, r[k]])) }
