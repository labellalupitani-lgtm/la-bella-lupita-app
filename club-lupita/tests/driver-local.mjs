export const neonConfig = {};
export class Client {
  constructor(url) { this.db=globalThis.__testDbs?.get(url)??globalThis.__testDb; }
  async connect() {}
  async end() {}
  async query(query, params) { return this.db.query(query, params); }
}
export function neon(url) {
  const db=globalThis.__testDbs?.get(url)??globalThis.__testDb;
  const sql = (parts, ...params) => {
    const query = parts.reduce((s, part, i) => s + (i ? '$' + i : '') + part, '');
    const execute = () => { if(typeof globalThis.__testHttpCalls==='number')globalThis.__testHttpCalls++;return db.query(query, params).then(r => r.rows); };
    return { execute, then: (yes, no) => execute().then(yes, no) };
  };
  sql.transaction = async queries => {
    await db.exec('BEGIN');
    try {
      const results = [];
      for (const q of queries) results.push(await q.execute());
      await db.exec('COMMIT');
      return results;
    } catch (e) { await db.exec('ROLLBACK'); throw e; }
  };
  return sql;
}
