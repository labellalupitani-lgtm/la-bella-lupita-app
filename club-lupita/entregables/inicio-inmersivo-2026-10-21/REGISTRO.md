# Quinta composición de Inicio

Petición: «Una portada más inmersiva, con la foto a todo el ancho». La cuarta propuesta no se aprobó visualmente. Respaldo de fuentes y compilación en `antes/`.

Dirección: fotografía de borde a borde, titular/acción sobre imagen, encuadre adaptable y contraste verificable. [Criterios](bar.md).

- Implementación: completada en Inicio y su CSS. La fotografía pinta toda la portada, sin margen lateral; título y CTA se integran sobre ella. No se amplió el rediseño a otras pantallas.
- Pruebas: compilación aprobada; 133 comprobaciones geométricas sin omisiones, 11 grupos de aceptación, nueve de regresión y siete escenarios de estabilidad aprobados. Resultados y límites en [LEEME.md](LEEME.md).
- Revisión de objetivo: [PASS](REVISION-OBJETIVO.md), con 32 comprobaciones propias de uso.
- Revisión de identidad: [PASS](REVISION-IDENTIDAD.md), con contraste medido sobre píxeles reales en seis estados y un caso adicional de ampliación directa en escritorio.
- Revisión de acabado: [PASS](REVISION-ACABADO.md), incluida ampliación directa de fuentes al doble en móvil y escritorio.
- Validación visual: el usuario respondió «Seguir ajustando Inicio» y después pidió investigar profundamente todas las referencias originales. La quinta propuesta no queda aprobada como base para extender el diseño. Se conserva en `../inicio-ajuste-2026-10-21/antes/`; la nueva investigación se documenta en `../investigacion-diseno-2026-10-21/`.
- Producción: sin publicar; no autorizada.

## Implementación y correcciones

1. Se preservó la cuarta compilación y las fuentes en `antes/`, con servidor comparativo en 5195. Se definieron seis criterios antes de implementar y se asignó un constructor separado de los tres críticos.
2. La primera comprobación encontró que el titular ampliado podía alcanzar una zona clara en móvil. Se sustituyó el degradado ligado al alto total de la portada por un tratamiento que acompaña al bloque del mensaje al crecer. La composición final se compiló después de esa corrección.
3. La prueba geométrica nueva confundía un aviso normal con seguimiento prioritario y omitía las comprobaciones de apertura. Se corrigió la detección del test para exigir una acción de seguimiento y comprobar que el fixture normal está disponible. La ejecución definitiva aprobó 133 comprobaciones sin omisiones.
4. El crítico de objetivo comprobó que el aparente roce de un control con la barra inferior al ampliar texto era una lectura anterior al reflujo. Tras esperar el diseño estable, el botón completo y las tarjetas enfocadas quedan libres y operables. No se hizo un cambio de aplicación por esa falsa alarma.
5. El crítico de acabado contrastó referencias, capturas y navegador. La taza más cercana en escritorio es una diferencia deliberada y no impide reconocer producto y marca. No halló un defecto que justificara otra ronda de cambios cosméticos.
6. El crítico de identidad midió el render con texto visible y con tinta transparente para conservar la foto y el degradado reales. En 320/390/1440 px, con raíz al 100/200 %, el mínimo del titular fue 4.70:1 y del CTA 6.43:1. Se comprobó además la duplicación directa de fuente en escritorio (56→112 px), porque duplicar la raíz solo alcanzaba 80 px por el tamaño adaptable: titular 6.35:1. No quedan mediciones pendientes de estos casos. El PASS corresponde al texto, foto y encuadre actuales; no extrapola a cualquier modificación futura.

Las tres revisiones independientes cierran PASS sobre la compilación final. No se modificó la aplicación después de sus comprobaciones. Las únicas correcciones posteriores afectan al registro y a la matriz documental.

## Decisiones y continuidad

La dirección elegida por el usuario es una portada más inmersiva con fotografía a todo el ancho. Eso autoriza este ajuste, pero no equivale a aprobar su resultado visual. Se conservan marca, funciones, prioridades, datos sintéticos y el ajuste previo del carrusel para teclado. No se agregaron dependencias, imágenes nuevas ni movimiento continuo.

El siguiente paso, una vez validada la composición, es extenderla al sistema compartido y al alcance integral registrado. [PLAN-100.md](../redisenio-2026-10-21/PLAN-100.md) y [COBERTURA.json](../redisenio-2026-10-21/COBERTURA.json) conservan pendientes las demás superficies. Los hashes de fuentes y el índice compilado se registran en [fuentes.json](fuentes.json).
