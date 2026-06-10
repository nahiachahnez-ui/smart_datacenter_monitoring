/*
  NEXO ESP32 IoT Node — with SPIFFS offline buffer
  
  When WiFi/MQTT is unavailable:
    → sensor readings are saved to /buffer.json in SPIFFS
  
  When connection is restored:
    → all buffered readings are replayed to the broker
    → buffer file is cleared
  
  Sensors: DHT11, MQ-135, MQ-5, GP2Y1014AU0F, Water level
  Broker:  Raspberry Pi (TLS, port 8883)
*/

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>

// =============================================
// CONFIGURATION
// =============================================

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_BROKER   = "192.168.1.8";
const int   MQTT_PORT     = 8883;

const char* ROOT_CA = \
"-----BEGIN CERTIFICATE-----\n"
"MIIDkTCCAnmgAwIBAgIUd9bgzN3vwmada8ZpbGzghX7nfrswDQYJKoZIhvcNAQEL\n"
"BQAwWDELMAkGA1UEBhMCVE4xDjAMBgNVBAgMBVRVTklTMQ0wCwYDVQQKDARORVhP\n"
"MRQwEgYDVQQLDAtkYXRhY2VudGVyIDEUMBIGA1UEAwwLMTkyLjE2OC4xLjQwHhcN\n"
"MjYwNDMwMTY1MzU2WhcNMzYwNDI3MTY1MzU2WjBYMQswCQYDVQQGEwJUTjEOMAwG\n"
"A1UECAwFVFVOSVMxDTALBgNVBAoMBE5FWE8xFDASBgNVBAsMC2RhdGFjZW50ZXIg\n"
"MRQwEgYDVQQDDAsxOTIuMTY4LjEuNDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCC\n"
"AQoCggEBAJSTrQlEczRgqMSG4DFsPEpgRKrYJOeLlmH8aKtVI4RV1bjTLxiH52Nq\n"
"p1e0ImP8dzafohmiHTiJ9HIz3oHzuqds4AEXyQ+7IVPQ+Ov7km5/imkKiyqNfy08\n"
"PNva/KHBZvX9W05Ng+DuHwMjp8+81LJHZX99hkjNR5Opjiy0fS05uZGye0jG8a7n\n"
"ZwDyF+nem5XUQWKaG40ZYh98U4bZjj8/1XRFVnzNM2iFTrOn1Xj+bmYmQtf6LhZo\n"
"emoTYZNVusz+LgoS093zRNA0T62nmJJ9BqzhCCjCegmTl6rmITb+b1VQVJui+J5y\n"
"Tr06YZKvL1Tt/TVItwA3fketx622o20CAwEAAaNTMFEwHQYDVR0OBBYEFOXdpw2K\n"
"x4ZWANGpuqeezE2O8DO2MB8GA1UdIwQYMBaAFOXdpw2Kx4ZWANGpuqeezE2O8DO2\n"
"MA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAFQ6B//MSypwzcTN\n"
"Xf5Av9pP+RW4thFNwB486Gzr+0xXbu3A4tr2g25jPKVu6BVQVBMvpoMHMuXnEaUb\n"
"f4S6l6wsVhBcPSply8OrBdbU5hZ5mLYAo9XCW2GQkM0RzXwgJJ2zIwKXb1Onpn+V\n"
"8mlhF0JGwIg52jGKBl8UVC0sS8S7ROgU4DjbIechn7/z91i8Oz4m8kwbWtV3zq9K\n"
"jrJxzxu8YjsAfwSMiovfVmg/oYvnaIOo9xqgkKxUK3/y9JYbO5mzorpkMS1Wqtrp\n"
"JV6PybPRpbqaE7+Yz5gcqN6O8ul5iOKcsDx0r6Ak7WL7p7ANphDEWYGdgYS76PjG\n"
"q7ttU0E=\n"
"-----END CERTIFICATE-----\n";

// =============================================
// PIN DEFINITIONS
// =============================================

#define DHT_PIN        18
#define DHT_TYPE       DHT11
#define MQ135_PIN      34
#define MQ5_PIN        35
#define DUST_LED_PIN   16
#define DUST_AOUT_PIN  33
#define WATER_PIN      32

// =============================================
// MQTT TOPICS
// =============================================

#define TOPIC_TEMP      "nexo/datacenter/temperature"
#define TOPIC_HUMIDITY  "nexo/datacenter/humidity"
#define TOPIC_AIR       "nexo/datacenter/air"
#define TOPIC_GAS       "nexo/datacenter/gas"
#define TOPIC_DUST      "nexo/datacenter/dust"
#define TOPIC_WATER     "nexo/datacenter/water"
#define TOPIC_HEARTBEAT "nexo/datacenter/heartbeat"

// SPIFFS buffer file
#define BUFFER_FILE     "/buffer.txt"
#define MAX_BUFFER_ROWS 200   // max readings to store offline

// =============================================
// GLOBALS
// =============================================

DHT              dht(DHT_PIN, DHT_TYPE);
WiFiClientSecure espClient;
PubSubClient     mqtt(espClient);

unsigned long lastPublish   = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastWifiCheck = 0;

const long PUBLISH_INTERVAL   = 5000;
const long HEARTBEAT_INTERVAL = 30000;
const long WIFI_CHECK_INTERVAL = 10000;

bool wasConnected = false;

// =============================================
// SPIFFS BUFFER
// =============================================

