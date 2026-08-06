#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_AHTX0.h>
#include <ScioSense_ENS160.h>
#include <ArduinoJson.h>

// defining desired sensors: aht and ens (co2) sensor
Adafruit_AHTX0 aht;
ScioSense_ENS160 ens(0x53);

// Since there is another AHT on the ENS the actual AHT needs to connect to other pins
#define AHT_SDA 16
#define AHT_SCL 17

const char *ssid = "group6wifi";
const char *password = "12345678";
const char* serverURL = "http://192.168.4.2:3000/api/sensor";
// match lib/location.ts (building-floor-room).
const char* location = "PSE-4-4417";

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.setDebugOutput(true);
  Serial.println();
  Serial.println("Boot: setup() reached");

  Wire.begin();
  Wire1.begin(AHT_SDA, AHT_SCL);
  delay(50);

  if (!aht.begin(&Wire1)) {
    Serial.println("Could not find AHT20.");
    while (1)
      delay(10);
  }
  Serial.println("AHT20 found!");

  if (!ens.begin()) {
    Serial.println("Could not find ENS160.");
    while(1)
      delay(10);
  }
  Serial.println("ENS160 found!");

  // The ENS160 boots idle and reports 0 until put into standard measurement
  // mode; this is what actually starts it sampling.
  ens.setMode(ENS160_OPMODE_STD);

  Serial.println("Configuring access point...");

  if (!WiFi.softAP(ssid, password)) {
    log_e("Soft AP creation failed.");
    while (1);
  }
  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);
  Serial.println("Server started");

  Serial.println("Warming up ENS160.");
  delay(3000);
}

void loop() {
  sensors_event_t humidity, temp;
  aht.getEvent(&humidity, &temp);  

  // feed temp/humidity into ens to ensure more accurate readings
  ens.set_envdata(temp.temperature, humidity.relative_humidity);

  ens.measure(true);
  uint16_t eco2 = ens.geteCO2();

  // establish http
  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  // build up json to send to server
  // Keys must match SensorDataPayload in app/api/sensor/route.ts exactly;
  // a renamed/missing field arrives as undefined and stores as NULL.
  JsonDocument doc;
  doc["location"] = location;
  doc["temperature"] = temp.temperature;
  doc["humidity"] = humidity.relative_humidity;
  doc["carbonDioxide"] = eco2;

  String json;
  serializeJson(doc, json);

  // send POST request with json
  int code = http.POST(json);
  Serial.println(code);
  http.end();

  // send data every 10 seconds
  delay(10000);
}
