# Datos para cerrar C20

Revisión adicional: 9 de octubre de 2026. El código coincide con el manifiesto publicado; la API devuelve 73 productos y todavía ninguna ficha con información revisada. Evidencia: `evidencia/revalidacion-c20.json`.

La [carta oficial](https://labellalupita.com/menu?filter=cafe) se revisó renderizada, incluida la ficha de Pizza Cuatro Estaciones. Su descripción tampoco identifica los sabores ni el tamaño. Buscar esos datos en el HTML inicial no serviría como prueba: el sitio entrega un contenedor que carga la carta después.

Esta lista prioriza la ambigüedad de elección, las opciones obligatorias y los destacados actuales. **No es un ranking de ventas ni de margen**: no se dispone de datos suficientes para afirmarlo. Cocina o el propietario pueden cambiar el orden.

| Producto | Información disponible | Dato que falta confirmar |
|---|---|---|
| Pizza Cuatro Estaciones | El sitio anuncia cuatro sabores sin identificarlos. | Los cuatro sabores y sus componentes; diámetro; cantidad de cortes o personas orientativas; foto vigente. |
| Pizza Churrasco | La descripción oficial incluye carne a la parrilla, mozzarella y chimichurri. | Diámetro; cortes; acompañamientos adicionales si existen; fotografía representativa. |
| Ensalada Lupita | La descripción oficial menciona vegetales, penne, parmesano, aderezo y elección de camarón, pollo o res. | Porción; qué incluye cada variante; si el precio publicado cubre las tres opciones; foto vigente. |
| Risotto de Gallo Pinto | La descripción oficial señala huevo a elección, aguacate y tortilla. | Porción y cantidad de huevo; preparaciones que cocina admite; foto vigente. |
| Latte | El sitio identifica la bebida, sin volumen de servicio. | Mililitros u onzas de la bebida servida; tamaños disponibles; foto vigente. |
| Delicias de la Abuela | El sitio describe un postre de mango ahumado. | Porción/unidad y componentes que definen la elección; foto vigente. |
| Espresso | El código de la app menciona 30 ml y 26 segundos; la ficha pública revisada no acredita esas medidas. | Validar volumen servido y retirar o corregir cualquier precisión de preparación que no sea una regla real. |

## Respuesta mínima por producto

Se pueden completar estos campos en un mensaje o directamente en **Personal → Pedidos → Fichas verificadas con cocina**:

- Producto:
- Porción o tamaño servido:
- Componentes confirmados:
- Opciones y cualquier diferencia de precio:
- ¿La fotografía actual corresponde al producto servido?: sí / no / falta comprobar.
- Responsable de la verificación y fecha:

No hacen falta garantías dietéticas para completar las fichas. No se inferirán «sin gluten», «vegano» ni ausencia de alérgenos de una lista parcial. Los tamaños y componentes se publicarán únicamente cuando exista información comprobada. Si una opción requiere un suplemento que hoy no figura, se tratará como cambio comercial explícito y deberá verse en la cotización antes de cobrar.

## Qué ya está preparado

El editor valida longitudes, exige confirmar la revisión, registra fuente, responsable y fecha, controla conflictos de versión y publica los datos de decisión. La foto sin verificación se presenta como referencia. Las pruebas del editor y su API ya pasaron. Este pendiente se refiere al contenido real, no a una autorización para programar ni a una nueva aprobación del despliegue.

## Evidencia y alcance

- Carta oficial renderizada: consulta pública del 9/10/2026, sin agregar productos, enviar mensajes ni pedidos.
- Ficha oficial abierta: Pizza Cuatro Estaciones, C$550, sin enumeración de sabores ni medidas.
- Archivos revisados: `src/data/menu.ts`, `PLAN.md`, `SPEC.md` y evidencia original de C20. La mención histórica de fotografías reales en PLAN.md no comprueba por sí sola que representen el producto servido actualmente.
- No se modificaron fichas ni datos de producción en esta continuación.

Una vez recibidos los datos faltantes, el siguiente paso será registrarlos con su fuente, comprobar su aparición pública y actualizar la matriz C20. Hasta entonces, el objetivo completo continúa pendiente.
