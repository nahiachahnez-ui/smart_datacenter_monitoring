import pool from "../config/db.js";

/* ===========================
   LIST KNOWN ESP DEVICES
=========================== */
export const getEspDevices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT esp_id, MAX(created_at) AS last_seen
       FROM sensor_data
       GROUP BY esp_id
       ORDER BY last_seen DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   GET LATEST SENSOR READING
   ?esp_id=ESP32-XXXX  (optional)
=========================== */
export const getLatestSensorData = async (req, res) => {
  const { esp_id } = req.query;
  try {
    const result = esp_id
      ? await pool.query(
          `SELECT * FROM sensor_data WHERE esp_id=$1 ORDER BY created_at DESC LIMIT 1`,
          [esp_id]
        )
      : await pool.query(
          `SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1`
        );

    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   GET HISTORY FOR CHART
   ?esp_id=ESP32-XXXX  (optional)
=========================== */
export const getSensorDataHistory = async (req, res) => {
  const { esp_id } = req.query;
  try {
    const result = esp_id
      ? await pool.query(
          `SELECT * FROM sensor_data WHERE esp_id=$1 ORDER BY created_at DESC LIMIT 50`,
          [esp_id]
        )
      : await pool.query(
          `SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 50`
        );

    res.json(result.rows.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
