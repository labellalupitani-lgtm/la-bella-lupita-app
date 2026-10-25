-- La socia de demostración lleva cuatro meses en la casa, así que su nivel no
-- puede ser «Casa Abierta»: eso es el de alguien que acaba de entrar. Se le
-- escriben las dos tandas que ya cerró y canjeó, con sus nueve sellos cada una.
BEGIN;

WITH s AS (SELECT id FROM socio WHERE telefono = '50587442005'),
     nuevas AS (
       INSERT INTO tanda (socio_id, abierta, cerrada, canjeada)
       SELECT (SELECT id FROM s),
              now() - (g.dias || ' days')::interval,
              now() - ((g.dias - 30) || ' days')::interval,
              now() - ((g.dias - 30) || ' days')::interval
       FROM (VALUES (118), (76)) AS g(dias)
       RETURNING id, abierta
     )
INSERT INTO sello (tanda_id, n, motivo, barista, puesto, ref_externa)
SELECT n.id, v.n, v.motivo, v.barista, n.abierta + (v.n || ' days')::interval,
       'hist-' || n.id || '-' || v.n
FROM nuevas n
CROSS JOIN (VALUES
  (1, 'Cappuccino', 'Iveth'), (2, 'Espresso', 'Denis'), (3, 'Bagel de Salmón', 'Iveth'),
  (4, 'Latte', 'Marlon'), (5, 'Cortadito', 'Denis'), (6, 'Risotto de Gallo Pinto', 'Iveth'),
  (7, 'Americano', 'Marlon'), (8, 'Dulce Tentación', 'Denis'), (9, 'Cappuccino', 'Iveth')
) AS v(n, motivo, barista)
ON CONFLICT DO NOTHING;

COMMIT;
