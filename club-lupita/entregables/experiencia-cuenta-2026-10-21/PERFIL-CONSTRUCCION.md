# Perfil · construcción y revisión propia

## Cambio

Identidad compacta con monograma y escena de terraza, tres paneles persistentes (A tu gusto, Tu cuenta, Datos y ayuda), preferencias que abren el editor en el campo correspondiente, cuenta con saldo e historial separados, detalles de privacidad y sesión desplegables. Texto y fotografía tienen relación con la visita, sin presentar una persona ajena como avatar del usuario.

Archivos: `src/casa/pantallas/Perfil.tsx`, `src/casa/pantallas/PerfilExperiencia.css` y prop opcional `solicitud` en `src/casa/componentes/CuentaCliente.tsx`. No se cambió la lógica de guardar, conciliar, recuperar, cerrar sesión ni ningún endpoint. El editor permanece montado fuera de los paneles; los paneles usan `hidden`, para no perder borradores al alternar.

## Iteraciones

1. Construcción de la nueva jerarquía y apertura contextual. Render real detectó que el recurso llamado salón incluía una persona: se sustituyó por la terraza vacía para evitar que pareciera la titular del perfil. Alt describe la imagen observada.
2. Aumentados los rótulos pequeños; «Solo vos» se sustituyó por «Tu acceso» para no insinuar privacidad exclusiva que el negocio no garantiza. Repetida la matriz propia sobre el estado corregido.

## Comprobado

`node entregables/experiencia-cuenta-2026-10-21/perfil-self-review.mjs` en preview sintética5290, frontend Vite, Edge headless con movimiento reducido y gutter nativo estable:

- 390/913/1440: sin overflow, fotografía cargada. En390:95 palabras visibles, documento1339px, Editar y363.86. La base anterior tenía460 palabras/4116px.
- 913: ancho de contenido898; geometría equivalente al gutter del panel del usuario.
- 320 + texto200%: sin elementos salientes ni overflow.
- Tres paneles: axe sin violaciones WCAG2A/AA/2.1AA en main.
- Cambiar bebida abre editor y enfoca bebida. Escape devuelve foco al botón original.
- Un borrador no guardado se conserva al cerrar, cambiar panel y abrir desde promociones; foco en consentimiento real, sin alterarlo.
- Tablist: flechas y Home cambian selección/foco correctamente.
- Cero errores JavaScript. TypeScript y guardián de tokens pasan.

Capturas y JSON en `perfil-construccion/`. No se guardaron cambios de perfil en el servidor compartido ni se cerró una sesión durante esta inspección. Aún corresponde revisión independiente y regresión transaccional completa por el coordinador; esta revisión propia no las sustituye.

## Adaptación legítima de pruebas previas

Para observar promociones o solicitar ayuda, activar tab «Datos y ayuda». Para cerrar una sesión, abrir después «Sesión y dispositivos». Datos y editor siguen disponibles aunque fallen recursos comerciales. Los nombres anteriores de Editar/Continuar/Guardar y los labels de formulario se conservan.
