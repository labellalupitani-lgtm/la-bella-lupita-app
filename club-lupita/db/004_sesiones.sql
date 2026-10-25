-- Club Lupita — identidad y sesión.
--
-- La API se publicó sin autenticación: cualquiera podía acuñar saldo con un
-- curl, o recorrer los ocho dígitos de un móvil nicaragüense y leer nombre,
-- alergias, cumpleaños y saldo de cualquier socio. Esto lo cierra.
--
-- La identidad de la casa es el número de WhatsApp, así que la verificación
-- también: se manda un código de seis dígitos y solo quien lo recibe entra.

BEGIN;

CREATE TABLE IF NOT EXISTS codigo_acceso (
  id        bigserial PRIMARY KEY,
  telefono  text NOT NULL CHECK (telefono ~ '^[0-9]{8,15}$'),
  -- No se guarda el código: se guarda su huella. Si alguien lee la tabla,
  -- no puede entrar con lo que ve.
  huella    text NOT NULL,
  creado    timestamptz NOT NULL DEFAULT now(),
  vence     timestamptz NOT NULL,
  usado     timestamptz,
  intentos  smallint NOT NULL DEFAULT 0 CHECK (intentos <= 5),
  CHECK (vence > creado)
);

CREATE INDEX IF NOT EXISTS codigo_vivo_idx
  ON codigo_acceso (telefono, creado DESC) WHERE usado IS NULL;

-- Un código vivo por número: pedir uno nuevo invalida el anterior.
CREATE OR REPLACE FUNCTION emitir_codigo(p_telefono text, p_huella text, p_minutos int DEFAULT 10)
RETURNS bigint
LANGUAGE plpgsql AS $$
DECLARE nuevo bigint;
BEGIN
  UPDATE codigo_acceso SET usado = now()
   WHERE telefono = p_telefono AND usado IS NULL;
  INSERT INTO codigo_acceso (telefono, huella, vence)
  VALUES (p_telefono, p_huella, now() + make_interval(mins => p_minutos))
  RETURNING id INTO nuevo;
  RETURN nuevo;
END $$;

-- Freno de fuerza bruta: máximo 5 códigos por número por hora.
CREATE OR REPLACE FUNCTION puede_pedir_codigo(p_telefono text)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT count(*) < 5 FROM codigo_acceso
   WHERE telefono = p_telefono AND creado > now() - interval '1 hour';
$$;

COMMIT;
