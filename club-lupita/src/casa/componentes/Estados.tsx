/**
 * Los estados que el prototipo nunca dibujó.
 *
 * Ninguna de las 23 pantallas de Stitch tiene un estado vacío, uno de error,
 * uno de carga ni uno de confirmación. No hay nada que copiar: hay que
 * escribirlo. Y como no hay nada que copiar, es el sitio exacto por donde se
 * cuela un segundo sistema de diseño —cada pantalla improvisando su propio
 * vacío—, que es justo lo que esta reconstrucción existe para deshacer.
 *
 * Regla de copy de la casa: se dice qué pasó y qué se puede hacer ahora.
 * No se pide perdón, no se culpa al socio y no se usa la palabra «error».
 */
import type { ReactNode } from 'react'
import { Boton, Icono, type NombreIcono } from './Base'

/* ------------------------------------------------------------------
   ESTADO VACÍO
   ------------------------------------------------------------------ */
export function EstadoVacio({
  icono,
  titulo,
  cuerpo,
  accion,
  compacto = false,
}: {
  icono: NombreIcono
  titulo: string
  cuerpo: string
  accion?: { texto: string; onClick: () => void }
  /** Dentro de una tarjeta, sin el aire de una pantalla entera. */
  compacto?: boolean
}) {
  return (
    <div
      className={`casa-estado-vacio flex flex-col items-center text-center ${compacto ? 'gap-2 py-6' : 'gap-3 py-12'}`}
    >
      <span className="flex size-14 items-center justify-center rounded-troquel border border-filete bg-avena text-achiote">
        <Icono nombre={icono} tam={26} />
      </span>
      <h3 className="font-titular text-seccion font-bold tracking-tight text-tinta">{titulo}</h3>
      <p className="max-w-[34ch] font-texto text-cuerpo leading-relaxed text-tinta-media">
        {cuerpo}
      </p>
      {accion && (
        <Boton onClick={accion.onClick} className="mt-2">
          {accion.texto}
        </Boton>
      )}
    </div>
  )
}

/**
 * Los quince vacíos mínimos, con su texto ya escrito.
 *
 * Vive junto al componente y no disperso por las pantallas: un vacío que se
 * redacta en el sitio donde se usa termina siendo quince voces distintas.
 *
 * Cada uno lleva **la etiqueta de su salida**. Un vacío que sólo informa deja
 * al socio en un callejón: le dice que no hay nada y lo abandona ahí. La
 * pantalla pone el `onClick` con `conSalida()`; el texto ya está decidido.
 *
 * Ninguno tiene género. «Sos la primera en enterarte» dejaba fuera a la mitad
 * de los socios, y contradecía las desviaciones 2 y 5 del SPEC, que existen
 * justamente para eso.
 */
type Vacio = { icono: NombreIcono; titulo: string; cuerpo: string; salida?: string }

