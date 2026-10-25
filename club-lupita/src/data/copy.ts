/**
 * Copy deck de Club Lupita — español de Nicaragua, voseo.
 *
 * Reglas de la voz (no romperlas al agregar texto):
 *  · Frases cortas, cadencia de dos tiempos: una afirmación, un remate.
 *  · Sustantivos concretos antes que adjetivos: grano, ladera, barra, neblina.
 *  · Voseo siempre: vení, pedí, tenés, podés.
 *  · Cero signos de admiración, cero emojis, cero tuteo.
 *  · "La casa" es sujeto que da: «la casa pone», «la casa invita».
 *  · Prohibido: gratis, promo, aprovechá, desbloqueá, increíble, última oportunidad.
 */

export const LEXICO = ['casa', 'pausa', 'altura', 'pulso', 'sobremesa', 'sello'] as const

/** Interpola {tokens} de un string del deck. */
export function t(plantilla: string, vars: Record<string, string | number> = {}): string {
  return plantilla.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

/** «7:00» de lunes a sábado, «8:00» el domingo. */
export function apertura(d = new Date()): string {
  return d.getDay() === 0 ? '8:00' : '7:00'
}

export const onboarding = {
  p1: {
    display: 'Café con pulso.\nAhora también en tu bolsillo.',
    subtitle: 'Club Lupita',
    body: 'La misma casa de siempre, con la cuenta abierta. Tus sellos, tu saldo, tu mesa y el café de la finca, todo en un solo lugar.',
    cta: 'Seguir',
  },
  p2: {
    display: 'Nueve tazas hacen\nuna tanda.',
    subtitle: 'La Tanda',
    body: 'Cada visita deja un sello. Al noveno se cierra la tanda y la décima taza la pone la casa. Sin canjes raros, sin letra chica, sin vencimiento.',
    cta: 'Seguir',
  },
  p3: {
    display: 'Empezás con dos\nsellos puestos.',
    subtitle: 'De parte de la casa',
    body: 'No es un cupón. Es la costumbre de servir el primer café antes de que lo pidan. Entrá con tu WhatsApp y la tanda arranca con dos sellos y siete por delante.',
    cta: 'Entrar con WhatsApp',
    ctaAlt: 'Ya tengo cuenta',
    legal:
      'Al continuar aceptás que te escribamos por WhatsApp al número que dejés: sellos, saldo, reservas y el lote del mes. Nada más. Escribí BAJA cuando querás salir y se cierra ese día. Tus datos se quedan en la casa: no se venden ni se comparten.',
  },
  skip: 'Ver primero',
  verif: {
    title: 'Te mandamos seis números',
    body: 'Llegan por WhatsApp al {telefono}. Si no aparecen en un minuto, te los mandamos otra vez.',
    resend: 'Mandalos de nuevo',
    change: 'Cambiar el número',
  },
  nombre: {
    title: '¿Cómo te decimos?',
    body: 'El nombre con el que te llaman en la barra. Ese sirve.',
    cta: 'Listo',
  },
} as const

export const saludos = {
  madrugada: [
    'Todavía es de noche, {nombre}. La barra abre a las {apertura}.',
    'Qué madrugada la tuya, {nombre}. Dejá listo el primero.',
    'A esta hora el molino duerme, {nombre}. Nosotros ya casi.',
    'Si no dormiste, {nombre}, te toca doble. Abrimos a las {apertura}.',
    'Madrugada larga, {nombre}. Te guardamos la primera tanda.',
  ],
  manana: [
    'Buenos días, {nombre}. El molino ya está sonando.',
    '{nombre}, la primera tanda salió a las {apertura}.',
    'Amaneció, {nombre}. La barra está lista.',
    'Buen día, {nombre}. Hoy el espresso salió redondo.',
    '{nombre}, tu taza está a siete minutos de aquí.',
  ],
  mediodia: [
    'Mediodía, {nombre}. La cocina va a buen ritmo.',
    '{nombre}, hora de mesa. El bistró ya está sirviendo.',
    'Hacé la pausa, {nombre}. Aquí hay sombra y almuerzo.',
    '{nombre}, el brunch se está despidiendo. Todavía alcanzás.',
    'Mediodía en Plaza La Fe, {nombre}. Mesa lista.',
  ],
  tarde: [
    'Buenas tardes, {nombre}. La repostería recién salió.',
    '{nombre}, la tarde pide algo dulce.',
    'Bajá el ritmo, {nombre}. Todavía hay luz y hay café.',
    '{nombre}, a esta hora la casa se pone tranquila.',
    'Tarde de sobremesa, {nombre}. Vení sin apuro.',
  ],
  noche: [
    'Buenas noches, {nombre}. Cerramos a las nueve.',
    '{nombre}, la última tanda del día está en la barra.',
    'Noche tranquila, {nombre}. La mesa aguanta una más.',
    '{nombre}, todavía queda tiempo para un último espresso.',
    'Se fue el sol, {nombre}. La casa sigue encendida hasta las nueve.',
  ],
} as const

export type FranjaHoraria = keyof typeof saludos

export function franjaDeLaHora(h: number): FranjaHoraria {
  if (h < 6) return 'madrugada'
  if (h < 11) return 'manana'
  if (h < 15) return 'mediodia'
  if (h < 19) return 'tarde'
  return 'noche'
}

export const NIVELES = [
  {
    id: 'casa_abierta',
    nombre: 'Casa Abierta',
    tagline: 'La puerta ya te conoce.',
    rango: 'De la primera visita a la primera tanda cerrada',
    tandas: 0,
  },
  {
    id: 'mesa_de_siempre',
    nombre: 'Mesa de Siempre',
    tagline: 'Tu lugar ya no hay que buscarlo.',
    rango: 'Desde la segunda tanda',
    tandas: 2,
  },
  {
    id: 'reserva_de_altura',
    nombre: 'Reserva de Altura',
    tagline: 'Lo mejor del lote se aparta para vos.',
    rango: 'Desde la quinta tanda',
    tandas: 5,
  },
] as const

export type NivelId = (typeof NIVELES)[number]['id']

export const home = {
  progreso: { title: 'Camino de altura', subtitle: 'De la barra a la ladera. Se sube visitando.' },
  push: {
    a2: 'Te faltan {n} sellos para Mesa de Siempre. Ahí la casa te guarda el mismo rincón y la repostería te sale más barata.',
    a3: 'Te faltan {n} sellos para Reserva de Altura. Ahí entrás primero a los lotes numerados y a las experiencias antes que se llenen.',
    tope: 'Reserva de Altura. Más arriba solo está la montaña, y de esa te llevamos en marzo.',
    recien: 'Recién subiste a {nivel}. No cambia el café, cambia el trato.',
  },
} as const

export const tanda = {
  nombre: 'La Tanda',
  regla: 'Nueve sellos. La décima la pone la casa.',
  contador: '{sellos} de 9',
  comoFunciona: 'Un sello por visita, sin importar lo que pidás. Los sellos no vencen y la tanda no se reinicia sola.',
  vacia: {
    title: 'Tanda nueva, hoja limpia',
    body: 'Nueve casillas esperando. La primera se llena con la primera taza: mostrá tu código en la barra y listo.',
    cta: 'Ver mi código',
  },
  sello: [
    'Primer sello. La tanda arrancó.',
    'Dos. Ya no fue casualidad.',
    'Tres. La barra te está aprendiendo el gusto.',
    'Cuatro. Cuatro pausas que te ganaste.',
    'Cinco. Media tanda, y de las buenas.',
    'Seis. Ya sabemos cómo lo tomás.',
    'Siete. De aquí para arriba se pone interesante.',
    'Ocho. La décima ya se ve desde aquí.',
    'Nueve. Tanda cerrada.',
  ],
  faltaUno: {
    title: 'Te falta uno',
    body: 'Ocho sellos puestos. La próxima visita cierra la tanda y la que sigue va por cuenta de la casa.',
    cta: 'Ver la carta',
  },
  completa: {
    title: 'Tanda cerrada',
    body: 'Nueve visitas. Ahora nos toca a nosotros: tu próxima bebida de la casa la ponemos nosotros, sin apuro y sin fecha de vencimiento.',
    cta: 'Usar la décima',
    luego: 'La guardo para después',
  },
  canje: {
    title: 'La décima',
    body: 'Mostrá esta pantalla en la barra. Elegís la bebida de la casa que querás y no se cobra.',
    codigo: 'Código {codigo} · vale por una bebida de la casa',
    confirmar: 'Canjear ahora',
    aviso: 'Se canjea en el mostrador, con el barista de frente. Una vez usado, empieza tanda nueva.',
    hecho: 'Décima servida. Tanda nueva, empezamos otra vez de cero y con gusto.',
  },
} as const

export const cuenta = {
  nombre: 'Cuenta de Casa',
  subtitle: 'Tu saldo, abierto en la barra.',
  saldoLabel: 'Saldo disponible',
  explica:
    'Dejás saldo en la casa y pagás sin sacar la billetera. Nunca vence y se puede usar en todo: barra, cocina, repostería y tienda.',
  recarga: {
    title: 'Cuando ponés, la casa pone',
    body: 'Es la costumbre vieja del abono: el que deja fiado en la casa recibe más de lo que dejó. Así lo hacemos nosotros.',
    opciones: [
      { monto: 50000, bono: 4000, nota: 'Un cortado de más, más o menos.' },
      { monto: 100000, bono: 10000, nota: 'Alcanza para el mes y una sobremesa.' },
      { monto: 200000, bono: 24000, nota: 'Lo que deja un cliente de mesa fija.' },
    ],
    cta: 'Dejar saldo',
    legal: 'Lo que pone la casa entra al mismo saldo y se gasta primero, para que lo tuyo dure más. No se retira en efectivo.',
    ok: {
      title: 'Saldo adentro',
      body: 'Pusiste C$ {monto}, la casa puso C$ {bono}. Tenés C$ {saldo} para gastar cuando vengás.',
      cta: 'Volver',
    },
  },
  vacia: {
    title: 'Cuenta en cero',
    body: 'No hay nada guardado todavía. Dejá saldo y la casa le agrega su parte desde el primer córdoba.',
    cta: 'Dejar saldo',
  },
  regalo: {
    title: 'Regalá saldo',
    body: 'Mandale café a alguien. Le llega por WhatsApp con tu nombre y lo gasta en lo que quiera: espresso, almuerzo o una bolsa de la finca.',
    campo1: '¿A qué número se lo mandamos?',
    campo2: '¿Cuánto le dejás?',
    campo3: 'Escribile dos líneas (opcional)',
    cta: 'Mandar el saldo',
    nota: 'Si esa persona todavía no es socia, el saldo la espera hasta que entre. No se pierde.',
  },
} as const

export const membresia = {
  nombre: 'Mesa Fundadora',
  subtitle: 'La membresía de la casa',
  precio: 95000,
  precioNota: 'Se cobra el mismo día de cada mes. Podés salirte cuando querás.',
  pitch:
    'La membresía de la casa. Cada mes, una bolsa de 250 g del lote recién tostado, una bebida por visita, quince por ciento en repostería, prioridad en el Salón VIP y las experiencias antes que nadie. Cien socios, no más.',
  beneficios: [
    {
      title: 'Tu bolsa del mes',
      body: '250 g del lote que estamos tostando, molido como lo tomés o en grano. Se aparta a tu nombre y lo retirás cuando podás.',
    },
    {
      title: 'Una bebida por visita',
      body: 'Espresso, americano, cortado o el filtrado del día. Una por visita, todos los días, sin cobrar y sin tener que pedirlo.',
    },
    {
      title: 'Quince por ciento en repostería',
      body: 'En toda la vitrina, todo el mes. El dulce final de la casa sale más barato para los de casa.',
    },
    {
      title: 'Prioridad en el Salón VIP',
      body: 'Cuando pidás el salón, tu solicitud se ve primero. Y si está tomado, te avisamos apenas se libere.',
    },
    {
      title: 'Las experiencias, antes',
      body: 'Catas, maridajes y viajes a la finca se abren 48 horas antes para vos. Son doce cupos: esas horas deciden.',
    },
  ],
  cupo: {
    title: 'Cien y se cierra',
    body: 'Abrimos cien lugares y no más, porque cien bolsas es lo que da el lote del mes sin sacárselo a nadie. Quedan {n}.',
    contador: '{n} de 100 disponibles',
    lleno: 'Los cien están tomados. Dejá tu número y te escribimos apenas se desocupe un lugar.',
    espera: 'Anotarme en la lista',
    honesto: 'No es una cuenta regresiva inventada. Cuando lleguen a cien, esta pantalla dice lleno.',
  },
  renov: {
    title: 'Cómo se cobra',
    body: 'Se cobra C$ 950 hoy y el mismo día de cada mes, hasta que vos digás basta. Tres días antes te escribimos por WhatsApp para recordártelo: no cobramos a nadie que no sepa que le vamos a cobrar.',
    puntos: [
      'El precio no sube mientras seás socio fundador.',
      'Si el cobro falla, tenés siete días para arreglarlo sin perder tu lugar.',
      'Cancelás desde la app, en dos toques, sin llamar a nadie.',
    ],
    cta: 'Hacerme socio',
  },
  cancel: {
    title: 'Cerrar la membresía',
    body: 'Se puede, y no hay que dar explicaciones. Seguís siendo socio del Club: conservás tus sellos, tu saldo y tu nivel. Lo que se termina es la bolsa del mes y la bebida diaria.',
    detalle: 'Tenés pagado hasta el {fecha}. Hasta ese día todo sigue igual, incluida la bolsa de este mes si no la retiraste.',
    cta: 'Cancelar la membresía',
    volver: 'Mejor la dejo',
  },
} as const

export const carta = {
  title: 'La Carta',
  subtitle: 'Pedí desde aquí y encontralo servido.',
  momentos: 'BARRA · BRUNCH · BISTRÓ · SOBREMESA',
  tiemposNota: 'Si la casa está llena, se suman unos minutos. Te avisamos por WhatsApp antes de que salgás.',
  horaRetiro: '¿A qué hora pasás?',
  horaAhora: 'Lo antes posible',
  carritoVacio: {
    title: 'Todavía no pediste nada',
    body: 'La carta está de este lado. Empezá por la barra si venís de paso, o por el bistró si venís a quedarte.',
    cta: 'Ver la carta',
  },
  pedidoOk: {
    title: 'Pedido anotado',
    body: 'Lo tenemos para las {hora}. Te lo dejamos listo en la barra a tu nombre. Si te atrasás, se mantiene: solo escribinos.',
    pagado: 'Pagado con la Cuenta de Casa. Te quedan C$ {saldo}.',
  },
} as const

export const tienda = {
  title: 'De la finca',
  subtitle:
    'Tres generaciones cultivando en Matagalpa y Jinotega desde 1971. Esto es lo que baja de la montaña este mes.',
  susc: {
    title: 'El lote del mes, en tu cocina',
    body: 'Cada mes tostamos un lote distinto y te mandamos 250 g o 500 g. Nunca es el mismo café dos veces: eso depende de la ladera y de la cosecha, no de nosotros.',
    molienda: 'Decinos cómo lo tomás y así te lo molemos: prensa, filtro, espresso o en grano.',
    entrega: 'Retiro en la casa sin costo. Entrega en Managua, C$ 120.',
    cta: 'Suscribirme',
    nota: 'Se pausa o se corta desde la app, cuando querás.',
  },
  portable: {
    title: 'Espresso Portable',
    tagline: '100 ml de café real para moverte.',
    body: 'Espresso de verdad, extraído en la casa y sellado en pouch con tapa rosca. Ni polvo, ni azúcar, ni cuento. Se abre, se toma, se sigue.',
    usos: 'Para el tráfico de la carretera sur, para la oficina sin barra, para la carretera larga.',
    dato: 'Aguanta cinco días fuera de refrigeración. Frío también sabe.',
    cta: 'Llevarme unos',
  },
  reserva: {
    title: 'Reserva de Cosecha',
    tagline: 'Ciento cincuenta bolsas. Cada una con su número.',
    body: 'Del corte de este año apartamos el mejor paso del beneficio y lo dejamos aparte. Se tuesta una sola vez, en enero, y se numera a mano de la 001 a la 150. Cuando se acaba no se repite: el año que viene la ladera dará otra cosa.',
    contador: 'Quedan {n} de 150',
    cta: 'Apartar mi número',
    entrega: 'Se aparta hoy, se tuesta el 15 de enero y se retira desde el 20.',
    numero: 'Te tocó la bolsa número {n}. Va con tu nombre escrito en la etiqueta.',
    agotada:
      'Las ciento cincuenta están apartadas. El corte que viene se abre en noviembre: dejá tu número si querés que te avisemos primero.',
  },
} as const

export const lote = {
  nombre: 'El Aguacatal',
  subtitulo: 'Lote 04 · Cosecha 2025–2026',
  perfil: 'TUESTE MEDIO · CUERPO AMABLE · FINAL DULCE',
  datos: [
    { label: 'Puntaje de catación', valor: '86.5 puntos', detalle: 'catado en Matagalpa, febrero 2026', altura: 1340 },
    { label: 'Altura', valor: '1,340 m', detalle: 'sobre el nivel del mar', altura: 1340 },
    { label: 'Proceso', valor: 'Lavado', detalle: 'secado al sol, 14 días en cama africana', altura: 1100 },
    { label: 'Cosecha', valor: 'Dic – Feb', detalle: 'corte a mano, solo grano rojo', altura: 900 },
    { label: 'Variedad', valor: 'Caturra y Java', detalle: 'sombra de aguacate', altura: 700 },
    { label: 'Quién lo cultivó', valor: 'Familia Gutiérrez', detalle: 'tercera generación en la ladera desde 1971', altura: 400 },
    { label: 'En la taza', valor: 'Panela, naranja madura', detalle: 'fondo de cacao', altura: 150 },
  ],
  origen:
    'El Aguacatal es una ladera de Matagalpa donde el aguacate le hace sombra al café. A 1,340 metros la neblina baja temprano y el grano madura despacio. La familia Gutiérrez corta a mano, solo lo rojo, y lo lava con agua de la quebrada. Secado al sol, catorce días. En la taza: panela, naranja madura y un fondo de cacao.',
  cta: 'Llevarme este lote',
  transparencia:
    'Publicamos todo: el puntaje, la altura, la fecha del tueste y lo que se le paga al corte. Si un dato no está, es porque todavía no lo tenemos, no porque no lo queramos decir.',
} as const

export const experiencias = {
  title: 'Experiencias',
  subtitle: 'Días en que la casa abre lo que normalmente no se ve.',
  prepago: {
    title: 'Sobre el pago',
    body: 'Se paga completo al reservar y no se devuelve. No es letra chica: son doce sillas y por cada una que se vacía a última hora hay alguien que se quedó afuera, y café tostado que ya no se puede destostar.',
    opcion:
      'Si no podés venir, avisanos con 48 horas y te pasamos a la siguiente fecha, o le cedés tu silla a quien vos querás.',
    check: 'Entiendo cómo funciona el pago',
    cta: 'Pagar y apartar',
  },
} as const

export const reservas = {
  title: 'Reservas',
  subtitle: 'Decinos cuándo y para cuántos. La mesa se prepara antes de que llegués.',
  horario: 'Lunes a sábado 7:00–21:00 · domingo 8:00–21:00',
  mesas: [
    { id: 'cafe', title: 'Mesa de café', desc: 'Una o dos personas, una hora. Para leer, escribir o no hacer nada con buena taza.', max: 2 },
    { id: 'brunch', title: 'Mesa de brunch', desc: 'De 7:00 a 12:00, hasta cuatro personas. Mañana larga, con la cocina trabajando.', max: 4 },
    { id: 'bistro', title: 'Mesa de bistró', desc: 'Almuerzo o cena, dos horas. Cocina completa y mesa puesta como se debe.', max: 4 },
    { id: 'sobremesa', title: 'Mesa de sobremesa', desc: 'Después de las tres. Café, dulce y todo el tiempo que aguante la conversación.', max: 4 },
    { id: 'grupo', title: 'Mesa de grupo', desc: 'De seis a doce personas. Nos avisás con un día y armamos la mesa larga.', max: 12 },
    { id: 'vip', title: 'Salón VIP', desc: 'Café de altura para conversaciones que importan. Puerta cerrada, pantalla y servicio propio.', max: 10 },
  ],
  vip: {
    depositoTitle: 'Depósito de C$ 500',
    depositoBody:
      'El salón se aparta con C$ 500 y ese dinero no se pierde: entra completo a tu cuenta del día. Lo que consuman se descuenta de ahí y solo pagan la diferencia.',
    depositoNota:
      'Si cancelás con 24 horas, el depósito vuelve a tu Cuenta de Casa. Con menos de 24 horas, se queda como saldo para tu próxima visita.',
    cta: 'Pagar el depósito y apartar',
    capacidad: 'Hasta 10 personas · mínimo 2 horas',
  },
  ok: {
    title: 'Mesa apartada',
    body: '{personas} el {fecha} a las {hora}. Te acabamos de mandar la confirmación por WhatsApp, con el mapa y el número de la casa.',
    nota: 'Si algo cambia, respondé ese mismo chat. Movemos la hora sin problema hasta dos horas antes.',
    espera: 'Guardamos la mesa quince minutos. Si vas atrasado, escribinos y la sostenemos.',
  },
} as const

export const errores = {
  sinConexion: 'Se cayó la señal. Aquí también pasa, sobre todo cuando llueve. Probá otra vez en un momento.',
  servidor: 'Algo se nos quemó del lado de la cocina. No es culpa tuya. Ya lo estamos viendo.',
  codigoMalo: 'Esos números no son. Fijate en el WhatsApp y escribilos otra vez.',
  codigoVencido: 'Ese código ya se enfrió. Pedí uno nuevo y te lo mandamos al toque.',
  pagoRechazado: 'El banco no dejó pasar el pago. Probá con otra tarjeta o pagá con la Cuenta de Casa.',
  saldoCorto: 'Te faltan C$ {monto} en la Cuenta de Casa. Dejá saldo o completá en el mostrador.',
  qrUsado: 'Ese código ya se usó. Si creés que hay un error, mostrale esta pantalla al barista.',
  cupoAgotado: 'Se llenó mientras estabas pagando. Doce sillas se van rápido. No te cobramos nada.',
  productoAgotado: 'Se acabó {producto}. Lo sacamos del carrito para no cobrártelo de gusto.',
  sesionVencida: 'Se cerró tu sesión por seguridad. Entrá otra vez con tu WhatsApp y seguís donde ibas.',
  cerrado: 'A esta hora la casa está cerrada. Abrimos a las {apertura} y dejamos tu pedido anotado para entonces.',
  telefonoMalo: 'Ese número no nos cuadra. Escribilo con los ocho dígitos, sin espacios.',
} as const

export const vacios = {
  tanda: 'Tanda nueva, hoja limpia. La primera casilla se llena con la primera taza.',
  cuenta: 'Cuenta en cero. Dejá saldo y la casa le agrega su parte desde el primer córdoba.',
  pedidos: 'Todavía no has pedido nada por aquí. Cuando lo hagás, esta pantalla lleva la cuenta.',
  reservas: 'No tenés mesas apartadas. Cuando querás una, la guardamos con tu nombre.',
  tienda: 'El lote del mes está por bajar de la montaña. Volvé a asomarte el lunes.',
  experiencias: 'Ninguna experiencia apartada todavía. La próxima cata abre cupos el {fecha}.',
  historial: 'Aquí va a quedar todo lo que pidás. Por ahora, hoja en blanco.',
  busqueda: 'No hay nada con ese nombre en la carta. Probá con otra palabra o mirá los cuatro momentos.',
} as const

export const exito = {
  registro: 'Ya sos de la casa, {nombre}. Dejamos dos sellos puestos para arrancar.',
  sello: 'Sello {sellos} de 9. Gracias por venir.',
  canje: 'Décima servida. Empezamos tanda nueva.',
  recarga: 'Pusiste C$ {monto}, la casa puso C$ {bono}. Saldo listo.',
  membresia: 'Sos socio de Mesa Fundadora, número {n} de 100. Tu primera bolsa se aparta el {fecha}.',
  pedido: 'Pedido anotado para las {hora}. Te lo dejamos a tu nombre en la barra.',
  reserva: 'Mesa apartada. Te llegó la confirmación por WhatsApp.',
  experiencia: 'Silla apartada para {experiencia}, el {fecha}. Te esperamos temprano.',
  nivel: 'Subiste a {nivel}. No cambia el café, cambia el trato.',
  perfil: 'Guardado. Así te vamos a llamar de ahora en adelante.',
} as const

export const cargando = {
  general: 'Un momento, que se está extrayendo.',
  pago: 'Pasando la cuenta. No cierres la pantalla.',
  tanda: 'Buscando tus sellos en el cuaderno.',
  carta: 'Sacando la carta de hoy.',
  reserva: 'Viendo qué mesas quedan libres.',
  tienda: 'Contando lo que bajó de la finca.',
} as const

export const avisos = {
  bienvenida: '{nombre}, ya sos de la casa. Te dejamos dos sellos puestos en la tanda. Te esperamos en Plaza La Fe, km 7.5 carretera sur.',
  sello: 'Sello {sellos} de 9, {nombre}. Gracias por la visita. La décima taza la pone la casa.',
  faltaUno: '{nombre}, ocho sellos. Falta uno para cerrar la tanda y que la décima corra por cuenta de la casa. Abrimos a las {apertura}.',
  cumple: 'Feliz cumpleaños, {nombre}. Hoy tu bebida de la casa no se cobra. Solo llegá y decilo en la barra.',
  winback: '{nombre}, hace mes y medio que no te vemos. El lote del mes cambió y quedó bueno. Tu mesa sigue donde la dejaste.',
  bolsaMes: '{nombre}, tu bolsa de 250 g de {lote} ya está tostada y con tu nombre. Pasá a retirarla cuando podás, de 7 a 9.',
  reserva: '{nombre}, mañana {hora} tenemos tu mesa para {personas}. Si algo cambia, respondé este mensaje y la movemos.',
  cupoExp: 'Quedan {cupos} sillas para {experiencia} del {fecha}. Son doce y no abrimos más. Apartá la tuya desde la app.',
} as const

export const casa = {
  nombre: 'La Bella Lupita',
  tagline: 'Café con pulso. Mesa con memoria.',
  perfil: 'TUESTE MEDIO · CUERPO AMABLE · FINAL DULCE',
  direccion: 'Km 7.5 carretera sur, Plaza La Fe, Managua',
  telefono: '+505 8744-2005',
  whatsapp: '50587442005',
  correo: 'labellalupita.ni@gmail.com',
  horario: 'Lunes a sábado 7:00–21:00 · domingo 8:00–21:00',
  desde: 1971,
} as const
