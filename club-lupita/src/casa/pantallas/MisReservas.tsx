import '../estilos/redisenio-comercio.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Boton } from '../componentes/Base'
import { Tarjeta, Hoja } from '../componentes/Superficies'
import { CabeceraPantalla } from '../componentes/Navegacion'
import { AtencionCliente } from '../componentes/Atencion'
import { cordobas, useDatos } from '../datos'
import { reservasApi } from '../reservas-api'
import { calendarioReserva, diaReserva, nombreZona, nombreEstadoReserva, type ComprobanteReserva, type ConfiguracionReservas } from '../../compartido/reservas'
import './Reservas.css'
const fecha = (s: string) => new Intl.DateTimeFormat('es-NI', { dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Managua' }).format(new Date(s))
export function DetalleReserva({ reserva: r, nivel = 'h2' }: { reserva: ComprobanteReserva; nivel?: 'h2' | 'h3' }) {
  const Titulo = nivel
  function calendario() { const url = URL.createObjectURL(new Blob([calendarioReserva(r)], { type: 'text/calendar;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'lupita-reserva.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
  return <Tarjeta className="reserva-comprobante"><Titulo className="t-seccion">{nombreZona(r.zona)}</Titulo><p className="reserva-estado">{nombreEstadoReserva(r.estado)}</p>
    <dl className="reserva-comprobante-datos"><div><dt>Fecha y llegada</dt><dd>{fecha(r.cuando)}</dd></div><div><dt>Tu grupo</dt><dd>{r.personas} {r.personas === 1 ? 'persona' : 'personas'}</dd></div><div><dt>Hasta</dt><dd>{fecha(r.termina)}</dd></div></dl><p className="t-caption">Hora de Managua</p>
    {r.deposito > 0 && <div className="reserva-anticipo"><p>Anticipo: {cordobas(r.deposito)} · Aplicado al consumo: {cordobas(r.anticipo_aplicado)}. Devuelto a Cuenta de Casa: {cordobas(r.anticipo_devuelto)}. Pendiente de resolver: {cordobas(r.deposito-r.anticipo_aplicado-r.anticipo_devuelto)}.</p>{r.politica ? <><p>Cancelación: {r.politica.cancelacion}</p><p>Inasistencia: {r.politica.inasistencia}</p></> : <p>Reserva histórica: consultá las condiciones con la casa.</p>}</div>}
    <p className="t-caption mt-3 break-all">Comprobante: {r.id} · Revisión {r.version}</p>{r.estado !== 'cancelada' && <Boton tono="tenue" onClick={calendario}>Agregar al calendario</Boton>}</Tarjeta>
}
export function MisReservas({ navegar }: { navegar: (ruta: string) => void }) {
  const { refrescarCuenta } = useDatos()
  const [reservas, setReservas] = useState<ComprobanteReserva[]>([]), [error, setError] = useState(''), [ocupado, setOcupado] = useState(false), [cargando, setCargando] = useState(true), [seleccion, setSeleccion] = useState<ComprobanteReserva>(), [accion, setAccion] = useState<'cambiar' | 'cancelar'>('cambiar')
  const [dia, setDia] = useState(diaReserva()), [hora, setHora] = useState('12'), [personas, setPersonas] = useState(2), [horas, setHoras] = useState(2), vivo = useRef(true), candado = useRef(false)
  const [config, setConfig] = useState<ConfiguracionReservas>(), [horarios, setHorarios] = useState<number[]>(), [mensaje, setMensaje] = useState('')
  const [errorHorarios, setErrorHorarios] = useState(''), [consultaHorarios, setConsultaHorarios] = useState(0)
  useEffect(() => {
    if (!seleccion || accion !== 'cambiar') return
    let activo=true; setHorarios(undefined); setErrorHorarios(''); setError('')
    void (async()=>{try{
      const cfg=await reservasApi.configuracion(), d=await reservasApi.disponibilidadCambio(seleccion.id,dia,personas,horas)
      if(!activo)return
      if(cfg.version!==d.version)throw Error('La agenda cambió. Volvé a consultar los horarios.')
      setConfig(cfg);setHorarios(d.zonas[seleccion.zona]?.horas??[])
    }catch(e){if(activo){setErrorHorarios((e as Error).message);setHorarios([])}}})()
    return()=>{activo=false}
  },[seleccion?.id,accion,dia,personas,horas,consultaHorarios])
  const leer = useCallback(async () => { try { const r = await reservasApi.mias(); if (vivo.current) { setReservas(r.reservas); setError('') } } catch (e) { if (vivo.current) setError((e as Error).message) } finally { if(vivo.current)setCargando(false) } }, [])
  useEffect(() => { vivo.current = true; void leer(); const refrescar = () => { if (document.visibilityState === 'visible' && !candado.current) void leer() }; const reloj = setInterval(refrescar, 30000); window.addEventListener('focus', refrescar); return () => { vivo.current = false; clearInterval(reloj); window.removeEventListener('focus', refrescar) } }, [leer])
  function elegir(r: ComprobanteReserva, a: 'cambiar' | 'cancelar') { setSeleccion(r); setAccion(a); setDia(diaReserva(0, Date.parse(r.cuando))); setHora(String(new Date(Date.parse(r.cuando) - 21600000).getUTCHours())); setPersonas(r.personas); setHoras((Date.parse(r.termina) - Date.parse(r.cuando)) / 3600000); setError('') }
  async function guardar() {
    if (!seleccion || candado.current || accion==='cambiar' && (!hora || !horarios?.includes(Number(hora)))) return
    const id=seleccion.id; candado.current = true; setOcupado(true)
    try {
      const r=await reservasApi.cambiar(id, accion, { version: seleccion.version, cuando: `${dia}T${hora.padStart(2, '0')}:00:00-06:00`, personas, horas })
      if (vivo.current) {
        setReservas(prev=>prev.map(v=>v.id===id?r.reserva:v)); setSeleccion(undefined)
        if (accion === 'cancelar') void refrescarCuenta(true)
        setMensaje(accion==='cancelar' ? 'Tu reserva quedó cancelada.' + (r.reserva.anticipo_devuelto > 0 ? ` Anticipo devuelto a Cuenta de Casa: ${cordobas(r.reserva.anticipo_devuelto)}.` : '') : 'Tu visita quedó actualizada.')
        await leer();requestAnimationFrame(()=>document.getElementById('reserva-'+id)?.focus())
      }
    } catch (e) { if (vivo.current) setError((e as Error).message) }
    finally { candado.current = false; if (vivo.current) setOcupado(false) }
  }
  return <><CabeceraPantalla titulo="Mis reservas" alVolver={() => navegar('/compras')}/><main id="contenido" tabIndex={-1} className="marco comercio-pagina comercio-historial space-y-4 pt-6"><header className="comercio-encabezado"><div><h2>Una mesa para vos</h2><p className="t-caption">Las reservas se actualizan cada 30 segundos mientras esta pantalla está visible. La inasistencia la registra el personal.</p></div><Boton onClick={() => navegar('/reservar')}>Preparar una visita</Boton></header><p role="status" aria-live="polite">{mensaje}</p><Boton tono="tenue" disabled={ocupado} onClick={() => void leer()}>Actualizar reservas</Boton>{error && !seleccion && <p role="alert">{error}</p>}{cargando ? <p role="status">Consultando tus reservas…</p> : reservas.length === 0 && !error && <section className="comercio-vacio"><h2>Elegí cuándo nos vemos</h2><p>Todavía no hay reservas para mostrar.</p><Boton tono="claro" onClick={() => navegar('/reservar')}>Consultar mesas disponibles</Boton></section>}<div className="reservas-lista">{reservas.map(r => <section key={r.id} id={'reserva-'+r.id} tabIndex={-1}><DetalleReserva reserva={r}/>{['confirmada','llego'].includes(r.estado) && <div className="reserva-acciones my-3">{r.estado === 'confirmada' && Date.parse(r.cuando) > Date.now() && <Boton tono="claro" onClick={() => elegir(r, 'cambiar')}>Cambiar visita</Boton>}<Boton tono="tenue" onClick={() => elegir(r, 'cancelar')}>Cancelar reserva</Boton></div>}</section>)}</div><AtencionCliente/></main><Hoja abierta={!!seleccion} alCerrar={() => { if (!ocupado) setSeleccion(undefined) }} titulo={accion === 'cancelar' ? 'Cancelar esta reserva' : 'Cambiar tu visita'}>{seleccion && <><p>{nombreZona(seleccion.zona)} · {fecha(seleccion.cuando)}</p>{accion === 'cancelar' ? <p className="my-4">La mesa se liberará al confirmar.{seleccion.deposito > 0 ? ` Se devolverán ${cordobas(seleccion.deposito-seleccion.anticipo_aplicado-seleccion.anticipo_devuelto)} de anticipo pendiente a tu Cuenta de Casa. El consumo ya aplicado se conserva.` : ' Esta reserva no tiene anticipo.'}</p> : <><label className="reserva-campo">Nueva fecha<input type="date" min={diaReserva()} max={diaReserva(config?.dias??90)} value={dia} onChange={e => setDia(e.target.value)}/></label><label className="reserva-campo">Hora de Managua<select value={hora} onChange={e => setHora(e.target.value)}><option value="">Elegí una hora disponible</option>{horarios?.map(h => <option key={h} value={h}>{h}:00</option>)}</select></label><label className="reserva-campo">Personas<input type="number" min={1} max={12} value={personas} onChange={e => setPersonas(Number(e.target.value))}/></label><label className="reserva-campo">Horas<input type="number" min={1} max={config?.maxHoras??6} value={horas} onChange={e => setHoras(Number(e.target.value))}/></label>{errorHorarios ? <p role="alert">No pudimos consultar los horarios. {errorHorarios} Tu visita original sigue vigente.</p> : <p role="status">{horarios===undefined?'Consultando horarios…':horarios.length?'Disponibilidad actualizada para tu grupo.':'No hay horarios disponibles. Probá otra fecha o duración.'}</p>}<Boton tono="claro" cargando={horarios===undefined} disabled={ocupado} onClick={() => setConsultaHorarios(n => n + 1)}>Actualizar horarios</Boton><p className="t-caption">El cambio conserva la zona y las condiciones del anticipo. Si no hay disponibilidad, tu visita original sigue vigente.</p></>}{error && <p role="alert" className="my-3">{error}</p>}<Boton ancho className="mt-4" cargando={ocupado} disabled={accion==='cambiar'&&(!hora||!horarios?.includes(Number(hora)))} onClick={() => void guardar()}>{accion === 'cancelar' ? 'Sí, cancelar mi reserva' : 'Confirmar cambio'}</Boton></>}</Hoja></>
}
