# Revisión independiente de composición — Mis compras

**Dictamen de cierre: PASS.** Revisión visual de `pruebas-compras-final` frente a `antes/compras-abierta.png`, seguida de verificación focal en `pruebas-compras-cierre`, sin leer fuente ni modificar la aplicación.

## Hallazgo anterior resuelto

En la tanda anterior, `pruebas-compras-final/comprobantes-390-viewport.png`, el primer comprobante empezaba aproximadamente en y=663; su nombre «Pedido #4101» era legible, pero la pastilla de estado comenzaba cerca de y=765 y la navegación fija empezaba cerca de y=771. El texto del estado no llegaba a verse en la primera pantalla. Faltaba recuperar aproximadamente 35–40 px para cumplir el criterio explícito de mostrar nombre y estado del primer comprobante a 390 px.

La captura de cierre `pruebas-compras-cierre/comprobantes-390-viewport.png` resuelve la brecha: las cinco opciones de filtro caben en una fila, el primer comprobante comienza cerca de y=614 y muestra nombre y estado completos. La pastilla «Estado: preparando» termina aproximadamente en y=750, con unos 21 px libres antes de la navegación. Sus letras siguen siendo legibles y los filtros conservan su separación visual.

El hallazgo era de prioridad en la primera vista, **no una afirmación de obstrucción permanente**. No se ha usado la posición de navegación en un `fullPage` como prueba de inaccesibilidad.

## Aspectos que sí cumplen

- La composición reemplaza la doble titulación y explicación técnica anteriores por un título principal y una frase breve. La actualización queda separada mediante reglas finas y ocupa menos altura que en R7.
- La continuidad con Tienda es clara: serif en títulos, marrón sobre crema, rojo reservado para énfasis, bordes ligeros y espacio consistente. En 768 y 1440 px las fichas de dos columnas distinguen identidad/estado/importe de detalles prácticos.
- Los cuatro tipos se reconocen por rótulo e icono. Nombre, estado e importe tienen jerarquía propia. Restricciones de cocina, descuentos, condiciones de retiro, datos de visita y referencias siguen visibles en los renders completos.
- El vacío de 390 px tiene una sola acción principal, «Preparar una visita», completamente visible antes de la navegación inferior. La eliminación de adornos superiores mejora su utilidad sin empobrecer la composición.
- Carga, error inicial y error con datos anteriores se distinguen. «Consulta no disponible» no parece una actualización exitosa; «Última consulta disponible» y la alerta explican que los comprobantes pueden estar desactualizados.
- Ayuda cerrada ocupa una fila ligera. Abierta, sus avisos, campos, explicación y acción tienen una secuencia comprensible. El viewport de foco a 320 px y texto 200 % muestra el campo y su contorno de foco completos sobre la navegación.
- Los renders ampliados conservan ajuste de líneas y separación entre secciones. No se observa desborde horizontal. El aumento de longitud vertical al 200 % no se considera por sí solo un defecto.

## Observación no bloqueante

En experiencia aparece «Entrada registrada» como estado y «Entrada registrada a tu nombre» dentro de un aviso. Es una reiteración menor; la segunda frase aporta titularidad, pero ese bloque podría ser más compacto en una revisión posterior.

## Evidencia y límite

Se revisaron los viewport de comprobantes a 320/390/768/1440 px; vacío, carga y ambos errores a 390 px; ayuda respondida; ayuda con foco a 320 px/200 %; y renders completos y viewport con texto ampliado. Esta revisión certifica composición observable, no funcionamiento, persistencia de borradores, semántica accesible ni resultados de pruebas automáticas.

La verificación focal de cierre abarcó `pruebas-compras-cierre/comprobantes-390-viewport.png`, `vacio-390-viewport.png` y `comprobantes-1440-viewport.png`. Confirma el primer nombre y estado completos a 390 px, la acción del vacío despejada y la conservación de la jerarquía de escritorio. No quedan brechas de composición bloqueantes en el alcance revisado.
