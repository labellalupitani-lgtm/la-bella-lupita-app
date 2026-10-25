# Equipo: extensión de la dirección aprobada

Implementación del 21 de octubre de 2026. Lista para revisión independiente; no acredita aún el cierre integral de todos los estados operativos. No se modificaron Worker, contratos, permisos ni condiciones económicas. No se desplegó.

## Qué cambia

| Superficie | Cambio y propósito |
| --- | --- |
| Shell de los cuatro roles | Navegación agrupada por Servicio, Gestión y Tu cuenta. En móvil, botón de secciones con selección visible, cierre al navegar y Escape con retorno de foco. Barra lateral en el flujo de escritorio: respeta el aviso local y la reserva del logo. Estado de conexión y bloqueo/cierre siguen disponibles. |
| Resumen | Indicadores con cifra, contexto y destino claros; ingresos y acceso a Caja separados por espacio/línea, sin otra capa de tarjetas equivalentes. |
| Pedidos | La bandeja y sus filtros preceden a herramientas de Carta, fichas y métricas. Pedidos conservan restricción, tiempos, estados, importes según rol y confirmaciones. |
| Caja | Cuatro tareas numeradas y seleccionadas, con explicación breve. Cuenta consultada separa identidad, contacto y saldo antes de recargas/sellos. Beneficio, premio y descuento mantienen sus controles. |
| Mi Club | Condiciones legibles y edición de reglas/costos en un desplegable explícito; estado del formulario permanece montado. Espera, experiencias, reposiciones y métricas conservadas. Tabla de cohortes desplazable con teclado. |
| Tienda | Resumen de lote con generación, precio y disponibilidad; bolsas como unidades de trabajo. Tabla de métricas con región enfocada. Condiciones, preparación, entrega y devoluciones permanecen. |
| Entregas y Atención | Filtros, resultados, paginación, estados y registros comparten la nueva jerarquía de lectura y acción. Confirmaciones y respuestas preservadas. |
| Agenda | Configuración expone su estado expandido y se diferencia de la lista de visitas. Formulario, acciones y motivos conservados. |
| Informes | Cifras alineadas, selección de período, tablas con foco y registro de actividad legibles. No se agregaron métricas ni se cambiaron cálculos. |
| Clientes | Fichas de directorio con nombre, estado, contacto y enlace distinguibles; lectura de ficha y saldo conserva filtros/historial. |
| Equipo y permisos | Comparación de roles en cuatro bloques legibles dentro del desplegable. Directorio, invitación y cambios siguen siendo acciones existentes. |
| Cuenta y seguridad | Paneles diferenciados para identidad, clave, recuperación, sesiones y actividad, con distribución amplia/estrecha. |
| Acceso y fases | Marco consistente para acceso, invitación, recuperación, MFA, configuración, cambio obligatorio y bloqueo. Se conserva el enlace para volver a clientes. |

Montserrat para controles/datos y Playfair para titulares, con los tokens aprobados. Selección y feedback usan transiciones de 160–180 ms; `prefers-reduced-motion` las suprime. La interfaz operativa no añade fotografías que compitan con sus tareas.

## Evidencia y resultados

Carpeta [evidencia/equipo](evidencia/equipo/):

- `antes-*-1440.png`: las doce secciones anteriores; `antes-resumen-390.png`, navegación móvil anterior.
- `despues-*-{320,390,768,1440}.png`: las doce secciones implementadas en cuatro anchos; incluyen datos vacíos normales de la fixture, no pedidos inventados.
- `verificacion-inicial.json`: 138 comprobaciones, 135 correctas. Las únicas tres incidencias fueron regiones de tabla sin foco en Club, Tienda e Informes a 390 px. Ningún desbordamiento en las doce secciones/cuatro anchos; tipografías correctas, navegación, Escape, retorno de foco, cinco casos de texto al 200 %, movimiento reducido y cuatro roles verificados. Cero errores JS.
- `correcciones-tablas-barra.json`: las tres tablas corregidas y barra compacta revalidadas en 16 combinaciones de módulo/ancho, sin infracciones axe ni desbordamiento. Conserva un resultado negativo de desplazamiento tomado demasiado pronto después de ArrowRight; la prueba posterior confirma desplazamiento real de 40 px, foco correcto, ancho visible 350 y contenido 520.
- `acceso-lectura.json`: ingreso, invitación, recuperación en móvil/escritorio/320 y bloqueo real de la sesión sintética. Seis renders sin desbordamiento ni infracciones automáticas. Incluye la comprobación posterior de desplazamiento horizontal con teclado.
- `acceso-fases-visuales.json`: seis renders de MFA, configuración y cambio de clave a 390/1440, con fases simuladas en la respuesta de la identidad sintética. Sin desbordamiento/axe; no acredita el protocolo de autenticación ni ejecuta cambios de seguridad.
- `cierre-{resumen,club,tienda,informes}-*.png`: capturas tras las correcciones de tablas y barra. Los otros captures iniciales preceden únicamente a esos ajustes.

Los roles se contrastaron con 12/12/7/2 destinos para propietario/encargado/caja/cocina. Caja y cocina vuelven a su sección permitida al pedir Equipo y permisos por URL. Esto verifica la presentación y el enrutado, no sustituye la autorización del servidor.

Se verificó sintaxis TSX de los diez archivos iniciales sin diagnósticos y se corrigió un falso positivo del guardián al enumerar `border-color` dentro de una transición. La compilación y las suites funcionales integrales se coordinan desde el agente principal, después de integrar los otros conjuntos.

## Pendiente de cierre

Revisión independiente de objetivo, marca y acabado sobre el conjunto integrado. Pruebas funcionales con registros sintéticos activos: cambios de pedido, recarga/canje/beneficio/descuento, devoluciones, agenda, respuesta, invitación y seguridad. Las capturas de listas vacías no sustituyen estas pruebas ni prueban todos los estados declarados en la matriz.

La suite existente `tests/mi-club-operacion-ui.mjs` necesita abrir «Editar condiciones y costos verificados» antes de completar sus campos. El agente principal fue informado; no se modificó esa suite desde este conjunto. El cambio es de acceso al formulario, no de la validación que exige.

## Cierre integrado posterior

Los pendientes de revisión de este informe se resolvieron con los tres dictámenes PASS enlazados en [la entrega](LEEME.md). El barrido final138 incluye los doce módulos. La adaptación de Mi Club se ejecutó y pasó desde la copia de regresión del conjunto cuenta. Seguridad UI7 y descuento UI3 pasaron con Worker aislado; las21 suites del servidor pasan. El árbitro de uso operó pedidos por roles, recarga, beneficio, preparación/entrega de bolsa, asistencia, atención y directorio. La [matriz](../redisenio-2026-10-21/COBERTURA.json) delimita las variantes administrativas y de acceso respaldadas solo por servidor/render, sin atribuirlas a pruebas UI no ejecutadas.
