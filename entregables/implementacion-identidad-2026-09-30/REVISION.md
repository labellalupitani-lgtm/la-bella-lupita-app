# Identidad implementada · La Bella Lupita

Vista previa: http://127.0.0.1:5213/

La aplicación actual incorpora la identidad V3 en sus módulos de clientes, personal y componentes
La vista previa usa una base de datos efímera con personas, saldos y operaciones sintéticas
La identidad fue publicada el 30 de septiembre de 2026 con autorización del usuario
La comprobación pública fue de lectura, sin compras ni modificaciones de cuentas
Producción: https://club-lupita.el-molino.workers.dev/
Registro y evidencia: `PUBLICACION.md` y `produccion/verificacion.json`

## Qué cambió

- Crema y café como superficies y texto principales, rosa suave para paneles y rosa original para selección
- Logo y retrato originales sin filtros, tipografía Libre Caslon Text con cursiva real y Work Sans
- Inicio con fotografía independiente del texto, carta con jerarquía editorial y Club con carnet crema sobre fondo café
- Botones, formularios, navegación, diálogos, listas, avisos, estados de carga y panel del personal integrados en el mismo sistema
- Textos editoriales sin puntos finales, incluyendo las interpolaciones y la presentación del catálogo local
- Se conservan las animaciones existentes, el movimiento reducido, permisos, importes y flujos de compra
- Los datos escritos por usuarios y los contratos del servidor permanecen intactos

La referencia es una presentación de tres pantallas con contenido de muestra
La aplicación añade los controles reales de reserva, acceso, cuenta, compras y atención — por eso no se exige igualdad literal de todos los píxeles entre la maqueta y una pantalla con distinta información

## Cobertura de funciones

Todas las filas siguientes recibieron el sistema visual
La evidencia distingue capturas de interfaz de pruebas de lógica y permisos — no implica probar todas las combinaciones posibles de datos

