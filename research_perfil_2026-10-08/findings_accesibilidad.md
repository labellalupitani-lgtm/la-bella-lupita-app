# Perfil: accesibilidad y robustez del frontend

Auditoría de código activo y documentación primaria, 8 de octubre de 2026 (America/Managua). Alcance: `club-lupita/src/casa/pantallas/Perfil.tsx`, `CuentaCliente.tsx`, primitivas `Hoja`, `Estados`, `Navegacion`, capa de datos y transporte. Se leyó también el armazón `App.tsx` y `EstadoDatos.tsx` para no atribuir a Perfil ausencias que resuelve el contenedor. Este investigador no modificó producto ni ejecutó suites. Se integraron los resultados de las pruebas aisladas realizadas por el agente principal, leyendo `evidencia/ui/resultados.json` y `evidencia/accesibilidad/resultados.json`.

## Dictamen

La implementación tiene una base accesible real: controles nativos, formularios etiquetados, diálogo modal nativo con nombre, Escape, cierre visible, foco de navegación, estados de error y respeto a movimiento reducido. Los riesgos principales están en la continuidad de una edición cuando se cierra/reabre el panel y en diferenciar escritura confirmada, lectura fresca y borrador actual. No hay evidencia estática suficiente para declarar un incumplimiento global de WCAG ni para certificar conformidad.

Prioridades: P1 = pérdida/sobrescritura de datos personales que merece resolver antes de ampliar funciones; P2 = robustez o barrera de uso relevante; P3 = mejora de calidad. “Confirmado estático” describe el flujo comprobado en código, no una reproducción de producción. “Condicionado” requiere que ocurra el disparador indicado. Las líneas son de la copia activa leída en esta auditoría.

## Hallazgos

### A01 — P1 reproducido: cerrar y reabrir durante guardado permite sobrescribir un cambio confirmado

- Evidencia: `CuentaCliente.tsx:12–13` cierra sin consultar el estado de la escritura y desmonta el formulario; `:19` inicializa los cuatro valores sólo al montar; `:28–32` deja continuar POST y refresco después del cierre. `Superficies.tsx:239–265,277` permite cerrar por Escape, exterior o botón. No existe estado de guardado compartido entre instancias del formulario.
- Escenario preciso: partir de alergias “A”; guardar “B” con respuesta demorada; cerrar; reabrir antes de terminar. El nuevo formulario toma “A”. El POST anterior termina y actualiza `socio` a “B”, pero el `useState` del nuevo formulario conserva “A”. Guardar desde esa instancia puede sobrescribir “B”, incluso si sólo se pretendía cambiar bebida. El guardia `vivo` evita que la instancia vieja cierre la nueva, pero no sincroniza su borrador.
- Estado: reproducido en entorno aislado por el agente principal. `evidencia/ui/resultados.json`, caso `03-guardado-y-reapertura`, registra que el segundo guardado revirtió el nombre anterior mientras guardó la bebida nueva. El caso de alergias comparte mecanismo, pero la reproducción registrada utilizó nombre. No se afirma pérdida observada en producción.
- Propuesta: trasladar la operación pendiente y la versión de datos al propietario estable del panel; conservar un borrador identificado por socio y versión. Tras una escritura, usar su respuesta canónica o una lectura forzada posterior a la mutación. Evitar montar un editor “libre” mientras persiste la operación anterior, o reconciliar de forma explícita antes de permitir guardar.
- Aceptación: cerrar/reabrir en cualquier punto de un POST demorado nunca permite reenviar silenciosamente la versión anterior; el usuario sabe si se sigue guardando, se guardó o falta confirmar. Una edición de bebida no revierte alergias ya confirmadas.

### A02 — P2 confirmado estático: guardar el perfil espera recursos ajenos y puede confirmar sobre una lectura antigua

