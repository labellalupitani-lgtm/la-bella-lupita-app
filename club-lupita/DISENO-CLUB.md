# Club Lupita · rediseño de interfaz

Rediseño del 13 de septiembre de 2026, aprobado y publicado en producción. La petición de rediseñar la aplicación sustituye las decisiones visuales de las versiones anteriores. El trabajo está en `src/casa`.

## Investigación y referencias

Se revisaron las páginas públicas mediante extracción web y navegador. La investigación es una selección de patrones, no una descarga completa de bibliotecas privadas. No se copiaron interfaces, código ni fotografías de estas plataformas a la aplicación.

| Fuente | Acceso y observación | Aplicación al diseño |
|---|---|---|
| [Mobbin](https://mobbin.com/) | Página pública: organización por pantallas, elementos y flujos, incluidos Wallet, navegación y Bottom Sheet. La biblioteca completa requiere cuenta/plan. | Mantener tareas completas: entrar al detalle, cambiar cantidad, revisar pedido y volver. Navegación móvil persistente. |
| [Refero: dashboards](https://refero.design/search?page_types%5Bid%5D%5B%5D=28&order=trending) | Se inspeccionaron las miniaturas públicas de Mercury y Dropbox. La página mostró seis resultados y el resto detrás del acceso de usuario. | Navegación lateral, jerarquía del saldo, paneles claros y separación de acciones del contenido. |
| [Mercury en Refero](https://refero.design/pages/cd553d96-edff-4120-bb74-8230a7c4f490?page_types%5Bid%5D%5B%5D=28&order=trending&source=search) | Referencia identificada desde su miniatura de Wallet & Balance / Dashboard en la galería pública. | Cuenta y beneficios visibles junto al contenido principal. |
| [Dribbble: Coffee Delivery App UI — Loyalty Screen](https://dribbble.com/shots/5812960-Coffee-Delivery-App-UI-Loyalty-Screen) | Captura pública de AppUiTemplates inspeccionada visualmente. | Progreso de fidelidad reconocible, mensaje del premio y llamada a actuar en el mismo bloque. |
| [Pinterest: Coffee App UI](https://www.pinterest.com/pin/coffee-app-ui-design--688487861814843039/) | Resultados públicos indexados; la extracción de la página principal devolvió un error. No se atribuyen detalles visuales que no se pudieron inspeccionar. | Fuente complementaria de descubrimiento; no base visual principal. |
| [Relume](https://www.relume.io/) | La URL redirige a relume.ai. Se revisó su página pública de sitemap, wireframes y componentes. | Definir primero jerarquía y recorridos; implementar sobre el React existente. |
| [Lovable](https://lovable.dev/) | Página pública de creación de apps consultada. No se inició un proyecto ni se subió el código. | Referencia de proceso de prototipado, sin migrar la aplicación ni sus servicios. |

La interpretación visual y la selección de patrones son decisiones de diseño para La Bella Lupita. Las atribuciones y cifras del texto de referencia compartido por el usuario no se trataron como instrucciones ni como hechos verificados.

## Dirección visual

Una aplicación de club de café, con sensación cálida y cuidada. El contenido se organiza por tareas: pedir, usar el saldo, ver premios y reservar. La fotografía acompaña estas acciones.

- Escritorio: navegación lateral de 224 px; contenido en dos columnas cuando hay espacio; portada y carta a la izquierda, cuenta y fidelidad a la derecha.
- Móvil: cinco destinos en la barra inferior; la cuenta y la tanda aparecen antes de las recomendaciones. El orden de lectura y teclado coincide con esa secuencia.
- Fotografía: activos existentes de La Bella Lupita, vinculados al plato o espacio correspondiente. No se inventaron fotografías para productos sin imagen.
- Marca: lockup original conservado, con margen propio; variante clara sobre verde. No se crearon símbolos nuevos.
- Movimiento: entrada breve y desplazamiento de 8 px; las preferencias de movimiento reducido se respetan. Sin animaciones decorativas permanentes.

## Sistema compartido

`tailwind.config.js` sigue siendo la fuente de colores, radios y tipografía. El guardián de tokens y las comprobaciones de iconos permanecen activos.

| Uso | Token / valor |
|---|---|
| Fondo | avena · #F3F4EF |
| Superficie | papel · #FDFDFB |
| Borde | filete · #DCE1D8 |
| Texto | tinta · #202D27 |
| Texto secundario | tinta-media · #5E6B62 |
| Acción y saldo | banda · #204D3B |
| Navegación | banda-honda · #163C2E |
| Superficie de beneficio | banda-velo · #E8EEE6 |
| Acento | achiote · #AF3C1C |
| Detalles sobre verde | oro-luz · #E7C37A |
| Titulares | Libre Caslon Text, 400 |
| Controles y lectura | Work Sans Variable, 400–600 |
| Radios | controles 10 px; tarjetas 18 px; paneles 24 px |
| Espaciado | interiores 20–36 px; separación de módulos 20–30 px; paso base de 4 px |

Se conserva el foco visible, los nombres accesibles de botones, el enlace de salto, el cierre de paneles con Escape y el retorno del foco. Esta revisión no es una certificación completa de accesibilidad.

## Cambios funcionales de interfaz

1. Inicio → recomendación → ficha del plato seleccionado, con su precio y categoría. La URL admite `?plato=...`.
2. Ficha → cantidad → agregar → carrito. Se conserva el cálculo y la persistencia del pedido existente.
3. Inicio → pase / instrucciones de recarga, sin cambiar los permisos de caja.
4. Reserva → zona → fecha y grupo → horario → revisión → confirmación. El servidor sigue decidiendo disponibilidad y cobro.
5. Carta, Tienda, Club, Perfil y Reserva adoptan el mismo armazón, superficies, radios, controles y escala visual.

## Verificación

- `npm run build`: guardián, iconos, TypeScript y Vite correctos.
- `npm test`: 12 grupos de regresión correctos, con cuentas, saldo, permisos, membresía, idempotencia, premios y reservas.
- Navegador: las seis pantallas cargan en escritorio sin desbordamiento horizontal. Inicio también comprobado a 320, 390, 768 y 1024 px.
- Carta, Tienda, Club, Perfil y Reserva comprobadas a 320 y 390 px, sin desbordamiento horizontal.
- Comprobados: recomendación a ficha, cantidad 2, total C$ 560 y carrito; pase con Escape y foco restaurado; reserva hasta confirmación en base local.
- Se corrigió un contraste insuficiente del estado activo de Reservar en móvil durante la inspección.
- El ajuste de viewport del navegador integrado no se aplicaba; las anchuras móviles se comprobaron con la app real dentro de marcos locales del ancho indicado, sin cambiar el código de la app para las pruebas.
- Capturas y mediciones: `diseno-club-20260913/`. La identidad y los saldos mostrados pertenecen a una base efímera de pruebas.

## Publicación en producción

Publicado con autorización del usuario el 13 de septiembre de 2026, a las 14:27 de Managua.

- URL: https://club-lupita.el-molino.workers.dev/
- Versión: `5ff9cfaa-b1a6-4c2e-8b98-e4c93b84fc5d`.
- Versión anterior para recuperación: `688d0f1c-2b72-41f7-9c69-c5a6dee4135c`.
- Las seis rutas principales devuelven HTTP 200 y el HTML compilado. JavaScript y CSS coinciden por SHA-256 con la versión aprobada.
- Salud y catálogo: HTTP 200. Cuenta sin autenticación: HTTP 401 esperado.
- Inicio y navegación a Carta comprobados en el navegador público, sin errores de consola.
- Evidencia: `diseno-club-20260913/despliegue.json` y `produccion-inicio.png` en esa carpeta.
- Se conservaron las variables existentes. No se ejecutaron migraciones ni operaciones de compra o reserva en producción.

## Revisar y recuperar

Vista local: `http://127.0.0.1:5211/` mientras el servidor de esta tarea permanezca activo.

Para volver a iniciarla: `npm run build`, seguido de `node tests/preview-diseno.mjs` desde la carpeta `club-lupita`.

Respaldo anterior a los cambios: `../respaldo-diseno-club-20260913/`. Conserva `casa/` y `tailwind.config.js`. No se ha cambiado el código del Worker, el esquema de la base de datos de producción ni los precios del catálogo.