export const VACIOS = {
  sinSellos: {
    icono: 'coffee_maker',
    titulo: 'Tu tanda está en blanco',
    cuerpo: 'El primer sello lo pone el barista en tu próxima visita No hay que pedirlo',
    salida: 'Ver la carta',
  },
  sinSaldo: {
    icono: 'account_balance_wallet',
    titulo: 'La cuenta está en cero',
    cuerpo: 'Recargá en caja, con efectivo o con tarjeta, y la casa te suma el bono encima',
    salida: 'Ver los montos',
  },
  sinMovimientos: {
    icono: 'receipt_long',
    titulo: 'Todavía no hay movimiento',
    cuerpo: 'Acá van a ir apareciendo tus recargas y lo que vayás consumiendo',
  },
  sinResultados: {
    icono: 'search',
    titulo: 'Eso no está en la carta de hoy',
    cuerpo: 'Probá con «capuchino», «huevos» o «dulce». La carta cambia con la temporada',
    salida: 'Ver toda la carta',
  },
  fueraDeHorario: {
    icono: 'schedule',
    titulo: 'La barra ya cerró',
    cuerpo: 'Abrimos mañana a las 7:00 de la mañana El molino empieza antes',
    salida: 'Apartar mesa para mañana',
  },
  agotado: {
    icono: 'local_mall',
    titulo: 'Se acabó el lote',
    cuerpo: 'Te avisamos por WhatsApp en cuanto baje el siguiente de la finca',
    salida: 'Avisame cuando llegue',
  },
  sinCupos: {
    icono: 'event_seat',
    titulo: 'Los doce lugares están tomados',
    cuerpo: 'Dejá tu nombre y te escribimos primero si alguien suelta uno',
    salida: 'Anotarme en la lista',
  },
  sinExperiencias: {
    icono: 'local_activity',
    titulo: 'Este mes no abrimos ninguna',
    cuerpo: 'Las anunciamos con dos semanas de anticipación, y los socios entran 48 horas antes',
    salida: 'Avisame de la próxima',
  },
  sinReto: {
    icono: 'local_fire_department',
    titulo: 'Esta semana no hay reto',
    cuerpo: 'Volvé el lunes La casa siempre está tramando algo',
  },
  /**
   * Distinto del anterior: aquí el reto no es que no lo haya esta semana, es
   * que la casa **todavía no tiene dónde guardarlo**. «Volvé el lunes» sería
   * una cita a la que no va a acudir nadie.
   */
  retoSinConectar: {
    icono: 'local_fire_department',
    titulo: 'Los retos llegan en la próxima entrega',
    cuerpo: 'Tres visitas en la semana, un premio y un contador Falta el lado de la casa',
  },
  sinReferidos: {
    icono: 'group',
    titulo: 'Todavía no invitaste a nadie',
    cuerpo: 'La primera vez que alguien llegue con tu código, los dos toman algo por cuenta de la casa',
    salida: 'Compartir mi código',
  },
  sinMesDatos: {
    icono: 'today',
    titulo: 'Este mes todavía no tiene historia',
    cuerpo: 'Los números aparecen desde la primera venta del día',
  },
  sinConexion: {
    icono: 'warning',
    titulo: 'No pudimos abrir tu cuenta',
    // Decía «lo que hiciste está guardado acá, lo mandamos apenas vuelva»:
    // dos afirmaciones falsas en una frase. Esto sale cuando falla la LECTURA
    // al arrancar, no hay cola en ninguna parte, y el socio todavía no ha
    // hecho nada que guardar.
    cuerpo: 'Puede ser la señal o puede ser la casa Tu tanda y tu saldo están a salvo del otro lado',
    salida: 'Probar de nuevo',
  },
  sinPedido: {
    icono: 'shopping_bag',
    titulo: 'Tu pedido está vacío',
    cuerpo: 'Tocá el «+» de cualquier plato y aparece acá',
    salida: 'Ir a la carta',
  },
  sinBeneficios: {
    icono: 'redeem',
    titulo: 'Este mes ya los usaste todos',
    cuerpo: 'El 1 se renuevan solos: la bolsa del lote, el filtrado por visita y el descuento en repostería',
  },
  sinReservas: {
    icono: 'event_available',
    titulo: 'No tenés mesa apartada',
    cuerpo: 'Decinos cuándo y para cuántos, y la preparamos antes de que llegués',
    salida: 'Apartar una mesa',
  },
} as const satisfies Record<string, Vacio>

/** Ata la salida ya redactada del catálogo al manejador de la pantalla. */
export function conSalida(vacio: Vacio, onClick: () => void) {
  return vacio.salida ? { ...vacio, accion: { texto: vacio.salida, onClick } } : vacio
}

/**
 * Las confirmaciones. El sistema tenía quince maneras de decir que no hay
 * nada y ninguna de decir que algo salió bien: el socio apretaba, la pantalla
 * cambiaba sola y nadie le confirmaba nada.
 *
 * Todas en pasado y en primera persona de la casa. Nunca «¡Éxito!».
 */
export const CONFIRMACIONES = {
  /**
   * Decía «va para la barra», que es lo contrario de lo que la misma hoja
   * acababa de explicar —que el pedido NO le llega solo al barista—, nombraba
   * un solo plato y ponía en minúscula nombres propios de la carta, que el
   * §12.8 manda respetar. Ahora dice qué se cobró y con qué queda la cuenta,
   * que es lo que uno quiere saber después de pagar.
   */
  pedidoHecho: (cuantos: number, cobrado: string, resto: string) =>
    `Anotados ${cuantos} ${cuantos === 1 ? 'artículo' : 'artículos'} por ${cobrado} Te quedan ${resto}`,
  selloPuesto: (faltan: number) =>
    faltan === 0
      ? 'Tanda cerrada Tu bebida de cortesía te espera en la barra'
      : `Sello puesto Te ${faltan === 1 ? 'falta' : 'faltan'} ${faltan}`,
  recargaHecha: (monto: string, bono: string) => `Quedaron ${monto} en tu cuenta, ${bono} los puso la casa`,
  mesaApartada: (cuando: string) => `Mesa apartada para ${cuando}`,
  bolsaMarcada: 'Anotada Pasá a retirarla cuando podás, de 7 a 9',
  cupoTomado: (que: string) => `Tenés tu lugar en ${que}`,
  beneficioCanjeado: 'Canjeado Que lo disfrutés',
  perfilGuardado: 'Listo, ya lo sabe la barra',
  codigoCompartido: 'Código copiado Mandáselo a quien querás',
} as const

