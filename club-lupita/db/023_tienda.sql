BEGIN;
CREATE TABLE IF NOT EXISTS tienda_lote (
  generacion integer PRIMARY KEY, ficha jsonb NOT NULL, revision integer NOT NULL DEFAULT 1,
  actualizado timestamptz NOT NULL DEFAULT now(), responsable text
);
INSERT INTO tienda_lote(generacion,ficha)
SELECT DISTINCT generacion,'{"nombre":"Reserva de Cosecha","presentacion":"","gramos":250,"origen":"","proceso":"","perfil":"","retiroDesde":"","retiroHasta":"","lugar":"","horario":"","politica":"","foto":"","fotoAlt":"","fuente":"","habilitada":false}'::jsonb
FROM reserva_cosecha ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS tienda_intento (
  socio_id uuid NOT NULL REFERENCES socio(id), referencia text NOT NULL,
  cotizacion jsonb, cerrado boolean NOT NULL DEFAULT false,
  creado timestamptz NOT NULL DEFAULT now(), actualizado timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(socio_id,referencia)
);
CREATE INDEX IF NOT EXISTS tienda_intentos_pendientes ON tienda_intento(socio_id,creado DESC) WHERE NOT cerrado;
ALTER TABLE compra_bolsa ADD COLUMN IF NOT EXISTS referencia text;
ALTER TABLE compra_bolsa ADD COLUMN IF NOT EXISTS cotizacion jsonb;
ALTER TABLE compra_bolsa ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'pagada' CHECK(estado IN ('pagada','lista','entregada','reembolsada'));
ALTER TABLE compra_bolsa ADD COLUMN IF NOT EXISTS lista timestamptz;
ALTER TABLE compra_bolsa ADD COLUMN IF NOT EXISTS reembolsada timestamptz;
ALTER TABLE compra_bolsa ADD COLUMN IF NOT EXISTS motivo text;
-- Solo recuperar vínculos inequívocos: misma cuenta, número, importe y timestamp
-- transaccional exacto; además debe existir el cargo original. Nada por proximidad.
WITH candidatos AS (
 SELECT b.id,substr(r.referencia,5) AS referencia,count(*) OVER(PARTITION BY b.id) AS n,
   count(*) OVER(PARTITION BY b.socio_id,r.referencia) AS m
 FROM compra_bolsa b JOIN solicitud_compra r ON r.socio_id=b.socio_id AND r.operacion='bolsa'
   AND r.creada=b.creada AND r.respuesta->>'numero'=b.numero::text AND r.respuesta->>'cobrado'=b.total::text
 WHERE b.referencia IS NULL AND r.referencia LIKE 'sol:%' AND EXISTS(
   SELECT 1 FROM asiento a WHERE a.socio_id=b.socio_id AND a.ref_externa=r.referencia AND a.monto=-b.total)
)
UPDATE compra_bolsa b SET referencia=c.referencia FROM candidatos c WHERE b.id=c.id AND c.n=1 AND c.m=1;
UPDATE compra_bolsa SET estado='entregada' WHERE entregada IS NOT NULL AND estado='pagada';
CREATE UNIQUE INDEX IF NOT EXISTS compra_bolsa_referencia ON compra_bolsa(socio_id,referencia) WHERE referencia IS NOT NULL;
CREATE INDEX IF NOT EXISTS compra_bolsa_estado_fecha ON compra_bolsa(estado,creada DESC,id);
CREATE OR REPLACE VIEW operativo_compra_bolsa AS SELECT p.* FROM compra_bolsa p WHERE EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=p.socio_id);
CREATE TABLE IF NOT EXISTS tienda_metrica (
  dia date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Managua')::date,
  evento text NOT NULL, dispositivo text NOT NULL, cantidad integer NOT NULL DEFAULT 1,
  PRIMARY KEY(dia,evento,dispositivo)
);
COMMIT;
