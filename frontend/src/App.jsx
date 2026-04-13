import { useEffect, useState } from "react";
import CurrentTemp from "./components/CurrentTemp";
import TempChart from "./components/TempChart";
import StatsCard from "./components/StatsCard";
import AlertBanner from "./components/AlertBanner";
import PowerMonitor from "./components/PowerMonitor";
import {
  useLatest,
  useReadings,
  useStats,
  useSensorNames,
  usePowerLatest,
  usePowerStats,
} from "./hooks/useReadings";

export default function App() {
  const STATS_FILTERS = [
    { value: 1, label: "1h" },
    { value: 6, label: "6h" },
    { value: 24, label: "24h" },
    { value: 72, label: "3d" },
    { value: 168, label: "7d" },
  ];
  const [tempDeviceId] = useState("fridge-01");
  const [powerDeviceId] = useState("power-01");
  const [statsHours, setStatsHours] = useState(24);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme-mode");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("theme-mode", isDark ? "dark" : "light");
  }, [isDark]);

  const latest = useLatest(tempDeviceId);
  const readings = useReadings(tempDeviceId, 24);
  const stats = useStats(tempDeviceId, statsHours);
  const sensorNames = useSensorNames(tempDeviceId);
  const powerLatest = usePowerLatest(powerDeviceId);
  const powerStats = usePowerStats(powerDeviceId, statsHours);

  const anyError =
    latest.error ||
    readings.error ||
    stats.error ||
    sensorNames.error ||
    powerLatest.error ||
    powerStats.error;
  const pageClass = isDark
    ? "min-h-screen bg-gray-950 text-gray-100"
    : "min-h-screen bg-gray-100 text-gray-900";
  const borderClass = isDark ? "border-gray-800" : "border-gray-200";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-600";
  const subtleHeadingClass = isDark ? "text-gray-400" : "text-gray-600";
  const refreshButtonClass = isDark
    ? "bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300"
    : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700";

  return (
    <div className={pageClass}>
      <header className={`border-b ${borderClass}`}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Sweet Home Automation
            </h1>
            <p className={`${mutedTextClass} text-sm mt-0.5`}>
              Temperature device: {tempDeviceId} | Power device: {powerDeviceId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                latest.refetch();
                readings.refetch();
                stats.refetch();
                sensorNames.refetch();
                powerLatest.refetch();
                powerStats.refetch();
              }}
              className={`${refreshButtonClass} border text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer`}
            >
              Refresh
            </button>
            <button
              onClick={() => setIsDark((prev) => !prev)}
              className={`${refreshButtonClass} border text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer`}
            >
              {isDark ? "Light mode" : "Dark mode"}
            </button>
            <div className={`flex items-center gap-2 text-sm ${mutedTextClass}`}>
              <span
                className={`w-2 h-2 rounded-full ${anyError ? "bg-red-500" : "bg-emerald-500"}`}
              />
              {anyError ? "Connection error" : "Live"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {anyError && (
          <div className="bg-red-950/30 border border-red-800/50 rounded-xl px-5 py-4 text-red-300 text-sm">
            Could not reach the server: {anyError}. Make sure the backend is
            running on port 4004.
          </div>
        )}

        <AlertBanner readings={latest.data} sensorNames={sensorNames.data} />

        <section>
          <h2 className={`${subtleHeadingClass} text-xs font-semibold uppercase tracking-widest mb-4`}>
            Current Temperature
          </h2>
          <CurrentTemp
            readings={latest.data}
            loading={latest.loading}
            sensorNames={sensorNames.data}
            onSaveName={sensorNames.saveName}
            isDark={isDark}
          />
        </section>

        <section>
          <TempChart
            readings={readings.data}
            loading={readings.loading}
            sensorNames={sensorNames.data}
            isDark={isDark}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`${subtleHeadingClass} text-xs font-semibold uppercase tracking-widest`}>
              Statistics
            </h2>
            <select
              value={statsHours}
              onChange={(e) => setStatsHours(Number(e.target.value))}
              className={`${isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-700"} border rounded-lg px-3 py-1.5 text-sm`}
            >
              {STATS_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  Last {item.label}
                </option>
              ))}
            </select>
          </div>
          <StatsCard
            stats={stats.data}
            loading={stats.loading}
            sensorNames={sensorNames.data}
            hours={statsHours}
            isDark={isDark}
          />
        </section>

        <PowerMonitor
          latest={powerLatest.data}
          stats={powerStats.data}
          latestLoading={powerLatest.loading}
          statsLoading={powerStats.loading}
          hours={statsHours}
          isDark={isDark}
        />
      </main>

      <footer className={`border-t ${borderClass} mt-12`}>
        <div className={`max-w-6xl mx-auto px-6 py-4 text-center ${mutedTextClass} text-xs`}>
          Sweet Home Automation - Dual ESP32-S3 Temperature + 3-Phase Electrical Monitoring
        </div>
      </footer>
    </div>
  );
}
