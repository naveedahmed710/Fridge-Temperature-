const { Router } = require("express");
const db = require("../db");

const router = Router();

const MAX_HOURS = 720;
const MAX_NAME_LENGTH = 100;
const DEVICE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const SENSOR_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

function clampHours(raw) {
  const h = parseInt(raw, 10) || 24;
  return Math.max(1, Math.min(h, MAX_HOURS));
}

function isValidId(id, pattern) {
  return typeof id === "string" && pattern.test(id);
}

router.post("/", (req, res) => {
  const { device_id, sensors } = req.body;

  if (!isValidId(device_id, DEVICE_ID_PATTERN) || !Array.isArray(sensors) || sensors.length === 0) {
    return res.status(400).json({ error: "Invalid payload. Requires valid device_id and sensors array." });
  }

  for (const s of sensors) {
    if (!isValidId(s.id, SENSOR_ID_PATTERN) || typeof s.temp_c !== "number") {
      return res.status(400).json({ error: `Invalid sensor entry: ${JSON.stringify(s)}` });
    }
  }

  try {
    const count = db.addReadings(device_id, sensors);
    res.status(201).json({ message: `Stored ${count} reading(s)` });
  } catch (err) {
    console.error("DB insert error:", err.message);
    res.status(500).json({ error: "Failed to store readings" });
  }
});

router.get("/sensor-names", (req, res) => {
  const deviceId = req.query.device_id || "fridge-01";

  try {
    const names = db.getSensorNames(deviceId);
    res.json({ device_id: deviceId, names });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch sensor names" });
  }
});

router.put("/sensor-names", (req, res) => {
  const { device_id, sensor_id, display_name } = req.body;

  if (!device_id || !sensor_id || typeof display_name !== "string") {
    return res.status(400).json({
      error: "Invalid payload. Requires device_id, sensor_id and display_name.",
    });
  }

  if (!isValidId(device_id, DEVICE_ID_PATTERN) || !isValidId(sensor_id, SENSOR_ID_PATTERN)) {
    return res.status(400).json({ error: "Invalid device_id or sensor_id format." });
  }

  const cleanName = display_name.trim().slice(0, MAX_NAME_LENGTH);
  if (!cleanName) {
    return res.status(400).json({ error: "display_name cannot be empty." });
  }

  try {
    db.upsertSensorName(device_id, sensor_id, cleanName);
    res.json({
      message: "Sensor name updated",
      sensor: { device_id, sensor_id, display_name: cleanName },
    });
  } catch (err) {
    console.error("DB upsert error:", err.message);
    res.status(500).json({ error: "Failed to update sensor name" });
  }
});

router.get("/device-names", (_req, res) => {
  try {
    const names = db.getDeviceNames();
    res.json({ names });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch device names" });
  }
});

router.put("/device-names", (req, res) => {
  const { device_id, display_name } = req.body;

  if (!isValidId(device_id, DEVICE_ID_PATTERN) || typeof display_name !== "string") {
    return res.status(400).json({ error: "Invalid payload. Requires valid device_id and display_name." });
  }

  const cleanName = display_name.trim().slice(0, MAX_NAME_LENGTH);
  if (!cleanName) {
    return res.status(400).json({ error: "display_name cannot be empty." });
  }

  try {
    db.upsertDeviceName(device_id, cleanName);
    res.json({ message: "Device name updated", device: { device_id, display_name: cleanName } });
  } catch (err) {
    console.error("DB upsert error:", err.message);
    res.status(500).json({ error: "Failed to update device name" });
  }
});

router.get("/device-status", (req, res) => {
  const ids = req.query.device_ids;
  if (!ids) {
    return res.status(400).json({ error: "Requires device_ids query param (comma-separated)." });
  }

  const deviceIds = ids.split(",").map((s) => s.trim()).filter(Boolean);
  if (deviceIds.length === 0 || deviceIds.some((id) => !isValidId(id, DEVICE_ID_PATTERN))) {
    return res.status(400).json({ error: "Invalid device_ids." });
  }

  try {
    const statuses = db.getDeviceStatus(deviceIds);
    res.json({ statuses });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch device status" });
  }
});

router.post("/power", (req, res) => {
  const { device_id, phases } = req.body;

  if (!isValidId(device_id, DEVICE_ID_PATTERN) || !Array.isArray(phases) || phases.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid payload. Requires valid device_id and phases array." });
  }

  for (const phase of phases) {
    if (
      !isValidId(phase.id, SENSOR_ID_PATTERN) ||
      typeof phase.voltage_v !== "number" ||
      typeof phase.current_a !== "number"
    ) {
      return res
        .status(400)
        .json({ error: `Invalid phase entry: ${JSON.stringify(phase)}` });
    }
  }

  try {
    const count = db.addPowerReadings(device_id, phases);
    res.status(201).json({ message: `Stored ${count} power reading(s)` });
  } catch (err) {
    console.error("DB insert error:", err.message);
    res.status(500).json({ error: "Failed to store power readings" });
  }
});

router.get("/power/latest", (req, res) => {
  const deviceId = req.query.device_id || "power-01";

  try {
    const data = db.getPowerLatest(deviceId);
    res.json({ device_id: deviceId, readings: data });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch latest power readings" });
  }
});

router.get("/power", (req, res) => {
  const deviceId = req.query.device_id || "power-01";
  const hours = clampHours(req.query.hours);

  try {
    const data = db.getPowerReadings(deviceId, hours);
    res.json({ device_id: deviceId, hours, count: data.length, readings: data });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch power readings" });
  }
});

router.get("/power/stats", (req, res) => {
  const deviceId = req.query.device_id || "power-01";
  const hours = clampHours(req.query.hours);

  try {
    const data = db.getPowerStats(deviceId, hours);
    res.json({ device_id: deviceId, hours, stats: data });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch power stats" });
  }
});

router.get("/latest", (req, res) => {
  const deviceId = req.query.device_id || "fridge-01";

  try {
    const data = db.getLatest(deviceId);
    res.json({ device_id: deviceId, readings: data });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch latest readings" });
  }
});

router.get("/", (req, res) => {
  const deviceId = req.query.device_id || "fridge-01";
  const hours = clampHours(req.query.hours);

  try {
    const data = db.getReadings(deviceId, hours);
    res.json({ device_id: deviceId, hours, count: data.length, readings: data });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});

router.get("/stats", (req, res) => {
  const deviceId = req.query.device_id || "fridge-01";
  const hours = clampHours(req.query.hours);

  try {
    const data = db.getStats(deviceId, hours);
    res.json({ device_id: deviceId, hours, stats: data });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
