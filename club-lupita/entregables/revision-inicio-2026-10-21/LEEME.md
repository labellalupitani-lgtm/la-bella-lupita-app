# Composición revisada de Inicio

Propuesta para revisión visual. El usuario pidió revisar primero Inicio; la extensión al resto de la app y la publicación no están aprobadas.

## Abrir y comparar

- [Composición revisada](http://127.0.0.1:5190/__preview/entrar).
- [Composición anterior](http://127.0.0.1:5192/__preview/entrar).

Las direcciones funcionan en esta computadora, con datos sintéticos y operaciones locales. Si los servidores se cierran, ejecutar desde `club-lupita`, en terminales separadas:

```powershell
node scripts/vista-previa-diseno.mjs --port 5190 --dist dist
```

```powershell
node scripts/vista-previa-diseno.mjs --port 5192 --dist entregables/revision-inicio-2026-10-21/antes/dist
```

No se requieren credenciales del negocio. La base vive en memoria y la red externa está bloqueada.

## Qué cambió

- Cuenta, pase y seguimiento forman un grupo; la invitación gastronómica aparece a su lado en escritorio y después en móvil.
- La foto inicia a 674 px en móvil de 390 px, frente a 1.395 px antes: aparece **51,7 % antes**. El pase sigue visible al abrir en 320 × 568 y 390 × 844.
- Accesos, sellos y beneficio siguen completos, después de la invitación. El seguimiento permanece cerca de la cuenta.
- Se corrigió la tipografía del importe en el diálogo de recarga: Montserrat para datos, Playfair para el título.

No cambiaron las reglas del negocio ni se añadieron dependencias o imágenes. Cambios de producto limitados a `src/casa/pantallas/Inicio.tsx` y `src/casa/estilos/redisenio-inicio.css`.

Capturas comparables:

| Vista | Antes | Después |
| --- | --- | --- |
| Móvil, primera pantalla | [390 px](evidencia/antes-390-viewport.png) | [390 px](evidencia/despues-390-viewport.png) |
| Escritorio, primera pantalla | [1440 px](evidencia/antes-1440-viewport.png) | [1440 px](evidencia/despues-1440-viewport.png) |
| Móvil completo | [Anterior](evidencia/antes-390-completa.png) | [Revisado](evidencia/despues-390-completa.png) |
| Escritorio completo | [Anterior](evidencia/antes-1440-completa.png) | [Revisado](evidencia/despues-1440-completa.png) |

## Validación

Compilación, TypeScript, guardián de tokens e iconos: correctos. Aceptación: diez grupos, incluyendo siete anchuras, privacidad, pase con teclado/Escape/foco, recarga informativa, rutas, estados de seguimiento normal y al 200 %, recuperación de errores y accesibilidad automática sin violaciones en móvil, escritorio y diálogo. Regresión funcional de Inicio: nueve grupos correctos, incluyendo premio/expiración, revalidación y separación entre cuentas.

Evidencias: [aceptación](evidencia/aceptacion.json), [regresión](evidencia/regresion/resultados-ui.json), [comparación de composición](evidencia/composicion.json). Son pruebas locales en Edge; no cubren todos los navegadores o dispositivos físicos.

Revisiones independientes: [objetivo](revision-objetivo.md) PASS, [identidad](revision-identidad.md) PASS después de corregir y revalidar, [acabado](revision-acabado.md) PASS. La revisión de identidad encontró el saldo con la tipografía anterior; se corrigió y se añadió su comprobación a la aceptación.

## Límites y siguiente paso

El recorte panorámico de escritorio conserva el alimento reconocible, pero corta parte del extremo superior del sándwich. Se puede ajustar después de valorar esta composición.

La medición local de tres cargas registró LCP mediano 68 → 128 ms y CLS 0,064 → 0,087. No se presenta como una mejora de rendimiento. El [diagnóstico de carga](evidencia/diagnostico-carga.json) muestra que el candidato LCP cambia del aviso técnico del preview a la foto; el desplazamiento principal de 80 px ya aparecía en ambas versiones cuando se retiran los mensajes de actualización. La descarga variable de Work Sans también existe en ambas. Estas cifras sin limitación de red/CPU no certifican rendimiento de producción. Conviene estabilizar los estados iniciales y la carga tipográfica al integrar el sistema compartido; los [resultados brutos](evidencia/rendimiento.json) conservan la variación observada.

El siguiente paso es la validación visual del usuario. El objetivo del **100 % de páginas, módulos y componentes** sigue vigente, registrado en la [matriz de cobertura](../redisenio-2026-10-21/COBERTURA.json). El [selector de perfiles](../redisenio-2026-10-21/VISTA-PREVIA-INTEGRAL.md) está preparado para los ciclos posteriores; esto no declara terminado su rediseño.
