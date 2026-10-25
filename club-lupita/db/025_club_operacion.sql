BEGIN;
CREATE TABLE IF NOT EXISTS club_descuento_caja (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), socio_id uuid NOT NULL REFERENCES socio(id),
 membresia_id uuid NOT NULL REFERENCES membresia(id), ticket text NOT NULL UNIQUE,
 config_version integer NOT NULL, huella text NOT NULL, lineas jsonb NOT NULL CHECK(jsonb_typeof(lineas)='array'),
 subtotal integer NOT NULL CHECK(subtotal>0), descuento integer NOT NULL CHECK(descuento>0),
 total integer NOT NULL CHECK(total=subtotal-descuento AND total>0),
 creado timestamptz NOT NULL DEFAULT now(), creado_por text NOT NULL,
 CHECK(ticket=upper(btrim(ticket)) AND length(ticket) BETWEEN 8 AND 64)
);
CREATE TABLE IF NOT EXISTS club_descuento_anulacion (
 descuento_id uuid PRIMARY KEY REFERENCES club_descuento_caja(id),
 motivo text NOT NULL CHECK(length(motivo) BETWEEN 5 AND 500),
 creado timestamptz NOT NULL DEFAULT now(), creado_por text NOT NULL
);
CREATE INDEX IF NOT EXISTS club_descuento_cuenta ON club_descuento_caja(socio_id,creado DESC);
DROP TRIGGER IF EXISTS club_descuento_inmutable ON club_descuento_caja;
CREATE TRIGGER club_descuento_inmutable BEFORE UPDATE OR DELETE ON club_descuento_caja FOR EACH ROW EXECUTE FUNCTION solo_se_agrega();
DROP TRIGGER IF EXISTS club_descuento_anulacion_inmutable ON club_descuento_anulacion;
CREATE TRIGGER club_descuento_anulacion_inmutable BEFORE UPDATE OR DELETE ON club_descuento_anulacion FOR EACH ROW EXECUTE FUNCTION solo_se_agrega();

-- Rendimiento de operaciones, incluido ingreso por navegación interna.
-- Sin socio, teléfono, ticket, código ni identificador de sesión.
CREATE TABLE IF NOT EXISTS club_tiempo (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 dia date NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Managua')::date),
 operacion text NOT NULL CHECK(operacion IN ('codigo','recuperacion','vista')),
 resultado text NOT NULL CHECK(resultado IN ('correcto','error','cancelado')),
 entrada text NOT NULL CHECK(entrada IN ('directa','interna')),
 dispositivo text NOT NULL CHECK(dispositivo IN ('movil','tableta','escritorio')),
 milisegundos integer NOT NULL CHECK(milisegundos BETWEEN 0 AND 300000)
);
CREATE INDEX IF NOT EXISTS club_tiempo_fecha ON club_tiempo(dia);
INSERT INTO club_migracion(version) VALUES('025') ON CONFLICT DO NOTHING;
COMMIT;
