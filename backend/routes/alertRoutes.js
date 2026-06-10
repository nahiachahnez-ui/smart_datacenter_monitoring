import express from "express";
import {
  getAlerts,
  getAlertStats,
  resolveAlert,
  cancelAlert,
  reopenAlert
} from "../controllers/alertController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats",      protect, getAlertStats);
router.get("/",           protect, getAlerts);
router.put("/:id/resolve",protect, resolveAlert);
router.put("/:id/cancel", protect, cancelAlert);
router.put("/:id/reopen", protect, reopenAlert);

export default router;
