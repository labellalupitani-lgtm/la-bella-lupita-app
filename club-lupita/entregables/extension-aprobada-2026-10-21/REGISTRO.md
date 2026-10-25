# Extensión de la dirección aprobada

El 21 de octubre de 2026 el usuario respondió «Aprobar y extender el rediseño» a la sexta composición de Inicio. Esta decisión autoriza extender la dirección al 100 % de la aplicación. No autoriza publicar en producción. No se requiere una segunda aprobación de la misma base.

Se conservan la sexta composición y todo `src/casa` en `antes/`, junto con su compilación. La investigación, el inventario de 77 superficies y las funciones existentes siguen siendo la base de trabajo.

## Conjuntos

| Conjunto | Implementación | Pruebas | Revisión independiente |
| --- | --- | --- | --- |
| Sistema compartido, navegación, acceso y kit | Integrado | Sistema 18, Inicio 11, acceso real PASS; transversal final PASS | Uso, marca y acabado PASS; correcciones Kit revalidadas |
| Carta, detalle, Tienda, compras y reservas | Integrado | Carta 14, Tienda 9, operación 3 + 3, reservas 9 PASS | Uso, marca y acabado PASS; foco revalidado |
| Club, explicación, perfil, cuenta y beneficios | Integrado | Perfil 10, Club 24, Conocé 21, variantes 8, ayuda 4, operación 3, reglas 4 y experiencias 6 PASS | Uso, marca y acabado PASS |
| Equipo: 12 módulos, acceso y cuatro roles | Integrado | 12 módulos/4 roles, seguridad UI 7, descuento UI 3, 21 suites servidor PASS | Uso, marca y acabado PASS |

La extensión no se acredita por un cambio global de CSS. Cada conjunto debe mostrar composición, estados y recorridos funcionales, con capturas y críticas independientes. Inicio conserva la composición aprobada; los ajustes compartidos se contrastarán con su versión aprobada.

## Decisiones

- Se reutilizan datos, imágenes y flujos reales del proyecto; las pruebas usan exclusivamente cuentas sintéticas y el Worker aislado.
- La investigación de 21st informa selección, continuidad y feedback. Se escriben adaptaciones propias en la tecnología existente, con movimiento reducido y sin nuevas dependencias salvo necesidad comprobada.
- El cierre exige cobertura integral verificada; la aprobación de Inicio permite avanzar, pero no acredita el resto de la aplicación.

## Primera ronda integrada

La compilación pasa TypeScript, Vite y el guardián completo. El recorrido transversal de 23 superficies principales (once destinos cliente/herramientas y doce secciones del equipo), cuatro anchos y texto ampliado encontró un desbordamiento de Kit al 200 %. Se corrigieron métricas, filas, sellos y muestras; la comprobación específica pasó después. El registro inicial se conserva como ronda, no como aceptación final de una única compilación.

Las pruebas encontraron contraste insuficiente durante la transición de un botón que pasaba de deshabilitado a disponible. Se retiró la interpolación de color de ese cambio y se mantuvo respuesta táctil; el recorrido real por correo, alta y reingreso con axe pasó. También se corrigió el contraste del respaldo de fotografía de Carta.

El árbitro independiente de uso reprodujo foco tapado por el cierre fijo de Reserva. El cierre se mide y el foco se mantiene sobre él; el constructor probó veinte pasos de teclado con texto normal/ampliado. El árbitro revalidó la corrección en `principal-4KPpZegJ.js`: la tarjeta enfocada queda completamente encima del cierre. El enlace de salto se eleva sobre el aviso de prueba mientras recibe foco.

## Verificación integrada

`evidencia/integral-final/resultados.json`: 138 comprobaciones PASS en una compilación estable: 23 superficies, cuatro anchos (320, 390, 768 y 1440), axe y texto al 200 %. Cero desbordamientos, imágenes rotas, errores de ejecución o peticiones externas en el recorrido. Complementa, no sustituye, las suites transaccionales.

`evidencia/regresion-completa.log`: las 21 suites de `npm test` pasan. `evidencia/seguridad/resultados.json`: siete recorridos de UI real sobre Worker aislado, incluyendo invitación, rol, activación, MFA, códigos, bloqueo, revalidación, revocación total, recuperación e ingreso. `evidencia/caja-descuento/caja-ui.json`: tres grupos de descuento, respuesta perdida, anulación con motivo y accesibilidad.

Las pruebas recorren escenarios concretos; no se confunden con todas las combinaciones posibles de cada estado, rol, navegador y resolución. Las variantes simuladas y la evidencia de diferentes compilaciones intermedias se delimitan en los informes de cada conjunto.

## Cierre

Compilación final `principal-Ctm5IHgB.js`. Cuatro rondas del conjunto sistema: R1 identificó el texto comprimido de la tarjeta de Kit; R2 confirmó su arreglo y detectó Cerrar comprimido; R3 confirmó Cerrar y detectó recorte con texto200; R4 comprobó mensaje y cierre completos en pantallas cortas. Uso y marca revalidaron los renders/cambios finales. Los otros tres conjuntos terminaron sin hallazgos importantes pendientes.

La suite del sistema terminó con18 grupos. Una repetición quedó esperando indefinidamente `img.decode()` de una imagen de prueba reemplazada; se detuvo únicamente ese proceso de test, se acotó la espera de decodificación y se repitió completa, conservando las aserciones de imagen/overflow. No requirió cambios del producto.

[Entrega y preview](LEEME.md), [cobertura](COBERTURA.md), [comparación](COMPARAR.html) y [manifiesto](MANIFIESTO.json). La matriz77 registra aplicación de la dirección y revisión, con límites de prueba por superficie. Al cierre de esta etapa de diseño, producción todavía estaba pendiente de autorización; la autorización y publicación posteriores se registran a continuación.

La limpieza de copias temporales de capturas en una ruta con espacios codificados fue rechazada por la revisión automática (`blocked by policy`). Se conservaron; no afecta al proyecto ni a la evidencia de entrega.

## Publicación autorizada · 21 de octubre de 2026

Después de revisar la app, el usuario indicó «Procede a aplicar el nuevo diseño». Se publicó la compilación aprobada `principal-Ctm5IHgB.js` en `https://app.labellalupita.com/`, versión Cloudflare `cfd8bb75-1dd3-4497-abcb-883ef418cbb2`, al 100 %. La compilación repetida conservó las 277 huellas del manifiesto. Los 32 archivos de servidor/configuración coinciden con la entrega previamente publicada; se conservaron variables y secretos y no hubo migraciones.

La comprobación pública pasó: once entradas HTTP, 172 recursos por SHA-256, seis respuestas API y doce renders (seis pantallas públicas a 390 y 1440 px). No hubo operaciones comerciales ni autenticaciones de prueba en producción. Se conservó la versión anterior para reversión. [Informe y evidencia](../publicacion-redisenio-2026-10-21/PUBLICACION.md).
