# Inicio: fotografía y carta desde el comienzo

Sexta propuesta, 21 de octubre de 2026. Implementada en el proyecto real, con tres revisiones independientes cerradas. **Pendiente de aprobación visual del usuario.** El rediseño del resto de la aplicación sigue pendiente; no se ha publicado.

## Abrir y comparar

- [Nueva composición](http://127.0.0.1:5190/__preview/entrar).
- [Quinta composición conservada](http://127.0.0.1:5196/__preview/entrar).
- [Investigación y comparación de referencias](../investigacion-diseno-2026-10-21/panel-referencias.html) y [síntesis completa](../investigacion-diseno-2026-10-21/LEEME.md).

Las vistas funcionan en esta computadora con servidores locales encendidos. El aviso superior identifica datos sintéticos; la base vive en memoria y los servicios externos están bloqueados. Para reiniciarlas, desde `club-lupita`, ejecutar cada comando en una terminal:

```powershell
node scripts/vista-previa-diseno.mjs --port 5190 --dist dist
node scripts/vista-previa-diseno.mjs --port 5196 --dist entregables/inicio-ajuste-2026-10-21/antes/dist
```

## Qué cambia y por qué

La investigación distinguió las pantallas de bienvenida de las de exploración. Inicio pertenece a un cliente identificado: ahora la fotografía comparte protagonismo con opciones concretas para elegir.

- Marca, pase y actualización comparten cabecera. Se conserva el acceso a reservar en el contenido.
- La foto llega a ambos bordes: café en móvil y un díptico de café/desayuno en escritorio. El texto queda sobre una superficie clara, fuera de la comida.
- Los productos reúnen imagen, nombre en Playfair y precio en Montserrat. El tercer plato asoma en móvil para indicar que la lista continúa.
- En 390 × 844, dos productos completos quedan por encima de la barra inferior, incluido el aviso local. En 1440 × 1000 se ven los tres. La quinta composición mostraba cero completos en ambos tamaños.
- El teclado lleva la tarjeta completa a la vista. Al regresar de un producto se recuperan foco y desplazamiento; si aparece un pedido o reserva, su seguimiento recibe prioridad y foco.
- Al ampliar el texto al 200 %, la navegación refluye en dos filas con palabras completas. El espacio inferior se adapta a su altura real.

Se modificaron `Inicio.tsx`, `redisenio-inicio.css` y la integración de cabecera en `Navegacion.tsx`. No se cambiaron dependencias ni reglas del negocio. Las pruebas y el registro se actualizaron junto con el código. [Fuentes y hashes](fuentes.json).

## Antes y después

| Vista | Quinta | Sexta |
| --- | --- | --- |
| Móvil, 390 × 844 | [Antes](evidencia/composicion/antes-390x844-viewport.png) | [Después](evidencia/composicion/despues-390x844-viewport.png) |
| Escritorio, 1440 × 1000 | [Antes](evidencia/composicion/antes-1440x1000-viewport.png) | [Después](evidencia/composicion/despues-1440x1000-viewport.png) |

## Verificación y revisión

| Comprobación | Resultado |
| --- | --- |
| Guardián, TypeScript y Vite | PASS; [compilación](evidencia/build.log) |
| Composición, prioridades y regreso de producto | 93 comprobaciones PASS; cinco tamaños, datos locales reales de la fixture y variantes aisladas |
| Aceptación visual y accesibilidad automática | 11 grupos PASS; axe sin violaciones en móvil, escritorio y diálogo |
| Carga, estados y recuperación | 7 grupos PASS |
| Regresión funcional de Inicio | 9 grupos y 8 resoluciones PASS |

[Resultados consolidados y alcance de cada ejecución](evidencia/pruebas-ui.json). Las pruebas usan Edge local; no equivalen a certificar todos los navegadores o el rediseño integral. La aceptación y la regresión funcional se ejecutaron después de las correcciones visuales; el último ajuste aislado de retorno prioritario se verificó después con composición, estabilidad y revisión independiente.

Tres árbitros revisaron el resultado sin leer la implementación: [objetivo](REVISION-OBJETIVO.md), [marca y legibilidad](REVISION-MARCA.md) y [acabado frente a las referencias](REVISION-ACABADO.md). Los tres cerraron en PASS. Las rondas corrigieron la reserva del logo al foco, etiquetas fragmentadas con texto ampliado, resolución insuficiente del risotto y seguimiento oculto al regresar por historial. El último caso se reprodujo con pedido y reserva, tanto con respuesta inmediata como demorada 800 ms. [Registro de decisiones y rondas](REGISTRO.md).

La comparación de carga se conserva en [rendimiento.json](evidencia/rendimiento.json): tres cargas por versión, Edge local a 390 × 844, sin limitación de red o CPU. Sus resultados no representan métricas de producción. El campo `cls` es una suma de desplazamientos sin entrada reciente, no el CLS estándar calculado por ventanas de sesión.

| Mediana local | Quinta | Sexta |
| --- | ---: | ---: |
| LCP | 120 ms | 132 ms |
| Bytes de recursos | 546.258 | 494.109 |
| Peticiones | 34 | 34 |
| Suma de desplazamientos | 0,001288 | 0,000852 |

La transferencia baja aproximadamente un 9,5 %. La diferencia local de LCP es de +12 ms en esta muestra pequeña; no permite atribuir una mejora de velocidad ni extrapolar resultados de producción.

## Pendientes

La aprobación técnica no decide por el usuario. El encargo establece: «Entrégame una vista previa revisada para validar esa dirección antes de extenderla al resto de la app». Esta sexta propuesta queda disponible para esa validación.

En 320 × 568 y con texto ampliado se necesita desplazamiento: se priorizan lectura y controles completos. El crítico de acabado recomienda probar una franja más baja en pantallas cortas como refinamiento futuro, conservando la taza reconocible.

Una vez validada la base, el siguiente alcance es extender el sistema al resto de las pantallas y componentes según el [plan integral](../redisenio-2026-10-21/PLAN-100.md) y la [matriz de 77 superficies y familias](../redisenio-2026-10-21/COBERTURA.json). Esa matriz es un inventario de trabajo, no un porcentaje de avance. La publicación requiere aprobación explícita posterior.
