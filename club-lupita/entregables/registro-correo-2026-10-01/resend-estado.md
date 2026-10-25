# Integración Resend · 1 octubre 2026

Publicada versión `37713d8a-665c-4f3c-8f55-3a2cc9e1838e` en https://app.labellalupita.com.

- `RESEND_API_KEY` guardada como secreto del Worker, con permiso de envío únicamente.
- Remitente configurado: `La Bella Lupita <acceso@labellalupita.com>`.
- Resend confirma plan Free; Pay-as-you-go desactivado.
- Reservas de envío atómicas: máximo 100 por día UTC y 3000 en 31 días móviles. Los fallos consumen reserva. El uso externo a esta app queda sujeto al límite de la cuenta Resend.
- Pruebas `npm test` y `npm run build` correctas, incluyendo transporte simulado, límites, vencimiento, registro y reingreso.
- DNS público en 1.1.1.1 coincide con el panel: TXT `resend._domainkey`, CNAME `rsend` y `send`; sin proxy.
- Dominio Verified en Resend; ACCESO_CORREO=true publicado y capacidades públicas confirmadas.
- Prueba autorizada enviada desde el formulario real a arturo.ordonezv@gmail.com. Resend confirmó Delivered; id 01a0f966-066e-7877-acef-933b21975353.
- Formulario abierto en el navegador de la app, esperando el código que recibió el usuario. No se creó una cuenta ficticia ni se inventaron nombre/teléfono.
- Captura de la confirmación: codigo-enviado.png.

El registro público está habilitado. La verificación del código y los datos personales los completa el usuario en la app. Las pruebas automatizadas cubren el flujo completo de alta y reingreso.

No hay suscripciones de pago contratadas durante esta configuración.
