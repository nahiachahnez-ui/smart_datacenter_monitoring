#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <DHT.h>
#include "SPIFFS.h"
#include "esp_mac.h"

// ======================================================
// WIFI CREDENTIALS
// ======================================================

const char* ssid1     = "globalnet2022";
const char* password1 = "272664272664";

const char* ssid2     = "Backup_Wifi";       // <-- update if you have one
const char* password2 = "Backup_Password";

// ======================================================
// MQTT
// ======================================================

const char* mqtt_server = "192.168.1.8";
const int   mqtt_port   = 8883;

// Individual topics — must match mqtt_ai_engine.py
#define TOPIC_TEMP      "nexo/datacenter/temperature"
#define TOPIC_HUMIDITY  "nexo/datacenter/humidity"
#define TOPIC_AIR       "nexo/datacenter/air"
#define TOPIC_GAS       "nexo/datacenter/gas"
#define TOPIC_WATER     "nexo/datacenter/water"
#define TOPIC_DUST      "nexo/datacenter/dust"
#define TOPIC_VIBRATION "nexo/datacenter/vibration"
#define TOPIC_HEARTBEAT "nexo/datacenter/heartbeat"
#define TOPIC_ESP_ID    "nexo/datacenter/esp_id"

// SPIFFS offline buffer
#define OFFLINE_FILE    "/offline.txt"
#define MAX_LINES       200

// ======================================================
// ROOT CA CERTIFICATE
// ======================================================

const char* root_ca =
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

// ======================================================
// PIN DEFINITIONS
// ======================================================

#define DHTPIN          26
#define DHTTYPE         DHT11
#define MQ5_PIN         34
#define MQ135_PIN       35
#define WATER_PIN       32
#define SW420_PIN       27
#define DUST_LED_PIN    4
#define DUST_ANALOG_PIN 33
#define GREEN_LED       2
#define BUZZER_PIN      19

// ======================================================
// TIMERS
// ======================================================

unsigned long lastSend      = 0;
unsigned long lastHeartbeat = 0;

const unsigned long SEND_INTERVAL      = 30000;  // 30 seconds
const unsigned long HEARTBEAT_INTERVAL = 60000;  // 60 seconds

// ESP32 unique ID (MAC address, set in setup)
char ESP_ID[32] = "";

// ======================================================
// OBJECTS
// ======================================================

DHT              dht(DHTPIN, DHTTYPE);
WiFiClientSecure espClient;
PubSubClient     client(espClient);

// ======================================================
// WIFI
// ======================================================

bool connectToWiFi(const char* ssid, const char* password) {
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected — IP: " + WiFi.localIP().toString());
    return true;
  }
  Serial.println("\nFailed");
  return false;
}

void setup_wifi() {
  if (!connectToWiFi(ssid1, password1)) {
    Serial.println("Trying backup WiFi...");
    connectToWiFi(ssid2, password2);
  }
}

// ======================================================
// SPIFFS OFFLINE BUFFER
// ======================================================

void storeOffline(const char* topic, const char* value) {
  File f = SPIFFS.open(OFFLINE_FILE, "r");
  int lines = 0;
  if (f) { while (f.available()) { if (f.read() == '\n') lines++; } f.close(); }
  if (lines >= MAX_LINES) { Serial.println("[BUFFER] Full"); return; }

  f = SPIFFS.open(OFFLINE_FILE, FILE_APPEND);
  if (!f) { Serial.println("[BUFFER] Open failed"); return; }
  f.printf("%s|%s\n", topic, value);
  f.close();
  Serial.printf("[BUFFER] Saved: %s -> %s\n", topic, value);
}

void resendOfflineData() {
  if (!SPIFFS.exists(OFFLINE_FILE)) return;
  File f = SPIFFS.open(OFFLINE_FILE, "r");
  if (!f || f.size() == 0) { if (f) f.close(); return; }

  Serial.println("[BUFFER] Flushing...");
  int sent = 0;
  while (f.available()) {
    String line = f.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) continue;
    int sep = line.indexOf('|');
    if (sep < 0) continue;
    String t = line.substring(0, sep);
    String v = line.substring(sep + 1);
    if (!client.publish(t.c_str(), v.c_str())) {
      Serial.println("[BUFFER] Publish failed -- aborting");
      break;
    }
    sent++;
    delay(50);
  }
  f.close();
  SPIFFS.remove(OFFLINE_FILE);
  Serial.printf("[BUFFER] Flushed %d readings\n", sent);
}

// ======================================================
// MQTT
// ======================================================

