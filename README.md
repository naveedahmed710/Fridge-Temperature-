# Fridge Temperature Monitor

Real-time fridge temperature monitoring using an ESP32-S3 with two DS18B20 sensors, a Node.js REST API backend, and a React dashboard.

## Architecture

```
[DS18B20 x2] → [ESP32-S3] → HTTP POST → [Node.js API + SQLite] ← HTTP GET ← [React Dashboard]
```

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Firmware | PlatformIO, Arduino, OneWire, DallasTemperature |
| Backend  | Node.js, Express 5, sql.js (SQLite)     |
| Frontend | React 19, Vite 8, Tailwind CSS 4, Chart.js |

## Wiring

Both DS18B20 sensors share a single data pin using the OneWire protocol.

```
ESP32 GPIO4 ──┬── DS18B20 #1 (DATA)
              ├── DS18B20 #2 (DATA)
              └── 4.7kΩ pull-up to 3.3V

3.3V ── VDD (both sensors)
GND  ── GND (both sensors)
```

## Setup

### 1. Firmware

1. Install [PlatformIO CLI](https://platformio.org/install/cli) or the VS Code extension
2. Edit `firmware/include/config.h` — set your WiFi SSID, password, and server IP
3. Flash:

```bash
cd firmware
pio run --target upload
pio device monitor
```

### 2. Backend

```bash
cd backend
npm install
npm start
```

The API runs on `http://localhost:3000`. Endpoints:

| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| POST   | `/api/readings`         | ESP32 sends sensor data  |
| GET    | `/api/readings`         | Fetch readings (query: `device_id`, `hours`) |
| GET    | `/api/readings/latest`  | Latest reading per sensor |
| GET    | `/api/readings/stats`   | Min/Max/Avg stats        |
| GET    | `/api/health`           | Server health check      |

### 3. Frontend

**Development:**

```bash
cd frontend
npm install
node node_modules/vite/bin/vite.js
```

The dev server runs on `http://localhost:5173` and proxies API requests to the backend.

**Production build:**

```bash
cd frontend
node node_modules/vite/bin/vite.js build
```

This outputs to `backend/public/`. The Express server serves it automatically — just run the backend and open `http://localhost:3000`.

## Project Structure

```
├── firmware/
│   ├── platformio.ini
│   ├── include/config.h        # WiFi & server config
│   └── src/main.cpp            # Sensor reading & HTTP POST
├── backend/
│   ├── server.js               # Express app entry
│   ├── db.js                   # SQLite setup & queries
│   └── routes/readings.js      # API route handlers
├── frontend/
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx             # Main dashboard layout
│       ├── components/
│       │   ├── CurrentTemp.jsx # Live temperature display
│       │   ├── TempChart.jsx   # 24h line chart
│       │   ├── StatsCard.jsx   # Min/Max/Avg cards
│       │   └── AlertBanner.jsx # Threshold warnings
│       └── hooks/
│           └── useReadings.js  # Data fetching & polling
└── README.md
```

## API Payload Format

The ESP32 sends this JSON to `POST /api/readings`:

```json
{
  "device_id": "fridge-01",
  "sensors": [
    { "id": "sensor_1", "temp_c": 3.25 },
    { "id": "sensor_2", "temp_c": -18.50 }
  ]
}
```

## Configuration

| Setting        | File                      | Default         |
|----------------|---------------------------|-----------------|
| WiFi SSID      | `firmware/include/config.h` | `YOUR_WIFI_SSID` |
| WiFi Password  | `firmware/include/config.h` | `YOUR_WIFI_PASSWORD` |
| Server URL     | `firmware/include/config.h` | `http://YOUR_SERVER_IP:3000/api/readings` |
| Read interval  | `firmware/include/config.h` | 30 seconds      |
| API port       | `backend/server.js` (env)  | 3000            |
| Data retention | `backend/server.js`        | 90 days         |
| Alert threshold| `frontend/src/components/AlertBanner.jsx` | 8°C |
