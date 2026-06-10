import pool from "../config/db.js";
import { getGatewayStatus } from "../services/mqttService.js";

let mqttStatus = "Disconnected";

export const setMqttStatus = (status) => {
  mqttStatus = status;
};

export const getSystemStatus = async (req, res) => {
  // Check DB with a real query
  let dbStatus = "Connected";
  try {
    await pool.query("SELECT 1");
  } catch {
    dbStatus = "Disconnected";
  }

  res.json({
    backend:  "Running",
    database: dbStatus,
    mqtt:     mqttStatus,
    gateway:  getGatewayStatus(),
  });
};
