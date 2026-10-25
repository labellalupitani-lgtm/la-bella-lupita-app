import '../estilos/redisenio-comercio.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Boton, Contador } from '../componentes/Base'
import { Tarjeta } from '../componentes/Superficies'
import { CabeceraPantalla } from '../componentes/Navegacion'
import { AtencionCliente } from '../componentes/Atencion'
import { cordobas, useDatos } from '../datos'
import { ErrorPeticion } from '../http'
import { reservasApi, medirReserva } from '../reservas-api'
import { DetalleReserva } from './MisReservas'
import { diaReserva, fechaReserva, errorFechaReserva, horarioReserva, nombreZona, ZONAS_RESERVA, type ConfiguracionReservas, type DisponibilidadReservas, type ComprobanteReserva } from '../../compartido/reservas'
import './ClubReserva.css'
import './Reservas.css'

const nombreDia = (s: string) => new Intl.DateTimeFormat('es-NI', { dateStyle: 'full', timeZone: 'America/Managua' }).format(new Date(s + 'T12:00:00-06:00'))
export const horaTexto = (h: number) => `${h > 12 ? h - 12 : h || 12}:00 ${h >= 12 ? 'p. m.' : 'a. m.'}`
const PREFIJO = 'lupita:reserva:'
type Borrador = { restaurado?:boolean; configuracion?:number; dia: string; zona: string; hora: number | null; personas: number; horas: number; paso: number; referencia: string; incierto: boolean; confirmado: boolean; vence: number }
function inicial(): Borrador { return { dia: diaReserva(), zona: '', hora: null, personas: 2, horas: 2, paso: 0, referencia: crypto.randomUUID(), incierto: false, confirmado: false, vence: Date.now() + 86400000 } }
function cargarBorrador(cuenta: string): Borrador {
  try {
    if (cuenta !== 'invitado' && sessionStorage.getItem(PREFIJO + 'acceso') === 'pendiente') {
      const invitado = sessionStorage.getItem(PREFIJO + 'invitado')
      if (invitado) sessionStorage.setItem(PREFIJO + cuenta, invitado)
      sessionStorage.removeItem(PREFIJO + 'invitado'); sessionStorage.removeItem(PREFIJO + 'acceso')
    }
    const d = JSON.parse(sessionStorage.getItem(PREFIJO + cuenta) ?? 'null')
    if (d && fechaReserva(d.dia) && d.vence > Date.now() && typeof d.zona === 'string' && Number.isInteger(d.personas) && d.personas >= 1 && d.personas <= 12 && Number.isInteger(d.horas) && d.horas >= 1 && d.horas <= 6 && [0, 1, 2].includes(d.paso) && (d.hora === null || Number.isInteger(d.hora) && d.hora >= 0 && d.hora < 24) && typeof d.referencia === 'string') return {...d,restaurado:true}
  } catch { /* El modo privado puede impedir guardar el borrador. */ }
  return inicial()
}
export function Reservar({ navegar }: { navegar: (ruta: string) => void }) {
  const { yo, perfil, dentro, refrescarCuenta } = useDatos(), cuenta = perfil?.id ?? yo?.socio.id ?? 'invitado'
  const [d, setD] = useState(() => cargarBorrador(cuenta)), [config, setConfig] = useState<ConfiguracionReservas>(), [disponible, setDisponible] = useState<DisponibilidadReservas>()
  const [error, setError] = useState(''), [estado, setEstado] = useState('Consultando la agenda…'), [ocupado, setOcupado] = useState(false), [recibo, setRecibo] = useState<ComprobanteReserva>()
  const [falloDisponibilidad,setFalloDisponibilidad]=useState(false)
  const [ahora,setAhora]=useState(Date.now)
  const turno = useRef(0), candado = useRef(false), cierre = useRef<HTMLDivElement>(null), main = useRef<HTMLElement>(null), vivo = useRef(true)
  const medicion = useRef(crypto.randomUUID())
  useEffect(() => { if (dentro) medirReserva(d.paso === 2 ? 'revision' : d.paso===1?'fecha_grupo':'consulta', medicion.current) }, [dentro, d.paso])
  useEffect(()=>{if(dentro&&d.restaurado&&!d.confirmado)medirReserva('borrador_recuperado',medicion.current)},[dentro])
  useEffect(() => { vivo.current = true; return () => { vivo.current = false; turno.current++ } }, [])
  useEffect(() => { try { sessionStorage.setItem(PREFIJO + cuenta, JSON.stringify(d)) } catch { /* Borrador en memoria. */ } }, [d, cuenta])
  const cambiar = (c: Partial<Borrador>) => setD(prev => ({ ...prev, ...c, configuracion: undefined, referencia: crypto.randomUUID(), incierto: false, confirmado: false }))
  const cargar = useCallback(async () => {
    const n = ++turno.current
    setDisponible(undefined); setFalloDisponibilidad(false); setError(''); setEstado('Consultando mesas para tu grupo…')
    try {
      const cfg = await reservasApi.configuracion(), disp = await reservasApi.disponibilidad(d.dia, d.personas, d.horas)
      if (n !== turno.current || !vivo.current) return
      if (cfg.version !== disp.version) throw Error('La agenda cambió durante la consulta. Volvé a actualizar.')
      setConfig(cfg); setDisponible(disp); setAhora(Date.now()); setError(''); setEstado('Disponibilidad actualizada. Hora de Managua.')
    } catch (e) { if (n === turno.current && vivo.current) { setError((e as Error).message); setFalloDisponibilidad(true); setEstado('') } }
  }, [d.dia, d.personas, d.horas])
  useEffect(() => {
    void cargar()
    const reanudar = () => { if (document.visibilityState === 'visible' && !candado.current) void cargar() }, reloj = setInterval(reanudar, 60000)
    document.addEventListener('visibilitychange', reanudar); window.addEventListener('online', reanudar); window.addEventListener('focus', reanudar)
    return () => { turno.current++; clearInterval(reloj); document.removeEventListener('visibilitychange', reanudar); window.removeEventListener('online', reanudar); window.removeEventListener('focus', reanudar) }
  }, [cargar])
  useEffect(() => {
    const pie = cierre.current, contenido = main.current
    if (!pie || !contenido) return
    const medir = () => contenido.style.setProperty('--reserva-pie', `${Math.ceil(pie.getBoundingClientRect().height)}px`)
    const observador = new ResizeObserver(medir)
    medir(); observador.observe(pie)
    return () => { observador.disconnect(); contenido.style.removeProperty('--reserva-pie') }
  }, [recibo])
  useEffect(() => {
    let marco = 0
    const verFoco = (evento: FocusEvent) => {
      const elemento = evento.target
      if (!(elemento instanceof HTMLElement) || !main.current?.contains(elemento) || elemento.closest('dialog')) return
      cancelAnimationFrame(marco)
      marco = requestAnimationFrame(() => {
        const limite = cierre.current?.getBoundingClientRect().top ?? innerHeight
        const cabecera = document.querySelector<HTMLElement>('.casa-subcabecera')?.getBoundingClientRect()
        const techo = cabecera && cabecera.bottom > 0 ? cabecera.bottom + 12 : 12
        const r = elemento.getBoundingClientRect()
        if (r.bottom > limite - 16) window.scrollBy({ top: r.bottom - limite + 16, behavior: 'instant' })
        else if (r.top < techo) window.scrollBy({ top: r.top - techo, behavior: 'instant' })
      })
    }
    document.addEventListener('focusin', verFoco)
    return () => { cancelAnimationFrame(marco); document.removeEventListener('focusin', verFoco) }
  }, [])
  const aceptar = (r: ComprobanteReserva) => { setRecibo(r); setD(prev => ({ ...prev, incierto: false, confirmado: true })); setError(''); requestAnimationFrame(() => document.getElementById('res-comprobante')?.focus()) }
  const recuperar = useCallback(async () => {
    if (candado.current || !dentro) return
    candado.current = true; setOcupado(true)
    try { const r = await reservasApi.recuperar(d.referencia); if (vivo.current) aceptar(r.reserva) }
    catch (e) { if (vivo.current) setError(e instanceof ErrorPeticion && e.status === 404 ? 'Todavía no hay un comprobante. Podés reintentar exactamente esta visita con la misma referencia.' : (e as Error).message) }
    finally { candado.current = false; if (vivo.current) setOcupado(false) }
  }, [d.referencia, dentro])
  useEffect(() => { if (d.incierto || d.confirmado) void recuperar() }, [recuperar])
  function paso(n: number) {
    setD(prev => ({ ...prev, paso: n }))
    requestAnimationFrame(() => { const titulo = document.getElementById('res-paso'); titulo?.focus({ preventScroll: true }); titulo?.scrollIntoView({ block: 'start', behavior: 'instant' }) })
  }
  const cuandoHora = (h: number) => `${d.dia}T${String(h).padStart(2, '0')}:00:00-06:00`
  const zona = config?.zonas.find(z => z.id === d.zona), ofrecidas = disponible?.zonas[d.zona]?.horas ?? [], configurada = disponible?.zonas[d.zona]?.configurada ?? false
  const horas = ofrecidas.filter(h => config && !errorFechaReserva(config, cuandoHora(h), d.horas, d.personas, ahora))
  const vigente = disponible && ahora - Date.parse(disponible.actualizado) < 120000
  useEffect(() => {
    if (!config || !disponible) return
    const vencimientos = [Date.parse(disponible.actualizado) + 120000, ...Object.values(disponible.zonas).flatMap(z => z.horas.map(h => Date.parse(`${d.dia}T${String(h).padStart(2,'0')}:00:00-06:00`) - config.anticipacion * 60000 + 1))].filter(t => t > ahora)
    if (!vencimientos.length) return
    const reloj = setTimeout(() => setAhora(Date.now()), Math.max(1, Math.min(...vencimientos) - Date.now()))
    return () => clearTimeout(reloj)
  }, [config, disponible, d.dia, ahora])
  const listo = !!zona && d.hora !== null && !!vigente && horas.includes(d.hora)
  const deposito = d.zona === 'vip' ? config?.politica.importe ?? 50000 : 0, faltaSaldo = dentro && deposito > (yo?.saldo.total ?? 0)
  useEffect(() => { if (faltaSaldo && d.paso === 2) medirReserva('sin_saldo', medicion.current) }, [faltaSaldo, d.paso])
  const impedimento = d.incierto ? 'Verificá el intento pendiente antes de cambiar la visita.' : !d.zona ? 'Elegí una zona.' : !disponible ? (falloDisponibilidad?'No pudimos comprobar las mesas. Actualizá los horarios para reintentar.':'Estamos comprobando las mesas para tu grupo…') : !configurada ? 'Esta zona requiere confirmar capacidad o condiciones con la casa.' : d.hora!==null&&vigente&&!horas.includes(d.hora) ? 'La hora elegida dejó de estar disponible. Elegí otra hora.' : !listo ? 'Elegí un horario disponible para tu grupo.' : faltaSaldo ? `Faltan ${cordobas(deposito - (yo?.saldo.total ?? 0))} para el anticipo. La recarga se realiza en caja.` : 'Revisá los datos antes de confirmar.'
  async function confirmar() {
    if (candado.current || !config || !d.zona || d.hora === null || !d.incierto && (!listo || faltaSaldo)) return
    if (!d.incierto) {
      const invalida = errorFechaReserva(config, cuandoHora(d.hora), d.horas, d.personas)
      if (invalida) { setAhora(Date.now()); setError(invalida); return }
    }
    const versionAceptada = d.incierto ? d.configuracion : config.version
    if (!Number.isInteger(versionAceptada)) { setError('Consultá el intento pendiente: no conservamos las condiciones de ese borrador antiguo para repetir el cargo.'); return }
    if (!dentro) { try { sessionStorage.setItem(PREFIJO + 'acceso', 'pendiente') } catch { /* Sin almacenamiento. */ } navegar('/reservar?acceso=1'); return }
    candado.current = true; setOcupado(true); setError(''); setD(prev => ({ ...prev, incierto: true, configuracion: versionAceptada }))
    try {
      const r = await reservasApi.crear({ zona: d.zona, cuando: cuandoHora(d.hora), personas: d.personas, horas: d.horas, referencia: d.referencia, configuracion: versionAceptada! })
      if (!vivo.current) return
      aceptar(r.reserva); void refrescarCuenta(true)
    } catch (e) {
      if (!vivo.current) return
      if (e instanceof ErrorPeticion && !e.resultadoIncierto && e.status >= 400 && e.status < 500) { setD(prev => ({ ...prev, incierto: false })); if(e.status === 409) medirReserva('conflicto', medicion.current); await cargar() }
      if(!(e instanceof ErrorPeticion)||e.resultadoIncierto||e.status>=500)medirReserva('resultado_incierto',medicion.current)
      setError((e as Error).message)
    } finally { candado.current = false; if (vivo.current) setOcupado(false) }
  }
  return <><CabeceraPantalla titulo="Reservá una mesa" alVolver={() => d.paso > 0 && !recibo && !d.incierto ? paso(d.paso - 1) : navegar('/')} />
    <main ref={main} id="contenido" tabIndex={-1} className={`marco reserva-casa reserva-nueva comercio-pagina pt-6 ${d.paso > 0 || recibo ? 'reserva-en-paso' : ''}`}>
      <aside className="reserva-lugar" aria-label={d.zona&&d.zona!=='terraza'?nombreZona(d.zona):'La terraza de la casa'}>{!d.zona||d.zona==='terraza'?<><picture><source type="image/avif" srcSet="/images/terraza-atardecer-480.avif 480w, /images/terraza-atardecer-960.avif 960w" sizes="(min-width: 900px) 45vw, 100vw"/><img fetchPriority="high" src="/images/terraza-atardecer-480.webp" srcSet="/images/terraza-atardecer-480.webp 480w, /images/terraza-atardecer-960.webp 960w" sizes="(min-width: 900px) 45vw, 100vw" alt="Terraza de La Bella Lupita al atardecer" width={960} height={1440}/></picture><div className="reserva-lugar-pie"><span>La terraza de la casa</span><h2>Tu próxima visita</h2></div></>:<div className="reserva-lugar-tipografico"><span>Tu próxima visita</span><h2>{nombreZona(d.zona)}</h2><p>{zona?.descripcion||'Prepará la fecha y el grupo para consultar una mesa disponible.'}</p></div>}</aside>
      <div className="reserva-formulario"><div className="reserva-utilidades"><Boton tono="tenue" onClick={() => navegar('/reservas')}>Mis reservas</Boton>{!recibo && <span className="t-caption">Tu borrador se conserva durante 24 horas en esta pestaña.</span>}</div>
        <p role="status" aria-live="polite" className="t-caption">{ocupado ? 'Verificando tu reserva…' : recibo ? 'Comprobante actualizado.' : !d.incierto && d.hora !== null && disponible && (!vigente || !horas.includes(d.hora)) ? 'La hora elegida necesita una nueva consulta. Revisá los horarios disponibles antes de confirmar.' : estado}</p>
        {error && <p role="alert" className="my-4 text-achiote">{error}</p>}
        {recibo ? <><h2 id="res-comprobante" tabIndex={-1} className="casa-subtitular">{recibo.estado === 'cancelada' ? 'Esta reserva está cancelada' : 'Tu reserva está registrada'}</h2><DetalleReserva reserva={recibo} nivel="h3"/><div className="my-4 space-y-3"><Boton ancho onClick={() => navegar('/reservas')}>Gestionar mi reserva</Boton><Boton tono="claro" ancho onClick={() => { setRecibo(undefined); setD(inicial()) }}>Preparar otra visita</Boton></div></> : <>
          <nav aria-label="Pasos de la reserva" className="reserva-pasos">{['Lugar', 'Fecha y grupo', 'Revisión'].map((n, i) => <button key={n} aria-current={d.paso === i ? 'step' : undefined} disabled={i > d.paso || d.incierto || ocupado} onClick={() => paso(i)}><span className="reserva-paso-numero" aria-hidden="true">{i + 1}</span><span>{n}</span></button>)}</nav>
          <h2 id="res-paso" tabIndex={-1} className="casa-subtitular">{['Encontrá tu rincón', 'Hagamos espacio para vos', 'Revisá tu visita'][d.paso]}</h2>
          <fieldset disabled={ocupado || d.incierto}>
            {d.paso === 0 && <section aria-label="Elegir zona"><ul className="reserva-zonas">{ZONAS_RESERVA.map(z => { const cfg = config?.zonas.find(v => v.id === z.id); return <li key={z.id}><button type="button" aria-pressed={d.zona === z.id} onClick={() => cambiar({ zona: z.id, hora: null })}><span className="reserva-zona-titulo"><span className="t-seccion">{z.nombre}</span><span className="reserva-zona-seleccion" aria-hidden="true">{d.zona === z.id ? '✓' : '+'}</span></span><span className="block t-caption">{z.id === 'vip' ? 'C$500 de anticipo aplicable al consumo' : 'Sin anticipo'}{cfg && !cfg.mesas.length ? ' · Capacidad por confirmar' : ''}</span>{cfg?.descripcion && <span className="block mt-2">{cfg.descripcion}</span>}{cfg?.accesibilidad && <span className="block t-caption">Accesibilidad: {cfg.accesibilidad}</span>}</button></li> })}</ul><p className="t-caption mt-4">Si necesitás una adaptación para tu visita, coordiná con la casa. Las características aún no registradas no se dan por confirmadas.</p></section>}
            {d.paso === 1 && <><label className="reserva-campo">Fecha de tu visita<input type="date" min={diaReserva()} max={diaReserva(config?.dias ?? 90)} value={d.dia} onChange={e => { if (fechaReserva(e.target.value)) cambiar({ dia: e.target.value, hora: null }) }}/></label><p className="t-caption">{d.dia === diaReserva() ? 'Hoy · ' : ''}{nombreDia(d.dia)} · Managua</p><div className="reserva-grupo my-4"><label className="reserva-campo">Personas<select value={d.personas} onChange={e => cambiar({ personas: Number(e.target.value), hora: null })}>{Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option value={n} key={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}</select></label><div><p>Duración</p><Contador valor={d.horas} min={1} max={config?.maxHoras ?? 6} alCambiar={n => cambiar({ horas: n, hora: null })} etiqueta="horas de mesa" sufijo={d.horas === 1 ? 'hora' : 'horas'}/></div></div>
              <h3 className="t-seccion">Horarios para {nombreZona(d.zona)}</h3><p className="t-caption my-3">{!disponible ? (falloDisponibilidad?'La disponibilidad no pudo verificarse. Usá Actualizar horarios para reintentar.':'Consultando disponibilidad…') : !configurada ? 'La casa necesita registrar la capacidad o las condiciones de esta zona antes de confirmar mesas en línea.' : config && horarioReserva(config, d.dia).cerrada ? 'La casa no recibe reservas ese día.' : !horas.length ? 'No hay horarios disponibles para este grupo y duración. Probá otra fecha, duración o zona.' : 'Elegí una hora. La disponibilidad se confirma al reservar.'}</p>
              <ul className="reserva-horas">{horas.map(h => <li key={h}><button type="button" aria-pressed={d.hora === h} className="reserva-hora" onClick={() => cambiar({ hora: h })}>{horaTexto(h)}</button></li>)}</ul><Boton tono="tenue" className="mt-3" onClick={() => void cargar()}>Actualizar horarios</Boton></>}
            {d.paso === 2 && <Tarjeta className="reserva-revision"><dl className="reserva-detalle"><div><dt>Zona</dt><dd>{nombreZona(d.zona)}</dd></div><div><dt>Fecha y hora</dt><dd>{nombreDia(d.dia)} · {d.hora === null ? 'Elegí una hora' : horaTexto(d.hora)} · Managua</dd></div><div><dt>Grupo y duración</dt><dd>{d.personas} {d.personas === 1 ? 'persona' : 'personas'} · {d.horas} {d.horas === 1 ? 'hora' : 'horas'}</dd></div><div><dt>Anticipo</dt><dd>{deposito ? cordobas(deposito) : 'Sin anticipo'}</dd></div></dl>{!!deposito && config && <div className="mt-4 space-y-2"><p>Se carga a tu Cuenta de Casa al confirmar. Se aplica al consumo de tu visita; el personal registra su aplicación.</p><p>Cancelación: {config.politica.cancelacion || 'Condiciones pendientes de definir por la casa.'}</p><p>Inasistencia: {config.politica.inasistencia || 'Condiciones pendientes de definir por la casa.'}</p><p className="t-caption">Condiciones versión {config.politica.version}.</p></div>}<Boton tono="tenue" onClick={() => paso(1)}>Cambiar fecha o grupo</Boton></Tarjeta>}
          </fieldset>
          {d.incierto && <Tarjeta><p>Tu intento sigue pendiente de verificar. Conservamos la misma referencia para evitar duplicados y cargos repetidos.</p><Boton tono="claro" disabled={ocupado} onClick={() => void recuperar()}>Consultar mi intento</Boton><Boton tono="tenue" disabled={ocupado} onClick={() => void confirmar()}>Reintentar la misma visita</Boton></Tarjeta>}
          <a className="inline-flex min-h-[44px] items-center text-banda underline my-3" href={'https://wa.me/50587442005?text=' + encodeURIComponent(`Quisiera consultar una mesa${d.zona ? ' en ' + nombreZona(d.zona) : ''} para ${d.personas} personas el ${d.dia}. Entiendo que esta consulta no confirma la reserva.`)} target="_blank" rel="noopener noreferrer">Preparar consulta por WhatsApp (abre otra pestaña)</a>
          {dentro && <details className="my-4"><summary>Ayuda y avisos de la casa</summary><AtencionCliente/></details>}
        </>}
      </div>
    </main>
    {!recibo && <div ref={cierre} className="reserva-cierre fixed inset-x-0 bottom-0 z-30 border-t border-filete bg-papel px-4 pb-6 pt-3"><div className="reserva-cierre-interior"><p id="res-impedimento">{impedimento}</p><div className="reserva-acciones">{d.paso > 0 && <Boton tono="tenue" disabled={ocupado || d.incierto} onClick={() => paso(d.paso - 1)}>Volver</Boton>}{d.paso < 2 ? <Boton ancho aria-describedby="res-impedimento" disabled={ocupado || d.incierto || (d.paso === 0 ? !d.zona : !listo)} onClick={() => paso(d.paso + 1)}>{d.paso === 0 ? 'Elegir fecha y grupo' : 'Revisar mi reserva'}</Boton> : <Boton ancho cargando={ocupado} aria-describedby="res-impedimento" disabled={d.incierto || !listo || faltaSaldo} onClick={() => void confirmar()}>{!dentro ? 'Ingresar para confirmar' : deposito ? 'Confirmar con ' + cordobas(deposito) : 'Confirmar mi mesa'}</Boton>}</div>{d.paso === 2 && faltaSaldo && <Boton tono="claro" ancho onClick={() => navegar('/')}>Ver mi Cuenta de Casa</Boton>}</div></div>}
  </>
}
