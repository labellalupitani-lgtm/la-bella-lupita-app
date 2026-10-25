# La Bella Lupita — revisión visual 03

29 de septiembre de 2026. Propuesta independiente; no incorporada a la aplicación.

## Diagnóstico y cambios

La versión 2 confundía orden con dirección visual: cabeceras grandes repetidas, superficies semejantes, encuadres subordinados al contenedor y ondas genéricas. La v3 introduce tres composiciones: inicio con fotografía a sangre y rosa, carta compacta y Club café con tarjeta rosa. El retrato procede del archivo Illustrator original; no se ha redibujado. Su uso aislado y sobre rosa es una aplicación propuesta, pendiente de aprobación de marca.

La segunda revisión detectó cuerpo demasiado pequeño, redundancia entre titulares y acciones de inicio y un primer producto demasiado abajo. Se aumentó cuerpo a 14 px, navegación a 11 px y botones a 14 px, se eliminó la flecha duplicada, se puso el nombre del desayuno y se compactó el título de la carta. Metadatos secundarios conservan 9–11 px; si se prioriza lectura de estos datos, será necesario ampliarlos y aceptar una tarjeta más alta. Es una limitación explícita, no una certificación de accesibilidad universal.

El área central desplaza independientemente de la cabecera y navegación. Así la barra inferior no tapa las acciones. La app debe probarse con personas antes de considerar cerrados composición, tamaño de lectura y navegación.

## Investigación

- Marchesi 1824: catálogo oficial observado visualmente, alternancia fotografía contextual / catálogo limpio. https://www.marchesi1824.com/content/dam/marchesi/docs/catalogues/pastry-catalogue-eng-20250604.pdf
- Pentagram / Parla: lenguaje expresivo derivado de elementos de la propia marca. https://www.pentagram.com/work/parla
- Mucho / Amatrice: sistema tipográfico y material coherente. https://wearemucho.com/work/amatrice
- Pentagram / Bottega: continuidad entre identidad y espacio. https://www.pentagram.com/work/bottega
- Nielsen Norman Group: jerarquía, retícula, paleta e imagen con intención. https://www.nngroup.com/articles/good-visual-design/

Las investigaciones completas, con límites de observación, se encuentran en `research_identidad_v3` en la raíz del proyecto. No se atribuyen resultados comerciales a estas referencias ni se copian sus activos.

## Herramientas y proceso

Investigación distribuida en tres frentes mediante la habilidad web-research; lectura de habilidades de dirección visual. Exploración de una composición con Stitch, proyecto privado 2310582604662202632. Su fotografía generada y su sustituto tipográfico de logo no se incorporaron al resultado. La propuesta local usa el logo del proyecto y sus imágenes de menú. Se emplearon HTML/CSS, render de vectores originales con PyMuPDF y Playwright para revisión visual y funcional. No se afirma que cada píxel haya sido auditado de forma exhaustiva.

## Verificación reproducible

`node entregables/identidad-marca-v3-2026-09-29/revisar.cjs`, con el servidor local en 8770.

- Tres pantallas, anchos 320/360/390/430 px: sin desbordamiento horizontal.
- Presentación en 320/390/948/1440 px: sin desbordamiento horizontal.
- Axe WCAG A/AA, 2.1 y 2.2: sin infracciones automáticas detectadas en pantallas a 390 px y presentación evaluada. Esto no equivale a una auditoría integral WCAG.
- Búsqueda, categorías, estado vacío y selección de demostración comprobados.
- Capturas revisadas a tamaño real y conjunto comparativo. Corregidos retrato blanqueado accidentalmente, salto de título y acción parcialmente cubierta.
- Comprobación SHA-256 contra 205 archivos originales de app/recursos/logo: ningún cambio.

## Límites y siguiente decisión

Esta propuesta presenta una dirección revisada, no una identidad perfecta ni validada por clientes. No hay pedidos, cobros ni datos personales. Las fotografías provienen del proyecto; su autoría y derechos no se han auditado aquí. Los precios son datos del catálogo local, no verificación comercial actual. La tarjeta muestra cinco de nueve sellos ilustrativos y respeta el décimo café de cortesía. La prueba con texto ampliado y tecnologías de asistencia queda pendiente antes de incorporar a producción.

La decisión solicitada al usuario es estética: si esta dirección expresa mejor la marca. No se ha modificado, desplegado ni integrado la aplicación.


## Ajuste cromático solicitado

Aplicado tras la auditoría de la captura del usuario: panel Inicio #F7E6E0, tarjeta Club #FBF6EE con acento #F9AFA4 sobre fondo #53291E, presentación neutra #E7E6E3. Café sobre rosa suave: 10,18:1; café sobre crema: 11,46:1. Etiquetas relevantes de membresía y navegación ampliadas a 12 px. Retirado el marco interior ornamental; separadores suaves conservados para agrupación. El rosa original se mantiene en selección y borde superior de tarjeta. Copia completa anterior en antes-ajuste-color. Aplicación sin modificar.
