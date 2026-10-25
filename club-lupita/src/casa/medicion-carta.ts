import { csrfCliente, sesion } from './sesion-cliente'
import type { EventoCarta } from '../compartido/metricas-carta'
const permitida = () => !!sesion.leer() && navigator.doNotTrack !== '1' && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
function enviar(ruta: string, dato: object) {
  if (!permitida()) return
  void fetch('/api/carta/' + ruta, { method: 'POST', credentials: 'same-origin', keepalive: true, signal: AbortSignal.timeout(5000),
    headers: { 'content-type': 'application/json', 'x-cliente-solicitud': '1', 'x-cliente-csrf': csrfCliente() },
    body: JSON.stringify({ ...dato, dispositivo: innerWidth < 768 ? 'movil' : innerWidth < 1024 ? 'tableta' : 'escritorio' }) }).catch(() => {})
}
/** Solo contadores, sin búsqueda, producto, referencia, importes ni datos del cliente. */
export function medirCarta(evento: EventoCarta) { enviar('evento', { evento }) }
let instalada = false
export function medirRendimientoCarta() {
  // Web Vitals describe el documento completo; no atribuir a Carta una entrada por otra ruta de la SPA.
  if (instalada || new URL(performance.getEntriesByType('navigation')[0]?.name ?? location.href).pathname !== '/pedir' || !permitida()) return
  instalada = true
  void import('web-vitals').then(({ onLCP, onINP, onCLS }) => {
    const mandar = ({ name, value }: { name: string; value: number }) => enviar('rendimiento', { metrica: name, valor: value })
    onLCP(mandar); onINP(mandar); onCLS(mandar)
  }).catch(() => {})
}
