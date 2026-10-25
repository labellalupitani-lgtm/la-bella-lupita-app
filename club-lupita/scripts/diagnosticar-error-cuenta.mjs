import { readFileSync, mkdirSync, appendFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { spawn } from 'node:child_process'
const cred = parseEnv(readFileSync('.env.deploy', 'utf8'))
const dir = 'entregables/error-cuenta-2026-10-22'
mkdirSync(dir, { recursive: true })
const cli = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'tail', 'club-lupita', '--format', 'json', '--method', 'GET'], {
  env: { ...process.env, CLOUDFLARE_API_TOKEN: cred.CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID: cred.CLOUDFLARE_ACCOUNT_ID, WRANGLER_SEND_METRICS: 'false' },
  stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
})
let buffer = ''
cli.stdout.on('data', chunk => {
  buffer += chunk.toString()
  while (true) {
    const start = buffer.indexOf('{'); if (start < 0) { buffer = ''; return }
    let depth = 0, quoted = false, escaped = false, end = -1
    for (let i = start; i < buffer.length; i++) {
      const c = buffer[i]
      if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false }
      else if (c === '"') quoted = true
      else if (c === '{') depth++
      else if (c === '}' && --depth === 0) { end = i + 1; break }
    }
    if (end < 0) return
    const raw = buffer.slice(start, end); buffer = buffer.slice(end)
    try {
      const event = JSON.parse(raw)
      const pathname = event.event?.request?.url ? new URL(event.event.request.url).pathname : ''
      if (!pathname.startsWith('/api/')) continue
      const codes = (event.logs ?? []).flatMap(log => (log.message ?? []).flatMap(message => {
        try { const data = JSON.parse(message); return data.evento === 'error_api' ? [{ evento: data.evento, codigo: data.codigo, id: data.id }] : [] } catch { return [] }
      }))
      const safe = { fecha: event.eventTimestamp, ruta: pathname, estado: event.event?.response?.status, resultado: event.outcome, errores: codes, excepciones: (event.exceptions ?? []).map(x => ({name: x.name})) }
      const line = JSON.stringify(safe)
      appendFileSync(dir + '/servidor.jsonl', line + '\n'); console.log(line)
    } catch { console.log('Evento no interpretable; contenido descartado.') }
  }
})
cli.stderr.on('data', () => console.log('Wrangler emitió un diagnóstico; contenido omitido para preservar credenciales.'))
console.log('Escucha de diagnóstico iniciada; sólo se guardan ruta, estado y código de error.')
const timeout = setTimeout(() => cli.kill(), 120_000)
cli.on('close', code => { clearTimeout(timeout); console.log('Escucha finalizada', code) })
