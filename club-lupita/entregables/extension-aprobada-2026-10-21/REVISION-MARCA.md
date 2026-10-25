# Revisión independiente de marca y coherencia visual

21 de octubre de 2026. Revisión del preview local `http://127.0.0.1:5198`, compilación indicada para el ciclo `principal-4KPpZegJ.js`. Referencia aprobada consultada en `http://127.0.0.1:5197`. No se publicó, no se modificaron fuentes de aplicación y no se ejecutaron operaciones comerciales.

## Dictamen

**PASS en los cuatro conjuntos para la revisión de marca. No hay hallazgos materiales abiertos de esta disciplina en las superficies examinadas.** Este dictamen no sustituye al crítico funcional ni a la aceptación de los estados que no estuvieron representados en el fixture.

| Conjunto | Veredicto | Evidencia observable |
|---|---|---|
| 1. Sistema compartido, accesos y Kit | **PASS** | Firma íntegra y proporcional; reserva observable; Playfair/Montserrat cargadas; coherencia de campos, botones, estados, vacíos y superficies. El acceso de cliente y el de equipo tienen prioridades distintas sin romper la identidad. |
| 2. Comercio y reservas | **PASS** | Carta conserva proximidad de producto, nombre, descripción y precio; el detalle reconoce la misma foto. Tienda ordena importe, condiciones y comprobante. Reservar prioriza selección y formulario, con foto subordinada en móvil. |
| 3. Cuenta y Club | **PASS** | Club, Perfil, compras y reservas usan los mismos titulares, controles, separadores y fondos. Saldo, condiciones y referencias se leen como datos; el pase mantiene identificación y código separados. |
| 4. Equipo, doce módulos y cuatro roles | **PASS** | Resumen, Pedidos, Caja, Mi Club, Tienda, Entregas, Agenda, Atención, Informes, Clientes, Equipo y permisos, y Cuenta y seguridad comparten tipografía y shell. La densidad responde a la tarea y las selecciones tienen forma/flecha además del color. Los menús de los cuatro roles mantienen esa identidad. |

## Referencia efectivamente revisada

- [Criterios de la extensión](bar.md).
- [Investigación del manual](../investigacion-diseno-2026-10-21/MARCA.md) y [dirección completa](../investigacion-diseno-2026-10-21/LEEME.md).
- Panel de referencias abierto en Chromium local y capturado; renders individuales del manual p.12 —firma y reserva—, p.18 —Playfair—, p.28 —fotografía— y p.55 —nombre, descripción y precio— examinados visualmente.
- [Inventario](../redisenio-2026-10-21/INVENTARIO.md) y convenciones de la [matriz de cobertura](../redisenio-2026-10-21/COBERTURA.json).

Se aplicó la regla de design-loop de juzgar el resultado renderizado. No se leyeron TSX ni CSS de implementación. Los estilos computados citados abajo proceden del DOM presentado por el navegador.

## Comprobaciones de identidad

**Firma y reserva.** En la cabecera cliente de 390 px, la imagen ocupa 120 × 57 px: razón 2,105 y reserva exigida H/4 = 14,25 px. Se observan 20 px al borde izquierdo y unos 20 px a los límites superior/inferior del campo claro; el control contiguo está separado. En escritorio ocupa 144 × 68,39 px: razón 2,106 y reserva de 17,10 px, con aproximadamente 20,5 px de separación vertical. El shell del equipo muestra 148 × 69,98 px en escritorio y 120 × 56,75 px en móvil; se mantienen el retrato, lettering y descriptor, sin filtros. Las capturas de acceso muestran espacio suficiente entre firma y texto/foto. Los tamaños digitales de 280/320 px se tratan como parámetros propuestos del manual, no como una prohibición de la adaptación compacta aprobada.

**Tipografía.** En la carta, el titular computa `Playfair Display Inicio` a 40 px en móvil y 56 px en escritorio; controles y navegación computan `Montserrat Inicio`. En equipo, Resumen computa Playfair a 32 px móvil/43,2 px escritorio y el importe C$ 135 usa Montserrat. Las dos familias están cargadas en el navegador. La revisión visual de los doce módulos no muestra cambios de fuente en formularios o datos. El nombre interno «Inicio» de la fuente no implica que sólo se aplique allí.

