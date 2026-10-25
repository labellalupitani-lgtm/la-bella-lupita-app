BEGIN;
ALTER TABLE club_config ADD COLUMN IF NOT EXISTS reglas_version text;
ALTER TABLE club_config ADD COLUMN IF NOT EXISTS validacion_operativa text;
ALTER TABLE tanda ADD COLUMN IF NOT EXISTS reglas_version text;
CREATE OR REPLACE VIEW operativo_tanda AS SELECT r.* FROM tanda r WHERE EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=r.socio_id);
CREATE TABLE IF NOT EXISTS club_ticket_validacion (
 ticket text PRIMARY KEY, socio_id uuid NOT NULL REFERENCES socio(id),
 neto integer NOT NULL CHECK(neto>=10000), reglas_version text NOT NULL,
 quien text NOT NULL, creado timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS club_premio_entrega (
 tanda_id uuid PRIMARY KEY REFERENCES tanda(id), bebida text NOT NULL,
 reglas_version text NOT NULL, quien text NOT NULL, creado timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS club_vip_espera (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), socio_id uuid NOT NULL REFERENCES socio(id),
 cuando timestamptz NOT NULL, horas integer NOT NULL CHECK(horas BETWEEN 1 AND 6),
 personas integer NOT NULL CHECK(personas BETWEEN 1 AND 12),
 creada timestamptz NOT NULL DEFAULT now(), ofrecida timestamptz, cerrada timestamptz,
 motivo text, version integer NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS club_vip_espera_unica ON club_vip_espera(socio_id,cuando,horas,personas) WHERE cerrada IS NULL;
CREATE INDEX IF NOT EXISTS club_vip_espera_orden ON club_vip_espera(cuando,horas,personas,creada) WHERE cerrada IS NULL;
INSERT INTO club_migracion(version) VALUES('029') ON CONFLICT DO NOTHING;
COMMIT;
