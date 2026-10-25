/** Perfil: preferencias, dinero y acceso conservan sus recursos independientes. */
import { useEffect, useState, type KeyboardEvent } from 'react'
import { Boton, Icono } from '../componentes/Base'
import { Tarjeta } from '../componentes/Superficies'
import { EditarPerfil, ActividadCuenta } from '../componentes/CuentaCliente'
import { AtencionCliente } from '../componentes/Atencion'
import { cordobas, fechaCorta, nivelDe, puntos, useDatos } from '../datos'
import { usePedido } from '../pedido'
import '../estilos/redisenio-cuenta.css'
import './PerfilExperiencia.css'

const paneles = [{ id: 'gusto', nombre: 'A tu gusto' }, { id: 'cuenta', nombre: 'Tu cuenta' }, { id: 'datos', nombre: 'Datos y ayuda' }] as const
type Panel = typeof paneles[number]['id']
type Campo = 'nombre' | 'bebida_siempre' | 'alergias' | 'cumple' | 'promociones_correo'

export function Perfil({ navegar }: { navegar: (r: string) => void }) {
  const { yo, error: cuentaError, cuentaCargando, refrescarCuenta, perfil, perfilError, perfilCargando, refrescarPerfil, aplicarPerfil, salir: cerrarSesion } = useDatos()
  const pedido = usePedido()
  const [cerrando, setCerrando] = useState(false), [errorSalida, setErrorSalida] = useState('')
  const [compartido, setCompartido] = useState(''), [errorCopia, setErrorCopia] = useState(false)
  const [panel, setPanel] = useState<Panel>('gusto')
  const [destinoHash, setDestinoHash] = useState<string | null>(null)
  const [solicitud, setSolicitud] = useState<{ campo: Campo; turno: number }>()
  const [confirmado, setConfirmado] = useState<Campo | 'perfil' | null>(null)
  const nivel = nivelDe(yo)
  const importe = yo ? cordobas(yo.saldo.total).split(' ') : []
  const cumpleDia = perfil?.cumple ? String(Number(perfil.cumple.split('-')[1])) : null
  const cumpleMes = perfil?.cumple ? new Intl.DateTimeFormat('es-NI', { month: 'long', timeZone: 'UTC' }).format(new Date('2000-' + perfil.cumple + 'T12:00:00Z')) : null
  useEffect(() => { void refrescarPerfil(true) }, [refrescarPerfil])
  useEffect(() => {
    const revisarHash = () => {
      const destino = location.hash.slice(1)
      const destinoPanel = destino === 'perfil-cuenta' ? 'cuenta' : ['perfil-ayuda', 'perfil-comunicaciones'].includes(destino) ? 'datos' : destino === 'perfil-identidad' ? 'gusto' : null
      if (!destinoPanel) return
      setPanel(destinoPanel)
      setDestinoHash(destino)
    }
    revisarHash(); window.addEventListener('hashchange', revisarHash)
    return () => window.removeEventListener('hashchange', revisarHash)
  }, [])
  useEffect(() => {
    if (!destinoHash) return
    const destino = document.getElementById(destinoHash)
    if (destino) { destino.focus(); setDestinoHash(null) }
  }, [destinoHash, panel, perfil])
  function editar(campo: Campo) { setConfirmado(null); setSolicitud(s => ({ campo, turno: (s?.turno ?? 0) + 1 })) }
  const confirmacion = (campo: Campo | 'perfil') => confirmado === campo ? <span className="perfil-confirmacion"><Icono nombre="check_circle" tam={16}/>{campo === 'perfil' ? 'Perfil actualizado' : 'Guardado'}</span> : null
  function mostrarDatos() {
    setPanel('datos')
    requestAnimationFrame(() => document.getElementById('perfil-ayuda')?.focus())
  }
  function moverPestana(e: KeyboardEvent<HTMLButtonElement>, actual: number) {
    const siguiente = e.key === 'ArrowRight' ? (actual + 1) % paneles.length : e.key === 'ArrowLeft' ? (actual + paneles.length - 1) % paneles.length : e.key === 'Home' ? 0 : e.key === 'End' ? paneles.length - 1 : null
    if (siguiente === null) return
    e.preventDefault(); setPanel(paneles[siguiente].id)
    document.getElementById('perfil-tab-' + paneles[siguiente].id)?.focus()
  }
  async function salir(todas = false) {
    setCerrando(true); setErrorSalida('')
    try { await cerrarSesion(todas); pedido.vaciar(); navegar('/') }
    catch (e) { setErrorSalida(e instanceof Error ? e.message : 'No pudimos cerrar la sesión. Intentá de nuevo.') }
    finally { setCerrando(false) }
  }
  async function compartir() {
    try { await navigator.clipboard.writeText(window.location.origin + '/'); setCompartido('Enlace del Club copiado.'); setErrorCopia(false) }
    catch { setErrorCopia(true) }
  }
  return <>
    <main id="contenido" tabIndex={-1} className="marco casa-perfil cuenta-perfil perfil-experiencia">
      <div className="perfil-cabecera"><button type="button" onClick={() => navegar('/')} aria-label="Volver a Inicio"><Icono nombre="arrow_back" tam={22}/></button><h1>Tu perfil</h1><p>A tu manera</p></div>
      {!perfil ? <Tarjeta className="perfil-sin-datos">
        <p role={perfilCargando ? 'status' : 'alert'}>{perfilCargando ? 'Cargando tu perfil…' : perfilError || 'No pudimos leer tu perfil.'}</p>
        {!perfilCargando && <Boton onClick={() => void refrescarPerfil(true)}>Volver a intentar</Boton>}
      </Tarjeta> : <header className="perfil-portada">
        <div className="perfil-portada-persona">
          <div className="perfil-saludo"><span className="perfil-monograma" aria-hidden="true">{perfil.nombre.trim().charAt(0).toUpperCase()}</span><div><h2 id="perfil-identidad" tabIndex={-1}>{perfil.nombre}</h2><p className="perfil-antiguedad">En la casa desde {new Intl.DateTimeFormat('es-NI', { month: 'long', year: 'numeric', timeZone: 'America/Managua' }).format(new Date(perfil.creado))}.</p>{confirmacion('nombre')}</div></div>
          <div className="perfil-editor-acceso"><EditarPerfil key={perfil.id} perfil={perfil} alGuardar={aplicarPerfil} solicitud={solicitud} enfocado alConfirmar={campo => setConfirmado(campo ?? 'perfil')} />{confirmacion('perfil')}</div>
          {perfilError && <div role="alert" className="perfil-lectura-error"><p>No pudimos actualizar estos datos. Mostramos la última lectura confirmada.</p><Boton tono="claro" onClick={() => void refrescarPerfil(true)}>Actualizar perfil</Boton></div>}
        </div>
      </header>}
      <div className="perfil-selector" data-panel={panel} role="tablist" aria-label="En tu perfil">
        {paneles.map((p, i) => <button id={'perfil-tab-' + p.id} type="button" role="tab" aria-selected={panel === p.id} aria-controls={'perfil-panel-' + p.id} tabIndex={panel === p.id ? 0 : -1} key={p.id} onClick={() => setPanel(p.id)} onKeyDown={e => moverPestana(e, i)}>{p.nombre}</button>)}
      </div>
      <section id="perfil-panel-gusto" className="perfil-panel" role="tabpanel" aria-labelledby="perfil-tab-gusto" hidden={panel !== 'gusto'} tabIndex={0}>
        {perfil && <>
          <div className="perfil-preferencias-nuevas">
            <button type="button" className="perfil-preferencia perfil-bebida" data-extensa={(perfil.bebida_siempre?.length ?? 0) > 48} onClick={() => editar('bebida_siempre')} aria-label={'Cambiar tu bebida de siempre: ' + (perfil.bebida_siempre || 'sin indicar')}>
              <span className="perfil-bebida-contenido"><span className="perfil-preferencia-cabecera">Tu bebida de siempre</span><strong>{perfil.bebida_siempre || '¿Cuál es la tuya?'}</strong>{confirmacion('bebida_siempre')}</span>
              <span className="perfil-bebida-arte" aria-hidden="true"><span className="perfil-bebida-orbita"/><span className="perfil-bebida-foto"><img src="/images/latte-logo-mesa-480.webp" alt="" width={480} height={480}/></span><span className="perfil-bebida-sello">Un momento en la casa</span></span>
              <span className="perfil-preferencia-pie">{perfil.bebida_siempre ? 'Cambiar mi preferencia' : 'Contanos cómo te gusta'}<span className="perfil-flecha"><Icono nombre="arrow_forward" tam={20}/></span></span>
            </button>
            <div className="perfil-preferencias-secundarias">
              <button type="button" className="perfil-preferencia perfil-cumple" onClick={() => editar('cumple')} aria-label="Editar tu cumpleaños">
                <span className="perfil-cumple-contenido"><span className="perfil-preferencia-cabecera">Tu cumpleaños</span>{cumpleDia ? <strong className="perfil-cumple-fecha"><span className="perfil-cumple-dia">{cumpleDia}</span><span className="perfil-cumple-mes">de {cumpleMes}</span></strong> : <strong className="perfil-cumple-vacio">Tu día,<br/>a tu manera.</strong>}{confirmacion('cumple')}</span>
                <span className="perfil-cumple-arte" aria-hidden="true"><img src="/images/perfil-celebracion-480.webp" alt="" width={480} height={480}/></span>
                <span className="perfil-cumple-pie">{perfil.cumple ? 'Una fecha muy tuya' : 'Añadí tu fecha · opcional'}<span className="perfil-flecha"><Icono nombre="arrow_forward" tam={20}/></span></span>
              </button>
              <div className="perfil-alergias"><div className="perfil-alergias-cabecera"><span className="perfil-alergias-icono"><Icono nombre="warning" tam={22}/></span><span className="perfil-preferencia-cabecera">Alergias</span><button type="button" onClick={() => editar('alergias')}>Editar</button></div><strong>{perfil.alergias || 'No indicaste alergias'}</strong>{confirmacion('alergias')}<p>Avisá y confirmá tus alergias con quien te atiende antes de pedir.</p></div>
            </div>
          </div>
          <details className="perfil-detalle"><summary>Cómo usamos tus preferencias</summary><p>Son opcionales. El nombre identifica tu cuenta; bebida, cumpleaños y alergias ayudan al equipo a conocer tus preferencias. Administración puede consultar tu ficha. Si confirmás una restricción al pedir en Carta, caja y cocina reciben esa indicación para ese pedido.</p><p>El cumpleaños no implica una recompensa. Podés borrar estos datos desde el editor.</p></details>
        </>}
        <section className="perfil-invitacion-nueva" aria-labelledby="perfil-invitar"><div><p className="perfil-antetitulo">Lo bueno se comparte</p><h3 id="perfil-invitar">Hay lugar para alguien más.</h3></div><div><Boton tono="claro" onClick={() => void compartir()}>Copiar enlace del Club</Boton><p role="status">{compartido}</p>{errorCopia && <p role="alert">No pudimos copiarlo. Podés compartir <a href={window.location.origin + '/'}>{window.location.host}</a>.</p>}</div></section>
      </section>
      <section id="perfil-panel-cuenta" className="perfil-panel perfil-panel-cuenta" role="tabpanel" aria-labelledby="perfil-tab-cuenta" hidden={panel !== 'cuenta'} tabIndex={0}>
        <div className="perfil-cuenta-resumen" aria-labelledby="perfil-cuenta"><p className="perfil-antetitulo">Cuenta de Casa</p><h3 id="perfil-cuenta" tabIndex={-1}>Tu saldo disponible</h3>{yo ? <><p className="cuenta-importe"><span className="perfil-moneda">{importe[0]}</span>{' '}<span className="perfil-cifra">{importe.slice(1).join(' ')}</span></p><p>Para tus compras en la casa. Recargás en caja.</p></> : <p role={cuentaCargando ? "status" : "alert"}>{cuentaCargando ? "Consultando tu cuenta…" : "El resumen de saldo no está disponible. Podés consultar tu actividad o volver a intentar."}</p>}{yo && cuentaError && <p role="alert">No pudimos actualizar la cuenta. El saldo y los movimientos corresponden a la última consulta disponible.</p>}<div className="perfil-cuenta-acciones"><Boton tono="claro" cargando={cuentaCargando} onClick={() => void refrescarCuenta(true)}>Actualizar cuenta</Boton><Boton tono="tenue" onClick={() => navegar('/compras')}>Mis compras y reservas</Boton></div></div>
        <div className="perfil-movimientos"><h3>Últimos movimientos de dinero</h3>{yo ? <><ul>{yo.movimientos.slice(0, 4).map(m => <li key={m.id}><span><strong>{m.concepto}</strong><small>{fechaCorta(m.creado)}</small></span><span className={m.monto < 0 ? 'perfil-movimiento-cargo' : ''}>{m.monto < 0 ? cordobas(m.monto) : '+' + cordobas(m.monto)}</span></li>)}</ul>{yo.movimientos.length === 0 && <p>Todavía no hay movimientos de dinero.</p>}</> : <p>{cuentaCargando ? 'Consultando los últimos movimientos…' : 'Los últimos movimientos no están disponibles.'}</p>}<ActividadCuenta/><section className="perfil-nivel-nuevo" aria-labelledby="perfil-club"><p className="perfil-antetitulo">Tu Club</p><h3 id="perfil-club">{nivel?.nombre || 'El gusto de volver'}</h3>{nivel && <p>{nivel.medido ? `${puntos(nivel.puntos ?? 0)} acumulados. ${nivel.siguiente ? `${puntos(nivel.faltan)} para ${nivel.siguiente}.` : 'Alcanzaste el nivel más alto.'}` : 'Consultá las reglas y tu actividad en Mi Club.'}</p>}{yo?.membresia && <p>Mesa Fundadora · #{String(yo.membresia.numero).padStart(3, '0')}</p>}<Boton tono="tenue" onClick={() => navegar('/club')}>Ver Mi Club y sus reglas</Boton><details className="perfil-detalle"><summary>Puntos, sellos y membresía</summary><p>El saldo es dinero para tus compras. Los puntos indican tu nivel y los sellos completan tu tanda. La Mesa Fundadora es una membresía pagada con sus propias condiciones.</p></details></section></div>
      </section>
      <section id="perfil-panel-datos" className="perfil-panel perfil-panel-datos" role="tabpanel" aria-labelledby="perfil-tab-datos" hidden={panel !== 'datos'} tabIndex={0}>
        <div className="perfil-datos-columna">{perfil && <><section className="perfil-acceso" aria-labelledby="perfil-acceso-titulo"><p className="perfil-antetitulo">Tu acceso</p><h3 id="perfil-acceso-titulo">Tus datos de acceso</h3><dl className="perfil-contacto"><div><dt>Correo de acceso</dt><dd>{perfil.correo || 'Sin correo vinculado'}<small>{perfil.correo_verificado ? 'Verificado' : 'Sin verificación registrada'}</small></dd></div><div><dt>Teléfono de contacto</dt><dd className="perfil-telefono">{perfil.telefono}</dd></div></dl><p>Para cambiar tu correo o teléfono, el equipo debe verificar tu identidad.</p><button type="button" className="perfil-enlace" onClick={mostrarDatos}>Ayuda con mi cuenta <Icono nombre="arrow_forward" tam={18}/></button></section>
          <section className="perfil-comunicaciones" aria-labelledby="perfil-comunicaciones"><h3 id="perfil-comunicaciones" tabIndex={-1}>Tus datos y mensajes</h3><p>Promociones por correo: {perfil.promociones_correo ? 'aceptadas' : 'no aceptadas'}.</p><button type="button" className="perfil-enlace" onClick={() => editar('promociones_correo')}>Cambiar mi preferencia <Icono nombre="arrow_forward" tam={18}/></button>{confirmacion('promociones_correo')}<details className="perfil-detalle"><summary>Privacidad y control de tus datos</summary><p>Esta preferencia no afecta los códigos de acceso ni los mensajes necesarios para tus compras. Aquí no se administra un permiso para promociones por WhatsApp.</p><p>Podés borrar tus preferencias opcionales desde el editor. Quitar el cumpleaños borra también el año si lo habías registrado. Para obtener tus datos o solicitar la baja de la cuenta, usá Ayuda con mi cuenta. Una solicitud no cancela compras, membresías ni saldos automáticamente.</p><button type="button" className="perfil-enlace" onClick={mostrarDatos}>Solicitar ayuda con mis datos</button></details></section></>}
          <details className="perfil-detalle perfil-sesion-nueva"><summary>Sesión y dispositivos</summary><p>Tu acceso dura hasta 30 días. Cerrá esta sesión en un dispositivo compartido; también podés cerrar los demás dispositivos y volver a entrar con tu correo.</p>{errorSalida && <p role="alert">{errorSalida}</p>}<Boton tono="tenue" ancho cargando={cerrando} onClick={() => void salir()}>Cerrar sesión</Boton><Boton tono="claro" ancho disabled={cerrando} onClick={() => void salir(true)}>Cerrar sesión en todos mis dispositivos</Boton></details>
        </div>
        <section id="perfil-ayuda" tabIndex={-1} className="perfil-ayuda" aria-label="Ayuda con mi cuenta"><AtencionCliente cuenta progresiva mostrarMotivoCompleto/></section>
      </section>
    </main>
  </>
}