void reconnect() {
  while (!client.connected() && WiFi.status() == WL_CONNECTED) {
    Serial.print("Connecting MQTT...");
    if (client.connect(ESP_ID)) {   // use MAC-based unique ID
      Serial.println(" connected");
      // announce this ESP to the broker
      client.publish(TOPIC_ESP_ID, ESP_ID);
      resendOfflineData();
    } else {
      Serial.printf(" failed rc=%d -- retry in 3s\n", client.state());
      delay(3000);
    }
  }
}

void pub(const char* topic, float value, int dec = 1) {
  char buf[16];
  dtostrf(value, 4, dec, buf);
  if (client.connected()) {
    client.publish(topic, buf);
    Serial.printf("  %s -> %s\n", topic, buf);
  } else {
    storeOffline(topic, buf);
  }
}

void pub(const char* topic, int value) {
  char buf[16];
  itoa(value, buf, 10);
  if (client.connected()) {
    client.publish(topic, buf);
    Serial.printf("  %s -> %s\n", topic, buf);
  } else {
    storeOffline(topic, buf);
  }
}

// ======================================================
// DUST SENSOR (GP2Y1014AU0F)
// ======================================================

float readDust() {
  digitalWrite(DUST_LED_PIN, LOW);
  delayMicroseconds(280);
  int raw = analogRead(DUST_ANALOG_PIN);
  delayMicroseconds(40);
  digitalWrite(DUST_LED_PIN, HIGH);
  delayMicroseconds(9680);
  float voltage = raw * (3.3f / 4095.0f);
  float density = (voltage - 0.6f) * 170.0f;
  return max(density, 0.0f);
}

// ======================================================
// SETUP
// ======================================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== NEXO ESP32 Node ===");

  if (!SPIFFS.begin(true)) Serial.println("SPIFFS failed");
  else Serial.println("SPIFFS ready");

  pinMode(GREEN_LED,    OUTPUT);
  pinMode(BUZZER_PIN,   OUTPUT);
  pinMode(DUST_LED_PIN, OUTPUT);
  pinMode(SW420_PIN,    INPUT);

  digitalWrite(DUST_LED_PIN, HIGH);
  digitalWrite(GREEN_LED,    HIGH);
  digitalWrite(BUZZER_PIN,   LOW);

  dht.begin();
  setup_wifi();

  // Build unique ESP ID from MAC address
  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);
  snprintf(ESP_ID, sizeof(ESP_ID),
    "ESP32-%02X%02X%02X%02X%02X%02X",
    mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  Serial.printf("ESP ID: %s\n", ESP_ID);

  espClient.setCACert(root_ca);
  client.setServer(mqtt_server, mqtt_port);

  if (WiFi.status() == WL_CONNECTED) reconnect();

  Serial.println("Ready");
}

// ======================================================
// LOOP
// ======================================================

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost -- reconnecting");
    setup_wifi();
  }

  if (WiFi.status() == WL_CONNECTED && !client.connected()) {
    reconnect();
  }

  client.loop();

  unsigned long now = millis();

  // Publish sensors every 10s
  if (now - lastSend >= SEND_INTERVAL) {
    lastSend = now;
    Serial.println("--- Publish ---");

    float temperature = dht.readTemperature();
    float humidity    = dht.readHumidity();
    int   mq135       = analogRead(MQ135_PIN);
    int   mq5         = analogRead(MQ5_PIN);
    int   water       = map(analogRead(WATER_PIN), 0, 4095, 0, 100);
    int   vibration   = digitalRead(SW420_PIN);
    float dust        = readDust();

    if (!isnan(temperature)) pub(TOPIC_TEMP,      temperature);
    if (!isnan(humidity))    pub(TOPIC_HUMIDITY,  humidity);
    pub(TOPIC_AIR,       mq135);
    pub(TOPIC_GAS,       mq5);
    pub(TOPIC_WATER,     water);
    pub(TOPIC_DUST,      dust);
    pub(TOPIC_VIBRATION, vibration);

    // Publish ESP ID so the broker/Pi knows which device sent this
    if (client.connected()) {
      client.publish(TOPIC_ESP_ID, ESP_ID);
    }

    // Local threat detection
    bool threat = (!isnan(temperature) && temperature > 40) ||
                  (mq135 > 2500) || (mq5 > 2500) ||
                  (water > 80)   || (vibration == HIGH) ||
                  (dust > 150);

    digitalWrite(BUZZER_PIN, threat ? HIGH : LOW);
    Serial.printf("  Threat: %s\n", threat ? "YES" : "no");
  }

  // Heartbeat every 30s
  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    lastHeartbeat = now;
    if (client.connected()) {
      client.publish(TOPIC_HEARTBEAT, "1");
      Serial.println("  heartbeat -> 1");
    }
  }
}
