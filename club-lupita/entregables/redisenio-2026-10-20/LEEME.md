# La Bella Lupita — vista previa del primer ciclo

Inicio rediseñado sobre la aplicación existente. La cuenta y el pase siguen primero; se distinguen mejor los sellos, accesos y productos. Se aplican las fuentes y colores del manual, fotografías propias más amplias y superficies curvas. La dirección todavía requiere aprobación visual.

## Abrir y probar

- [Abrir versión revisada](http://127.0.0.1:5190/__preview/entrar).
- [Abrir diseño anterior](http://127.0.0.1:5189/__preview/entrar).
- [Abrir versión de desarrollo](http://127.0.0.1:5188/__preview/entrar).

Funcionan en este equipo mientras los servidores estén encendidos. El aviso superior identifica el entorno. «Reabrir cuenta» permite recuperar la sesión sintética. Se pueden probar pase, ocultar saldo, navegación, tarjetas y errores sobre datos de prueba. La base está en memoria y se reinicia al cerrar el servidor; las conexiones externas están bloqueadas. Los precios, saldos y existencias de la vista previa no acreditan datos comerciales reales.

Si el equipo se reinicia, abrir una terminal en la carpeta del proyecto y ejecutar:

```powershell
Set-Location -LiteralPath 'C:\Users\artur\Desktop\Proyectos\La Bella Lupita  - APP\club-lupita'
npm run preview:diseno
```

Abrir [Inicio local](http://127.0.0.1:5188/__preview/entrar). Dejar la terminal abierta; Ctrl+C detiene el servidor. Para comparar, abrir otra terminal en la misma carpeta y ejecutar `npm run preview:antes`.

Para volver a servir la compilación revisada del puerto 5190:

```powershell
node scripts/vista-previa-diseno.mjs --port 5190 --dist dist
```

No se requiere una cuenta real ni configurar claves. No usar el comando de despliegue para revisar esta propuesta. No se publicó en producción.

## Antes y después

Las capturas usan la misma cuenta sintética y tamaños equivalentes. El «antes» es la compilación que ya existía antes del cambio, conservada íntegra; no se afirma que represente la versión actualmente publicada.

| Tamaño | Antes | Después |
| --- | --- | --- |
| Móvil, 390 × 844 | [Captura anterior](evidencia/antes-movil.png) | [Captura revisada](evidencia/despues-movil.png) |
| Escritorio, 1440 × 1000 | [Captura anterior](evidencia/antes-escritorio.png) | [Captura revisada](evidencia/despues-escritorio.png) |
| Tablet, 768 × 1024 | — | [Captura revisada](evidencia/despues-tablet.png) |

Las capturas completas incluyen zonas fuera del primer viewport; la navegación fija aparece a la altura del viewport capturado. Usar la aplicación para valorar su comportamiento al desplazarse.

## Cambios integrados

- `src/casa/pantallas/Inicio.tsx`: jerarquía, agrupación de acciones, presentación de seguimiento y tarjetas/fotografía.
- `src/casa/estilos/redisenio-inicio.css`: estilos exclusivos de Inicio, adaptación responsive, foco y movimiento reducido.
- `src/casa/componentes/Navegacion.tsx`: selección del tamaño de imagen del logo según ruta.
- `tailwind.config.js` y `public/fuentes/diseno/`: tokens adicionales y fuentes con sus licencias.
- `scripts/vista-previa-diseno.mjs`, `scripts/medir-redisenio.mjs`, scripts de `package.json` y `tests/redisenio-inicio-ui.mjs`: vista aislada y comprobaciones reproducibles.
- `tests/inicio-ui.mjs`: permite dirigir la evidencia a otra carpeta sin sobrescribir el historial.

No hay repositorio Git en esta carpeta. El respaldo previo de fuentes, configuración y compilación se conserva en `antes/`. La comparación de fuentes confirma que los únicos archivos existentes de `src` modificados son Inicio y el tamaño del logo en Navegación; el CSS de Inicio es nuevo. Las reglas de negocio del Worker permanecen sin cambios.

## Pruebas y revisión

| Comprobación | Resultado y evidencia |
| --- | --- |
| `npm run build` | Correcto: guardián, iconos, TypeScript, Vite y metadatos. |
| `node tests/inicio.mjs` | 5 grupos correctos: catálogo/cupos, contexto, premio, métricas y sesión. |
| `node tests/inicio-ui.mjs` | 9 grupos correctos. [Resultados](evidencia/regresion/resultados-ui.json). |
| `npm run test:diseno` | 9 grupos correctos, sin errores JavaScript ni solicitudes externas. [Resultados](evidencia/aceptacion.json). |
| Accesibilidad automática | Cero hallazgos en [móvil](evidencia/axe-390.json), [escritorio](evidencia/axe-1440.json) y [pase](evidencia/axe-dialogo.json), para las reglas Axe WCAG 2 A/AA y 2.1 AA ejecutadas. No equivale a certificación completa. |
| Revisión independiente | Objetivo e identidad aprobados tras corregir y repetir la revisión; acabado aprobado. [Objetivo](revision-objetivo.md), [identidad](revision-identidad.md), [acabado](revision-acabado.md). |

Las revisiones detectaron y cerraron desbordamiento con texto ampliado, foco tapado por la navegación, fuentes residuales, color del pase y separación del logo. Se verificaron rutas, teclado, privacidad, recuperación de errores, estados vacíos y premio. El estado final conserva las funciones existentes dentro del alcance probado.

Para repetir la regresión sin sobrescribir evidencia histórica:

```powershell
$env:EVIDENCIA_INICIO_DIR='entregables/redisenio-2026-10-20/evidencia/regresion'
node tests/inicio-ui.mjs
```

## Rendimiento y límites

Tres cargas independientes por compilación en Edge local, viewport 390 × 844, sin limitación de red/CPU. [Datos completos](evidencia/rendimiento.json).

| Mediana | Antes | Después |
| --- | ---: | ---: |
| LCP local | 56 ms | 52 ms |
| CLS | 0,0654 | 0,0744 |
| Cuerpos de recursos descargados, sin compresión HTTP local | 460.577 B | 606.533 B |
| Peticiones de recursos | 33 | 35 |

La carga local no se ralentizó en esta muestra; CLS aumentó ligeramente. La descarga creció 145.956 B: fotos de mayor resolución (+73.478 B), cambio de fuentes (+51.388 B netos), CSS (+20.213 B) y JavaScript (+877 B). Es un coste de la propuesta; estos datos no permiten garantizar igual velocidad en redes móviles. Work Sans aún se solicita durante el arranque; evitar esa solicitud puede ahorrar unos 50 kB sin cambiar el diseño final.

No se hizo una prueba con lector de pantalla ni una validación completa de otras pantallas o de dispositivos físicos. Los informes detallan su alcance; no se presentan esas comprobaciones como superadas.

## Pendientes y siguiente ciclo

Validar visualmente Inicio y el logo compacto móvil antes de extender la dirección. Si se aprueba, continuar con Carta y detalle de producto, reutilizando las decisiones aprobadas. Considerar después la compactación de bloques secundarios móviles y la descarga tipográfica del arranque. La publicación requiere aprobación explícita adicional.

El [registro de continuidad](REGISTRO.md), la [dirección visual](design-system.md) y la [barra de evaluación](bar.md) conservan las decisiones y los pendientes.
