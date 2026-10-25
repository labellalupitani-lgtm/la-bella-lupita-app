import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';

// Base efímera propia: esta suite no compila ni arranca el Worker y no usa Neon.
const db = new PGlite({ extensions: { pgcrypto, btree_gist } });
const migracion = readFileSync(new URL('../db/015_saldo_cronologico.sql', import.meta.url), 'utf8');
let numero = 0;
let grupos = 0;
const socios = [];
const nuevoSocio = async () => {
  const { rows: [socio] } = await db.query(
    'INSERT INTO socio(telefono,nombre) VALUES($1,$2) RETURNING id',
    ['5059900' + String(++numero).padStart(4, '0'), 'Saldo sintético ' + numero],
  );
  socios.push(socio.id);
  return socio.id;
};
const fecha = paso => new Date(Date.UTC(2026, 0, 1, 0, 0, paso)).toISOString();
const asentar = async (socio, monto, tipo, paso, devolucion = null) => {
  const { rows: [fila] } = await db.query(
    `INSERT INTO asiento(socio_id,monto,tipo,concepto,creado,quien,nota,devolucion_de)
     VALUES($1,$2,$3,'Caso sintético',$4,'prueba','Caso sintético',$5) RETURNING id`,
    [socio, monto, tipo, fecha(paso), devolucion],
  );
  return fila.id;
};
const saldo = async socio => (await db.query('SELECT * FROM saldo_de($1)', [socio])).rows[0];
const comprobar = async (socio, pagado, bono) => {
  const actual = await saldo(socio);
  assert.deepEqual(actual, { pagado, bono, total: pagado + bono });
  const { rows: [libro] } = await db.query(
    'SELECT COALESCE(SUM(monto),0)::text AS total FROM asiento WHERE socio_id=$1', [socio],
  );
  assert.equal(BigInt(actual.total), BigInt(libro.total), 'el total coincide con SUM(monto)');
};
const prueba = async (nombre, trabajo) => {
  await trabajo();
  grupos++;
  console.log('PASA ' + nombre);
};