**Color y jerarquía.** Superficies claras, tinta cacao, apoyos rosa y acento borgoña mantienen continuidad. No aparece una paleta distinta por módulo. Los estados operativos combinan etiqueta y forma; los importes de cuenta, tienda y equipo conservan tratamiento de dato. Las pantallas administrativas no reciben una portada fotográfica que desplace filtros o acciones.

**Fotografía.** Café, Nica Toast, bagel y platos de Inicio conservan color natural y relación reconocible con su vajilla. En Carta, el destacado y el detalle de Latte usan la misma imagen; el detalle ofrece un encuadre más amplio y mantiene nombre y precio junto al contenido. Los casos sin fotografía y con fotografía rota del Kit se revisaron después de desplazar el navegador hasta ellos: no se confunde la carga diferida de una captura larga con una imagen rota real. El bagel carga al entrar en su zona visible.

**Procedencia.** Las imágenes se describen como activos del proyecto conservados, no como fotografías cuya autoría se haya certificado en este examen. Para la terraza se leyó el [informe previo de reservas](../reservas-2026-10-12/INFORME.md) y su [registro de imágenes](../reservas-2026-10-12/imagenes.json): documentan WebP → AVIF sin cambiar encuadre o contenido. Esa trazabilidad no prueba por sí sola autoría original. No se detectó incorporación de un mockup del manual como foto de la operación.

## Recorridos y evidencia

El registro principal contiene **78 capturas/observaciones de navegador**: once destinos de cliente en 320/390/1440; acceso cliente en los tres anchos; los doce módulos de propietario en los tres anchos; entrada de encargado, caja y cocina; dos vistas de la base aprobada y el panel de referencias. Todas esas observaciones registraron `scrollWidth <= innerWidth`.

Además se abrieron el detalle de Latte, el pase, los menús de los cuatro roles y el acceso de equipo sin sesión. Se inspeccionó texto al 200 % en Carta, Club, Perfil, Kit y Pedidos de cocina. La ampliación fue una simulación explícita: se duplicaron los tamaños computados de texto e interlínea en el DOM, sin editar los archivos; no constituye una certificación de zoom nativo ni de un teléfono físico. Los títulos, párrafos y navegación se redistribuyen y no generan overflow horizontal en esos estados.

Evidencia propia en [evidencia/critico-marca](evidencia/critico-marca/):

- [Observaciones DOM, medidas y fuentes](evidencia/critico-marca/observaciones-dom.json), [interacciones](evidencia/critico-marca/interacciones.json).
- [Carta móvil](evidencia/critico-marca/cliente-pedir-390.png), [carta escritorio](evidencia/critico-marca/cliente-pedir-1440.png), [detalle estable](evidencia/critico-marca/detalle-latte-390.png).
- [Club escritorio](evidencia/critico-marca/cliente-club-1440.png), [pase](evidencia/critico-marca/pase-390.png), [reservar móvil](evidencia/critico-marca/cliente-reservar-390.png).
- [Acceso cliente](evidencia/critico-marca/acceso-cliente-390.png), [acceso equipo 320](evidencia/critico-marca/acceso-equipo-320.png), [acceso equipo escritorio](evidencia/critico-marca/acceso-equipo-1440.png), [productos del Kit después de desplazamiento](evidencia/critico-marca/kit-productos-390.png).
- [Equipo 320](evidencia/critico-marca/equipo-equipo-320-top.png), [Clientes 320](evidencia/critico-marca/equipo-clientes-320-top.png), [Caja móvil](evidencia/critico-marca/equipo-caja-390-top.png), [Seguridad móvil](evidencia/critico-marca/equipo-seguridad-390-top.png). Las doce secciones tienen capturas completas con nombres `equipo-{seccion}-{ancho}.png`.
- Menús: [propietario](evidencia/critico-marca/menu-rol-propietario.png), [encargado](evidencia/critico-marca/menu-rol-encargado.png), [caja](evidencia/critico-marca/menu-rol-caja.png), [cocina](evidencia/critico-marca/menu-rol-cocina.png).
- [Carta 200 %](evidencia/critico-marca/texto200-pedir-top.png), [Club 200 %](evidencia/critico-marca/texto200-club-top.png), [Kit 200 %](evidencia/critico-marca/texto200-kit-top.png). Los recortes `-top` son auxiliares de inspección y no sustituyen los archivos completos.

