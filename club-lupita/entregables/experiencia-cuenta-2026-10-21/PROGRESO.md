# Bucle de diseño

Estado: ciclo local revisado y verificado; compilación R4 congelada para validación visual del usuario.

## Preflight

Alcance y archivos ya provistos por el usuario: tres módulos existentes, mejora autónoma de la dirección aprobada. No se repiten preguntas de entrevista respondidas.

Referencias locales visibles y fuente Dribbble accesible. Investigación adicional con referencias renderizadas por agente. Podemos renderizar la app en navegador integrado y navegadores de prueba. Imágenes locales existentes disponibles; no se requiere generación nueva ni video sin relación con la tarea. Fuentes, tokens y código presentes. Ningún crítico trabaja a ciegas; los fallos de acceso a referencias adicionales se documentan, sin sustituir observaciones por suposiciones.

## Piezas

| Pieza | Ronda | Estado | Función | Sistema | Oficio |
| --- | --- | --- | --- | --- | --- |
| Tienda | 4 | Revisada | PASS | PASS | PASS |
| Mi club | 4 | Revisada | PASS | PASS | PASS |
| Perfil | 4 | Revisada | PASS | PASS | PASS |

## Brechas registradas

- Base rechazada: ningún módulo tenía imagen; Mi club desplazaba el primer código útil a y945 en móvil; Perfil ocupaba 4116 px y 460 palabras. Evidencia en base/AUDITORIA-BASE.md.
- Cabecera de 913 px confirmada con gutter nativo de 15 px: 183 px de alto. Corregida composición en 900–1120; pendiente revisión integrada.
- Tienda base incompleta: se añadió escenario de preview `--experiencia`, solo datos en memoria, para revisar compra disponible. Comparación justa congelada en antes-representativo con el mismo escenario que la nueva versión.
- Tienda en construcción: opacidad durante transición afectaba contraste; constructor la sustituyó por movimiento sin cambio de opacidad. Pendiente crítica independiente.
- Perfil: sustitución de imagen con persona por escena vacía para que no parezca un retrato de la cuenta; rótulos ampliados y «Tu acceso» en lugar de una promesa de privacidad exclusiva.
- Matriz integrada detecta `aria-prohibited-attr` en sello pendiente de Club. Semántica corregida en fuente; pendiente recompilar/revalidar.
- Club: saldo saltaba su flecha a otra línea en móvil; se ajusta composición. Se añade acceso directo al código del café al lado del pase para acercar una tarea frecuente.
- Las regresiones de Perfil y Club deben abrir las nuevas secciones para leer detalles. Se actualizan únicamente esos pasos de navegación; se conservan aserciones de contrato, consentimiento y seguridad.

## Evidencia provisional

- Build inicial aprobado: principal-DnzbmSyL.js (no es aún la versión final).
- Servidor: tests/tienda.mjs, tests/mi-club.mjs y tests/perfil.mjs terminaron con código 0. No cambió código del servidor.
- UI Tienda: tienda-ui.log aprobado, incluidas pruebas Firefox/WebKit del recorrido.
- UI Perfil: perfil-ui-ajustado.log aprobado tras abrir «Datos y ayuda» y «Sesión y dispositivos» en los escenarios correspondientes.
- UI Club: transacciones probadas hasta la aserción axe; rechazo por el atributo del sello mencionado. No se presenta como aprobado.
- Matriz ronda-1: 33 vistas (10 anchos por módulo y 320/texto200); no overflow/imagen rota/error JS; el único hallazgo automático fue la semántica del sello. La captura no sustituye juicio de oficio.

La ronda se considera abierta hasta corregir y revisar los hallazgos. Una compilación o axe sin errores no demuestra acabado visual.

## Revisión independiente R1 y corrección R3

Compilación revisada: principal-C1ep5tM_.js. Función: Tienda PASS, Club FAIL, Perfil FAIL. Sistema: las tres FAIL por reflujo ampliado. Oficio: Tienda FAIL, Club y Perfil PASS. Informes `revision-{funcion,sistema,oficio}-r1.md`.