- Evidencia: `CuentaCliente.tsx:31` espera `refrescar()`. `datos.tsx:427–429` espera conjuntamente cuenta, catálogo y cupos, con límite de petición de 20 segundos (`http.ts:3,15`). `datos.tsx:405` reutiliza una lectura pendiente de la misma sesión, aunque haya comenzado antes del POST; `:410–412` convierte fallo de lectura en estado y resuelve la promesa. `CuentaCliente.tsx:32` muestra el mensaje de guardado sin conocer el resultado de esa lectura.
- Consecuencias independientes: (a) cuenta ya actualizada pero catálogo lento mantiene bloqueado el formulario; (b) POST confirmado más fallo de `/yo` cierra el panel mostrando los datos previos; (c) una lectura anterior al POST puede ser reutilizada en vez de obtener una nueva versión. El mensaje “Tu perfil quedó guardado” puede ser verdadero respecto del POST y aun así no explicar por qué el resumen sigue viejo.
- Atenuante importante: no es un fallo silencioso completo. `App.tsx:141` monta `EstadoCuenta`; `EstadoDatos.tsx:12–15` informa que la lectura falló, conserva la fecha de última consulta y permite reintentar. En un panel abierto ese aviso queda en el fondo modal; no sustituye el estado de la operación dentro del editor.
- Verificación integrada: casos `04-guardado-refresco-fallido` y `05-guardado-espera-catalogo` reproducen (a) y (b): POST guardado en servidor con nombre antiguo en pantalla y aviso global; cuenta ya guardada/leída mientras el panel sigue esperando catálogo. La variante (c), lectura coalescida anterior al POST, permanece inferencia de código pendiente de reproducción.
- Propuesta: `refrescarCuenta` con resultado explícito y posibilidad de invalidar lecturas anteriores a la escritura; no bloquear Perfil por catálogo/cupos. Distinguir “Guardado; actualizando vista” de “Guardado, pero no pudimos actualizar el resumen”. Mantener la escritura y su confirmación independientemente de la hoja.
- Aceptación: demorar `/catalogo` y `/cupos` no demora la confirmación del perfil; un GET iniciado antes del POST nunca se considera verificación posterior; un fallo de `/yo` conserva datos utilizables, informa su antigüedad y ofrece recuperación en el contexto de la edición.

### A03 — P2 usabilidad, confirmado estático: el cierre descarta borrador sin distinguir intención ni operación pendiente

- Evidencia: `CuentaCliente.tsx:13,19` destruye y reinicializa el borrador en cada cierre; `Superficies.tsx:239–265,277` tiene tres vías de cierre sin estado `dirty`. Cuando se cierra durante guardado, `vivo.current` impide mostrar la confirmación local de esa instancia (`CuentaCliente.tsx:22–33`).
- Impacto: Escape o un toque exterior pierden cambios no enviados; si ya se enviaron, “Cerrar” tampoco significa cancelar. Es una ambigüedad de producto, no una infracción automática de WCAG por permitir Escape.
- Verificación integrada: caso `02-borrador-descartado` registra `borradorPerdido: true` y retorno al nombre original al reabrir.
- Propuesta: conservar borrador durante la sesión de edición o pedir decisión sólo cuando existan cambios no guardados. Si el guardado continúa al cerrar, indicarlo y ofrecer confirmación persistente fuera del panel. No convertir el diálogo en una trampa de teclado.
- Aceptación: abrir y cerrar sin cambios sigue siendo inmediato; con cambios se conserva el trabajo o se confirma su descarte; cerrar después de enviar no comunica cancelación y permite conocer el resultado.

### A04 — P2 condicionado: el contrato de `/yo` acepta datos que Perfil no puede representar

- Evidencia: `datos.tsx:149–154` valida `socio.creado` sólo como texto, no valida tipos de bebida/alergias/cumple ni elementos de movimientos, y no valida puntaje. En contraste, `/actividad` sí valida fecha y elementos (`:143–147`). `Perfil.tsx:65–67,225–227` formatea fechas sin verificar validez; `:177,182` entrega valores al árbol React; `CuentaCliente.tsx:19` invoca `.slice()` sobre cumpleaños. No se encontró un `ErrorBoundary` en el armazón activo.
- Disparadores: `/yo` con `socio.creado: "fecha-rota"` puede provocar RangeError; un `cumple` numérico puede romper al abrir editor; movimientos nulos o fechas inválidas pueden romper el resumen. Son respuestas que la validación actual acepta. No hay evidencia aquí de que el servidor actual las genere normalmente.
- Propuesta: validar todo dato consumido por Perfil y tolerar explícitamente nulos/ausencias permitidas; compartir reglas con actividad. Rechazar payload inválido hacia estado recuperable y conservar la última lectura válida.
- Aceptación: fixtures corruptos de cada campo se convierten en error recuperable con reintento y no pantalla vacía/excepción de render; una respuesta inválida no sustituye la última válida.

