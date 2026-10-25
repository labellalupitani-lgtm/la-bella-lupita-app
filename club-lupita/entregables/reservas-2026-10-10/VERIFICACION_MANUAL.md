# Guion de verificación pendiente

Usar un entorno de prueba con inventario y cuentas sintéticos. `node tests/reservas-vista.mjs` ofrece el flujo local en `http://localhost:4189`; no envía correo real. No inventar mesas en producción para poder completar el ensayo.

## Lectores de pantalla

Registrar sistema, navegador y versión del lector. Ejecutar con **NVDA + Edge** y **VoiceOver + Safari**, cada combinación por separado. Las comprobaciones del árbol accesible existentes no sustituyen esta prueba.

1. Abrir Reservar sin sesión y recorrer zonas, fecha, grupo y horarios por teclado. Verificar nombres, orden de foco y contenido de «Hoy».
2. Cambiar zona y grupo. Escuchar una vez el inicio y resultado de cada consulta; comprobar que no se narra repetidamente toda la rejilla.
3. En la terminal del servidor local, introducir `ocupacion-error`; pulsar Actualizar horarios. Debe anunciar el fallo, mantener la selección e impedir confirmar. Introducir `normal` y reintentar: los horarios deben recuperarse.
4. Elegir un horario válido y llegar a Revisión. Al vencer su anticipación mínima debe anunciar su invalidación, impedir confirmar y permitir elegir otra hora. Para una prueba controlada, ajustar el reloj del entorno de QA antes de arrancar la sesión; no cambiar el reloj del equipo de trabajo sin coordinación.
5. Introducir `malformada`, intentar confirmar y verificar que no se anuncia éxito con una respuesta HTTP 200 incompleta. Introducir `normal` y recuperar el mismo intento sin crear otro cargo.
6. Comprobar el foco en cada cambio de paso y en el comprobante tras cambiar o cancelar. Cancelar VIP debe anunciar el reintegro y dejar el importe pendiente en cero.

Resultado por caso: aprobado/fallido/no ejecutado, observación literal del anuncio y evidencia. No marcar una combinación como aprobada por haber probado la otra.

## Ampliación, móvil y voz

- Comprobar 320×568 y móvil horizontal en Lugar, Fecha y grupo, Revisión, saldo insuficiente, error y comprobante.
- Con zoom nativo del navegador al 200% y 400%, verificar que el foco, el primer control útil y las acciones siguen visibles y utilizables. Restablecer el zoom al terminar.
- Aumentar solo el tamaño del texto cuando la plataforma lo permita y comprobar la altura del pie fijo, la lectura de condiciones y la ausencia de solapamientos.
- Con control por voz, seleccionar «Volver», «Actualizar horarios» y el botón principal por su rótulo visible.

## Entrega de correo real

Actualización 10/oct/2026: una prueba autorizada desde el panel de Resend a `hey@creativemk.net` obtuvo `Delivered`. Ver `correo-entrega-real.json`. Lo que sigue pendiente es el recorrido de extremo a extremo de la cola y la comprobación de carpeta por el destinatario; no repetir el mensaje ya enviado.

Antes de enviar, dejar definidos destinatario autorizado, asunto y contenido de una única prueba. Usar datos sintéticos e identificarla como prueba. No elegir automáticamente la dirección de una cuenta administrativa como destinataria.

Verificar aceptación del proveedor, recepción, hora de Managua, estado e importe contra el comprobante. Un fallo de correo no puede cancelar la mesa. Si el resultado es incierto, conciliar con el proveedor antes de recrear una fila o una referencia; la cola conserva una clave estable y detiene reintentos automáticos tras su ventana.

## Rendimiento

Actualización 10/oct/2026: Chrome DevTools MCP ya está habilitado; ver `PERFILADO.md` y `medir-primera-visita.ps1`. Hay mediciones de laboratorio con perfiles limpios y una traza del recorrido sintético completo. Sigue pendiente un teléfono físico y la mejora adicional del LCP móvil.

Medir el recorrido con dispositivo/red descritos y registrar LCP, INP y CLS, incluyendo apertura, cambio de paso y recuperación de error. Separar las mediciones de laboratorio de los datos reales de usuarios. La evidencia de bytes gzip y consulta SQL local disponible en esta entrega no demuestra una latencia de producción.
