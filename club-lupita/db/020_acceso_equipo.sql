BEGIN;
ALTER TABLE empleado DROP CONSTRAINT IF EXISTS empleado_permiso_check;
ALTER TABLE empleado ADD CONSTRAINT empleado_permiso_check CHECK(permiso IN ('propietario','encargado','caja','cocina'));
ALTER TABLE empleado ADD COLUMN IF NOT EXISTS mfa_secreto text;
ALTER TABLE empleado ADD COLUMN IF NOT EXISTS mfa_ultimo bigint NOT NULL DEFAULT -1;
UPDATE empleado SET requiere_cambio=true WHERE clave_cambiada IS NULL AND NOT requiere_cambio;

CREATE TABLE IF NOT EXISTS sesion_personal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_huella text UNIQUE NOT NULL,
  empleado_id uuid NOT NULL REFERENCES empleado(id),
  version_clave integer NOT NULL,
  csrf text NOT NULL,
  fase text NOT NULL CHECK(fase IN ('completa','clave','configurar','mfa')),
  fuerte boolean NOT NULL DEFAULT false,
  compartido boolean NOT NULL DEFAULT true,
  dispositivo text NOT NULL CHECK(length(dispositivo) BETWEEN 1 AND 80),
  creada timestamptz NOT NULL DEFAULT now(),
  vence timestamptz NOT NULL,
  actividad timestamptz NOT NULL DEFAULT now(),
  verificada timestamptz,
  bloqueada timestamptz,
  revocada timestamptz,
  mfa_pendiente text,
  mfa_pendiente_vence timestamptz
);
CREATE INDEX IF NOT EXISTS sesion_personal_persona ON sesion_personal(empleado_id) WHERE revocada IS NULL;
CREATE TABLE IF NOT EXISTS invitacion_personal (
  huella text PRIMARY KEY,
  empleado_id uuid NOT NULL REFERENCES empleado(id),
  version_clave integer NOT NULL,
  vence timestamptz NOT NULL DEFAULT now()+interval '24 hours',
  usada timestamptz
);
CREATE TABLE IF NOT EXISTS recuperacion_personal (
  huella text PRIMARY KEY,
  empleado_id uuid NOT NULL REFERENCES empleado(id),
  usada timestamptz,
  creada timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS fallo_personal (
  clave text PRIMARY KEY,
  fallos integer NOT NULL DEFAULT 1,
  desde timestamptz NOT NULL DEFAULT now(),
  espera timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION fallo_acceso_personal(p_clave text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO fallo_personal(clave) VALUES(p_clave)
  ON CONFLICT(clave) DO UPDATE SET
    fallos=CASE WHEN fallo_personal.desde<now()-interval '15 minutes' THEN 1 ELSE fallo_personal.fallos+1 END,
    desde=CASE WHEN fallo_personal.desde<now()-interval '15 minutes' THEN now() ELSE fallo_personal.desde END,
    espera=CASE WHEN fallo_personal.desde<now()-interval '15 minutes' THEN now()
      WHEN fallo_personal.fallos>=4 THEN now()+make_interval(secs=>LEAST(30,(fallo_personal.fallos-3)*3)) ELSE now() END;
END $$;
CREATE OR REPLACE FUNCTION proteger_ultimo_propietario() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.permiso='propietario' AND OLD.activo AND (TG_OP='DELETE' OR NOT NEW.activo OR NEW.permiso<>'propietario') THEN
    PERFORM pg_advisory_xact_lock(72810420);
    IF NOT EXISTS(SELECT 1 FROM empleado WHERE id<>OLD.id AND permiso='propietario' AND activo AND NOT requiere_cambio AND mfa_secreto IS NOT NULL) THEN
      RAISE EXCEPTION 'ultimo_propietario' USING ERRCODE='P0001';
    END IF;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS conservar_propietario ON empleado;
CREATE TRIGGER conservar_propietario BEFORE UPDATE OF activo,permiso OR DELETE ON empleado FOR EACH ROW EXECUTE FUNCTION proteger_ultimo_propietario();
COMMIT;
