-- Aplicar SOLAMENTE en producción, después del esquema 018 y del Worker nuevo.
-- El libro mayor y los sellos permanecen intactos. No contiene DELETE.
BEGIN;
LOCK TABLE socio,membresia,reserva,compra_bolsa,asiento_experiencia,reserva_cosecha IN SHARE ROW EXCLUSIVE MODE;
ALTER TABLE compra_bolsa DROP CONSTRAINT IF EXISTS compra_bolsa_generacion_numero_key;
ALTER TABLE asiento_experiencia DROP CONSTRAINT IF EXISTS asiento_experiencia_experiencia_id_butaca_key;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM asiento_experiencia a JOIN socio s ON s.id=a.socio_id JOIN socio d ON d.id=a.cedido_a WHERE (s.origen='muestra')<>(d.origen='muestra'))
    THEN RAISE EXCEPTION 'Hay cesiones entre muestras y cuentas reales; revisar antes de archivar'; END IF;
  IF EXISTS(SELECT 1 FROM socio WHERE origen='muestra' AND correo IS NOT NULL)
    THEN RAISE EXCEPTION 'Una muestra tiene correo asociado; revisar antes de archivar'; END IF;
END $$;
INSERT INTO archivo_muestra(tabla,clave,datos) SELECT 'socio',id::text,to_jsonb(s) FROM socio s WHERE origen='muestra' ON CONFLICT DO NOTHING;
INSERT INTO archivo_muestra(tabla,clave,datos) SELECT 'reserva_cosecha',numero::text,to_jsonb(r) FROM reserva_cosecha r WHERE socio_id IN (SELECT id FROM socio WHERE origen='muestra') ON CONFLICT DO NOTHING;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['membresia','reserva','compra_bolsa','asiento_experiencia'] LOOP
    EXECUTE format('INSERT INTO archivo_muestra(tabla,clave,datos) SELECT %L,id::text,to_jsonb(r) FROM %I r WHERE socio_id IN(SELECT id FROM socio WHERE origen=''muestra'') ON CONFLICT DO NOTHING',t,t);
    EXECUTE format('UPDATE %I SET archivado_muestra=coalesce(archivado_muestra,now()) WHERE socio_id IN(SELECT id FROM socio WHERE origen=''muestra'')',t);
  END LOOP;
END $$;
UPDATE socio SET archivado_muestra=coalesce(archivado_muestra,now()) WHERE origen='muestra';
UPDATE reserva_cosecha SET socio_id=NULL,apartada=NULL,pagada=NULL,entregada=NULL,entregada_por=NULL WHERE socio_id IN(SELECT id FROM socio WHERE origen='muestra');
INSERT INTO auditoria(quien,accion,detalle) SELECT 'sistema','archivar_muestras',jsonb_build_object('cuentas',count(*)) FROM socio WHERE archivado_muestra IS NOT NULL
  HAVING NOT EXISTS(SELECT 1 FROM auditoria WHERE accion='archivar_muestras');
COMMIT;
