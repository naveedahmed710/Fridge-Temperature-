const { Router } = require("express");
const db = require("../db");

const router = Router();

router.post("/", (req, res) => {
  const { device_id, sensors } = req.body;

  if (!device_id || !Array.isArray(sensors) || sensors.length === 0) {
    return res.status(400).json({ error: "Invalid payload. Requires device_id and sensors array." });
  }

  for (const s of sensors) {
    if (!s.id || typeof s.temp_c !== "number") {
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

  const cleanName = display_name.trim();
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

router.post("/power", (req, res) => {
  const { device_id, phases } = req.body;

  if (!device_id || !Array.isArray(phases) || phases.length === 0) {
    return res
      .status(400)
      .json({ error: "Invalid payload. Requires device_id and phases array." });
  }

  for (const phase of phases) {
    if (
      !phase.id ||
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
  const hours = parseInt(req.query.hours, 10) || 24;

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
  const hours = parseInt(req.query.hours, 10) || 24;

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
  const hours = parseInt(req.query.hours, 10) || 24;

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
  const hours = parseInt(req.query.hours, 10) || 24;

  try {
    const data = db.getStats(deviceId, hours);
    res.json({ device_id: deviceId, hours, stats: data });
  } catch (err) {
    console.error("DB query error:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
