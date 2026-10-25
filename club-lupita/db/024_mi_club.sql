BEGIN;
CREATE TABLE IF NOT EXISTS club_migracion(version text PRIMARY KEY,aplicada timestamptz NOT NULL DEFAULT now());
-- Las filas existentes y el Worker anterior conservan sus condiciones durante
-- el despliegue. El nuevo endpoint escribe su versión explícitamente.
ALTER TABLE membresia ADD COLUMN IF NOT EXISTS contrato_version text NOT NULL DEFAULT 'anterior';
ALTER TABLE membresia ALTER COLUMN contrato_version SET DEFAULT 'anterior';
ALTER TABLE membresia ADD COLUMN IF NOT EXISTS periodo_inicio timestamptz;
UPDATE membresia SET periodo_inicio=GREATEST(desde,hasta-interval '30 days') WHERE periodo_inicio IS NULL;
ALTER TABLE membresia ALTER COLUMN periodo_inicio SET DEFAULT now();
ALTER TABLE membresia ALTER COLUMN periodo_inicio SET NOT NULL;
ALTER TABLE membresia ADD COLUMN IF NOT EXISTS motivo_fin text;
ALTER TABLE membresia ADD COLUMN IF NOT EXISTS contrato_detalle jsonb;
ALTER TABLE socio ADD COLUMN IF NOT EXISTS codigo_club text NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
CREATE UNIQUE INDEX IF NOT EXISTS socio_codigo_club ON socio(codigo_club);
CREATE OR REPLACE VIEW operativo_socio AS SELECT * FROM socio WHERE archivado_muestra IS NULL;
CREATE OR REPLACE VIEW operativo_membresia AS SELECT r.* FROM membresia r WHERE EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=r.socio_id);

