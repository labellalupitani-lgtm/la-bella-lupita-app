import { csrfCliente, sesion } from './sesion-cliente'
import { MAXIMO_TIEMPO_PERFIL, type EventoPerfil } from '../compartido/metricas-perfil'

/** Llamar tras confirmar el DOM. Espera un frame pintado; nunca envía datos del formulario. */
export function medirPerfilTrasPintado(evento: EventoPerfil, inicio: number): () => void {
  let frame = 0
  const permitida = () => document.visibilityState === 'visible' && !!sesion.leer() && navigator.doNotTrack !== '1' && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
  if (permitida()) frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => {
      const duracion = Math.round(performance.now() - inicio)
      if (!permitida() || !Number.isFinite(duracion) || duracion < 0 || duracion > MAXIMO_TIEMPO_PERFIL) return
      // Telemetría auxiliar: no retrasa el resultado ni convierte un guardado en error.
      void fetch('/api/metricas-perfil', {
        method: 'POST', credentials: 'same-origin', keepalive: true, signal: AbortSignal.timeout(5000),
        headers: { 'content-type': 'application/json', 'x-cliente-solicitud': '1', 'x-cliente-csrf': csrfCliente() },
        body: JSON.stringify({ evento, duracion, dispositivo: innerWidth < 768 ? 'movil' : innerWidth < 1024 ? 'tableta' : 'escritorio' }),
      }).catch(() => {})
    })
  })
  return () => cancelAnimationFrame(frame)
}
