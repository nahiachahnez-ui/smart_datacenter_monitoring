import express from "express";
import pool from "../config/db.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===========================
   GET ALL ALERTS
=========================== */
router.get(
  "/",
  protect,
  authorize("admin", "technician"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM alerts ORDER BY created_at DESC"
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* ===========================
   GET ACTIVE ALERTS
=========================== */
router.get(
  "/active",
  protect,
  authorize("admin", "technician"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM alerts WHERE status = 'active' ORDER BY created_at DESC"
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* ===========================
   GET RESOLVED ALERT HISTORY
=========================== */
router.get(
  "/history",
  protect,
  authorize("admin", "technician"),
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM alerts WHERE status = 'resolved' ORDER BY resolved_at DESC"
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* ===========================
   DASHBOARD STATS
=========================== */
router.get(
  "/stats",
  protect,
  authorize("admin", "technician"),
  async (req, res) => {
    try {
      const total = await pool.query("SELECT COUNT(*) FROM alerts");
      const active = await pool.query(
        "SELECT COUNT(*) FROM alerts WHERE status='active'"
      );
      const resolved = await pool.query(
        "SELECT COUNT(*) FROM alerts WHERE status='resolved'"
      );

      res.json({
        total: parseInt(total.rows[0].count),
        active: parseInt(active.rows[0].count),
        resolved: parseInt(resolved.rows[0].count),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* ===========================
   RESOLVE ALERT
=========================== */
router.patch(
  "/:id/resolve",
  protect,
  authorize("admin", "technician"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        `UPDATE alerts
         SET status = 'resolved',
             resolved_at = CURRENT_TIMESTAMP,
             resolved_by = $1
         WHERE id = $2
         RETURNING *`,
        [req.user.id, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Alert not found" });
      }

      res.json(result.rows[0]);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;