import { useState } from "react";
import CurrentTemp from "./components/CurrentTemp";
import TempChart from "./components/TempChart";
import StatsCard from "./components/StatsCard";
import AlertBanner from "./components/AlertBanner";
import { useLatest, useReadings, useStats } from "./hooks/useReadings";

export default function App() {
  const [deviceId] = useState("fridge-01");
  const latest = useLatest(deviceId);
  const readings = useReadings(deviceId, 24);
  const stats = useStats(deviceId, 24);

  const anyError = latest.error || readings.error || stats.error;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Fridge Monitor
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Device: {deviceId}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                latest.refetch();
                readings.refetch();
                stats.refetch();
              }}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Refresh
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
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
            running on port 3000.
          </div>
        )}

        <AlertBanner readings={latest.data} />

        <section>
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
            Current Temperature
          </h2>
          <CurrentTemp readings={latest.data} loading={latest.loading} />
        </section>

        <section>
          <TempChart readings={readings.data} loading={readings.loading} />
        </section>

        <section>
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
            Statistics
          </h2>
          <StatsCard stats={stats.data} loading={stats.loading} />
        </section>
      </main>

      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center text-gray-600 text-xs">
          ESP32-S3 Fridge Temperature Monitor — Polling every 30s
        </div>
      </footer>
    </div>
  );
}
