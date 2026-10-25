/**
 * Componentes de dato de Club Lupita: la tanda, el buscador, la ficha de
 * producto y los indicadores del panel.
 *
 * La tanda está congelada en SPEC.md §1: diez casillas, nueve se ganan, la
 * décima la pone la casa. El progreso cuenta hacia nueve.
 */
import { useId, useState, type InputHTMLAttributes } from 'react'
import { Icono, Progreso, type NombreIcono } from './Base'

export const SELLOS_PARA_PREMIO = 9
export const CASILLAS = 10

/* ------------------------------------------------------------------
   SELLO — una casilla de la tanda.

   Es la impresión de un sello de goma sobre la tarjeta de cartón: disco
   macizo de achiote con el dibujo calado en papel (5,44:1). Las casillas
   sin picar son un círculo punteado, que es exactamente lo que lleva
   impreso una tarjeta de fidelidad antes de que la marquen.

   Junto con el botón, es la única píldora del sistema: un sello es redondo
   de verdad, no por decoración.
   ------------------------------------------------------------------ */
export function Sello({
  estado,
  indice,
  reciente = false,
}: {
  estado: 'ganado' | 'vacio' | 'premio' | 'ganado-premio'
  indice: number
  /** El último sello ganado cae con sobrepaso: es el único de todo el sistema. */
  reciente?: boolean
}) {
  // Un solo dibujo para las tres casillas: `coffee_maker`. El estado se dice
  // con el relleno del disco, nunca cambiando de glifo — si el vacío fuera
  // otro dibujo la fila dejaría de leerse como progreso. La décima es la
  // única excepción, porque no es una casilla más: es el premio.
  const comun = 'relative flex size-12 items-center justify-center rounded-full'
  const cae = reciente ? 'motion-safe:animate-[cae_520ms_cubic-bezier(0.34,1.12,0.44,1)]' : ''

  if (estado === 'ganado') {
    return (
      <span className={`${comun} bg-achiote text-papel ${cae}`} title={`Sello ${indice}`}>
        <Icono nombre="coffee_maker" tam={22} lleno />
      </span>
    )
  }
  // La décima cobrada: el momento por el que existe el programa entero. Antes
  // se dibujaba idéntica con cero sellos y con nueve — el texto decía «la tanda
  // está cerrada» y el círculo no se enteraba.
  //
  // Va en banda con el contorno encima (6,32:1) y no en achiote: el premio tiene
  // que distinguirse de un sello más, y en este sistema el contorno sólo habla
  // sobre verde.
  if (estado === 'ganado-premio') {
    return (
      <span className={`${comun} bg-banda text-rosa ${cae}`} title="Tu bebida de cortesía, lista">
        <Icono nombre="redeem" tam={22} lleno />
      </span>
    )
  }
  if (estado === 'premio') {
    return (
      <span
        className={`${comun} border-2 border-dashed border-achiote text-achiote`}
        title="Tu bebida de cortesía"
      >
        <Icono nombre="redeem" tam={22} />
      </span>
    )
  }
  // El glifo de la casilla vacía iba en `filete` y rendía 1,70:1 sobre el
  // papel: se veía como un borrón, no como una casilla. Va en tinta media
  // (6,81:1) y lo que dice el estado es la FORMA —anillo punteado y sin
  // relleno, contra disco macizo—, no lo apagado del dibujo.
  return (
    <span
      className={`${comun} border-2 border-dashed border-filete text-tinta-media`}
      title={`Casilla ${indice}`}
    >
      <Icono nombre="coffee_maker" tam={20} />
    </span>
  )
}

/* ------------------------------------------------------------------
   TARJETA DE SELLOS — diez casillas en dos filas de cinco, barra de
   progreso y texto de cercanía. Los tres son obligatorios según el
   DESIGN.md; el prototipo omitía la barra en una variante.
   ------------------------------------------------------------------ */
