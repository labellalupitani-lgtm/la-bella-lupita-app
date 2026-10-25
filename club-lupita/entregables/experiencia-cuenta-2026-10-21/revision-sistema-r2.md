# Revisión independiente de sistema — ronda 2, cierre

**Veredicto final: Tienda PASS · Mi Club PASS · Perfil PASS.**

Fecha: 21 de octubre de 2026 (Managua). Criterio único: `design-system.md`. Se conserva `revision-sistema-r1.md` como historial. No se leyó implementación ni informes de deconstrucción; la decisión resulta del render observado, sus medidas y las capturas.

## Versión final y entorno

Compilación final comprobada desde cargas nuevas en las tres rutas: **`principal-B6EbsuoF.js` (R4)**. [Registro de verificación final](evidencia-sistema/r4/verificacion-final.json).

La preview `http://127.0.0.1:5296` informa PGlite en memoria, salida externa bloqueada, frontend compilado y credenciales sintéticas. Edge headless aislado bloqueó toda ruta ajena a ese origen. No se hicieron compras, canjes, renovaciones, envíos ni guardados de perfil. Se probaron cambios locales de borrador sin persistirlos.

La matriz completa de R3 (`principal-DTOZgFsC.js`) cubrió 32 estados: Tienda y retiro; Mi Club, pase y detalles; los tres paneles de Perfil; en 390, 913 con `scrollbar-gutter: stable`, 1440 y 320 con texto 200 % y movimiento reducido. R4 corrigió únicamente la composición CSS de las tarjetas de Mi Club. Se repitieron sus tres estados a 390, 913 con gutter, 1440, 320/200 % y 390/200 %: **15 estados finales**, además de nuevas cargas de Tienda y Perfil con el hash final. [Matriz R3](evidencia-sistema/r3/mediciones-r1.json), [matriz final R4](evidencia-sistema/r4/mediciones-r1.json).

Texto 200 % significa duplicar una sola vez el tamaño computado de todos los elementos visibles y ocultos tras abrir cada estado, manteniendo el ancho del viewport. Se recargó entre estados para evitar acumulación.

## Resultado por pieza

| Pieza | Resultado | Evidencia principal |
| --- | --- | --- |
| Tienda | **PASS** | [Render final 390](evidencia-sistema/r4/tienda-final-390.png), [1440](evidencia-sistema/r3/tienda-1440-top.png), [913 con gutter](evidencia-sistema/r3/tienda-913-gutter-top.png), [ficha a 320/200 %](evidencia-sistema/r3/cierre-s1-tienda-320-text200.png) |
| Mi Club | **PASS** | [Tarjetas finales 390](evidencia-sistema/r4/cierre-s5-club-tarjeta-390.png), [913 con gutter](evidencia-sistema/r4/cierre-s5-club-tarjeta-913-gutter.png), [1440](evidencia-sistema/r4/club-1440-top.png), [320/200 %](evidencia-sistema/r4/cierre-club-tarjeta-320-text200.png), [390/200 %](evidencia-sistema/r4/cierre-club-tarjeta-390-text200.png) |
| Perfil | **PASS** | [Render final 390](evidencia-sistema/r4/perfil-final-390.png), [filas corregidas a 320/200 %](evidencia-sistema/r3/perfil-320-text200-reduced-middle.png), [Tu cuenta](evidencia-sistema/r3/perfil-cuenta-390-full.png), [Datos y ayuda](evidencia-sistema/r3/perfil-datos-390-full.png) |
| Pase y detalles | **PASS** | [Pase final 320/200 %](evidencia-sistema/r4/club-pase-320-text200-reduced-top.png), [detalles finales 390/200 %](evidencia-sistema/r4/club-detalles-390-text200-reduced-full.png) |

No quedan defectos de sistema abiertos en el alcance probado. Esto aprueba el cumplimiento del sistema; no implica una valoración de premios ni perfección absoluta.

## Cierre de hallazgos

