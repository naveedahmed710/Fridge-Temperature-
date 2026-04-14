const PHASES = [
  { id: "phase_a", label: "Phase A", color: "blue" },
  { id: "phase_b", label: "Phase B", color: "emerald" },
  { id: "phase_c", label: "Phase C", color: "amber" },
];

const ACCENT = {
  blue: {
    voltage: "gradient-text-blue",
    current: "text-blue-400",
    badge: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20",
  },
  emerald: {
    voltage: "gradient-text-emerald",
    current: "text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/20",
  },
  amber: {
    voltage: "gradient-text-amber",
    current: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20",
  },
};

export default function PowerMonitor({
  latest,
  stats,
  latestLoading,
  statsLoading,
  hours = 24,
  isDark = true,
}) {
  const glass = isDark ? "glass-dark" : "glass-light";
  const cardHover = `card-hover ${isDark ? "card-hover-dark" : "card-hover-light"}`;
  const heading = isDark ? "text-gray-300" : "text-gray-700";

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`${heading} text-xs font-semibold uppercase tracking-widest mb-5`}>
          3-Phase Live Readings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PHASES.map((phase, idx) => {
            const reading = latest?.find((row) => row.phase_id === phase.id);
            const accent = ACCENT[phase.color];

            return (
              <div
                key={phase.id}
                className={`${glass} ${cardHover} rounded-2xl p-6 animate-fade-in-up stagger-${idx + 1}`}
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className={`${accent.badge} text-xs font-semibold px-3 py-1 rounded-full`}>
                    {phase.label}
                  </span>
                </div>

                {latestLoading ? (
                  <div className="space-y-3 shimmer-bg rounded-lg p-4">
                    <div className={`${isDark ? "bg-gray-700/50" : "bg-gray-200/50"} h-8 rounded-lg w-24`} />
                    <div className={`${isDark ? "bg-gray-700/50" : "bg-gray-200/50"} h-8 rounded-lg w-20`} />
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs font-medium mb-1`}>Voltage</p>
                        <p className={`${accent.voltage} text-3xl font-extrabold tabular-nums animate-count-up`}>
                          {reading ? `${reading.voltage_v.toFixed(1)}` : "—"}
                          <span className={`${isDark ? "text-gray-500" : "text-gray-400"} text-lg ml-1`}>V</span>
                        </p>
                      </div>
                      <div>
                        <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs font-medium mb-1`}>Current</p>
                        <p className={`${accent.current} text-3xl font-extrabold tabular-nums animate-count-up stagger-1`}>
                          {reading ? `${reading.current_a.toFixed(2)}` : "—"}
                          <span className={`${isDark ? "text-gray-500" : "text-gray-400"} text-lg ml-1`}>A</span>
                        </p>
                      </div>
                    </div>
                    <p className={`${isDark ? "text-gray-600" : "text-gray-400"} text-xs mt-4`}>
                      {reading
                        ? `Updated ${new Date(reading.created_at + "Z").toLocaleTimeString()}`
                        : "Waiting for data..."}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className={`${heading} text-xs font-semibold uppercase tracking-widest mb-5`}>
          3-Phase Statistics — Last {hours}h
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PHASES.map((phase, idx) => {
            const row = stats?.find((entry) => entry.phase_id === phase.id);
            const accent = ACCENT[phase.color];

            return (
              <div
                key={phase.id}
                className={`${glass} ${cardHover} rounded-2xl p-6 animate-fade-in-up stagger-${idx + 4}`}
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className={`${accent.badge} text-xs font-semibold px-3 py-1 rounded-full`}>
                    {phase.label}
                  </span>
                </div>

                {statsLoading ? (
                  <div className="space-y-2 shimmer-bg rounded-lg p-4">
                    <div className={`${isDark ? "bg-gray-700/50" : "bg-gray-200/50"} h-4 rounded w-full`} />
                    <div className={`${isDark ? "bg-gray-700/50" : "bg-gray-200/50"} h-4 rounded w-3/4`} />
                  </div>
                ) : row ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="animate-count-up stagger-1">
                        <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}>Min V</p>
                        <p className={`${isDark ? "text-gray-200" : "text-gray-800"} text-sm font-bold tabular-nums`}>
                          {row.min_voltage?.toFixed(1)}
                        </p>
                      </div>
                      <div className="animate-count-up stagger-2">
                        <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}>Avg V</p>
                        <p className={`${accent.voltage} text-sm font-bold tabular-nums`}>
                          {row.avg_voltage?.toFixed(1)}
                        </p>
                      </div>
                      <div className="animate-count-up stagger-3">
                        <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}>Max V</p>
                        <p className={`${isDark ? "text-gray-200" : "text-gray-800"} text-sm font-bold tabular-nums`}>
                          {row.max_voltage?.toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <div className={`${isDark ? "border-gray-700/50" : "border-gray-200"} border-t pt-3`}>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="animate-count-up stagger-4">
                          <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}>Min A</p>
                          <p className={`${isDark ? "text-gray-200" : "text-gray-800"} text-sm font-bold tabular-nums`}>
                            {row.min_current?.toFixed(2)}
                          </p>
                        </div>
                        <div className="animate-count-up stagger-5">
                          <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}>Avg A</p>
                          <p className={`${accent.current} text-sm font-bold tabular-nums`}>
                            {row.avg_current?.toFixed(2)}
                          </p>
                        </div>
                        <div className="animate-count-up stagger-6">
                          <p className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs`}>Max A</p>
                          <p className={`${isDark ? "text-gray-200" : "text-gray-800"} text-sm font-bold tabular-nums`}>
                            {row.max_current?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className={`${isDark ? "text-gray-600" : "text-gray-400"} text-xs mt-1`}>
                      {row.reading_count} readings
                    </p>
                  </div>
                ) : (
                  <p className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm`}>No data available</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
