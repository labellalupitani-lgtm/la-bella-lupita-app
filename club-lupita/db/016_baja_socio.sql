-- La baja también bloquea renovaciones disparadas por consultas o mantenimiento.
-- El período ya pagado y el libro mayor se conservan.
BEGIN;

CREATE OR REPLACE FUNCTION mantener_membresia(p_socio uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  m membresia%ROWTYPE;
  activo boolean;
  disponible integer;
  nueva_hasta timestamptz;
  referencia text;
BEGIN
  SELECT baja IS NULL INTO activo FROM socio WHERE id=p_socio FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO m FROM membresia WHERE socio_id=p_socio
    AND estado IN ('activa','en_gracia') FOR UPDATE;
  IF NOT FOUND OR m.hasta > now() THEN RETURN; END IF;
  IF NOT activo OR NOT m.autorenueva OR m.renovacion_consentida IS NULL THEN
    UPDATE membresia SET estado='vencida' WHERE id=m.id;
    RETURN;
  END IF;
  SELECT total INTO disponible FROM saldo_de(p_socio);
  IF disponible < m.cuota THEN
    UPDATE membresia SET estado='vencida' WHERE id=m.id;
    RETURN;
  END IF;
  nueva_hasta := now() + interval '30 days';
  referencia := 'renovacion:' || m.id || ':' || extract(epoch FROM m.hasta)::text;
  INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa)
    VALUES (p_socio,-m.cuota,'consumo','Mesa Fundadora · renovación',referencia);
  UPDATE membresia SET estado='activa',hasta=nueva_hasta WHERE id=m.id;
  INSERT INTO auditoria(quien,accion,socio_id,monto,detalle)
    VALUES ('sistema','renovacion',p_socio,-m.cuota,jsonb_build_object('membresia',m.id,'hasta',nueva_hasta));
END $$;

COMMIT;
