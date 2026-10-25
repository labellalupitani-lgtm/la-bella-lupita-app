/**
 * Primitivas del sistema «Etiqueta».
 *
 * Tres reglas gobiernan este archivo, y las tres salen de la auditoría visual
 * del 25-08-2026:
 *
 *   · LA PÍLDORA ES SÓLO PARA APRETAR. Antes hacía trece papeles —botón,
 *     chip, sello, avatar, contador, día, insignia, barra— y por eso no
 *     significaba ninguno. Aquí `rounded-full` aparece en dos sitios: el
 *     botón y el sello, que es un sello redondo de verdad.
 *   · NADA PROYECTA SOMBRA. Lo que separa es el filete o la banda.
 *   · TODO LO QUE SE TOCA MIDE 44 px. El componente `Boton` ya lo hacía; el
 *     chip se quedaba en 42 y el «+» de la carta en 40 (hallazgo V-08).
 */
import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from 'react'

/**
 * «Estoy dentro de la banda verde».
 *
 * El botón primario es verde sobre claro. Dentro del carnet —que ES la banda
 * verde— queda verde sobre verde: 1:1, un botón que no existe. Me pasó tres
 * veces en la misma tarde, en Inicio, en Tienda y en Club, y las tres veces
 * hubo que verlo en una captura para darse cuenta.
 *
 * Arreglarlo caso por caso deja la trampa puesta para el siguiente. El carnet
 * declara dónde está y el botón se entera solo.
 */
export const EnLaBanda = createContext(false)
export type { NombreIcono } from './iconos.gen'
import type { NombreIcono } from './iconos.gen'

/* ------------------------------------------------------------------
   ICONO — Material Symbols, subconjunto autoalojado.

   `NombreIcono` sale generado de `iconos.gen.ts`, que a su vez sale del
   subconjunto que hay en la fuente. Pedir un glifo que no está deja de
   compilar: antes se imprimía en letras dentro de la pantalla.
   ------------------------------------------------------------------ */

export function Icono({
  nombre,
  lleno = false,
  tam = 24,
  className = '',
}: {
  nombre: NombreIcono
  lleno?: boolean
  tam?: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={`ico ${lleno ? 'ico-lleno' : ''} ${className}`}
      style={{ fontSize: `${tam}px` }}
    >
      {nombre}
    </span>
  )
}

/* ------------------------------------------------------------------
   BOTÓN — la única píldora del sistema junto con el sello.

   Sobre la banda verde manda `papel` (9,61:1). Sobre claro manda la banda
   (8,03:1 sobre avena). Los dos pasan AA con holgura, así que ya no hace
   falta la desviación que el sistema anterior tenía escrita en su §11.
   ------------------------------------------------------------------ */
type Tono = 'primario' | 'papel' | 'contorno' | 'claro' | 'tenue'

const TONOS: Record<Tono, string> = {
  primario: 'bg-banda text-papel hover:bg-banda-honda',
  /*
    El primario DENTRO de la banda verde.

    `primario` es verde sobre claro. Dentro del carnet —que es la misma banda
    verde— quedaba verde sobre verde: 1:1, un botón que no existía. Se vio en
    la primera captura del sistema nuevo, con «Recargá» invisible sobre el
    carnet. Aquí se invierte: papel macizo con la letra en banda, 9,61:1.
  */
  papel: 'bg-papel text-banda hover:bg-avena',
  // Sobre la banda verde, la acción secundaria: borde y letra en papel.
  contorno: 'bg-transparent border border-papel text-papel hover:bg-papel/10',
  // Sobre claro: el borde es tinta, como un recuadro impreso.
  claro: 'bg-transparent border border-tinta text-tinta hover:bg-avena',
  tenue: 'bg-transparent text-tinta-media hover:text-tinta underline underline-offset-4',
}

