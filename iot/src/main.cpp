#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// =============================================
// CONFIGURATION — update these
// =============================================

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Raspberry Pi or broker IP on your local network
const char* MQTT_BROKER   = "192.168.1.x";
const int   MQTT_PORT     = 1883;
const char* MQTT_CLIENT   = "esp32-nexo";

// =============================================
// PIN DEFINITIONS
// =============================================

#define DHT_PIN         4       // DHT11 data pin
#define DHT_TYPE        DHT11

#define MQ135_PIN       34      // MQ-135 analog pin (air quality)
#define MQ5_PIN         35      // MQ-5 analog pin (gas)

// GP2Y1014AU0F dust sensor
#define DUST_LED_PIN    16      // LED drive pin (digital)
#define DUST_AOUT_PIN   32      // analog output pin

// Water level sensor
#define WATER_PIN       33      // analog pin

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

// =============================================
// GLOBALS
// =============================================

DHT         dht(DHT_PIN, DHT_TYPE);
WiFiClient  wifiClient;
PubSubClient mqtt(wifiClient);

unsigned long lastPublish   = 0;
const long    PUBLISH_INTERVAL = 5000;   // publish every 5 seconds

unsigned long lastHeartbeat = 0;
const long    HEARTBEAT_INTERVAL = 30000; // heartbeat every 30 seconds

// =============================================
// WIFI
// =============================================

void connectWiFi() {
    Serial.print("Connecting to WiFi");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.print("WiFi connected — IP: ");
    Serial.println(WiFi.localIP());
}

// =============================================
// MQTT
// =============================================

void connectMQTT() {
    while (!mqtt.connected()) {
        Serial.print("Connecting to MQTT broker...");

        if (mqtt.connect(MQTT_CLIENT)) {
            Serial.println(" connected");
        } else {
            Serial.print(" failed, rc=");
            Serial.print(mqtt.state());
            Serial.println(" — retrying in 3s");
            delay(3000);
        }
    }
}

void publishFloat(const char* topic, float value, int decimals = 1) {
    char buf[16];
    dtostrf(value, 4, decimals, buf);
    mqtt.publish(topic, buf);
    Serial.printf("  %s → %s\n", topic, buf);
}

void publishInt(const char* topic, int value) {
    char buf[16];
    itoa(value, buf, 10);
    mqtt.publish(topic, buf);
    Serial.printf("  %s → %s\n", topic, buf);
}

// =============================================
// SENSOR READS
// =============================================

float readDustDensity() {
    // GP2Y1014AU0F timing: pulse LED for 280µs, read after 280µs, off after 40µs
    digitalWrite(DUST_LED_PIN, LOW);   // LED ON (active low)
    delayMicroseconds(280);
    int raw = analogRead(DUST_AOUT_PIN);
    delayMicroseconds(40);
    digitalWrite(DUST_LED_PIN, HIGH);  // LED OFF
    delayMicroseconds(9680);

    // Convert ADC (0-4095 on ESP32 12-bit) to voltage then to µg/m³
    float voltage = raw * (3.3f / 4095.0f);
    float density = (voltage - 0.6f) * 170.0f;  // datasheet linear approximation
    return max(density, 0.0f);
}

int readWaterLevel() {
    // Raw ADC 0-4095 → map to 0-100%
    int raw = analogRead(WATER_PIN);
    return map(raw, 0, 4095, 0, 100);
}

int readAirQuality() {
    // MQ-135: higher raw value = worse air quality
    return analogRead(MQ135_PIN);
}

int readGas() {
    // MQ-5: higher raw value = more gas detected
    return analogRead(MQ5_PIN);
}

// =============================================
// SETUP
// =============================================

void setup() {
    Serial.begin(115200);
    Serial.println("\n=== NEXO ESP32 IoT Node ===");

    pinMode(DUST_LED_PIN, OUTPUT);
    digitalWrite(DUST_LED_PIN, HIGH); // LED off initially

    dht.begin();
    connectWiFi();

    mqtt.setServer(MQTT_BROKER, MQTT_PORT);
    connectMQTT();

    Serial.println("Ready — publishing every 5s");
}

// =============================================
// LOOP
// =============================================

void loop() {
    // keep MQTT alive
    if (!mqtt.connected()) {
        connectMQTT();
    }
    mqtt.loop();

    unsigned long now = millis();

    // publish sensor data
    if (now - lastPublish >= PUBLISH_INTERVAL) {
        lastPublish = now;

        Serial.println("--- Publishing ---");

        // DHT11
        float temp = dht.readTemperature();
        float hum  = dht.readHumidity();

        if (!isnan(temp)) publishFloat(TOPIC_TEMP,     temp);
        if (!isnan(hum))  publishFloat(TOPIC_HUMIDITY, hum);

        // Dust
        float dust = readDustDensity();
        publishFloat(TOPIC_DUST, dust);

        // Water
        int water = readWaterLevel();
        publishInt(TOPIC_WATER, water);

        // Air quality (MQ-135)
        int air = readAirQuality();
        publishInt(TOPIC_AIR, air);

        // Gas (MQ-5)
        int gas = readGas();
        publishInt(TOPIC_GAS, gas);
    }

    // heartbeat
    if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
        lastHeartbeat = now;
        mqtt.publish(TOPIC_HEARTBEAT, "1");
        Serial.println("  heartbeat → 1");
    }
}
