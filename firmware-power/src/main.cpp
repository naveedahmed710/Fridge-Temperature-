#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "config.h"

unsigned long lastReadTime = 0;

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < MAX_WIFI_RETRIES) {
    delay(WIFI_RETRY_DELAY);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi connection failed. Rebooting...");
    ESP.restart();
  }
}

/*
 * Sample a pin over multiple full AC cycles and compute true RMS.
 * At 50Hz one cycle is 20ms; we sample for SAMPLE_DURATION_MS (default 40ms = 2 cycles)
 * at maximum speed to capture the waveform shape.
 */
#ifndef SAMPLE_DURATION_MS
#define SAMPLE_DURATION_MS 40
#endif

float readRms(int pin) {
  unsigned long start = micros();
  unsigned long durationUs = (unsigned long)SAMPLE_DURATION_MS * 1000UL;
  double sumSq = 0.0;
  uint32_t count = 0;

  while ((micros() - start) < durationUs) {
    int raw = analogRead(pin);
    float v = (raw / ADC_MAX) * ADC_VREF;
    float centered = v - (ADC_VREF / 2.0f);
    sumSq += (double)centered * (double)centered;
    count++;
  }

  if (count == 0) return 0.0f;
  return (float)sqrt(sumSq / (double)count);
}

float readVoltageRms(int pin) {
  return readRms(pin) * VOLTAGE_SCALE;
}

float readCurrentRms(int pin) {
  return readRms(pin) * CURRENT_SCALE;
}

String buildPowerPayload() {
  float va = readVoltageRms(PHASE_A_VOLTAGE_PIN);
  float vb = readVoltageRms(PHASE_B_VOLTAGE_PIN);
  float vc = readVoltageRms(PHASE_C_VOLTAGE_PIN);

  float ia = readCurrentRms(PHASE_A_CURRENT_PIN);
  float ib = readCurrentRms(PHASE_B_CURRENT_PIN);
  float ic = readCurrentRms(PHASE_C_CURRENT_PIN);

  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"phases\":[";
  json += "{\"id\":\"phase_a\",\"voltage_v\":" + String(va, 2) + ",\"current_a\":" + String(ia, 3) + "},";
  json += "{\"id\":\"phase_b\",\"voltage_v\":" + String(vb, 2) + ",\"current_a\":" + String(ib, 3) + "},";
  json += "{\"id\":\"phase_c\",\"voltage_v\":" + String(vc, 2) + ",\"current_a\":" + String(ic, 3) + "}";
  json += "]}";

  Serial.printf("A: %.2fV %.3fA | B: %.2fV %.3fA | C: %.2fV %.3fA\n", va, ia, vb, ib, vc, ic);
  return json;
}

void sendReadings() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = buildPowerPayload();
  Serial.println("Sending: " + payload);

  int httpCode = http.POST(payload);
  if (httpCode > 0) {
    Serial.printf("Server response: %d - %s\n", httpCode, http.getString().c_str());
  } else {
    Serial.printf("HTTP POST failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== ESP32-S3 3-Phase Power Monitor ===");

  analogReadResolution(12);
  connectWiFi();
}

void loop() {
  unsigned long now = millis();
  if (now - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = now;
    sendReadings();
  }
}
