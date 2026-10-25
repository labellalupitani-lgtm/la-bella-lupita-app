/**
 * Las reglas del guardián, separadas del guardián.
 *
 * Viven aparte para que `pruebas-guardian.mjs` pueda importarlas y exigir que
 * CADA UNA dispare contra una sonda.
 *
 * Y hay una lección de la ronda 3 escrita en `SONDAS_AJENAS`: las sondas que
 * escribe quien escribió la regla sólo prueban lo que la regla ya sabía. Un
 * auditor externo escribió diez evasiones en un minuto y **ocho pasaron**,
 * incluida `bg-marfil`, que ni siquiera compila en Tailwind y dejaba el
 * elemento sin fondo mientras el guardián firmaba «limpio».
 *
 * Esas diez viven aquí como prueba permanente. Cuando alguien encuentre la
 * once, se añade abajo.
 */
import config from '../tailwind.config.js'

/**
 * `colors`, `borderRadius` y `fontSize` viven FUERA de `extend` desde el
 * sistema «Etiqueta»: ahí reemplazan la escala de fabrica de Tailwind en vez
 * de sumarse a ella, que es lo que hace que `bg-red-500` o `rounded-lg` ni
 * compilen. `fontFamily` sigue en `extend`. Se leen de los dos sitios para
 * que el guardian no dependa de esa decision.
 */
const T = config.theme
const de = (clave) => Object.keys(T[clave] ?? T.extend?.[clave] ?? {})

export const colores = de('colors').filter((c) => !['transparent', 'current', 'inherit'].includes(c))
export const radios = de('borderRadius')
export const familias = de('fontFamily')
export const tamanos = de('fontSize')

const PREFIJOS_COLOR =
  '(?:bg|text|border|ring|ring-offset|from|via|to|fill|stroke|decoration|outline|shadow|caret|accent|divide|placeholder)'

const PALETAS_FABRICA =
  '(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)'

/**
 * Los ocho escalones del sistema «Etiqueta». Están en `tailwind.config.js`
 * FUERA de `extend`, así que `text-4xl` ya ni compila; esta lista existe para
 * que el guardián pueda decir POR QUÉ, y para cazar los tamaños escritos a
 * mano, que es por donde volvían los trece de antes.
 */
const ESCALA = tamanos

