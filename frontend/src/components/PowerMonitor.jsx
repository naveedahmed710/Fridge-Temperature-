const PHASES = ["phase_a", "phase_b", "phase_c"];

function formatPhaseLabel(phaseId) {
  return phaseId.replace("phase_", "Phase ").toUpperCase();
}

export default function PowerMonitor({
  latest,
  stats,
  latestLoading,
  statsLoading,
  hours = 24,
  isDark = true,
}) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs font-semibold uppercase tracking-widest mb-4`}>
          3-Phase Live Readings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PHASES.map((phaseId) => {
            const reading = latest?.find((row) => row.phase_id === phaseId);
            return (
              <div
                key={phaseId}
                className={`${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} border rounded-2xl p-6`}
              >
                <h3 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-medium uppercase tracking-wider mb-4`}>
                  {formatPhaseLabel(phaseId)}
                </h3>
                {latestLoading ? (
                  <p className={`${isDark ? "text-gray-500" : "text-gray-600"} text-sm`}>Loading...</p>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-500">
                      {reading ? `${reading.voltage_v.toFixed(1)} V` : "—"}
                    </p>
                    <p className="text-2xl font-bold text-emerald-500 mt-2">
                      {reading ? `${reading.current_a.toFixed(2)} A` : "—"}
                    </p>
                    <p className={`${isDark ? "text-gray-500" : "text-gray-600"} text-xs mt-3`}>
                      {reading
                        ? `Updated: ${new Date(reading.created_at + "Z").toLocaleTimeString()}`
                        : "Waiting for data..."}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-xs font-semibold uppercase tracking-widest mb-4`}>
          3-Phase Statistics (Last {hours}h)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PHASES.map((phaseId) => {
            const row = stats?.find((entry) => entry.phase_id === phaseId);
            return (
              <div
                key={phaseId}
                className={`${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} border rounded-2xl p-6`}
              >
                <h3 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-medium uppercase tracking-wider mb-4`}>
                  {formatPhaseLabel(phaseId)}
                </h3>
                {statsLoading ? (
                  <p className={`${isDark ? "text-gray-500" : "text-gray-600"} text-sm`}>Loading...</p>
                ) : row ? (
                  <div className="space-y-1 text-sm">
                    <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Voltage: {row.min_voltage?.toFixed(1)} - {row.max_voltage?.toFixed(1)} V
                    </p>
                    <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Avg Voltage: {row.avg_voltage?.toFixed(1)} V
                    </p>
                    <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Current: {row.min_current?.toFixed(2)} - {row.max_current?.toFixed(2)} A
                    </p>
                    <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      Avg Current: {row.avg_current?.toFixed(2)} A
                    </p>
                    <p className={`${isDark ? "text-gray-500" : "text-gray-600"} text-xs mt-2`}>
                      {row.reading_count} readings
                    </p>
                  </div>
                ) : (
                  <p className={`${isDark ? "text-gray-500" : "text-gray-600"} text-sm`}>No data available</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
