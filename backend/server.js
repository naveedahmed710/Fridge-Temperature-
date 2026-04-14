const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { initDb, purgeOldReadings } = require("./db");
const readingsRouter = require("./routes/readings");

const app = express();
const PORT = process.env.PORT || 4004;

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:4004")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "1mb" }));

const API_KEY = process.env.API_KEY || "";

function apiKeyAuth(req, res, next) {
  if (!API_KEY) return next();
  const provided = req.headers["x-api-key"] || req.query.api_key;
  if (provided === API_KEY) return next();
  return res.status(401).json({ error: "Invalid or missing API key" });
}

const postLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

app.use("/api/readings", apiKeyAuth, postLimiter, readingsRouter);

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

async function start() {
  await initDb();
  console.log("SQLite database initialized");

  // Purge readings older than 90 days, once per day
  setInterval(() => purgeOldReadings(90), 24 * 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Fridge Monitor API running on http://localhost:${PORT}`);
    console.log(
      "Endpoints: /api/readings, /api/readings/sensor-names, /api/readings/power, /api/readings/power/latest, /api/readings/power/stats"
    );
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
