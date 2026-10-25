# Plan de diseño en Google Stitch — Prototipo visual "Club Lupita"

**Fecha:** 20 de agosto de 2026 · **Herramienta:** Google Stitch vía MCP · **Propósito:** prototipo visual muy detallado de la plataforma diseñada en las fases 1–3, para presentar en la oferta comercial a La Bella Lupita Bistró Café.

---

## 1. Objetivo y alcance

**Objetivo:** que el dueño VEA su sistema — no que lo imagine. El prototipo materializa las piezas de mayor valor de la investigación: cuenta única + lealtad (fase 2), membresía con house account + monedero (fases 2–3), tienda de la finca con transparencia radical y drops (fase 3), experiencias prepagadas tipo Tock (fase 3), reservas + Salón VIP (fase 1) y el CRM "sentirse conocido" del lado del staff (fase 3).

**Alcance:** 1 proyecto Stitch · 1 sistema de diseño · **15 pantallas** (13 móviles de la app del socio + 2 de escritorio del lado del negocio). Idioma de la interfaz: **español nicaragüense con voseo** ("Vení", "Recargá", "Pedí" — el mismo registro que la marca usa en Instagram).

**Criterio de calidad:** cada pantalla debe (a) demostrar una palanca de negocio investigada, (b) usar datos realistas del cliente (menú y precios reales de su web), y (c) mantener el sistema de diseño sin desvíos.

---

## 2. Sistema de diseño "Casa Lupita"

### 2.1 Tokens

| Token | Valor | Uso |
|---|---|---|
| Verde hoja de café | `#2F5D45` | Color primario (seed): botones, tabs activos, énfasis |
| Oro miel | `#C08A2D` | Secundario: membresía, sellos, cifras, celebración |
| Café tostado | `#5C3A21` | Terciario: acentos cálidos, ilustración |
| Porcelana | `#F6F3EC` | Neutro/fondos claros |
| Espresso | `#221E17` | Tinta / superficies oscuras del carnet |

- **Modo:** LIGHT (el carnet de membresía y el QR usan tarjetas oscuras espresso como contraste premium).
- **Tipografía:** titulares **Libre Caslon Text** (serif cálida, alma de casa de café); cuerpo y UI **Work Sans**; etiquetas Work Sans en mayúsculas con tracking.
- **Redondez:** ROUND_TWELVE (tarjetas suaves, botones pill en CTAs principales).
- **Variante de color:** FIDELITY (respeta los hex de marca).

### 2.2 designMd (se sube como instrucciones del sistema)

Incluye: historia de marca (finca familiar 1971, Matagalpa/Jinotega, +1,200 m), tono de voz con voseo y ejemplos, reglas de componentes (tarjeta de sellos con granos de café, carnet dorado/espresso, chips de cupo "quedan X", barras de progreso goal-gradient, precios en C$ con `C$ 000` ), dirección de fotografía (café de especialidad cálido: latte art, repostería, montañas cafetaleras, luz crema), y prohibiciones (no stock genérico corporativo, no morados/azules, no inglés en la UI).

---

## 3. Inventario de pantallas (con copy y palanca de negocio)

**Datos reales del cliente usados:** Risotto de Gallo Pinto C$280 · Dulce Tentación C$320 · Bagel de Salmón C$430 · Baba Ganoush C$460 · Iced Coffee Latte · Waffle "El Consentido" · Costillas BBQ · horarios L–S 7:00–21:00 / D 8:00–21:00 · Plaza La Fe, Km 7.5 carretera sur. Precios de bebidas y nombres de lotes = supuestos de demo (calibrar con la carta real).

**Persona demo:** María F. · nivel **Barista** (niveles: Amiga de la Casa → Barista → Reserva Lupita) · Socia Fundadora #037 · saldo C$1,240.

