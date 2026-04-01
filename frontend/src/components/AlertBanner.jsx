const FRIDGE_THRESHOLD = 8;
const FREEZER_THRESHOLD = -10;

export default function AlertBanner({ readings }) {
  if (!readings || readings.length === 0) return null;

  const alerts = [];

  for (const r of readings) {
    if (r.temp_c > FRIDGE_THRESHOLD) {
      alerts.push({
        sensor: r.sensor_id,
        temp: r.temp_c,
        message: `${r.sensor_id.replace("_", " ")} is at ${r.temp_c.toFixed(1)}°C — above ${FRIDGE_THRESHOLD}°C threshold`,
      });
    }
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="bg-red-950/40 border border-red-800/50 rounded-xl px-5 py-4 flex items-center gap-3"
        >
          <span className="text-red-400 text-xl flex-shrink-0">!!</span>
          <span className="text-red-300 text-sm font-medium">
            {alert.message}
          </span>
        </div>
      ))}
    </div>
  );
}
