import '../estilos/redisenio-comercio.css'
import './MisComprasExperiencia.css'
import { Fragment, useEffect, useRef, useState } from 'react'
import { nombreEstadoReserva, nombreZona } from '../../compartido/reservas'
import { EntradaClub } from '../componentes/EntradaClub'
import { CondicionesTienda } from '../componentes/CondicionesTienda'
import { Boton, Icono } from '../componentes/Base'
import { Tarjeta } from '../componentes/Superficies'
import { AtencionCliente } from '../componentes/Atencion'
import { cordobas } from '../datos'
import { operacion, type CompraOperativa } from '../operacion'

const fecha = (s?: string) => s ? new Intl.DateTimeFormat('es-NI', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Managua' }).format(new Date(s)) : 'Por confirmar'
const filtros = [['todas', 'Todas'], ['pedido', 'Pedidos'], ['bolsa', 'Café'], ['reserva', 'Mesas'], ['experiencia', 'Experiencias']] as const

function enCurso(c: CompraOperativa, ahora: number) {
  const d = c.detalle
  if (c.tipo === 'pedido') return ['recibido', 'aceptado', 'preparando', 'listo'].includes(d.estado ?? '')
  if (c.tipo === 'bolsa') return !d.entregada && !d.reembolsada && ['pagada', 'lista'].includes(d.estado ?? '')
  if (c.tipo === 'reserva') return !d.cancelada && ['confirmada', 'llego', 'sentada'].includes(d.estado ?? 'confirmada') && Date.parse(d.fin ?? d.cuando ?? '') > ahora
  return !d.cedida && !d.asistencia && !d.cancelada && Date.parse(d.cuando ?? '') > ahora
}

function estadoCompra(c: CompraOperativa) {
  const d = c.detalle
  if (c.tipo === 'pedido') return 'Estado: ' + (d.estado?.replaceAll('_', ' ') ?? 'Por confirmar')
  if (c.tipo === 'reserva') return d.cancelada ? 'Cancelada' : nombreEstadoReserva(d.estado ?? 'confirmada')
  if (c.tipo === 'bolsa') return `Lote ${d.generacion} · ${d.estado === 'reembolsada' ? 'Reembolsada a tu Cuenta de Casa' : d.entregada ? 'Entregada: ' + fecha(d.entregada) : d.estado === 'lista' ? 'Lista para retiro' : 'Pagada · en espera de preparación'}`
  return d.cancelada ? 'Experiencia cancelada' : d.cedida ? 'Entrada cedida' : d.asistencia ? 'Asistencia registrada' : d.recibida ? 'Entrada recibida' : 'Entrada registrada'
}

export function MisCompras({ navegar }: { navegar: (ruta: string) => void }) {
  const [compras, cambiar] = useState<CompraOperativa[]>([]), [pagina, paginar] = useState(0), [hayMas, mas] = useState(false), [cargando, cargar] = useState(true), [error, fallar] = useState('')
  const turno = useRef(0)
  const activos = useRef(false), ocupado = useRef(false)
  const [actualizado, setActualizado] = useState<string | null>(null)
  const [consultaPagina, setConsultaPagina] = useState(0)
  const [tipo, setTipo] = useState<CompraOperativa['tipo'] | 'todas'>('todas')
  const visibles = tipo === 'todas' ? compras : compras.filter(c => c.tipo === tipo)
  const ahora = Date.now()
  // Priorizamos estados y fechas conocidos. Cada grupo conserva el orden de la API.
  const pendientes = visibles.filter(c => enCurso(c, ahora))
  const anteriores = visibles.filter(c => !enCurso(c, ahora))
  const ordenadas = [...pendientes, ...anteriores]
  activos.current = compras.some(c => c.tipo === 'experiencia' && !c.detalle.asistencia && !c.detalle.cancelada && !!c.detalle.cuando && Date.parse(c.detalle.cuando) > Date.now() || c.tipo === 'bolsa' && ['pagada', 'lista'].includes(c.detalle.estado ?? '') || c.tipo === 'pedido' && ['recibido', 'aceptado', 'preparando', 'listo'].includes(c.detalle.estado ?? ''))

  async function leer(p = 0) {
    if (ocupado.current) return
    ocupado.current = true
    const actual = ++turno.current
    cargar(true); setConsultaPagina(p)
    try {
      const r = await operacion<{ compras: CompraOperativa[]; hayMas: boolean }>('/compras?pagina=' + p)
      if (turno.current !== actual) return
      cambiar(prev => p ? [...new Map([...prev, ...r.compras].map(c => [c.id, c])).values()] : r.compras)
      mas(r.hayMas); paginar(p); setActualizado(new Date().toISOString()); fallar('')
    } catch (e) {
      if (turno.current === actual) fallar((e as Error).message)
    } finally {
      ocupado.current = false
      if (turno.current === actual) cargar(false)
    }
  }

  useEffect(() => {
    void leer()
    const reanudar = () => { if (document.visibilityState === 'visible') void leer() }
    const reloj = setInterval(() => { if (activos.current) reanudar() }, 30000)
    window.addEventListener('focus', reanudar)
    window.addEventListener('online', reanudar)
    document.addEventListener('visibilitychange', reanudar)
    return () => {
      turno.current++; ocupado.current = false; clearInterval(reloj)
      window.removeEventListener('focus', reanudar)
      window.removeEventListener('online', reanudar)
      document.removeEventListener('visibilitychange', reanudar)
    }
  }, [])

  return <main id="contenido" tabIndex={-1} className="marco comercio-pagina comercio-historial compras-experiencia">
    <button type="button" className="compras-volver" onClick={() => navegar('/perfil')}><Icono nombre="arrow_back" tam={18} />Volver al perfil</button>
    <header className="compras-encabezado">
      <div><h1>Mis compras y reservas</h1><p>Tus pedidos y visitas, a mano.</p></div>
      <div className="compras-accesos"><Boton tono="tenue" onClick={() => navegar('/pedir')}>Explorar la carta</Boton><Boton tono="claro" onClick={() => navegar('/reservas')}>Mis reservas</Boton></div>
    </header>

    <div className="compras-sincronizacion">
      <p role="status" aria-live="polite" aria-atomic="true">{cargando ? consultaPagina ? 'Consultando compras anteriores…' : compras.length ? 'Actualizando…' : 'Consultando tu cuenta…' : actualizado ? <>{error ? 'Última consulta disponible: ' : 'Última consulta: '}<time dateTime={actualizado}>{fecha(actualizado)}</time></> : 'Consulta no disponible'}</p>
      <Boton tono="claro" compacto cargando={cargando} onClick={() => void leer()}>Actualizar</Boton>
    </div>

    {error && <section role="alert" className="compras-aviso-error">
      <Icono nombre="info" tam={22} />
      <div><h2>{compras.length ? consultaPagina ? 'No pudimos cargar compras anteriores' : 'No pudimos actualizar tus compras' : 'No pudimos consultar tus compras'}</h2>
        <p>{compras.length ? 'Los comprobantes visibles corresponden a la última consulta disponible.' : 'Volvé a intentar con Actualizar.'}</p><p className="compras-error-detalle">{error}</p>
      </div>
    </section>}

    {!!compras.length && <div className="compras-filtros" role="group" aria-label="Filtrar los comprobantes cargados">{filtros.map(([id, nombre]) => <button type="button" key={id} aria-pressed={tipo === id} onClick={() => setTipo(id)}>{nombre}</button>)}</div>}

    {!compras.length && cargando && !error && <div className="compras-carga" aria-hidden="true"><span /><span /><span /></div>}
    {!compras.length && !cargando && !error && <section className="compras-vacio">
      <Icono nombre="event_seat" tam={34} />
      <div><p className="compras-antetitulo">Un lugar para volver</p><h2>Tu próxima visita empieza aquí</h2><p>Todavía no hay compras o reservas en tu cuenta.</p><Boton onClick={() => navegar('/reservar')}>Preparar una visita</Boton></div>
    </section>}
    {compras.length > 0 && visibles.length === 0 && <section className="compras-vacio compras-vacio-filtro" role="status">
      <Icono nombre="local_mall" tam={30} /><div><h2>Nada de este tipo por aquí</h2><p>No hay comprobantes de este tipo entre los cargados.</p><Boton tono="tenue" onClick={() => setTipo('todas')}>Ver todos los comprobantes</Boton></div>
    </section>}

    <div className="compras-lista">
      {ordenadas.map((c, i) => {
        const d = c.detalle, pendiente = i < pendientes.length
        const titulo = c.tipo === 'pedido' ? 'Pedido #' + d.numero : c.tipo === 'reserva' ? 'Tu mesa · ' + nombreZona(d.zona ?? '') : c.tipo === 'bolsa' ? 'Reserva de Cosecha · bolsa ' + d.numero : d.nombre
        const importe = c.tipo === 'reserva' ? d.deposito ?? 0 : d.total
        return <Fragment key={c.id}>
          {(i === 0 || i === pendientes.length) && <div className="compras-grupo"><h2>{pendiente ? 'En curso y próximas' : 'Historial'}</h2><p>{pendiente ? pendientes.length : anteriores.length} {(pendiente ? pendientes.length : anteriores.length) === 1 ? 'comprobante' : 'comprobantes'}</p></div>}
          <Tarjeta role="article" aria-labelledby={'compra-' + c.id} className={'compra-comprobante' + (pendiente ? ' compra-en-curso' : '')}>
            <div className="compra-identidad">
              <p className="compra-tipo"><Icono nombre={c.tipo === 'pedido' ? 'restaurant' : c.tipo === 'reserva' ? 'event_seat' : c.tipo === 'bolsa' ? 'local_cafe' : 'local_activity'} tam={19} />{c.tipo === 'pedido' ? 'Tu pedido' : c.tipo === 'reserva' ? 'Tu visita' : c.tipo === 'bolsa' ? 'Café para llevar' : 'Experiencia en la casa'}</p>
              <h3 id={'compra-' + c.id}>{titulo}</h3>
              <p role="status" className="compra-estado">{estadoCompra(c)}</p>
              {importe !== undefined && <p className="compra-importe"><span>{c.tipo === 'reserva' ? 'Anticipo' : 'Importe'}</span><strong>{cordobas(importe)}</strong></p>}
              {c.tipo === 'reserva' && <Boton tono="claro" onClick={() => navegar('/reservas')}>Gestionar esta reserva</Boton>}
            </div>
            <div className="compra-detalle">
              {c.tipo === 'pedido' && <>
                <ul className="compra-lineas">{d.lineas?.map((l, n) => <li key={n}>
                  <div className="compra-linea-resumen"><span>{l.cuanto} × {l.nombre}</span><strong>{cordobas(l.cuanto * l.precio)}</strong></div>
                  {!!l.descuentoClub && <small>Mesa Fundadora: {l.descuentoClub}% incluido. Precio unitario antes del descuento: {cordobas(l.precioAntes ?? l.precio)}.</small>}
                  {l.opciones?.map((o, j) => <small key={j}>{o.nombre}: {o.valor}</small>)}
                </li>)}</ul>
                {!!d.empaque && <p>Empaque incluido: {cordobas(d.empaque)}</p>}
                {d.restriccion_confirmada && <p className="compra-nota">Restricción confirmada para cocina: {d.restriccion_confirmada}</p>}
                {d.motivo && <p>{d.motivo}</p>}
                {d.estado === 'cancelado' && <p>El importe se devolvió a tu Cuenta de Casa</p>}
              </>}
              {c.tipo === 'reserva' && <dl className="compra-visita"><div><dt>Tu visita</dt><dd>{fecha(d.cuando)}</dd></div><div><dt>Hasta</dt><dd>{fecha(d.fin)}</dd></div><div><dt>Personas</dt><dd>{d.personas} {d.personas === 1 ? 'persona' : 'personas'}</dd></div></dl>}
              {c.tipo === 'bolsa' && <>
                {d.motivo && <p>Motivo: {d.motivo}</p>}
                {d.cotizacion ? <><p className="compra-presentacion">{d.cotizacion.oferta.ficha.gramos} g · {d.cotizacion.oferta.ficha.presentacion}</p><CondicionesTienda ficha={d.cotizacion.oferta.ficha} /></> : <p>Compra histórica. Consultá con la casa las condiciones de retiro.</p>}
              </>}
              {c.tipo === 'experiencia' && <EntradaClub compra={c} actualizar={() => leer()} />}
            </div>
            <footer className="compra-pie"><p>Registrado: <time dateTime={c.creado}>{fecha(c.creado)}</time></p><p className="compra-referencia">Comprobante: <span>{c.id}</span></p></footer>
          </Tarjeta>
        </Fragment>
      })}
    </div>
    {hayMas && <div className="compras-paginacion"><Boton tono="claro" cargando={cargando && consultaPagina > 0} disabled={cargando} onClick={() => void leer(pagina + 1)}>Ver anteriores</Boton><p>Más comprobantes de tu cuenta.</p></div>}

    <details className="compras-ayuda">
      <summary><span><Icono nombre="notifications" tam={21} />Avisos y ayuda de la casa</span><Icono nombre="chevron_right" tam={21} /></summary>
      <div className="compras-ayuda-contenido"><AtencionCliente mostrarMotivoCompleto /></div>
    </details>
  </main>
}
