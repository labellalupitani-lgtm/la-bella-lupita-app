export const EVENTOS_CARTA = ['vista', 'ficha', 'busqueda', 'sin_resultados', 'agregado', 'salida_con_borrador', 'revisar', 'cotizacion_ok', 'cotizacion_error', 'confirmar', 'cobro_ok', 'cobro_incierto', 'recuperacion_ok', 'actualizar_saldo'] as const
export type EventoCarta = typeof EVENTOS_CARTA[number]
export const METRICAS_CARTA = { LCP: { paso: 100, maximo: 60000, bueno: 2500 }, INP: { paso: 20, maximo: 30000, bueno: 200 }, CLS: { paso: 0.01, maximo: 10, bueno: 0.1 } } as const
