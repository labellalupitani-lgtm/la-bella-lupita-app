BEGIN;
ALTER TABLE socio ADD COLUMN IF NOT EXISTS origen text NOT NULL DEFAULT 'anterior' CHECK(origen IN ('anterior','correo','muestra'));
ALTER TABLE socio ADD COLUMN IF NOT EXISTS archivado_muestra timestamptz;
UPDATE socio SET origen='correo' WHERE correo_verificado IS NOT NULL AND origen='anterior';
UPDATE socio SET origen='muestra' WHERE correo IS NULL AND correo_verificado IS NULL AND (
  (telefono='50587442005' AND nombre='María') OR EXISTS (
    SELECT 1 FROM generate_series(1,81) n WHERE telefono='5055'||lpad(n::text,7,'0') AND nombre='Socio '||n
  )
) AND origen='anterior';
CREATE INDEX IF NOT EXISTS socio_directorio ON socio(archivado_muestra,creado DESC,id);
CREATE INDEX IF NOT EXISTS socio_origen ON socio(origen);

ALTER TABLE membresia ADD COLUMN IF NOT EXISTS archivado_muestra timestamptz;
ALTER TABLE reserva ADD COLUMN IF NOT EXISTS archivado_muestra timestamptz;
ALTER TABLE compra_bolsa ADD COLUMN IF NOT EXISTS archivado_muestra timestamptz;
ALTER TABLE asiento_experiencia ADD COLUMN IF NOT EXISTS archivado_muestra timestamptz;

-- Las muestras conservan su historia, sin ocupar números o reservas reales.
DROP INDEX IF EXISTS membresia_numero_vivo;
CREATE UNIQUE INDEX membresia_numero_vivo ON membresia(numero) WHERE estado IN ('activa','en_gracia') AND archivado_muestra IS NULL;
-- Las restricciones anteriores se mantienen hasta publicar el Worker compatible.
CREATE UNIQUE INDEX IF NOT EXISTS compra_bolsa_numero_operativo ON compra_bolsa(generacion,numero) WHERE archivado_muestra IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS asiento_experiencia_butaca_operativa ON asiento_experiencia(experiencia_id,butaca) WHERE archivado_muestra IS NULL;
ALTER TABLE reserva DROP CONSTRAINT IF EXISTS reserva_sin_solape;
ALTER TABLE reserva ADD CONSTRAINT reserva_sin_solape EXCLUDE USING gist(zona WITH =,tstzrange(cuando,termina) WITH &&)
  WHERE(cancelada IS NULL AND zona='vip' AND archivado_muestra IS NULL);

CREATE TABLE IF NOT EXISTS archivo_muestra (
  tabla text NOT NULL, clave text NOT NULL, datos jsonb NOT NULL,
  archivado timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(tabla,clave)
);
CREATE OR REPLACE VIEW operativo_socio AS SELECT * FROM socio WHERE archivado_muestra IS NULL;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['asiento','punto','membresia','tanda','vale','compra_bolsa','pedido','aviso_cliente','solicitud_atencion','solicitud_compra','beneficio_solicitud','reserva'] LOOP
    EXECUTE format('CREATE OR REPLACE VIEW %I AS SELECT r.* FROM %I r WHERE EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=r.socio_id)','operativo_'||t,t);
  END LOOP;
END $$;
CREATE OR REPLACE VIEW operativo_asiento_experiencia AS SELECT a.* FROM asiento_experiencia a
  WHERE EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=a.socio_id)
    AND (cedido_a IS NULL OR EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=a.cedido_a));
CREATE OR REPLACE VIEW operativo_sello AS SELECT r.* FROM sello r WHERE EXISTS(SELECT 1 FROM operativo_tanda t WHERE t.id=r.tanda_id);
CREATE OR REPLACE VIEW operativo_beneficio_uso AS SELECT r.* FROM beneficio_uso r WHERE EXISTS(SELECT 1 FROM operativo_membresia m WHERE m.id=r.membresia_id);
CREATE OR REPLACE VIEW operativo_pedido_evento AS SELECT r.* FROM pedido_evento r WHERE EXISTS(SELECT 1 FROM operativo_pedido p WHERE p.id=r.pedido_id);
CREATE OR REPLACE VIEW operativo_auditoria AS SELECT r.* FROM auditoria r WHERE socio_id IS NULL OR EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=r.socio_id);
CREATE OR REPLACE VIEW operativo_cuadre AS
  SELECT 'monedero en negativo' AS prueba,count(*)::int AS filas FROM operativo_socio s WHERE (SELECT total FROM saldo_de(s.id))<0
  UNION ALL SELECT 'tope de beneficio excedido',count(*)::int FROM (SELECT membresia_id,clase,ventana FROM operativo_beneficio_uso GROUP BY 1,2,3 HAVING count(*)>1) x
  UNION ALL SELECT 'socios fundadores sobre el cupo',count(*)::int FROM (SELECT 1 FROM operativo_membresia WHERE estado IN ('activa','en_gracia') HAVING count(*)>100) y
  UNION ALL SELECT 'bolsas apartadas sin dueño',count(*)::int FROM reserva_cosecha WHERE apartada IS NOT NULL AND socio_id IS NULL;

-- El mantenimiento no puede renovar ni cambiar la historia archivada.
CREATE OR REPLACE FUNCTION mantener_membresia(p_socio uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE m membresia%ROWTYPE; activo boolean; disponible integer; nueva_hasta timestamptz; referencia text;
BEGIN
  SELECT baja IS NULL INTO activo FROM socio WHERE id=p_socio AND archivado_muestra IS NULL FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO m FROM membresia WHERE socio_id=p_socio AND estado IN ('activa','en_gracia') AND archivado_muestra IS NULL FOR UPDATE;
  IF NOT FOUND OR m.hasta>now() THEN RETURN; END IF;
  IF NOT activo OR NOT m.autorenueva OR m.renovacion_consentida IS NULL THEN UPDATE membresia SET estado='vencida' WHERE id=m.id; RETURN; END IF;
  SELECT total INTO disponible FROM saldo_de(p_socio);
  IF disponible<m.cuota THEN UPDATE membresia SET estado='vencida' WHERE id=m.id; RETURN; END IF;
  nueva_hasta:=now()+interval '30 days'; referencia:='renovacion:'||m.id||':'||extract(epoch FROM m.hasta)::text;
  INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES(p_socio,-m.cuota,'consumo','Mesa Fundadora · renovación',referencia);
  UPDATE membresia SET estado='activa',hasta=nueva_hasta WHERE id=m.id;
  INSERT INTO auditoria(quien,accion,socio_id,monto,detalle) VALUES('sistema','renovacion',p_socio,-m.cuota,jsonb_build_object('membresia',m.id,'hasta',nueva_hasta));
END $$;
COMMIT;
