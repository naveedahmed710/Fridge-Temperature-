export default function StatsCard({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 animate-pulse">
            <div className="h-5 bg-gray-700 rounded w-24 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-700 rounded w-full" />
            </div>
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
        const stat = stats?.find((s) => s.sensor_id === sensor.id);

        return (
          <div
            key={sensor.id}
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6"
          >
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
              {sensor.label} — 24h Stats
            </h3>
            {stat ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-blue-400 text-2xl font-bold tabular-nums">
                    {stat.min_temp?.toFixed(1)}°
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Min</div>
                </div>
                <div>
                  <div className="text-amber-400 text-2xl font-bold tabular-nums">
                    {stat.avg_temp?.toFixed(1)}°
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Avg</div>
                </div>
                <div>
                  <div className="text-red-400 text-2xl font-bold tabular-nums">
                    {stat.max_temp?.toFixed(1)}°
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Max</div>
                </div>
                <div className="col-span-3 mt-2 text-gray-500 text-xs">
                  {stat.reading_count} readings in the last 24 hours
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">No data available</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
