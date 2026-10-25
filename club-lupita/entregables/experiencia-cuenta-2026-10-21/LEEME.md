# Tienda, Mi Club y Perfil · versión revisada

La vista que seguía abierta en el navegador era el Perfil anterior en 5277. Se abrió y comprobó la nueva versión en 5296. La cabecera también se corregió para el ancho real del panel de Windows: a 913 px con barra de desplazamiento pasó de 183 a 94 px de alto.

**Abrir:** [Tienda](http://127.0.0.1:5296/tienda) · [Mi Club](http://127.0.0.1:5296/club) · [Perfil](http://127.0.0.1:5296/perfil).

**Comparar:** [antes/después en móvil, panel y escritorio](http://127.0.0.1:5297/COMPARAR.html). Las capturas usan el mismo escenario sintético; se reinició la entrega para retirar intentos de compra de las pruebas. También puede abrirse COMPARAR.html directamente. [Captura del panel real del usuario](panel-final.png).

En otro navegador sin sesión, la primera entrada abre Inicio con la cuenta sintética: elegí Tienda, Mi Club o Perfil en la navegación. Si la sesión dejó de ser válida, [reabrir cuenta de prueba](http://127.0.0.1:5296/__preview/entrar). El selector /__preview es una herramienta técnica para elegir roles, no una pantalla del producto.

## Qué cambió

- **Tienda:** producto, estado, precio y compra reunidos; selector El café / El retiro; consulta de encargo que refleja los campos mientras se completan. Cuando falta la fotografía del lote, se muestra una ficha editorial con datos confirmados y un dibujo abstracto de granos. La fotografía publicada por la API se usa cuando existe. No se inventó un empaque ni una fotografía del producto.
- **Mi Club:** credencial que abre el pase, acceso al café diario en la primera pantalla móvil y sellos que revelan fecha y motivo. Beneficios y condiciones conservados. Ver movimientos ahora abre y enfoca la cuenta correcta.
- **Perfil:** preferencias, cuenta y datos/ayuda en tres paneles; la edición contextual enfoca el campo elegido y conserva el borrador. La primera vista móvil pasó de 455 palabras y 4135 px a 95 palabras y 1339 px; los demás datos siguen disponibles en sus paneles. El saldo dispone de reintento y distingue la última lectura cuando falla la conexión.

Se conserva la dirección aprobada: Playfair Display/Montserrat y cacao, marfil, rosa y borgoña. La animación acompaña selecciones y aperturas; respeta movimiento reducido.

## Revisión y correcciones

Cuatro compilaciones de producto, con construcción, pruebas y dos rondas de crítica independiente. La segunda ronda incluyó una corrección adicional del componente de beneficios.

| Revisor | Dictamen final | Evidencia |
| --- | --- | --- |
| Función | PASS Tienda, Mi Club y Perfil | [R2](revision-funcion-r2.md); revalida F1/F2 sobre R3, con evidencia anterior para los demás recorridos |
| Sistema visual | PASS las tres piezas | [R2](revision-sistema-r2.md), compilación R4 |
| Oficio y referencias | PASS las tres piezas | [R2](revision-oficio-r2.md), compilación R4 |

Se corrigieron el destino incorrecto de movimientos, el saldo sin reintento, el círculo y formulario de Tienda al ampliar texto, el ordinal y cifra 250 g de Club, las filas estrechas de Perfil y el hueco lateral de las tarjetas de beneficios. La primera imagen de taza de Tienda se descartó por no representar el producto vendido. Informes R1 conservados y [registro de rondas](PROGRESO.md).

## Pruebas

- Build, TypeScript y guardian: aprobados; build-ronda-4.log. Compilación final **principal-B6EbsuoF.js**.
- Matriz final: 42 vistas; anchos 320, 390, 768, 899, 900, 913, 960, 1024, 1120 y 1440, con gutter de Windows. Texto al 200% por tamaño raíz y por tamaños computados a 320/390. Cero desbordes, imágenes rotas, errores JS o peticiones externas; axe sin violaciones en los escenarios ejecutados. Ver final/resultados.json.
- Nueva captura de comparación con datos limpios: 15 vistas adicionales, aprobadas; comparacion-final/resultados.json.
- Tienda: compra, cambio de precio, respuesta perdida, referencia conservada y recarga; recorrido principal Edge y comprobaciones de render/contrato/diálogo Firefox y WebKit. tienda-ui-r4.log.
- Mi Club: condiciones y consentimiento, códigos, foco, respuesta perdida, recuperación sin doble cargo y accesibilidad; Edge, Firefox y WebKit. mi-club-ui-r4.log.
- Perfil: guardado, conflictos, borrador, consentimiento, error, datos inválidos y salida sin conexión; Edge R3, Firefox/WebKit R2. La recuperación de saldo añadida posteriormente se comprobó con Edge y revisión funcional, sin atribuirla a aquellas pasadas de Firefox/WebKit.
- Regresiones nuevas F1/F2: destino y foco, 503 repetido, recuperación sin recargar y lectura anterior identificada. Pasaron también sobre la compilación congelada; recuperacion-entrega/resultados.json.
- Servidor: tienda.mjs, mi-club.mjs y perfil.mjs aprobados; no se modificó lógica del servidor.

La revisión visual y las pruebas se complementan; no se equipara axe o un build correcto con calidad de diseño. [Referencias observadas y límites](INVESTIGACION.md), [criterios verificables](bar.md).

## Medición local de carga

Edge 390 × 844, contextos nuevos, tres muestras por pantalla y versión, sin limitar red/CPU. Son mediciones de laboratorio local; no representan Core Web Vitals de usuarios reales.

| Pantalla | LCP antes → después (ms) | CLS antes → después | Recursos antes → después (KiB) |
| --- | --- | --- | --- |
| Tienda | 128 → 124 | 0.3653 → 0.0019 | 494.5 → 508.9 |
| Club | 120 → 120 | 0.0900 → 0.0938 | 530.3 → 562.7 |
| Perfil | 116 → 128 | 0.0005 → 0.0007 | 491.9 → 523.9 |

Las nuevas imágenes y estilos aumentan la transferencia aproximadamente 14–32 KiB por pantalla. No se midió red móvil real. El CLS varió entre muestras: en la versión final hubo una muestra de Tienda de 0,1204 y una de Club de 0,1516; las medianas figuran arriba. Se conserva este límite, sin afirmar cero desplazamiento visual ni una mejora universal de rendimiento. La siguiente verificación recomendada incluye carga en teléfono real y red móvil. Datos completos: rendimiento-entrega/resultados.json.

## Entorno y continuidad

Datos PGlite en memoria, identidades sintéticas y red externa bloqueada. No se enviaron consultas al negocio ni se desplegó producción. Las transacciones de pruebas solo afectan sus fixtures. La preview vuelve a iniciar una cuenta sintética al abrir un documento sin cookie: la seguridad de cierre se verificó en los tests TLS aislados, no se deduce de esa comodidad de la preview.

La preview sirve la copia congelada `compilacion/`; futuros builds de dist no invalidan sus recursos. Si el servidor local se cerró, ejecutar desde club-lupita:

```powershell
node scripts/vista-previa-diseno.mjs --port 5296 --dist entregables/experiencia-cuenta-2026-10-21/compilacion --experiencia --equipo
```

La comparación se sirve con:

```powershell
node entregables/experiencia-cuenta-2026-10-21/SERVIR.mjs
```

Los cambios del producto están integrados en src/casa. Inventario y hashes en archivos-cambiados.json; base congelada en antes/. Se añadieron los scripts de evidencia y el escenario --experiencia, limitado a la preview sintética.

**Pendientes:** tu aprobación visual y, por separado, autorización explícita para publicar. Fotografía real del lote cuando el negocio la proporcione; el fallback actual ya es utilizable. Próximo paso recomendado: observar a una persona en un teléfono real buscando su código de café y preparando una compra. No se afirma ninguna distinción ni validación de Awwwards.
