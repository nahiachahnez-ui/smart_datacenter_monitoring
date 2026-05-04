import pool from "../config/db.js";

/* ===========================
   GET LATEST AI PREDICTION
=========================== */
export const getLatestPrediction = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ai_predictions ORDER BY created_at DESC LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("AI Prediction Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   GET RECENT AI PREDICTIONS (last 50 for chart)
=========================== */
export const getRecentPredictions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM ai_predictions ORDER BY created_at DESC LIMIT 50`
    );

    // reverse so chart goes oldest → newest
    res.json(result.rows.reverse());
  } catch (error) {
    console.error("AI Predictions Error:", error);
    res.status(500).json({ error: error.message });
  }
};
