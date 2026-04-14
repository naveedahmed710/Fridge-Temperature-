import { useEffect, useState } from "react";

const STALE_THRESHOLD_MS = 2 * 60 * 1000;

const DEFAULT_LABELS = {
  "fridge-01": "ESP32 — Temperature",
  "power-01": "ESP32 — Power Monitor",
};

function getLabel(deviceId, deviceNames) {
  return deviceNames[deviceId] || DEFAULT_LABELS[deviceId] || deviceId;
}

function isOnline(lastSeen) {
  if (!lastSeen) return false;
  const diff = Date.now() - new Date(lastSeen + "Z").getTime();
  return diff < STALE_THRESHOLD_MS;
}

function timeAgo(lastSeen) {
  if (!lastSeen) return "Never connected";
  const diff = Date.now() - new Date(lastSeen + "Z").getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function DeviceStatusFooter({
  statuses = [],
  deviceNames = {},
  onSaveDeviceName,
  isDark = true,
}) {
  const glass = isDark ? "glass-dark" : "glass-light";
  const muted = isDark ? "text-gray-500" : "text-gray-500";

  const [editing, setEditing] = useState({});
  const [drafts, setDrafts] = useState({});
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const d = {};
    for (const s of statuses) {
      d[s.device_id] = getLabel(s.device_id, deviceNames);
    }
    setDrafts(d);
  }, [statuses, deviceNames]);

  async function handleSave(deviceId) {
    if (!onSaveDeviceName) return;
    setSaveMsg("");
    try {
      await onSaveDeviceName(deviceId, drafts[deviceId] || "");
      setEditing((prev) => ({ ...prev, [deviceId]: false }));
    } catch (err) {
      setSaveMsg(err.message || "Save failed");
    }
  }

  return (
    <footer className={`${glass} mt-16`}>
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            {statuses.map((device) => {
              const online = isOnline(device.last_seen);
              const displayName = getLabel(device.device_id, deviceNames);

              return (
                <div
                  key={device.device_id}
                  className="flex items-center gap-3 animate-fade-in"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      online
                        ? "bg-emerald-500 animate-pulse-dot"
                        : "bg-red-500"
                    }`}
                  />

                  {editing[device.device_id] ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={drafts[device.device_id] || ""}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [device.device_id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSave(device.device_id)
                        }
                        autoFocus
                        className={`${
                          isDark
                            ? "bg-gray-900/80 border-gray-600 text-gray-100"
                            : "bg-white border-gray-300 text-gray-900"
                        } border rounded-md px-2 py-0.5 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                      />
                      <button
                        onClick={() => handleSave(device.device_id)}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs px-2 py-0.5 rounded-md transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setDrafts((prev) => ({
                            ...prev,
                            [device.device_id]: displayName,
                          }));
                          setEditing((prev) => ({
                            ...prev,
                            [device.device_id]: false,
                          }));
                        }}
                        className={`${
                          isDark
                            ? "text-gray-500 hover:text-gray-300"
                            : "text-gray-400 hover:text-gray-700"
                        } text-xs px-2 py-0.5 rounded-md transition-colors`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div>
                        <span
                          className={`text-xs font-semibold ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {displayName}
                        </span>
                        <span className={`${muted} text-xs ml-2`}>
                          {online ? "Online" : "Offline"} · {timeAgo(device.last_seen)}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setEditing((prev) => ({
                            ...prev,
                            [device.device_id]: true,
                          }))
                        }
                        className={`${
                          isDark
                            ? "text-gray-600 hover:text-gray-400"
                            : "text-gray-400 hover:text-gray-600"
                        } text-xs transition-colors hover:bg-gray-500/10 px-1.5 py-0.5 rounded`}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className={`${muted} text-xs`}>
            Sweet Home Automation
          </p>
        </div>

        {saveMsg && (
          <p className="text-red-400 text-xs mt-2 animate-fade-in">{saveMsg}</p>
        )}
      </div>
    </footer>
  );
}
