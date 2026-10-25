BEGIN;
CREATE TABLE IF NOT EXISTS reserva_config (id boolean PRIMARY KEY DEFAULT true CHECK(id), version integer NOT NULL DEFAULT 1, datos jsonb NOT NULL, actualizado timestamptz NOT NULL DEFAULT now());
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS referencia text;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS intencion jsonb;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'confirmada' CHECK(estado IN ('confirmada','llego','sentada','finalizada','no_asistio','cancelada'));
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS mesas text[] NOT NULL DEFAULT '{}';
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS politica jsonb;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS anticipo_aplicado integer NOT NULL DEFAULT 0;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS anticipo_devuelto integer NOT NULL DEFAULT 0;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS anticipo_pendiente_ref text;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS actualizado timestamptz NOT NULL DEFAULT now();
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='reserva_anticipo_coherente' AND conrelid='reserva'::regclass) THEN
  ALTER TABLE reserva ADD CONSTRAINT reserva_anticipo_coherente CHECK(anticipo_aplicado>=0 AND anticipo_devuelto>=0 AND anticipo_aplicado+anticipo_devuelto<=deposito);
 END IF;
END $$;
ALTER TABLE reserva DROP CONSTRAINT IF EXISTS reserva_sin_solape;
ALTER TABLE reserva ADD CONSTRAINT reserva_sin_solape EXCLUDE USING gist(zona WITH =,tstzrange(cuando,termina) WITH &&)
 WHERE(cancelada IS NULL AND zona='vip' AND archivado_muestra IS NULL AND estado IN ('confirmada','llego','sentada'));
UPDATE reserva SET estado='cancelada' WHERE cancelada IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS reserva_intento ON reserva(socio_id,referencia) WHERE referencia IS NOT NULL;
CREATE INDEX IF NOT EXISTS reserva_titular_activa ON reserva(socio_id,cuando,termina) WHERE cancelada IS NULL AND estado IN ('confirmada','llego','sentada');
CREATE INDEX IF NOT EXISTS reserva_zona_intervalo ON reserva(zona,cuando,termina) WHERE cancelada IS NULL;
CREATE INDEX IF NOT EXISTS reserva_fin_activa ON reserva(termina,cuando,zona) WHERE cancelada IS NULL AND estado IN ('confirmada','llego','sentada');
CREATE OR REPLACE VIEW operativo_reserva AS SELECT r.* FROM reserva r WHERE EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=r.socio_id);
CREATE TABLE IF NOT EXISTS reserva_evento (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, reserva_id uuid NOT NULL REFERENCES reserva(id), version integer NOT NULL, accion text NOT NULL, quien text NOT NULL, motivo text, creado timestamptz NOT NULL DEFAULT now(), UNIQUE(reserva_id,version));
CREATE TABLE IF NOT EXISTS reserva_correo (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reserva_id uuid NOT NULL REFERENCES reserva(id), version integer NOT NULL, tipo text NOT NULL, disponible timestamptz NOT NULL DEFAULT now(), enviado timestamptz, intentos integer NOT NULL DEFAULT 0, error text, tomado timestamptz, UNIQUE(reserva_id,version,tipo));
ALTER TABLE reserva_correo ADD COLUMN IF NOT EXISTS descartado timestamptz;
ALTER TABLE reserva_correo ADD COLUMN IF NOT EXISTS iniciado timestamptz;
ALTER TABLE reserva_correo ADD COLUMN IF NOT EXISTS mensaje jsonb;
CREATE INDEX IF NOT EXISTS reserva_correo_pendiente ON reserva_correo(disponible) WHERE enviado IS NULL;
CREATE TABLE IF NOT EXISTS reserva_metrica (dia date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Managua')::date, evento text NOT NULL CHECK(evento IN ('consulta','revision','confirmada','conflicto','sin_saldo','cancelada','cambio')), cantidad integer NOT NULL DEFAULT 0, PRIMARY KEY(dia,evento));
ALTER TABLE reserva_metrica DROP CONSTRAINT IF EXISTS reserva_metrica_evento_check;
ALTER TABLE reserva_metrica ADD CONSTRAINT reserva_metrica_evento_check CHECK(evento IN ('consulta','fecha_grupo','revision','confirmada','conflicto','sin_saldo','cancelada','cambio','borrador_recuperado','resultado_incierto'));
CREATE TABLE IF NOT EXISTS reserva_metrica_intento (referencia uuid NOT NULL,evento text NOT NULL,dia date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Managua')::date,PRIMARY KEY(referencia,evento));
COMMIT;
