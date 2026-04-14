import { useState, useEffect, useCallback } from "react";

const API_BASE = "/api/readings";
const POLL_INTERVAL = 30000;

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useLatest(deviceId = "fridge-01") {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLatest = useCallback(async () => {
    try {
      const json = await fetchJson(`${API_BASE}/latest?device_id=${deviceId}`);
      setData(json.readings);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  return { data, error, loading, refetch: fetchLatest };
}

export function useReadings(deviceId = "fridge-01", hours = 24) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReadings = useCallback(async () => {
    try {
      const json = await fetchJson(
        `${API_BASE}?device_id=${deviceId}&hours=${hours}`
      );
      setData(json.readings);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId, hours]);

  useEffect(() => {
    fetchReadings();
    const interval = setInterval(fetchReadings, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchReadings]);

  return { data, error, loading, refetch: fetchReadings };
}

export function useStats(deviceId = "fridge-01", hours = 24) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const json = await fetchJson(
        `${API_BASE}/stats?device_id=${deviceId}&hours=${hours}`
      );
      setData(json.stats);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId, hours]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { data, error, loading, refetch: fetchStats };
}

export function useSensorNames(deviceId = "fridge-01") {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNames = useCallback(async () => {
    try {
      const json = await fetchJson(`${API_BASE}/sensor-names?device_id=${deviceId}`);
      const map = {};
      for (const row of json.names || []) {
        map[row.sensor_id] = row.display_name;
      }
      setData(map);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const saveName = useCallback(
    async (sensorId, displayName) => {
      const cleanName = displayName.trim();
      if (!cleanName) throw new Error("Name cannot be empty");

      await fetchJson(`${API_BASE}/sensor-names`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          sensor_id: sensorId,
          display_name: cleanName,
        }),
      });

      setData((prev) => ({
        ...prev,
        [sensorId]: cleanName,
      }));
    },
    [deviceId]
  );

  useEffect(() => {
    fetchNames();
  }, [fetchNames]);

  return { data, error, loading, refetch: fetchNames, saveName };
}

export function useDeviceNames() {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNames = useCallback(async () => {
    try {
      const json = await fetchJson(`${API_BASE}/device-names`);
      const map = {};
      for (const row of json.names || []) {
        map[row.device_id] = row.display_name;
      }
      setData(map);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveName = useCallback(async (deviceId, displayName) => {
    const cleanName = displayName.trim();
    if (!cleanName) throw new Error("Name cannot be empty");

    await fetchJson(`${API_BASE}/device-names`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId, display_name: cleanName }),
    });

    setData((prev) => ({ ...prev, [deviceId]: cleanName }));
  }, []);

  useEffect(() => {
    fetchNames();
  }, [fetchNames]);

  return { data, error, loading, refetch: fetchNames, saveName };
}

export function useDeviceStatus(deviceIds = []) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const ids = deviceIds.join(",");

  const fetchStatus = useCallback(async () => {
    if (!ids) return;
    try {
      const json = await fetchJson(`${API_BASE}/device-status?device_ids=${ids}`);
      setData(json.statuses || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ids]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { data, error, loading, refetch: fetchStatus };
}

export function usePowerLatest(deviceId = "power-01") {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLatest = useCallback(async () => {
    try {
      const json = await fetchJson(`${API_BASE}/power/latest?device_id=${deviceId}`);
      setData(json.readings || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  return { data, error, loading, refetch: fetchLatest };
}

export function usePowerStats(deviceId = "power-01", hours = 24) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const json = await fetchJson(
        `${API_BASE}/power/stats?device_id=${deviceId}&hours=${hours}`
      );
      setData(json.stats || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId, hours]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { data, error, loading, refetch: fetchStats };
}
