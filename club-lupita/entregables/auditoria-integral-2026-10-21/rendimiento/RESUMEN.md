# Rendimiento de laboratorio

Edge headless Windows, viewport390x844, 3contextosfríos/ruta/perfil; local sinthrottle; redlenta150ms/1.6Mbpsdown/0.75Mbpsup, CPU normal. Primer botón visible, latencia automatizada click→2rAF incluye Playwright,no INP de campo. CLS hasta800ms tras h1/networkidle/fonts.ready; muestra no exhaustiva.

| Condición | Ruta | LCP mediana ms | CLS mediana / máximo | Clic→2frames mediana ms |
|---|---|---:|---:|---:|
| local | / | 176 | 0.0038 / 0.0038 | 45 |
| local | /pedir | 160 | 0.0004 / 0.0009 | 88 |
| local | /tienda | 156 | 0.1204 / 0.1204 | 48 |
| local | /club | 164 | 0.1188 / 0.1516 | 63 |
| local | /reservar | 192 | 0.0009 / 0.0009 | 72 |
| local | /perfil | 152 | 0.0007 / 0.0007 | 53 |
| local | /personal?seccion=pedidos | 60 | 0.0000 / 0.0000 | 67 |
| red-lenta | / | 3288 | 0.0007 / 0.0007 | 42 |
| red-lenta | /pedir | 3472 | 0.0009 / 0.0009 | 111 |
| red-lenta | /tienda | 3556 | 0.0732 / 0.0732 | 76 |
| red-lenta | /club | 3696 | 0.1192 / 0.1192 | 107 |
| red-lenta | /reservar | 1564 | 0.0012 / 0.0012 | 83 |
| red-lenta | /perfil | 3784 | 0.0007 / 0.0007 | 73 |
| red-lenta | /personal?seccion=pedidos | 3996 | 0.0022 / 0.0022 | 71 |

No son métricas de campo ni percentiles poblacionales. Tres muestras no estiman p75. Clic incluye automatización; no se llama INP. La primera exploración se conserva aparte y no se usa para conclusiones porque podía terminar antes del contenido diferido. El protocolo final espera h1, inactividad de red (máximo6s), fuentes y800ms adicionales. La CPU no se ralentizó y la red es emulada. Los saltos de Tienda/Club requieren atribución específica antes de cambiar implementación.
