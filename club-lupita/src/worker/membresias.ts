import { neon } from '@neondatabase/serverless'

/**
 * Proyección de las plazas que conservará mantener_membresia al operar.
 * Leer disponibilidad no renueva, cobra ni cambia estados. Una renovación
 * consentida con saldo conserva su plaza aunque el cron aún no la haya tratado.
 * Mantener este criterio junto al de mantener_membresia en las migraciones.
 */
export async function plazasOcupadas(db: string): Promise<{ n: number; salen: number }> {
  const sql = neon(db)
  const [fila] = await sql`SELECT count(*)::int AS n,
    count(*) FILTER (WHERE NOT m.autorenueva)::int AS salen
    FROM operativo_membresia m JOIN operativo_socio s ON s.id=m.socio_id
    WHERE m.estado IN ('activa','en_gracia') AND (
      m.hasta>now() OR (s.baja IS NULL AND m.autorenueva AND m.renovacion_consentida IS NOT NULL
        AND (SELECT total FROM saldo_de(m.socio_id))>=m.cuota))`
  return { n: Number(fila.n), salen: Number(fila.salen) }
}
