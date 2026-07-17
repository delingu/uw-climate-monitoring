#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_AHTX0.h>
#include <Adafruit_ENS160.h>
#include <ArduinoJson.h>

// defining desired sensors: aht and ens (co2) sensor
Adafruit_AHTX0 aht;
Adafruit_ENS160 ens;

const char *ssid = "delinemily";
const char *password = "12345678";
const char* serverURL = "http://192.168.4.2:3000/api/readings";

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("Configuring access point...");
  
  if (!WiFi.softAP(ssid, password)) {
    log_e("Soft AP creation failed.");
    while (1);
  }
  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);
  Serial.println("Server started");
 
  // This section of code checks for proper sensors setup and connections
  if (!aht.begin()) {
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

  Serial.println("Warming up ENS160.");
  delay(3000);
}


void loop() {
  sensors_event_t humidity, temp;
  aht.getEvent(&humidity, &temp);  

  // feed temp/humidity into ens to ensure more accurate readings
  ens.setTempAndHum(temp.temperature, humidity.relative_humidity);
  ens.measure(true);

  uint16_t eco2 = ens.geteCO2();

  // establish http
  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  // build up json to send to server
  // payload to send in request is json
  JsonDocument doc;
  doc["temperature"] = temp.temperature;
  doc["humidity"] = humidity.relative_humidity;
  doc["co2"] = eco2;

  String json;
  serializeJson(doc, json);

  // send POST request with json
  int code = http.POST(json);
  Serial.println(code);
  http.end();

  // send data every 3 minutes
  delay(180000);
}
