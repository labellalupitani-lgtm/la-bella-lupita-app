# Informe final — Fase 2: Sistema de fidelización + membresía para vender más ("Club Lupita")

**Fecha:** 20 de agosto de 2026 · **Propósito:** el cliente quiere un sistema grande para vender más; le interesan fidelización y membresía. Este informe diseña el sistema y reúne la evidencia.
**Informe interactivo:** https://claude.ai/code/artifact/628aac88-d25d-4378-905f-2e57454a1886
**Hallazgos completos:** [findings_membresias_pago.md](findings_membresias_pago.md) · [findings_mecanicas_lealtad.md](findings_mecanicas_lealtad.md) · [findings_latam_ecosistema.md](findings_latam_ecosistema.md)

---

## Veredicto

**No elegir entre fidelización y membresía: construir ambas como capas de un mismo ecosistema sobre una cuenta única.** La lealtad gratuita es el embudo (registra a todos y fabrica frecuencia); la membresía de pago es el monetizador (McKinsey: los miembros de programas de pago son 60% más propensos a gastar más — el doble que en programas gratuitos, 30%).

**La ventana en Nicaragua es excepcional:** ningún restaurante de Managua ofrece un programa integrado; Starbucks Rewards llegó a El Salvador y Guatemala en 2024 pero no a Nicaragua; Leal (plataforma líder de lealtad en CA) no opera en el país; y el consumidor ya fue educado en puntos/membresías por Puntos BAC (1,000+ comercios) y la tarjeta La Colonia (5% diario). First-mover real.

## El sistema en 4 capas

1. **Cuenta única + lealtad gratuita** (ligada al número de WhatsApp; registro en caja en 30 s):
   - Sellos café "9+1" con 2 de regalo (endowed progress: +79% de completado; goal-gradient: +20% de aceleración de compra — evidencia en cafés reales).
   - Puntos por gasto para el bistró (primera recompensa en ≤2 visitas).
   - 3 niveles estilo Amigos Juan Valdez; el nivel alto paga con experiencias de la finca (catas, café del mes) — costo marginal mínimo.
   - 1 reto rotativo personalizado (patrón Starbucks post-double-star; KFC Rewards Arcade: +107% canjes) + referidos bilaterales (convierten 3–5x).
   - **Motor CRM WhatsApp** (98% apertura): bienvenida, cumpleaños −7 días (~35% canje), winback día 45 (~12%), post-visita. Con lealtad automatizada: 20–30% de facturación de recurrentes vs 8–12% sin programa.

2. **Membresía de pago "Club Lupita"** (el corazón):
   - NO "ilimitado" puro: Pret lo mató en 2024, Leon en dic-2025, y Panera le puso topes el 19-ago-2026 (30 bebidas/mes, 1/día). Sobrevive el modelo cuota baja + estatus VIP + topes (P.F. Chang's Platinum US$6.99, 4 años activo; Palace Coffee 200–250 miembros estables).
   - Cuota ≈ 3–5× el precio del americano (≈US$8–12/mes en Managua), autorenovación (Taco Bell sin autorenovación: 16% de renovación).
   - **Ancla física: 1 bolsa mensual del café de la finca incluida** — justifica la cuota sin visita, garantiza visita de retiro con attach, y es incopiable en Managua.
   - 1 bebida de la casa por día de visita (o 50% off estilo Pret v2), premium excluidas; 10–15% en el resto (nunca más: lección Pret); estatus VIP (prioridad Salón VIP, catas).
   - Evidencia del modelo: Panera = 25% de todas sus transacciones, attach ≥30%, frecuencia hasta 8x/mes; Palace: visitas de 1–2 → 3–4/semana.

3. **Monedero prepago con bono** ("recargá C$1,000 → recibí C$1,100"):
   - Mecánica Starbucks: US$1,780M de float, ~US$207M/año de breakage (≈4% de utilidades).
   - 47% sobregasta el saldo; en restaurantes 81–84% sobregasta (+US$20–35/visita).
   - El bono se paga en COGS (10–30%), no en efectivo; recarga en caja con efectivo = compatible con la cultura local; gift cards digitales del mismo wallet.

4. **B2B corporativo** (Salón VIP como producto recurrente):
   - Paquete: horas de Salón VIP/mes + suscripción de café en grano para la oficina (estilo Café Britt Coffee Club: 10% + entrega + pausar/cancelar) + descuento a empleados registrados + facturación mensual.
   - Eventos privados: hasta 30%+ de ingresos con ingreso garantizado. Cada empleado registrado siembra la Capa 1.

## Economía ilustrativa (calibrar con carta real)

- 200 miembros × C$400/mes ≈ **C$960,000/año (~US$26,000) de ingreso fijo anticipado** (ancla: Palace US$30–37K/año con 200–250 miembros).
- - attach de comida en ≥30% de visitas extra sobre ticket C$280–460.
- - float y breakage del monedero + MRR B2B.

## Los 6 errores prohibidos (todos con cadáver documentado)

1. "Ilimitado" sin topes (Pret †2024, Leon †2025, Panera recortado 2026) — topes el día 1.
2. Descuento plano en comida dentro de la cuota (canibaliza el margen).
3. Complejidad (Sweetgreen Sweetpass+ †2025 "demasiado complicado"; Starbucks Odyssey †2024).
4. Sin autorenovación (Taco Bell: 16%).
5. Descuentos masivos indiscriminados + quemar la lista (43% de bajas por sobre-mensajeo) — ROI incremental y retos segmentados.
6. Ignorar el pasivo de puntos (26% nunca se canjea; puntos que expiran = frustración #2) — vigencia 12+ meses renovable, canje sin fricción.

## KPIs para la oferta

% de transacciones identificadas (benchmarks: Panera 25%, Starbucks MX 40%, OXXO 50.4% — meta año 1: 30–40%) · attach rate ≥30% · miembros de pago y churn (benchmark indie 200–250) · saldo prepago vivo y breakage · MRR B2B · frecuencia miembros vs no miembros.

## Implementación (cada fase financia la siguiente)

1. Cuenta única + lealtad gratuita + CRM WhatsApp (produce la base identificada).
2. Membresía Club + Monedero (se lanza a la lista caliente de la Capa 1).
3. B2B + app móvil de marca (la app del informe fase 1 se vuelve el carnet del club: sellos, saldo, retos, order-ahead, tienda de la finca).

## Referentes para citar en la oferta

Starbucks/Alsea México (40% transacciones de miembros) · Panera Sip Club (25% de transacciones, attach ≥30%) · P.F. Chang's Platinum (longevidad del modelo cuota baja+VIP) · Palace Coffee (la escala indie: 200–250 miembros) · Amigos Juan Valdez (niveles de marca con origen) · Café Britt (suscripción CA) · OXXO Spin Premia (tender 50.4%) · Puntos BAC y La Colonia (familiaridad local).

**Nota:** montos en C$ son supuestos ilustrativos; cifras de proveedores (Paytronix, Antavo, Craver) son casos publicados por ellos — usarlas como orden de magnitud.
