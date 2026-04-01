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
