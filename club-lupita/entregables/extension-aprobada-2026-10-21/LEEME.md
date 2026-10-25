# La Bella Lupita · extensión del diseño aprobado

La sexta composición de Inicio aprobada el 21 de octubre se extendió a toda la aplicación activa: once rutas, doce módulos del equipo y las 77 superficies/familias del inventario. Inicio conserva su composición. El proyecto real está integrado, compilado y publicado en [app.labellalupita.com](https://app.labellalupita.com/) tras la autorización «Procede a aplicar el nuevo diseño». [Publicación y comprobaciones](../publicacion-redisenio-2026-10-21/PUBLICACION.md).

## Abrir y probar

- [App rediseñada, cuenta de prueba](http://127.0.0.1:5203/__preview/entrar).
- [Selector de cliente, visitante y cuatro roles](http://127.0.0.1:5203/__preview).
- [Versión anterior a la extensión](http://127.0.0.1:5197/__preview).
- [Comparación de capturas por pantalla](COMPARAR.html).

El servidor local usa el Worker real con PGlite en memoria, cuentas sintéticas y servicios externos bloqueados. Las acciones sirven para probar recorridos; no hacen compras, reservas, recargas ni envíos reales. Al cerrar y reiniciar el servidor, sus datos de prueba se reinician. El selector permite recuperar acceso después de bloquear o cerrar una sesión. Las fotografías y fichas comerciales conservan los activos del proyecto; una oferta incompleta sigue sin habilitar su compra.

Para abrir de nuevo la preview cuando el proceso haya terminado, desde la carpeta `club-lupita`:

```powershell
node scripts/vista-previa-diseno.mjs --port 5203 --dist dist --equipo
```

Si se modifican fuentes, compilar antes con `npm run build`. La aplicación conserva React, TypeScript, Vite y su Worker; necesita servidor para funcionar. No se presenta como un HTML autónomo ni se sustituyen funciones reales por una maqueta.

## Qué mejoró

| Conjunto | Resultado |
|---|---|
| Sistema, acceso y navegación | Playfair/Montserrat locales en toda la app; cabecera y navegación continuas; formularios, botones, estados y diálogos coherentes. Acceso más breve con pasos claros. Kit con ejemplos identificados e interacciones reales de demostración. |
| Carta, Tienda, compras y reservas | Fotografías, nombre y precio próximos; selección clara y detalle consistente; comprobantes ordenados; zonas, horarios y revisión de reserva más legibles. Se corrigieron tamaños declarados de imágenes y el encuadre del risotto. |
| Club y cuenta | Beneficios, sellos, experiencias y saldo con jerarquía; Perfil organizado por tareas; edición, conciliación y actividad preservadas; explicación de cuenta gratuita y membresía opcional más fácil de recorrer. |
| Equipo | Doce módulos con tareas antes que configuración; navegación móvil compacta, tablas accesibles por teclado, formularios y confirmaciones coherentes. Se mantienen los cuatro roles, permisos y seguridad. |

El dinamismo toma mecanismos revisados en 21st.dev: selección, respuesta al pulsar, continuidad entre lista/detalle y feedback de estados. Las adaptaciones son propias, en la tecnología existente; el movimiento reducido conserva toda la información y las acciones. No se añadieron dependencias ni se animaron cifras ficticias.

## Revisión y correcciones

Se aplicó el método de [design-loop](C:/Users/artur/.codex/skills/design-loop/SKILL.md), con tres árbitros que examinaron el resultado renderizado sin leer la implementación para juzgar su intención.

- [Uso](REVISION-USO.md): PASS en los cuatro conjuntos, con recorridos de cliente y equipo.
- [Marca](REVISION-MARCA.md): PASS en los cuatro conjuntos, contrastado con el manual y las referencias.
- [Acabado](REVISION-ACABADO.md): PASS tras cuatro rondas del conjunto de sistema; los otros tres conjuntos pasaron su revisión inicial.

Se corrigieron contraste durante un cambio de disponibilidad, respaldo de foto con contraste bajo, tablas sin foco, reflujo de pase/Kit al ampliar texto, foco de reserva tapado por su barra y salto al contenido bajo el aviso local. El crítico de acabado detectó el nombre de un producto comprimido en Kit y después un aviso recortado con texto al 200 %; ambos se corrigieron y revalidaron con teclado en 320 × 568 y 320 × 700. No quedan defectos importantes reproducidos en estas revisiones sin resolver.

## Pruebas y alcance

| Comprobación | Resultado y evidencia |
|---|---|
| Compilación final | TypeScript, Vite, guardián, iconos, tokens y metadatos PASS. [Log](evidencia/build-final.log). |
| Servidor | Las 21 suites de `npm test` PASS: contratos, cuenta, permisos, pagos, recuperación, Club, catálogo, reservas y devoluciones. [Log](evidencia/regresion-completa.log). |
| Barrido integrado | 138 comprobaciones sobre 23 vistas: cuatro anchos, texto 200 % y axe; cero desbordes, imágenes rotas, errores JS o solicitudes externas en ese barrido. [Resultados](evidencia/integral-final/resultados.json). |
| Inicio aprobado | 11 grupos PASS: composición, fotos, saldo privado, pase, foco, rutas, prioridades, errores y movimiento reducido. [Resultados](evidencia/inicio-aceptacion/aceptacion.json). |
| Sistema y acceso | 18 grupos PASS, incluyendo los avisos en pantallas cortas/texto200; recorrido real de correo/OTP con envío simulado, alta y reingreso. [Sistema](evidencia/sistema/resultados.json) · [correo](evidencia/correo.log). |
| Comercio | Carta14, Tienda9, operaciones3+3 y reservas/compras9 PASS. Incluye cotización, precio cambiado, respuesta perdida, recuperación sin duplicar y anticipo/devolución exactos. [Detalle](COMERCIO.md). |
| Cuenta y Club | Perfil10, Club24, Conocé21, operación3, reglas4, variantes8, ayuda4 y cierre de experiencias6 PASS. Club/Conocé probados en Edge, Firefox y WebKit. [Detalle](CUENTA-CLUB.md). |
| Equipo | Doce módulos en cuatro tamaños y navegación de cuatro roles; siete recorridos de seguridad UI real, tres de descuento/anulación y operaciones cliente/equipo del árbitro. [Detalle](EQUIPO.md) · [seguridad](evidencia/seguridad/resultados.json) · [descuento](evidencia/caja-descuento/caja-ui.json). |
| Rendimiento |24 cargas locales de Inicio, Carta, Club y Pedidos de equipo; sin imágenes rotas ni errores. LCP mediano4–20 ms mayor, recursos−0,9 % a+4,8 % según ruta. [Comparación y límites](RENDIMIENTO.md). No son métricas de producción ni se promete una mejora general de velocidad. |

La matriz de [cobertura](COBERTURA.md) enlaza el alcance completo; el [JSON por superficie](../redisenio-2026-10-21/COBERTURA.json) conserva los estados y límites de verificación. Las pruebas no equivalen a todas las combinaciones de estados, roles, motores y tamaños. Se distingue lo ejecutado en navegador, lo probado por servidor y lo simulado.

**Trazabilidad:** el barrido integral138 y la seguridad UI pasaron sobre `principal-4KPpZegJ.js`; después solo cambiaron la muestra y el aviso del Kit. Esas correcciones pasaron pruebas focales y crítica independiente en `principal-Ctm5IHgB.js`. Las suites de cuenta/comercio identifican sus compilaciones intermedias. [Manifiesto final SHA-256](MANIFIESTO.json), [base anterior preservada](antes/) y [registro de decisiones](REGISTRO.md).

## Límites y siguiente ciclo

No se usaron dispositivos físicos, lector de pantalla ni integraciones externas reales. El primer alta de propietario y algunas variantes administrativas de Agenda se respaldan con pruebas del servidor y revisión de formularios; no se repitió por navegador cada combinación heredada. Perfil ofrece copiar el enlace del Club; no contiene una hoja nativa de compartir. La autoría original de las fotos preexistentes no se certifica en este ciclo.

El siguiente paso recomendado es recoger feedback de las tareas habituales: buscar un plato, revisar una compra, reservar, abrir beneficios y recorrer el rol que usa el equipo. La preview sigue disponible para ensayos con datos sintéticos. El diseño fue publicado con autorización del usuario el 21 de octubre; futuros cambios de producción requieren su alcance autorizado.
