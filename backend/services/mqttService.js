import mqtt from "mqtt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { setMqttStatus } from "../controllers/systemController.js";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the same CA cert used by the ESP32 and Pi broker
// Place the ca.crt file in backend/config/ca.crt
let caCert = null;
const CA_PATH = path.join(__dirname, "../config/ca.crt");
if (fs.existsSync(CA_PATH)) {
  caCert = fs.readFileSync(CA_PATH);
  console.log("MQTT CA cert loaded");
} else {
  console.warn("MQTT CA cert not found at backend/config/ca.crt — using insecure connection");
}

const BROKER_HOST = process.env.MQTT_BROKER || "192.168.1.8";
const BROKER_PORT = parseInt(process.env.MQTT_PORT || "8883");

let mqttClient;
let lastMessageTime = null;

// Buffer incoming sensor values until we have a full reading to save
let sensorBuffer = {
  temperature:  null,
  humidity:     null,
  water_level:  null,
  air_quality:  null,
  gas_detected: null,
  dust_level:   null,
  heartbeat:    null
};

const TOPIC_MAP = {
  "nexo/datacenter/temperature": "temperature",
  "nexo/datacenter/humidity":    "humidity",
  "nexo/datacenter/water":       "water_level",
  "nexo/datacenter/air":         "air_quality",
  "nexo/datacenter/gas":         "gas_detected",
  "nexo/datacenter/dust":        "dust_level",
  "nexo/datacenter/heartbeat":   "heartbeat",
  // legacy ESP topics
  "esp1/temperature": "temperature",
  "esp1/humidity":    "humidity",
  "esp1/water":       "water_level",
  "esp1/air":         "air_quality",
  "esp1/gas":         "gas_detected",
  "esp1/dust":        "dust_level",
};

const saveSensorData = async (io) => {
  if (sensorBuffer.temperature === null && sensorBuffer.humidity === null) return;

  try {
    const result = await pool.query(
      `INSERT INTO sensor_data
        (temperature, humidity, water_level, air_quality, gas_detected, dust_level, heartbeat)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        sensorBuffer.temperature,
        sensorBuffer.humidity,
        sensorBuffer.water_level,
        sensorBuffer.air_quality,
        sensorBuffer.gas_detected,
        sensorBuffer.dust_level,
        sensorBuffer.heartbeat
      ]
    );

    const saved = result.rows[0];
    console.log("sensor_data saved:", saved.id);
    io.emit("new-sensor-data", saved);

  } catch (err) {
    console.error("Failed to save sensor_data:", err.message);
  }
};

let saveTimer = null;

export const initMQTT = (io) => {
  const options = {
    port: BROKER_PORT,
    rejectUnauthorized: false, // allow self-signed cert
    ...(caCert && { ca: caCert }),
  };

  const protocol = BROKER_PORT === 8883 ? "mqtts" : "mqtt";
  const brokerUrl = `${protocol}://${BROKER_HOST}`;

  console.log(`Connecting to MQTT broker: ${brokerUrl}:${BROKER_PORT}`);

  mqttClient = mqtt.connect(brokerUrl, options);

  mqttClient.on("connect", () => {
    console.log("MQTT connected to Pi broker");
    setMqttStatus("Connected");
    mqttClient.subscribe("nexo/datacenter/#");
    mqttClient.subscribe("esp1/#");
  });

  mqttClient.on("message", (topic, message) => {
    const value = message.toString();
    console.log("MQTT:", topic, "→", value);
    lastMessageTime = Date.now();
    io.emit("mqtt_data", { topic, value });

    const key = TOPIC_MAP[topic];
    if (!key) return;

    sensorBuffer[key] = parseFloat(value);

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveSensorData(io), 500);
  });

  mqttClient.on("close", () => {
    console.log("MQTT disconnected from Pi broker");
    setMqttStatus("Disconnected");
  });

  mqttClient.on("error", (err) => {
    console.error("MQTT error:", err.message);
    setMqttStatus("Disconnected");
  });

  mqttClient.on("offline", () => {
    console.log("MQTT offline — Pi broker unreachable");
    setMqttStatus("Disconnected");
  });
};

export const getGatewayStatus = () => {
  if (!lastMessageTime) return "Offline";
  return Date.now() - lastMessageTime > 10000 ? "Offline" : "Online";
};
