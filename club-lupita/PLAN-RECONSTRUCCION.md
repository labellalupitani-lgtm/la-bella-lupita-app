# Reconstrucción Casa Lupita — plan de obra

> Reemplazar el 100 % de la capa visual de la app en producción por el sistema del
> prototipo de Google Stitch, cerrar los huecos del PRD y dejar cada pantalla
> funcional de punta a punta, con diez agentes de prueba como puerta de salida.
>
> Informe visual: https://claude.ai/code/artifact/0d1c927a-5813-4abb-9604-63a61ca0bc64
> Auditoría previa: https://claude.ai/code/artifact/8c328c47-b12c-49a5-a628-9481e370c0bb
>
> Sustituye a `PLAN.md`, que documenta el sistema «Renglón y Sello» que este plan retira.

## Supuesto explícito

El «100 %» se aplica a la **capa de diseño y de producto**: tokens, componentes,
pantallas, navegación, copy e iconografía. La API en producción (18 endpoints,
13 tablas, autenticación por WhatsApp) **se conserva y se amplía**, no se borra:
destruirla no acerca el diseño al prototipo y sí añade riesgo de regresión en lo
único que hoy está probado contra datos reales.

Si se decide rehacer también el backend desde cero, hay que reordenar las fases 2 y 6.

## Alcance

| | Líneas | Archivos |
|---|---|---|
| Se reescribe entero | 8.240 | `styles/*` (4.196) · `pantallas/*` (3.181) · `componentes/*` (788) · `BarraDeLaCasa.tsx` (127) |
| Sobrevive | 3.173 + 121 imágenes | `worker/index.ts` (875) · `db/*.sql` · `data/menu.ts` (77 platos) · `public/menu/` (36 platos × 3 resoluciones) · `lib/movimiento.ts` · `lib/api.ts` · `router.tsx` · `format.ts` |

**Nace:** Tailwind con la configuración exacta del export · Libre Caslon Text y Work Sans
autoalojadas · Material Symbols subconjuntada · 7 tablas nuevas y ~20 endpoints ·
la pantalla de gestión de eventos que el PRD pide y el prototipo no diseñó.

## Decisión técnica: adoptar Tailwind, no traducirlo

El prototipo **está escrito en Tailwind**, con `tailwind.config` explícito: 52 colores,
4 radios, 2 familias. Se copia tal cual y el marcado se convierte en componentes de React
casi línea por línea. Así la conformidad deja de ser un juicio y pasa a ser un diff que
el agente A1 puede verificar y el build puede fallar.

Traducir a CSS propio es lo que produjo la divergencia actual. No se repite.

---

## Fase 0 · Congelar la especificación — 2-3 días, **bloqueante, sin código**

Diez decisiones que el prototipo toma dos veces y de dos maneras distintas:

1. **La tanda: ¿nueve sellos o diez?** Móvil dice `7/10`; caja dice `7/9`.
2. Nombre de marca: Casa Lupita (11 pantallas) / Club Lupita (6) / La Bella Lupita (3).
3. Variante canónica por vista — 12 pantallas para 7 vistas, y las dos de analítica no son equivalentes.
4. Juego de iconos del tab bar — «Pedir» tiene 4 iconos, «Tienda» 4, «Club» 3.
5. Estado activo de la pestaña — píldora verde rellena o rectángulo gris.
6. Menú lateral de staff — hay cuatro distintos en cuatro pantallas.
7. Niveles y umbrales — el PRD nombra 2, el prototipo muestra 3 y habla de «620 pts» sin definir cómo se ganan.
8. Kits de regalo — ¿dentro de la app o fuera y se quita del PRD?
9. Pago con tarjeta — ¿pasarela contratada o se retira «Visa ····4412» del diseño?
10. Año del dato de demostración — conviven 2023, 2024 y 2026.

**Salida:** `SPEC.md` firmado y `DESIGN.md` reescrito. Sin esos dos archivos, la fase 1 no arranca.

## Fase 1 · Fundación visual — 3-4 días

1. `tailwind.config` con los 52 colores, 4 radios y 2 familias del export, sin editar.
   Un test falla el build ante cualquier color fuera de la configuración.
2. Libre Caslon Text y Work Sans autoalojadas y subconjuntadas.
3. Material Symbols Outlined subconjuntada a los iconos congelados en fase 0, servida local.
4. Los quince componentes base: tarjeta, carnet oscuro, botón píldora primario y secundario,
   chip de filtro, chip de escasez, buscador, fila de lista, barra de progreso, sello, tab bar,
   cabecera fija, banner de aviso, hoja inferior, tabla y KPI.
