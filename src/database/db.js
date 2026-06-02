import * as SQLite from 'expo-sqlite';

let _db = null;

export async function getDb() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('gps.db');
  await _db.execAsync(`
    CREATE TABLE IF NOT EXISTS localizacoes (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      label     TEXT,
      latitude  REAL NOT NULL,
      longitude REAL NOT NULL,
      altitude  REAL,
      accuracy  REAL,
      endereco  TEXT,
      timestamp TEXT NOT NULL
    );
  `);
  return _db;
}

export async function salvarLocalizacao({ label, latitude, longitude, altitude, accuracy, endereco }) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO localizacoes (label, latitude, longitude, altitude, accuracy, endereco, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [label || '', latitude, longitude, altitude ?? null, accuracy ?? null, endereco || '', new Date().toISOString()]
  );
}

export async function buscarLocalizacoes() {
  const db = await getDb();
  return db.getAllAsync(`SELECT * FROM localizacoes ORDER BY id DESC`);
}

export async function deletarLocalizacao(id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM localizacoes WHERE id = ?`, [id]);
}