export const PERMITIDO = [
  {
    patron: 'textura de ruido en SVG data-URI',
    re: /feTurbulence|fractalNoise/g,
    razon: 'el grano del papel sin blanquear sobre el que está impresa la banda',
  },
  {
    // Una máscara necesita una pintura opaca cualquiera; el color no se ve
    // nunca y ningún token de la paleta significa «opaco». Es el idioma de
    // `mask-image`, no una decisión de marca.
    patron: 'linear-gradient(#000 …) — pintura de máscara',
    re: /linear-gradient\(\s*(?:to right,\s*)?#000[^)]*\)/g,
    razon: 'el desvanecido del borde derecho de los carriles horizontales (hallazgo V-09)',
  },
  {
    patron: "theme('colors.…')",
    re: /theme\('colors\.[a-z-]+'\)/g,
    razon: 'resuelve desde tailwind.config.js, que es exactamente lo que se pide',
  },
]

export const REGLAS = [
  {
    // Tres dígitos también: `#f00` pasaba entero porque la regla exigía seis.
    id: 'hex-a-mano',
    re: /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g,
    sonda: "<div style={{ color: '#f00' }} />",
    mensaje: (m) => `color escrito a mano «${m}» — tiene que ser un token de tailwind.config.js`,
  },
  {
    // `rgb()`, `hsl()` y compañía entraban sin que nada las mirara.
    id: 'color-css-literal',
    re: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/g,
    sonda: "<div style={{ background: 'rgb(34,30,23)' }} />",
    mensaje: (m) => `«${m}…» es un color CSS literal. Los colores salen de la config, no del código`,
  },
  {
    id: 'color-arbitrario',
    re: new RegExp(`\\b${PREFIJOS_COLOR}-\\[(?![\\d.]+(?:px|rem|em|%|vh|vw|ch)\\])[^\\]]+\\]`, 'g'),
    sonda: '<div className="bg-[var(--x)]" />',
    mensaje: (m) => `color arbitrario «${m}» — declaralo como token`,
  },
  {
    // Antes se admitían `text-[10px]` y `text-[11px]` como excepción, y esa
    // puerta entreabierta era por donde volvían los demás: la auditoría contó
    // trece tamaños en pantalla para nueve roles declarados. Ahora la escala
    // tiene nombre y no admite ningún tamaño escrito a mano.
    id: 'tamano-arbitrario',
    re: /\btext-\[[\d.]+(?:px|rem|em)\]/g,
    sonda: '<div className="text-[14px]" />',
    mensaje: (m) => `«${m}» no está en la escala. Los ocho escalones son: ${ESCALA.join(', ')}`,
  },
  {
    id: 'paleta-de-fabrica',
    re: new RegExp(`\\b${PREFIJOS_COLOR}-${PALETAS_FABRICA}-\\d{2,3}\\b`, 'g'),
    sonda: '<div className="bg-red-500" />',
    mensaje: (m) => `«${m}» es de la paleta de fábrica de Tailwind, no de Club Lupita`,
  },
  {
    // `bg-white` y `text-black` son de fábrica y no están en la paleta.
    id: 'blanco-y-negro-de-fabrica',
    re: new RegExp(`\\b${PREFIJOS_COLOR}-(?:white|black)\\b`, 'g'),
    sonda: '<div className="bg-white text-black" />',
    mensaje: (m) =>
      `«${m}» no existe en la paleta. El blanco de la casa es surface-container-lowest y el negro, espresso`,
  },
  {
    id: 'radio-arbitrario',
    re: /\brounded(?:-[a-z]{1,2})?-\[[^\]]+\]/g,
    sonda: '<div className="rounded-[13px]" />',
    mensaje: (m) => `radio arbitrario «${m}» — la escala está cerrada: ${radios.join(', ')}`,
  },
  {
    // Con lado: `rounded-t-3xl` y `rounded-b-lg` se colaban enteros.
    id: 'radio-fuera-de-canon',
    re: /\brounded-(?:(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee)-)?(?:sm|md|lg|xl|2xl|3xl)\b/g,
    sonda: '<div className="rounded-t-3xl rounded-b-lg" />',
    mensaje: (m) =>
      `«${m}» no existe en el sistema «Etiqueta». Los cuatro radios son: ${radios.join(', ')} — ` +
      'y `full` es SÓLO para lo que se aprieta: el botón y el sello',
  },
  {
    id: 'familia-fuera-de-canon',
    re: /\bfont-(display|serif|sans|mono|headline|body|label)\b(?!\s*:)/g,
    sonda: '<div className="font-serif" />',
    mensaje: (m) =>
      `«${m}» no es una familia del sistema. Son dos: ${familias.join(', ')}. ` +
      '`headline`/`display` y `body`/`label` eran cuatro alias de las mismas dos fuentes',
  },
  {
    id: 'clase-rota-del-prototipo',
    re: /\bActive:\s*scale|\bdocked\b|\bfull-width\b|\bbg-surface-low\b|\bhover:bg-primary-fixed-variant\b|\bscrollbar-hide\b/g,
    sonda: '<div className="docked" />',
    mensaje: (m) => `«${m}» es una errata del prototipo: no compila ni existe. Ver SPEC.md §12.11`,
  },
  {
    id: 'tracking-fuera-de-canon',
    re: /\btracking-(wide|\[[^\]]+\])\b/g,
    sonda: '<div className="tracking-wide" />',
    mensaje: (m) => `«${m}» — el sistema sólo usa tracking-wider y tracking-widest`,
  },
  {
    id: 'oro-como-texto',
    // `text-oro-luz` sí vale: sobre la banda verde rinde 6,32:1. El que no
    // vale es el oro de superficie clara, que se queda en 3,21:1.
    re: /\btext-oro(?![-a-z])/g,
    sonda: '<div className="text-oro" />',
    mensaje: () =>
      'el oro rinde 3,21:1 sobre avena: sirve de filete, no de texto. ' +
      'Sobre claro habla text-achiote (4,55:1); sobre la banda verde, text-oro-luz (6,32:1)',
  },
  {
    // El sistema «Etiqueta» no proyecta sombra: una etiqueta impresa no la
    // tiene. La versión anterior declaraba en base.css que «el foco de teclado
    // es la única sombra permitida en todo el sistema» y repartía cuatro
    // sombras distintas por 115 elementos (hallazgo V-12 de la auditoría).
    // Aquí la regla escrita y el código dicen por fin lo mismo.
    id: 'sombra-prohibida',
    re: /\bshadow-(?!none\b)[a-z0-9[]/g,
    sonda: '<div className="shadow-sm" />',
    mensaje: () =>
      'el sistema no tiene sombras: lo que separa es el filete de 1 px o la banda verde. Ver base.css',
  },
  {
    id: 'importante-en-utilidad',
    re: /(?<=["'`\s])!(?:[a-z-]+:)?[a-z]+-[a-z0-9/-]+/g,
    sonda: "<div className={['px-2', '!text-porcelana'].join(' ')} />",
    mensaje: (m) =>
      `«${m}» pisa el componente con !important: si hay que pisarlo, el componente necesita una prop`,
  },
  {
    id: 'imagen-sin-alt',
    re: /<img\b(?![^>]*\balt\s*=)[^>]*>/gs,
    sonda: '<img\n  src="/x.png"\n  className="size-10"\n/>',
    mensaje: () => 'un <img> sin atributo alt (usá alt="" si es decorativa)',
  },
  {
    // Sin `i` se colaban «Casa lupita» y «CASA LUPITA». Y corre también sobre
    // los comentarios y sobre la config, que es donde seguía vivo.
    id: 'nombre-retirado',
    re: /\bcasa\s+lupita\b/gi,
    sonda: '<p>Casa lupita y CASA LUPITA</p>',
    enComentarios: true,
    mensaje: () =>
      '«Casa Lupita» se retiró en SPEC §2: era una invención del prototipo. La marca es «La Bella Lupita» y el producto «Club Lupita»',
  },
  {
    id: 'jerga-sin-traducir',
    re: /\b(attach|flight|onboarding|welcome|insight|engagement)\b/gi,
    sonda: '<p>Attach de miembros</p>',
    mensaje: (m) => `«${m}» es jerga sin traducir. El DESIGN.md no admite inglés en la interfaz`,
  },
  {
    id: 'glifo-retirado',
    re: /\b(drive_file_rename_outline|error_outline|arrow_right_alt|calendar_month|restaurant_menu|store|loyalty|chair|chair_alt|deck|card_giftcard|featured_seasonal_and_gifts|crown|payments|stars|star|verified)\b/g,
    sonda: '<Icono nombre="stars" />',
    mensaje: (m) => `«${m}» se retiró en SPEC §4: un glifo, un significado. Buscá su canónico en la tabla`,
  },
]

/**
 * Las diez evasiones que un auditor externo escribió en la ronda 3. Ocho
 * pasaron. Se quedan como prueba permanente: la única sonda que vale algo es
 * la que no escribió quien escribió la regla.
 */
export const SONDAS_AJENAS = [
  { que: 'alias inventado de una palabra', codigo: '<div className="bg-marfil text-tinta border-lamina" />' },
  { que: 'radio con lado', codigo: '<div className="rounded-t-3xl rounded-b-lg" />' },
  { que: 'tamaños en píxeles fuera de escala', codigo: '<div className="text-[8px] text-[14px] text-[48px]" />' },
  { que: 'el nombre retirado en otra caja', codigo: '<p>Casa lupita y CASA LUPITA</p>' },
  { que: 'hex de tres dígitos', codigo: "<div style={{ color: '#f00' }} />" },
  { que: 'rgb literal', codigo: "<div style={{ background: 'rgb(34,30,23)' }} />" },
  { que: 'blanco y negro de fábrica', codigo: '<div className="bg-white text-black" />' },
  { que: 'hsl literal', codigo: "<div style={{ color: 'hsl(40 60% 50%)' }} />" },
  { que: 'glifo retirado por el §4', codigo: '<Icono nombre="stars" />' },
  { que: 'glifos retirados, en pareja', codigo: '<Icono nombre="star" /><Icono nombre="verified" />' },
]

export function sinComentarios(texto) {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(Math.max(0, m.length - p.length)))
}

export function enmascarar(texto) {
  let out = texto
  for (const p of PERMITIDO) out = out.replace(p.re, (m) => ' '.repeat(m.length))
  return out
}

export function revisar(texto, { conComentarios = false } = {}) {
  const conCom = enmascarar(texto)
  const sinCom = enmascarar(conComentarios ? texto : sinComentarios(texto))
  const fallos = []
  for (const regla of REGLAS) {
    const donde = regla.enComentarios ? conCom : sinCom
    regla.re.lastIndex = 0
    for (const m of donde.matchAll(regla.re)) {
      if (regla.salta && !regla.salta(m)) continue
      fallos.push({
        linea: donde.slice(0, m.index).split('\n').length,
        id: regla.id,
        texto: regla.mensaje(m[0]),
      })
    }
  }
  return fallos
}

/* ------------------------------------------------------------------
   Comprobación cruzada de tokens

   Antes exigía al menos un guión —`[a-z]+(?:-[a-z]+)+`— así que cerraba
   `bg-brand-espresso` y dejaba abierto `bg-marfil`, que es el alias más
   fácil de teclear y el que deja el elemento sin fondo.

   Ahora acepta la palabra suelta y descarta, con lista explícita, las
   utilidades de Tailwind que comparten prefijo con los colores. La lista es
   finita y comprobable; un nombre que no esté ni en la config ni aquí es un
   alias inventado.
   ------------------------------------------------------------------ */
const ESTRUCTURALES = new Set(['transparent', 'current', 'inherit'])

const NO_SON_COLOR = new Set([
  // text-* : los ocho escalones de la escala tipográfica. Sin ellos, la
  // comprobación cruzada leía `text-cuerpo` como un color inventado.
  'micro', 'menuda', 'pie', 'cuerpo', 'guia', 'seccion', 'pantalla', 'grande',
  'left', 'right', 'center', 'justify', 'start', 'end',
  'wrap', 'nowrap', 'balance', 'pretty', 'ellipsis', 'clip',
  // bg-*
  'cover', 'contain', 'no', 'repeat', 'fixed', 'local', 'scroll', 'none', 'gradient',
  // degradados: `bg-gradient-to-b`, `from-espresso/40`
  'to', 'b', 'br', 'bl', 'tr', 'tl',
  // border-* / divide-* / outline-* / ring-*
  'solid', 'dashed', 'dotted', 'double', 'hidden', 'collapse', 'separate',
  'inset', 'offset', 'x', 'y',
  // shadow-* / tamaños compartidos con `text-`
  'inner', 'md',
  // lados sueltos de `border-t`, `divide-y`, `rounded-b`
  't', 'r', 'b', 'l', 's', 'e',
  // propiedades CSS que comparten prefijo dentro de los .css
  'transform', 'shadow', 'decoration', 'indent', 'align', 'overflow', 'combine',
  'emphasis', 'orientation', 'rendering', 'size', 'spacing', 'underline', 'wrap',
  'image', 'position', 'repeat', 'attachment', 'origin', 'blend',
  // stroke/fill
  'round', 'butt', 'square',
])

const PREFIJOS_COMPUESTOS = [/^offset-/, /^(?:t|r|b|l|x|y|s|e)-/]

export function tokensInexistentes(texto) {
  const s = sinComentarios(texto)
  // El `(?!\s*:)` descarta las propiedades CSS que comparten prefijo con las
  // utilidades de color: `border-radius:`, `text-transform:`, `background-color:`.
  const re = new RegExp(
    `\\b${PREFIJOS_COLOR}-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?:\\/\\d{1,3})?\\b(?!\\s*:)`,
    'g',
  )
  const malos = new Set()
  for (const m of s.matchAll(re)) {
    let u = m[1]
    if (/^\d/.test(u)) continue
    for (const p of PREFIJOS_COMPUESTOS) u = u.replace(p, '')
    if (colores.includes(u) || ESTRUCTURALES.has(u) || NO_SON_COLOR.has(u)) continue
    // Compuestos de utilidad: `no-repeat`, `gradient-to-r`, `offset-2`.
    if (u.split('-').every((t) => NO_SON_COLOR.has(t) || /^\d+$/.test(t))) continue
    malos.add(m[1])
  }
  return [...malos]
}
