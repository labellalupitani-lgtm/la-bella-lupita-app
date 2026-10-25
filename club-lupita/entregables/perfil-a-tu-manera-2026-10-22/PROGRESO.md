# Perfil — progreso

| Pieza | Ronda | Construcción | Uso | Marca | Composición |
| --- | --- | --- | --- | --- | --- |
| Identidad y preferencias | 1 | Construida | PASS funcional | FAIL: palabras cortadas al 200 % | FAIL: reflujo al 200 % |
| Edición y movimiento | 1 | Construida | PASS | PASS visual | PASS visual |
| Cuenta, datos y ayuda | 1 | Construida | PASS funcional | FAIL: concepto monetario sintético ambiguo | FAIL: título cortado al 200 % |
| Identidad y preferencias | 2 | Reflujo flexible corregido | Sin cambio funcional | Revisión final pendiente | Geometría de palabras PASS |
| Cuenta, datos y ayuda | 2 | Separación de ayuda ajustada | Sin cambio funcional | Concepto sintético aclarado solo en GET | FAIL: Comunicaciones a 320 px / 200 % |
| Identidad y preferencias | 3 | Terminada | PASS | PASS | PASS |
| Edición y movimiento | 3 | Terminada | PASS | PASS visual | PASS visual |
| Cuenta, datos y ayuda | 3 | Terminada | PASS | PASS | PASS |

R3: título «Tus datos y mensajes». Compilación PASS; diez grupos de pruebas específicas PASS; matriz de 24 combinaciones PASS; nueve informes axe sin violaciones. Capturas e interacción: `pruebas-r3/`. Los informes de cada crítico conservan sus hallazgos R1 y su revalidación final.

Tres revisiones independientes concluyen PASS para cada pieza: `REVISION-USO.md`, `REVISION-MARCA.md` y `REVISION-COMPOSICION.md`. Marca y composición evalúan imágenes; uso verifica interacciones y distingue las pruebas de guardado registradas de su observación directa. Movimiento medido en la suite específica, no inferido de capturas estáticas.

Vista final abierta y verificada en http://127.0.0.1:5330/perfil, con captura `perfil-final-abierto.png`. Limitación de la regresión WebKit directa documentada en `LEEME.md`; no se presenta como aprobada. Código, compilación y fuentes archivadas corresponden a la ronda final.

Vista anterior conservada en localhost:5320/perfil y copia `antes/`. Solo trabajo local autorizado, sin publicación.
