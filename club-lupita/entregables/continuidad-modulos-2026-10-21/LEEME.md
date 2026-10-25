# Continuidad de toda la aplicación · 21 de octubre de 2026

Se revisaron todas las rutas y los doce módulos del equipo conservando la dirección visual aprobada: cacao, marfil, rosa y borgoña, Playfair Display/Montserrat, composición y componentes vigentes. Los cambios están integrados en el proyecto y compilados. Este ciclo no se publicó en producción.

## Abrir y probar

- [Selector de la vista previa](http://127.0.0.1:5277/__preview): cliente, visitante y propietario/encargado/caja/cocina. La franja superior identifica los datos de prueba.
- [Entrar como cliente de prueba](http://127.0.0.1:5277/__preview/entrar).
- [Comparación antes/después](COMPARAR.html).

El servidor debe seguir abierto en esta computadora. Si se detiene, desde la carpeta `club-lupita` ejecutar:

```powershell
node scripts/vista-previa-diseno.mjs --port 5277 --dist dist --equipo
```

La preview usa el Worker real con una base PGlite en memoria y cuentas sintéticas. No lee credenciales de producción ni variables `.env`; bloquea la red externa. No envía correos ni mensajes reales. Sus cambios se pierden al reiniciar. Para comparar la versión anterior se conserva `antes/dist`; puede iniciarse con el mismo comando, puerto 5271 y `--dist entregables/continuidad-modulos-2026-10-21/antes/dist`.

Recorridos sugeridos: como visitante abrir la foto de Latte e ingresar/volver; como cliente consultar Perfil con texto ampliado y preparar una visita; como propietario entrar a Agenda y buscar/limpiar filtros en Atención o Clientes. El registro por correo real queda deshabilitado en esta preview; el alta completa se verificó en una fixture aparte con correo simulado.

## Qué mejoró

- Carta pública explica cuándo hace falta ingresar, ofrece la acción y conserva producto, búsqueda y categoría. Agotado y pedido pendiente tienen mensajes distintos. El contenido desplazable del detalle admite teclado.
- Cambiar una visita distingue fallo de consulta y falta de horarios, permite actualizar y retira el error cuando se recupera. Consultar no altera la reserva original.
- Tienda termina correctamente la carga fallida y solo anuncia una referencia cuando existe. La consulta debe recuperarse antes de habilitar otra compra; se conserva un intento conocido.
- Perfil acomoda títulos largos al 200 %, mantiene el campo enfocado por encima de la navegación y distingue errores de lectura de avisos de errores al enviar ayuda. Actualizar avisos conserva el borrador y un error de envío pendiente. Mi Club usa singular para un sello o premio.
- Reservar acomoda el pie de fotografía y las acciones en pantallas estrechas. El botón de confirmación ya no parte las palabras en seis líneas al ampliar el texto.
- Equipo apila la actualización cuando hace falta espacio, devuelve el foco al buscador al limpiar filtros y identifica cada sección en el título de la pestaña.

Inicio, Conocé tu club, Mis compras, Kit y las secciones sin hallazgos específicos conservaron su diseño tras la revisión. La [matriz de cobertura](COBERTURA.md) diferencia las pruebas visuales, los recorridos funcionales y sus límites.

## Validación

- Compilación final `principal-BdaynFmx.js`: TypeScript, guardianes de diseño/iconos/tokens y Vite correctos.
- `npm test`: las 21 suites de servidor finalizaron con código 0, incluidas autorización, operaciones, compras, reservas/reembolsos, correo y perfil.
- Matriz de 23 vistas: 138 registros, cuatro anchos (320/390/768/1440), texto 200 % a 320 y axe A/AA. Sin desbordes globales, imágenes rotas ni errores de ejecución detectados. Las regiones internas se revisaron además con teclado y medidas dirigidas.
- Suites actuales de UI: Carta: 14; exploración: 8; Tienda: 14; Mi Club: 24; Conocé: 21; Perfil: 10; Inicio: 17; seguridad: 7 comprobaciones registradas; acceso por correo también pasó. Los totales incluyen casos por motor cuando corresponde; no son una certificación exhaustiva.
- Nuevas regresiones: cinco grupos de acceso público/alta con correo simulado y cinco de estados de Tienda, reservas y ayuda, más foco natural en Perfil.
- Tres árbitros independientes revisaron antes, comunicaron hallazgos y revalidaron las correcciones. [Comercio](revision-comercio-final.md), [cuenta y sistema](revision-cuenta-final.md), [equipo](revision-equipo-final.md).

La matriz y las revalidaciones principales usaron `D7uKApT5`. Después se cambió únicamente el texto de error de contrato de Tienda para cubrir una respuesta 200 incompleta. La build final `BdaynFmx` tiene esa adenda revalidada por Comercio y por las nuevas regresiones; también se recorrieron sus23 vistas para comprobar los recursos finales. No se presenta como repetida una operación que no se repitió.

El total de JavaScript compilado, comprimido por archivo, pasó de 185577 a 186600 bytes (+1023; 0,55 %). CSS pasó de 37905 a 37984 (+79). No se añadieron dependencias, fuentes ni imágenes. Es una comparación de peso, no una medición de velocidad en red móvil ni de Core Web Vitals. [Medición](evidencia/peso-compilacion.json).

## Pendientes y siguiente mejora

Falta tu validación visual de esta entrega y tu aprobación explícita si querés publicarla. No hay fallos críticos o importantes abiertos entre los hallazgos reproducidos y revisados. No se comprobaron dispositivos físicos, lectores de pantalla ni envío real de correo, WhatsApp, pagos o trabajo físico de caja/cocina. Los límites por módulo están en la matriz y los informes; los datos sintéticos no certifican la configuración real del negocio.

La siguiente mejora recomendada es validar con una persona de caja y una de cocina un recorrido completo en sus teléfonos: ingreso, pedido, preparación y entrega. Conservar esta dirección visual y priorizar las dificultades observadas allí.

Fuentes conservadas en `antes/casa`, cambios actuales identificados en [CAMBIOS.json](CAMBIOS.json), decisiones en [REGISTRO.md](REGISTRO.md) y resultados reproducibles en `evidencia/`. No existe repositorio Git en este directorio; la entrega está integrada en los archivos locales, sin commit ni PR.

Para abrir la comparación en el navegador: `node entregables/continuidad-modulos-2026-10-21/SERVIR-COMPARACION.mjs` y visitar http://127.0.0.1:5278/COMPARAR.html. Este servidor solo lee esta entrega y escucha en127.0.0.1.
