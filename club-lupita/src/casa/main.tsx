import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
// La identidad aprobada se carga desde el primer acceso en cualquier ruta.
import './estilos/fuentes-marca.css'
import './estilos/base.css'
import './estilos/casa.css'
import './estilos/identidad.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import './estilos/inicio.css'
import './estilos/redisenio-sistema.css'
