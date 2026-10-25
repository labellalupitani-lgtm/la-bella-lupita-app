import { readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
// Cada entrada anticipa el árbol estático de las pantallas que necesita.
// Reservar no descarga Inicio ni Acceso; la entrada general mantiene ambos
// disponibles sin añadir un viaje de red al terminar de cargar el módulo raíz.
const manifest=JSON.parse(readFileSync('dist/.vite/manifest.json','utf8'))
const base=readFileSync('dist/index.html','utf8')
function recursosPara(pantallas){
const modulos=new Set(),estilos=new Set(),visitados=new Set()
function anticipar(clave){
  if(visitados.has(clave))return
  visitados.add(clave)
  const modulo=manifest[clave];assert.ok(modulo,`Falta ${clave} en el manifiesto`)
  if(!modulo.isEntry)modulos.add(modulo.file)
  for(const css of modulo.css??[])estilos.add(css)
  for(const dependencia of modulo.imports??[])anticipar(dependencia)
}
for(const pantalla of pantallas)anticipar(`src/casa/pantallas/${pantalla}.tsx`)
const recursos=[...modulos].map(f=>`<link rel="modulepreload" crossorigin href="/${f}" />`)
for(const css of estilos)if(!base.includes(`href="/${css}"`))recursos.push(`<link rel="stylesheet" crossorigin href="/${css}" />`)
return recursos
}
const recursos=recursosPara(['Reservar'])
// Precargar un solo formato evita descargar AVIF y WebP en navegadores compatibles.
recursos.push('<link rel="preload" as="image" type="image/avif" href="/images/terraza-atardecer-480.avif" imagesrcset="/images/terraza-atardecer-480.avif 480w, /images/terraza-atardecer-960.avif 960w" imagesizes="(min-width: 900px) 45vw, 100vw" fetchpriority="high" />')
const entrada=base.replace('</head>',recursos.join('\n')+'\n</head>')
writeFileSync('dist/index.html',base.replace('</head>',recursosPara(['Inicio','Umbral']).join('\n')+'\n</head>'))
// Entrada pública con metadatos propios, usando exactamente el mismo build de la SPA.
const html=entrada.replace(/<title>[^<]*<\/title>/,'<title>Reservá una mesa — La Bella Lupita</title>').replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/,'$1Consultá horarios y mesas de La Bella Lupita en Managua. Elegí la fecha, el grupo y la zona; ingresá a tu cuenta para confirmar tu visita.$2').replace('</head>','<link rel="canonical" href="https://app.labellalupita.com/reservar" />\n</head>')
const compartir=html.replace('</head>','<meta property="og:title" content="Reservá una mesa — La Bella Lupita" />\n<meta property="og:description" content="Consultá fecha, grupo y zona para tu próxima visita a La Bella Lupita en Managua." />\n<meta property="og:url" content="https://app.labellalupita.com/reservar" />\n<meta property="og:type" content="website" />\n</head>')
writeFileSync('dist/reservar.html',compartir)
console.log('Entrada pública /reservar con título, descripción y URL canónica.')

const conoce=base.replace('</head>',recursosPara(['ConoceClub']).join('\n')+'\n</head>')
 .replace(/<title>[^<]*<\/title>/,'<title>Conocé tu club · La Bella Lupita</title>')
 .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/,'$1Conocé la cuenta gratuita, los sellos y los beneficios opcionales de Mesa Fundadora. Consultá cuota, renovación y condiciones de Club Lupita.$2')
 .replace('</head>','<link rel="canonical" href="https://app.labellalupita.com/conoce-tu-club" />\n<meta property="og:title" content="Conocé tu club · La Bella Lupita" />\n<meta property="og:description" content="Tu cuenta gratuita, tus sellos y los beneficios opcionales de Mesa Fundadora. Conocé cómo funciona Club Lupita." />\n<meta property="og:url" content="https://app.labellalupita.com/conoce-tu-club" />\n<meta property="og:type" content="website" />\n</head>')
writeFileSync('dist/conoce-tu-club.html',conoce)
console.log('Entrada pública /conoce-tu-club con metadatos y recursos propios.')
