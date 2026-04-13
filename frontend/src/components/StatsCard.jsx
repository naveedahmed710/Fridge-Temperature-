export default function StatsCard({
  stats,
  loading,
  sensorNames = {},
  hours = 24,
  isDark = true,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className={`${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} border rounded-2xl p-6 animate-pulse`}
          >
            <div className={`h-5 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded w-24 mb-4`} />
            <div className="space-y-3">
              <div className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded w-full`} />
              <div className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded w-full`} />
              <div className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded w-full`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const sensors = [
    { id: "sensor_1", label: sensorNames.sensor_1 || "Sensor 1" },
    { id: "sensor_2", label: sensorNames.sensor_2 || "Sensor 2" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sensors.map((sensor) => {
        const stat = stats?.find((s) => s.sensor_id === sensor.id);

        return (
          <div
            key={sensor.id}
            className={`${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} border rounded-2xl p-6`}
          >
            <h3 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-medium uppercase tracking-wider mb-4`}>
              {sensor.label} — Last {hours}h
            </h3>
            {stat ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-blue-400 text-2xl font-bold tabular-nums">
                    {stat.min_temp?.toFixed(1)}°
                  </div>
                  <div className={`${isDark ? "text-gray-500" : "text-gray-600"} text-xs mt-1`}>Min</div>
                </div>
                <div>
                  <div className="text-amber-400 text-2xl font-bold tabular-nums">
                    {stat.avg_temp?.toFixed(1)}°
                  </div>
                  <div className={`${isDark ? "text-gray-500" : "text-gray-600"} text-xs mt-1`}>Avg</div>
                </div>
                <div>
                  <div className="text-red-400 text-2xl font-bold tabular-nums">
                    {stat.max_temp?.toFixed(1)}°
                  </div>
                  <div className={`${isDark ? "text-gray-500" : "text-gray-600"} text-xs mt-1`}>Max</div>
                </div>
                <div className={`col-span-3 mt-2 ${isDark ? "text-gray-500" : "text-gray-600"} text-xs`}>
                  {stat.reading_count} readings in the selected period
                </div>
              </div>
            ) : (
              <div className={`${isDark ? "text-gray-500" : "text-gray-600"} text-sm`}>No data available</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
