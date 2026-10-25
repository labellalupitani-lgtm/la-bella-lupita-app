/**
 * Superficies del sistema «Etiqueta».
 *
 * La jerarquía NO la hace el plano. Papel sobre avena rinde 1,20:1 y eso no
 * se arregla subiendo el contraste: dos superficies claras separadas por más
 * de 1,4:1 dejan de verse como papel y se ven como gris sucio. La hacen el
 * FILETE de 1 px y, donde de verdad hay que partir la pantalla, la BANDA
 * verde, que rinde 8,03:1.
 *
 * Por eso aquí no hay ni una sombra. Ver la cabecera de `estilos/base.css`.
 */
import { useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { Boton, EnLaBanda, Icono, type NombreIcono } from './Base'
import { cordobas } from '../datos'

/* ------------------------------------------------------------------
   TARJETA — papel sobre avena, canto vivo y filete.
   ------------------------------------------------------------------ */
export function Tarjeta({
  children,
  className = '',
  ...resto
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...resto} className={['casa-tarjeta rounded-editorial border border-filete bg-papel p-4', className].join(' ')}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------
   CARNET — la banda verde.

   En el sistema anterior era una tarjeta oscura de canto redondeado con
   lámina de contorno y un lustre que seguía al dedo. Era el mejor objeto del
   sistema y a la vez su contradicción: el único sitio con carácter, en una
   app que por lo demás era beige sobre beige.

   Aquí deja de ser la excepción y pasa a ser el idioma. Es la misma banda
   verde que la cabecera y que la barra de pestañas, así que el carnet no
   «flota» sobre la pantalla: es la pantalla. Lleva el grano del papel sin
   blanquear al 5 % y un filete de contorno abajo, que es lo que una etiqueta de
   finca lleva impreso.

   El lustre se retiró con el sistema anterior: una lámina metálica que
   atrapa la luz pertenece a un carnet de cartón, no a una etiqueta impresa.
   ------------------------------------------------------------------ */
export function Carnet({
  children,
  className = '',
  ...resto
}: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      {...resto}
      className={[
        'carnet-premium grano relative overflow-hidden rounded-carnet border border-contorno',
        'bg-banda px-5 py-6 text-papel',
        className,
      ].join(' ')}
    >
      <EnLaBanda.Provider value={true}>
        <div className="relative z-10">{children}</div>
      </EnLaBanda.Provider>
    </section>
  )
}

/* ------------------------------------------------------------------
   AVISO — banner de contexto. Tres tonos, ninguno decorativo:
   si aparece, es porque cambia lo que el socio puede hacer ahora.

   Los tres comparten la forma —canto vivo y barra maciza de 4 px a la
   izquierda, que es como una etiqueta impresa marca un párrafo— y se
   distinguen por el color de esa barra. El achiote hace tres oficios en
   todo el sistema y los separa por forma: disco macizo en el sello,
   contorno en la escasez, barra a la izquierda aquí.
   ------------------------------------------------------------------ */
type TonoAviso = 'contorno' | 'verde' | 'alerta'

const AVISOS: Record<TonoAviso, { caja: string; icono: string; porDefecto: NombreIcono }> = {
  contorno: {
    // El contorno no puede ser texto (3,21:1) pero sí filete: aquí es la barra de
    // 4 px, que como objeto gráfico pasa el 3,0 que pide la 1.4.11. Lo que
    // habla —icono incluido— es la tinta, a 16,82:1 sobre el papel.
    //
    // La primera versión de este bloque pintaba el icono en contorno y el guardián
    // la paró en el sitio. Que la regla exista no es lo mismo que que se
    // cumpla; esto es lo segundo.
    caja: 'border-l-4 border-l-contorno bg-papel text-tinta',
    icono: 'text-tinta',
    // `stars` se retiró en el §4. El aviso contorno habla siempre de un
    // beneficio o de una escasez, y el canónico de eso es `redeem`.
    porDefecto: 'redeem',
  },
  verde: {
    caja: 'border-l-4 border-l-exito bg-papel text-exito',
    icono: 'text-exito',
    porDefecto: 'check_circle',
  },
  alerta: {
    caja: 'border-l-4 border-l-achiote bg-achiote-velo text-achiote',
    icono: 'text-achiote',
    porDefecto: 'warning',
  },
}

export function Aviso({
  children,
  tono = 'contorno',
  icono,
  className = '',
}: {
  children: ReactNode
  tono?: TonoAviso
  icono?: NombreIcono
  className?: string
}) {
  const t = AVISOS[tono]
  return (
    <div
      role={tono === 'alerta' ? 'alert' : undefined}
      className={`flex items-start gap-2.5 rounded-none border border-filete px-4 py-3 ${t.caja} ${className}`}
    >
      <Icono nombre={icono ?? t.porDefecto} tam={20} lleno className={`mt-px shrink-0 ${t.icono}`} />
      {/* En caja baja y a 14 px. Las versalitas son para etiquetas de una o
          dos palabras; una oración entera en mayúsculas a 11 px se lee peor y
          suena a grito — y la peor de las tres era la alergia, que es
          información clínica. */}
      <p className="font-texto text-cuerpo font-medium">{children}</p>
    </div>
  )
}

/* ------------------------------------------------------------------
   FILA — el patrón de lista del Perfil y de los beneficios.

   El icono ya no va en un círculo: un círculo es una píldora, y la píldora
   está reservada para lo que se aprieta. Va en un troquel cuadrado de
   2 px, que es la marca de la casilla de una etiqueta.
   ------------------------------------------------------------------ */
export function Fila({
  icono,
  titulo,
  detalle,
  derecha,
  onClick,
  className = '',
}: {
  icono: NombreIcono
  titulo: ReactNode
  detalle?: ReactNode
  derecha?: ReactNode
  onClick?: () => void
  className?: string
}) {
  const Etiqueta = onClick ? 'button' : 'div'
  return (
    <Etiqueta
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={[
        'casa-fila flex w-full items-center gap-3 rounded-none border border-filete',
        'bg-papel p-4 text-left',
        onClick ? 'transition-colors duration-tactil hover:bg-avena' : '',
        className,
      ].join(' ')}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-troquel border border-filete bg-avena text-achiote">
        <Icono nombre={icono} tam={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-texto text-guia font-semibold text-tinta">{titulo}</span>
        {detalle && <span className="block t-caption">{detalle}</span>}
      </span>
      {derecha ?? (onClick ? <Icono nombre="chevron_right" tam={20} className="text-tinta-media" /> : null)}
    </Etiqueta>
  )
}

/* ------------------------------------------------------------------
   HOJA — panel inferior. Es el contenedor de la única transacción de la
   app, así que se hace bien.

   `<dialog>` con `showModal()` y no un `<div role="dialog">`: el elemento
   nativo trae gratis la trampa de foco, el cierre con Escape, la inercia
   del fondo para el lector de pantalla y el `::backdrop`. La versión
   anterior de este componente prometía las cuatro cosas en un comentario
   y no implementaba ninguna; el fondo seguía tabulable y el primer
   elemento del DOM era un botón de cerrar a pantalla completa.

   Lo único que el elemento nativo no da es el bloqueo de desplazamiento
   del fondo, y eso sí se hace a mano.

   Es la ÚNICA superficie del sistema con radio propio —8 px arriba— porque
   es la única que de verdad se levanta del papel. Sin sombra: el fondo
   atenuado ya la separa.
   ------------------------------------------------------------------ */
export function Hoja({
  abierta,
  retornarA,
  bloqueada = false,
  alCerrar,
  titulo,
  eyebrow,
  children,
}: {
  abierta: boolean
  retornarA?: HTMLElement | null
  bloqueada?: boolean
  alCerrar: () => void
  /** Se pinta como encabezado Y etiqueta al diálogo: nunca pueden discrepar. */
  titulo: string
  eyebrow?: ReactNode
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const origen = useRef<HTMLElement | null>(null)
  const tituloId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierta && !d.open) {
      origen.current=retornarA??(document.activeElement instanceof HTMLElement?document.activeElement:null)
      d.showModal()
    }
    if (!abierta && d.open) {
      d.close()
      queueMicrotask(() => {
        const activo = document.activeElement
        if (retornarA || !activo || activo === document.body || d.contains(activo)) {
          const anterior=origen.current
          const destino = anterior?.isConnected&&!anterior.matches(':disabled')?anterior:document.querySelector<HTMLElement>('.casa-carta-barra button') ?? document.querySelector<HTMLElement>('.casa-carta-buscador input') ?? document.getElementById('contenido')
          destino?.focus({ preventScroll: true })
        }
      })
    }
  }, [abierta])

  // El fondo no se desplaza mientras la hoja está arriba. Se restaura el
  // valor que hubiera, no un `''` a ciegas.
  useEffect(() => {
    if (!abierta) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [abierta])

  return (
    <dialog
      ref={ref}
      aria-labelledby={tituloId}
      onClose={() => { if (!bloqueada) alCerrar() }}
      onCancel={e => {
        // El padre decide si puede cerrar, incluso mientras una operación está pendiente.
        e.preventDefault()
        if (!bloqueada) alCerrar()
      }}
      // Clic fuera del panel.
      //
      // El comentario anterior decía que el <dialog> «ocupa toda la pantalla».
      // No: con `w-full max-w-md … mt-auto`, el <dialog> ES el panel. Por eso
      // `target === dialog` era cierto en dos sitios opuestos —el backdrop y el
      // propio padding del panel— y tocar el hueco entre dos filas del pedido
      // descartaba la hoja con el pedido dentro.
      //
      // Lo que de verdad los separa es dónde cayó el puntero respecto de la
      // caja del panel, así que es eso lo que se mide. `target === dialog`
      // sigue haciendo falta: sin él, un clic sobre un hijo que sobresalga
      // contaría como fuera.
      onClick={(e) => {
        const d = ref.current
        if (!d || e.target !== d) return
        const caja = d.getBoundingClientRect()
        const fuera =
          e.clientX < caja.left ||
          e.clientX > caja.right ||
          e.clientY < caja.top ||
          e.clientY > caja.bottom
        if (fuera && !bloqueada) alCerrar()
      }}
      className={[
        // El indicador de inicio se come 32 px abajo Y cancela la hoja al tocarlo:
        // sin la franja segura, el botón de confirmar aterriza justo ahí.
        'casa-hoja w-full max-w-md rounded-t-hoja border-t-2 border-t-banda bg-papel p-5',
        'pb-[max(2rem,env(safe-area-inset-bottom))]',
        'mb-0 mt-auto backdrop:bg-tinta/60',
        'open:animate-[sube_320ms_cubic-bezier(0.16,0.84,0.24,1)]',
      ].join(' ')}
    >
      <div className="mb-3 flex justify-end">
        <button type="button" disabled={bloqueada} onClick={alCerrar} aria-label="Cerrar panel" className="flex min-h-[44px] items-center gap-2 rounded-full border border-filete px-4 text-cuerpo text-tinta">
          Cerrar <Icono nombre="close" tam={20} />
        </button>
      </div>
      {eyebrow}
      <h2 id={tituloId} className="mt-1 font-titular text-seccion font-bold tracking-tight text-tinta">
        {titulo}
      </h2>
      {children}
    </dialog>
  )
}

/* ------------------------------------------------------------------
   CONFIRMAR COMPRA

   Las tres compras nuevas —bolsa numerada, butaca de experiencia y plaza
   de la Mesa Fundadora— salían de UN toque. C$ 890 se iban de la cuenta
   entre que el dedo bajaba y subía, sin una pantalla que dijera cuánto.

   No es una hipótesis: durante una auditoría, un agente tocó «Apartar
   butaca» para comprobar que el botón respondía y le sacó C$ 850 a la
   cuenta de muestra. Un humano distraído se equivoca igual.

   La hoja dice las tres cifras que importan —qué cuesta, qué hay, qué
   queda— y pone el importe DENTRO del botón: quien confirma ve el número
   en el sitio donde está apretando.
   ------------------------------------------------------------------ */
export function ConfirmarCompra({
  abierta,
  alCerrar,
  titulo,
  detalle,
  precio,
  saldo,
  cargando = false,
  alConfirmar,
}: {
  abierta: boolean
  alCerrar: () => void
  /** Qué se lleva. Se pinta también como etiqueta del diálogo. */
  titulo: string
  detalle?: ReactNode
  /** centavos */
  precio: number
  /** centavos */
  saldo: number
  cargando?: boolean
  alConfirmar: () => void
}) {
  const queda = saldo - precio
  return (
    <Hoja abierta={abierta} alCerrar={alCerrar} titulo={titulo} eyebrow="Confirmá la compra">
      {detalle && <p className="mb-4 font-texto text-cuerpo text-tinta-media">{detalle}</p>}

      <dl className="divide-y divide-filete rounded-none border border-filete bg-avena px-4">
        <div className="flex items-baseline justify-between py-3">
          <dt className="font-texto text-cuerpo text-tinta-media">Cuesta</dt>
          <dd className="font-titular text-seccion font-bold tabular-nums text-tinta">
            {cordobas(precio)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between py-3">
          <dt className="font-texto text-cuerpo text-tinta-media">Tenés</dt>
          <dd className="font-texto text-cuerpo font-semibold tabular-nums text-tinta">
            {cordobas(saldo)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between py-3">
          <dt className="font-texto text-cuerpo text-tinta-media">Te queda</dt>
          <dd
            className={[
              'font-texto text-cuerpo font-semibold tabular-nums',
              queda < 0 ? 'text-achiote' : 'text-banda',
            ].join(' ')}
          >
            {cordobas(queda)}
          </dd>
        </div>
      </dl>

      <Boton
        ancho
        className="mt-5"
        cargando={cargando}
        disabled={queda < 0}
        onClick={alConfirmar}
      >
        {queda < 0 ? 'No alcanza el saldo' : `Sí, cobrá ${cordobas(precio)}`}
      </Boton>
      <Boton tono="tenue" ancho className="mt-2" onClick={alCerrar} disabled={cargando}>
        Mejor no
      </Boton>
    </Hoja>
  )
}

