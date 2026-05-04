import pool from "../config/db.js";

import { getGatewayStatus } from "../services/mqttService.js";

let mqttStatus = "Disconnected";

export const setMqttStatus = (status) => {
  mqttStatus = status;
};



export const getSystemStatus = async (req, res) => {
  try {
    res.json({
      backend: "Running",
      database: "Connected",

      // 🔥 REAL VALUES NOW
      mqtt: mqttStatus,
      gateway: getGatewayStatus()
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};



export const getSensors = async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT 
        s.id,
        s.sensor_uid,
        s.type,
        s.location,

        CASE
          WHEN MAX(m.created_at) > NOW() - INTERVAL '2 minutes'
          THEN 'online'
          ELSE 'offline'
        END AS status,

        MAX(m.created_at) AS last_seen

      FROM sensors s

      LEFT JOIN measurements m
      ON s.id = m.sensor_id

      GROUP BY s.id

      ORDER BY s.id
    `)

    res.json(result.rows)

  } catch (error) {

    res.status(500).json({ error: error.message })

  }

};