export function TarjetaDeSellos({
  ganados,
  ultimoReciente = false,
  nuevaTanda = false,
}: {
  ganados: number
  nuevaTanda?: boolean
  ultimoReciente?: boolean
}) {
  const faltan = Math.max(0, SELLOS_PARA_PREMIO - ganados)
  const listo = faltan === 0
  return (
    <div>
      <ul className="casa-sellos-grid grid grid-cols-5 justify-items-center gap-3">
        {Array.from({ length: CASILLAS }, (_, i) => {
          const n = i + 1
          const esPremio = n === CASILLAS
          const estado = esPremio
            ? listo
              ? 'ganado-premio'
              : 'premio'
            : n <= ganados
              ? 'ganado'
              : 'vacio'
          return (
            <li key={n}>
              <Sello
                estado={estado}
                indice={n}
                reciente={ultimoReciente && (n === ganados || (listo && esPremio))}
              />
            </li>
          )
        })}
      </ul>
      <Progreso
        de={ganados}
        sobre={SELLOS_PARA_PREMIO}
        etiqueta={`${ganados} de ${SELLOS_PARA_PREMIO} sellos`}
        className="mt-4"
      />
      <p className="mt-3 text-center font-texto text-cuerpo text-tinta-media">
        {listo ? (
          <>
            <span className="font-semibold text-banda">La tanda está cerrada</span> Tu bebida de
            cortesía te espera en la barra
          </>
        ) : (
          <>
            Te {faltan === 1 ? 'falta' : 'faltan'}{' '}
            <span className="font-bold tabular-nums text-achiote">{faltan}</span> para tu bebida de
            cortesía{nuevaTanda ? ' de la nueva tanda' : ''}
          </>
        )}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------
   BUSCADOR — campo de canto vivo con lupa.

   Dejó de ser una píldora: un campo de texto no se aprieta, se escribe, y
   la píldora está reservada para la acción (ver la cabecera de `Base.tsx`).
   ------------------------------------------------------------------ */
export function Buscador({
  etiqueta,
  ...resto
}: { etiqueta: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {etiqueta}
      </label>
      <Icono
        nombre="search"
        tam={20}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tinta-media"
      />
      <input
        {...resto}
        id={id}
        type="search"
        className="h-12 w-full rounded-none border border-filete bg-papel pl-12 pr-4 font-texto text-cuerpo text-tinta placeholder:text-tinta-media focus:border-tinta"
      />
    </div>
  )
}

/**
 * Las tres tallas que hay en `public/menu`, ofrecidas como lo que son.
 *
 * Las fichas piden la foto por su nombre de 960 px, que es la unica que la
 * carta guarda en `menu.ts`. En la rejilla de dos columnas dentro de un marco
 * de 448 px cada hueco mide unos 200: el navegador se bajaba una imagen cinco
 * veces mas ancha de lo que iba a pintar, y lo hacia setenta y tres veces.
 *
 *   ls public/menu | wc -l    # 108 archivos: 36 platos x 3 tallas
 *   du -sh public/menu        # 3,5M
 *
 * Con `srcSet` elige el navegador: 240 en un telefono normal, 480 en uno de
 * pantalla densa, 960 solo si de verdad hace falta. `sizes` se lo dice en
 * pixeles CSS, porque sin `sizes` asume el ancho del viewport y vuelve a
 * bajarse la grande.
 *
 * Si el nombre no termina en `-960.webp` no se toca nada: mejor una foto
 * pesada que una rota.
 */
function anchos(foto: string): { srcSet?: string; sizes?: string } {
  const base = foto.replace(/-960\.webp$/, '')
  if (base === foto) return {}
  return {
    srcSet: `${base}-240.webp 240w, ${base}-480.webp 480w, ${foto} 960w`,
    sizes: '(max-width: 448px) 50vw, 224px',
  }
}

/* ------------------------------------------------------------------
   FICHA DE PRODUCTO — la celda de la rejilla de dos columnas.
   Foto a sangre arriba, insignia maciza superpuesta, y el «+» abajo.

   Tres arreglos de la auditoría viven en este componente:

   V-10 · El bloque de texto medía 106 px de alto y 48 de ellos eran
   `pb-12`: hueco reservado para que cupiera el «+» flotante. Casi la mitad
   del cuerpo de cada tarjeta era nada, y son veinticuatro tarjetas por
   pantalla. Ahora el sitio del botón se reserva EN HORIZONTAL con `pr-14`,
   que es espacio que el texto necesitaba de todas formas para no llegar al
   canto.

   V-08 · El «+» medía 40×40. Ahora 44, que es lo que el propio `Boton`
   exige y lo que la 2.5.5 pide.

   V-02 · La insignia sobre la foto era una píldora de contorno dorado
   translúcida y no se leía encima de una imagen. Ahora es una cinta maciza
   de achiote pegada al canto izquierdo, como la cinta de una etiqueta: 5,44:1
   pase lo que pase debajo.
   ------------------------------------------------------------------ */
export function FichaProducto({
  nombre,
  precio,
  foto,
  insignia,
  enPedido = 0,
  ancha = false,
  alAgregar,
  alAbrir,
}: {
  nombre: string
  precio: string
  foto: string | null
  insignia?: string
  /** Cuantos van ya en el pedido. Cero lo esconde. */
  ancha?: boolean
  enPedido?: number
  alAgregar: () => void
  alAbrir: () => void
}) {
  const [roto, setRoto] = useState(false)
  if (!foto || roto) return (
    <article className="casa-ficha-producto col-span-2 flex items-center gap-3 rounded-editorial border border-filete bg-papel p-4">
      <button type="button" onClick={alAbrir} className="min-h-[44px] min-w-0 flex-1 text-left">
        {insignia && <span className="block t-eyebrow text-achiote">{insignia}</span>}
        <span className="block font-titular text-guia font-bold">{nombre}</span>
        <span className="mt-1 block t-precio">{precio}</span>
      </button>
      <button type="button" onClick={alAgregar} aria-label={`Agregar ${nombre} al pedido${enPedido ? `. Llevás ${enPedido}` : ''}`} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-banda text-papel transition-transform duration-tactil active:scale-90">
        {enPedido ? <span className="font-semibold tabular-nums">{enPedido} +</span> : <Icono nombre="add" tam={22} />}
      </button>
    </article>
  )
  return (
    <article className={`casa-ficha-producto relative overflow-hidden rounded-editorial border border-filete bg-papel ${ancha ? "col-span-2" : ""}`}>
      <button type="button" onClick={alAbrir} className="block w-full text-left">
        <span className={`relative block overflow-hidden bg-avena ${ancha ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
          {/*
            Dos ausencias distintas, dos tratamientos.

            Una foto que NO SE CARGÓ es un fallo y hay que decirlo: si no, el
            navegador pinta su ícono de imagen rota encima de la carta.

            Un plato que TODAVÍA NO SE FOTOGRAFIÓ no es un fallo, es el estado
            normal de 41 de los 73 platos. Repetir «Sin foto» ocho veces en una
            pantalla le cuenta al socio un problema nuestro que no es suyo.

            El marcador anterior eran las letras «LL» en `outline-variant`
            sobre `surface-container`: **1,47:1**, es decir, un rectángulo
            gris. La auditoría lo contó dentro del hallazgo V-02. Ahora es lo
            que una carta impresa pone donde no hay fotografía: el dibujo del
            plato y una palabra, en tinta que se lee (5,70:1).
          */}
          {foto && !roto ? (
            <img
              src={foto}
              {...anchos(foto)}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setRoto(true)}
              className="size-full object-cover transition-transform duration-panel ease-crema hover:scale-105"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-full flex-col items-center justify-center gap-1.5 bg-avena text-tinta-media"
            >
              <Icono nombre={roto ? 'local_cafe' : 'restaurant'} tam={26} />
              <span className="font-texto text-menuda font-semibold uppercase tracking-widest">
                {roto ? 'Sin foto' : 'De la casa'}
              </span>
            </span>
          )}
          {insignia && (
            <span className="absolute left-0 top-2 inline-flex items-center bg-achiote px-2.5 py-1 font-texto text-menuda font-bold uppercase tracking-wider text-papel">
              {insignia}
            </span>
          )}
        </span>
        {/* `pr-14` reserva los 56 px del «+» en horizontal. Antes eran 48 px
            en vertical y no los usaba nadie. */}
        <span className="block p-3 pr-14">
          <span className="block font-titular text-guia font-bold leading-snug text-tinta">
            {nombre}
          </span>
          <span className="mt-1 block t-precio">{precio}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={alAgregar}
        aria-label={
          enPedido
            ? `Agregar otro ${nombre} Llevás ${enPedido} en el pedido`
            : `Agregar ${nombre} al pedido`
        }
        className="absolute bottom-2 right-2 flex size-11 items-center justify-center rounded-full bg-banda text-papel transition-transform duration-tactil ease-sello active:scale-90"
      >
        <Icono nombre="add" tam={22} />
      </button>
      {enPedido > 0 && (
        <span
          aria-hidden="true"
          className="absolute bottom-12 right-1 flex size-5 items-center justify-center rounded-full bg-achiote font-texto text-micro font-bold tabular-nums text-papel"
        >
          {enPedido}
        </span>
      )}
    </article>
  )
}

/* ------------------------------------------------------------------
   KPI — el indicador del panel de escritorio. Si no hay dato, lo dice;
   no rellena con un cero que parece un dato.
   ------------------------------------------------------------------ */
export function Kpi({
  etiqueta,
  valor,
  unidad,
  delta,
  nota,
  icono,
}: {
  etiqueta: string
  valor: string | null
  unidad?: string
  delta?: { signo: 'sube' | 'baja'; texto: string }
  nota?: string
  icono?: NombreIcono
}) {
  return (
    <div className="casa-indicador min-w-0 rounded-inicio-control border border-filete bg-inicio-crema p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="t-etiqueta text-tinta-media">{etiqueta}</p>
        {icono && <Icono nombre={icono} tam={18} className="text-tinta-media" />}
      </div>
      {valor === null ? (
        <p className="mt-3 font-texto text-cuerpo italic text-tinta-media">
          Pendiente de conectar el punto de venta
        </p>
      ) : (
        <p className="mt-2 flex flex-wrap items-baseline gap-1.5">
          <span className="min-w-0 font-texto text-pantalla font-bold tabular-nums text-tinta">{valor}</span>
          {unidad && <span className="font-texto text-cuerpo text-tinta-media">{unidad}</span>}
          {delta && (
            <span
              className={`ml-1 inline-flex items-center gap-0.5 font-texto text-pie font-semibold ${
                delta.signo === 'sube' ? 'text-banda' : 'text-achiote'
              }`}
            >
              <Icono nombre="trending_up" tam={14} className={delta.signo === 'baja' ? 'rotate-180' : ''} />
              {delta.texto}
            </span>
          )}
        </p>
      )}
      {nota && <p className="mt-2 t-caption">{nota}</p>}
    </div>
  )
}
