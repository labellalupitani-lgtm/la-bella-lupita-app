# Continuidad de todos los módulos · 21 de octubre de 2026

## Objetivo vigente
El usuario pide continuar por cada módulo y página de la aplicación. Se conserva la dirección aprobada; los ciclos no autorizan producción. El ciclo anterior de Carta está integrado y es la base, no la totalidad de este objetivo.

## Alcance y comprobación
- Cliente: Inicio, Carta/detalle, Tienda, Mi Club, Conocé tu club, Perfil, Mis compras, Mis reservas y Reservar.
- Acceso y sistema: ingreso/alta por correo, carga/error/sin sesión, ruta desconocida, Kit, navegación, formularios y diálogos.
- Equipo: Resumen, Pedidos (incluidos disponibilidad/fichas/métricas), Caja (cuatro pestañas), Club (condiciones/reglas/reposiciones/experiencias), Tienda, Entregas, Agenda/configuración, Atención, Informes, Clientes, Equipo y Seguridad/acceso; propietario, encargado, caja y cocina.
- Estados: carga, vacío, error, éxito, selección, teclado, texto ampliado y tamaños móvil/tablet/escritorio. Los escenarios transaccionales usan bases sintéticas.

## Método y estado
1. Se preservó `src/casa` y el build vigente en `antes/`.
2. Tres árbitros independientes revisan conjuntos separados; no implementan cambios de producto. Las previews de diagnóstico usan el build preservado y bases en memoria distintas.
3. El constructor corrige hallazgos y ejecuta regresión apropiada. Cada conjunto requiere revalidación del árbitro antes de cerrarse.
4. El cierre completo exige matriz por módulo, evidencia transversal de la compilación final, instrucciones de preview, comparativas y límites explícitos. Una revisión parcial no cierra el objetivo.

Estado: completado técnicamente en local. Pendiente la validación visual del usuario. Producción sin cambios de este ciclo.

## Cierre del ciclo

- Se corrigieron los doce hallazgos de los tres árbitros: C1–C5, CU-01–CU-04 y H1/E1,H2/E2,H3. Los tres informes finales aprueban lo comprobado, con límites explícitos.
- La revisión del constructor añadió foco a la región desplazable de DetalleCarta. El error de contrato de Tienda recibió un mensaje neutral para no inventar una referencia ante una respuesta 200 incompleta; Comercio revalidó esa adenda.
- Cambios de producto en 17 archivos dentro de src/casa; sin dependencias nuevas ni cambios de reglas/precios o del servidor. CAMBIOS.json identifica los archivos y sus hashes.
- Compilación de la revisión principal: D7uKApT5. Compilación final tras la adenda de Tienda: BdaynFmx. Ambas pasan build; el mensaje final tiene regresión dirigida y adenda independiente.
- npm test completo:21 suites con código 0. Regresiones UI y cobertura por módulo registradas en LEEME.md y COBERTURA.md. No se reciclaron resultados antiguos como comprobaciones actuales.
- Peso gzip de todos los JS:+1023 bytes (0,55%); CSS:+79 bytes. Esta medición no acredita Core Web Vitals ni velocidad en teléfonos físicos.

## Trazabilidad de las pruebas

La suite histórica Conocé todavía buscaba el título de acceso «Tres generaciones» y un enlace anterior al diseño ya aprobado. Se actualizaron esos dos selectores a las etiquetas vigentes y se repitió completa; el intento inicial queda en evidencia/conoce-club-selector-antiguo.log. Las nuevas pruebas se ajustaron para esperar el fin real de la consulta, preparar la reserva sintética antes de migrar la sesión y localizar el textarea por su rol accesible; esos fallos del arnés no se presentan como defectos del producto.

La suite exploración Carta aún tenía una salida fija y regeneró accidentalmente la carpeta exploracion-build del ciclo anterior. Se añadió EVIDENCIA_DIR y se copió la nueva evidencia a este ciclo. La carpeta anterior tiene una nota de reejecución y no debe presentarse como evidencia inmutable del build anterior. Sus informes originales y las demás capturas permanecen conservados.

## Próximo ciclo

Esperar validación visual del usuario antes de publicar. Recomendar una prueba observada con caja y cocina en teléfonos reales; continuar desde dificultades verificables, conservando la dirección aprobada. No quedan defectos críticos o importantes abiertos dentro de los hallazgos revisados; los límites no comprobados permanecen explícitos en los informes.