| # | Pantalla (deviceType) | Palanca que demuestra | Contenido clave |
|---|---|---|---|
| 1 | Bienvenida / onboarding (M) | Marca + registro sin fricción | Hero de finca, "Tres generaciones. Una taza." Registro con número de WhatsApp; beneficio de bienvenida: 2 sellos de regalo |
| 2 | Home del socio (M) | El ecosistema en una vista | Saludo, nivel + progreso, mini tarjeta de sellos 7/9, saldo monedero, reto de la semana 2/3, carrusel: drop de cosecha + Mesa del Tostador; accesos: Pedir · Reservar · Tienda |
| 3 | Sellos + QR (M) | Goal-gradient, canje sin fricción | Tarjeta 9+1 con granos como sellos ("te falta 1 ☕ para tu bebida de cortesía" en el 8/9... demo: 7/9), QR grande de canje, historial |
| 4 | Monedero Lupita (M) | Float + bono + gift | Saldo C$1,240; "Recargá y recibí bono": C$500→+C$40, C$1,000→+C$100, C$2,000→+C$240; pagar con QR; "Regalá una tarjeta Lupita" |
| 5 | Carnet Club Lupita (M) | Membresía house-account, cupo | Carnet espresso/oro "Socia Fundadora #037 · 82/100"; beneficios del mes: bolsa 250 g del lote del mes LISTA PARA RETIRAR, 1 filtrado por visita, 15% repostería, prioridad Salón VIP; renovación auto 5 sep |
| 6 | Menú pedido anticipado (M) | Order-ahead | Tabs Barra/Brunch/Bistró/Sobremesa; cards con foto y precio; "listo en 15 min"; buscador |
| 7 | Detalle de producto + carrito (M) | Ticket alto, upsell | Bagel de Salmón C$430, extras, sugerencia "acompañalo con Iced Coffee Latte C$120"; sheet de carrito, "Pagá con tu monedero" |
| 8 | Tienda de la finca (M) | E-commerce + suscripción + drop | Café en grano 250/500 g, Espresso Portable ×6, card de suscripción mensual (−10%, pausá cuando querás); banner drop: "Reserva de Cosecha 2026 · quedan 34 de 150 bolsas numeradas" |
| 9 | Lote — transparencia radical (M) | Playbook Onyx | "Lote 04 · El Aguacatal": 87.5 pts SCA, 1,250 m, honey, cosecha feb 2026, finca desde 1971; línea de tiempo 3 generaciones; botón "Reservá de esta cosecha"; guía de preparación |
| 10 | Experiencias (M) | Tickets prepagados tipo Tock | Lista: Mesa del Tostador vie 12 sep · 8/12 cupos · C$1,150; Cata & maridaje cacao nica C$950; Tour Finca Matagalpa sáb 4 oct C$1,100; badge "Socios: acceso anticipado" |
| 11 | Detalle de experiencia (M) | Escasez + prepago | Mesa del Tostador: storytelling, incluye flight de 3 lotes + maridaje; "quedan 4 cupos"; ticket prepagado transferible, no reembolsable; pagar con monedero |
| 12 | Reservas + Salón VIP (M) | Anti no-show con depósito | Selector personas/fecha/hora; tipos: Café·Brunch·Bistró·Salón VIP; VIP pide depósito C$500 (se abona a la cuenta); confirmación por WhatsApp |
| 13 | Perfil + referidos (M) | Datos + referidos bilaterales | Datos, cumpleaños (regalo −7 días), bebida de siempre, alergias; progreso anual a Reserva Lupita; "Invitá a un amigo: una bebida para vos y otra para él" |
| 14 | Staff — ficha de servicio (D) | CRM "sentirse conocido" | Vista de tablet/desktop del barista: check-in de María F. → foto, nivel, bebida de siempre (capuchino con leche de almendra), alergia (nueces), aniversario próximo, gasto del mes, sellos 7/9, notas |
| 15 | Dueño — panel KPIs (D) | Medición del sistema | % transacciones identificadas 34%, attach 31%, socios 82/100 + lista de espera 17, saldo prepago vivo C$186,000, MRR B2B, ventas por evento, curva de retención |

---

## 4. Ejecución en Stitch (orden y verificación)

1. `create_project` → "Club Lupita · La Bella Lupita".
2. `create_design_system` (tokens §2.1 + designMd §2.2) → `update_design_system` para aplicarlo y mostrarlo.
3. `generate_screen_from_text` × 15, **secuencial** (la generación toma minutos; sin reintentos — ante timeout, `get_screen` cada 30 s), siempre con `designSystem: assets/{id}` y `modelId: GEMINI_3_1_PRO`; deviceType MOBILE (1–13) y DESKTOP (14–15).
4. Prompts: en inglés (mejor adherencia del generador) con TODO el copy de UI en español nicaragüense incluido literalmente; cada prompt fija layout arriba→abajo, datos y componentes.
5. Verificación: `list_screens` al final + revisión de títulos; si una pantalla sale fuera de sistema, `edit_screens` puntual o `apply_design_system`.
6. Entrega: enlace del proyecto Stitch al usuario + resumen de pantallas. (Opcional posterior: `generate_variants` de la Home para dar 2–3 direcciones al cliente.)

**Riesgos:** timeouts de generación (mitigado con polling), deriva de estilo entre pantallas (mitigado con designSystem + designMd + copy fijado), límites de cuota de Stitch (si aparecen, priorizar pantallas 2, 5, 8, 9, 10, 14 — las seis más vendedoras).
