-- El bono solo puede pagar movimientos posteriores a su entrada.
-- Se reproduce el libro por (creado, id), sin modificar sus asientos.
-- Las devoluciones completas restituyen el reparto del cargo original;
-- no vuelven a repartir consumos que ocurrieron entre cargo y devolución.
BEGIN;

CREATE OR REPLACE FUNCTION saldo_de(p_socio uuid)
RETURNS TABLE (pagado integer, bono integer, total integer)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  movimiento record;
  saldo_pagado bigint := 0;
  saldo_bono bigint := 0;
  gasto_bono bigint;
  restituido_bono bigint;
  -- Solo se conservan repartos de cargos que tienen devolución completa.
  -- La clave es el id del cargo, no su posición ni su fecha.
  repartos jsonb := '{}'::jsonb;
BEGIN
  FOR movimiento IN
    SELECT a.id, a.monto::bigint AS monto, a.tipo, a.devolucion_de,
           EXISTS (
             SELECT 1 FROM asiento d
             WHERE d.devolucion_de = a.id AND d.socio_id = a.socio_id
               AND d.monto::bigint = -a.monto::bigint AND d.monto > 0
               AND (d.creado, d.id) > (a.creado, a.id)
           ) AS tiene_devolucion
    FROM asiento a
    WHERE a.socio_id = p_socio
    ORDER BY a.creado, a.id
  LOOP
    IF movimiento.monto < 0 THEN
      gasto_bono := LEAST(saldo_bono, -movimiento.monto);
      saldo_bono := saldo_bono - gasto_bono;
      saldo_pagado := saldo_pagado + movimiento.monto + gasto_bono;
      IF movimiento.tiene_devolucion THEN
        repartos := repartos || jsonb_build_object(movimiento.id::text, gasto_bono);
      END IF;
    ELSIF movimiento.devolucion_de IS NOT NULL
          AND repartos ? movimiento.devolucion_de::text THEN
      restituido_bono := (repartos ->> movimiento.devolucion_de::text)::bigint;
      saldo_bono := saldo_bono + restituido_bono;
      saldo_pagado := saldo_pagado + movimiento.monto - restituido_bono;
      repartos := repartos - movimiento.devolucion_de::text;
    ELSIF movimiento.tipo = 'bono' THEN
      saldo_bono := saldo_bono + movimiento.monto;
    ELSE
      -- Recargas, regalos y ajustes positivos ordinarios son saldo pagado.
      -- La API devuelve cargos completos. Una referencia histórica que no
      -- corresponde a un cargo anterior de igual monto y del mismo socio no
      -- inventa un reparto: conserva el crédito como ajuste ordinario.
      saldo_pagado := saldo_pagado + movimiento.monto;
    END IF;
  END LOOP;

  RETURN QUERY SELECT saldo_pagado::integer, saldo_bono::integer,
                      (saldo_pagado + saldo_bono)::integer;
END;
$$;

COMMENT ON FUNCTION saldo_de IS
  'Saldo derivado por creado e id: cada salida consume primero el bono disponible entonces; una devolución completa restaura el reparto de su cargo original.';

COMMIT;
