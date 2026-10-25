import { Aviso, useLectura } from './comun'
import { useState } from 'react'
import { Boton } from '../componentes/Base'
import { operacion } from '../operacion'
type Metricas = { dias: number; eventos: { evento: string; dispositivo: string; cantidad: number }[]; rendimiento: { metrica: string; dispositivo: string; muestras: number; p75_hasta: number; precision: number; objetivo: number }[]; alertas: { numero: number; estado: string; estimacion_minutos: number }[] }
export function MetricasCarta({ token }: { token: string }) {
  const l = useLectura<Metricas>('/operacion/metricas-carta', token)
  const [referencia, setReferencia] = useState(''), [consulta, setConsulta] = useState<{ correlacion: string; intentos: { numero: number | null; estado: string | null; cerrado: boolean }[] }>(), [error, setError] = useState(''), [ocupado, setOcupado] = useState(false)
  return <details className="equipo-tarjeta mb-6"><summary className="min-h-11 cursor-pointer font-semibold">Medición e incidencias de Carta</summary><Aviso error={l.error}/>
    {l.datos && <><p className="equipo-nota mt-3">Últimos 30 días. Contadores de clientes con sesión que permiten medición; no representan personas únicas. No se guardan búsquedas ni contenido del pedido. Las métricas del navegador corresponden a documentos abiertos directamente en Carta y pueden incluir uso posterior de otras pantallas.</p>
      {l.datos.alertas.length > 0 ? <p role="status" className="equipo-aviso">Pedidos que superaron su estimación: {l.datos.alertas.map(a => '#' + a.numero).join(', ')}. Revisalos en la bandeja e informá al cliente.</p> : <p className="mt-3">Sin pedidos activos que hayan superado una estimación configurada.</p>}
      <ul className="mt-3">{l.datos.eventos.map(e => <li key={e.evento + e.dispositivo}>{e.evento.replaceAll('_', ' ')} · {e.dispositivo}: {e.cantidad}</li>)}</ul>
      {!l.datos.eventos.length && <p>Aún no hay eventos de Carta.</p>}
      <ul className="mt-3">{l.datos.rendimiento.map(r => <li key={r.metrica + r.dispositivo}>{r.metrica} · {r.dispositivo}: percentil 75 hasta {r.p75_hasta}{r.metrica === 'CLS' ? '' : ' ms'} · {r.muestras} muestras · objetivo ≤ {r.objetivo}{r.muestras < 100 ? ' · Muestra todavía pequeña' : ''}</li>)}</ul>
      {!l.datos.rendimiento.length && <p>Aún no hay mediciones de rendimiento. No equivalen a cero.</p>}
      <p className="equipo-nota mt-3">El percentil usa intervalos: LCP 100 ms, INP 20 ms, CLS 0,01. Un aumento de «cobro incierto» requiere revisar respuestas y recibos; recuperá la referencia antes de repetir cualquier cobro.</p></>}
    <label className="equipo-campo mt-4">Referencia que muestra el cliente<input value={referencia} maxLength={64} onChange={e => { setReferencia(e.target.value); setConsulta(undefined) }}/></label><Boton tono="claro" cargando={ocupado} disabled={!/^[A-Za-z0-9_-]{8,64}$/.test(referencia)} onClick={() => void (async () => { setError(''); setOcupado(true); try { setConsulta(await operacion('/operacion/carta/referencia/' + encodeURIComponent(referencia), undefined, token)) } catch (e) { setError((e as Error).message) } finally { setOcupado(false) } })()}>Consultar envío</Boton><Aviso error={error}/>
    {consulta && <><ul className="mt-3">{consulta.intentos.map((i, n) => <li key={n}>{i.numero ? 'Pedido #' + i.numero + ' · ' + i.estado : i.cerrado ? 'Intento cerrado sin pedido.' : 'Intento sin pedido confirmado en esta consulta.'}</li>)}</ul>{!consulta.intentos.length && <p>No hay una cotización asociada a esta referencia.</p>}<p className="equipo-nota mt-2 break-all">Referencia de registro: {consulta.correlacion}</p><p className="equipo-nota">Si falta un pedido, el cliente debe consultar o cerrar el intento desde Carta antes de volver a pagar. Esta consulta no cancela una petición en curso.</p></>}
  </details>
}