try {
  for (const nombre of ['001_schema', '003_correcciones', '004_sesiones', '005_generacion', '012_operacion']) {
    await db.exec(readFileSync(new URL('../db/' + nombre + '.sql', import.meta.url), 'utf8'));
  }

  // Conserva el caso que fallaba antes de aplicar la corrección.
  const auditado = await nuevoSocio();
  await asentar(auditado, 20000, 'recarga', 1);
  await asentar(auditado, -20000, 'consumo', 2);
  await asentar(auditado, 50000, 'recarga', 3);
  await asentar(auditado, 4000, 'bono', 3);
  assert.deepEqual(await saldo(auditado), { pagado: 54000, bono: 0, total: 54000 });
  const antes = (await db.query('SELECT * FROM asiento ORDER BY id')).rows;
  await db.exec(migracion);

  await prueba('consumos antiguos no gastan un bono posterior; migración sin tocar el libro', async () => {
    await comprobar(auditado, 50000, 4000);
    assert.deepEqual((await db.query('SELECT * FROM asiento ORDER BY id')).rows, antes);
  });

  await prueba('una cuenta sin historial devuelve ceros y no afecta otra cuenta', async () => {
    const socio = await nuevoSocio();
    await comprobar(socio, 0, 0);
    await comprobar(auditado, 50000, 4000);
  });

  await prueba('cada consumo agota primero el bono que ya existe', async () => {
    const socio = await nuevoSocio();
    await asentar(socio, 50000, 'recarga', 1);
    await asentar(socio, 4000, 'bono', 2);
    await asentar(socio, -2500, 'consumo', 3);
    await comprobar(socio, 50000, 1500);
    await asentar(socio, -3000, 'consumo', 4);
    await comprobar(socio, 48500, 0);
  });

  await prueba('devolución de dinero no recupera bonos usados por compras posteriores', async () => {
    const socio = await nuevoSocio();
    await asentar(socio, 20000, 'recarga', 1);
    const original = await asentar(socio, -20000, 'consumo', 2);
    await asentar(socio, 50000, 'recarga', 3);
    await asentar(socio, 4000, 'bono', 3);
    await asentar(socio, -3000, 'consumo', 4);
    await comprobar(socio, 50000, 1000);
    await asentar(socio, 20000, 'ajuste', 5, original);
    await comprobar(socio, 70000, 1000);
  });

  await prueba('devoluciones mixtas y fuera de orden conservan el reparto de cada cargo', async () => {
    const socio = await nuevoSocio();
    await asentar(socio, 50000, 'recarga', 1);
    await asentar(socio, 4000, 'bono', 2);
    const primero = await asentar(socio, -10000, 'consumo', 3); // 4000 bono, 6000 pagado.
    await asentar(socio, 8000, 'bono', 4);
    const segundo = await asentar(socio, -9000, 'consumo', 5); // 8000 bono, 1000 pagado.
    await asentar(socio, 9000, 'ajuste', 6, segundo);
    await comprobar(socio, 44000, 8000);
    await asentar(socio, -2000, 'consumo', 7);
    await asentar(socio, 10000, 'ajuste', 8, primero);
    await comprobar(socio, 50000, 10000);
    await asentar(socio, -11000, 'consumo', 9);
    await comprobar(socio, 49000, 0);
  });

  await prueba('creado manda sobre la inserción y el id desempata timestamps iguales', async () => {
    const socio = await nuevoSocio();
    // Se inserta primero el bono futuro: el orden de los ids no basta.
    await asentar(socio, 4000, 'bono', 3);
    await asentar(socio, 20000, 'recarga', 1);
    await asentar(socio, -20000, 'consumo', 2);
    await comprobar(socio, 0, 4000);

    const empate = await nuevoSocio();
    await asentar(empate, 50000, 'recarga', 1);
    const cargo = await asentar(empate, -20000, 'consumo', 1);
    await asentar(empate, 4000, 'bono', 1);
    await asentar(empate, -1000, 'consumo', 1);
    await asentar(empate, 20000, 'ajuste', 1, cargo);
    await comprobar(empate, 50000, 3000);
    assert.deepEqual(await saldo(empate), await saldo(empate), 'lectura repetida determinista');
  });

  await prueba('ajustes, regalos y deuda histórica conservan SUM(monto) sin gastar bonos futuros', async () => {
    const socio = await nuevoSocio();
    for (const [monto, tipo, paso, pagado, bono] of [
      [1000, 'regalo', 1, 1000, 0],
      [-1200, 'ajuste', 2, -200, 0],
      [400, 'bono', 3, -200, 400],
      [700, 'ajuste', 4, 500, 400],
      [-450, 'deposito', 5, 450, 0],
      [50, 'ajuste', 6, 500, 0],
    ]) {
      await asentar(socio, monto, tipo, paso);
      await comprobar(socio, pagado, bono);
    }
  });

  await prueba('una referencia de devolución ajena o parcial no importa bonos de otro cargo', async () => {
    const origen = await nuevoSocio();
    await asentar(origen, 1000, 'bono', 1);
    const cargoAjeno = await asentar(origen, -1000, 'consumo', 2);
    const otro = await nuevoSocio();
    await asentar(otro, 1000, 'ajuste', 3, cargoAjeno);
    await comprobar(otro, 1000, 0);
    await comprobar(origen, 0, 0);

    const parcial = await nuevoSocio();
    await asentar(parcial, 1000, 'bono', 1);
    const cargo = await asentar(parcial, -1000, 'consumo', 2);
    await asentar(parcial, 500, 'ajuste', 3, cargo);
    await comprobar(parcial, 500, 0);
  });

  await prueba('acumuladores amplios conservan saldos finales dentro del contrato integer', async () => {
    const socio = await nuevoSocio();
    await asentar(socio, 2000000000, 'recarga', 1);
    await asentar(socio, 2000000000, 'recarga', 2);
    await asentar(socio, -2000000000, 'consumo', 3);
    await comprobar(socio, 2000000000, 0);
  });

  await prueba('libro inmutable y migración repetible conservan resultados y movimientos', async () => {
    const previo = (await db.query('SELECT * FROM asiento ORDER BY id')).rows;
    const saldos = await Promise.all(socios.map(saldo));
    await assert.rejects(() => db.query('UPDATE asiento SET monto=monto+1 WHERE id=$1', [previo[0].id]), /solo se agrega/);
    await assert.rejects(() => db.query('DELETE FROM asiento WHERE id=$1', [previo[0].id]), /solo se agrega/);
    await db.exec(migracion);
    await db.exec(migracion);
    assert.deepEqual(await Promise.all(socios.map(saldo)), saldos);
    assert.deepEqual((await db.query('SELECT * FROM asiento ORDER BY id')).rows, previo);
    for (let i = 0; i < socios.length; i++) {
      await comprobar(socios[i], saldos[i].pagado, saldos[i].bono);
    }
  });

  console.log(`${grupos} grupos de saldo cronológico correctos.`);
} finally {
  await db.close();
}
