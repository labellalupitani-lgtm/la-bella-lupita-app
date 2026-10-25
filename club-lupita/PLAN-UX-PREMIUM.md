# Plan de ejecución UX premium · 13 septiembre 2026

Autorización: crear el plan y ejecutarlo, priorizando una apariencia premium y animada. Alcance: app del socio en `src/casa`; conservar API, precios, idempotencia y aislamiento de cuentas. Sin publicación automática.

| Prioridad | Acción | Criterio de aceptación |
|---|---|---|
| P0 | Entrada honesta, cierre visible y foco de navegación | No solicitar teléfonos sin guardarlos; cerrar por botón, Escape y exterior; navegación sin ocultar contenido |
| P1 | Portada editorial con latte real y acceso directo a carta | Café y pedido antes que módulos secundarios; cuenta compacta y pase accesible |
| P1 | Carta mixta y detalle fotográfico | Productos sin fotografía en filas compactas; foto correcta del latte; búsqueda y carrito conservados |
| P1 | Fidelidad y carnet | Contador hacia nueve; carnet con canto propio; animación solo al recibir un sello nuevo |
| P1 | Reserva guiada | Pasos zona → fecha/grupo/horario → revisión; selección preservada; disponibilidad y cobro del servidor |
| P1 | Tienda y saldo insuficiente | Retirar foto de producto incorrecto; precio, peso y retiro claros; salida útil para recargar |
| P2 | Movimiento y adaptación | Transiciones breves y sin bucles; movimiento reducido; móvil estrecho y escritorio sin desbordamientos |
| Validación | Guardian, TypeScript, regresión y UI aislada | Compras sin duplicar; reserva navegable; diálogos accesibles; capturas de la app real |

## Decisiones de diseño
Paleta y pareja tipográfica existentes. Radio `carnet` para el objeto de socio y radio `editorial` para fotografía/tarjetas destacadas. Sin sombras nuevas. El oro se mantiene como canto o texto sobre verde. CSS para transiciones sencillas: no añadir dependencias ni escenas 3D al flujo de compra. Mantener el formato de app móvil centrada en escritorio; una ampliación del catálogo requiere un diseño separado y evidencia de uso.

## Dependencias externas
- Fotografía real de Reserva de Cosecha y de los productos todavía sin foto: no sustituir por imágenes de otra mercancía.
- Alta por WhatsApp, avisos reales, retos y cola de preparación requieren servicios/datos adicionales. Se eliminan promesas inoperantes; no se simulan.
- Las referencias Mesh y 21st.dev orientan composición y movimiento; no se importa código remoto sin revisión.

## Estado
Implementación local terminada y verificada. Las acciones P0, P1 y P2 de este plan están implementadas, con las dependencias externas expresamente excluidas arriba. Se conserva la app móvil centrada; no se publicó una nueva versión.

## Resultado de la ejecución
- Inicio con latte real, llamada a pedir, accesos, cuenta compacta y promociones sin huecos fotográficos.
- Carta mixta: fotografía cuando existe y filas compactas cuando falta; el detalle muestra la fotografía correspondiente.
- Pase con anverso/reverso y alternativa estática para movimiento reducido; canto dorado separado del texto.
- Tanda cuenta hacia nueve visitas; el sello nuevo se anima al aumentar el recuento de la misma cuenta.
- Reserva en pasos con resumen, vuelta atrás y confirmación final del depósito. El servidor conserva la decisión de disponibilidad y cobro.
- Cierre visible y foco restaurado en paneles; navegación sin desplazamiento provocado por foco.
- Retirados el registro ficticio, el acceso engañoso a avisos, el reto desconectado y la foto de otra mercancía.
- Saldo insuficiente en Tienda y Reserva ofrece acceso a la cuenta y a las instrucciones de recarga.

## Verificación ejecutada
- `npm run build`: TypeScript, guardián de tokens, sondas de reglas y glifos correctos.
- `npm test`: doce grupos de regresión correctos, incluida idempotencia, permisos, membresías, sellos y reservas.
- `npm run test:ui`: quince verificaciones correctas; base PGlite y Worker locales, red externa bloqueada.
- Axe: sin infracciones detectadas en las reglas WCAG A/AA ejecutadas sobre Inicio, Carta, Tienda y Reserva. No equivale a una certificación completa de accesibilidad.
- Anchuras comprobadas: 320, 390 y 1440 px, sin desbordamiento horizontal.
- Pase comprobado con movimiento normal y reducido. La inspección de captura descubrió superposición al cambiar la preferencia; corregida y comprobada de nuevo.
- Capturas reales y resultados: `verificacion-2026-09-13/`. La cuenta mostrada en las capturas es de prueba.
- Respaldo previo de los archivos de trabajo: `respaldo-ux-premium-20260913/`.

## Trabajo posterior que requiere material o servicio
Fotografiar la Reserva de Cosecha y los productos restantes, contratar/conectar el registro personal, implementar avisos y retos con datos, y conectar la cola de preparación. No se presentan como funciones terminadas.


## Publicación autorizada posteriormente
El usuario solicitó enviar a producción. Desplegado en https://club-lupita.el-molino.workers.dev con versión 428d4b98-0b22-460b-9732-5cd3c9436370. JavaScript y CSS coinciden con el build local; catálogo y rutas directas responden HTTP 200. Registro en verificacion-2026-09-13/despliegue-premium.json.
