# Auditoría estática de la cobertura planificada

Fecha: 21 de octubre de 2026. Alcance: `COBERTURA.json` versión 2, `INVENTARIO.md`, rutas activas, secciones y roles del equipo e imports locales desde `src/casa/main.tsx`.

**Resultado:** no se encontró una ruta registrada, sección del equipo ni módulo TSX alcanzable omitido de la planificación. El inventario de módulos activos coincide con el código. Los cuatro ajustes concretos de aplicabilidad y trazabilidad detectados quedaron corregidos y revalidados durante esta revisión. Las 77 filas son grupos de trabajo; no representan 77 componentes independientes ni un porcentaje de rediseño terminado. Inicio tiene evidencia técnica parcial y sigue pendiente de aprobación visual del usuario; las otras 76 filas mantienen revisión pendiente.

## Comprobaciones realizadas

| Comprobación | Resultado y evidencia |
|---|---|
| Entrada activa | `index.html:16` carga `src/casa/main.tsx`; `vite.config.ts:35` mantiene `index.html` como entrada. `src/main.tsx` corresponde al cliente anterior. |
| Rutas | Las 10 rutas de cliente/herramientas de `App.tsx:122–131`, más `/personal` en `App.tsx:175`, coinciden con `rutasRegistradas`. La ruta desconocida es un caso negativo, no una duodécima ruta registrada. |
| Acceso público | Carta, Reservar y Conocé tu club sin `?acceso` coinciden con `App.tsx:94`. El acceso del cliente, `/kit`, salida pendiente y errores globales están representados. |
| Equipo | Las 12 secciones de `Personal.tsx:17` y las restricciones de `Personal.tsx:63–64` coinciden con la matriz del shell: propietario/encargado 12; caja 7; cocina 2; cambio obligatorio sólo seguridad. Se comprobó también su selección efectiva en `Personal.tsx:74`. |
| Imports alcanzables | Recorrido estático de imports/exports locales, incluidos dinámicos e imports de tipos: **92 archivos**, los mismos 92 del Anexo A, sin faltantes, sobrantes ni import local sin resolver. Incluye CSS y contratos; no mide chunks ni ejecución de todos los exports. |
| Referencias de la matriz | **121 rutas de archivo únicas** en fuentes, componentes y pruebas existentes, todas presentes. Al incluir evidencias y pruebas declaradas ejecutadas en Inicio: **131**, todas presentes. Los 77 IDs son únicos. |
| Módulos visuales | Todos los `.tsx` alcanzables tienen referencia directa en `componentes` de alguna fila. Los 17 archivos alcanzables sin referencia directa son cinco hojas CSS de sección y doce módulos de contratos/datos/formato; ya están enumerados en el inventario y comprendidos por las familias transversales. No son 17 pantallas faltantes. |

Se leyó únicamente código y documentación local. No se ejecutaron suites, compilación, preview ni despliegue; no se accedió a cuentas, datos operativos o archivos de secretos. El único archivo escrito por esta auditoría es este informe. La existencia de una evidencia enlazada no certifica su contenido ni repite su verificación.

## Hallazgos corregidos y revalidados

### 1. Caja puede consultar y recuperar registros de descuento

La fila `equipo-caja-descuento` describía a caja como «sin consulta/anulación administrativa». La consulta está disponible a caja: `src/casa/equipo/DescuentoClub.tsx:16` carga registros y las líneas 29–32 muestran el formulario de búsqueda y recuperación sin condicionar `administrar`; ese flag sólo controla la anulación. El backend confirma la diferencia: `src/worker/club-caja.ts:12–26` admite caja para consultar registros, mientras que la línea 65 restringe anular a propietario/encargado.

**Cerrado:** la matriz ya describe caja como «Cotiza, confirma descuento y consulta/recupera registros; sin anulación administrativa» y separa consulta/recuperación de anulación en sus estados. La fila Caja/descuento del apartado 3 del inventario recoge la misma diferencia. No se cambiaron permisos ni código.

### 2. La variante demo no pertenece exclusivamente a Inicio

