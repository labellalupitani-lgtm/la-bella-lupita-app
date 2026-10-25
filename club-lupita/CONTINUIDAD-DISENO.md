# Continuidad del diseño

## Actualización vigente — consumo, 22 de octubre, 20:59 Managua

Plan de optimización ejecutado y publicado: versión `78f403bb-85b6-46c2-b918-a9fcad8d2d49`, build `principal-BEnDMr2V.js`. Mínimo Neon 0,25 CU, máximo 2; mantenimiento por fechas pendientes en Durable Objects; demo sólo bajo demanda; limpieza diaria; relecturas de navegación por actividad; monitor de cuota en logs y comprobación separada de datos. Diseño conservado. [Resultado, evidencia y limitaciones](entregables/optimizacion-consumo-2026-10-22/RESULTADO.md).

**Neon sigue bloqueado por la cuota ya consumida. No afirmar recuperación de la app.** Publicación y configuración verificadas; catálogo/datos responden 503. Sin compra de plan ni migraciones SQL. Los estados siguientes documentan momentos anteriores.

## Incidencia vigente — 22 de octubre, noche de Managua

**Diagnóstico profundo completado:** el mantenimiento horario de producción y demostración a mínimo 1 CU es la principal fuente de consumo. Contadores por rama: real 60,52 CU-h, demo 49,21 CU-h, otras 0,77 CU-h. Se reconstruyeron 693 encendidos coincidentes con el horario del cron (aproximadamente 80 % de las ventanas activas reconstruidas, no facturación exacta). Cron introducido el 7 de octubre; previews recientes con PGlite local. [Informe original de diagnóstico](entregables/auditoria-cuota-2026-10-22/INFORME.md). Las optimizaciones posteriores están documentadas en la actualización vigente de arriba.

El diseño sigue publicado, pero Neon rechaza las consultas con HTTP 402 por cuota agotada. Se reproduce el error de cuenta en Chrome y fallan las consultas de catálogo, perfil y cuenta. Plan Free confirmado; cómputo aproximado 110,5 CU-horas. Los endpoints registran suspensión desde las 16:22–16:26, después de la publicación. [Diagnóstico y recuperación](entregables/error-cuenta-2026-10-22/DIAGNOSTICO.md). No se contrató un plan ni se cambió producción durante la investigación. La recuperación requiere ampliar capacidad en Neon o esperar la renovación informada (31 de octubre, 18:00 Managua) y verificarla. Los checks aprobados abajo describen el momento de publicación.

## Estado vigente — producción, 22 de octubre de 2026

- **Publicado:** https://app.labellalupita.com, versión `3cd66007-3eaf-42e2-9b1a-915b51f2fb2e` al 100 %, build `principal-C0W0OOGv.js`.
- **Alcance:** todos los diseños actuales, incluidos Tienda, Mis compras, Mi Club y Perfil con la última composición de cumpleaños. Autorización explícita del usuario para llevar todos los nuevos diseños a producción recibida el 22 de octubre.
- **Verificación:** compilación y ensayo aprobados; 138 comprobaciones locales; en producción, 11 rutas, 176 recursos con hash, 6 comprobaciones de API y 12 vistas públicas aprobadas. Flujos autenticados verificados localmente con datos sintéticos.
- **Operación:** 32 archivos de servidor/configuración sin cambios respecto a la entrega del 12 de octubre; bindings y cron preservados, sin migraciones ni modificaciones de datos de clientes.
- **Entrega y evidencia vigente:** [Publicación completa](entregables/publicacion-diseno-completo-2026-10-22/PUBLICACION.md). La copia congelada está en `entregables/publicacion-diseno-completo-2026-10-22/release/`.
- **Último diseño de Perfil:** [entrega con carácter](entregables/perfil-con-caracter-2026-10-22/). Las vistas locales de ciclos anteriores pueden mostrar versiones anteriores; el destino vigente es el dominio público indicado arriba.

## Historial local anterior a esta publicación

Las referencias a aprobación pendiente, previews y compilaciones que siguen corresponden a su fecha histórica; no describen el estado vigente.

