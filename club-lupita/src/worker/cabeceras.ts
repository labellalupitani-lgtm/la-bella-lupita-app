import type { MiddlewareHandler } from 'hono'

// Los activos se sirven antes del Worker: mantener esta política alineada con
// public/_headers. Google Fonts solo se necesita en la entrada heredada.
export const CABECERAS_SEGURIDAD = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
} as const

export const cabecerasSeguras: MiddlewareHandler = async (c, next) => {
  await next()
  // También las rutas que devuelven Response directamente (errores de negocio),
  // que no consumen las cabeceras preparadas de c.json/c.body.
  for (const [nombre, valor] of Object.entries(CABECERAS_SEGURIDAD)) c.header(nombre, valor)
}
