export default function StatsCard({
  stats,
  loading,
  sensorNames = {},
  hours = 24,
  isDark = true,
}) {
  const glass = isDark ? "glass-dark" : "glass-light";
  const cardHover = `card-hover ${isDark ? "card-hover-dark" : "card-hover-light"}`;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className={`${glass} rounded-2xl p-6 shimmer-bg`}>
            <div className={`h-5 ${isDark ? "bg-gray-700/50" : "bg-gray-200/50"} rounded-lg w-28 mb-5`} />
            <div className="space-y-3">
              <div className={`h-4 ${isDark ? "bg-gray-700/50" : "bg-gray-200/50"} rounded-lg w-full`} />
              <div className={`h-4 ${isDark ? "bg-gray-700/50" : "bg-gray-200/50"} rounded-lg w-3/4`} />
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
      {sensors.map((sensor, idx) => {
        const stat = stats?.find((s) => s.sensor_id === sensor.id);

        return (
          <div
            key={sensor.id}
            className={`${glass} ${cardHover} rounded-2xl p-6 animate-fade-in-up stagger-${idx + 1}`}
          >
            <h3 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-semibold uppercase tracking-wider mb-5`}>
              {sensor.label} — Last {hours}h
            </h3>
            {stat ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="animate-count-up stagger-1">
                  <div className="gradient-text-blue text-2xl font-extrabold tabular-nums">
                    {stat.min_temp?.toFixed(1)}°
                  </div>
                  <div className={`${isDark ? "text-gray-500" : "text-gray-500"} text-xs mt-1.5 font-medium`}>Min</div>
                </div>
                <div className="animate-count-up stagger-2">
                  <div className="gradient-text-amber text-2xl font-extrabold tabular-nums">
                    {stat.avg_temp?.toFixed(1)}°
                  </div>
                  <div className={`${isDark ? "text-gray-500" : "text-gray-500"} text-xs mt-1.5 font-medium`}>Avg</div>
                </div>
                <div className="animate-count-up stagger-3">
                  <div className="gradient-text-red text-2xl font-extrabold tabular-nums">
                    {stat.max_temp?.toFixed(1)}°
                  </div>
                  <div className={`${isDark ? "text-gray-500" : "text-gray-500"} text-xs mt-1.5 font-medium`}>Max</div>
                </div>
                <div className={`col-span-3 mt-3 ${isDark ? "text-gray-600" : "text-gray-400"} text-xs`}>
                  {stat.reading_count} readings
                </div>
              </div>
            ) : (
              <div className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm`}>No data available</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
