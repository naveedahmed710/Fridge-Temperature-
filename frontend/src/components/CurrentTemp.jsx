function getTempColor(temp) {
  if (temp === null || temp === undefined) return "text-gray-400";
  if (temp <= 5) return "text-emerald-500";
  if (temp <= 8) return "text-amber-500";
  return "text-red-500";
}

function getTempBg(temp) {
  if (temp === null || temp === undefined) return "bg-gray-800/50 border-gray-700";
  if (temp <= 5) return "bg-emerald-950/30 border-emerald-800/50";
  if (temp <= 8) return "bg-amber-950/30 border-amber-800/50";
  return "bg-red-950/30 border-red-800/50";
}

function getStatusLabel(temp) {
  if (temp === null || temp === undefined) return "No Data";
  if (temp <= 5) return "Normal";
  if (temp <= 8) return "Warning";
  return "Critical";
}

export default function CurrentTemp({ readings, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-24 mb-4" />
            <div className="h-16 bg-gray-700 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  const sensors = [
    { id: "sensor_1", label: "Sensor 1" },
    { id: "sensor_2", label: "Sensor 2" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sensors.map((sensor) => {
        const reading = readings?.find((r) => r.sensor_id === sensor.id);
        const temp = reading?.temp_c ?? null;
        const time = reading?.created_at;

        return (
          <div
            key={sensor.id}
            className={`rounded-2xl p-8 border transition-colors ${getTempBg(temp)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                {sensor.label}
              </h3>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  temp === null
                    ? "bg-gray-700 text-gray-300"
                    : temp <= 5
                      ? "bg-emerald-900/50 text-emerald-400"
                      : temp <= 8
                        ? "bg-amber-900/50 text-amber-400"
                        : "bg-red-900/50 text-red-400"
                }`}
              >
                {getStatusLabel(temp)}
              </span>
            </div>
            <div className={`text-6xl font-bold tabular-nums ${getTempColor(temp)}`}>
              {temp !== null ? `${temp.toFixed(1)}°` : "—"}
            </div>
            <div className="text-gray-500 text-sm mt-2">
              {time ? `Last updated: ${new Date(time + "Z").toLocaleTimeString()}` : "Waiting for data..."}
            </div>
          </div>
        );
      })}
    </div>
  );
}