`acceso-cliente-demo.ruta` sólo contenía `/`. Sin embargo, `src/casa/pantallas/Umbral.tsx:11` comprueba la presencia de `demo` sin restringir el pathname. `App.tsx:111–119` monta Umbral en las rutas protegidas sin cuenta; también lo hace en las tres públicas cuando incluyen `acceso`.

**Cerrado:** la matriz enumera las rutas donde monta Umbral, incluida la ruta negativa deliberada, y precisa las condiciones: `demo` en protegidas/desconocida, `acceso` más `demo` en las tres públicas, exclusión de `/kit` y `/personal`. El inventario conserva la descripción general de la bandera. No se creó una ruta nueva ni se duplicaron filas.

### 3. El anexo de pruebas quedó desactualizado

El Anexo C enumeraba 93 `.mjs`; la carpeta contiene **96**. Los tres archivos inicialmente ausentes del anexo eran:

- `tests/composicion-carta-inicio-ui.mjs`
- `tests/composicion-inicio-ui.mjs`
- `tests/estabilidad-inicio-ui.mjs`

**Cerrado:** el anexo ahora indica 96 e incluye los tres archivos. Su texto distingue existencia de ejecución y remite a la evidencia específica de Inicio en la matriz. Esa evidencia no convierte el resto de sus filas en verificadas.

### 4. Dos exports listados no tienen consumidores activos

`ConfirmarCompra` (`src/casa/componentes/Superficies.tsx:323`) y `ContenedorInicio` (`src/casa/componentes/Inicio.tsx:184`) están definidos y exportados, pero la búsqueda de referencias en el cliente activo sólo encuentra sus definiciones. A diferencia de las otras piezas de Inicio, tampoco se instancian en `/kit`.

**Cerrado:** el apartado 4 del inventario los señala expresamente como exports sin consumo actual y aclara que no son superficies adicionales. Sus módulos siguen en el grafo porque otros exports de esos archivos sí se usan. No se eliminó código.

## Cómo interpretar las agrupaciones

La planificación cubre módulos y familias, no una ficha independiente para cada símbolo, tarjeta o diálogo. Por ejemplo, `sistema-superficies-dialogos` agrupa Tarjeta, Carnet, Aviso, Fila y Hoja; `equipo-carta-metricas-cancelacion` combina métricas y cancelación con permisos distintos; `equipo-agenda-operaciones` reúne varios diálogos. A la inversa, `Lecturas.tsx` sostiene varias secciones. Por ello, ni el número de filas ni el número de archivos sirve como denominador de finalización visual.

Antes de cerrar cada grupo se necesita evidencia por variante aplicable: componente/consumidor, estado, rol y tamaño que cambie la composición. Puede quedar en una lista de aceptación adjunta a la fila, sin multiplicar automáticamente todas las combinaciones. En particular, la configuración de Club ya está inventariada, pero su aceptación debe nombrar selección de repostería, costos desconocidos frente a cero, verificación previa y conflicto de versión, visibles en `src/casa/equipo/Club.tsx:31–38`; la frase general «Condiciones y costos» no acredita esos estados.

## Alcance que todavía no puede declararse cubierto

- La aprobación visual de la nueva composición de Inicio por el usuario y su eventual extensión al resto de la app.
- La implementación y revisión visual de las demás rutas, accesos, secciones, variantes por rol y familias compartidas. Esta auditoría comprueba que están planificadas, no que estén rediseñadas.
- La aceptación por componente/consumidor dentro de cada grupo, incluyendo errores, datos anteriores, operaciones inciertas, conflicto, bloqueo, foco, movimiento reducido y responsive donde apliquen.
- Los permisos efectivos de todas las operaciones y la regresión funcional del rediseño integral. La lectura puntual del permiso de descuentos respalda ese hallazgo específico, no una auditoría completa del Worker.

No quedan correcciones documentales abiertas entre los cuatro hallazgos anteriores. No hace falta añadir nuevas rutas ni módulos al Anexo A. El trabajo pendiente corresponde a la aprobación y ejecución del rediseño, con aceptación por variante y evidencia vinculada. Este informe no modifica `COBERTURA.json` ni autoriza ampliar el diseño.
