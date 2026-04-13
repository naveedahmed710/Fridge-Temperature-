import { useEffect, useState } from "react";

function getTempColor(temp) {
  if (temp === null || temp === undefined) return "text-gray-400";
  if (temp <= 5) return "text-emerald-500";
  if (temp <= 8) return "text-amber-500";
  return "text-red-500";
}

function getTempBg(temp, isDark) {
  if (temp === null || temp === undefined) {
    return isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200";
  }
  if (temp <= 5) return "bg-emerald-950/30 border-emerald-800/50";
  if (temp <= 8) return "bg-amber-950/30 border-amber-800/50";
  return "bg-red-950/30 border-red-800/50";
}

function getStatusLabel(temp) {
  if (temp === null || temp === undefined) return "No Data";
  if (temp <= 5) return "Normal";
  if (temp <= 8) return "Warning";
  return "Critical";
}

export default function CurrentTemp({
  readings,
  loading,
  sensorNames = {},
  onSaveName,
  isDark = true,
}) {
  const [editing, setEditing] = useState({});
  const [draftNames, setDraftNames] = useState({
    sensor_1: sensorNames.sensor_1 || "Room",
    sensor_2: sensorNames.sensor_2 || "Refrigerator",
  });

  useEffect(() => {
    setDraftNames({
      sensor_1: sensorNames.sensor_1 || "Room",
      sensor_2: sensorNames.sensor_2 || "Refrigerator",
    });
  }, [sensorNames.sensor_1, sensorNames.sensor_2]);

  async function handleSave(sensorId) {
    if (!onSaveName) return;
    await onSaveName(sensorId, draftNames[sensorId] || "");
    setEditing((prev) => ({ ...prev, [sensorId]: false }));
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className={`${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} border rounded-2xl p-8 animate-pulse`}
          >
            <div className={`${isDark ? "bg-gray-700" : "bg-gray-200"} h-6 rounded w-24 mb-4`} />
            <div className={`${isDark ? "bg-gray-700" : "bg-gray-200"} h-16 rounded w-32`} />
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
        const reading = readings?.find((r) => r.sensor_id === sensor.id);
        const temp = reading?.temp_c ?? null;
        const time = reading?.created_at;

        return (
          <div
            key={sensor.id}
            className={`rounded-2xl p-8 border transition-colors ${getTempBg(temp, isDark)}`}
          >
            <div className="flex items-start justify-between mb-2 gap-3">
              {editing[sensor.id] ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    value={draftNames[sensor.id] || ""}
                    onChange={(e) =>
                      setDraftNames((prev) => ({ ...prev, [sensor.id]: e.target.value }))
                    }
                    className={`${isDark ? "bg-gray-900 border-gray-700 text-gray-100" : "bg-gray-50 border-gray-300 text-gray-900"} border rounded-md px-2 py-1 text-sm flex-1`}
                  />
                  <button
                    onClick={() => handleSave(sensor.id)}
                    className={`${isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : "bg-gray-900 hover:bg-gray-700 text-white"} text-xs px-2 py-1 rounded-md`}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setDraftNames((prev) => ({ ...prev, [sensor.id]: sensor.label }));
                      setEditing((prev) => ({ ...prev, [sensor.id]: false }));
                    }}
                    className={`${isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"} text-xs px-2 py-1 rounded-md`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-medium uppercase tracking-wider`}>
                    {sensor.label}
                  </h3>
                  <button
                    onClick={() => setEditing((prev) => ({ ...prev, [sensor.id]: true }))}
                    className={`${isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"} text-xs px-2 py-1 rounded-md`}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
            <div className="mb-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  temp === null
                    ? isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                    : temp <= 5
                      ? "bg-emerald-900/50 text-emerald-400"
                      : temp <= 8
                        ? "bg-amber-900/50 text-amber-400"
                        : "bg-red-900/50 text-red-400"
                }`}
              >
                {getStatusLabel(temp)}
              </span>
            </div>
            <div className={`text-6xl font-bold tabular-nums ${getTempColor(temp)}`}>
              {temp !== null ? `${temp.toFixed(1)}°` : "—"}
            </div>
            <div className={`${isDark ? "text-gray-500" : "text-gray-600"} text-sm mt-2`}>
              {time ? `Last updated: ${new Date(time + "Z").toLocaleTimeString()}` : "Waiting for data..."}
            </div>
          </div>
        );
      })}
    </div>
  );
}
