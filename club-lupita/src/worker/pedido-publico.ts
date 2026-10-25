/** La cocina recibe una lista positiva de datos necesarios para preparar. */
export function pedidoParaCocina(p: Record<string, unknown>) {
  return {
    id: p.id,
    numero: p.numero,
    estado: p.estado,
    nombre: p.nombre,
    creado: p.creado,
    ...(typeof p.restriccion_confirmada === 'string' && p.restriccion_confirmada ? { restriccion_confirmada: p.restriccion_confirmada } : {}),
    ...(typeof p.estimacion_minutos === 'number' ? { estimacion_minutos: p.estimacion_minutos } : {}),
    ...(p.actualizado !== undefined ? { actualizado: p.actualizado } : {}),
    lineas: Array.isArray(p.lineas) ? p.lineas.map((linea: Record<string, unknown>) => ({
      ...(typeof linea.id === 'string' ? { id: linea.id } : {}),
      nombre: linea.nombre,
      cuanto: linea.cuanto,
      ...(Array.isArray(linea.opciones) ? { opciones: linea.opciones.map((o: Record<string, unknown>) => ({ nombre: o.nombre, valor: o.valor })) } : {}),
    })) : [],
  }
}
