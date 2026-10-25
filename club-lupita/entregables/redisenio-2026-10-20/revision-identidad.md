# Revisión independiente de identidad visual

Dictamen final: **PASS** después de una segunda ronda de verificación. Fecha de revisión: 20 de octubre de 2026. El resultado se refiere a la pantalla realmente servida en `http://127.0.0.1:5188/__preview/entrar`, revisada en Microsoft Edge headless a 1440, 390 y 320 px de ancho. No se leyó CSS ni código de implementación para justificar el dictamen; se usaron capturas, navegación real y estilos calculados del DOM.

Fuentes: `design-system.md` y el manual suministrado `C:/Users/artur/Downloads/La_Bella_Lupita_Manual_de_Marca_2026.pdf`, páginas 11 y 16–20. Se inspeccionaron visualmente sus páginas renderizadas. También se revisaron las capturas `despues-escritorio.png`, `despues-movil.png` y `despues-tablet.png`.

## Hallazgos iniciales y cierre verificado

La primera ronda resultó FAIL por las observaciones siguientes. Todas se corrigieron y se volvieron a verificar en la pantalla servida. No quedan hallazgos abiertos dentro de esta revisión.

### ID-01 · P2 · Aplicación incompleta de la tipografía y el color de texto

El sistema propuesto establece Montserrat para texto, navegación y números, y cacao para el texto principal. En los tres anchos probados siguen apareciendo estos textos con `font-family: "Work Sans Variable", "Work Sans", system-ui, sans-serif`:

- «Última consulta de tu cuenta», a 12 px.
- La descripción y el precio de «Reserva de Cosecha», a 14 px.
- La fecha y el precio de «Experiencia sintética», a 14 px.

Montserrat sí está cargada y se usa en el resto de Inicio, de modo que no se trata de un fallo de descarga de la fuente. En «Mostrá tu pase», los dos párrafos explicativos usan Montserrat pero se renderizan en negro `rgb(0, 0, 0)`, mientras los demás textos del diálogo emplean cacao o su tono secundario. El negro es legible; el defecto aquí es la inconsistencia respecto a la dirección de marca acordada.

Reproducción: abrir la vista previa, inspeccionar los textos citados mediante estilos calculados; abrir «Mostrá tu pase» para comprobar los párrafos. Evidencia: `evidencia/identidad-mediciones.json`, `evidencia/identidad-1440.png`, `evidencia/identidad-390.png` y `evidencia/identidad-dialogo.png`.

Criterio de cierre: esos textos de Inicio utilizan Montserrat; los párrafos del pase utilizan cacao o un tono de texto previsto en el sistema. Confirmar el resultado renderizado, incluyendo ofertas y diálogo.

**Cerrado en segunda ronda:** todos los `p` y `small` visibles muestreados en 1440, 390 y 320 px utilizan Montserrat. Los párrafos del pase utilizan `rgb(83, 41, 30)` (cacao). Evidencia actual: `evidencia/identidad-revision2.json` y `evidencia/identidad-dialogo-r2.png`.

### ID-02 · P2 · El foco por teclado queda oculto tras la navegación móvil

A 390 × 900 px, abrir una sesión nueva en `/__preview/entrar` y pulsar Tab diez veces. El foco llega a «Ver reglas y beneficios», pero el botón y su indicador quedan totalmente cubiertos por la navegación fija inferior. El botón ocupa `y=852.08–900.08`; la navegación ocupa `y=827–900`. La consulta de `elementFromPoint` sobre el botón devuelve el enlace «Tienda» de la navegación.

El indicador de foco tiene colores de marca y resulta visible en otros controles, pero en este punto no permite reconocer la posición actual del teclado. Evidencia: `evidencia/identidad-foco-reglas.png`. El registro de los primeros catorce pasos de teclado está en `evidencia/identidad-mediciones.json`.

Criterio de cierre: al recorrer Inicio con Tab y Shift+Tab, el control activo y su indicador quedan por encima de la barra móvil, sin exigir que la persona desplace la pantalla manualmente.

**Cerrado en segunda ronda:** la misma secuencia a 390 × 900 px deja el botón en `y=354.08–402.08`, sobre la navegación que comienza en `y=827`. El anillo borgoña es visible completo. Una comprobación adicional de 40 pasos Tab a 390 y 320 px no encontró controles tapados por la barra. Evidencia actual: `evidencia/identidad-foco-reglas-r2.png` y `evidencia/identidad-revision2.json`.