Hallazgos corregidos en principal-DTOZgFsC.js (pendientes de revalidación independiente):

- F1: «Ver movimientos» ahora abre y enfoca Tu cuenta mediante enlace profundo.
- F2: saldo no disponible ofrece Actualizar cuenta; el reintento usa el recurso de cuenta y distingue datos anteriores cuando falla la actualización.
- S1 / oficio: hero de Tienda sin foto usa peso, presentación y lote confirmados, con ilustración abstracta de granos y aviso de foto pendiente. Se retiró el círculo que se solapaba; la foto API se conserva cuando existe.
- S2: cabeceras de Club permiten salto de línea del ordinal.
- S3: arte y texto de beneficios fluyen según espacio disponible; 250 g ya no está encerrado en una columna fija estrecha.
- S4: cumpleaños y alergias reservan una fila completa para el texto en ancho estrecho.
- Oficio: formulario de encargo usa columnas de ancho mínimo cero, controles contenidos y una columna en móvil. El desborde de 518 px sobre 390 px desaparece en prueba del constructor.
- La primera implementación del foco profundo ocurrió antes de mostrar el panel. Una regresión nueva lo detectó; se mueve el foco después del render del panel. Recuperación y foco pasan en dev y compilación.

Regresiones comprobadas: Mi Club tres motores aprobado en R2; Perfil Edge/Firefox/WebKit aprobado en R2, Edge repetido en R3 por nueva recuperación; Tienda UI aprobada en R1. La matriz R2 detectó aún un píxel de desborde en Club; R3 amplía texto raíz y texto computado a 320/390 px. No se declara la matriz R3 aprobada hasta terminar.

## Diagnóstico de la pestaña del usuario

El usuario indicó que no veía el resultado. La captura directa del navegador mostró Perfil anterior todavía cargado en 5277. Se abrió la cuenta sintética y Perfil actual en 5296, y se verificó imagen, preferencias, secciones y cabecera compacta en el panel real. Se recargó después de R3. La entrega tendrá enlaces directos a las pantallas y una compilación congelada para no invalidar recursos de pestañas abiertas durante futuras construcciones.

## R4 de producto

La segunda revisión detectó un hueco blanco en las tarjetas de beneficios de Club a 390/913: al pasar a flex persistían direction:column y align-items:flex-start heredados. Se corrigió direction:row, wrap y stretch, conservando columna en estrecho. Compilación: principal-B6EbsuoF.js.

- Matriz final: 42 vistas aprobadas, cero overflow/documento, imágenes rotas, errores JS, peticiones externas o violaciones axe en los escenarios medidos. Incluye 10 anchos normales por pantalla y texto raíz/computado al 200% en 320/390.
- Función R2: PASS tres piezas, con alcance conservado de R1 y delta F1/F2 revalidado en R3. R4 modifica únicamente CSS de Club.
- Oficio R2 sobre R4: PASS tres piezas; hueco de tarjetas corregido y revisado.
- UI final: Mi Club aprobado en Edge/Firefox/WebKit; Tienda recorrido principal Edge y controles/contratos en Firefox/WebKit. Perfil Edge aprobado R3; Firefox/WebKit aprobados R2, anteriores a añadir la recuperación de saldo (no se atribuyen a R4).
- Sistema R2 sobre R4: PASS tres piezas; S1–S5 cerrados. Informe final y capturas conservados.

## Entrega comprobada

Preview 5296 sirve compilacion/ congelada de R4, con datos sintéticos reiniciados. Matriz limpia adicional de 15 vistas y regresiones F1/F2 sobre esa copia aprobadas. Captura real del panel guardada en panel-final.png. Comparación justa en comparacion-final/. Medición de carga local y sus variaciones registradas en LEEME.md; no se infieren métricas de campo. Pendiente exclusivamente validación visual del usuario y autorización independiente para producción.

Comparador verificado: 18 imágenes cargan en los tres tamaños; video de interacciones de 9,76 s con metadatos válidos. Prueba en comparacion-verificada.json. Todos los entregables locales requeridos están listos; sin publicación.