/* ------------------------------------------------------------------
   ERROR DE CAMPO — va atado al input por `aria-describedby` y se anuncia.
   ------------------------------------------------------------------ */
export function ErrorDeCampo({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 font-texto text-menuda leading-relaxed text-achiote"
    >
      <Icono nombre="warning" tam={14} lleno className="mt-px shrink-0 text-achiote" />
      {children}
    </p>
  )
}

/** Los errores de campo que la app puede dar, ya redactados. */
export const ERRORES = {
  telefonoMalo: 'Ese número no nos cuadra Son ocho dígitos, sin el 505',
  codigoMalo: 'El código son seis dígitos Revisá el WhatsApp que te llegó',
  codigoVencido: 'Ese código ya venció Pedí uno nuevo y te llega en segundos',
  nombreCorto: 'Escribí el nombre con el que te llaman en la barra',
  saldoCorto: (falta: string) =>
    `Te faltan ${falta} para este pedido Podés recargar en caja o pagar la diferencia ahí mismo`,
  personasFuera: 'La mesa admite entre 1 y 10 personas Para más, escribinos y lo armamos',
  fechaPasada: 'Esa fecha ya pasó Elegí una de hoy en adelante',
} as const

/* ------------------------------------------------------------------
   ESQUELETO — la forma de lo que viene, no un giro sin fin.
   ------------------------------------------------------------------ */
export function Esqueleto({
  alto = 'h-4',
  ancho = 'w-full',
  redondo = false,
  className = '',
}: {
  alto?: string
  ancho?: string
  redondo?: boolean
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        'block animate-pulse bg-filete',
        redondo ? 'rounded-full' : 'rounded-troquel',
        alto,
        ancho,
        className,
      ].join(' ')}
    />
  )
}

/** La rejilla de la Carta mientras llega. Reserva el sitio exacto: cero salto. */
export function EsqueletoFichas({ cuantas = 4 }: { cuantas?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3" role="status" aria-label="Cargando la carta">
      {Array.from({ length: cuantas }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-none border border-filete bg-papel">
          <Esqueleto alto="aspect-[4/3] h-auto" ancho="w-full" />
          <div className="space-y-2 p-3 pb-12">
            <Esqueleto alto="h-4" ancho="w-4/5" />
            <Esqueleto alto="h-3" ancho="w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------
   AVISO FLOTANTE — la confirmación de que algo pasó de verdad.
   `aria-live="polite"`: se anuncia sin interrumpir lo que se esté leyendo.
   ------------------------------------------------------------------ */
export function AvisoFlotante({
  visible,
  tono = 'bien',
  children,
  accion,
}: {
  visible: boolean
  tono?: 'bien' | 'mal'
  children: ReactNode
  accion?: { texto: string; onClick: () => void }
}) {
  return (
    <div className="casa-aviso-contenedor pointer-events-none fixed inset-x-0 z-50 flex justify-center">
      {/*
        La región viva vive SIEMPRE en el árbol y sólo cambia de contenido.
        Montarla junto con su texto —que es lo que hacía la versión anterior—
        significa que el lector de pantalla la descubre ya con el mensaje
        dentro y no anuncia nada: una región viva sólo notifica los cambios
        que ocurren mientras existe.

        Y envuelve sólo el mensaje, no el ícono: hay lectores que anuncian la
        ligadura «check_circle» pese al `aria-hidden`, porque el árbol vivo se
        serializa distinto.
      */}
      <span aria-live="polite" aria-atomic="true" className="sr-only">
        {visible ? children : ''}
      </span>
      {visible && (
        <div
          className={[
            'casa-aviso-flotante pointer-events-auto w-full max-w-lg items-center rounded-editorial',
            'motion-safe:animate-[sube_320ms_cubic-bezier(0.16,0.84,0.24,1)]',
            tono === 'bien'
              ? 'bg-tinta text-papel'
              : 'border border-achiote bg-achiote-velo text-achiote',
          ].join(' ')}
        >
          <Icono
            nombre={tono === 'bien' ? 'check_circle' : 'warning'}
            tam={18}
            lleno
            className={tono === 'bien' ? 'text-rosa' : 'text-achiote'}
          />
          <span aria-hidden="true" className="font-texto text-cuerpo">
            {children}
          </span>
          {accion && (
            <button
              type="button"
              onClick={accion.onClick}
              className="ml-1 font-texto text-pie font-semibold uppercase tracking-wider underline underline-offset-2"
            >
              {accion.texto}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
