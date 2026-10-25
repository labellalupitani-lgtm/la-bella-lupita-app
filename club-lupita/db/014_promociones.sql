BEGIN;
ALTER TABLE socio ADD COLUMN IF NOT EXISTS promociones_correo boolean NOT NULL DEFAULT false;
ALTER TABLE socio ADD COLUMN IF NOT EXISTS promociones_aceptadas timestamptz;
ALTER TABLE socio ADD COLUMN IF NOT EXISTS promociones_version text;
COMMENT ON COLUMN socio.promociones_version IS 'registro-correo-v1: Quiero recibir promociones y novedades de La Bella Lupita por correo electrónico (opcional)';
COMMIT;