Scripts de reproducción sólo para la auditoría: [capturas y medidas](evidencia/revision-marca.mjs) e [interacciones y texto ampliado](evidencia/marca-interacciones.mjs).

## Límites y comparación con Inicio aprobado

Se contrastó visualmente Inicio contra la sexta composición. Su firma, tratamiento tipográfico, fotografía, titular y carta conservan el lenguaje aprobado. Los fixtures de 5197 y 5198 no tienen el mismo estado: 5198 mostraba una reserva activa, mientras 5197 mostraba un aviso. Esa diferencia mueve el bloque contextual; estas capturas no permiten afirmar identidad de píxeles ni atribuir ese desplazamiento a una regresión de diseño. La conservación exacta de fuentes/compilación corresponde a la evidencia técnica del ciclo.

No se probaron exhaustivamente todas las variantes de error, MFA, activación, recuperación y transacción descritas en la matriz. Tampoco se certifican datos comerciales, permisos de servidor, envío de correo, disponibilidad real ni autoría fotográfica. El pase y el detalle se abrieron; no se confirmó ninguna compra ni reserva en esta revisión. Las capturas de diálogos se repitieron con movimiento reducido y después de estabilizarse para no tratar un fotograma de transición como defecto.

No hay una corrección de marca solicitada por este crítico. Cualquier hallazgo funcional o de composición de los otros críticos debe resolverse por su propio mérito y volver a renderizarse si altera estas superficies.

## Adenda: revalidación focal del Kit, compilación final

21 de octubre de 2026. **PASS de marca mantenido para los cuatro conjuntos**, con revalidación focal del conjunto 1 sobre `principal-Ctm5IHgB.js` (228.517 bytes), SHA-256 `5ccd0230fe9cdd88e0dcaadf682fc88859c23e131f642c0d7d9691576d48040e`.

Se examinaron únicamente renders finales; no se abrió el navegador ni se leyeron fuentes de implementación en esta revalidación. El alcance comunicado del cambio es el reflujo de «Lo de siempre» y el aviso del Kit, incluido su control Cerrar en fila propia. El resto conserva el dictamen anterior bajo la condición comunicada de que no hubo cambios adicionales de fuentes.

- [Kit 320, texto normal](evidencia/sistema/kit-aviso-320-100.png), [Kit 320, texto 200 %](evidencia/sistema/kit-aviso-320-200.png) y [Kit 390, texto 200 %](evidencia/sistema/kit-aviso-390-200.png): nombre gastronómico en Playfair, información y acción en Montserrat, acción borgoña, aviso cacao y texto claro coherentes con el sistema. El nombre y el importe refluyen dentro de la ficha; el mensaje del aviso se lee completo y Cerrar queda separado, sin recortes visibles.
- Se inspeccionaron los ocho renders `r4-toast-*.png` de `evidencia/critico-acabado/`, a 320 × 568 y 320 × 700, con texto normal y ampliado. En las capturas con foco de texto ampliado, el contorno de Cerrar se distingue y permanece íntegro dentro del aviso: [320 × 568](evidencia/critico-acabado/r4-toast-cierre-320x568-200.png) y [320 × 700](evidencia/critico-acabado/r4-toast-cierre-320x700-200.png). No se observa una nueva desviación de marca.

Límite: estas imágenes acreditan el aspecto de los estados capturados, no reproducen por sí mismas el cierre, la transferencia de foco ni la medida del objetivo táctil de 44 px, que corresponden a la revisión funcional comunicada. Esta corrección focal no contiene fotografía; sigue vigente el límite anterior sobre procedencia de los activos fotográficos observados. No hay hallazgos nuevos de marca ni correcciones solicitadas por esta adenda.
