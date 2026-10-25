/** Condiciones confirmadas por la casa el 9 de octubre de 2026. Importes en centavos. */
export const CONTRATO_CLUB = {
  version: 'fundadora-2026-10', cuota: 95000, dias: 30, plazas: 100,
  cafe: 'Un café filtrado al día', bolsa: 'Una bolsa de café de 250 g por período pagado',
  descuentoReposteria: 15, anticipacionHoras: 48,
  renovacion: 'Se renueva cada 30 días con tu consentimiento y saldo suficiente en la Cuenta de Casa.',
  cancelacion: 'Podés desactivar la renovación. Conservás los beneficios hasta terminar el período pagado.',
} as const
export const EVENTOS_CLUB = ['informacion_vista', 'informacion_mesa', 'informacion_acceso', 'vista', 'oferta', 'alta_intento', 'alta_ok', 'alta_error', 'recarga', 'beneficio_intento', 'beneficio_ok', 'beneficio_error', 'cancelacion', 'renovacion', 'espera'] as const
export type EventoClub = typeof EVENTOS_CLUB[number]
