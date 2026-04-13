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

  db.run(`
    CREATE TABLE IF NOT EXISTS sensor_names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      sensor_id TEXT NOT NULL,
      display_name TEXT NOT NULL,
      updated_at DATETIME DEFAULT (datetime('now')),
      UNIQUE(device_id, sensor_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS power_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      phase_id TEXT NOT NULL,
      voltage_v REAL NOT NULL,
      current_a REAL NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_readings_time ON readings(created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_readings_device ON readings(device_id, sensor_id)`);
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_sensor_names_device ON sensor_names(device_id, sensor_id)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_power_readings_device ON power_readings(device_id, phase_id)`
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_power_readings_time ON power_readings(created_at)`
  );

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
    if (typeof s.name === "string" && s.name.trim()) {
      upsertSensorName(deviceId, s.id, s.name.trim(), false);
    }
  }
  stmt.free();
  save();
  return sensors.length;
}

function addPowerReadings(deviceId, phases) {
  const stmt = db.prepare(
    "INSERT INTO power_readings (device_id, phase_id, voltage_v, current_a) VALUES (?, ?, ?, ?)"
  );
  for (const p of phases) {
    stmt.run([deviceId, p.id, p.voltage_v, p.current_a]);
  }
  stmt.free();
  save();
  return phases.length;
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

function getPowerLatest(deviceId) {
  return queryAll(
    `SELECT phase_id, voltage_v, current_a, created_at
     FROM power_readings
     WHERE device_id = ?
       AND id IN (
         SELECT MAX(id) FROM power_readings WHERE device_id = ? GROUP BY phase_id
       )`,
    [deviceId, deviceId]
  );
}

function getPowerReadings(deviceId, hours = 24) {
  return queryAll(
    `SELECT phase_id, voltage_v, current_a, created_at
     FROM power_readings
     WHERE device_id = ?
       AND created_at >= datetime('now', ?)
     ORDER BY created_at ASC`,
    [deviceId, `-${hours} hours`]
  );
}

function getPowerStats(deviceId, hours = 24) {
  return queryAll(
    `SELECT phase_id,
            MIN(voltage_v) AS min_voltage,
            MAX(voltage_v) AS max_voltage,
            ROUND(AVG(voltage_v), 2) AS avg_voltage,
            MIN(current_a) AS min_current,
            MAX(current_a) AS max_current,
            ROUND(AVG(current_a), 2) AS avg_current,
            COUNT(*) AS reading_count
     FROM power_readings
     WHERE device_id = ?
       AND created_at >= datetime('now', ?)
     GROUP BY phase_id`,
    [deviceId, `-${hours} hours`]
  );
}

function getSensorNames(deviceId) {
  return queryAll(
    `SELECT sensor_id, display_name, updated_at
     FROM sensor_names
     WHERE device_id = ?
     ORDER BY sensor_id ASC`,
    [deviceId]
  );
}

function upsertSensorName(deviceId, sensorId, displayName, persist = true) {
  db.run(
    `INSERT INTO sensor_names (device_id, sensor_id, display_name, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(device_id, sensor_id)
     DO UPDATE SET
       display_name = excluded.display_name,
       updated_at = datetime('now')`,
    [deviceId, sensorId, displayName]
  );
  if (persist) save();
}

function purgeOldReadings(days = 90) {
  db.run("DELETE FROM readings WHERE created_at < datetime('now', ?)", [
    `-${days} days`,
  ]);
  db.run("DELETE FROM power_readings WHERE created_at < datetime('now', ?)", [
    `-${days} days`,
  ]);
  save();
}

module.exports = {
  initDb,
  getDb,
  addReadings,
  addPowerReadings,
  getLatest,
  getReadings,
  getStats,
  getPowerLatest,
  getPowerReadings,
  getPowerStats,
  getSensorNames,
  upsertSensorName,
  purgeOldReadings,
};
