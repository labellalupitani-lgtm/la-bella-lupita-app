BEGIN;
ALTER TABLE empleado ADD COLUMN IF NOT EXISTS version_clave integer NOT NULL DEFAULT 0 CHECK(version_clave>=0);
ALTER TABLE empleado ADD COLUMN IF NOT EXISTS requiere_cambio boolean NOT NULL DEFAULT false;
ALTER TABLE empleado ADD COLUMN IF NOT EXISTS clave_cambiada timestamptz;
ALTER TABLE empleado ADD COLUMN IF NOT EXISTS clave_temporal_vence timestamptz;
CREATE TABLE IF NOT EXISTS seguridad_propietario (
  id boolean PRIMARY KEY DEFAULT true CHECK(id),
  clave_huella text,
  version_clave integer NOT NULL DEFAULT 0 CHECK(version_clave>=0),
  clave_cambiada timestamptz
);
-- NULL conserva la credencial de arranque. Una vez rotada, nunca se vuelve a
-- aceptar CASA_SECRETO: todas las puertas consultan esta misma fila.
INSERT INTO seguridad_propietario(id) VALUES(true) ON CONFLICT(id) DO NOTHING;
COMMIT;
