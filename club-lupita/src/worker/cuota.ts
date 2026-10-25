export type Cuota = { medido: number; inicio: string; fin: string; cuHoras: number; presupuesto: number; porcentaje: number; umbral: number; proyeccionCuHoras: number; real: number; demo: number }
export function resumirCuota(p: { compute_time_seconds: number; consumption_period_start: string; consumption_period_end: string }, ramas: { name: string; compute_time_seconds: number }[], ahora: number, presupuesto = 100): Cuota {
  const inicio = Date.parse(p.consumption_period_start), fin = Date.parse(p.consumption_period_end)
  if (!Number.isFinite(p.compute_time_seconds) || p.compute_time_seconds < 0 || !Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio || ahora < inicio || presupuesto <= 0) throw Error('Contadores de cuota inválidos')
  const cuHoras = p.compute_time_seconds / 3600, porcentaje = cuHoras / presupuesto * 100
  const umbral = [100, 90, 80, 60].find(n => porcentaje >= n) ?? 0
  return { medido: ahora, inicio: p.consumption_period_start, fin: p.consumption_period_end, cuHoras, presupuesto, porcentaje, umbral,
    proyeccionCuHoras: cuHoras * (fin - inicio) / Math.max(3_600_000, Math.min(fin, ahora) - inicio),
    real: (ramas.find(r => r.name === 'main')?.compute_time_seconds ?? 0) / 3600,
    demo: (ramas.find(r => r.name === 'demostracion-aislada')?.compute_time_seconds ?? 0) / 3600 }
}
export async function consultarCuota(clave: string, ahora = Date.now()): Promise<Cuota> {
  const base = 'https://console.neon.tech/api/v2/projects/polished-waterfall-53015854'
  const leer = async (ruta: string) => {
    const r = await fetch(base + ruta, { headers: { Authorization: 'Bearer ' + clave }, signal: AbortSignal.timeout(10_000) })
    if (!r.ok) throw Error('Monitor de cuota HTTP ' + r.status)
    return r.json()
  }
  const [proyecto, ramas] = await Promise.all([leer(''), leer('/branches?limit=100')]) as [{ project: Parameters<typeof resumirCuota>[0] }, { branches: Parameters<typeof resumirCuota>[1] }]
  return resumirCuota(proyecto.project, ramas.branches, ahora)
}
export function esCuotaAgotada(error: unknown) {
  return error instanceof Error && /HTTP status 402|exceeded the quota/i.test(error.message)
}