### A05 — P2 a verificar con tecnologías de asistencia: feedback de guardado y fin de carga no es consistente

- Evidencia: el guardado usa un párrafo `role="status"` que se monta ya con contenido (`CuentaCliente.tsx:11`); “Guardando…” es únicamente texto de un botón deshabilitado (`:48`) sin usar la prop `cargando` que `Boton` transforma en `aria-busy` (`Base.tsx:157`). El historial monta estado de carga y vacío (`CuentaCliente.tsx:96–97`), pero no anuncia resultado cargado/cantidad al desaparecer “Cargando actividad…”. En cambio, copiar enlace usa una región viva que ya existe y luego cambia (`Estados.tsx:308–310`).
- Estado: diferencias de implementación confirmadas; que un lector no anuncie el guardado requiere probar NVDA/Chrome y VoiceOver/Safari. No debe declararse como fallo universal observado. Los errores sí tienen `role="alert"` (`CuentaCliente.tsx:47,98`).
- Base: WCAG 4.1.3 trata mensajes de éxito, espera y error, incluyendo la información transmitida al desaparecer un estado de espera. MDN recomienda preparar una región viva antes de actualizar su contenido. [W3C: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [MDN: Live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions).
- Propuesta: región de estado estable para edición e historial, mensajes concretos al iniciar/completar/fallar, `aria-busy` en el contexto que se actualiza. Al paginar, anunciar cuántos se añadieron sin releer toda la lista ni mover el foco arbitrariamente.
- Aceptación: con lector de pantalla se oye una vez el inicio, la confirmación o fallo y el término de una carga; no se requiere recorrer toda la pantalla para descubrir el resultado; no se repiten anuncios por cada render.

### A06 — P3: identificación de errores y foco inicial pueden mejorar sin reconstruir controles nativos

- Evidencia positiva: los inputs están dentro de `label`, nombre es requerido, hay `minLength`/`maxLength`, autocompletado `name`/`bday` y `type=date` (`CuentaCliente.tsx:39–44`). `Hoja` tiene nombre con `aria-labelledby`, `showModal()`, botón de cierre y Escape (`Superficies.tsx:219–242,277–283`).
- Oportunidad: todo error de servidor va a un mensaje general, sin asociación específica al campo ni foco a él (`CuentaCliente.tsx:33,47`). El foco inicial cae por orden nativo en “Cerrar panel”, el primer control (`Superficies.tsx:277`), no en el nombre/título. Esto no demuestra incumplimiento: W3C permite errores generales descriptivos y validación nativa, y la posición inicial de foco depende del contenido.
- Verificación integrada: caso `06-error-servidor` muestra correctamente “El cumpleaños debe ser una fecha válida que no esté en el futuro” para fecha futura; el date carece de `max`, `aria-invalid` y `aria-describedby`. Es una oportunidad de prevención y asociación, no ausencia total de identificación textual del error.
- Propuesta: si el backend identifica campo inválido, asociar mensaje e indicador `aria-invalid`; explicar límites relevantes. Elegir deliberadamente el foco inicial del editor (título o nombre) y del historial (título), manteniendo retorno al disparador. No enfocar el elemento `dialog` con `tabindex` ni añadir roles redundantes innecesarios.
- Aceptación: error de nombre/cumple identifica el campo y cómo corregirlo; Tab/Shift+Tab permanecen dentro del modal; Escape lo cierra de acuerdo con política de borrador; al cerrar vuelve al botón que lo abrió. [W3C: Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [WAI: Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [MDN: dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

### A07 — P3 confirmado estático: resumen e historial no usan la misma zona horaria

- Evidencia: `Perfil.tsx:225–227` formatea movimiento con zona horaria del dispositivo; `CuentaCliente.tsx:92` fija `America/Managua`. El mes de “en la casa desde” también utiliza zona del dispositivo (`Perfil.tsx:65–67`). Cumpleaños sí se fija en UTC para respetar fecha civil (`:31`).
- Impacto condicionado: un cliente viajando puede ver un movimiento fechado en un día distinto en el resumen y su historial completo, especialmente cerca de medianoche. No se afirma discrepancia para el dispositivo actual en Managua.
- Verificación integrada: caso `10-fechas-dos-zonas`, zona `Europe/Madrid`, reproduce resumen “9 oct” frente a detalle “8 oct 2026, 8:00 p. m.” para el mismo movimiento sintético.
- Propuesta y aceptación: fijar una política explícita de fecha comercial/fecha local y reutilizar formateador. El mismo movimiento mantiene fecha coherente al abrir el historial y en pruebas de distintas zonas horarias; cumpleaños nunca cambia de día.

### A08 — P2 reproducido: un nombre admitido de 80 caracteres rompe el reflujo móvil

- Evidencia de prueba: caso `07-nombre-largo` de `evidencia/ui/resultados.json` mide ancho de documento de **2632 px** en viewport de **320 px**. `audit-ui.mjs:85` utiliza 80 letras “M” continuas, dentro del límite de nombre de `CuentaCliente.tsx:37,43`. El mismo archivo muestra cero violaciones Axe, demostrando que esta barrera no quedó detectada por su conjunto de reglas.
- Código relevante: `Perfil.tsx:93–100` usa identidad con `items-start` y un contenedor de texto sin `min-width:0`/máximo de ancho; `casa.css:135–136` estiliza la identidad; el `overflow-wrap:break-word` general de `base.css:57` no garantiza por sí solo que el contenedor se encoja. La medición confirma el defecto; el elemento exacto que domina `scrollWidth` debe inspeccionarse al corregir.
- Impacto: desplazamiento horizontal masivo y lectura dificultosa con datos válidos. No es una tabla/mapa que necesite dos dimensiones. WCAG 1.4.10 requiere reflujo del contenido ordinario a 320 CSS px sin exigir ambas direcciones. [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Propuesta: limitar explícitamente el ancho de contenedores de datos personales y permitir ruptura de cadenas largas, también en nombre de navegación y detalles `Fila`; mantener nombre completo accesible, sin ocultar desbordamiento como arreglo cosmético.
- Aceptación: nombres de 2–80 caracteres, con y sin espacios, más campos opcionales al máximo, mantienen `scrollWidth <= innerWidth + 1` a 320/390 CSS px y durante zoom; toda información permanece legible. Repetir sólo los casos pertinentes tras corregir.

## Hallazgos que NO deben presentarse como defectos sin más evidencia

- **No faltan trampa modal ni Escape.** Son aportados por `dialog.showModal()`; el manejador de cancelación los conduce al estado React. APG pide foco dentro, retorno y cierre accesible; el patrón actual está bien encaminado. Debe verificarse en navegador, no reemplazarse por un `div`.
- **No falta soporte de movimiento reducido.** `base.css:228–236,292–294` reduce animaciones y elimina transformaciones de botones; `casa.css:365–367` desactiva movimiento de hoja y botones; `Estados.tsx:315` limita animación de toast con `motion-safe`.
- **No faltan etiquetas ni autocompletado.** Están presentes. No tener `aria-invalid` para todos los errores no equivale, por sí solo, a incumplir 3.3.1.
- **No falta todo feedback cuando `/yo` falla.** `EstadoCuenta` está montado por el armazón, muestra alerta y fecha, y tiene reintento.
- **No afirmar contraste por comentarios históricos.** Los comentarios hablan de una banda verde que ya no coincide con los tokens V3. En `tailwind.config.js:12–40`, papel/avena son ambos `#FBF6EE`, banda/tinta `#53291E`.
- **Borde de input por verificar en CSS computado:** `CuentaCliente.tsx:41` tiene `border-filete` (1,62:1 contra papel), pero `base.css:47–51` aplica `contorno` con un selector de mayor especificidad (3,88:1 contra papel). No se puede dictaminar incumplimiento con sólo ver la clase. W3C exige 3:1 cuando ese borde es necesario para identificar el campo, no para toda línea decorativa. [W3C: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
- **Los filtros de actividad sí exponen selección.** Grupo con nombre y `aria-pressed` (`CuentaCliente.tsx:86–87`); no deben forzarse a patrón de tabs por su apariencia.

## Contraste calculado desde tokens actuales

Cálculo matemático sRGB, no muestreo visual ni certificación del CSS final. Fondo `#FBF6EE`.

| Token | Hex | Relación contra papel |
|---|---|---:|
| tinta/banda | #53291E | 11,46:1 |
| tinta-media | #76574B | 6,03:1 |
| achiote | #942F32 | 7,20:1 |
| foco | #B60032 | 6,43:1 |
| contorno | #957569 | 3,88:1 |
| filete | #D7C1A5 | 1,62:1 |

Texto principal y secundario tienen margen adecuado sobre papel por token; filete decorativo no implica fallo, pero no debe ser el único indicador indispensable de un input. Foco global está definido en `base.css:78–80`; confirmar visibilidad y no obstrucción en recorrido real.

## Matriz precisa para verificación integrada

1. Datos sintéticos completos/nulos: Perfil, editor, historial, sin consola ni contenido ilegible. Nombre 80, bebida 120 y alergias 240 caracteres; incluir una cadena larga sin espacios. `Fila` imprime detalles en spans sin `break-words` (`Superficies.tsx:172–174`), por lo que el desbordamiento es una hipótesis concreta, no un hecho medido.
2. Anchos 320, 390 y 1280 CSS px; zoom 200 % y equivalente a 400 %; editor con teclado virtual y landscape: scroll del modal, guardar/cerrar alcanzables, ninguna barra fija tapa foco.
3. Teclado: entrar a Perfil, salto a contenido, abrir editor, Tab/Shift+Tab, Escape, retorno, repetir con historial y reintentos. El armazón sí enfoca `#contenido` tras ruta (`App.tsx:60–66`) y tiene enlace de salto (`:136`).
4. Guardar normal y demorado; doble clic/Enter repetido; cerrar/reabrir antes de resolver; cambio de sesión durante POST y lectura. El transporte ya compara sesión antes/después de leer respuesta (`http.ts:23–27`); se debe conservar esa protección.
5. POST correcto + `/yo` 500; POST correcto + catálogo/cupos lento; GET iniciado antes del POST que devuelve instantánea anterior después; verificar mensajes y versión de cada campo.
6. 422 con error de campo, 500 de POST, JSON inválido y timeout: preservar borrador, resultado incierto bien explicado, opción de consultar estado. El transporte ya distingue escritura de lectura y comunica incertidumbre (`http.ts:29–45`); el editor sólo usa el texto, sin acción específica de reconciliación.
7. Actividad: filtros rápidos con respuestas invertidas (ya hay protección de generación `CuentaCliente.tsx:70–81`), primera carga fallida, página siguiente fallida, reintento repetido. La deduplicación por id está implementada (`:76`); revisar que el anuncio al finalizar sea útil.
8. NVDA/Chrome y VoiceOver/Safari reales: confirmación de guardado, error, carga completada, filtros, nombre del diálogo. Axe o DOM no sustituyen la prueba de anuncios.
9. Movimiento reducido y foco en cada estado; medir borde de input computado, contraste y límites táctiles. Inputs mínimo 48 px, botón cerrar mínimo 44 px, botones `.casa-boton` mínimo 48 px (`base.css:47–49`, `Superficies.tsx:277`, `casa.css:42`).
10. Cambiar zona horaria para un movimiento próximo a medianoche de Managua; confirmar coherencia resumen/historial/cumpleaños.

## Fuentes y límites

Se realizaron cuatro consultas de búsqueda y lectura directa de W3C/WAI/MDN; no se utilizaron blogs ni resultados de foros para conclusiones. Fuentes consultadas: patrón modal, WCAG 4.1.3, WCAG 3.3.1, WCAG 1.4.11, WCAG 1.4.10, documentación de `dialog` y regiones vivas (enlaces junto a sus afirmaciones). La investigación normativa es guía para diagnosticar, no certificación de conformidad. Los cuatro checks de accesibilidad integrados pasan y las once capturas UI tienen cero violaciones Axe; esto no elimina A08 ni sustituye pruebas humanas. No hubo prueba con lector real, ni observación de usuarios, ni evidencia de corrupción real en producción en esta línea de trabajo. No se confundieron respaldos ni el antiguo `src/pantallas/Perfil.tsx` con la implementación cliente activa.
