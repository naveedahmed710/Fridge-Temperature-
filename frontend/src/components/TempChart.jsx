import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

export default function TempChart({
  readings,
  loading,
  sensorNames = {},
  isDark = true,
}) {
  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return null;

    const sensor1 = readings
      .filter((r) => r.sensor_id === "sensor_1")
      .map((r) => ({ x: new Date(r.created_at + "Z"), y: r.temp_c }));

    const sensor2 = readings
      .filter((r) => r.sensor_id === "sensor_2")
      .map((r) => ({ x: new Date(r.created_at + "Z"), y: r.temp_c }));

    return {
      datasets: [
        {
          label: sensorNames.sensor_1 || "Sensor 1",
          data: sensor1,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 10,
          tension: 0.3,
          fill: true,
        },
        {
          label: sensorNames.sensor_2 || "Sensor 2",
          data: sensor2,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 10,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [readings, sensorNames.sensor_1, sensorNames.sensor_2]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDark ? "#9ca3af" : "#4b5563",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        titleColor: isDark ? "#f3f4f6" : "#111827",
        bodyColor: isDark ? "#d1d5db" : "#374151",
        borderColor: isDark ? "#374151" : "#d1d5db",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}°C`,
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "PPpp",
          displayFormats: {
            minute: "HH:mm",
            hour: "HH:mm",
          },
        },
        grid: { color: isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.6)" },
        ticks: { color: isDark ? "#9ca3af" : "#4b5563", maxTicksLimit: 12 },
      },
      y: {
        title: {
          display: true,
          text: "Temperature (°C)",
          color: isDark ? "#9ca3af" : "#4b5563",
        },
        grid: { color: isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.6)" },
        ticks: {
          color: isDark ? "#9ca3af" : "#4b5563",
          callback: (val) => `${val}°`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className={`${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} border rounded-2xl p-6 h-96 flex items-center justify-center`}>
        <div className={`${isDark ? "text-gray-500" : "text-gray-600"}`}>Loading chart...</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className={`${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} border rounded-2xl p-6 h-96 flex items-center justify-center`}>
        <div className={`${isDark ? "text-gray-500" : "text-gray-600"}`}>
          No readings yet. Data will appear once the ESP32 starts sending.
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} border rounded-2xl p-6`}>
      <h3 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-medium uppercase tracking-wider mb-4`}>
        Temperature — Last 24 Hours
      </h3>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
