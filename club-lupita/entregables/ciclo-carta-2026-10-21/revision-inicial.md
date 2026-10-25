# Revisión independiente inicial · Carta

21 de octubre de 2026. Árbitro separado de la implementación. Navegador Chromium mediante Chrome DevTools; contexto aislado `arbitro-carta-21`, servidor local `127.0.0.1:5261`, datos sintéticos. No se usó producción ni se enviaron operaciones externas.

## Hallazgos reproducidos

### R1 · Importante · Buscar comprime la interfaz a una columna ilegible

- **Dónde:** Carta, al escribir una consulta; reproducido a 390 × 844 y 320 × 700.
- **Cómo:** abrir `/pedir`, escribir `pizza` en Buscar en la carta. En 390 px, título, buscador, categorías y resultados quedan en una columna de 86,25 px. La lista alcanza 13.776 px de alto. La recepción se coloca en una columna implícita a la derecha, cerca del final de los resultados.
- **Impacto:** la búsqueda principal se vuelve difícil de leer y usar. Medir únicamente desbordamiento horizontal no detecta este defecto: `scrollWidth` sigue igual al viewport.
- **Causa contrastada en código:** `.carta-buscando .casa-carta-composicion` en `Carta.css` omite el área `recepcion`; el elemento mantiene `grid-area:recepcion` por `redisenio-comercio.css` y crea pistas implícitas.
- **Corrección requerida:** declarar todas las áreas presentes en el estado de búsqueda, evitar columnas implícitas, comprobar ancho útil y lectura además del overflow. Revalidar búsqueda con resultados y sin resultados en todos los tamaños.

### R2 · Importante · Cerrar una ficha recargada deja el foco fuera de pantalla

- **Dónde:** continuidad lista/detalle cuando el detalle se carga como URL directa o se recarga después de recorrer la lista.
- **Cómo:** a 320 × 700, abrir `/pedir?momento=brunch`, recorrer hasta Mollete del Huerto (scrollY 3614), abrir `/pedir?momento=brunch&plato=mollete-huerto` como navegación completa y cerrar con Escape. El foco se devuelve al input de búsqueda, pero su rectángulo queda a `top=-3267`, conservando `scrollY=3614`. También se reprodujo al ampliar texto durante la ficha.
- **Impacto:** el usuario de teclado pierde la referencia visible del foco al cerrar el detalle.
- **Causa contrastada:** el destino alternativo en `DetalleCarta` usa `focus({preventScroll:true})`; el ajuste de foco de `Pedir` solo corrige elementos por debajo de las barras, no destinos situados encima del viewport.
- **Corrección requerida:** preservar el retorno al disparador conectado cuando existe y hacer visible el destino alternativo cuando no existe. Verificar apertura normal, recarga y URL directa, conservando consulta y categoría.

## Observaciones sin defecto

- Abrir Mollete del Huerto desde su botón y cerrar sin recargar devuelve el foco al mismo producto y lo mantiene visible.
- El detalle a 320 px con texto al 200 % conserva el cierre y las acciones, sin desbordamiento horizontal en lo inspeccionado.
- El anuncio de resultados utiliza espera antes de actualizarse; el primer snapshot aún mostraba el recuento anterior, pero luego pasó correctamente a nueve. No se considera un defecto.

## Límites

El diagnóstico se concentró en navegación y búsqueda. Los cambios del constructor comenzaron a llegar mediante Vite durante la inspección; cualquier observación posterior corresponde a la revalidación y no se mezcla con esta base. No se certifican compras, pagos, todas las variantes administrativas ni dispositivos físicos. Los dos hallazgos requieren revisión posterior antes de cerrar el ciclo.
