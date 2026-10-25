import { useEffect, useState } from 'react'
import { CARTA } from '../../data/menu'
import { Boton } from '../componentes/Base'
import { operacion } from '../operacion'
import { Aviso, useAccion, useLectura } from './comun'
type Ficha = { producto: string; porcion: string; componentes: string; fuente: string; foto_verificada: boolean; revision: number; responsable?: string; revisado?: string }
const nueva = (producto: string): Ficha => ({ producto, porcion: '', componentes: '', fuente: '', foto_verificada: false, revision: 0 })
export function FichasCarta({ token }: { token: string }) {
  const l = useLectura<{ fichas: Ficha[] }>('/operacion/carta/fichas', token), a = useAccion()
  const [producto, setProducto] = useState('pizza-cuatro-estaciones'), [f, setF] = useState<Ficha>(() => nueva('pizza-cuatro-estaciones')), [editado, setEditado] = useState(false), [confirmada, setConfirmada] = useState(false)
  useEffect(() => { if (!editado && l.datos) setF(l.datos.fichas.find(f => f.producto === producto) ?? nueva(producto)) }, [producto, editado, l.datos])
  const cambiar = (c: Partial<Ficha>) => { setEditado(true); setConfirmada(false); setF({ ...f, ...c }) }
  return <details className="equipo-tarjeta mb-6"><summary className="min-h-11 cursor-pointer font-semibold">Fichas verificadas con cocina</summary><Aviso error={l.error || a.error} mensaje={a.mensaje}/>
    <p className="equipo-nota mt-3">Publicá porción y componentes solo después de contrastarlos con cocina. No infieras garantías dietéticas. La foto se presenta como referencia hasta verificar que corresponde al producto servido. Prioridad: platos de mayor demanda y Pizza Cuatro Estaciones.</p>
    <label className="equipo-campo mt-3">Producto<select value={producto} disabled={editado} onChange={e => { setProducto(e.target.value); setConfirmada(false) }}>{CARTA.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>
    <label className="equipo-campo">Porción o tamaño confirmado<input value={f.porcion} maxLength={120} onChange={e => cambiar({ porcion: e.target.value })}/></label>
    <label className="equipo-campo">Componentes confirmados<textarea value={f.componentes} maxLength={600} onChange={e => cambiar({ componentes: e.target.value })}/></label>
    <label className="equipo-campo">Fuente de verificación<input value={f.fuente} maxLength={200} placeholder="Receta vigente, responsable de cocina y fecha" onChange={e => cambiar({ fuente: e.target.value })}/></label>
    <label className="block mt-3"><input type="checkbox" checked={f.foto_verificada} onChange={e => cambiar({ foto_verificada: e.target.checked })}/> Verifiqué que la fotografía corresponde al producto servido.</label>
    <label className="block mt-3"><input type="checkbox" checked={confirmada} onChange={e => setConfirmada(e.target.checked)}/> Confirmo con cocina los datos que voy a publicar.</label>
    <div className="equipo-acciones mt-4"><Boton cargando={a.ocupado} disabled={!editado || !confirmada || !f.fuente.trim()} onClick={() => void (async () => { if (await a.ejecutar(() => operacion('/operacion/carta/fichas/' + producto, { ...f, confirmada }, token).then(() => {}), 'Ficha publicada y revisión registrada.')) { setEditado(false); setConfirmada(false); await l.refrescar() } })()}>Publicar ficha revisada</Boton><Boton tono="tenue" disabled={a.ocupado} onClick={() => { setEditado(false); setConfirmada(false); void l.refrescar() }}>Descartar y recargar</Boton></div>
    {f.revisado && <p className="equipo-nota mt-3">Última revisión {new Date(f.revisado).toLocaleDateString('es-NI')} · versión {f.revision} · responsable {f.responsable}</p>}
  </details>
}
