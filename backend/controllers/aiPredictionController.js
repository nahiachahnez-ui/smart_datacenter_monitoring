import pool from "../config/db.js";

/* ===========================
   GET LATEST AI PREDICTION
   ?esp_id=ESP32-XXXX (optional)
=========================== */
export const getLatestPrediction = async (req, res) => {
  const { esp_id } = req.query;
  try {
    const result = esp_id
      ? await pool.query(
          `SELECT * FROM ai_predictions WHERE esp_id=$1 ORDER BY created_at DESC LIMIT 1`,
          [esp_id]
        )
      : await pool.query(
          `SELECT * FROM ai_predictions ORDER BY created_at DESC LIMIT 1`
        );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error("AI Prediction Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   GET RECENT AI PREDICTIONS
   ?esp_id=ESP32-XXXX (optional)
=========================== */
export const getRecentPredictions = async (req, res) => {
  const { esp_id } = req.query;
  try {
    const result = esp_id
      ? await pool.query(
          `SELECT * FROM ai_predictions WHERE esp_id=$1 ORDER BY created_at DESC LIMIT 50`,
          [esp_id]
        )
      : await pool.query(
          `SELECT * FROM ai_predictions ORDER BY created_at DESC LIMIT 50`
        );

    res.json(result.rows.reverse());
  } catch (error) {
    console.error("AI Predictions Error:", error);
    res.status(500).json({ error: error.message });
  }
};
