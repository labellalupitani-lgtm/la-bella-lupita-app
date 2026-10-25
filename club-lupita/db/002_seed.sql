-- Club Lupita — datos semilla.
-- Repetible: se puede correr varias veces sin duplicar nada.

BEGIN;

-- ------------------------------------------------------------
-- Experiencias con cupo real
-- ------------------------------------------------------------
INSERT INTO experiencia (id, nombre, cuando, cupos, precio) VALUES
  ('mesa-tostador', 'Mesa del Tostador',                    '2026-09-12 18:00-06', 12, 75000),
  ('cacao',         'Cata y maridaje con cacao nicaragüense','2026-09-27 16:00-06', 16, 85000),
  ('finca',         'Tour a la finca en Matagalpa',          '2026-10-04 05:00-06', 20, 240000)
ON CONFLICT (id) DO UPDATE
  SET nombre = EXCLUDED.nombre, cuando = EXCLUDED.cuando,
      cupos = EXCLUDED.cupos, precio = EXCLUDED.precio;

-- ------------------------------------------------------------
-- Reserva de Cosecha: las 150 bolsas existen como filas desde el día uno.
-- Apartar es un UPDATE sobre una fila libre, no un INSERT que dos peticiones
-- puedan duplicar. Ahí es donde muere la sobreventa.
-- ------------------------------------------------------------
INSERT INTO reserva_cosecha (numero, precio)
SELECT g, 89000 FROM generate_series(1, 150) AS g
ON CONFLICT (numero) DO NOTHING;

-- ------------------------------------------------------------
-- La socia de demostración: María, Mesa Fundadora #37, con cuatro meses
-- de historial creíble. Los números coinciden con los de la app.
-- ------------------------------------------------------------
INSERT INTO socio (telefono, nombre, bebida_siempre, alergias, cumple, creado)
VALUES ('50587442005', 'María', 'Cappuccino con leche de almendra', 'Nueces', '1991-09-14',
        now() - interval '124 days')
ON CONFLICT (telefono) DO UPDATE
  SET nombre = EXCLUDED.nombre,
      bebida_siempre = EXCLUDED.bebida_siempre,
      alergias = EXCLUDED.alergias;

-- Su tanda abierta con siete sellos.
WITH s AS (SELECT id FROM socio WHERE telefono = '50587442005'),
     t AS (
       INSERT INTO tanda (socio_id, abierta)
       SELECT id, now() - interval '26 days' FROM s
       ON CONFLICT DO NOTHING
       RETURNING id
     ),
     tt AS (
       SELECT COALESCE((SELECT id FROM t),
                       (SELECT id FROM tanda WHERE socio_id = (SELECT id FROM s) AND cerrada IS NULL)) AS id
     )
INSERT INTO sello (tanda_id, n, motivo, barista, puesto, ref_externa)
SELECT (SELECT id FROM tt), v.n, v.motivo, v.barista, now() - (v.dias || ' days')::interval,
       'seed-' || v.n
FROM (VALUES
  (1, 'Cappuccino',               'Iveth',  26),
  (2, 'Bagel de Salmón',          'Iveth',  23),
  (3, 'Cortadito',                'Denis',  19),
  (4, 'Risotto de Gallo Pinto',   'Iveth',  16),
  (5, 'Latte',                    'Marlon', 12),
  (6, 'Dulce Tentación',          'Denis',   9),
  (7, 'Espresso',                 'Iveth',   4)
) AS v(n, motivo, barista, dias)
ON CONFLICT (tanda_id, n) DO NOTHING;

-- Su Cuenta de Casa: dos recargas con bono y seis consumos.
INSERT INTO asiento (socio_id, monto, tipo, concepto, creado, ref_externa)
SELECT (SELECT id FROM socio WHERE telefono = '50587442005'),
       v.monto, v.tipo::asiento_tipo, v.concepto, now() - (v.dias || ' days')::interval, v.ref
FROM (VALUES
  ( 100000, 'recarga', 'Recarga en caja',        31, 'seed-a1'),
  (  10000, 'bono',    'La casa puso',           31, 'seed-a2'),
  (  -9500, 'consumo', 'Cappuccino',             26, 'seed-a3'),
  ( -43000, 'consumo', 'Bagel de Salmón',        23, 'seed-a4'),
  (  -9000, 'consumo', 'Cortadito',              19, 'seed-a5'),
  ( -28000, 'consumo', 'Risotto de Gallo Pinto', 16, 'seed-a6'),
  ( 100000, 'recarga', 'Recarga en caja',        12, 'seed-a7'),
  (  10000, 'bono',    'La casa puso',           12, 'seed-a8'),
  ( -32000, 'consumo', 'Dulce Tentación',         9, 'seed-a9'),
  (  -8000, 'consumo', 'Espresso',                4, 'seed-a10')
) AS v(monto, tipo, concepto, dias, ref)
ON CONFLICT (socio_id, ref_externa) WHERE ref_externa IS NOT NULL DO NOTHING;

-- Su membresía: socia fundadora número 37 de 100.
INSERT INTO membresia (socio_id, numero, cuota, desde, hasta)
SELECT id, 37, 95000, now() - interval '15 days', now() + interval '15 days'
FROM socio WHERE telefono = '50587442005'
ON CONFLICT (numero) DO NOTHING;

-- Otros 81 socios fundadores tomados: quedan 18 lugares de los 100.
INSERT INTO socio (telefono, nombre, creado)
SELECT '5055' || lpad(g::text, 7, '0'), 'Socio ' || g, now() - (g || ' days')::interval
FROM generate_series(1, 81) AS g
ON CONFLICT (telefono) DO NOTHING;

INSERT INTO membresia (socio_id, numero, cuota, desde, hasta)
SELECT s.id, g.n, 95000, now() - interval '20 days', now() + interval '10 days'
FROM generate_series(1, 81) AS g(n)
JOIN socio s ON s.telefono = '5055' || lpad(g.n::text, 7, '0')
WHERE g.n <> 37
ON CONFLICT (numero) DO NOTHING;

-- 116 bolsas ya apartadas: quedan 34 de 150, como dice la app.
UPDATE reserva_cosecha
SET socio_id = (SELECT id FROM socio WHERE telefono = '50587442005'),
    apartada = now() - interval '10 days'
WHERE numero <= 116 AND apartada IS NULL;

-- Ocho butacas vendidas de la Mesa del Tostador: quedan cuatro.
INSERT INTO asiento_experiencia (experiencia_id, butaca, socio_id, pagado)
SELECT 'mesa-tostador', g, (SELECT id FROM socio WHERE telefono = '50587442005'), 75000
FROM generate_series(1, 8) AS g
ON CONFLICT (experiencia_id, butaca) DO NOTHING;

COMMIT;
