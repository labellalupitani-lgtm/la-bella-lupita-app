/** Un intento pendiente pertenece a una cuenta y sobrevive a la navegación. */
const prefijo = 'club-lupita:compra:'

export function referenciaCompra(socio: string, operacion: string): string | null {
  const clave = prefijo + socio + ':' + operacion
  try {
    const anterior = localStorage.getItem(clave)
    if (anterior) return anterior
    const nueva = crypto.randomUUID()
    localStorage.setItem(clave, nueva)
    return nueva
  } catch {
    // Sin persistencia no iniciamos un cargo que no se pueda reconciliar.
    return null
  }
}

export function confirmarCompra(socio: string, operacion: string) {
  try { localStorage.removeItem(prefijo + socio + ':' + operacion) } catch { /* reintento seguro */ }
}
