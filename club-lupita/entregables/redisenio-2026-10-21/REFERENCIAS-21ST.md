# Referencias de 21st.dev para la aplicación La Bella Lupita

Consulta del 21 de octubre de 2026. Ocho referencias concretas para mejorar navegación, lectura, selección y confirmación en clientes, equipo y administración. Las aplicaciones a Lupita y los tiempos propuestos son decisiones de diseño; los enlaces, dependencias y licencias indicados proceden de las fichas consultadas.

La dirección recomendada es un sistema común con fotografía de producto, indicador activo claro, formularios legibles, detalles desplegables y respuestas inmediatas. Cacao para texto, rosa para superficies de apoyo y borgoña para selección y acciones; Playfair en títulos y Montserrat en controles y datos. Cada interacción debe funcionar con tacto, teclado y movimiento reducido.

## Ocho referencias concretas

### 1 Product Card de Ravi Katiyar

[Ficha y ejemplo](https://21st.dev/@ravikatiyar162/components/product-card-2).

**Confirmado:** tarjeta de producto parametrizable, cuadrícula adaptable, efecto discreto al apuntar y entrada escalonada. La ficha declara `framer-motion`; el ejemplo importa ese paquete. No muestra licencia ni repositorio de origen independiente.

**Aplicación propuesta:** Carta, Tienda y tarjetas resumidas de Inicio. Foto real con proporción estable, nombre, precio, disponibilidad y una acción explícita; mantener la misma anatomía en la edición de catálogo del equipo. Tras agregar, cambiar el estado del botón y el contador del pedido.

**Adaptación:** tomar la jerarquía como referencia visual hasta aclarar la licencia del código. Evitar las etiquetas comerciales del ejemplo, descuentos ficticios y la entrada escalonada de todo un catálogo. El efecto al apuntar no debe esconder precio, disponibilidad ni acción. No incorporar fotos de la demostración.

### 2 Animated Tabs de Julien Thibeaut

[Ficha y ejemplos](https://21st.dev/@ibelick/components/animated-tabs).

**Confirmado:** fondo que se desplaza entre opciones; ejemplos con iconos, texto y control segmentado. Dependencias declaradas: `framer-motion`, `lucide-react`. Licencia declarada: MIT. El ejemplo segmentado usa una transición de 0,2 segundos; la variante de iconos usa resorte de 0,3 segundos.

**Aplicación propuesta:** categorías de Carta, filtros breves de pedidos y reservas, vistas de Mi Club, períodos de informes. El indicador borgoña puede moverse sin desplazar el contenido ni cambiar su altura.

**Adaptación:** preferir texto visible y objetivos de al menos 44 px. El ejemplo de iconos no incluye nombres accesibles en los botones: no copiarlo literalmente. Implementar navegación por teclado y semántica según sea navegación entre páginas, pestañas o filtro. La barra de las 12 secciones del equipo necesita una navegación completa, no 12 botones comprimidos en un control segmentado.

### 3 FAQ Accordion Reveal de Hirael

[Ficha](https://21st.dev/@mohammadshehadeh/components/faq-06) · [Fuente publicada](https://hirael.com/r/faq-06.json).

**Confirmado:** acordeón con varias respuestas abiertas, piezas componibles y cambio de fondo al abrir. Dependencia declarada: `motion`. Licencia declarada: MIT, atribuida a Mohammad Shehadeh con enlace al proyecto Hirael.

**Precisión tras la nueva investigación:** `motion` corresponde a lo declarado por la ficha de 21st y a su demo, no a una lista verificada de la fuente actual. `faq-06.json` declara dependencias vacías y deriva a `accordion.json`/`badge`; el acordeón actual declara `radix-ui` y `lucide-react`. La fuente de origen y la demo observada no son intercambiables sin revisar versión y dependencias recursivas.

**Aplicación propuesta:** Conocé tu club, condiciones de tienda y reservas, detalles de beneficios y ayuda de permisos del equipo. Mantener visibles los importes, restricciones y avisos necesarios para decidir; desplegar explicaciones secundarias.

**Adaptación:** conservar expansión breve y estado abierto; omitir el titular revelado palabra por palabra y el retraso escalonado del ejemplo. Los títulos deben ser botones con estado expandido, funcionar con teclado y conservar el foco al cerrar.

### 4 Dialog de Fluid Functionalism

[Ficha](https://21st.dev/@micka_design/components/dialog) · [Documentación de origen](https://www.fluidfunctionalism.com/docs/dialog).

**Confirmado en la ficha:** diálogo con fondo superpuesto y partes para título, contenido y acciones. Declara `clsx`, `lucide-react`, `framer-motion`, `tailwind-merge`, `@radix-ui/react-dialog` y `class-variance-authority`. No muestra licencia. La documentación de origen actual ofrece una variante Base UI y tres tamaños; no debe confundirse con la versión Radix descrita en 21st.

**Aplicación propuesta:** editar datos, confirmar una cancelación, revisar un canje y cambiar permisos. Una apertura corta puede ayudar a reconocer la superficie activa.

**Adaptación:** usarlo como referencia de composición. Lupita ya tiene `Hoja`: revisar y mejorar esa primitiva antes de añadir otra biblioteca. Conservar título accesible, foco inicial, retorno del foco, cierre pertinente y acciones explícitas. Los formularios largos de reservas y compra deben conservar su flujo de página.

### 5 Order Confirmation Toast de Bundui.io

[Ficha](https://21st.dev/@bundui/components/toast6) · [Origen enlazado](https://shadcnuikit.com).

**Confirmado:** confirmación breve con descripción y acción para consultar el pedido. Dependencia declarada: `sonner`. Licencia declarada: MIT. La ficha enlaza el sitio del autor, sin un repositorio de esa versión.

**Aplicación propuesta:** pedido recibido, perfil guardado, beneficio canjeado, invitación copiada, operación o edición confirmada. Mostrarlo después de la confirmación real del servidor y ofrecer una acción relacionada cuando proceda.

**Adaptación:** preservar también el estado en la pantalla y en el historial correspondiente. Los errores de formularios y los datos críticos deben permanecer junto al contexto. El mensaje breve no debe tapar controles móviles ni ser el único acuse accesible. Puede reproducirse el patrón sobre los avisos existentes, sin adoptar Sonner.

### 6 Input with clear button de Origin UI

[Ficha y código de uso](https://21st.dev/@originui/components/input/input-with-clear-button) · [Origen](https://originui.com/inputs).

**Confirmado:** campo controlado con botón para borrar; al borrar devuelve el foco al campo. El ejemplo importa `lucide-react`, React y primitivas locales `Input` y `Label`. La ficha no presenta un inventario completo de dependencias para esta variante. Licencia declarada: MIT.

**Aplicación propuesta:** búsqueda en Carta, pedidos, compras, directorio de clientes, equipo y registros operativos. El patrón también orienta los estados de foco y controles anexos del resto de formularios.

**Adaptación:** etiqueta persistente, botón con nombre en español y espacio reservado para evitar saltos. Reutilizar los iconos del proyecto. Si se inserta en un formulario, dar `type="button"` al control para borrar; el ejemplo mostrado no lo especifica. Mantener separados estado vacío, sin coincidencias, carga y error de consulta.

### 7 Stepper with titles and descriptions de Origin UI

[Ficha y ejemplo](https://21st.dev/@originui/components/stepper/with-titles-and-descriptions).

**Confirmado:** indicador de pasos con título y descripción; la ficha incluye variantes verticales, controladas y de carga. Dependencias declaradas: `lucide-react`, `@radix-ui/react-icons`. Licencia declarada: MIT. La fuente declarada remite a otra ruta del mismo componente en 21st.

**Aplicación propuesta:** reservar mesa, finalizar compra y activar una cuenta del equipo cuando el flujo real tenga etapas. El estado actual y lo completado deben venir del flujo existente, sin añadir pasos decorativos.

**Adaptación:** usar un indicador compacto en móvil; la demostración fija un ancho mínimo de 350 px y esconde descripciones en pantallas pequeñas. No ocultar instrucciones necesarias. Permitir volver sin perder datos cuando el flujo lo admita y mover el foco al título o primer error al avanzar. Animar el cambio de estado, sin introducir una espera adicional.

### 8 Table de Fluid Functionalism

[Ficha](https://21st.dev/@micka_design/components/table) · [Origen](https://www.fluidfunctionalism.com/docs/table).

**Confirmado:** tabla componible con resaltado de filas y fondos animados por proximidad del cursor. Dependencias declaradas: `clsx`, `framer-motion`, `tailwind-merge`. Licencia declarada: MIT. El ejemplo es una tabla de datos simple; no acredita paginación, ordenación ni virtualización.

**Aplicación propuesta:** pedidos, caja, entregas, reservas, informes, clientes y accesos del equipo. Encabezado claro, cifras alineadas, estado con texto y acción asociada a cada registro.

**Adaptación:** conservar solo el resaltado sobrio de fila y foco; omitir seguimiento por proximidad del cursor. No mover filas mientras alguien opera. En móvil, priorizar campos y detalles expandibles o desplazamiento horizontal indicado, según cada tabla. No sustituir autorización, filtros y acciones existentes por datos o lógica del ejemplo.

## Cobertura de los módulos existentes

La correspondencia usa las rutas de `src/casa/App.tsx` y las 12 secciones declaradas en `src/casa/pantallas/Personal.tsx`. Es una propuesta de cobertura visual y de interacción; no implica cambios en funciones, permisos o datos.

| Área y módulo | Aplicación de los patrones |
| --- | --- |
| Acceso de clientes y Umbral | Campos con etiquetas, validación junto al campo, foco y confirmación de estado. |
| Inicio | Tarjetas de productos o servicios y fotografía consistente; entrada breve una sola vez. |
| Carta y detalle de carta | Tarjeta, categorías con indicador, búsqueda clara y detalle accesible. |
| Pedido y compra | Acuse de agregado, resumen estable, pasos solo si corresponden al flujo real. |
| Tienda | Tarjetas con disponibilidad, condiciones desplegables y confirmación de compra. |
| Mi Club | Pestañas breves, detalle de beneficio y confirmación de canje. |
| Conocé tu club | Información por secciones y acordeones para explicaciones complementarias. |
| Reservar y Mis reservas | Pasos, campos, estados, detalle y confirmación contextual. |
| Perfil | Campos, edición mediante superficie coherente y confirmación de guardado. |
| Mis compras | Filtros breves, historial legible y detalles desplegables. |
| Kit interno | Muestras de los estados y primitivas comunes para comprobar consistencia. |
| Equipo · Resumen | Tarjetas de atención y estados estables; cifras sin conteo ornamental. |
| Equipo · Pedidos | Filtros, fila o tarjeta de pedido, estado de preparación y acuse real. |
| Equipo · Caja | Búsqueda, ficha resumida, formulario, revisión y confirmación de operación. |
| Equipo · Mi Club | Reglas, experiencias, espera y medición con acordeones, tablas y formularios comunes. |
| Equipo · Tienda | Catálogo, lotes, bolsas y devoluciones con tarjeta, tabla y confirmación. |
| Equipo · Entregas | Registros, estado, detalle y confirmación de entrega. |
| Equipo · Agenda | Filtros, registros de reservas, detalle y cambios confirmados. |
| Equipo · Atención | Lista de solicitudes, estado y detalle legible. |
| Equipo · Informes | Períodos segmentados y tablas; conservar las cifras durante una actualización. |
| Equipo · Clientes | Búsqueda, directorio y ficha de cuenta con edición contextual. |
| Administración · Equipo y permisos | Directorio, búsqueda, explicación de roles y confirmación explícita del cambio. |
| Administración · Cuenta y seguridad | Campos, pasos reales de activación/MFA y confirmaciones persistentes cuando haga falta. |

## Encaje técnico y reglas de movimiento

El `package.json` local declara los rangos React `^18.3.1`, Vite `^6.0.5`, Tailwind `^3.4.17` y Motion `^11.15.0`. Las versiones instaladas comprobadas son React 18.3.1, Vite 6.4.3, Tailwind 3.4.17 y Motion 11.18.2; esta última exporta `motion/react`. El proyecto no declara directamente Radix, Base UI, Lucide, Sonner, `clsx`, `tailwind-merge` ni `class-variance-authority`.

Conviene adaptar patrones a las primitivas existentes antes de añadir dependencias. Las fichas no especifican todas las versiones ni certifican compatibilidad con este proyecto: revisar imports, utilidades Tailwind, tokens de tema y comportamiento del componente seleccionado. La existencia del ejemplo no demuestra que gestione datos reales, permisos, carga o errores.

Para Lupita propongo 120–200 ms para respuesta de controles y 200–320 ms para apertura o cambio de panel, sin rebotes. Con movimiento reducido, cambio inmediato u opacidad discreta. Fotografías con dimensiones reservadas; contenido y acciones siempre disponibles; nada de carruseles automáticos, fondos continuos, tarjetas 3D, cursores personalizados o animación de filas operativas. Son propuestas pendientes, no valores ya aprobados.

El contraste local confirma que `src/casa` no importa `motion/react` ni `src/lib/movimiento.ts`. Este último pertenece a la implementación heredada y contiene, además de 120/200/320 ms, tiempos de 520/840 ms, resortes y vibración. No constituye un sistema aplicado a la app activa ni debe copiarse completo. La integración futura debe elegir solo el comportamiento necesario, respetar movimiento reducido y medir el incremento de recursos. Las transiciones CSS existentes de Inicio no acreditan la implementación de todos estos patrones.

Las licencias anteriores son las declaradas por cada ficha, no una auditoría jurídica del repositorio. Para Product Card y Dialog no hay licencia visible en la ficha consultada: conservarlos como referencias visuales mientras no se aclare la reutilización del código. No se instaló ni ejecutó código remoto ni se incorporaron imágenes de las demos.
