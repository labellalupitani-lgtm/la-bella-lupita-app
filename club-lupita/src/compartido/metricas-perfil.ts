export const EVENTOS_PERFIL = ['guardado_confirmado', 'guardado_conflicto', 'guardado_error', 'guardado_incierto', 'recuperacion_confirmada', 'recuperacion_revision', 'recuperacion_error'] as const
export type EventoPerfil = typeof EVENTOS_PERFIL[number]
export const MAXIMO_TIEMPO_PERFIL = 300_000
