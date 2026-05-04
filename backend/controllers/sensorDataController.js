import pool from "../config/db.js";

/* ===========================
   GET LATEST SENSOR READING
=========================== */
export const getLatestSensorData = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("sensor_data latest error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   GET RECENT HISTORY (for chart)
=========================== */
export const getSensorDataHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 50`
    );

    // reverse so chart renders oldest → newest
    res.json(result.rows.reverse());
  } catch (error) {
    console.error("sensor_data history error:", error);
    res.status(500).json({ error: error.message });
  }
};
