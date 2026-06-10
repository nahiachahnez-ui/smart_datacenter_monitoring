import mqtt from "mqtt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { setMqttStatus } from "../controllers/systemController.js";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let caCert = null;
const CA_PATH = path.join(__dirname, "../config/ca.crt");
if (fs.existsSync(CA_PATH)) {
  caCert = fs.readFileSync(CA_PATH);
  console.log("MQTT CA cert loaded");
} else {
  console.warn("MQTT CA cert not found — using insecure connection");
}

const BROKER_HOST = process.env.MQTT_BROKER || "192.168.1.8";
const BROKER_PORT = parseInt(process.env.MQTT_PORT || "8883");

let mqttClient;
let lastMessageTime = null;
let ioRef = null; // keep reference to emit real-time status changes
let gatewayOnline = false; // true when heartbeat received, false on broker disconnect

// Per-ESP buffer: espId → { field: value }
const espBuffers = {};
const espTimers  = {};

const TOPIC_MAP = {
  "nexo/datacenter/temperature": "temperature",
  "nexo/datacenter/humidity":    "humidity",
  "nexo/datacenter/water":       "water_level",
  "nexo/datacenter/air":         "air_quality",
  "nexo/datacenter/gas":         "gas_detected",
  "nexo/datacenter/dust":        "dust_level",
  "nexo/datacenter/vibration":   "vibration_level",
  "nexo/datacenter/heartbeat":   "heartbeat",
  // legacy
  "esp1/temperature": "temperature",
  "esp1/humidity":    "humidity",
  "esp1/water":       "water_level",
  "esp1/air":         "air_quality",
  "esp1/gas":         "gas_detected",
  "esp1/dust":        "dust_level",
};

// Track the last known esp_id from the current burst
let currentEspId = "unknown";

const saveSensorData = async (io, espId, buffer) => {
  if (buffer.temperature === undefined && buffer.humidity === undefined) return;

  try {
    const result = await pool.query(
      `INSERT INTO sensor_data
        (esp_id, temperature, humidity, water_level, air_quality,
         gas_detected, dust_level, vibration_level, heartbeat)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        espId,
        buffer.temperature    ?? null,
        buffer.humidity       ?? null,
        buffer.water_level    ?? null,
        buffer.air_quality    ?? null,
        buffer.gas_detected   ?? null,
        buffer.dust_level     ?? null,
        buffer.vibration_level?? null,
        buffer.heartbeat      ?? null,
      ]
    );

    const saved = result.rows[0];
    console.log(`sensor_data saved [${espId}]:`, saved.id);
    io.emit("new-sensor-data", saved);

  } catch (err) {
    console.error("Failed to save sensor_data:", err.message);
  }
};

export const initMQTT = (io) => {
  ioRef = io;
  const options = {
    port: BROKER_PORT,
    rejectUnauthorized: false,
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

    // Capture ESP ID
    if (topic === "nexo/datacenter/esp_id") {
      currentEspId = value.trim();
      return;
    }

    const key = TOPIC_MAP[topic];
    if (!key) return;

    // Use per-ESP buffer
    const espId = currentEspId;
    if (!espBuffers[espId]) espBuffers[espId] = {};
    espBuffers[espId][key] = parseFloat(value);

    // Debounce save per ESP
    clearTimeout(espTimers[espId]);
    espTimers[espId] = setTimeout(() => {
      const buf = { ...espBuffers[espId] };
      espBuffers[espId] = {};
      saveSensorData(io, espId, buf);
    }, 500);
  });

  mqttClient.on("close",   () => { console.log("MQTT disconnected"); setMqttStatus("Disconnected"); });
  mqttClient.on("error",   (err) => { console.error("MQTT error:", err.message); setMqttStatus("Disconnected"); });
  mqttClient.on("offline", () => { console.log("MQTT offline"); setMqttStatus("Disconnected"); });
};

export const getGatewayStatus = () => {
  if (!lastMessageTime) return "Offline";
  return Date.now() - lastMessageTime > 60000 ? "Offline" : "Online";
};
