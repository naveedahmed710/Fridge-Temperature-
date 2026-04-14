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
  const glass = isDark ? "glass-dark" : "glass-light";
  const cardHover = `card-hover ${isDark ? "card-hover-dark" : "card-hover-light"}`;

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
          backgroundColor: isDark
            ? "rgba(16, 185, 129, 0.08)"
            : "rgba(16, 185, 129, 0.12)",
          borderWidth: 2.5,
          pointRadius: 0,
          pointHitRadius: 10,
          tension: 0.4,
          fill: true,
        },
        {
          label: sensorNames.sensor_2 || "Sensor 2",
          data: sensor2,
          borderColor: "#3b82f6",
          backgroundColor: isDark
            ? "rgba(59, 130, 246, 0.08)"
            : "rgba(59, 130, 246, 0.12)",
          borderWidth: 2.5,
          pointRadius: 0,
          pointHitRadius: 10,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [readings, sensorNames.sensor_1, sensorNames.sensor_2, isDark]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDark ? "#9ca3af" : "#6b7280",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 24,
          font: { size: 12, weight: "500" },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(17, 24, 39, 0.9)" : "rgba(255, 255, 255, 0.95)",
        titleColor: isDark ? "#f3f4f6" : "#111827",
        bodyColor: isDark ? "#d1d5db" : "#374151",
        borderColor: isDark ? "rgba(75, 85, 99, 0.3)" : "rgba(209, 213, 219, 0.6)",
        borderWidth: 1,
        padding: 14,
        cornerRadius: 12,
        displayColors: true,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}°C`,
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "PPpp",
          displayFormats: { minute: "HH:mm", hour: "HH:mm" },
        },
        grid: { color: isDark ? "rgba(75, 85, 99, 0.15)" : "rgba(209, 213, 219, 0.4)" },
        ticks: { color: isDark ? "#6b7280" : "#9ca3af", maxTicksLimit: 10, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        title: {
          display: true,
          text: "Temperature (°C)",
          color: isDark ? "#6b7280" : "#9ca3af",
          font: { size: 11 },
        },
        grid: { color: isDark ? "rgba(75, 85, 99, 0.15)" : "rgba(209, 213, 219, 0.4)" },
        ticks: {
          color: isDark ? "#6b7280" : "#9ca3af",
          callback: (val) => `${val}°`,
          font: { size: 11 },
        },
        border: { display: false },
      },
    },
  };

  if (loading) {
    return (
      <div className={`${glass} rounded-2xl p-6 h-96 flex items-center justify-center shimmer-bg`}>
        <div className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm`}>Loading chart...</div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className={`${glass} rounded-2xl p-6 h-96 flex items-center justify-center`}>
        <div className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm`}>
          No readings yet. Data will appear once the ESP32 starts sending.
        </div>
      </div>
    );
  }

  return (
    <div className={`${glass} ${cardHover} rounded-2xl p-6`}>
      <h3 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-semibold uppercase tracking-wider mb-5`}>
        Temperature — Last 24 Hours
      </h3>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
