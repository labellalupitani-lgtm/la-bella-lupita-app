-- El orden en que se gasta el monedero no puede quedar sin declarar.
--
-- Hasta ahora el consumo se restaba del bucket «pagado», así que un socio con
-- C$465 suyos y C$440 de bono que gastaba C$890 quedaba con `pagado: -425` y
-- `bono: 440`. El total era correcto, pero el desglose era ficción, y ese
-- desglose es justo lo que se necesita para medir el breakage (IFRS 15).
--
-- Regla de la casa, declarada: se gasta PRIMERO lo que puso la casa. Es lo
-- honesto —el bono es lo que caduca— y hace que el saldo del socio dure más.
BEGIN;

CREATE OR REPLACE FUNCTION saldo_de(p_socio uuid)
RETURNS TABLE (pagado integer, bono integer, total integer)
LANGUAGE sql STABLE AS $$
  WITH m AS (
    SELECT
      COALESCE(SUM(monto) FILTER (WHERE monto > 0 AND tipo = 'bono'), 0)::bigint  AS entro_bono,
      COALESCE(SUM(monto) FILTER (WHERE monto > 0 AND tipo <> 'bono'), 0)::bigint AS entro_pagado,
      COALESCE(-SUM(monto) FILTER (WHERE monto < 0), 0)::bigint                   AS salio
    FROM asiento WHERE socio_id = p_socio
  )
  SELECT
    (entro_pagado - (salio - LEAST(salio, entro_bono)))::integer,
    (entro_bono - LEAST(salio, entro_bono))::integer,
    (entro_pagado + entro_bono - salio)::integer
  FROM m;
$$;

COMMENT ON FUNCTION saldo_de IS
  'Saldo derivado del libro mayor. El consumo descuenta primero el bono de la casa y luego el dinero del socio.';

COMMIT;