- **Dirección vigente:** conservar cacao/marfil/rosa/borgoña y Playfair Display/Montserrat. Confirmación del usuario: mejorar la versión actual conservando la dirección aprobada.
- **Último ciclo local:** Tienda, Mi Club y Perfil, con cabecera compacta para panel de Windows. [Entrega y pruebas](entregables/experiencia-cuenta-2026-10-21/LEEME.md), [rondas](entregables/experiencia-cuenta-2026-10-21/PROGRESO.md), [comparación](entregables/experiencia-cuenta-2026-10-21/COMPARAR.html).
- **Resultado:** cuatro compilaciones, tres revisores independientes; función/sistema/oficio PASS dentro del alcance documentado. Final principal-B6EbsuoF.js, copia congelada en entregables/experiencia-cuenta-2026-10-21/compilacion. 42 vistas de matriz y 15 de comparación limpia aprobadas; pruebas y límites de rendimiento descritos en la entrega.
- **Diagnóstico resuelto:** la pestaña del usuario conservaba Perfil anterior en 5277; se abrió y capturó Perfil actualizado en 5296. Cabecera a 913 px corregida (183→94px). La nueva preview sirve una compilación fija para evitar que otros builds invaliden recursos de una pestaña abierta.
- **Preview vigente:** http://127.0.0.1:5296/perfil, /tienda y /club. Comparación: http://127.0.0.1:5297/COMPARAR.html. Si hace falta iniciar el servidor: node scripts/vista-previa-diseno.mjs --port 5296 --dist entregables/experiencia-cuenta-2026-10-21/compilacion --experiencia --equipo. Instrucción copiable exacta en LEEME.
- **Pendiente:** validación visual del usuario y aprobación explícita para publicar. No se desplegó este ciclo. Fotografía del lote cuando el negocio la proporcione; la ficha sin foto funciona sin inventar empaque.
- **Siguiente mejora recomendada:** recorrido observado de código de café y compra en teléfono real, incluyendo carga con red móvil. La medición local muestra variación de CLS y no sustituye métricas de campo.

## Ciclo anterior y diagnóstico histórico

### Registro anterior

- **Dirección vigente:** conservar cacao/marfil/rosa/borgoña y Playfair Display/Montserrat. Confirmación del usuario del 21 de octubre: mejorar la versión actual conservando la dirección aprobada.
- **Último ciclo local:** revisión de todas las páginas y doce módulos del equipo. [Vista previa y entrega](entregables/continuidad-modulos-2026-10-21/LEEME.md), [cobertura por módulo](entregables/continuidad-modulos-2026-10-21/COBERTURA.md), [decisiones](entregables/continuidad-modulos-2026-10-21/REGISTRO.md), [comparación](entregables/continuidad-modulos-2026-10-21/COMPARAR.html).
- **Resultado:** doce hallazgos independientes corregidos y revalidados; build final principal-BdaynFmx.js. Pruebas actuales y límites documentados en la entrega.
- **Pendiente:** validación visual del usuario y aprobación explícita para publicar. No se desplegó este ciclo; una autorización anterior no lo autoriza.
- **Siguiente mejora recomendada:** prueba observada de un recorrido de pedido/preparación/entrega con caja y cocina en teléfonos reales.
- **Preview:** node scripts/vista-previa-diseno.mjs --port 5277 --dist dist --equipo. Abrir http://127.0.0.1:5277/__preview. Datos sintéticos y red externa bloqueada.
- **Ciclo previo:** [Carta y búsqueda](entregables/ciclo-carta-2026-10-21/LEEME.md), conservado como base de esta revisión.

## Diagnóstico posterior solicitado por el usuario

El 21 de octubre el usuario indicó que no veía el resultado y que no se miraba bien. La inspección de su navegador integrado confirmó una entrada técnica sin estilo (`/__preview`) y cabecera descompensada en Carta/Perfil a 913 px, un ancho ausente de la matriz anterior. Se abrió Inicio real; la corrección de código queda pendiente. Ver [diagnóstico y evidencia](entregables/diagnostico-panel-2026-10-21/DIAGNOSTICO.md). Este hallazgo posterior impide dar por cerrada la validación visual global; la aprobación técnica previa sigue limitada a los escenarios entonces comprobados.