// One line per reading: "topic|value\n"
void bufferSave(const char* topic, const char* value) {
  // count existing lines to enforce max
  File f = SPIFFS.open(BUFFER_FILE, "r");
  int lines = 0;
  if (f) {
    while (f.available()) {
      if (f.read() == '\n') lines++;
    }
    f.close();
  }

  if (lines >= MAX_BUFFER_ROWS) {
    Serial.println("  [BUFFER] Full — oldest data dropped");
    return;
  }

  f = SPIFFS.open(BUFFER_FILE, "a");
  if (!f) {
    Serial.println("  [BUFFER] Failed to open for write");
    return;
  }
  f.printf("%s|%s\n", topic, value);
  f.close();
  Serial.printf("  [BUFFER] Saved: %s → %s\n", topic, value);
}

void bufferFlush() {
  if (!SPIFFS.exists(BUFFER_FILE)) return;

  File f = SPIFFS.open(BUFFER_FILE, "r");
  if (!f) return;

  Serial.println("[BUFFER] Flushing offline data...");
  int sent = 0;

  while (f.available()) {
    String line = f.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) continue;

    int sep = line.indexOf('|');
    if (sep < 0) continue;

    String topic = line.substring(0, sep);
    String value = line.substring(sep + 1);

    if (mqtt.publish(topic.c_str(), value.c_str())) {
      sent++;
    } else {
      Serial.println("  [BUFFER] Publish failed — aborting flush");
      break;
    }
    delay(50); // small gap between replayed messages
  }

  f.close();
  SPIFFS.remove(BUFFER_FILE);
  Serial.printf("[BUFFER] Flushed %d readings, buffer cleared\n", sent);
}

// =============================================
// PUBLISH — live or buffer
// =============================================

void publish(const char* topic, const char* value) {
  if (mqtt.connected()) {
    mqtt.publish(topic, value);
    Serial.printf("  %s → %s\n", topic, value);
  } else {
    bufferSave(topic, value);
  }
}

void publishFloat(const char* topic, float value, int dec = 1) {
  char buf[16];
  dtostrf(value, 4, dec, buf);
  publish(topic, buf);
}

void publishInt(const char* topic, int value) {
  char buf[16];
  itoa(value, buf, 10);
  publish(topic, buf);
}

// =============================================
// SENSOR READS
// =============================================

float readDust() {
  digitalWrite(DUST_LED_PIN, LOW);
  delayMicroseconds(280);
  int raw = analogRead(DUST_AOUT_PIN);
  delayMicroseconds(40);
  digitalWrite(DUST_LED_PIN, HIGH);
  delayMicroseconds(9680);
  float voltage = raw * (3.3f / 4095.0f);
  float density = (voltage - 0.6f) * 170.0f;
  return max(density, 0.0f);
}

// =============================================
// WIFI + MQTT
// =============================================

bool connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return true;

  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("WiFi connected — IP: ");
    Serial.println(WiFi.localIP());
    return true;
  }

  Serial.println("\nWiFi failed — going offline");
  return false;
}

bool connectMQTT() {
  if (mqtt.connected()) return true;
  if (WiFi.status() != WL_CONNECTED) return false;

  Serial.print("Connecting to MQTT...");
  if (mqtt.connect("ESP32-NEXO")) {
    Serial.println(" connected");
    return true;
  }

  Serial.printf(" failed rc=%d\n", mqtt.state());
  return false;
}

// =============================================
// SETUP
// =============================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== NEXO ESP32 Node ===");

  pinMode(DUST_LED_PIN, OUTPUT);
  digitalWrite(DUST_LED_PIN, HIGH);

  dht.begin();

  // Init SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("SPIFFS mount failed");
  } else {
    Serial.println("SPIFFS mounted");
    // show buffered count on boot
    if (SPIFFS.exists(BUFFER_FILE)) {
      File f = SPIFFS.open(BUFFER_FILE, "r");
      int lines = 0;
      if (f) { while (f.available()) { if (f.read() == '\n') lines++; } f.close(); }
      Serial.printf("  %d readings in offline buffer\n", lines);
    }
  }

  espClient.setCACert(ROOT_CA);
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);

  if (connectWiFi()) {
    if (connectMQTT()) {
      bufferFlush(); // replay any data saved before this boot
      wasConnected = true;
    }
  }

  Serial.println("Ready");
}

// =============================================
// LOOP
// =============================================

void loop() {
  unsigned long now = millis();

  // Periodically check WiFi + MQTT and flush buffer on reconnect
  if (now - lastWifiCheck >= WIFI_CHECK_INTERVAL) {
    lastWifiCheck = now;

    bool connected = connectWiFi() && connectMQTT();

    if (connected && !wasConnected) {
      Serial.println("Connection restored — flushing buffer");
      bufferFlush();
    }
    wasConnected = connected;
  }

  if (mqtt.connected()) mqtt.loop();

  // Publish sensor readings every 5s (live or buffered)
  if (now - lastPublish >= PUBLISH_INTERVAL) {
    lastPublish = now;
    Serial.println("--- Publish ---");

    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t)) publishFloat(TOPIC_TEMP,     t);
    if (!isnan(h)) publishFloat(TOPIC_HUMIDITY, h);

    publishFloat(TOPIC_DUST,  readDust());
    publishInt(TOPIC_WATER,   map(analogRead(WATER_PIN), 0, 4095, 0, 100));
    publishInt(TOPIC_AIR,     (int)analogRead(MQ135_PIN));
    publishInt(TOPIC_GAS,     (int)analogRead(MQ5_PIN));
  }

  // Heartbeat every 30s (only when connected)
  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    lastHeartbeat = now;
    if (mqtt.connected()) {
      mqtt.publish(TOPIC_HEARTBEAT, "1");
      Serial.println("  heartbeat → 1");
    }
  }
}
