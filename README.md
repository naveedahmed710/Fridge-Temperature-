# Sweet Home Automation

Real-time temperature and 3-phase electrical monitoring using two ESP32-S3 devices, a Node.js REST API backend, and a React dashboard.

## Architecture

```
[DS18B20 x2] -> [ESP32-S3 #1] -> POST /api/readings
[ZMPT101B x3 + ACS712 x3] -> [ESP32-S3 #2] -> POST /api/readings/power
                                           -> [Node.js API + SQLite] <- [React Dashboard]
```

## Tech Stack

| Layer | Technology |
|---|---|
| Firmware (Temp) | PlatformIO, Arduino, OneWire, DallasTemperature |
| Firmware (Power) | PlatformIO, Arduino, ZMPT101B, ACS712 |
| Backend | Node.js, Express 5, sql.js (SQLite) |
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

The API runs on `http://localhost:4004`. Endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/readings` | Temperature ESP32 sends DS18B20 data |
| GET | `/api/readings` | Temperature history (`device_id`, `hours`) |
| GET | `/api/readings/latest` | Latest temperature per sensor |
| GET | `/api/readings/stats` | Temperature min/max/avg |
| GET | `/api/readings/sensor-names` | Get editable sensor display names |
| PUT | `/api/readings/sensor-names` | Update a sensor display name |
| POST | `/api/readings/power` | Power ESP32 sends 3-phase voltage/current |
| GET | `/api/readings/power/latest` | Latest power values per phase |
| GET | `/api/readings/power` | Power history (`device_id`, `hours`) |
| GET | `/api/readings/power/stats` | 3-phase power min/max/avg |
| GET | `/api/health` | Server health check |

### 2b. Firmware (Power ESP32-S3)

```bash
cd firmware-power
pio run --target upload
pio device monitor
```

Edit `firmware-power/include/config.h` with WiFi, backend URL, and calibrated scale factors.

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

This outputs to `backend/public/`. The Express server serves it automatically - run the backend and open `http://localhost:4004`.

## Project Structure

```
├── firmware/
│   ├── platformio.ini
│   ├── include/config.h        # WiFi & server config
│   └── src/main.cpp            # Sensor reading & HTTP POST
├── firmware-power/
│   ├── platformio.ini
│   ├── include/config.h        # WiFi, API endpoint, calibration
│   └── src/main.cpp            # 3-phase voltage/current POST
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

Temperature ESP32 sends this JSON to `POST /api/readings`:

```json
{
  "device_id": "fridge-01",
  "sensors": [
    { "id": "sensor_1", "temp_c": 3.25 },
    { "id": "sensor_2", "temp_c": -18.50 }
  ]
}
```

Power ESP32 sends this JSON to `POST /api/readings/power`:

```json
{
  "device_id": "power-01",
  "phases": [
    { "id": "phase_a", "voltage_v": 229.5, "current_a": 4.11 },
    { "id": "phase_b", "voltage_v": 231.0, "current_a": 3.84 },
    { "id": "phase_c", "voltage_v": 228.8, "current_a": 4.27 }
  ]
}
```

## Configuration

| Setting | File | Default |
|---|---|---|
| Temp ESP WiFi | `firmware/include/config.h` | `YOUR_WIFI_SSID` / `YOUR_WIFI_PASSWORD` |
| Temp ESP server URL | `firmware/include/config.h` | `http://YOUR_SERVER_IP:4004/api/readings` |
| Power ESP server URL | `firmware-power/include/config.h` | `http://YOUR_SERVER_IP:4004/api/readings/power` |
| Power ESP scales | `firmware-power/include/config.h` | `VOLTAGE_SCALE=100`, `CURRENT_SCALE=20` |
| API port | `backend/server.js` (env) | 4004 |
| Data retention | `backend/server.js` | 90 days |
| Alert threshold | `frontend/src/components/AlertBanner.jsx` | 8 C |
