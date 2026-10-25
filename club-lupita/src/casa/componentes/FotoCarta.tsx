import { useState } from 'react'
// Algunas variantes conservan la altura del original; los descriptores expresan
// su ancho real para evitar ampliar un bitmap de 283 px como si tuviera 480 px.
const formatos: Record<string, [number, number, number]> = {
  'bowl-del-terruno-01': [320, 640, 960],
  'budin-chia-y-fruto-de-temporada-01': [320, 640, 960],
  'delicia-de-la-abuela-de-mango-ahumado-01': [320, 640, 960],
  'la-bella-lupita-01': [292, 584, 960],
  'pizza-4-estacion-01': [320, 640, 960],
  'risoto-gallopinto-01': [283, 567, 960],
  'spring-roll-01': [320, 640, 960],
}
export function FotoCarta({ foto, nombre, sizes = '(min-width: 900px) 450px, 90vw', prioridad = false }: { foto: string; nombre: string; sizes?: string; prioridad?: boolean }) {
  const [fallo, setFallo] = useState(false)
  const nombreArchivo = foto.split('/').pop()?.replace('-960.webp', '') ?? ''
  const [mediana, grande, alto] = formatos[nombreArchivo] ?? [480, 960, 960]
  if (fallo) return <span className="carta-foto-respaldo">{nombre}<small>Fotografía no disponible</small></span>
  return <img src={foto.replace('-960.', '-480.')} srcSet={`${foto.replace('-960.', '-240.')} 240w, ${foto.replace('-960.', '-480.')} ${mediana}w, ${foto} ${grande}w`} sizes={sizes} alt={nombre} width={grande} height={alto} loading={prioridad ? 'eager' : 'lazy'} fetchPriority={prioridad ? 'high' : undefined} decoding="async" onError={() => setFallo(true)} />
}
