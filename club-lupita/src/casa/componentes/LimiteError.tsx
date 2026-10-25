import { Component, type ReactNode } from 'react'

/** Conserva navegación y salida si un recurso o una pantalla no se puede abrir. */
export class LimiteError extends Component<{children:ReactNode},{fallo:boolean}> {
  state={fallo:false}
  static getDerivedStateFromError(){return {fallo:true}}
  render(){return this.state.fallo ? <main id="contenido" tabIndex={-1} className="marco py-8">
    <h1 className="t-seccion">No pudimos abrir esta sección</h1>
    <p className="my-4">Podés volver a Inicio o recargar la página para intentarlo de nuevo.</p>
    <a className="casa-boton" href="/">Volver a Inicio</a>{' '}
    <button type="button" className="casa-boton" onClick={()=>location.reload()}>Recargar página</button>
  </main> : this.props.children}
}