5. Página de kit con los quince componentes en todos sus estados, incluido foco de teclado.

## Fase 2 · Backend — 8-11 días, **riesgo alto**

Doce funciones que el diseño promete y hoy no tienen ni tabla ni endpoint:

| # | Función | Evidencia en el prototipo | Construir |
|---|---|---|---|
| 1 | **Motor de puntos y niveles** | «620 pts para Reserva Lupita» | Tabla `punto`, reglas, umbrales. **Hoy la app mide tandas, no puntos: es cambio de modelo de negocio** |
| 2 | **Pedidos y carrito** | «2 artículos · C$ 380» · «Retirás en 15 min» | `pedido`, `pedido_linea`, estados, cola de barra |
| 3 | Catálogo de tienda | Lote 04 250 g C$ 380 · pack ×6 C$ 540 | `producto_tienda` con existencias |
| 4 | Suscripción de la finca | C$ 342/mes, saltar y pausar | `suscripcion`, ciclo de cobro, bajas |
| 5 | Retos semanales | «3 visitas esta semana, vas 2/3» | `reto`, `reto_progreso`, evaluación al sellar |
| 6 | Multiplicador de sellos | Insignia «2× SELLOS HOY» | Reglas por producto y día |
| 7 | Referidos | «Compartí tu código: MARIA037» | `referido`, canje en primera visita |
| 8 | **Gestión de eventos y cupos** | El PRD lo pide, el prototipo no lo diseñó | Pantalla nueva + endpoints de escritura |
| 9 | Campañas WhatsApp | «62 % de apertura» | WhatsApp Business API, `campana`, `campana_envio`, webhooks |
| 10 | Notificaciones WhatsApp | El perfil dice «Activadas»; el código dice que no existe | La misma integración; también hace real el código de acceso |
| 11 | Pago con tarjeta | «Visa ····4412» | Pasarela con tokenización, o se retira (decisión fase 0) |
| 12 | KPI de retención | El PRD lo pide; ninguna variante lo muestra | Cohortes sobre `sello` y `membresia` |

Migraciones `009`–`016`, reversibles, cada una con sus datos de prueba.

## Fase 3 · Las cinco pestañas del socio — 6-8 días

| Pestaña | Absorbe | Contenido |
|---|---|---|
| **Inicio** | `/` `/tanda` `/cuenta` | Cabecera con avatar y campana · carnet oscuro con saldo · tarjeta de sellos con barra · reto semanal · «Pasa en la casa» · tres accesos rápidos |
| **Pedir** | `/carta` | Buscador, filtros píldora, rejilla 2 columnas con foto a sangre, insignia, botón «+» flotante, barra de carrito |
| **Tienda** | `/finca` `/finca/lote` | Banner de Reserva de Cosecha, fichas de producto, suscripción y trazabilidad con timeline |
| **Club** | `/experiencias` `/reservar` `/mesa-fundadora` | Membresía y beneficios, experiencias con cupos, detalle y reserva de mesa |
| **Perfil** | `/perfil` | Avatar editable, nivel con barra, referidos, preferencias, pago, notificaciones |
| Onboarding | `/umbral` | Foto de finca a sangre con tarjeta blanca flotante |
| Sale de la app | `/mostrador` | Pasa al panel de escritorio |

Las 36 fotos de plato ya existentes cubren «Pedir». Faltan finca, tienda y experiencias:
se producen en esta fase con la dirección fotográfica del `DESIGN.md`.

## Fase 4 · Panel de escritorio — 3-4 días

1. Resumen de analítica — los seis KPI del prototipo más retención, sobre datos reales.
   Si un indicador no se puede calcular, se declara pendiente en pantalla; no se inventa.
2. Check-in en caja — la pantalla más resuelta del prototipo y la de más valor operativo.
3. Gestión de eventos y cupos — pantalla nueva, sin mockup; se diseña con el kit de fase 1.
4. Menú lateral y roles — barista, encargado y dueño no ven lo mismo.
5. Autenticación de staff — hoy es una cabecera secreta compartida (`x-casa`).
   Pasa a sesión por usuario con auditoría de quién selló y quién canjeó.

## Fase 5 · Movimiento — 2 días

La Fase 5 del PRD sigue abierta porque el prototipo es HTML estático. Se porta
`lib/movimiento.ts` (5 duraciones, 6 curvas, `prefers-reduced-motion`) y se definen
las cinco micro-interacciones de fidelidad: sello que cae, barra que sube de nivel,
carnet que atrapa la luz, cupo que baja, recarga que acredita.

