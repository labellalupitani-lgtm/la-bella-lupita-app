-- Club Lupita — correcciones de integridad.
--
-- Tres fallos reales del esquema 001, encontrados en auditoría:
--
--  1. LA FECHA DEL DÍA SE CALCULABA EN UTC. Managua es UTC−6: a las 18:01 hora
--     local ya son las 00:01 UTC del día siguiente. Un socio que pedía su bebida
--     de cortesía a las 18:01 y otra a las 06:00 de la mañana siguiente se
--     llevaba DOS bebidas gratis en doce horas, porque para la base eran días
--     distintos. Eso es dinero perdido todos los días.
--
--  2. EL LIBRO MAYOR ERA APPEND-ONLY POR CONVENCIÓN, NO POR CONSTRUCCIÓN.
--     Nada impedía un UPDATE sobre un asiento ya escrito. Un libro que se puede
--     editar no es un libro: es un campo mutable con más pasos.
--
--  3. EL SALÓN VIP SE PODÍA RESERVAR DOS VECES A LA MISMA HORA. No había nada
--     que impidiera solapar dos reservas del mismo espacio.

BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ------------------------------------------------------------
-- 1. El día de la casa, en hora de Managua
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION dia_managua(t timestamptz DEFAULT now())
RETURNS date
LANGUAGE sql IMMUTABLE AS $$
  SELECT (t AT TIME ZONE 'America/Managua')::date;
$$;

COMMENT ON FUNCTION dia_managua IS
  'El día tal como lo vive la casa. Nunca usar now()::date: eso es UTC y adelanta el día a las 18:00 locales.';

-- El mes de la casa, para el tope de la bolsa mensual.
CREATE OR REPLACE FUNCTION mes_managua(t timestamptz DEFAULT now())
RETURNS date
LANGUAGE sql IMMUTABLE AS $$
  SELECT date_trunc('month', t AT TIME ZONE 'America/Managua')::date;
$$;

-- La ventana del tope se deriva sola de la hora de uso: la aplicación ya no
-- puede equivocarse al calcularla, porque ya no la calcula.
ALTER TABLE beneficio_uso
  ADD COLUMN IF NOT EXISTS usado_en timestamptz NOT NULL DEFAULT now();

UPDATE beneficio_uso SET usado_en = usado WHERE usado_en IS DISTINCT FROM usado;

ALTER TABLE beneficio_uso DROP COLUMN IF EXISTS ventana;

ALTER TABLE beneficio_uso
  ADD COLUMN ventana date GENERATED ALWAYS AS (
    CASE clase
      WHEN 'bebida_dia' THEN (usado_en AT TIME ZONE 'America/Managua')::date
      ELSE date_trunc('month', usado_en AT TIME ZONE 'America/Managua')::date
    END
  ) STORED;

-- La unicidad es la que impide el doble uso, no una lectura previa: dos cajas
-- que cobren a la vez no pueden crear dos filas con la misma ventana.
CREATE UNIQUE INDEX IF NOT EXISTS beneficio_uso_tope
  ON beneficio_uso (membresia_id, clase, ventana);

-- ------------------------------------------------------------
-- 2. Libro mayor de verdad: sin UPDATE, sin DELETE
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION solo_se_agrega()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'El libro mayor solo se agrega: % sobre % está prohibido. Para corregir, escribí un asiento de ajuste.',
    TG_OP, TG_TABLE_NAME
    USING ERRCODE = 'restrict_violation';
END $$;

DROP TRIGGER IF EXISTS asiento_solo_se_agrega ON asiento;
CREATE TRIGGER asiento_solo_se_agrega
  BEFORE UPDATE OR DELETE ON asiento
  FOR EACH ROW EXECUTE FUNCTION solo_se_agrega();

DROP TRIGGER IF EXISTS sello_solo_se_agrega ON sello;
CREATE TRIGGER sello_solo_se_agrega
  BEFORE UPDATE ON sello
  FOR EACH ROW EXECUTE FUNCTION solo_se_agrega();

-- Un ajuste exige quién y por qué: nadie mueve dinero en silencio.
ALTER TABLE asiento
  ADD COLUMN IF NOT EXISTS quien text,
  ADD COLUMN IF NOT EXISTS nota text;

ALTER TABLE asiento DROP CONSTRAINT IF EXISTS asiento_ajuste_con_firma;
ALTER TABLE asiento
  ADD CONSTRAINT asiento_ajuste_con_firma
  CHECK (tipo <> 'ajuste' OR (quien IS NOT NULL AND nota IS NOT NULL));

-- ------------------------------------------------------------
-- 3. El Salón VIP no se aparta dos veces
-- ------------------------------------------------------------
ALTER TABLE reserva
  ADD COLUMN IF NOT EXISTS termina timestamptz;

UPDATE reserva SET termina = cuando + interval '2 hours' WHERE termina IS NULL;

ALTER TABLE reserva ALTER COLUMN termina SET NOT NULL;
ALTER TABLE reserva DROP CONSTRAINT IF EXISTS reserva_ventana_valida;
ALTER TABLE reserva ADD CONSTRAINT reserva_ventana_valida CHECK (termina > cuando);

-- Exclusión: dos reservas vivas del mismo espacio no pueden solaparse en el
-- tiempo. Lo resuelve el índice GiST, no un SELECT previo que dos peticiones
-- simultáneas pasarían las dos.
ALTER TABLE reserva DROP CONSTRAINT IF EXISTS reserva_sin_solape;
ALTER TABLE reserva
  ADD CONSTRAINT reserva_sin_solape
  EXCLUDE USING gist (
    zona WITH =,
    tstzrange(cuando, termina) WITH &&
  ) WHERE (cancelada IS NULL AND zona = 'vip');

-- ------------------------------------------------------------
-- 4. Cuadre diario: si alguna devuelve filas, se investiga hoy
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW cuadre AS
SELECT 'monedero en negativo' AS prueba, count(*)::int AS filas
FROM socio s WHERE (SELECT total FROM saldo_de(s.id)) < 0
UNION ALL
SELECT 'tope de beneficio excedido', count(*)::int
FROM (SELECT membresia_id, clase, ventana FROM beneficio_uso
      GROUP BY 1, 2, 3 HAVING count(*) > 1) x
UNION ALL
SELECT 'socios fundadores sobre el cupo', count(*)::int
FROM (SELECT 1 FROM membresia WHERE estado IN ('activa', 'en_gracia')
      HAVING count(*) > 100) y
UNION ALL
SELECT 'bolsas apartadas sin dueño', count(*)::int
FROM reserva_cosecha WHERE apartada IS NOT NULL AND socio_id IS NULL;

COMMIT;