export function Boton({
  children,
  tono = 'primario',
  icono,
  ancho = false,
  compacto = false,
  cargando = false,
  className = '',
  ...resto
}: {
  children: ReactNode
  tono?: Tono
  icono?: NombreIcono
  ancho?: boolean
  /**
   * El botón que va dentro de una fila, al lado de un texto.
   *
   * Recorta el aire horizontal y NADA MÁS: `min-h-[44px]` se queda. Un botón
   * de 36 px de alto entra bien en el diseño y se falla con el pulgar, que es
   * exactamente el intercambio que la 2.5.5 no admite. Existe esta prop para
   * que nadie tenga que pisar el componente con `!important` —que es como se
   * coló la primera vez—.
   */
  compacto?: boolean
  /**
   * Mientras la casa contesta. El texto NO se sustituye por un giro: se
   * queda, para que el botón no cambie de ancho y para que quien usa lector
   * de pantalla siga sabiendo qué apretó. `aria-busy` lo anuncia.
   */
  cargando?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const apagado = Boolean(resto.disabled) && !cargando
  // Dentro de la banda, el primario se invierte solo. Ver `EnLaBanda`.
  const enBanda = useContext(EnLaBanda)
  if (enBanda && tono === 'primario') tono = 'papel'

  /*
    EL ESTADO APAGADO NO ES UNA PÍLDORA DESCOLORIDA.

    La auditoría lo levantó como hallazgo V-06: en «Club» había tres
    «APARTAR BUTACA» seguidos en salvia sobre crema y en «Tienda» uno más.
    Eran los elementos más grandes de sus pantallas y se leían como app rota,
    no como «todavía no».

    Aquí el apagado CAMBIA DE FORMA: pierde la píldora y el relleno y pasa a
    ser un recuadro de canto vivo con filete punteado —el mismo lenguaje que
    la casilla de la tanda que aún no se ha ganado—. Ya no compite con los
    botones vivos porque ya no parece uno.
  */
  const forma = apagado
    ? 'rounded-none border border-dashed border-filete bg-transparent text-tinta-media'
    : tono === 'tenue'
      ? `font-texto text-cuerpo ${TONOS.tenue}`
      : `rounded-troquel ${TONOS[tono]}`

  const talle =
    tono === 'tenue' && !apagado
      ? ''
      : compacto
        ? 'py-2 px-4 text-pie font-texto font-medium'
        : 'py-3 px-5 text-cuerpo font-texto font-medium'

  return (
    <button
      // Sin `type`, un botón dentro de un formulario lo ENVÍA. Ninguno de los
      // del kit quiere eso, y el que lo quiera lo pide explícitamente.
      type="button"
      {...resto}
      aria-busy={cargando || undefined}
      data-tono={tono}
      disabled={resto.disabled || cargando}
      className={[
        'casa-boton inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 whitespace-normal text-center',
        'transition-transform duration-tactil ease-extraccion',
        apagado ? 'pointer-events-none' : 'active:scale-95',
        forma,
        talle,
        ancho ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {cargando ? (
        <span
          aria-hidden="true"
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icono && <Icono nombre={icono} tam={18} />
      )}
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------
   CHIP DE FILTRO — la fila desplazable de la Carta y de Reservá.

   Ya no es una píldora: es un troquel de 2 px. El activo es un bloque de
   tinta maciza, que es como una etiqueta impresa marca la pestaña abierta.

   Y mide 44 px de alto. Antes 42 — dos píxeles que no se ven y que la 2.5.5
   sí cuenta (hallazgo V-08).
   ------------------------------------------------------------------ */
export function ChipFiltro({
  children,
  activo = false,
  className = '',
  ...resto
}: { children: ReactNode; activo?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...resto}
      aria-pressed={activo}
      className={[
        'casa-filtro inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-troquel px-5',
        'font-texto text-cuerpo font-semibold transition-colors duration-tactil ease-extraccion',
        activo
          ? 'bg-tinta text-papel'
          : 'border border-filete bg-papel text-tinta-media hover:border-tinta hover:text-tinta',
        // Va al final para que quien lo pase pueda ajustar el ancho o el
        // centrado. Antes `className` caia en `...resto` y lo pisaba esta
        // linea entera, asi que no hacia nada y no se notaba.
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------
   CHIP DE ESCASEZ — «Quedan 34 de 150», «8/12 cupos».
   Nunca es decorativo: siempre lleva cifra.

   Dos formas del mismo achiote, y la diferencia no es de tono sino de
   relleno, que es la regla del sistema entero:

     · `claro`  — contorno sobre superficie clara. 4,55:1 sobre avena.
     · `tinta`  — MACIZO, para ir encima de una fotografía o de la banda.

   El macizo arregla el hallazgo V-07 y de paso el que estaba al lado: el
   icono `local_fire_department` se pintaba en durazno sobre el propio fondo
   dorado del chip y rendía **1,06:1** —invisible—, y el chip entero, de
   contorno translúcido sobre una foto, tampoco se leía. Ahora la etiqueta
   sobre foto es un bloque opaco de achiote con la letra en papel: 5,44:1
   pase lo que pase debajo.
   ------------------------------------------------------------------ */
export function ChipEscasez({
  children,
  icono = 'local_fire_department',
  tono = 'claro',
  className = '',
}: {
  children: ReactNode
  icono?: NombreIcono
  /**
   * Dónde va el chip. No es decoración: cada sitio tiene un fondo distinto y
   * el achiote no vale para los tres.
   *
   * `claro` — sobre avena o papel: contorno de achiote, 4,55:1.
   * `foto`  — encima de una imagen: bloque macizo de achiote con letra en
   *           papel, 5,44:1 pase lo que pase debajo.
   * `banda` — dentro del carnet verde. Aquí el achiote NO sirve: rinde
   *           1,77:1 contra la banda y sólo se distingue por tono, que es
   *           justo lo que no ve quien tiene un déficit de rojo-verde. Va en
   *           contorno claro, que es 6,32:1.
   */
  tono?: 'claro' | 'foto' | 'banda'
  className?: string
}) {
  const TONO = {
    claro: 'border border-achiote bg-transparent text-achiote',
    foto: 'bg-achiote text-papel',
    banda: 'bg-rosa text-tinta',
  } as const
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-troquel px-2.5 py-1',
        'font-texto text-menuda font-bold uppercase tracking-wider',
        TONO[tono],
        className,
      ].join(' ')}
    >
      <Icono nombre={icono} tam={14} lleno={tono !== 'claro'} />
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------
   BARRA DE PROGRESO — con etiqueta accesible obligatoria.
   El PRD la pide para sellos y para nivel. No existe sin `de`/`sobre`.

   Canto vivo y filete, como una regla impresa. El relleno es achiote
   (4,55:1 sobre el carril de avena) o banda (8,03:1): los dos pasan de
   sobra el 3,0 que la 1.4.11 pide para un objeto gráfico. El contorno NO puede
   rellenarla —1,42:1 sobre avena— y por eso el contorno en este sistema es
   filete y no relleno.
   ------------------------------------------------------------------ */
export function Progreso({
  de,
  sobre,
  etiqueta,
  tono = 'fidelidad',
  className = '',
}: {
  de: number
  sobre: number
  etiqueta: string
  /**
   * `fidelidad` para la tanda y el nivel —el achiote del sello—;
   * `accion` para el reto de la semana, que va en verde.
   */
  tono?: 'fidelidad' | 'accion'
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, (de / sobre) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={de}
      aria-valuemin={0}
      aria-valuemax={sobre}
      aria-label={etiqueta}
      // El filete va con `outline` y no con `ring`: el `ring` de Tailwind se
      // apoya en variables de sombra que aquí se quedaban en cero, y el
      // filete no aparecía.
      className={`casa-progreso h-2 w-full overflow-hidden rounded-none bg-avena outline outline-1 -outline-offset-1 outline-filete ${className}`}
    >
      <div
        className={[
          'h-full transition-[width] duration-rito ease-extraccion',
          tono === 'accion' ? 'bg-banda' : 'bg-achiote',
        ].join(' ')}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------
   EYEBROW — la etiqueta en versalitas que abre casi cada bloque.

   Sobre claro habla el achiote (4,55:1); sobre la banda verde habla el contorno
   claro (6,32:1). El contorno de superficie clara —`contorno`, 3,21:1— no es texto en
   ningún caso, y el guardián lo prohíbe.
   ------------------------------------------------------------------ */
export function Eyebrow({
  children,
  tono = 'acento',
  className = '',
}: {
  children: ReactNode
  /** `banda` es el único tono que va sobre la banda verde. */
  tono?: 'acento' | 'suave' | 'banda'
  className?: string
}) {
  const TONO = {
    acento: 'text-achiote',
    suave: 'text-tinta-media',
    banda: 'text-rosa',
  } as const
  return <p className={['t-eyebrow', TONO[tono], className].join(' ')}>{children}</p>
}

/* ------------------------------------------------------------------
   CONTADOR — subir y bajar una cantidad.

   Nace del hallazgo V-11: «Personas» y «Horas» eran dos filas contiguas de
   píldoras numéricas idénticas, y lo único que las separaba era una
   versalita gris de 11 px. Un recuento (¿cuántos van?) y una duración
   (¿cuánto rato?) son preguntas distintas y ahora tienen formas distintas.

   Los dos botones miden 44 px. El valor se anuncia con `aria-live` para que
   un lector de pantalla oiga el cambio sin tener que volver a recorrer.
   ------------------------------------------------------------------ */
export function Contador({
  valor,
  min,
  max,
  alCambiar,
  etiqueta,
  sufijo,
  className = '',
}: {
  valor: number
  min: number
  max: number
  alCambiar: (n: number) => void
  /** Qué se cuenta, para el lector de pantalla: «horas de mesa». */
  etiqueta: string
  /** Lo que se pinta junto a la cifra, ya en singular o plural. */
  sufijo: string
  className?: string
}) {
  const paso = (d: number) => alCambiar(Math.min(max, Math.max(min, valor + d)))
  return (
    <div
      className={`casa-contador inline-flex items-stretch rounded-none border border-filete bg-papel ${className}`}
    >
      <button
        type="button"
        onClick={() => paso(-1)}
        disabled={valor <= min}
        aria-label={`Menos ${etiqueta}`}
        className="flex size-11 shrink-0 items-center justify-center border-r border-filete text-tinta transition-colors duration-tactil hover:bg-avena disabled:pointer-events-none disabled:text-filete"
      >
        <Icono nombre="remove" tam={20} />
      </button>
      <span
        aria-live="polite"
        aria-atomic="true"
        className="flex min-w-[7rem] items-baseline justify-center gap-1.5 px-3 py-2.5"
      >
        <span className="font-titular text-seccion font-bold tabular-nums text-tinta">{valor}</span>
        <span className="font-texto text-cuerpo text-tinta-media">{sufijo}</span>
      </span>
      <button
        type="button"
        onClick={() => paso(1)}
        disabled={valor >= max}
        aria-label={`Más ${etiqueta}`}
        className="flex size-11 shrink-0 items-center justify-center border-l border-filete text-tinta transition-colors duration-tactil hover:bg-avena disabled:pointer-events-none disabled:text-filete"
      >
        <Icono nombre="add" tam={20} />
      </button>
    </div>
  )
}
