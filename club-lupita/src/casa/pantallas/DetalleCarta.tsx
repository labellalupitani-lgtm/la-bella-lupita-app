import '../estilos/redisenio-comercio.css'
import { useLayoutEffect, useRef, useState } from 'react'
import { Boton, Icono } from '../componentes/Base'
import { FotoCarta } from '../componentes/FotoCarta'
import { cordobas } from '../datos'
import type { PlatoCarta } from '../../data/menu'
import { opcionesDe, type Elecciones } from '../../compartido/carta'

/** La ficha nativa se cierra antes de restaurar el foco, cuando el fondo vuelve a estar disponible. */
export function DetalleCarta({ plato, alCerrar, alAgregar, bloqueo, alIngresar, maximo, disparador, empaque }: {
  plato: PlatoCarta; alCerrar: () => void; alAgregar: (cantidad: number, opciones: Elecciones) => void;
  bloqueo?: 'sin-cuenta' | 'agotado' | 'pendiente'; alIngresar: () => void; maximo: number; disparador: HTMLElement | null; empaque: number;
}) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const [cantidad, setCantidad] = useState(1), [opciones, setOpciones] = useState<Elecciones>({})
  const definiciones = opcionesDe(plato.id), incompleto = definiciones.some(d => d.obligatoria && !opciones[d.id]?.trim())
  useLayoutEffect(() => {
    const d = dialogo.current, previo = disparador ?? document.activeElement as HTMLElement | null, overflow = document.body.style.overflow
    d?.showModal(); document.body.style.overflow = 'hidden'
    return () => {
      d?.close(); document.body.style.overflow = overflow
      queueMicrotask(() => {
        const destino = previo?.isConnected && previo !== document.body ? previo : document.querySelector<HTMLElement>('.casa-carta-buscador input') ?? document.getElementById('contenido')
        if (disparador?.isConnected) destino?.focus({ preventScroll: true })
        // Al recargar una ficha no existe un botón de origen. history.back()
        // restaura el desplazamiento después de desmontar el diálogo: esperar
        // ese pintado antes de mostrar el buscador de respaldo.
        else requestAnimationFrame(() => requestAnimationFrame(() => {
          if (!destino?.isConnected || document.querySelector('dialog[open]')) return
          destino.focus({ preventScroll: true })
          destino.scrollIntoView({ block: 'center', behavior: 'instant' })
        }))
      })
    }
  }, [disparador])
  return <dialog ref={dialogo} className="casa-detalle-dialogo" aria-labelledby="casa-detalle-titulo" onCancel={e => { e.preventDefault(); alCerrar() }} onClick={e => { if (e.target === e.currentTarget) alCerrar() }}>
    <section className="casa-detalle-panel">
      <div className="casa-detalle-cabecera"><p className="t-eyebrow text-achiote">De la carta de la casa</p><button type="button" onClick={alCerrar} aria-label="Cerrar panel">Cerrar <Icono nombre="close" tam={20}/></button></div>
      <div className="casa-detalle-contenido" tabIndex={0} role="region" aria-label="Detalles del producto">
        <div className={'carta-detalle-identidad' + (!plato.foto ? ' carta-detalle-sin-foto' : '')}>
          {plato.foto && <div className="casa-detalle-foto" data-plato={plato.id}><FotoCarta key={plato.foto} foto={plato.foto} nombre={plato.nombre} prioridad sizes="(min-width: 900px) 330px, 90vw"/></div>}
          <div><h2 id="casa-detalle-titulo" className="font-titular text-grande text-banda">{plato.nombre}</h2><p className="carta-detalle-precio">{cordobas(plato.precio)} <span>por unidad</span></p><p className="t-cuerpo mt-5">{plato.descripcion}</p></div>
        </div>
        {plato.foto && <p className="t-caption mt-2">{plato.informacion?.fotoVerificada ? 'Fotografía verificada por la casa.' : 'Imagen de referencia.'}</p>}
        <dl className="mt-4"><dt className="font-semibold">Porción o tamaño</dt><dd>{plato.informacion?.porcion || 'Consultá el tamaño y la porción en barra.'}</dd>{plato.informacion?.componentes && <><dt className="font-semibold mt-3">Componentes confirmados</dt><dd>{plato.informacion.componentes}</dd></>}</dl>
        {plato.informacion && <p className="t-caption mt-2">Información revisada por la casa el {new Date(plato.informacion.revisado).toLocaleDateString('es-NI', { timeZone: 'America/Managua' })}.</p>}
        {plato.perfil && <p className="t-eyebrow text-achiote mt-3">{plato.perfil}</p>}
        <p className="t-caption">Para retirar en barra. Empaque: {cordobas(empaque)} por pedido, incluido en el total antes de pagar.</p>
        {definiciones.map(d => <fieldset className="carta-opcion mt-5" key={d.id}>
          <legend>{d.nombre} {d.obligatoria && <span className="t-caption">(obligatorio)</span>}</legend>
          {d.valores ? d.valores.map(v => <label key={v.id}><input type="radio" name={d.id} value={v.id} checked={opciones[d.id] === v.id} onChange={() => setOpciones(o => ({ ...o, [d.id]: v.id }))}/>{v.nombre}{v.suplemento > 0 ? ' + ' + cordobas(v.suplemento) : ''}</label>)
            : <input aria-label={d.nombre} maxLength={120} value={opciones[d.id] ?? ''} onChange={e => setOpciones(o => ({ ...o, [d.id]: e.target.value }))} placeholder="Escribí cómo lo preferís" />}
        </fieldset>)}
        {incompleto && <p className="t-caption mt-3">Completá las opciones para agregar este plato.</p>}
        {bloqueo && <p role="status" className="carta-aviso mt-3">{bloqueo === 'sin-cuenta' ? 'Ingresá a tu cuenta para pedir. Volverás a esta ficha para elegir y agregar el producto.' : bloqueo === 'agotado' ? 'Este producto está agotado por ahora. Podés seguir explorando la carta.' : 'Tu pedido anterior está pendiente de confirmación. Consultá su resultado antes de agregar más artículos.'}</p>}
        {maximo === 0 && <p role="status" className="t-caption mt-3">Alcanzaste el máximo de este producto o de artículos por pedido.</p>}
        <p className="t-caption mt-5">Si tenés una alergia o restricción, confirmá con el equipo antes de pagar. La descripción no garantiza ausencia de alérgenos.</p>
      </div>
      <div className="casa-detalle-acciones">
        {bloqueo !== 'sin-cuenta' && <div className="casa-detalle-cantidad"><button type="button" aria-label="Reducir cantidad" disabled={!!bloqueo || cantidad <= 1} onClick={() => setCantidad(c => c - 1)}><Icono nombre="remove" tam={20}/></button><output aria-live="polite">{cantidad}</output><button type="button" aria-label="Aumentar cantidad" disabled={!!bloqueo || cantidad >= maximo} onClick={() => setCantidad(c => c + 1)}><Icono nombre="add" tam={20}/></button></div>}
        {bloqueo === 'sin-cuenta' ? <Boton ancho onClick={alIngresar}>Ingresar para pedir</Boton> : <Boton disabled={!!bloqueo || incompleto || maximo < cantidad} onClick={() => { alAgregar(cantidad, opciones); alCerrar() }}>{bloqueo === 'agotado' ? 'Agotado por ahora' : bloqueo === 'pendiente' ? 'Pedido pendiente' : 'Agregar · ' + cordobas(plato.precio * cantidad)}</Boton>}
      </div>
    </section>
  </dialog>
}

