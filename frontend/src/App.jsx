import { useEffect, useState, useMemo } from "react";
import CurrentTemp from "./components/CurrentTemp";
import TempChart from "./components/TempChart";
import StatsCard from "./components/StatsCard";
import PowerMonitor from "./components/PowerMonitor";
import DeviceStatusFooter from "./components/DeviceStatusFooter";
import {
  useLatest,
  useReadings,
  useStats,
  useSensorNames,
  usePowerLatest,
  usePowerStats,
  useDeviceNames,
  useDeviceStatus,
} from "./hooks/useReadings";

const STATS_FILTERS = [
  { value: 1, label: "1h" },
  { value: 6, label: "6h" },
  { value: 24, label: "24h" },
  { value: 72, label: "3d" },
  { value: 168, label: "7d" },
];

export default function App() {
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
  const deviceNames = useDeviceNames();

  const deviceIdsList = useMemo(() => [tempDeviceId, powerDeviceId], [tempDeviceId, powerDeviceId]);
  const deviceStatus = useDeviceStatus(deviceIdsList);

  const anyError =
    latest.error ||
    readings.error ||
    stats.error ||
    sensorNames.error ||
    powerLatest.error ||
    powerStats.error;

  const glass = isDark ? "glass-dark" : "glass-light";
  const cardHover = `card-hover ${isDark ? "card-hover-dark" : "card-hover-light"}`;
  const muted = isDark ? "text-gray-500" : "text-gray-500";
  const heading = isDark ? "text-gray-300" : "text-gray-700";

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100"
          : "bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-900"
      }`}
    >
      <header
        className={`${glass} sticky top-0 z-50 animate-fade-in`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="animate-slide-in">
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="gradient-text-emerald">Sweet</span>{" "}
              <span className={isDark ? "text-white" : "text-gray-900"}>Home</span>{" "}
              <span className="gradient-text-blue">Automation</span>
            </h1>
            <p className={`${muted} text-xs mt-1 tracking-wide`}>
              Real-time monitoring dashboard
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
                deviceNames.refetch();
                deviceStatus.refetch();
              }}
              className={`${glass} ${cardHover} text-sm px-4 py-2 rounded-xl cursor-pointer ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Refresh
            </button>
            <button
              onClick={() => setIsDark((prev) => !prev)}
              className={`${glass} ${cardHover} text-sm px-4 py-2 rounded-xl cursor-pointer ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {isDark ? "Light" : "Dark"}
            </button>
            <div className={`flex items-center gap-2 text-xs ${muted}`}>
              <span
                className={`w-2 h-2 rounded-full ${anyError ? "bg-red-500" : "bg-emerald-500 animate-pulse-dot"}`}
              />
              {anyError ? "Offline" : "Live"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {anyError && (
          <div className={`${glass} rounded-2xl px-6 py-4 text-red-400 text-sm animate-fade-in-up border border-red-500/20`}>
            Could not reach the server. Make sure the backend is running on port 4004.
          </div>
        )}

        <section className="animate-fade-in-up stagger-1">
          <h2 className={`${heading} text-xs font-semibold uppercase tracking-widest mb-5`}>
            Temperature Sensors
          </h2>
          <CurrentTemp
            readings={latest.data}
            loading={latest.loading}
            sensorNames={sensorNames.data}
            onSaveName={sensorNames.saveName}
            isDark={isDark}
          />
        </section>

        <section className="animate-fade-in-up stagger-2">
          <TempChart
            readings={readings.data}
            loading={readings.loading}
            sensorNames={sensorNames.data}
            isDark={isDark}
          />
        </section>

        <section className="animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`${heading} text-xs font-semibold uppercase tracking-widest`}>
              Temperature Statistics
            </h2>
            <div className="flex gap-1.5">
              {STATS_FILTERS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStatsHours(item.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    statsHours === item.value
                      ? isDark
                        ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300"
                      : isDark
                        ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <StatsCard
            stats={stats.data}
            loading={stats.loading}
            sensorNames={sensorNames.data}
            hours={statsHours}
            isDark={isDark}
          />
        </section>

        <section className="animate-fade-in-up stagger-4">
          <PowerMonitor
            latest={powerLatest.data}
            stats={powerStats.data}
            latestLoading={powerLatest.loading}
            statsLoading={powerStats.loading}
            hours={statsHours}
            isDark={isDark}
          />
        </section>
      </main>

      <DeviceStatusFooter
        statuses={deviceStatus.data}
        deviceNames={deviceNames.data}
        onSaveDeviceName={deviceNames.saveName}
        isDark={isDark}
      />
    </div>
  );
}
