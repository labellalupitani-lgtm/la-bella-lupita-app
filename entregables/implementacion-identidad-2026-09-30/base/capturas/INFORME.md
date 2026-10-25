# Correcciones publicadas · 13 de septiembre de 2026

Aplicación: https://club-lupita.el-molino.workers.dev

Versión Cloudflare: `abcfa80f-41db-409f-9353-335bd7980b6a`.

## Defectos corregidos

1. Reservas válidas: se sustituyó el bloqueo inválido de COUNT por un bloqueo transaccional por zona. La disponibilidad comprueba toda la duración y descarta respuestas antiguas.
2. Compras duplicadas: la referencia se conserva por cuenta y operación después de navegar o recargar. El recibo se guarda con el cargo en una única transacción y el reintento devuelve la misma bolsa o butaca.
3. Noveno sello: los premios pendientes llegan en la API y tienen un botón de canje visible.
4. Vales: emitir un código no consume el premio. El código vencido puede renovarse; sólo entregarlo desde caja cierra el premio. Se recuperaron los premios emitidos pero no utilizados.
5. Caja: el cobro usa la cuenta indicada por el personal autorizado. Los socios siguen pudiendo cargar únicamente su propia cuenta y con precios del servidor.
6. Membresías vencidas: no permiten beneficios. Las renovaciones requieren consentimiento explícito, saldo suficiente y producen un único cargo. No se cobran períodos históricos sin servicio.
7. Salida sin conexión: elimina inmediatamente la sesión y los datos visibles; las respuestas antiguas no restauran una cuenta cerrada. El pedido se separa por cuenta.
8. Puntos: la migración admite identificadores del historial y la API entrega el puntaje real.
9. Cancelación: permite desactivar y reactivar la renovación con confirmación, conservando el período pagado y mostrando su estado real.
10. Recargas: crédito y bono son atómicos. Reutilizar una referencia con otro importe devuelve 409.
11. Respuestas inválidas: una respuesta 200 que no cumple el contrato presenta un error recuperable.
12. Cumpleaños: el día se muestra sin desplazamiento por zona horaria.

También se actualizaron dependencias; se aisló la demo en una rama Neon propia; Vite apunta por defecto a la API local; y el script destructivo anterior exige una base de pruebas y autorización explícita mediante variables de entorno.

## Verificación

- `npm test`: 11 grupos de regresión de API y SQL correctos, con datos sintéticos locales.
- `npm run test:ui`: 8 comprobaciones de interfaz correctas, incluida respuesta perdida, recarga de página, cierre sin conexión y cumpleaños. Vistas comprobadas a 360 y 1440 píxeles sin desbordamiento horizontal.
- `npm run build`: TypeScript, guardianes y compilación correctos.
- Rama temporal de Neon: migraciones sobre copia real, reservas simultáneas y compras simultáneas correctas. La rama se eliminó al terminar.
- Aislamiento: una reserva demo se escribe sólo en su rama; falta de binding demo devuelve 503. No se modifica el entorno compartido.
- `node tests/publicacion.mjs`: salud pública, protección de API, acceso demo, puntos y navegación pública correctos. No se hicieron cobros de clientes para validar producción.

Los archivos `ui.json` y `publicacion.json` conservan resultados, sin credenciales. Las pruebas de Neon son utilidades de esta intervención y requieren ramas aisladas nuevas antes de volver a ejecutarlas; no deben apuntarse a producción.

## Operación y límites

Las migraciones 009 y 010 se aplicaron antes del Worker; 011, después de publicar. Se conserva un respaldo del código y una rama Neon previa a las migraciones, sin endpoint de cómputo. La demo sí conserva su endpoint independiente.

Cloudflare rechazó el cron por tener ocupados los cinco temporizadores del plan gratuito. La versión final no configura un cron: mantiene las membresías al consultar la cuenta, solicitar beneficios o gestionar altas. La renovación no se ejecuta a una hora garantizada mientras nadie utiliza esos flujos. No se cambió el plan ni se modificaron tareas de otros proyectos. Las membresías antiguas no reciben cargos nuevos hasta registrar consentimiento en la app.

Esto corrige los doce defectos reproducidos, pero no completa las funciones de producto ausentes: alta real por WhatsApp, cola operativa de pedidos, panel nuevo con roles, edición de perfil, retos y reglas de regalos/referidos. Las credenciales aportadas no incluyen un proveedor de WhatsApp. La cuota publicada sigue siendo C$950; no se cambió unilateralmente la cifra de negocio. Los límites de intentos del personal y la concurrencia del OTP siguen requiriendo una revisión adicional antes de habilitar altas reales.

La revisión automática de interfaz no equivale a una certificación completa de accesibilidad ni a una prueba de carga.
