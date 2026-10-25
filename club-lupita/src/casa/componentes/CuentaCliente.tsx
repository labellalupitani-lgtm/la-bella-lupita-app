import { useEffect, useRef, useState, type FormEvent } from 'react'
import { api, cordobas, type Actividad, type TipoActividad } from '../datos'
import { camposPerfil, editableDe, erroresPerfil, normalizarPerfil, type ErroresPerfil, type PerfilDatos, type PerfilEditable } from '../../compartido/perfil'
import { Boton } from './Base'
import { Hoja } from './Superficies'
import { medirPerfilTrasPintado } from '../medicion-perfil'
import type { EventoPerfil } from '../../compartido/metricas-perfil'

const etiquetas = { nombre: 'Tu nombre', bebida_siempre: 'Tu bebida de siempre', alergias: 'Alergias', cumple: 'Tu cumpleaños', promociones_correo: 'Promociones por correo' }
type CampoPerfil = keyof PerfilEditable
const iguales = (a: PerfilEditable, b: PerfilEditable) => camposPerfil.every(k => a[k] === b[k])
const mostrar = (v: string | boolean) => typeof v === 'boolean' ? v ? 'Aceptadas' : 'No aceptadas' : v || 'Sin indicar'

export function EditarPerfil({ perfil, alGuardar, solicitud, enfocado = false, alConfirmar }: { perfil: PerfilDatos; alGuardar: (p: PerfilDatos) => void; solicitud?: { campo: CampoPerfil; turno: number }; enfocado?: boolean; alConfirmar?: (campo: CampoPerfil | null) => void }) {
  const [abierta, abrir] = useState(false)
  const [campo, setCampo] = useState<CampoPerfil | null>(null)
  const [revision, setRevision] = useState('')
  const guardadoPendiente = useRef<CampoPerfil | null>(null)
  const destinoFoco = useRef<CampoPerfil>('nombre')
  const [base, setBase] = useState(perfil)
  const [valores, cambiar] = useState<PerfilEditable>(() => editableDe(perfil))
  const [ocupado, ocupar] = useState(false)
  const [error, fallar] = useState('')
  const [estado, informar] = useState('')
  const [errores, setErrores] = useState<ErroresPerfil>({})
  const [actual, setActual] = useState<PerfilDatos | null>(null)
  const [elecciones, elegir] = useState<Partial<Record<keyof PerfilEditable, 'mio' | 'guardado'>>>({})
  const [incierto, setIncierto] = useState(false)
  const formulario = useRef<HTMLFormElement>(null)
  const vivo = useRef(true)
  const [medicion, setMedicion] = useState<{ evento: EventoPerfil; inicio: number } | null>(null)
  const sucio = !iguales(normalizarPerfil(valores), editableDe(base))
  useEffect(() => { vivo.current = true; return () => { vivo.current = false } }, [])
  useEffect(() => {
    if (!solicitud) return
    const normalizados = normalizarPerfil(valores)
    const otrosCambios = camposPerfil.some(k => k !== solicitud.campo && normalizados[k] !== base[k])
    destinoFoco.current = solicitud.campo
    setCampo(enfocado && !otrosCambios && !actual && !incierto ? solicitud.campo : null)
    setRevision(enfocado && otrosCambios ? 'Tenés cambios pendientes en otros datos. Revisá el formulario completo antes de guardarlos.' : '')
    abrir(true)
  }, [solicitud, enfocado])
  useEffect(() => {
    if (!abierta) return
    const frame = requestAnimationFrame(() => {
      const destino = destinoFoco.current
      const selector = destino === 'cumple' ? '[autocomplete="bday-day"]' : destino === 'promociones_correo' ? 'input[type="checkbox"]' : '#perfil-' + destino
      formulario.current?.querySelector<HTMLElement>(selector)?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [abierta, solicitud])
  useEffect(() => { if (medicion) return medirPerfilTrasPintado(medicion.evento, medicion.inicio) }, [medicion])
  useEffect(() => { if (!abierta && !sucio && !ocupado && !incierto) { setBase(perfil); cambiar(editableDe(perfil)) } }, [perfil, abierta, sucio, ocupado, incierto])
  useEffect(() => {
    const prevenir = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    if (sucio || ocupado || incierto) window.addEventListener('beforeunload', prevenir)
    return () => window.removeEventListener('beforeunload', prevenir)
  }, [sucio, ocupado, incierto])
  function confirmar(p: PerfilDatos) {
    alGuardar(p); setBase(p); cambiar(editableDe(p)); setActual(null); setIncierto(false)
    informar('Tu perfil quedó guardado.'); fallar(''); ocupar(false); abrir(false); setRevision('')
    alConfirmar?.(guardadoPendiente.current)
    guardadoPendiente.current = null
  }
  async function revisar() {
    const inicio = performance.now()
    ocupar(true)
    const r = await api.recuperarPerfil()
    if (!vivo.current) return
    ocupar(false)
    if (!r.ok) { fallar(r.error); setMedicion({ evento: 'recuperacion_error', inicio }); return }
    alGuardar(r.datos.perfil)
    if (incierto && iguales(editableDe(r.datos.perfil), normalizarPerfil(valores))) { confirmar(r.datos.perfil); setMedicion({ evento: 'recuperacion_confirmada', inicio }); return }
    setActual(r.datos.perfil); elegir({}); setIncierto(false); setCampo(null)
    fallar('Compará tu borrador con lo que está guardado. Ningún cambio se aplicará hasta que vuelvas a guardar.')
    setMedicion({ evento: 'recuperacion_revision', inicio })
  }
  const conflictos = actual ? camposPerfil.filter(k => valores[k] !== base[k] && actual[k] !== base[k] && valores[k] !== actual[k]) : []
  function conciliar() {
    if (!actual || conflictos.some(k => !elecciones[k])) return
    const siguiente = editableDe(actual)
    for (const k of camposPerfil) if (valores[k] !== base[k] && elecciones[k] !== 'guardado') {
      // La asignación conserva el tipo de cada campo del contrato.
      Object.assign(siguiente, { [k]: valores[k] })
    }
    setBase(actual); cambiar(siguiente); setActual(null); setCampo(null); fallar(''); informar('Borrador conciliado. Revisalo y guardá los cambios.')
  }
  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (ocupado || actual || incierto) return
    const normalizados = normalizarPerfil(valores)
    if (enfocado && campo && camposPerfil.some(k => k !== campo && normalizados[k] !== base[k])) {
      setCampo(null)
      setRevision('Tenés cambios pendientes en otros datos. Revisá el formulario completo antes de guardarlos.')
      return
    }
    const invalidos = erroresPerfil(valores)
    setErrores(invalidos)
    if (Object.keys(invalidos).length) {
      if (campo && Object.keys(invalidos).some(k => k !== campo)) {
        setCampo(null)
        setRevision('Hay otro dato que necesita revisión antes de guardar.')
      }
      requestAnimationFrame(() => formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    guardadoPendiente.current = campo
    ocupar(true); fallar(''); informar('Guardando tu perfil…')
    const inicio = performance.now()
    const r = await api.guardarPerfil({ ...valores, version: base.version })
    if (!vivo.current) return
    if (r.ok) confirmar(r.datos.perfil)
    else { fallar(r.error); ocupar(false); informar(''); setIncierto(!!r.resultadoIncierto || r.codigo === 409) }
    setMedicion({ evento: r.ok ? 'guardado_confirmado' : r.codigo === 409 ? 'guardado_conflicto' : r.resultadoIncierto ? 'guardado_incierto' : 'guardado_error', inicio })
  }
  function cerrar() {
    abrir(false)
    if (ocupado) informar('El guardado sigue en curso. Podés volver a abrir el panel para consultar el resultado.')
    else if (sucio) informar('Conservamos tu borrador mientras permanezcas en Perfil. Abrí el editor para continuar.')
  }
  function editarTodo() {
    destinoFoco.current = 'nombre'
    setCampo(null)
    setRevision('')
    abrir(true)
    if (abierta) requestAnimationFrame(() => formulario.current?.querySelector<HTMLElement>('#perfil-nombre')?.focus())
  }
  const clase = 'mt-2 min-h-12 w-full rounded-troquel border border-filete bg-papel px-3 py-2 font-texto text-cuerpo text-tinta'
  return <>
    <Boton ancho tono={enfocado ? 'tenue' : 'primario'} className={enfocado ? 'mt-4 perfil-editar-general' : 'mt-4'} onClick={editarTodo}>{sucio ? 'Continuar edición de mi perfil' : 'Editar mi perfil'}</Boton>
    <p role={abierta ? undefined : 'status'} aria-atomic="true" className="mt-3 t-caption">{abierta ? '' : estado}</p>
    {!abierta && error && <p role="alert" className="t-caption text-achiote">{error} Abrí el editor para continuar.</p>}
    <Hoja abierta={abierta} alCerrar={cerrar} titulo={campo ? etiquetas[campo] : 'Editar mi perfil'}>
      <form ref={formulario} onSubmit={guardar} noValidate className={'cuenta-editor space-y-4' + (campo ? ' cuenta-editor-enfocado' : '')}>
        <p className="t-caption">{campo ? 'Al cerrar conservamos tu borrador mientras estés en Perfil.' : 'Podés dejar vacías tus preferencias. Al cerrar este panel conservamos el borrador mientras estés en Perfil.'}</p>
        {revision && <p className="t-caption">{revision}</p>}
        {(['nombre', 'bebida_siempre', 'alergias'] as const).filter(k => !campo || k === campo).map(k => <div key={k}>
          <label htmlFor={'perfil-' + k} className="block t-caption">{etiquetas[k]}{k !== 'nombre' && ' · opcional'}</label>
          <input id={'perfil-' + k} className={clase} autoComplete={k === 'nombre' ? 'name' : 'off'}
            required={k === 'nombre'} value={valores[k]} disabled={ocupado || !!actual || incierto}
            aria-invalid={!!errores[k]} aria-describedby={'perfil-' + k + '-ayuda'}
            onChange={e => { cambiar({ ...valores, [k]: e.target.value }); setErrores({ ...errores, [k]: undefined }) }} />
          <p id={'perfil-' + k + '-ayuda'} className="t-caption">{errores[k] || (k === 'nombre' ? 'De 2 a 80 caracteres.' : k === 'alergias' ? 'Hasta 240 caracteres. Avisá también a quien te atiende al hacer tu pedido.' : 'Hasta 120 caracteres.')}</p>
        </div>)}
        {(!campo || campo === 'cumple') && <fieldset disabled={ocupado || !!actual || incierto} aria-describedby="perfil-cumple-ayuda">
          <legend className="t-caption">Tu cumpleaños · opcional</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="t-caption">Día<input className={clase} aria-invalid={!!errores.cumple} aria-describedby="perfil-cumple-ayuda" autoComplete="bday-day" inputMode="numeric"
              value={valores.cumple.split('-')[1] ?? ''} onChange={e => cambiar({ ...valores, cumple: (valores.cumple.split('-')[0] || '') + '-' + e.target.value })} /></label>
            <label className="t-caption">Mes<select aria-label="Mes" aria-invalid={!!errores.cumple} aria-describedby="perfil-cumple-ayuda" className={clase} autoComplete="bday-month" value={valores.cumple.split('-')[0] || ''}
              onChange={e => cambiar({ ...valores, cumple: e.target.value + '-' + (valores.cumple.split('-')[1] || '') })}>
              <option value="">Sin mes</option>{['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((mes, i) => <option key={mes} value={String(i+1).padStart(2,'0')}>{mes}</option>)}
            </select></label>
          </div>
          <p id="perfil-cumple-ayuda" className="t-caption">{errores.cumple || 'Solo día y mes, para que el equipo pueda conocer tu cumpleaños. No implica una recompensa.'}</p>
          <Boton tono="tenue" onClick={() => cambiar({ ...valores, cumple: '' })}>Quitar cumpleaños</Boton>
        </fieldset>}
        {(!campo || campo === 'promociones_correo') && <><label className="flex gap-3 t-caption"><input type="checkbox" className="size-5 shrink-0" checked={valores.promociones_correo} disabled={ocupado || !!actual || incierto}
          onChange={e => cambiar({ ...valores, promociones_correo: e.target.checked })} />Quiero recibir promociones y novedades de La Bella Lupita por correo electrónico (opcional).</label>
        <p className="t-caption">Podés retirar este permiso aquí. Los códigos de acceso y comunicaciones necesarias para tus compras son independientes.</p></>}
        <p role={abierta ? 'status' : undefined} aria-atomic="true" className="t-caption">{abierta ? estado : ''}</p>
        {abierta && error && <p role="alert" className="t-caption text-achiote">{error}</p>}
        {incierto && <Boton ancho tono="claro" disabled={ocupado} onClick={() => void revisar()}>Consultar versión guardada</Boton>}
        {actual && <div className="space-y-3">
          {camposPerfil.filter(k => actual[k] !== base[k] || valores[k] !== base[k]).map(k => <fieldset key={k} className="border border-filete p-3 break-words">
            <legend className="t-caption">{etiquetas[k]}</legend><p className="t-caption">Guardado: {mostrar(actual[k])}</p><p className="t-caption">Tu borrador: {mostrar(valores[k])}</p>
            {conflictos.includes(k) && <div className="space-y-2 mt-2">{(['guardado','mio'] as const).map(opcion => <label key={opcion} className="flex gap-2 t-caption"><input type="radio" name={'conflicto-' + k} checked={elecciones[k] === opcion} onChange={() => elegir({ ...elecciones, [k]: opcion })}/>{opcion === 'mio' ? 'Usar mi cambio' : 'Conservar lo guardado'}</label>)}</div>}
          </fieldset>)}
          <Boton ancho tono="claro" disabled={conflictos.some(k => !elecciones[k])} onClick={conciliar}>Continuar con los cambios elegidos</Boton>
        </div>}
        <Boton type="submit" ancho disabled={ocupado || !!actual || incierto || !sucio}>{ocupado ? 'Guardando…' : 'Guardar cambios'}</Boton>
        {campo && <Boton ancho tono="tenue" onClick={editarTodo}>Editar todos mis datos</Boton>}
      </form>
    </Hoja>
  </>
}

export function ActividadCuenta() {
  const [abierta, abrir] = useState(false)
  return <>
    <Boton ancho tono="claro" className="mt-4" onClick={() => abrir(true)}>Ver toda mi actividad</Boton>
    <Hoja abierta={abierta} alCerrar={() => abrir(false)} titulo="Tu actividad">
      {abierta && <Historial />}
    </Hoja>
  </>
}

function Historial() {
  const [tipo, filtrar] = useState<TipoActividad>('todos')
  const [filas, actualizar] = useState<Actividad[]>([])
  const [siguiente, paginar] = useState<string | null>(null)
  const [ocupado, ocupar] = useState(true)
  const [error, fallar] = useState('')
  const generacion = useRef(0)
  async function cargar(filtro: TipoActividad, cursor?: string) {
    const turno = ++generacion.current
    ocupar(true); fallar('')
    const r = await api.actividad(filtro, cursor)
    if (turno !== generacion.current) return
    ocupar(false)
    if (!r.ok) { fallar(r.error); return }
    actualizar(prev => cursor ? [...new Map([...prev, ...r.datos.movimientos].map(m => [m.id, m])).values()] : r.datos.movimientos)
    paginar(r.datos.siguiente)
  }
  useEffect(() => {
    actualizar([]); paginar(null); void cargar(tipo)
    return () => { generacion.current++ }
  }, [tipo])
  const filtros: [TipoActividad, string][] = [['todos', 'Todo'], ['dinero', 'Dinero'], ['puntos', 'Puntos'], ['sellos', 'Sellos'], ['canjes', 'Canjes']]
  return <div className="space-y-4">
    <p className="t-caption">El dinero paga tus compras. Los puntos indican tu nivel. Los sellos completan tu tanda.</p>
    <div role="group" aria-label="Filtrar actividad" className="cuenta-filtros flex flex-wrap gap-2">
      {filtros.map(([valor, nombre]) => <Boton key={valor} tono={tipo === valor ? 'primario' : 'claro'} aria-pressed={tipo === valor} onClick={() => filtrar(valor)}>{nombre}</Boton>)}
    </div>
    <ul key={tipo} className="cuenta-movimientos divide-y divide-filete" aria-label="Movimientos de tu cuenta" aria-busy={ocupado}>
      {filas.map(m => <li key={m.id} className="flex justify-between gap-3 py-3">
        <div className="min-w-0"><p className="break-words font-texto text-cuerpo text-tinta">{m.concepto}</p>
          <p className="t-caption">{new Intl.DateTimeFormat('es-NI', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Managua' }).format(new Date(m.creado))}</p></div>
        <span className="shrink-0 font-texto text-cuerpo tabular-nums">{m.tipo === 'dinero' ? cordobas(m.cantidad) : `${m.cantidad} ${m.tipo === 'puntos' ? 'pts' : m.tipo === 'sellos' ? 'sello' : 'uso'}`}</span>
      </li>)}
    </ul>
    {ocupado && <p role="status" className="t-caption">Cargando actividad…</p>}
    {!ocupado && !error && filas.length === 0 && <p role="status" className="t-caption">Todavía no hay movimientos en este filtro</p>}
    <p role="status" aria-atomic="true" className="t-caption">{!ocupado && !error && filas.length > 0 ? `${filas.length} movimientos cargados.${siguiente ? '' : ' Llegaste al final del historial.'}` : ''}</p>
    {error && <div role="alert"><p className="t-caption text-achiote">{error}</p><Boton tono="claro" onClick={() => void cargar(tipo, siguiente ?? undefined)}>Reintentar</Boton></div>}
    {!error && siguiente && <Boton ancho tono="claro" disabled={ocupado} onClick={() => void cargar(tipo, siguiente)}>Ver más movimientos</Boton>}
  </div>
}