| Módulo | Funciones cubiertas | Evidencia |
|---|---|---|
| Navegación | Cabecera, logo, pestañas, menú lateral, estado activo, avatar, carrito, reserva y retorno | Capturas de las diez rutas en 390 y 1440 px, `ui.mjs` |
| Navegación | Enlace de salto, foco, Escape, devolución del foco y cierre de paneles | `ui.mjs`, diálogos en `estados` |
| Estados generales | Carga, respuesta inválida, desconexión, reintento y página inexistente | Kit, `ui.mjs`, captura `no-existe` |
| Acceso | Cuenta de demostración y disponibilidad del acceso personal | `acceso-demo`, `acceso-telefono` |
| Acceso | Teléfono, código, nombre inicial, error de verificación y entrada | `acceso-codigo`, `acceso-error`, prueba de acceso real con servicio OTP simulado |
| Acceso | Código de un solo uso, recuperación por código nuevo y revocación | `operacion.mjs`, formulario reutilizado de acceso |
| Inicio | Saludo, perfil, portada, recomendaciones y accesos rápidos | `inicio-390`, `inicio-1440` |
| Inicio | Saldo pagado y bono, recarga, pase, frente y reverso | `inicio-recarga`, `pase-frente`, `pase-reverso`, `ui.mjs` |
| Inicio | Sellos, progreso, recompensa pendiente y acceso a bolsa mensual | Capturas de Inicio, `premio.png`, regresión de noveno sello |
| Carta | Búsqueda con variantes ortográficas, categorías, destacados, grupos y resultados vacíos | `carta-vacia`, capturas de Pedir, `ui.mjs` |
| Carta | Precio, fotografía, descripción, detalle, cantidad y transición | `producto-detalle`, pruebas de búsqueda y agregado |
| Pedido | Agregar, quitar, contador, carrito, vaciar, saldo y total | `pedido-confirmar`, `ui.mjs`, componentes del carrito |
| Pedido | Pago, confirmación, espera, error y reintento sin duplicación | `pedido-enviado`, `ui.mjs`, `regresion.mjs`, `operacion.mjs` |
| Tienda | Reserva de Cosecha, precio, disponibilidad, confirmación y compra | `tienda-confirmar`, capturas de Tienda, prueba de respuesta perdida |
| Tienda | Sin saldo, agotados, bolsa de membresía y enlaces de regalos | Componentes compartidos, Kit, pruebas de inventario y saldo |
| Club | Identidad del socio y nueve sellos reales en el pase | `club-390`, `club-tanda-completa`, `club-nombre-largo` |
| Club | Membresía activa, ausente, en gracia y sin renovación | `club-sin-membresia`, `club-en-gracia`, `club-sin-renovacion` |
| Club | Inscripción, saldo insuficiente, cuota, renovación y cancelación | `club-sin-saldo`, `membresia-cancelacion`, regresión de plazas y consentimiento |
| Club | Premio pendiente, emisión de código, vencimiento y conservación del premio | `premio.png`, `caja-vale`, regresión de noveno sello y renovación de código |
| Beneficios | Bebida diaria, bolsa mensual, solicitud y presentación del código | `beneficio-codigo`, `caja-beneficio`, `operacion.mjs` |
| Experiencias | Cupos, detalle, precio, confirmación, compra y butaca | `experiencia-confirmar`, `compras-todos-los-tipos`, regresión de idempotencia |
| Reservas | Zona, fecha, personas, horarios y disponibilidad | Capturas de Reservar y recorrido guiado en `ui.mjs` |
| Reservas | Retroceso conservando selección, revisión, confirmación y conflictos | `premium-reserva.png`, `ui.mjs`, `regresion.mjs` |
| Perfil | Nombre, nivel, cumpleaños, alergias, bebida y preferencias disponibles | Capturas de Perfil, `perfil-editar` |
| Perfil | Edición y persistencia de los datos | Guardado comprobado desde la interfaz y consulta posterior a API, `cuenta-cliente.mjs` |
| Cuenta | Saldo, recarga, movimientos, filtros y paginación | `perfil-actividad`, `cuenta-cliente.mjs` |
| Perfil | Compartir enlace, acceso a compras y cierre de sesión | Componentes del perfil, prueba de cierre de sesión sin conexión |
| Compras | Pedidos, reservas, bolsas, experiencias, fechas, estados y comprobantes | `compras-todos-los-tipos`, `operacion.mjs` |
| Compras | Actualización, paginación y cancelación de reserva permitida | `reserva-cancelacion`, pruebas de permisos y depósito |
| Atención | Avisos, lectura, envío de solicitud, respuesta y privacidad | `compras-y-ayuda`, `atencion-resuelta`, `operacion.mjs` |
| Personal | Acceso individual, propietario, demostración, errores y cierre de turno | Captura de acceso, ingreso real con credenciales efímeras para los tres roles |
| Personal | Separación de permisos de caja, cocina y encargado | `personal-caja`, `personal-cocina`, `personal-encargado`, aserciones UI y API |
| Pedidos internos | Recibido, aceptado, preparando, listo y entregado | `pedido-aceptado`, `cocina-preparando`, `cocina-listo`, `pedido-entregado` |
| Pedidos internos | Cancelación con motivo y devolución exacta | `personal-cancelacion`, regresión de saldo y puntos |
| Caja | Búsqueda de cliente, consulta de saldo y validación | `personal-caja-cliente` |
| Caja | Referencia, recarga tras pago recibido, límites y éxito | `caja-recarga`, prueba de registro desde UI, `regresion.mjs` |
| Caja | Sello por ticket, confirmación y prevención de duplicación | `caja-sello-registrado`, `operacion.mjs` |
| Canjes | Consulta y entrega de beneficio, códigos usados o inválidos | `caja-beneficio`, pruebas de uso único y permisos |
| Canjes | Consulta, vigencia y entrega del vale de la décima | `caja-vale`, pruebas de renovación, vencimiento y uso único |
| Entregas | Bolsa, asistencia, confirmación y agenda de próximas mesas | `bolsa-entrega`, `experiencia-asistencia`, bandejas del personal |
| Atención interna | Solicitudes, respuesta y cierre | `atencion-resuelta`, prueba de envío y resolución desde UI |
| Encargado | Métricas operativas y actualización | `personal-encargado-1440`, pruebas de cómputo y permisos |
| Equipo | Alta, rol, contraseña inicial y desactivación | `equipo-formulario`, `equipo-clave-oculta`, `equipo-desactivado` |
| Kit | Botones, estados, carnet, pase, sellos, progreso, avisos, listas, búsqueda, productos, métricas y paneles | Capturas completas de Kit en móvil y escritorio |

