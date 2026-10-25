import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// El orden de estas cuatro líneas ES la cascada. `App` importa app.css y
// pantallas.css, así que si se importa antes que las hojas de abajo, base.css
// termina ganándole a pantallas.css: al revés de lo que prometen sus nombres.
// Tokens primero, luego base, y las pantallas al final, que es quien manda.
import './styles/tokens.css'
import './styles/base.css'
import { App } from './app/App'

/**
 * Tras un despliegue nuevo, los trozos de código con el nombre viejo dejan de
 * existir y el servidor devuelve el index.html de la SPA en su lugar. El
 * navegador rechaza ese HTML como módulo y la pantalla se queda en blanco.
 * Se recarga una sola vez: la segunda vez ya sería un bucle.
 */
const CLAVE_RECARGA = 'club-lupita:recargado'
window.addEventListener('vite:preloadError', (e) => e.preventDefault())
window.addEventListener('error', (e) => {
  const msg = String((e as ErrorEvent).message ?? '')
  const esChunkViejo = /Failed to (load|fetch) (module|dynamically imported)/i.test(msg) || /MIME type/i.test(msg)
  if (!esChunkViejo) return
  if (sessionStorage.getItem(CLAVE_RECARGA)) return
  sessionStorage.setItem(CLAVE_RECARGA, '1')
  location.reload()
})
window.addEventListener('load', () => sessionStorage.removeItem(CLAVE_RECARGA))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