### ID-03 · P3 · La reserva vertical del logo queda ligeramente por debajo de H/4

No hay colisiones visibles ni elementos que invadan lateralmente la firma. Sin embargo, la reserva vertical medida es 32 px en escritorio frente a H/4 ≈ 33.03 px, 12 px a 390 px frente a H/4 ≈ 14.01 px, y 10.25 px a 320 px frente a H/4 = 11.875 px. Es un ajuste menor de separación, independiente de la decisión de usar un logo compacto en móvil.

Evidencia: cajas medidas en `evidencia/identidad-mediciones.json`, capturas `evidencia/identidad-logo-1440.png` y `evidencia/identidad-logo-390.png` junto a las capturas de pantalla completa. Criterio de cierre: reserva vertical al menos H/4, redondeada hacia arriba, o una excepción compacta explícita y documentada.

**Cerrado en segunda ronda:** la reserva superior e inferior mide 34 px en escritorio, 15 px a 390 px y 12 px a 320 px; las tres superan H/4 del logo respectivo. Evidencia actual: `evidencia/identidad-revision2.json`.

## Comprobaciones satisfactorias

- La firma conserva el símbolo, el lettering y los colores de la referencia. No se observan filtros, deformación ni sustitución del lettering por Playfair. El ancho de escritorio es 280 px, acorde con el mínimo propuesto en la página 11.
- Playfair Display y Montserrat se cargan desde el mismo origen de la aplicación. El título principal mide 44 px en escritorio; el titular editorial, 56 px. Se distinguen título, datos de cuenta, acciones y contenido editorial. El número del saldo utiliza Montserrat Medium.
- Los colores principales medidos corresponden a cacao `#53291E`, borgoña `#B60032`, rosa `#F9AFA4` y marfil `#FBF6EE`. El coral no se usa como texto pequeño sobre un fondo claro.
- Los contrastes calculados a partir de los colores renderizados pasan 4.5:1: cacao/marfil 11.46:1; texto secundario `#76574B`/superficie `#FFFDF9` 6.39:1; texto secundario/rosa suave `#F9E7E2` 5.43:1; marfil/borgoña 6.43:1; cacao/rosa 6.86:1.
- Los controles muestreados tienen áreas de al menos 44 px de alto. El foco usa un anillo borgoña con separación marfil; el problema de ID-02 es su ocultación por otra superficie.
- El ancho de documento no excede el viewport en 320, 390 ni 1440 px. Las tarjetas y las fotografías conservan una jerarquía clara en las capturas examinadas.
- El tono utiliza voseo natural y expresiones de casa: «Mostrá», «Consultá», «Tenés», «Hacé». La revisión no identifica contradicciones de tono.

## Adaptaciones y límites de la aprobación

En móvil, la firma completa se reduce a 118 px a un viewport de 390 px y a 100 px en 320 px. Es una adaptación al encabezado compacto: queda por debajo de los 280–320 px propuestos por el manual y pierde legibilidad fina en «Bistró-Café». Debe presentarse como decisión específica de la interfaz pendiente de validación, no como cumplimiento literal del tamaño propuesto. La integridad visual de la firma permanece intacta.

Hay textos auxiliares de 12–14 px y títulos móviles menores que los rangos propuestos en la página 20. Esos rangos se presentan como orientación en el manual; el defecto no se deduce automáticamente del número. En el render normal los textos examinados son legibles y tienen contraste suficiente. La prueba final de ampliación del texto al 200 % queda a cargo de la comprobación funcional en curso.

El banner identifica expresamente «VISTA PREVIA LOCAL · Datos de prueba · Sin operaciones reales». Por eso los saldos, existencias, precios de prueba y «Experiencia sintética» no se interpretan como contenido comercial real ni como cambios autorizados en el negocio. Esta revisión no valida datos de catálogo o reglas comerciales.

Evidencia vigente: `evidencia/identidad-1440-final.png`, `evidencia/identidad-390-final.png`, `evidencia/identidad-320-final.png`, `evidencia/identidad-foco-reglas-r2.png`, `evidencia/identidad-dialogo-r2.png` y `evidencia/identidad-revision2.json`. Las capturas sin el sufijo `final` o `r2` y el archivo `identidad-mediciones.json` conservan el estado de la primera ronda como evidencia de los defectos ya corregidos. Este PASS de identidad no sustituye la validación funcional final de ampliación al 200 % que estaba en curso al cerrar el informe.
