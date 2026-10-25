import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Barrera de error.
 *
 * Sin esto, un fallo al pintar una sola pantalla desmonta el árbol entero y
 * deja la app en blanco: pasó de verdad, con una variable leída antes de
 * declararse en Reservar, y se llevó por delante también el Perfil y el
 * Mostrador. Una casa no cierra entera porque se queme una hornilla.
 *
 * La barrera se reinicia sola cuando cambia la ruta, así que el socio sale de
 * la pantalla rota simplemente tocando otra.
 */
type Props = { children: ReactNode; ruta: string; alVolver: () => void }
type Estado = { falla: Error | null }

export class Barrera extends Component<Props, Estado> {
  state: Estado = { falla: null }

  static getDerivedStateFromError(falla: Error): Estado {
    return { falla }
  }

  componentDidUpdate(anterior: Props) {
    // Cambiar de pantalla limpia el error: la app no se queda atrapada.
    if (anterior.ruta !== this.props.ruta && this.state.falla) this.setState({ falla: null })
  }

  componentDidCatch(falla: Error, info: ErrorInfo) {
    // En producción esto va al registro del Worker; aquí queda en la consola
    // del navegador, que es donde lo va a buscar quien mantenga la app.
    console.error('[Club Lupita] se rompió una pantalla:', falla, info.componentStack)
  }

  render() {
    if (!this.state.falla) return this.props.children
    return (
      <div className="marco vacio-pantalla" role="alert">
        <p className="etiqueta">Se nos quemó una hornilla</p>
        <h1 className="display-md">Esta pantalla no abrió.</h1>
        <p className="cuerpo">
          No es culpa tuya y tu cuenta está intacta: los sellos, el saldo y las reservas se guardan en la casa, no en
          esta pantalla. Probá de nuevo o volvé a la casa.
        </p>
        <div className="comanda__salidas">
          <button className="boton boton-verde" onClick={() => this.setState({ falla: null })}>
            Probar de nuevo
          </button>
          <button
            className="boton boton-linea"
            onClick={() => {
              this.setState({ falla: null })
              this.props.alVolver()
            }}
          >
            Volver a la casa
          </button>
        </div>
      </div>
    )
  }
}
