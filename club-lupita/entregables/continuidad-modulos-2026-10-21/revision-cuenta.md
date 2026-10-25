# Revisión independiente inicial — cuenta y sistema

21 de octubre de 2026. Árbitro `/root/revision_cuenta`, sin participación en la implementación. Se preserva la dirección visual aprobada; esta revisión busca fallos verificables, no propone otra estética.

## Entorno y método

- Preview exclusiva congelada `http://127.0.0.1:5272`, backend PGlite sintético, señal visible de datos de prueba y bloqueo de solicitudes externas. Ninguna operación de producción ni correo real.
- Microsoft Edge/Chromium mediante Playwright y Chrome DevTools. 320, 390, 768 y 1440 px; texto al 200% mediante tamaño raíz en320; emulación móvil320 para editor. Revisión visual de capturas390/1440, teclado Tab/Enter/Escape y estados sintéticos.
- Matriz base:28 combinaciones de página/ancho, siete pasadas con texto200, sin imágenes rotas ni errores JavaScript. Axe WCAG A/AA no encontró infracciones automáticas en esas vistas. Eso no sustituye revisión manual.
- Evidencia: `evidencia/arbitro-cuenta/resultados.json`, `estados.json`, `detalles.json` y capturas del mismo directorio. Scripts `auditar-cuenta*.mjs` reproducen inspecciones; no modifican producto ni ejecutan build.

## Hallazgos que deben corregirse

### CU-01 · P2 · Perfil desborda a320 con texto200

**Falla/dónde:** `Perfil`, encabezado `.perfil-privacidad h3.t-seccion`, «Comunicaciones y tus datos». Su caja mide288px pero el texto exige345px; el documento alcanza361px frente al viewport320.

**Reproducción:** ingresar con cuenta sintética, abrir `/perfil`, viewport320, `html{font-size:200%}`. No requiere abrir editor. En emulación móvil el layout viewport llega a362px y también ensancha el diálogo de edición, cortando el extremo derecho de campos y Cerrar.

**Impacto:** lectura cortada y desplazamiento horizontal accidental para personas que amplían texto; afecta después los paneles móviles.

**Corrección:** permitir quiebre de palabras largas en los encabezados del perfil sin reducir el texto. Verificar `scrollWidth===clientWidth` y diálogo móvil dentro de320.

**Evidencia:** `estados.json` (`perfil-texto200`, `editor-texto200`), `perfil-texto200.png`; captura móvil inspeccionada en DevTools. La captura `editor-texto200.png` es desktop320: allí el panel sí cabe, aunque el documento de fondo desborda.

### CU-02 · P2 · La navegación tapa parte del campo de ayuda enfocado

**Falla/dónde:** `/perfil`, textarea «Contanos qué necesitás»,320×844, texto200.

**Reproducción:** cargar Perfil, volver arriba, recorrer con Tab desde el inicio hasta el textarea, sin desplazarlo manualmente. En la primera pasada su rectángulo fue y596–726 y la barra inferior empieza en685:41px tapados. Tras añadir avisos sintéticos, se reprodujo y584–714,29px tapados.

**Impacto:** el foco es visible pero parte del área donde se escribe queda bajo la barra fija. El enfoque directo con scroll previo sí puede colocarlo correctamente; por eso la prueba requiere el recorrido natural.

**Corrección:** aplicar el mismo despeje de la navegación fija que usa Inicio a los controles de las demás pantallas, respetando el alto real de la barra al crecer el texto.

**Evidencia:** `detalles.json` (`textarea-tab-natural`) y `ayuda-tab-natural.png`.

### CU-03 · P2 · Ayuda conserva un error de lectura después de recuperarse

**Falla/dónde:** componente `AtencionCliente`, presente en Perfil y Mi Club.

**Reproducción:** interceptar GET `/api/atencion` con503 y abrir Perfil. Restablecer la respuesta real de la preview y pulsar «Actualizar avisos». Se cargan las solicitudes (dos en la prueba), pero permanece la alerta del503.

**Impacto:** se informa que la lectura falló aun cuando los datos ya están actualizados; el usuario no puede distinguir un fallo vigente de uno resuelto.

**Corrección:** limpiar el error de lectura cuando la lectura se recupera. Mantener separado el error de envío para no ocultarlo al actualizar avisos.

**Evidencia:** `detalles.json` (`ayuda-read-error`, `ayuda-read-recovery`) y `ayuda-error-persistente.png`.

### CU-04 · P3 · Singular incorrecto en los sellos

**Falla/dónde:** Mi Club, «Tu próxima bebida», cuenta con8/9 sellos: «Te faltan 1 sellos.»

**Reproducción:** abrir `/club` con la cuenta sintética inicial. No requiere interacción.

**Impacto:** texto incorrecto en una función principal y discrepancia con Inicio, que presenta el singular correctamente.

**Corrección:** «Te falta 1 sello»; aplicar singular también a 1 premio pendiente.

**Evidencia:** `club-390.png`, `club-1440.png` y snapshot DevTools.

## Cobertura por página

| Página | Verificado | Límites |
|---|---|---|
| Inicio `/` | Matriz responsive/texto200, jerarquía/fotos/CTA, navegación teclado, saldo privado y persistencia al recargar, pase y recarga informativa | No se certifica entrega real ni recarga en caja; estados comerciales usan fixture |
| Mi Club `/club` | Matriz, beneficio/código con vencimiento y cierre Escape, foco en modal, renovación y cancelación sintéticas, consentimiento antes del pago, compra de entrada sintética exitosa, vacío de experiencias | No se ejecutó entrega física del beneficio, agotamiento real, renovación cron ni canje de premio; contratos históricos permanecen como datos de prueba |
| Conocé tu club `/conoce-tu-club` | Matriz, seis FAQ abren/cierran con Enter, error503 de condiciones y reintento recuperado, enlaces hacia Club/carta/reserva inspeccionados | No se auditan reglas de negocio nuevas ni se cambia contrato |
| Perfil `/perfil` | Matriz; edición inválida enfoca nombre; guardar confirma/cierra; actividad12 movimientos, filtro vacío,503 y reintento; ayuda422 conserva borrador y envío exitoso; cerrar sesión vuelve al acceso; carga/error de perfil inspeccionados | No se repitieron conflictos entre dispositivos ni todas las sesiones reales; suites existentes de perfil se leyeron como apoyo, no se contabilizan como ejecutadas |
| Acceso/Umbral | Matriz pública, deshabilitado con reintento;503 de capacidades, recuperación; código inválido y paso de perfil con foco en encabezado; ambos pasos sin overflow a320 texto200 | Código/registro simulado interceptando respuestas; no hay envío ni autenticación de correo real |
| Kit `/kit` | Matriz y axe; componentes, estados, jerarquía y muestras visuales | Galería interna de componentes: sus botones de ejemplo no se contabilizan como operaciones de negocio |
| Ruta desconocida | Matriz, mensaje claro y botón «Volver a la casa» navega a `/` | No es un test de reglas del servidor para rutas de API |

## Resultado inicial

No se detectaron fallos críticos. Hay tres fallos moderados de accesibilidad/recuperación y un detalle de texto por corregir. La revisión inicial no aprueba el cierre técnico hasta revalidar esos cambios. La aprobación técnica tampoco autoriza publicación ni reemplaza la aprobación visual del usuario.

Los scripts tuvieron dos ajustes de sincronización (esperar React y terminar una petición interceptada antes de quitar su ruta) y uno de etiqueta de botón. Esos fallos del arnés no se atribuyen al producto. La evidencia final de cada ejecución completada se guarda en los JSON señalados.
