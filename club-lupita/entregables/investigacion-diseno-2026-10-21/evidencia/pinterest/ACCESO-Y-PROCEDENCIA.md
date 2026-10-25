# Registro de acceso y procedencia · 21 de octubre de 2026

- `web.open` devolvió `not accessible` para ambos enlaces exactos. La búsqueda por ambos identificadores entre comillas no devolvió resultados. Esto fue un límite del extractor, no una prueba de que los pines fueran inaccesibles.
- Chrome DevTools abrió ambos pines exactos. Se inspeccionaron `location.href`, `document.title`, `meta[property="og:image"]`, la imagen principal del DOM, sus dimensiones naturales y el árbol accesible. Las capturas `pin-…-browser-login.png` muestran la página y el pin, con el modal público de inicio de sesión superpuesto. No se inició sesión.
- Se abrió en navegador cada URL pública de imagen descubierta en esos metadatos. Se inspeccionó la imagen completa. Para conservar evidencia legible se capturó el elemento `img` desde Playwright/Edge; los archivos `…-image-browser.png` son capturas del navegador, no descargas de medios remotos. La captura vertical Starbucks se ajustó al viewport: 666×1000 frente a la imagen pública 736×1104.
- Las capturas `…-source-page.png` de Pinterest se hicieron inmediatamente después de cargar los metadatos y pueden mostrar el estado de carga; la evidencia de contexto visual son las capturas `pin-…-browser-login.png`. No se usan los estados de carga para analizar diseño.
- El navegador mostró las fuentes originales de UIDesignz y Bacancy. Los originales se compararon visualmente con las imágenes de los pines. UIDesignz conserva la misma composición cuadrada. Starbucks usa los mismos diseños de pantalla y bebidas, reacomodados en un tablero vertical en Pinterest frente al tablero horizontal del original.
- En Dribbble hay dos etiquetas `og:image`: se usó la primera asociada al shot, y no la segunda, que pertenece a una imagen genérica de la plataforma. El DOM de la ficha también contiene imágenes del shot con otras variantes de exportación.
- Los JPEGs locales se copiaron sin modificación. `archivos-locales-sha256.json` permite comprobar que cada copia coincide con su original de Downloads. No se logró verificar autor ni publicación original de estos dos JPEGs; no se atribuyen a los autores de los pines.
- Ninguna captura verifica gestos, animaciones, respuesta de botones, accesibilidad, estado de carrito o adaptación responsive. Los controles dibujados prueban intención visual, no comportamiento implementado.

## Correspondencia exacta

| Entrada | Imagen pública inspeccionada | Fuente de autor verificada visualmente |
|---|---|---|
| [Pin 1060034831036382763](https://www.pinterest.com/pin/1060034831036382763/) | [Imagen 699bd70c…](https://i.pinimg.com/736x/69/9b/d7/699bd70c3751055982bb0bc0db96478f.jpg) | [Coffee App Design-UIdesignz · UIDesignz](https://dribbble.com/shots/21908991-Coffee-App-Design-UIdesignz) |
| [Pin 919297342739063250](https://www.pinterest.com/pin/919297342739063250/) | [Imagen 22db2c9f…](https://i.pinimg.com/736x/22/db/2c/22db2c9fbc3e102a6a199c4ce476180f.jpg) | [Starbucks Coffee App Design · Bacancy](https://dribbble.com/shots/20371794-Starbucks-Coffee-App-Design) |

Los `og:url` de Pinterest apuntan a otras republicaciones: `892275744905751775` y `19632948378402073`. Se conservan los enlaces solicitados como entradas y no se usa esa discrepancia para afirmar otro autor. Los perfiles HK Creative Tech y PixelCraft son quienes guardaron/publicaron los pines observados, no evidencia de autoría del diseño. El enlace saliente del pin Starbucks a `theworldaccordingtome.org` no acredita autoría; la atribución a Bacancy se fundamenta en la fuente Dribbble y en la correspondencia visual.
