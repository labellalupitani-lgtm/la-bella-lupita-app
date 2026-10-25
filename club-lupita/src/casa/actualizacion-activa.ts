/** Una pestaña visible pero abandonada también descansa; al volver se revalida. */
export function actualizarConActividad(actualizar: () => Promise<unknown>, intervalo = 120_000) {
  let vivo = true, pendiente = false, actividad = performance.now(), ultima = performance.now()
  const consultar = () => {
    if (!vivo || pendiente || document.visibilityState !== 'visible' || navigator.onLine === false || performance.now() - ultima < 15_000) return
    pendiente = true; ultima = performance.now()
    void actualizar().catch(() => { /* La pantalla conserva su propio estado de error. */ }).finally(() => { pendiente = false })
  }
  const interactuar = () => {
    const dormida = performance.now() - actividad >= 120_000
    actividad = performance.now()
    if (dormida) consultar()
  }
  const volver = () => { if (document.visibilityState === 'visible') { actividad = performance.now(); consultar() } }
  const reloj = window.setInterval(() => { if (performance.now() - actividad < 120_000) consultar() }, intervalo)
  for (const evento of ['pointerdown', 'keydown', 'scroll']) window.addEventListener(evento, interactuar, { passive: true })
  window.addEventListener('focus', volver); window.addEventListener('online', volver); document.addEventListener('visibilitychange', volver)
  return () => {
    vivo = false; window.clearInterval(reloj)
    for (const evento of ['pointerdown', 'keydown', 'scroll']) window.removeEventListener(evento, interactuar)
    window.removeEventListener('focus', volver); window.removeEventListener('online', volver); document.removeEventListener('visibilitychange', volver)
  }
}