| ID | Defecto anterior | Resultado y prueba de cierre |
| --- | --- | --- |
| S1 | Distintivo de Tienda recortado y superpuesto a la leyenda contextual a 320/200 %. | **CERRADO.** La ficha editorial refluye, mantiene peso y formato legibles y declara fotografía pendiente. El distintivo ya no invade otra leyenda. [Captura](evidencia-sistema/r3/cierre-s1-tienda-320-text200.png). |
| S2 | Ordinal 01 de Mi Club llegaba a x321,2969 en viewport de 320 px. | **CERRADO.** Cabecera y ordinal reﬂuyen. En R3 el ordinal quedó dentro de x16–109,125; en todos los estados finales R4 el documento conserva el ancho del viewport, sin elementos excedidos. [Captura de cierre](evidencia-sistema/r3/cierre-s2-club-ordinal-320-text200.png), [medidas finales](evidencia-sistema/r4/mediciones-r1.json). |
| S3 | Texto 250 g recortado dentro de una franja de 84 px con texto al 200 %. | **CERRADO.** A 320/200 % ocupa 131,09 px dentro de un arte de 288 px; a 390/200 % ocupa 151,63 px dentro de 350 px. Ambas composiciones verticales conservan cifra, descripción y acciones completas. [320](evidencia-sistema/r4/cierre-club-tarjeta-320-text200.png), [390](evidencia-sistema/r4/cierre-club-tarjeta-390-text200.png), [mediciones](evidencia-sistema/r4/tarjeta-text200.json). |
| S4 | Cumpleaños y alergias se partían en columnas estrechas, dejando letras aisladas. | **CERRADO.** En320/200 % iconos/acciones liberan el ancho principal; «14 de septiembre» y «No indicaste alergias» vuelven a leerse de forma natural. [Captura](evidencia-sistema/r3/perfil-320-text200-reduced-middle.png). |
| S5 | Regresión de R3: cuerpo de tarjeta debajo del arte, pero arte limitado a una esquina y media cabecera vacía en 390 y 913. | **CERRADO en R4.** Las tarjetas normales vuelven a disposición lateral con arte y cuerpo de la misma altura; el formato ampliado ocupa filas completas. [Antes](evidencia-sistema/r3/regresion-tarjeta-390.png), [después 390](evidencia-sistema/r4/cierre-s5-club-tarjeta-390.png), [después 913](evidencia-sistema/r4/cierre-s5-club-tarjeta-913-gutter.png). |

S5 se reprodujo abriendo `/club` a 390 o 913 con texto normal después de corregir S3. En 390 el bloque de arte ocupaba 186,14 px de una tarjeta de 350 px, mientras el cuerpo empezaba debajo: quedaban 163,86 px vacíos a su derecha. El impacto era una ruptura del ritmo de tarjeta entre anchos, sin pérdida de información. La corrección pedida fue conservar un formato lateral completo o hacer que ambas partes ocupen filas completas al envolver. Esa es la composición verificada en R4.

## Evidencia de sistema y accesibilidad visual

- **Tipografías e identidad:** Playfair Display y Montserrat cargadas desde archivos locales. Cacao, papel, crema, rosa, borgoña, radios y bordes selectivos se conservan. La nueva ficha de Tienda mantiene esta identidad y no presenta una fotografía contextual como imagen del lote.
- **Jerarquía y ritmo:** títulos editoriales, separadores, controles y paneles mantienen un lenguaje común en los anchos probados. La regresión de tarjetas S5 se revisó visualmente; no se aceptó solo por no producir overflow.
- **Contraste:** pares medidos del render: cacao/papel 11,46:1; texto secundario #76574B/papel 6,03:1; crema/borgoña 6,81:1; crema/cacao 12,13:1. El ordinal grande alcanza 3,88:1. No se detectó fallo en estos pares.
- **Números:** saldo y movimientos inspeccionados usan `font-variant-numeric: tabular-nums`. [Registro de fuentes e importes](evidencia-sistema/r3/adicionales-r2.json).
- **Foco visible:** [Tienda](evidencia-sistema/r3/tienda-foco-390.png), [Mi Club](evidencia-sistema/r3/club-foco-390.png), [tab de Perfil](evidencia-sistema/r3/perfil-foco-390.png). Escape cierra el pase y devuelve foco a «Mostrar mi pase».
- **Nombres largos:** nombre sintético largo completo en Perfil, tarjeta y pase a 390, 913 y 1440. [Perfil 390](evidencia-sistema/r3/perfil-nombre-largo-390.png), [Club 390](evidencia-sistema/r3/club-nombre-largo-390.png), [pase 390](evidencia-sistema/r3/pase-nombre-largo-390.png). La sustitución solo afectó respuestas del navegador; no se guardó en PGlite.
- **Consentimientos y borradores:** permanecen la advertencia de alergias, opcionalidad, permiso de promociones y comunicaciones necesarias. Se comprobó la conservación local al cerrar/reabrir el editor sin guardar; el alcance del borrador está explicado. [Aviso](evidencia-sistema/r2/perfil-aviso-borrador-390.png), [editor y consentimiento ampliados](evidencia-sistema/r2/perfil-editor-320-text200-bottom.png).
- **Movimiento reducido:** cero duraciones activas de animación/transición en los ocho estados reducidos R3 y los seis estados reducidos R4.
- **Geometría:** los 32 estados de R3 y los 15 de R4 quedaron sin elementos fuera del ancho. En 913 el gutter reservado deja 898 px de contenido, con navegación y componentes completos.

Las capturas full-page pueden mostrar la navegación fija a la altura del viewport inicial; por eso los cierres S1–S5 se acompañan de capturas del viewport desplazado al componente. Los resultados son de inspección visual y DOM renderizado, no de una aprobación automática de axe. No se certificó el uso interno de `theme()` ni se leyó la procedencia de los archivos de imagen, por estar fuera del alcance de esta revisión independiente del render.
