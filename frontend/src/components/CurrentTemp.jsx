import { useEffect, useState } from "react";

function getTempGradient(temp) {
  if (temp === null || temp === undefined) return "gradient-text-blue";
  if (temp <= 5) return "gradient-text-emerald";
  if (temp <= 8) return "gradient-text-amber";
  return "gradient-text-red";
}

function getStatusLabel(temp) {
  if (temp === null || temp === undefined) return { text: "No Data", cls: "bg-gray-500/20 text-gray-400" };
  if (temp <= 5) return { text: "Normal", cls: "bg-emerald-500/20 text-emerald-400" };
  if (temp <= 8) return { text: "Warning", cls: "bg-amber-500/20 text-amber-400" };
  return { text: "Critical", cls: "bg-red-500/20 text-red-400" };
}

function getGlowClass(temp) {
  if (temp === null || temp === undefined) return "";
  if (temp <= 5) return "animate-pulse-glow";
  return "";
}

export default function CurrentTemp({
  readings,
  loading,
  sensorNames = {},
  onSaveName,
  isDark = true,
}) {
  const [editing, setEditing] = useState({});
  const [saveError, setSaveError] = useState(null);
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
    setSaveError(null);
    try {
      await onSaveName(sensorId, draftNames[sensorId] || "");
      setEditing((prev) => ({ ...prev, [sensorId]: false }));
    } catch (err) {
      setSaveError(`Failed to save ${sensorId}: ${err.message}`);
    }
  }

  const glass = isDark ? "glass-dark" : "glass-light";
  const cardHover = `card-hover ${isDark ? "card-hover-dark" : "card-hover-light"}`;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className={`${glass} rounded-2xl p-8 shimmer-bg`}
          >
            <div className={`${isDark ? "bg-gray-700/50" : "bg-gray-200/50"} h-6 rounded-lg w-28 mb-6`} />
            <div className={`${isDark ? "bg-gray-700/50" : "bg-gray-200/50"} h-16 rounded-lg w-36`} />
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
    <div className="space-y-4">
      {saveError && (
        <div className={`${glass} rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in border border-red-500/20`}>
          {saveError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sensors.map((sensor, idx) => {
          const reading = readings?.find((r) => r.sensor_id === sensor.id);
          const temp = reading?.temp_c ?? null;
          const time = reading?.created_at;
          const status = getStatusLabel(temp);

          return (
            <div
              key={sensor.id}
              className={`${glass} ${cardHover} ${getGlowClass(temp)} rounded-2xl p-8 animate-fade-in-up stagger-${idx + 1}`}
            >
              <div className="flex items-start justify-between mb-4 gap-3">
                {editing[sensor.id] ? (
                  <div className="flex-1 flex items-center gap-2 animate-fade-in">
                    <input
                      value={draftNames[sensor.id] || ""}
                      onChange={(e) =>
                        setDraftNames((prev) => ({ ...prev, [sensor.id]: e.target.value }))
                      }
                      className={`${isDark ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} border rounded-lg px-3 py-1.5 text-sm flex-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSave(sensor.id)}
                    />
                    <button
                      onClick={() => handleSave(sensor.id)}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDraftNames((prev) => ({ ...prev, [sensor.id]: sensor.label }));
                        setEditing((prev) => ({ ...prev, [sensor.id]: false }));
                      }}
                      className={`${isDark ? "bg-gray-800/50 hover:bg-gray-700/50 text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-600"} text-xs px-3 py-1.5 rounded-lg transition-colors`}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm font-semibold uppercase tracking-wider`}>
                      {sensor.label}
                    </h3>
                    <button
                      onClick={() => setEditing((prev) => ({ ...prev, [sensor.id]: true }))}
                      className={`${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"} text-xs px-2.5 py-1 rounded-lg transition-colors hover:bg-gray-500/10`}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>

              <span className={`${status.cls} text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4`}>
                {status.text}
              </span>

              <div className={`text-6xl font-extrabold tabular-nums ${getTempGradient(temp)} animate-count-up`}>
                {temp !== null ? `${temp.toFixed(1)}°` : "—"}
              </div>

              <div className={`${isDark ? "text-gray-500" : "text-gray-500"} text-sm mt-3`}>
                {time
                  ? `Updated ${new Date(time + "Z").toLocaleTimeString()}`
                  : "Waiting for data..."}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
