# Perfil — A tu manera

Dirección aprobada el 22 de octubre de 2026. Implementación local terminada. Vista nueva: http://127.0.0.1:5330/perfil. Si la sesión de prueba venció, entrar por http://127.0.0.1:5330/__preview/entrar y abrir Perfil. Los resultados de las revisiones están en `PROGRESO.md`.

## Composición

Identidad compacta con inicial, nombre, antigüedad y foto de terraza como acento. La preferencia de bebida domina la primera vista; una ilustración neutral evita asociar el texto libre del cliente con un producto no verificado. Cumpleaños y alergias conservan sus valores y alcance. Tres pestañas llevan a preferencias, cuenta y datos/ayuda.

La edición específica reutiliza el editor y las validaciones existentes. Los cambios pendientes en otros campos se presentan antes de guardar. Conserva versiones, conciliación, recuperación tras respuesta incierta y borrador mientras se permanece en Perfil. Confirmación solo tras respuesta real.

Cuenta muestra el saldo como cifra íntegra y cuatro movimientos recientes, con acceso al historial completo. Ayuda separa avisos, solicitudes previas y elección de motivo; el formulario aparece al elegir y puede cerrarse sin enviar, conservando su borrador en esta pantalla.

## Alcance

- `src/casa/pantallas/Perfil.tsx` y `PerfilExperiencia.css`.
- `src/casa/componentes/CuentaCliente.tsx`: editor focal mediante opción; actividad e historial sin cambios.
- `src/casa/componentes/Atencion.tsx`: ayuda progresiva mediante opción activada solo por Perfil.
- Prueba nueva `tests/perfil-a-tu-manera-ui.mjs`.
- `scripts/vista-previa-diseno.mjs`: únicamente en el escenario sintético `--experiencia`, aclara el concepto de un movimiento de prueba en las respuestas GET de cuenta e historial. No modifica el libro mayor ni los importes.

No cambia el servidor, contratos, precios, dependencias ni datos reales. Mi Club conserva su diseño; el comportamiento previo de ayuda permanece por defecto en las otras pantallas. No hay publicación en producción.

## Comparación y evidencias

Vista anterior conservada en http://127.0.0.1:5320/perfil. Fuentes y compilación anteriores en `antes/`; capturas anteriores de 390 y 1440 px también allí. Marca y referencias observadas: `design-system.md`, `bar.md` y `../investigacion-diseno-2026-10-21/`.

La revisión se hace sobre cuentas sintéticas y Worker/PGlite local, con servicios externos bloqueados. Una captura estática prueba composición, no movimiento ni guardado; esos comportamientos requieren pruebas interactivas. El aviso de vista previa ocupa altura adicional. Las capturas completas pueden incluir la navegación fija a la altura de su viewport.

## Verificación

- `npm run build`: guardianes de tokens/iconos, TypeScript y compilación correctos (`build-r3.log`).
- Prueba específica final: 10 grupos aprobados; edición por campo, validaciones, revisión de borradores de otros campos, confirmación posterior a escritura, saldo e historial, ayuda progresiva y compatibilidad de ayuda directa en Mi Club. Evidencia en `pruebas-r3/resultados.json` y `pruebas-r3.log`.
- 24 combinaciones: las tres pestañas a 320, 390, 768 y 1440 px, con texto normal y al 200 %. Incluye comprobación geométrica por palabra, no solo ausencia de desbordamiento. 78 capturas; nueve informes axe sin violaciones detectadas.
- Indicador de pestaña medido durante su transición; movimiento reducido sin animaciones activas. Revisión humana adicional de teclado, foco, Escape y conservación de borradores.
- Regresión existente `tests/perfil-ui.mjs`: 10 grupos aprobados en Edge y Firefox. Cubre conflictos de versión, respuesta perdida sin duplicar escrituras, lecturas anteriores, contratos inválidos, consentimiento, envío de solicitud sintética y salida sin red.
- WebKit: la ejecución directa alcanza los diez casos, pero falla la comprobación final de errores con tres mensajes de acceso de red al cerrar sesión sin conexión. Al servir los archivos estáticos mediante un interceptor local, la misma regresión aprueba tanto con la compilación anterior como con la nueva. Se conserva este límite del entorno; no se declara aprobada la ejecución directa ni probado Safari en un dispositivo real. Evidencias: `regresion-webkit*.log`, `webkit-anterior.log`, `webkit-nuevo-estaticos.log` y `comparar-webkit.mjs`.

R1 detectó fragmentación de palabras al ampliar texto que la comprobación simple de desbordamiento no encontraba. R2 corrigió la distribución flexible; R3 simplificó el título a «Tus datos y mensajes» y pasó la matriz completa. Los informes y capturas anteriores se conservan para no ocultar las iteraciones.

Las pruebas de accesibilidad automatizadas y la emulación de tamaños no equivalen a una certificación ni sustituyen pruebas con dispositivos físicos. La entrega no cambia reglas comerciales ni publica en producción.

## Reabrir la vista local

Desde la raíz de `club-lupita`:

```powershell
node scripts/vista-previa-diseno.mjs --port 5330 --dist entregables/perfil-a-tu-manera-2026-10-22/compilacion --equipo --experiencia
```

Fuentes finales preservadas en `fuentes/`; huellas de los archivos en `SHA256.csv`. El servidor de vista previa utiliza memoria temporal y no necesita las credenciales de producción.
