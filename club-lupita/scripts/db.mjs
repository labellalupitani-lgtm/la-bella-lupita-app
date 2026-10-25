#!/usr/bin/env node
/**
 * Ejecuta archivos .sql contra Neon.
 *   node scripts/db.mjs db/001_schema.sql db/002_seed.sql
 *
 * Usa el cliente WebSocket (no el HTTP) porque el HTTP abre una transaccion por
 * sentencia: una migracion con BEGIN/COMMIT necesita una sesion de verdad.
 */
import { readFileSync } from 'node:fs'
import { Client, neonConfig } from '@neondatabase/serverless'

neonConfig.webSocketConstructor = globalThis.WebSocket

function cargarUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const crudo = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8')
  const m = crudo.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/)
  if (!m) throw new Error('DATABASE_URL no encontrada en .dev.vars')
  return m[1].trim()
}

const archivos = process.argv.slice(2)
if (!archivos.length) {
  console.error('uso: node scripts/db.mjs <archivo.sql> [...]')
  process.exit(1)
}

const cliente = new Client(cargarUrl())
await cliente.connect()

try {
  for (const f of archivos) {
    process.stdout.write(`\n> ${f} ... `)
    await cliente.query(readFileSync(f, 'utf8'))
    process.stdout.write('ok\n')
  }
  console.log('\nMigracion aplicada sin error.')
} catch (e) {
  console.error('\nFALLO:', e.message)
  if (e.position) console.error('  posicion', e.position)
  process.exitCode = 1
} finally {
  await cliente.end()
}