Presupuesto: ninguna transición sobre 320 ms salvo ritos. Cero animación en el panel de staff.

## Fase 6 · Diez agentes de prueba — 4-6 días

Cada agente trabaja **aislado y sin ver los hallazgos de los demás**. Ninguno aprueba su propio trabajo.

| Agente | Herramienta | Verifica | Criterio de paso |
|---|---|---|---|
| A1 | Playwright + diff de píxel y clases | Conformidad visual contra los 23 PNG | ≤2 % píxeles divergentes fuera de fotos · **cero** tokens fuera de `tailwind.config` |
| A2 | Recorrido + `PRD.txt` | Los 17 requisitos de la matriz | 17/17 en «Cumple», con captura |
| A3 | Playwright E2E | 14 flujos completos | 100 % verde en **tres ejecuciones seguidas** |
| A4 | Node + SQL directo | ~38 endpoints: contratos, autorización, concurrencia, cuadre | Cero fugas entre socios · el libro mayor cuadra tras 500 operaciones concurrentes |
| A5 | axe-core + teclado + lector | WCAG 2.2 AA | Cero violaciones críticas o serias · recorrido completo **solo con teclado** |
| A6 | Lighthouse + DevTools | Métricas web en 3G lento | LCP ≤2,5 s · INP ≤200 ms · CLS ≤0,1 · JS inicial ≤180 kB gz |
| A7 | Manual + guiones | Sesiones, autorización, IDOR, límites de tasa, inyección | Cero hallazgos altos o medios |
| A8 | Lectura completa de la UI | Voseo, córdobas, cero inglés, cero patrones oscuros | Cero anglicismos · formato de moneda uniforme |
| A9 | Instantáneas Playwright | Cada pantalla × 3 anchos × carga, error y vacío | Cero regresiones sin aprobar |
| A10 | Revisión cruzada | Qué **no probó nadie** | Cobertura declarada de cada pantalla y endpoint |

**Protocolo**

1. **Verificación adversarial.** Cada hallazgo pasa por tres verificadores cuya instrucción
   es *refutarlo*. Sobrevive si al menos dos no lo logran. Elimina el hallazgo plausible pero falso.
2. **Rondas hasta agotar.** Se repite hasta que **dos rondas seguidas** no den nada nuevo.
3. **Sin recortes silenciosos.** Todo muestreo o tope queda escrito en el informe.
4. **Puerta de salida.** No hay despliegue sin A1–A9 en verde y A10 declarando cobertura completa.
   La puerta la aplica el pipeline, no una persona.

---

## Definición de terminado

- [ ] Las 23 pantallas del prototipo tienen equivalente funcional, y A1 lo demuestra con diff.
- [ ] Los 17 requisitos del PRD en «Cumple», incluidos gestión de eventos, KPI de retención y kits de regalo.
- [ ] **Cero pantallas de adorno:** cada botón visible ejecuta una operación real contra la API.
- [ ] Las doce brechas funcionales tienen tabla, endpoint y prueba.
- [ ] Cero colores, radios o tipografías fuera de `tailwind.config`, verificado en el build.
- [ ] WCAG 2.2 AA sin violaciones críticas ni serias; la app se recorre entera solo con teclado.
- [ ] Métricas web dentro de presupuesto en móvil de gama media con 3G lenta.
- [ ] El libro mayor cuadra bajo carga concurrente.
- [ ] Un juego de datos de demostración coherente, con un solo año.
- [ ] `SPEC.md` y el código no se contradicen en ningún punto.

## Calendario y riesgo

| Fase | Días | Riesgo |
|---|---|---|
| 0 · Congelar | 2-3 | Que se salte «para avanzar». Es el error que produjo el problema actual |
| 1 · Fundación visual | 3-4 | Bajo |
| 2 · Backend | 8-11 | **Alto** — WhatsApp Business API y pasarela dependen de terceros y contratos |
| 3 · Cinco pestañas | 6-8 | Medio — falta fotografía de finca, tienda y experiencias |
| 4 · Panel | 3-4 | Medio — gestión de eventos se diseña sin mockup |
| 5 · Movimiento | 2 | Bajo |
| 6 · Diez agentes | 4-6 | Medio — el número de rondas depende de lo que encuentren |

**Total: 26-34 días de trabajo.**

> La fase 2 es más larga que la reconstrucción visual entera. El prototipo dibuja un producto
> bastante más ambicioso que el que hoy tiene servidor. Si el calendario aprieta, lo que se
> recorta es **alcance funcional declarado en la fase 0**, nunca pruebas ni conformidad visual:
> recortar ahí devuelve exactamente el problema que este plan viene a resolver.
