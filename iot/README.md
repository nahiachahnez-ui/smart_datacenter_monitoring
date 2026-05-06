# NEXO ESP32 IoT Node

Arduino IDE sketch for the ESP32 sensor node.

## Arduino IDE Setup

1. Install **Arduino IDE 2.x** from https://www.arduino.cc/en/software
2. Add ESP32 board support:
   - Go to **File → Preferences**
   - Add this URL to "Additional boards manager URLs":
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Go to **Tools → Board → Boards Manager**, search "esp32", install **esp32 by Espressif**
3. Install libraries via **Tools → Manage Libraries**:
   - `PubSubClient` by Nick O'Leary
   - `DHT sensor library` by Adafruit
   - `Adafruit Unified Sensor` by Adafruit
   - `ArduinoJson` by Benoit Blanchon

## Open the Sketch

Open `iot/nexo_esp32/nexo_esp32.ino` in Arduino IDE.

## Configure Before Uploading

Edit these lines at the top of the sketch:

```cpp
const char* WIFI_SSID     = "globalnet2022";
const char* WIFI_PASSWORD = "272664272664";
const char* MQTT_BROKER   = "192.168.1.8";  
```

## Board Settings

- **Board**: ESP32 Dev Module
- **Port**: whichever COM port your ESP32 appears on
- **Upload Speed**: 115200

## Wiring

| Sensor              | ESP32 Pin | Notes                       |
|---------------------|-----------|-----------------------------|
| DHT11 DATA          | GPIO 4    | 10kΩ pull-up to 3.3V        |
| MQ-135 AOUT         | GPIO 34   | Analog input only           |
| MQ-5 AOUT           | GPIO 35   | Analog input only           |
| GP2Y1014 LED pin    | GPIO 16   | Digital output (active LOW) |
| GP2Y1014 AOUT       | GPIO 32   | Analog input                |
| Water sensor AOUT   | GPIO 33   | Analog input                |

## MQTT Topics Published

| Topic                          | Value       | Interval |
|-------------------------------|-------------|----------|
| `nexo/datacenter/temperature` | °C          | 5s       |
| `nexo/datacenter/humidity`    | %           | 5s       |
| `nexo/datacenter/air`         | ADC (0-4095)| 5s       |
| `nexo/datacenter/gas`         | ADC (0-4095)| 5s       |
| `nexo/datacenter/dust`        | µg/m³       | 5s       |
| `nexo/datacenter/water`       | 0-100%      | 5s       |
| `nexo/datacenter/heartbeat`   | 1           | 30s      |

## Verify It Works

Open **Tools → Serial Monitor** at 115200 baud after uploading.
You should see WiFi connecting, then MQTT connecting, then sensor values every 5s.
