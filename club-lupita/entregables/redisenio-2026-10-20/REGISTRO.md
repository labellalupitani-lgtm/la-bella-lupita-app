# Rediseño — ciclo 1 (20 de octubre de 2026)

> Continuidad, 21 de octubre: el usuario reiteró que el objetivo final cubre el **100 % de páginas, módulos y componentes activos**, e incorporó 21st.dev como referencia de dinamismo. Este archivo registra solo el primer ciclo. La cobertura integral y las referencias viven en [PLAN-100.md](../redisenio-2026-10-21/PLAN-100.md), [INVENTARIO.md](../redisenio-2026-10-21/INVENTARIO.md) y [REFERENCIAS-21ST.md](../redisenio-2026-10-21/REFERENCIAS-21ST.md). La aprobación visual de la base se solicitó y sigue pendiente; no se debe confundir el cierre técnico de Inicio con el cierre de la app completa.

## Alcance autorizado
Inicio representativo y componentes necesarios; vista previa local aislada. La dirección visual requiere validación del usuario antes de extenderla. No publicar en producción.

## Diagnóstico inicial
- Inicio reúne cuenta, fidelidad, visita y exploración, pero las superficies rígidas y el ritmo uniforme diluyen la jerarquía.
- Fotografía relegada al final y tarjetas pequeñas, distintas de las referencias con producto protagonista.
- Tipografía actual Libre Caslon/Work Sans difiere del manual Playfair/Montserrat.
- No existe repositorio Git en esta carpeta. Respaldo de fuentes y compilación previa en `antes/` antes de editar.
- La API tiene operaciones de negocio reales. La vista previa reutiliza el Worker con base PGlite sintética y bloqueo de conexiones externas.

## Decisiones
- **Confirmadas por el usuario:** manual como identidad, referencias adjuntas como dirección, vista previa antes de producción.
- **Propuestas, aún no aprobadas:** composición, curvas, tipografía aplicada y jerarquía de Inicio documentadas en `design-system.md` y `bar.md`.
- No modificar precios, catálogo, reglas, autenticación o lógica de negocio como parte del rediseño.

## Mejoras completadas
- Inicio integrado en el proyecto React/Vite existente. Cuenta y pase conservan prioridad; saldo, sellos, accesos y contenido editorial tienen jerarquías distintas.
- Playfair Display/Montserrat autoalojadas, cacao/rosa/borgoña, superficies curvas y fotos propias más amplias. Estilos limitados a Inicio y sus paneles.
- Navegación horizontal en escritorio y cinco destinos móviles; acceso «Conocé tu club» conservado en el pie.
- Vista previa local con Worker real, credenciales sintéticas, PGlite en memoria y bloqueo de conexiones externas. No se ejecutó un despliegue.
- Respaldo previo en `antes/`, comparativas en `evidencia/`, instrucciones en `LEEME.md`.

## Revisiones independientes y correcciones

| Revisión | Ronda inicial | Corrección y resultado final |
| --- | --- | --- |
| Objetivo/funcionalidad | FAIL: título desbordaba con texto al 200 % a 320 px | Contenedor flexible y salto de palabra; segunda ronda PASS a 320 y 390 px. |
| Identidad/accesibilidad | FAIL: fuentes residuales, texto negro en pase y foco tapado por barra móvil; reserva del logo insuficiente | Fuentes y color unificados, margen de desplazamiento para el foco y reserva H/4; segunda ronda PASS. |
| Acabado visual | PASS en su primera revisión independiente | Sin defectos importantes. Oportunidad futura: compactar el tramo de bloques secundarios antes de la fotografía en móvil. |

Informes completos: `revision-objetivo.md`, `revision-identidad.md`, `revision-acabado.md`. Los tres revisores fueron independientes de la implementación y examinaron el navegador. Ningún PASS sustituye la aprobación visual del usuario.

## Verificación final
- Compilación, TypeScript, reglas del guardián y catálogo de iconos: correctos.
- Backend de Inicio: 5 grupos superados sobre datos de prueba.
- Regresión de interfaz existente: 9 grupos superados; incluye premio, errores, cambio de cuenta y métricas de administración.
- Aceptación del rediseño: 9 grupos superados; siete anchos entre 320 y 1440 px, rutas, privacidad, pase, recarga, errores y recuperación.
- Axe: cero hallazgos en Inicio móvil, escritorio y pase dentro de las reglas automáticas ejecutadas. Teclado y texto al 200 % comprobados aparte.
- Cero errores JavaScript y cero solicitudes externas en los recorridos de aceptación. Sin imágenes fallidas ni desbordamiento accidental.
- Rendimiento local: mediana LCP 56 → 52 ms; CLS 0,0654 → 0,0744; recursos 460.577 → 606.533 bytes. Son tres cargas de cada compilación, sin limitación de red/CPU. No acreditan rendimiento de producción. El aumento de descarga se conserva como coste explícito de esta propuesta, no se presenta como una mejora.

## Decisiones pendientes y continuidad
- **Pendiente de aprobación visual:** composición de Inicio, tipografía aplicada, curvas y adaptación del logo móvil a 100–118 px. El logo conserva proporción y reserva, pero su tamaño compacto no cumple literalmente la propuesta de 280–320 px del manual.
- Antes de producción: verificar redes/dispositivos reales y lector de pantalla. La carga inicial todavía solicita Work Sans durante el arranque; evitar esa descarga es una optimización futura acotada (~50 kB).
- No se certificaron todas las operaciones de compra, reserva y administración de las otras pantallas; no forman parte de este ciclo.
- Los enlaces Pinterest no pudieron inspeccionarse directamente; se usaron las imágenes adjuntas y la referencia de Dribbble disponible. No se atribuyen detalles no vistos.
- **Siguiente mejora recomendada, tras aprobar la dirección:** Carta y detalle de producto, reutilizando el sistema propuesto. Después evaluar Mi Club, reservas, tienda y perfil por ciclos.

Estado del ciclo 1: implementado, revisado y verificado para entrega local. Sin hallazgos críticos o importantes abiertos dentro de Inicio. Espera validación visual antes de extenderse o publicar.
