import { useEffect, useState } from 'react'
import { CARTA } from '../../data/menu'
import type { ConfiguracionCarta } from '../../compartido/carta'
import { normalizarCarta } from '../../compartido/carta'
import { Boton } from '../componentes/Base'
import { operacion } from '../operacion'
import { Aviso, useAccion, useLectura } from './comun'

type LecturaCarta = { valor: ConfiguracionCarta; revision: number; actualizado: string; responsable: string }
const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
export function CartaOperacion({ token, cocina }: { token: string; cocina: boolean }) {
  const lectura = useLectura<LecturaCarta>('/operacion/carta', token), a = useAccion()
  const [borrador, setBorrador] = useState<LecturaCarta>(), [editado, setEditado] = useState(false), [busca, setBusca] = useState('')
  useEffect(() => { if (lectura.datos && !editado) setBorrador(lectura.datos) }, [lectura.datos, editado])
  const cambiar = (cambio: Partial<ConfiguracionCarta>) => { if (borrador) { setEditado(true); setBorrador({ ...borrador, valor: { ...borrador.valor, ...cambio } }) } }
  const guardar = async () => {
    if (!borrador) return
    if (await a.ejecutar(() => operacion('/operacion/carta', { valor: borrador.valor, revision: borrador.revision }, token).then(() => {}), 'Carta actualizada. Los nuevos cobros usan estas reglas.')) { setEditado(false); await lectura.refrescar() }
  }
  const c = borrador?.valor
  return <details className="equipo-tarjeta mb-6"><summary className="min-h-11 cursor-pointer font-semibold">Disponibilidad y recepción de Carta</summary>
    <Aviso error={lectura.error || a.error} mensaje={a.mensaje}/>
    {!c ? <p role="status">Consultando configuración…</p> : <>
      <p className="equipo-nota mt-3">Los agotados y las pausas se comprueban antes de cobrar, incluso en teléfonos con la carta abierta.</p>
      {editado && lectura.datos && lectura.datos.revision !== borrador.revision && <p role="alert" className="equipo-aviso">Otra persona cambió la configuración. Recargá para revisar antes de guardar.</p>}
      <div className="equipo-filtros mt-3">
        <label>Motivo de pausa<input value={c.motivoPausa} maxLength={160} onChange={e => cambiar({ motivoPausa: e.target.value })}/></label>
        <label>Preparación estimada en minutos<input type="number" min={1} max={180} value={c.minutos ?? ''} onChange={e => cambiar({ minutos: e.target.value ? Number(e.target.value) : null })}/></label>
        <Boton tono="claro" onClick={() => cambiar({ pausaHasta: new Date(Date.now() + 30 * 60_000).toISOString() })}>Pausar 30 minutos</Boton>
        <Boton tono="tenue" onClick={() => cambiar({ pausaHasta: null, motivoPausa: '' })}>Reanudar recepción</Boton>
      </div>
      {c.pausaHasta && <p>Pausa hasta {new Date(c.pausaHasta).toLocaleString('es-NI', { timeZone: 'America/Managua' })}. Guardá para aplicarla.</p>}
      {!cocina && <>
        <div className="equipo-filtros mt-4"><label>Empaque por pedido (C$)<input type="number" min={0} max={100} step="0.01" value={c.empaque / 100} onChange={e => cambiar({ empaque: Math.round(Number(e.target.value) * 100) })}/></label><label>Máximo de pedidos en preparación<input type="number" min={1} max={500} placeholder="Sin límite configurado" value={c.capacidad ?? ''} onChange={e => cambiar({ capacidad: e.target.value ? Number(e.target.value) : null })}/></label></div>
        <fieldset className="mt-4"><legend>Horario digital · America/Managua</legend><div className="equipo-filtros">{dias.map((dia, i) => <div key={dia}><label><input type="checkbox" checked={!!c.horario[i]} onChange={e => cambiar({ horario: c.horario.map((h, n) => n === i ? e.target.checked ? { abre: '07:00', cierra: '21:00' } : null : h) })}/> {dia}</label>{c.horario[i] && <><label>Abre · {dia}<input type="time" value={c.horario[i]!.abre} onChange={e => cambiar({ horario: c.horario.map((h, n) => n === i && h ? { ...h, abre: e.target.value } : h) })}/></label><label>Cierra · {dia}<input type="time" value={c.horario[i]!.cierra} onChange={e => cambiar({ horario: c.horario.map((h, n) => n === i && h ? { ...h, cierra: e.target.value } : h) })}/></label></>}</div>)}</div></fieldset>
      </>}
      <fieldset className="mt-4"><legend>Categorías pausadas</legend><div className="equipo-filtros">{[...new Set(CARTA.map(p => p.categoria))].map(categoria => <label key={categoria}><input type="checkbox" checked={c.categoriasPausadas.includes(categoria)} onChange={e => cambiar({ categoriasPausadas: e.target.checked ? [...c.categoriasPausadas, categoria] : c.categoriasPausadas.filter(x => x !== categoria) })}/> {categoria.replaceAll('-', ' ')}</label>)}</div></fieldset>
      <label className="equipo-campo mt-4">Buscar producto para marcar agotado<input type="search" value={busca} onChange={e => setBusca(e.target.value)}/></label>
      <fieldset><legend>Productos agotados ({c.agotados.length})</legend><div className="equipo-filtros">{CARTA.filter(p => normalizarCarta(p.nombre).includes(normalizarCarta(busca))).map(p => <label key={p.id}><input type="checkbox" checked={c.agotados.includes(p.id)} onChange={e => cambiar({ agotados: e.target.checked ? [...c.agotados, p.id] : c.agotados.filter(x => x !== p.id) })}/> {p.nombre}</label>)}</div></fieldset>
      <div className="equipo-acciones mt-4"><Boton cargando={a.ocupado} disabled={!editado} onClick={() => void guardar()}>Guardar reglas de Carta</Boton><Boton tono="tenue" disabled={a.ocupado} onClick={() => { setEditado(false); void lectura.refrescar() }}>Descartar y recargar</Boton></div>
      <p className="equipo-nota mt-3">Versión {borrador.revision}. Toda actualización conserva responsable y cambios en auditoría. La estimación orienta al cliente; se revisa con los tiempos reales de preparación.</p>
    </>}
  </details>
}
