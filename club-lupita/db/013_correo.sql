BEGIN;
-- El correo verificado es la credencial; el teléfono continúa como contacto
-- y clave interna para no alterar compras, saldos ni sesiones existentes.
ALTER TABLE socio ADD COLUMN IF NOT EXISTS correo text;
ALTER TABLE socio ADD COLUMN IF NOT EXISTS correo_verificado timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS socio_correo_unico ON socio(lower(correo)) WHERE correo IS NOT NULL;
CREATE TABLE IF NOT EXISTS codigo_correo (
  id uuid PRIMARY KEY,
  correo text NOT NULL,
  huella text NOT NULL,
  creado timestamptz NOT NULL DEFAULT now(),
  vence timestamptz NOT NULL DEFAULT now()+interval '10 minutes',
  intentos integer NOT NULL DEFAULT 0,
  usado timestamptz,
  registro_huella text,
  registro_vence timestamptz,
  registro_usado timestamptz
);
CREATE INDEX IF NOT EXISTS codigo_correo_busqueda ON codigo_correo(correo,creado DESC);
COMMIT;
