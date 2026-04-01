const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "fridge_monitor.db");
let db = null;

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      sensor_id TEXT NOT NULL,
      temp_c REAL NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_readings_time ON readings(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_readings_device ON readings(device_id, sensor_id)`);

  save();
  return db;
}

function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function getDb() {
  if (!db) throw new Error("Database not initialized. Call initDb() first.");
  return db;
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function addReadings(deviceId, sensors) {
  const stmt = db.prepare(
    "INSERT INTO readings (device_id, sensor_id, temp_c) VALUES (?, ?, ?)"
  );
  for (const s of sensors) {
    stmt.run([deviceId, s.id, s.temp_c]);
  }
  stmt.free();
  save();
  return sensors.length;
}

function getLatest(deviceId) {
  return queryAll(
    `SELECT sensor_id, temp_c, created_at
     FROM readings
     WHERE device_id = ?
       AND id IN (
         SELECT MAX(id) FROM readings WHERE device_id = ? GROUP BY sensor_id
       )`,
    [deviceId, deviceId]
  );
}

function getReadings(deviceId, hours = 24) {
  return queryAll(
    `SELECT sensor_id, temp_c, created_at
     FROM readings
     WHERE device_id = ?
       AND created_at >= datetime('now', ?)
     ORDER BY created_at ASC`,
    [deviceId, `-${hours} hours`]
  );
}

function getStats(deviceId, hours = 24) {
  return queryAll(
    `SELECT sensor_id,
            MIN(temp_c) AS min_temp,
            MAX(temp_c) AS max_temp,
            ROUND(AVG(temp_c), 2) AS avg_temp,
            COUNT(*) AS reading_count
     FROM readings
     WHERE device_id = ?
       AND created_at >= datetime('now', ?)
     GROUP BY sensor_id`,
    [deviceId, `-${hours} hours`]
  );
}

function purgeOldReadings(days = 90) {
  db.run("DELETE FROM readings WHERE created_at < datetime('now', ?)", [
    `-${days} days`,
  ]);
  save();
}

module.exports = {
  initDb,
  getDb,
  addReadings,
  getLatest,
  getReadings,
  getStats,
  purgeOldReadings,
};
