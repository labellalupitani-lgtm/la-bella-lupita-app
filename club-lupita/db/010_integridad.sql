BEGIN;

-- El recibo y el cargo se confirman en la misma transacción. Un reintento
-- devuelve ese recibo antes de asignar otra bolsa, mesa o butaca.
CREATE TABLE IF NOT EXISTS solicitud_compra (
  socio_id uuid NOT NULL REFERENCES socio(id),
  referencia text NOT NULL CHECK (length(referencia) BETWEEN 8 AND 128),
  operacion text NOT NULL,
  huella text NOT NULL,
  respuesta jsonb NOT NULL,
  creada timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (socio_id, referencia)
);

-- Repara premios emitidos por la versión anterior pero nunca entregados.
-- No reabre vales usados ni modifica sellos o movimientos monetarios.
UPDATE tanda t SET canjeada = NULL
WHERE canjeada IS NOT NULL AND EXISTS (
  SELECT 1 FROM vale v WHERE v.tanda_id = t.id AND v.usado IS NULL
);

-- Un número es exclusivo mientras su membresía vive. Su historia se conserva.
CREATE UNIQUE INDEX IF NOT EXISTS membresia_numero_vivo
  ON membresia(numero) WHERE estado IN ('activa', 'en_gracia');

-- La renovación requiere consentimiento registrado por la versión nueva.
-- Los registros antiguos no constituyen prueba de consentimiento a un débito
-- automático: conservan su período pagado y pueden renovarse explícitamente.
ALTER TABLE membresia ADD COLUMN IF NOT EXISTS renovacion_consentida timestamptz;

CREATE OR REPLACE FUNCTION mantener_membresia(p_socio uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE m membresia%ROWTYPE; disponible integer; nueva_hasta timestamptz; referencia text;
BEGIN
  PERFORM 1 FROM socio WHERE id = p_socio FOR UPDATE;
  SELECT * INTO m FROM membresia WHERE socio_id=p_socio
    AND estado IN ('activa','en_gracia') FOR UPDATE;
  IF NOT FOUND OR m.hasta > now() THEN RETURN; END IF;
  IF NOT m.autorenueva OR m.renovacion_consentida IS NULL THEN
    UPDATE membresia SET estado='vencida' WHERE id=m.id;
    RETURN;
  END IF;
  SELECT total INTO disponible FROM saldo_de(p_socio);
  IF disponible < m.cuota THEN
    UPDATE membresia SET estado='vencida' WHERE id=m.id;
    RETURN;
  END IF;
  -- Un proceso retrasado no cobra meses en los que no se prestó el servicio.
  nueva_hasta := now() + interval '30 days';
  referencia := 'renovacion:' || m.id || ':' || extract(epoch FROM m.hasta)::text;
  INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa)
    VALUES (p_socio,-m.cuota,'consumo','Mesa Fundadora · renovación',referencia);
  UPDATE membresia SET estado='activa',hasta=nueva_hasta WHERE id=m.id;
  INSERT INTO auditoria(quien,accion,socio_id,monto,detalle)
    VALUES ('sistema','renovacion',p_socio,-m.cuota,jsonb_build_object('membresia',m.id,'hasta',nueva_hasta));
END $$;

COMMIT;
