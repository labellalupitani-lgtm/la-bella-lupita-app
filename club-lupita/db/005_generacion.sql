-- La Reserva de Cosecha se repite todos los años: la bolsa 117 de 2026 no es
-- la 117 de 2027. Sin una generación, la referencia de pago `bolsa:117` colisiona
-- entre cosechas y una bolsa vuelta a poner a la venta se entregaría sin cobrar,
-- porque la guardia de idempotencia vería el pago del año anterior.
BEGIN;

ALTER TABLE reserva_cosecha
  ADD COLUMN IF NOT EXISTS generacion smallint NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS reserva_cosecha_libres_idx
  ON reserva_cosecha (generacion, numero) WHERE apartada IS NULL;

COMMIT;
