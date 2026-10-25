/**
 * Fotografía de la casa, servida al tamaño que hace falta.
 *
 * Antes se mandaban 92 kB para un hueco de 92 px en la lista de la carta: diez
 * veces los bytes necesarios, sobre una red móvil nicaragüense. Ahora el
 * navegador elige entre 240, 480 y 960 con la anchura real del hueco.
 *
 * Las rutas siguen el patrón del cliente: `nombre-01-960.webp`, y las otras dos
 * medidas se derivan del mismo nombre.
 */
type Props = {
  /** ruta a la variante de 960 px */
  src: string
  alt: string
  /** anchura real del hueco, en sintaxis de `sizes` */
  sizes: string
  width: number
  height: number
  prioridad?: boolean
  className?: string
}

const anchos = [240, 480, 960]

function juego(src: string): string | undefined {
  const base = src.replace(/-(\d+)\.webp$/, '')
  if (base === src) return undefined // no sigue el patrón: se sirve tal cual
  return anchos.map((a) => `${base}-${a}.webp ${a}w`).join(', ')
}

export function Foto({ src, alt, sizes, width, height, prioridad, className }: Props) {
  return (
    <img
      src={src}
      srcSet={juego(src)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={prioridad ? 'eager' : 'lazy'}
      // `async` deja que el navegador decodifique fuera del hilo principal:
      // en un teléfono modesto es la diferencia entre desplazarse y trabarse.
      decoding="async"
      // React 18 no reconoce `fetchPriority` en camelCase y lo escupe como
      // aviso en consola en cada render. En minúscula llega al DOM limpio.
      {...(prioridad ? { fetchpriority: 'high' } : {})}
      className={className}
    />
  )
}