## Calidad verificada

- Compilación TypeScript, guardián de tokens y construcción de producción correctos
- Suites existentes de regresión, cuenta del cliente, operación y UI correctas
- 51 escenarios visuales con captura, comprobación de geometría y análisis WCAG por ejecución ampliada
- Ejecuciones ampliadas en Edge y WebKit, además de una ejecución iniciada en escritorio
- Diez rutas capturadas en 390 y 1440 px, incluidas personal, kit, compras y página inexistente
- Nueve anchos adicionales revisados en nueve rutas: 320, 360, 430, 768, 899, 900, 1024, 1120 y 1121 px
- Orientación horizontal y aumento real del tamaño de los textos al 200 %
- Sin desbordamientos, imágenes rotas ni hallazgos automatizados de accesibilidad en las capturas registradas
- Comparación visual de Inicio, Carta y Club a 390 px, con mediciones de tipografía, imágenes y geometría
- Caché comprobada mediante recarga de una pestaña abierta, HTML sin caché y referencias a recursos con hash
- Los archivos compilados del legado mantienen exactamente sus nombres de hash y tamaños originales

Contrastes calculados desde los tokens:

| Combinación | Contraste |
|---|---:|
| Café sobre crema | 11,46:1 |
| Texto secundario sobre crema | 6,03:1 |
| Café sobre rosa suave | 10,18:1 |
| Contorno funcional sobre crema | 3,88:1 |
| Error sobre rosa suave | 6,40:1 |
| Éxito sobre crema | 6,45:1 |
| Foco sobre crema | 6,43:1 |

La hoja CSS principal pasa de 14,44 kB gzip a aproximadamente 14,85 kB
El JavaScript principal se mantiene alrededor de 38,42 kB gzip, frente a 38,51 kB de la línea base
Se añade la cursiva real autoalojada y no se incorpora ninguna biblioteca nueva al producto
Las mediciones locales de carga y estabilidad quedan en `entrega.json`; no equivalen a una prueba sobre red móvil real ni a una comparación temporal de rendimiento antes/después

## Evidencias y reproducción

- `base/`: código y capturas de la aplicación antes del cambio
- `capturas/`: diez rutas en móvil y escritorio y resultados de accesibilidad
- `estados/resultados.json`: recorrido ampliado en Edge
- `estados/webkit/resultados.json`: recorrido ampliado en WebKit
- `estados/escritorio/resultados.json`: recorrido ampliado comenzando en escritorio
- `comparacion/comparacion.html`: referencia e implementación colocadas lado a lado
- `comparacion/mediciones.json`: geometría y tipografía de las tres portadas
- `entrega.json`: contraste, caché, recursos y mediciones locales
- `textos-revisar.json`: registro de la migración inicial de cadenas editoriales

Desde `club-lupita`:

```powershell
npm run guardian
npm run check
npm test
npm run build
npm run test:ui
node tests/identidad-ui.mjs
$env:NAVEGADOR='webkit'
node tests/identidad-ui.mjs
```

Para abrir nuevamente la vista aislada después de reiniciar el equipo: `node tests/preview-operacion.mjs`

## Límites y revisión del usuario

WebKit automatizado no sustituye una revisión en un iPhone físico
No se probaron teclado virtual ni barras de navegador en dispositivos iOS o Android físicos
Los estados de inventario, datos externos y permisos tienen pruebas de lógica adicionales a las capturas; no se afirma cobertura de todas sus combinaciones posibles
La calidad final de la dirección visual queda para revisión del usuario sobre la aplicación funcional
La publicación fue autorizada y completada — ver `PUBLICACION.md`
