import pool from "../config/db.js";

/* ===========================
   GET ALL ALERTS
=========================== */
export const getAlerts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM alerts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET ALERTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   ALERT STATS
=========================== */
export const getAlertStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active') AS active,
        COUNT(*) FILTER (WHERE status = 'resolved') AS resolved,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
        COUNT(*) AS total
      FROM alerts
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("STATS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   RESOLVE ALERT
=========================== */
export const resolveAlert = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE alerts
       SET status='resolved',
           resolved_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("RESOLVE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   CANCEL ALERT (MUTE)
=========================== */
export const cancelAlert = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE alerts
       SET status='cancelled',
           resolved_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("CANCEL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   REOPEN ALERT (🔥 NEW)
=========================== */
export const reopenAlert = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE alerts
       SET status='active',
           resolved_at=NULL
       WHERE id=$1
       RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("REOPEN ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};