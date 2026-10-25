# Revisión de Inicio — 21 de octubre de 2026

## Decisión del usuario

«Revisar primero la composición de Inicio». No se aprobó extender la propuesta al resto de la app. El objetivo del 100 % de cobertura permanece vigente, condicionado a validar la dirección visual. Producción requiere autorización explícita independiente.

## Diagnóstico y alcance

En la composición anterior, cuenta, fidelidad, seguimiento, accesos y beneficio preceden a la primera fotografía. La nueva iteración acerca la invitación gastronómica a la cuenta y reduce el peso de las utilidades. Se conservan datos, reglas y acciones; cambios visuales limitados a Inicio.

Barra de evaluación: [bar.md](bar.md). Identidad: [sistema del ciclo anterior](../redisenio-2026-10-20/design-system.md). Fuentes y compilación anteriores respaldadas en `antes/`.

## Estado

- Implementación: composición integrada; cuenta/seguimiento y foto forman el primer grupo; sellos y beneficios van después. Sin cambios de negocio o dependencias.
- Pruebas: build/guardián/TypeScript correctos, diez grupos de aceptación y nueve grupos de regresión; foto 51,7 % antes a 390 px.
- Revisión independiente: objetivo PASS (1 ronda), acabado PASS (1 ronda), identidad PASS (2 rondas: detectó un importe con tipografía anterior, se corrigió y se revalidó en 320/390/1440 px y texto 200 %).
- Decisión visual del usuario: seguir ajustando Inicio; pide «Más protagonismo para las fotos y la carta, como en las referencias». La siguiente propuesta se registra en `../inicio-carta-2026-10-21/`.
- Publicación: no realizada.

## Trabajo paralelo de preparación

La matriz de cobertura y el selector de perfiles de prueba sirven para revisar todas las áreas en ciclos posteriores. No representan cambios visuales aprobados ni completados del panel del equipo.

## Trazabilidad y pendientes

La regresión funcional se inició una vez antes de acabar la compilación y leyó la composición anterior: falló la aserción de orden revisado. Se repitió después de terminar el build y pasaron los nueve grupos. `evidencia/regresion/fallo.*` se conserva como historial, no como resultado vigente; el resultado vigente es `resultados-ui.json`.

La prueba geométrica que exigía cuenta y sellos alineados en escritorio se adaptó a la nueva jerarquía: cuenta antes de fidelidad. El resto de los contratos funcionales se conservó. Se añadieron comprobaciones de seguimiento compacto y tipografía de recarga tras el hallazgo independiente.

El desplazamiento durante actualizaciones normales se corrigió y recibió revisión independiente: [estabilidad de carga](../estabilidad-inicio-2026-10-21/REVISION.md). El encuadre de escritorio y el protagonismo gastronómico se revisan en la siguiente composición. Persisten pequeños movimientos de fuentes en apertura fría y crecimiento útil de mensajes de error; las mediciones locales no acreditan rendimiento en producción. Ver detalle en [LEEME.md](LEEME.md).
