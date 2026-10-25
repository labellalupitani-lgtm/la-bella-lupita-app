import { DurableObject } from 'cloudflare:workers'
import type { Env } from './index'
import { consultarCuota, type Cuota } from './cuota'
import { estadoInicial, ejecutarPlan, identidadBase, marcarCambio, trabajarBase, type EstadoMantenimiento } from './mantenimiento'

/** Una instancia por base. No interviene en lecturas ni en transacciones de compra. */
export class PlanificadorMantenimiento extends DurableObject<Env> {
  private ejecutando: Promise<unknown> | null = null
  private almacen = {
    leer: () => this.ctx.storage.kv.get<EstadoMantenimiento>('plan') ?? estadoInicial(),
    guardar: (estado: EstadoMantenimiento) => this.ctx.storage.kv.put('plan', estado),
  }
  avisar() { marcarCambio(this.almacen) }
  iniciarCambio() {
    const id = crypto.randomUUID(), estado = this.almacen.leer()
    this.almacen.guardar({ ...estado, revision: estado.revision + 1, siguiente: 0,
      escrituras: { ...Object.fromEntries(Object.entries(estado.escrituras).filter(([, vence]) => vence > Date.now())), [id]: Date.now() + 120_000 } })
    return id
  }
  cerrarCambio(id: string) {
    const estado = this.almacen.leer(), escrituras = { ...estado.escrituras }
    delete escrituras[id]
    this.almacen.guardar({ ...estado, escrituras, revision: estado.revision + 1, siguiente: 0 })
  }
  noDisponible() { const estado = this.almacen.leer(); this.almacen.guardar({ ...estado, error: true, ultimoIntento: Date.now() }) }
  estado() { return this.almacen.leer() }
  cuota() { return this.ctx.storage.kv.get<Cuota>('cuota') ?? null }
  async revisarCuota() {
    const antes = this.cuota()
    if (antes && Date.now() - antes.medido < 6 * 3_600_000) return
    if (!this.env.NEON_CUOTA_API_KEY) { console.error(JSON.stringify({ evento: 'cuota', estado: 'sin_configurar' })); return }
    try {
      const cuota = await consultarCuota(this.env.NEON_CUOTA_API_KEY)
      this.ctx.storage.kv.put('cuota', cuota)
      const alerta = cuota.umbral > 0 && (cuota.inicio !== antes?.inicio || cuota.umbral !== antes?.umbral)
      const datos = { evento: alerta ? 'alerta_cuota' : 'cuota', ...cuota, presupuestoReal: 80, presupuestoDemo: 10, reserva: 10,
        excesoDemo: cuota.demo > 10, proyeccion: 'media_del_periodo_no_prediccion' }
      if (alerta) console.warn(JSON.stringify(datos)); else console.log(JSON.stringify(datos))
    } catch { console.error(JSON.stringify({ evento: 'cuota', estado: 'consulta_fallida' })) }
  }
  async revisar(demo = false) {
    if (this.ejecutando) { await this.ejecutando; return }
    const env = demo ? { ...this.env, DATABASE_URL: this.env.DEMO_DATABASE_URL ?? '' } : this.env
    if (!env.DATABASE_URL || (demo && identidadBase(env.DATABASE_URL) === identidadBase(this.env.DATABASE_URL))) throw Error('Base de mantenimiento inválida')
    // No hay alarmas para demo: sólo entra por uso efectivo de la demostración.
    this.ejecutando = ejecutarPlan(this.almacen, limpiar => trabajarBase(env, limpiar, Date.now()), Date.now())
    try { await this.ejecutando } finally { this.ejecutando = null }
  }
}
