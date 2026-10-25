/** Aprobadas por el propietario el 12/10/2026. Se activan tras validar la operación. */
export const REGLAS_CLUB = {
  version:'operacion-2026-10-12', minimoSello:10000,
  bebidas:['espresso','cortadito','macchiato','americano','latte','cappuccino','te-caliente'],
  reposteria:['delicias-abuela','torrijas-autor','cheesecake-cafe','cheesecake-pistacho','pastel-chocolate','tres-leches','natilla','flan-caramelo'],
  cafe_detalle:'Café filtrado de 8 oz (aprox. 240 ml), uno por día de Managua durante el horario de atención, en local o para llevar. Azúcar o endulzante básico incluidos. Leche, bebidas vegetales, jarabes, shots y cambios de bebida se pagan aparte al precio informado. Personal; los días no usados no se acumulan.',
  sellos_regla:'Un sello por ticket con al menos C$100 netos en alimentos o bebidas de la carta, después de descuentos. Un ticket, una cuenta y un sello; no dividir compras. No suman recargas, propinas, membresía, depósitos, experiencias, bolsas de café para casa ni consumos gratuitos.',
  premio_detalle:'Al completar nueve sellos: un Espresso, Cortadito, Macchiato, Americano, Latte, Cappuccino o Té Caliente, en su presentación regular de carta y sin extras. No se cambia por dinero. Si una opción se agota, elegí otra de la lista o conservá el premio para después.',
  vip_regla:'Preferencia en la lista de espera VIP para una misma fecha, hora, duración y tamaño de grupo: primero miembros vigentes por orden de solicitud, luego otras solicitudes por orden de llegada. La casa ofrece y confirma disponibilidad. No desplaza reservas confirmadas ni garantiza mesa; aplican las mismas condiciones de anticipo y cancelación.',
} as const
