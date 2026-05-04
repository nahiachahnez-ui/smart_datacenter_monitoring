import express from "express";
import {
  getAlerts,
  getAlertStats,
  resolveAlert,
  cancelAlert,
  reopenAlert
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/stats", getAlertStats);
router.get("/", getAlerts);

router.put("/:id/resolve", resolveAlert);
router.put("/:id/cancel", cancelAlert);
router.put("/:id/reopen", reopenAlert); // 🔥 NEW

export default router;