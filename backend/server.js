const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDb, purgeOldReadings } = require("./db");
const readingsRouter = require("./routes/readings");

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

app.use("/api/readings", readingsRouter);

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
      "Endpoints: POST/GET /api/readings | GET /api/readings/latest | GET /api/readings/stats"
    );
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
