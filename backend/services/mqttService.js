import mqtt from "mqtt";
import pool from "../config/db.js";
import { setMqttStatus } from "../controllers/systemController.js";

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

// Map MQTT topics → buffer keys
const TOPIC_MAP = {
  // Raspberry Pi topics (nexo/)
  "nexo/datacenter/temperature": "temperature",
  "nexo/datacenter/humidity":    "humidity",
  "nexo/datacenter/water":       "water_level",
  "nexo/datacenter/air":         "air_quality",
  "nexo/datacenter/gas":         "gas_detected",
  "nexo/datacenter/dust":        "dust_level",
  "nexo/datacenter/heartbeat":   "heartbeat",

  // Legacy ESP topics (esp1/)
  "esp1/temperature": "temperature",
  "esp1/humidity":    "humidity",
  "esp1/water":       "water_level",
  "esp1/air":         "air_quality",
  "esp1/gas":         "gas_detected",
  "esp1/dust":        "dust_level",
};

const saveSensorData = async (io) => {
  // only save if we have at least temperature or humidity
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

    // emit to dashboard for real-time update
    io.emit("new-sensor-data", saved);

  } catch (err) {
    console.error("Failed to save sensor_data:", err.message);
  }
};

let saveTimer = null;

export const initMQTT = (io) => {
  mqttClient = mqtt.connect("mqtt://localhost:1883");

  mqttClient.on("connect", () => {
    console.log("MQTT connected (backend)");
    setMqttStatus("Connected");

    // subscribe to both Pi and legacy ESP topics
    mqttClient.subscribe("nexo/datacenter/#");
    mqttClient.subscribe("esp1/#");
  });

  mqttClient.on("message", (topic, message) => {
    const value = message.toString();
    console.log("MQTT:", topic, "→", value);

    lastMessageTime = Date.now();

    // forward raw event to any listeners (keeps existing behavior)
    io.emit("mqtt_data", { topic, value });

    const key = TOPIC_MAP[topic];
    if (!key) return;

    sensorBuffer[key] = parseFloat(value);

    // debounce: wait 500ms after last message before saving
    // so we batch all sensors arriving in the same burst
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveSensorData(io), 500);
  });

  mqttClient.on("close", () => {
    console.log("MQTT disconnected");
    setMqttStatus("Disconnected");
  });

  mqttClient.on("error", (err) => {
    console.error("MQTT error:", err.message);
  });
};

export const getGatewayStatus = () => {
  if (!lastMessageTime) return "Offline";
  return Date.now() - lastMessageTime > 10000 ? "Offline" : "Online";
};
