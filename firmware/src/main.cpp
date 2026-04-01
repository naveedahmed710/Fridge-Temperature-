#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

DeviceAddress sensor1Address, sensor2Address;
unsigned long lastReadTime = 0;
int sensorCount = 0;

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

void initSensors() {
  sensors.begin();
  sensorCount = sensors.getDeviceCount();
  Serial.printf("Found %d DS18B20 sensor(s)\n", sensorCount);

  if (sensorCount >= 1) {
    sensors.getAddress(sensor1Address, 0);
    sensors.setResolution(sensor1Address, TEMP_PRECISION);
    Serial.print("Sensor 1 address: ");
    for (uint8_t i = 0; i < 8; i++) Serial.printf("%02X", sensor1Address[i]);
    Serial.println();
  }

  if (sensorCount >= 2) {
    sensors.getAddress(sensor2Address, 1);
    sensors.setResolution(sensor2Address, TEMP_PRECISION);
    Serial.print("Sensor 2 address: ");
    for (uint8_t i = 0; i < 8; i++) Serial.printf("%02X", sensor2Address[i]);
    Serial.println();
  }
}

String buildJsonPayload(float temp1, float temp2) {
  String json = "{";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"sensors\":[";

  if (sensorCount >= 1) {
    json += "{\"id\":\"sensor_1\",\"temp_c\":" + String(temp1, 2) + "}";
  }
  if (sensorCount >= 2) {
    json += ",{\"id\":\"sensor_2\",\"temp_c\":" + String(temp2, 2) + "}";
  }

  json += "]}";
  return json;
}

void sendReadings(float temp1, float temp2) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = buildJsonPayload(temp1, temp2);
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
  Serial.println("\n=== Fridge Temperature Monitor ===");

  connectWiFi();
  initSensors();

  if (sensorCount == 0) {
    Serial.println("ERROR: No DS18B20 sensors found! Check wiring.");
  }
}

void loop() {
  unsigned long now = millis();

  if (now - lastReadTime >= READ_INTERVAL_MS) {
    lastReadTime = now;

    sensors.requestTemperatures();

    float temp1 = (sensorCount >= 1) ? sensors.getTempC(sensor1Address) : -127.0;
    float temp2 = (sensorCount >= 2) ? sensors.getTempC(sensor2Address) : -127.0;

    Serial.printf("Sensor 1: %.2f°C | Sensor 2: %.2f°C\n", temp1, temp2);

    bool valid1 = (temp1 != DEVICE_DISCONNECTED_C && temp1 != 85.0);
    bool valid2 = (temp2 != DEVICE_DISCONNECTED_C && temp2 != 85.0);

    if (valid1 || valid2) {
      sendReadings(temp1, temp2);
    } else {
      Serial.println("Invalid readings — skipping POST");
    }
  }
}
