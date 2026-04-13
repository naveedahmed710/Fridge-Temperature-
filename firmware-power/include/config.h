#ifndef CONFIG_H
#define CONFIG_H

// ---- WiFi credentials ----
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// ---- Server configuration ----
#define SERVER_URL "http://YOUR_SERVER_IP:4004/api/readings/power"
#define DEVICE_ID "power-01"

// ---- ADC pins for ESP32-S3 ----
// Wire one ZMPT101B + one ACS712 per phase.
#define PHASE_A_VOLTAGE_PIN 1
#define PHASE_B_VOLTAGE_PIN 2
#define PHASE_C_VOLTAGE_PIN 3

#define PHASE_A_CURRENT_PIN 4
#define PHASE_B_CURRENT_PIN 5
#define PHASE_C_CURRENT_PIN 6

// ---- Calibration placeholders ----
// Tune these values using your actual mains voltage and load.
#define ADC_VREF 3.3f
#define ADC_MAX 4095.0f
#define VOLTAGE_SCALE 100.0f
#define CURRENT_SCALE 20.0f

// ---- Timing ----
#define READ_INTERVAL_MS 30000
#define WIFI_RETRY_DELAY 5000
#define MAX_WIFI_RETRIES 20

#endif
