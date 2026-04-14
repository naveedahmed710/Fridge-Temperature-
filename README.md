# Sweet Home Automation

Real-time temperature and 3-phase electrical monitoring using two ESP32-S3 devices, a Node.js REST API backend, and a React dashboard.

## Features

- Live temperature monitoring with two DS18B20 sensors (Room + Refrigerator)
- 3-phase voltage and current monitoring (ZMPT101B + ACS712 per phase)
- Editable sensor names (inline edit on each sensor card, persisted to DB)
- Editable ESP32 device names with live connection status in the footer
- Statistics with time-range filter (1h, 6h, 24h, 3d, 7d)
- Dark / Light mode toggle (saved in browser)
- Glassmorphism UI with smooth animations
- Both ESP32 devices feed the same dashboard
- API key authentication (optional, via environment variable)
- Rate limiting and input validation

## Architecture

```
[DS18B20 x2] --> [ESP32-S3 #1] --> POST /api/readings
                                                          \
                                                           --> [Node.js API + SQLite] <-- [React Dashboard]
                                                          /
[ZMPT101B x3 + ACS712 x3] --> [ESP32-S3 #2] --> POST /api/readings/power
```

## Tech Stack

| Layer | Technology |
|---|---|
| Firmware (Temp) | PlatformIO, Arduino, OneWire, DallasTemperature |
| Firmware (Power) | PlatformIO, Arduino, ZMPT101B, ACS712 |
| Backend | Node.js, Express 5, sql.js (SQLite), express-rate-limit |
| Frontend | React 19, Vite 8, Tailwind CSS 4, Chart.js |

## Wiring

### Temperature ESP32-S3

Both DS18B20 sensors share a single data pin using the OneWire protocol.

```
ESP32 GPIO4 ──┬── DS18B20 #1 (DATA)
              ├── DS18B20 #2 (DATA)
              └── 4.7kΩ pull-up to 3.3V

3.3V ── VDD (both sensors)
GND  ── GND (both sensors)
```

### Power ESP32-S3

Three ZMPT101B voltage modules and three ACS712 20A current modules, one per phase.

```
ESP32 GPIO1  ── ZMPT101B Phase A (signal)
ESP32 GPIO2  ── ZMPT101B Phase B (signal)
ESP32 GPIO3  ── ZMPT101B Phase C (signal)

ESP32 GPIO4  ── ACS712 Phase A (signal)
ESP32 GPIO5  ── ACS712 Phase B (signal)
ESP32 GPIO6  ── ACS712 Phase C (signal)

3.3V ── VCC (all modules)
GND  ── GND (all modules)
```

## Setup

### 1. Firmware (Temperature ESP32-S3)

1. Install [PlatformIO CLI](https://platformio.org/install/cli) or the VS Code extension
2. Edit `firmware/include/config.h` — set your WiFi SSID, password, and server IP
3. Flash:

```bash
cd firmware
pio run --target upload
pio device monitor
```

### 2. Firmware (Power ESP32-S3)

1. Edit `firmware-power/include/config.h` — set WiFi, backend URL, and calibrated scale factors
2. Flash:

```bash
cd firmware-power
pio run --target upload
pio device monitor
```

The power firmware samples each ADC pin over 2 full AC cycles (40ms at 50Hz) and computes true RMS values. Tune `VOLTAGE_SCALE` and `CURRENT_SCALE` in the config with a known reference meter.

### 3. Backend

```bash
cd backend
npm install
npm start
```

The API runs on `http://localhost:4004`.

**Optional environment variables:**

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `4004` |
| `API_KEY` | If set, all API routes require `X-API-Key` header or `?api_key=` query param | empty (auth disabled) |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:4004` |

**Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/readings` | Temperature ESP32 sends DS18B20 data |
| GET | `/api/readings` | Temperature history (`device_id`, `hours`) |
| GET | `/api/readings/latest` | Latest temperature per sensor |
| GET | `/api/readings/stats` | Temperature min/max/avg |
| GET | `/api/readings/sensor-names` | Get editable sensor display names |
| PUT | `/api/readings/sensor-names` | Update a sensor display name |
| GET | `/api/readings/device-names` | Get editable ESP32 device display names |
| PUT | `/api/readings/device-names` | Update an ESP32 device display name |
| GET | `/api/readings/device-status` | Connection status for devices (`device_ids`) |
| POST | `/api/readings/power` | Power ESP32 sends 3-phase voltage/current |
| GET | `/api/readings/power/latest` | Latest power values per phase |
| GET | `/api/readings/power` | Power history (`device_id`, `hours`) |
| GET | `/api/readings/power/stats` | 3-phase power min/max/avg |
| GET | `/api/health` | Server health check |

### 4. Frontend

**Development:**

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies API requests to the backend.

**Production build:**

```bash
cd frontend
npm run build
```

This outputs to `backend/public/`. The Express server serves it automatically — run the backend and open `http://localhost:4004`.

## Project Structure

```
├── firmware/                        # Temperature ESP32-S3
│   ├── platformio.ini
│   ├── include/config.h             # WiFi & server config
│   └── src/main.cpp                 # DS18B20 reading & HTTP POST
├── firmware-power/                  # Power ESP32-S3
│   ├── platformio.ini
│   ├── include/config.h             # WiFi, API endpoint, calibration
│   └── src/main.cpp                 # 3-phase true-RMS sampling & POST
├── backend/
│   ├── server.js                    # Express app entry (CORS, auth, rate-limit)
│   ├── db.js                        # SQLite setup & queries
│   ├── routes/readings.js           # All API route handlers
│   └── package.json
├── frontend/
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx                  # Main dashboard layout + theme toggle
│       ├── components/
│       │   ├── CurrentTemp.jsx      # Live temp display + inline name edit
│       │   ├── TempChart.jsx        # 24h temperature line chart
│       │   ├── StatsCard.jsx        # Min/Max/Avg with time filter
│       │   ├── PowerMonitor.jsx     # 3-phase live readings + stats
│       │   └── DeviceStatusFooter.jsx # ESP32 connection status + device name editing
│       └── hooks/
│           └── useReadings.js       # Data fetching, polling, sensor/device names & status
├── .gitignore
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
| Power ESP WiFi | `firmware-power/include/config.h` | `YOUR_WIFI_SSID` / `YOUR_WIFI_PASSWORD` |
| Power ESP server URL | `firmware-power/include/config.h` | `http://YOUR_SERVER_IP:4004/api/readings/power` |
| Power ESP scales | `firmware-power/include/config.h` | `VOLTAGE_SCALE=100`, `CURRENT_SCALE=20` |
| API port | `backend/server.js` (env `PORT`) | 4004 |
| API key | env `API_KEY` | empty (disabled) |
| CORS origins | env `CORS_ORIGINS` | `http://localhost:5173,http://localhost:4004` |
| Rate limit | `backend/server.js` | 120 requests/min |
| Data retention | `backend/server.js` | 90 days |

## Security

- **API key auth** — set `API_KEY` env var to require `X-API-Key` header on all requests
- **CORS** — restricted to configured origins (not wildcard)
- **Rate limiting** — 120 requests per minute per IP
- **Body size** — JSON payloads capped at 1 MB
- **Input validation** — device/sensor IDs validated against `[a-zA-Z0-9_-]`, display names capped at 100 chars, `hours` parameter clamped to 1–720
