# Diagnóstico de la vista que recibió el usuario

21 de octubre de 2026. Inspección directa del navegador integrado, pestaña existente, viewport913×884, escala1. No se modificó código ni se publicó. Se abrió Inicio en esa misma pestaña y se conservó como entrega.

## Hallazgos comprobados

1. La entrega abría `/__preview`: un selector técnico de cuentas servido como HTML sin la hoja de estilos de la aplicación. El usuario veía una lista de enlaces con estilos predeterminados y mucho espacio vacío. No era la pantalla representativa del resultado. `scripts/vista-previa-diseno.mjs` genera deliberadamente ese HTML básico; no se trata de que haya fallado una descarga de CSS del producto.
2. A913px, Carta y Perfil muestran navegación de escritorio pero su cabecera no cabe en una fila. «Reservar una mesa» baja solo a otra fila. La cabecera mide183,39px; Inicio, en el mismo panel, mide111,39px. En Perfil la primera sección de datos comienza en y407,89, aproximadamente46% de los884px disponibles. Esto se ve descompensado y resta espacio al contenido útil.
3. La causa está en la cabecera compartida de `redisenio-sistema.css`: mantiene logo144px, navegación con anchos/padding, botón de reserva, huecos24px y padding lateral32px; usa flex-wrap y cambia al tratamiento móvil solo a899px. El panel913px cae justo en la franja de escritorio que todavía no acomoda esos elementos.
4. La matriz anterior usó320/390/768/1440. No cubrió el ancho913 del panel real. La ausencia de overflow horizontal no detecta una composición que se parte en dos filas y desperdicia altura. Las revisiones funcionales y axe no equivalen a validar el acabado visual completo.

## Lo que sí carga

Se observaron Inicio, Carta y Perfil con la tipografía Montserrat Inicio, fotografías y estilos de marca. En Inicio y Carta no hubo imágenes rotas detectadas. La página no estaba en blanco ni sin servidor; la entrada equivocada y la distribución al ancho del panel explican los problemas comprobados. No se atribuyen los problemas de otras pantallas sin inspeccionarlas en este ancho.

## Prioridades para la corrección siguiente

1. Presentar la app directamente mediante `/__preview/entrar`; dejar el selector como herramienta secundaria explícita.
2. Ajustar la cabecera en anchos intermedios para que navegación y acción principal tengan una composición deliberada. Revisar al menos899/900/913/960/1024/1120, además de los tamaños anteriores, con el texto normal y ampliado.
3. Reducir la acumulación de cabecera, subtítulo y accesos en Perfil; comprobar la proporción de contenido útil visible y la densidad del resto de páginas. Conservar la dirección visual aprobada.
4. Revalidar en el panel real del usuario con capturas comparables; no cerrar la evaluación estética solamente por build, axe o ausencia de desbordamiento.

Evidencia: `perfil-panel-913.png` muestra el problema; `inicio-visible.png` acredita que se dejó abierta la aplicación real. La corrección de código queda pendiente: este turno pidió diagnóstico.
