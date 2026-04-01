#ifndef CONFIG_H
#define CONFIG_H

// ---- WiFi credentials ----
#define WIFI_SSID     "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ---- Server configuration ----
#define SERVER_URL    "http://YOUR_SERVER_IP:3000/api/readings"
#define DEVICE_ID     "fridge-01"

// ---- Sensor configuration ----
#define ONE_WIRE_BUS  4          // GPIO pin for DS18B20 data line
#define TEMP_PRECISION 12        // 12-bit resolution (0.0625°C)

// ---- Timing ----
#define READ_INTERVAL_MS  30000  // Send readings every 30 seconds
#define WIFI_RETRY_DELAY  5000   // Retry WiFi connection every 5 seconds
#define MAX_WIFI_RETRIES  20     // Max WiFi connection attempts before reboot

#endif