CREATE TABLE IF NOT EXISTS club_periodo (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), membresia_id uuid NOT NULL REFERENCES membresia(id),
 inicio timestamptz NOT NULL, hasta timestamptz NOT NULL, cuota integer NOT NULL,
 contrato_version text NOT NULL, registrado timestamptz NOT NULL DEFAULT now(),
 UNIQUE(membresia_id,inicio), CHECK(hasta>inicio)
);
INSERT INTO club_periodo(membresia_id,inicio,hasta,cuota,contrato_version)
 SELECT id,periodo_inicio,hasta,cuota,contrato_version FROM membresia ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS club_evento (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, socio_id uuid NOT NULL REFERENCES socio(id),
 membresia_id uuid REFERENCES membresia(id), evento text NOT NULL, quien text NOT NULL,
 detalle jsonb NOT NULL DEFAULT '{}', creado timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS club_evento_cuenta ON club_evento(socio_id,creado DESC);
CREATE OR REPLACE FUNCTION club_inicio_periodo() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF NEW.periodo_inicio>=NEW.hasta OR NEW.periodo_inicio<NEW.desde THEN
  NEW.periodo_inicio:=GREATEST(NEW.desde,NEW.hasta-interval '30 days');
 END IF; RETURN NEW; END $$;
DROP TRIGGER IF EXISTS club_inicio_periodo ON membresia;
CREATE TRIGGER club_inicio_periodo BEFORE INSERT ON membresia FOR EACH ROW EXECUTE FUNCTION club_inicio_periodo();
CREATE OR REPLACE FUNCTION club_historial() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE accion text;
BEGIN
 IF TG_OP='INSERT' THEN accion:='alta';
 ELSIF NEW.periodo_inicio IS DISTINCT FROM OLD.periodo_inicio THEN accion:='renovacion';
 ELSIF NEW.autorenueva IS DISTINCT FROM OLD.autorenueva OR NEW.renovacion_consentida IS DISTINCT FROM OLD.renovacion_consentida THEN accion:=CASE WHEN NEW.autorenueva THEN 'consentimiento' ELSE 'cancelacion_renovacion' END;
 ELSIF NEW.estado IS DISTINCT FROM OLD.estado THEN accion:='fin';
 ELSE RETURN NEW; END IF;
 IF accion IN ('alta','renovacion') THEN
  INSERT INTO club_periodo(membresia_id,inicio,hasta,cuota,contrato_version)
  VALUES(NEW.id,NEW.periodo_inicio,NEW.hasta,NEW.cuota,NEW.contrato_version) ON CONFLICT DO NOTHING;
 END IF;
 INSERT INTO club_evento(socio_id,membresia_id,evento,quien,detalle) VALUES(NEW.socio_id,NEW.id,accion,
 COALESCE(NULLIF(current_setting('club.actor',true),''),'sistema'),
 jsonb_build_object('version',NEW.contrato_version,'desde',NEW.periodo_inicio,'hasta',NEW.hasta,'cuota',NEW.cuota,'autorenueva',NEW.autorenueva,'motivo',NEW.motivo_fin,'condiciones',NEW.contrato_detalle));
 INSERT INTO aviso_cliente(socio_id,referencia,texto) VALUES(NEW.socio_id,'club:'||NEW.id||':'||accion||':'||extract(epoch from clock_timestamp()),
 CASE accion WHEN 'alta' THEN 'Mesa Fundadora activada.' WHEN 'renovacion' THEN 'Mesa Fundadora renovada por 30 días. Revisá el cargo en tu cuenta.' WHEN 'consentimiento' THEN 'Activaste la renovación de Mesa Fundadora.' WHEN 'cancelacion_renovacion' THEN 'Desactivaste la renovación. Conservás el período pagado.' ELSE 'Terminó tu período de Mesa Fundadora. Revisá el estado en Mi Club.' END);
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS club_historial ON membresia;
CREATE TRIGGER club_historial AFTER INSERT OR UPDATE ON membresia FOR EACH ROW EXECUTE FUNCTION club_historial();

-- Una función compartida define exactamente el derecho que se consulta y entrega.
CREATE OR REPLACE FUNCTION club_ventana(p_membresia uuid,p_clase text,p_ahora timestamptz DEFAULT now()) RETURNS date LANGUAGE sql STABLE AS $$
 SELECT CASE WHEN p_clase='bebida_dia' THEN (p_ahora AT TIME ZONE 'America/Managua')::date
 WHEN m.contrato_version='fundadora-2026-10' THEN (m.periodo_inicio AT TIME ZONE 'America/Managua')::date
 ELSE date_trunc('month',p_ahora AT TIME ZONE 'America/Managua')::date END FROM membresia m WHERE m.id=p_membresia
$$;
CREATE OR REPLACE FUNCTION club_beneficio_usado(p_membresia uuid,p_clase text) RETURNS boolean LANGUAGE sql STABLE AS $$
 SELECT EXISTS(SELECT 1 FROM operativo_beneficio_uso b JOIN membresia anterior ON anterior.id=b.membresia_id JOIN membresia actual ON actual.id=p_membresia
 WHERE b.clase=p_clase AND b.ventana=club_ventana(actual.id,p_clase)
 AND (b.membresia_id=actual.id OR (p_clase='bebida_dia' AND actual.contrato_version='fundadora-2026-10' AND anterior.socio_id=actual.socio_id)))
$$;
ALTER TABLE beneficio_uso ALTER COLUMN ventana DROP EXPRESSION IF EXISTS;
CREATE OR REPLACE FUNCTION club_ventana_uso() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 NEW.ventana:=club_ventana(NEW.membresia_id,NEW.clase,NEW.usado_en); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS club_ventana_uso ON beneficio_uso;
CREATE TRIGGER club_ventana_uso BEFORE INSERT ON beneficio_uso FOR EACH ROW EXECUTE FUNCTION club_ventana_uso();

CREATE OR REPLACE FUNCTION mantener_membresia(p_socio uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE m membresia%ROWTYPE; activo boolean; disponible integer; nueva_hasta timestamptz; referencia text;
BEGIN
 SELECT baja IS NULL INTO activo FROM socio WHERE id=p_socio AND archivado_muestra IS NULL FOR UPDATE;
 IF NOT FOUND THEN RETURN; END IF;
 SELECT * INTO m FROM membresia WHERE socio_id=p_socio AND estado IN ('activa','en_gracia') AND archivado_muestra IS NULL FOR UPDATE;
 IF NOT FOUND OR m.hasta>now() THEN RETURN; END IF;
 IF NOT activo OR NOT m.autorenueva OR m.renovacion_consentida IS NULL THEN
  UPDATE membresia SET estado='vencida',motivo_fin='renovacion_desactivada' WHERE id=m.id; RETURN;
 END IF;
 SELECT total INTO disponible FROM saldo_de(p_socio);
 IF disponible<m.cuota THEN UPDATE membresia SET estado='vencida',motivo_fin='saldo_insuficiente' WHERE id=m.id; RETURN; END IF;
 nueva_hasta:=now()+interval '30 days'; referencia:='renovacion:'||m.id||':'||extract(epoch FROM m.hasta)::text;
 INSERT INTO asiento(socio_id,monto,tipo,concepto,ref_externa) VALUES(p_socio,-m.cuota,'consumo','Mesa Fundadora · renovación de 30 días',referencia);
 UPDATE membresia SET estado='activa',periodo_inicio=now(),hasta=nueva_hasta,motivo_fin=NULL WHERE id=m.id;
 INSERT INTO auditoria(quien,accion,socio_id,monto,detalle) VALUES('sistema','renovacion',p_socio,-m.cuota,jsonb_build_object('membresia',m.id,'hasta',nueva_hasta,'version',m.contrato_version));
END $$;

-- Cada cuenta se renueva en un subbloque: un registro defectuoso no revierte
-- renovaciones sanas. El Worker recibe el número de fallos para alertar/reintentar.
CREATE OR REPLACE FUNCTION mantener_membresias_club() RETURNS TABLE(correctos integer,fallidos integer) LANGUAGE plpgsql AS $$
DECLARE r record;
BEGIN
 correctos:=0;fallidos:=0;
 FOR r IN SELECT socio_id FROM operativo_membresia WHERE estado IN ('activa','en_gracia') AND hasta<=now() ORDER BY socio_id LOOP
  BEGIN
   PERFORM mantener_membresia(r.socio_id);correctos:=correctos+1;
  EXCEPTION WHEN OTHERS THEN fallidos:=fallidos+1;
  END;
 END LOOP;
 RETURN NEXT;
END $$;

-- Eventos existentes siguen abiertos. Los nuevos necesitan fechas explícitas.
ALTER TABLE experiencia ADD COLUMN IF NOT EXISTS abre_socios timestamptz;
ALTER TABLE experiencia ADD COLUMN IF NOT EXISTS abre_publico timestamptz;
UPDATE experiencia SET abre_socios=now()-interval '48 hours',abre_publico=now() WHERE abre_socios IS NULL AND NOT EXISTS(SELECT 1 FROM club_migracion WHERE version='024');
ALTER TABLE experiencia ADD COLUMN IF NOT EXISTS duracion_minutos integer CHECK(duracion_minutos BETWEEN 15 AND 720);
ALTER TABLE experiencia ADD COLUMN IF NOT EXISTS lugar text;
ALTER TABLE experiencia ADD COLUMN IF NOT EXISTS incluye text;
ALTER TABLE experiencia ADD COLUMN IF NOT EXISTS condiciones text;
ALTER TABLE experiencia ADD COLUMN IF NOT EXISTS cancelada timestamptz;
ALTER TABLE experiencia ADD COLUMN IF NOT EXISTS motivo_cancelacion text;
ALTER TABLE asiento_experiencia ADD COLUMN IF NOT EXISTS reembolsada timestamptz;
ALTER TABLE asiento_experiencia ADD COLUMN IF NOT EXISTS cobro_ref text;
UPDATE asiento_experiencia a SET cobro_ref=r.referencia FROM solicitud_compra r
 WHERE a.cobro_ref IS NULL AND r.socio_id=a.socio_id AND r.operacion='experiencia'
 AND r.huella=a.experiencia_id AND r.respuesta->>'butaca'=a.butaca::text
 AND EXISTS(SELECT 1 FROM asiento x WHERE x.socio_id=a.socio_id AND x.ref_externa=r.referencia AND x.monto=-a.pagado);
UPDATE asiento_experiencia a SET cobro_ref='exp:'||a.id WHERE a.cobro_ref IS NULL
 AND EXISTS(SELECT 1 FROM asiento x WHERE x.socio_id=a.socio_id AND x.ref_externa='exp:'||a.id AND x.monto=-a.pagado);
CREATE OR REPLACE VIEW operativo_asiento_experiencia AS SELECT a.* FROM asiento_experiencia a
 WHERE EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=a.socio_id)
 AND (cedido_a IS NULL OR EXISTS(SELECT 1 FROM operativo_socio s WHERE s.id=a.cedido_a));

CREATE TABLE IF NOT EXISTS club_espera (
 socio_id uuid PRIMARY KEY REFERENCES socio(id), creada timestamptz NOT NULL DEFAULT now(),
 consentimiento timestamptz NOT NULL, cancelada timestamptz, contactada timestamptz, atendida_por text
);
CREATE TABLE IF NOT EXISTS club_reposicion (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),uso_id bigint NOT NULL UNIQUE REFERENCES beneficio_uso(id),
 socio_id uuid NOT NULL REFERENCES socio(id),clase text NOT NULL CHECK(clase IN ('bebida_dia','bolsa_mes')),
 motivo text NOT NULL CHECK(length(motivo) BETWEEN 5 AND 500),creada timestamptz NOT NULL DEFAULT now(),creada_por text NOT NULL,
 codigo text UNIQUE,vence timestamptz,entregada timestamptz,entregada_por text
);
CREATE TABLE IF NOT EXISTS club_config (
 id boolean PRIMARY KEY DEFAULT true CHECK(id), version integer NOT NULL DEFAULT 1,
 cafe_detalle text, sellos_regla text, premio_detalle text, vip_regla text,
 costo_cafe integer CHECK(costo_cafe>=0), costo_bolsa integer CHECK(costo_bolsa>=0),
 costo_fijo_periodo integer CHECK(costo_fijo_periodo>=0), actualizado timestamptz NOT NULL DEFAULT now()
);
INSERT INTO club_config(id) VALUES(true) ON CONFLICT DO NOTHING;
ALTER TABLE club_config ADD COLUMN IF NOT EXISTS reposteria jsonb NOT NULL DEFAULT '[]' CHECK(jsonb_typeof(reposteria)='array');
CREATE TABLE IF NOT EXISTS club_metrica (
 dia date NOT NULL, evento text NOT NULL, dispositivo text NOT NULL, cantidad integer NOT NULL DEFAULT 1,
 PRIMARY KEY(dia,evento,dispositivo)
);
CREATE TABLE IF NOT EXISTS club_rendimiento (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,dia date NOT NULL DEFAULT current_date,
 metrica text NOT NULL CHECK(metrica IN ('LCP','INP','CLS')),valor double precision NOT NULL CHECK(valor>=0),dispositivo text NOT NULL
);
DROP TRIGGER IF EXISTS club_evento_inmutable ON club_evento;
CREATE TRIGGER club_evento_inmutable BEFORE UPDATE OR DELETE ON club_evento FOR EACH ROW EXECUTE FUNCTION solo_se_agrega();
DROP TRIGGER IF EXISTS club_periodo_inmutable ON club_periodo;
CREATE TRIGGER club_periodo_inmutable BEFORE UPDATE OR DELETE ON club_periodo FOR EACH ROW EXECUTE FUNCTION solo_se_agrega();
INSERT INTO club_migracion(version) VALUES('024') ON CONFLICT DO NOTHING;
COMMIT;
