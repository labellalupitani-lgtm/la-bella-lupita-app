# Mi Club — progreso

Preflight completo: referencias y marca conservadas; render disponible mediante Worker/PGlite local. No hay foto verificada del filtrado ni del envase, por lo que se usa ambiente identificado y tipografía. No se necesita generación de imágenes.

| Pieza | Ronda | Construcción | Uso | Marca | Composición |
| --- | --- | --- | --- | --- | --- |
| Primera pantalla y beneficios | 1 | Completa | PASS | PASS | FAIL: 250 g dividido al 200 % |
| Pase, sellos y estados | 1 | Completa | PASS | FAIL: número de sello solapado | FAIL: número de sello solapado |
| Experiencias y gestión | 1 | Completa | PASS | FAIL: saldo dividido | FAIL: saldo dividido |
| Primera pantalla y beneficios | 2 | Peso indivisible y ancho intrínseco | PASS | PASS | PASS |
| Pase, sellos y estados | 2 | Icono y número en flujo; cuadrícula adaptable al texto | PASS | PASS | PASS |
| Experiencias y gestión | 2 | Moneda/cifra separables; cifra íntegra; tipografía móvil ajustada | PASS | PASS | PASS |

## Evidencia

- Compilación final de correcciones: `build-r3.log`, PASS. La primera compilación detectó un radio fuera de tokens; se corrigió antes de la R1 visual (`build-r2.log`).
- R1 automatizada: nueve grupos focales PASS y 24 casos transaccionales PASS (ocho por navegador: Edge, Firefox y WebKit). La revisión visual independiente encontró defectos de legibilidad al 200 % que las primeras pruebas geométricas no detectaban.
- R2 automatizada: nueve grupos PASS en `pruebas-r2/resultados.json`. Se reforzaron las invariantes para comprobar cada glifo del saldo/peso y evitar colisiones entre icono y número. Matriz 320/390/768/1440 px, texto normal y 200 % real; movimiento reducido y sello nuevo confirmado.
- La fecha vencida del fixture gratuito fue corregida. No cambia datos ni comportamiento productivo.
- El bloque de diálogos, consentimiento y operaciones desde `<Hoja abierta=` permanece idéntico a `antes/src/casa/pantallas/Club.tsx`.

Rondas visuales: 2. Las tres revalidaciones independientes aprobaron las tres piezas; evidencia y límites en `REVISION-*.md`. Entrega local terminada, sin publicación. Vista lista en http://127.0.0.1:5320/club y captura `vista-club-abierta.png`.

