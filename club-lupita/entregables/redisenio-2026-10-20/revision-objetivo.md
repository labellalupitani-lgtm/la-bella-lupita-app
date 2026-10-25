# Revisión independiente del objetivo — ciclo 1

**Resultado final: PASS.** La segunda ronda satisface el alcance de Inicio y sus componentes revisados. No encontré fallos críticos o importantes pendientes dentro de ese alcance. Esta aprobación técnica no aprueba la dirección visual en nombre del usuario ni autoriza publicar.

Revisión realizada el 20 de octubre de 2026, hora de Managua, por un agente que no implementó los cambios. Se leyó el objetivo suministrado y las evidencias de aceptación. La evaluación se hizo sobre la aplicación renderizada en Edge sin interfaz, en `http://127.0.0.1:5188/__preview/entrar`, comparada con la base en el puerto 5189. No se inspeccionó el código de implementación para justificar decisiones visuales. No se modificaron datos de producción ni archivos de aplicación.

## Ronda 1: FAIL

**Hallazgo P2 — desbordamiento horizontal con texto ampliado en móvil estrecho.**

- **Dónde:** Inicio, encabezado «Algo rico para acompañar».
- **Reproducción:** viewport de 320 × 568; tamaño raíz de texto al 200 %, interlineado 1.5, espaciado de letras 0.12 em, de palabras 0.16 em y margen inferior de párrafos 2 em. Estas preferencias se inyectaron solo en el navegador de revisión.
- **Resultado:** el documento alcanzaba 332 píxeles de ancho; el borde derecho del título estaba en 332.109 píxeles.
- **Impacto:** aparecía desplazamiento horizontal accidental al ampliar y espaciar el texto.
- **Corrección solicitada:** permitir que el contenedor se contraiga y que el título envuelva dentro del ancho disponible, sin ocultar contenido.
- **Evidencia:** `evidencia/arbitro-320-texto200.png`.

Los anchos normales de móvil y escritorio, las rutas, la privacidad del saldo y los paneles ya funcionaban en esta ronda.

## Ronda 2: PASS

Tras la corrección, se recargó la aplicación y se repitieron las condiciones del hallazgo. El documento mide 320 píxeles en el viewport de 320, y 390 píxeles en el de 390. El título queda dentro del contenedor de 288 píxeles en el caso estrecho. Las tarjetas que quedan fuera del área visible pertenecen al carrusel desplazable; no ensanchan el documento. Evidencia: `evidencia/arbitro-320-texto200-r2.png`.

| Comprobación independiente | Resultado |
| --- | --- |
| Inicio a 320, 390, 768, 1024 y 1440 píxeles | Sin desbordamiento de documento ni imágenes fallidas. Composición legible y acciones principales identificables. |
| Texto al 200 % y espaciado ampliado a 320 y 390 | Sin desbordamiento horizontal después de corregir el título. |
| Navegación principal: Inicio, Carta, Tienda, Mi Club y Perfil | Los cinco destinos y encabezados coinciden con la base anterior. |
| Movimientos, reglas, avisos, carta, reserva, tienda, beneficio, promoción, cosecha, experiencia y explicación del club | Los accesos navegan a los destinos esperados. No se encontraron botones de adorno. |
| Pizza Churrasco, Risotto de Gallo Pinto y Dulce Tentación | Cada tarjeta abre el detalle correspondiente en Carta con su título, precio y opciones. |
| Pase | Muestra identificación e instrucciones. El foco inicial llega a Cerrar, los controles se recorren con teclado, Escape cierra y devuelve el foco al disparador. |
| Recargar en caja | Muestra instrucciones y límites, permite enseñar el pase y consultar el saldo. No ejecuta un cobro. |
| Privacidad del saldo | Ocultar saldo muestra el valor enmascarado y persiste al recargar la página. Se pudo volver a mostrar. |
| Actualización de Inicio | Consulta nuevamente los recursos locales y conserva la pantalla utilizable. |
| Error de red de `/api/yo` | El mensaje explica que se conserva la última consulta y ofrece reintento; al restablecer la respuesta y actualizar, se recupera el estado normal. |
| Sin experiencias ni cosecha disponible | Con respuestas de prueba interceptadas en el navegador, el bloque promocional desaparece sin dejar controles vacíos. |
| Foco con texto ampliado | Se recorrieron 17 acciones de contenido a 320 y 390. Ninguna quedó completamente oculta por la navegación fija; a 390 todas quedaron por encima de ella. Los controles mayores que la altura disponible permiten seguir desplazando la página. |
| Errores de ejecución | Ningún error JavaScript capturado durante los recorridos. |

La última versión leída de `evidencia/aceptacion.json` contiene nueve comprobaciones con `ok: true`, incluyendo accesibilidad automática, texto ampliado y movimiento reducido. Los archivos de Axe disponibles no contienen hallazgos. Estas evidencias complementan la revisión visual y de interacción; no sustituyen las comprobaciones de navegador descritas arriba.

## Evidencias propias

- `evidencia/arbitro-390-r2.png`: Inicio móvil final.
- `evidencia/arbitro-1440-r2.png`: Inicio escritorio final.
- `evidencia/arbitro-tablet.png`: composición tablet.
- `evidencia/arbitro-pase390-r2.png`: pase móvil final.
- `evidencia/arbitro-error.png`: error de conexión recuperable.
- `evidencia/arbitro-320-texto200.png` y `evidencia/arbitro-320-texto200-r2.png`: fallo inicial y corrección.

## Límites y continuidad

La revisión cubre Inicio, sus accesos y los paneles implicados. No certifica todas las operaciones de compra, reserva, beneficios o administración de las demás pantallas. No se hizo una medición formal de rendimiento ni una prueba con lector de pantalla; no se presentan como superadas. Los recorridos realizados no mostraron errores de ejecución o bloqueos de interacción.

Siguiente paso: presentar la vista previa al usuario para validar esta dirección antes de extenderla a otras pantallas. Mantener el registro de la corrección de texto ampliado y el espacio reservado para el foco sobre la navegación móvil en los siguientes ciclos.
