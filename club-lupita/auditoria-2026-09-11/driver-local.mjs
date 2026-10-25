// Adaptador exclusivo de auditoría: ejecuta el SQL original en PostgreSQL WASM.
// No lee secretos, no conecta con Neon ni modifica el código de la aplicación.
export const neonConfig = {};
export class Client {
  async connect() {}
  async end() {}
  async query(query, params) { return globalThis.__auditDb.query(query, params); }
}
export function neon() {
  const sql = (parts, ...params) => {
    const query = parts.reduce((s, part, i) => s + (i ? '$' + i : '') + part, '');
    const execute = () => globalThis.__auditDb.query(query, params).then(r => r.rows);
    return { execute, then: (yes, no) => execute().then(yes, no) };
  };
  sql.transaction = async queries => {
    await globalThis.__auditDb.exec('BEGIN');
    try {
      const results = [];
      for (const q of queries) results.push(await q.execute());
      await globalThis.__auditDb.exec('COMMIT');
      return results;
    } catch (e) { await globalThis.__auditDb.exec('ROLLBACK'); throw e; }
  };
  return sql;
}
