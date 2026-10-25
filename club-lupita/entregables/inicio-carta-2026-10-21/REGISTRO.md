# Inicio: fotografía y carta

## Dirección del usuario

Después de comparar las primeras propuestas, el usuario pidió seguir ajustando Inicio y priorizar «Más protagonismo para las fotos y la carta, como en las referencias». La invitación gastronómica precederá a la cuenta completa; se conserva un pase rápido en la parte superior. Criterios comprobables en [bar.md](bar.md).

## Estado del ciclo

- Implementación: composición integrada y foco del risotto corregido, manteniendo activo y tamaño. Compilación y 37 comprobaciones geométricas repetidas después de la corrección.
- Pruebas: compilación/guardián/TypeScript correctos, 37 comprobaciones geométricas, diez grupos de aceptación, nueve de regresión y siete escenarios de estabilidad correctos.
- Crítica de objetivo: PASS, una ronda. [Informe](objetivo/REVISION-OBJETIVO.md).
- Crítica de identidad: PASS, una ronda. [Informe](REVISION-IDENTIDAD.md). Observación menor opcional: redondear la tarjeta interior del pase en un ciclo posterior.
- Crítica de acabado: PASS, dos rondas. La primera detectó el recorte de la base del risotto y exceso de fondo; se corrigió el foco con selector específico del plato y posición vertical al 90%. Revisión de 390/1440 confirma alimento y bandeja completos. [Informe y trayectoria FAIL → PASS](REVISION-ACABADO.md).
- Validación visual del usuario: pidió seguir ajustando y precisó «Una portada más visual, con menos texto y cabecera». Siguiente propuesta en `../inicio-portada-2026-10-21/`; esta composición no se aprobó para extender.
- Producción: sin publicar.

Respaldo de la composición anterior, con la corrección de estabilidad de carga ya aplicada, en `antes/`. La extensión al resto de la aplicación sigue pendiente de validar esta dirección visual.

## Cambios de pruebas por la composición

Se sustituyó la dependencia del titular editorial «Tu casa, a mano» por el título estable «Tu cuenta de casa» en los recorridos de llegada a Inicio. Cuenta y sellos pueden compartir coordenada vertical en escritorio: se conserva la comprobación de orden de lectura en DOM y de posición visual, permitiendo esa igualdad. El fallo inicial de la condición antigua quedó registrado y la repetición pasó. Se añadieron recorridos de «Explorar la carta» y «Toda la carta» a la aceptación.

La corrección final del risotto afecta únicamente a su posición dentro de la imagen y a un atributo identificador de tarjeta. Después se repitieron build, geometría/capturas, medición local y crítica de acabado; no cambió la lógica funcional validada por las suites.
