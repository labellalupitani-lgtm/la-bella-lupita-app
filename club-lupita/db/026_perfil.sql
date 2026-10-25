BEGIN;
ALTER TABLE socio ADD COLUMN IF NOT EXISTS perfil_version integer NOT NULL DEFAULT 0 CHECK(perfil_version>=0);
ALTER TABLE socio ADD COLUMN IF NOT EXISTS cumple_mes_dia text;
ALTER TABLE socio ADD COLUMN IF NOT EXISTS sesiones_revocadas bigint NOT NULL DEFAULT 0;
UPDATE socio SET cumple_mes_dia=to_char(cumple,'MM-DD') WHERE cumple IS NOT NULL AND cumple_mes_dia IS NULL;
-- Protege también las modificaciones del directorio o de futuras herramientas.
CREATE OR REPLACE FUNCTION versionar_perfil() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.cumple IS DISTINCT FROM OLD.cumple AND NEW.cumple IS NOT NULL THEN
    NEW.cumple_mes_dia := to_char(NEW.cumple,'MM-DD');
  END IF;
  IF (NEW.nombre,NEW.bebida_siempre,NEW.alergias,NEW.cumple,NEW.cumple_mes_dia,NEW.correo,NEW.telefono,NEW.correo_verificado,NEW.promociones_correo)
     IS DISTINCT FROM
     (OLD.nombre,OLD.bebida_siempre,OLD.alergias,OLD.cumple,OLD.cumple_mes_dia,OLD.correo,OLD.telefono,OLD.correo_verificado,OLD.promociones_correo) THEN
    NEW.perfil_version := OLD.perfil_version + 1;
  ELSE NEW.perfil_version := OLD.perfil_version;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS socio_versionar_perfil ON socio;
CREATE TRIGGER socio_versionar_perfil BEFORE UPDATE ON socio FOR EACH ROW EXECUTE FUNCTION versionar_perfil();
CREATE OR REPLACE VIEW operativo_socio AS SELECT * FROM socio WHERE archivado_muestra IS NULL;
ALTER TABLE solicitud_atencion ADD COLUMN IF NOT EXISTS categoria text NOT NULL DEFAULT 'compra' CHECK(categoria IN ('compra','cuenta','acceso','datos','baja'));
CREATE OR REPLACE VIEW operativo_solicitud_atencion AS SELECT r.* FROM solicitud_atencion r WHERE EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=r.socio_id);
INSERT INTO club_migracion(version) VALUES('026') ON CONFLICT DO NOTHING;
COMMIT;
