import express from "express";
import {
  getAlerts,
  getAlertStats,
  resolveAlert,
  cancelAlert
} from "../controllers/alertController.js";

const router = express.Router();

/* VERY IMPORTANT*/
router.get("/stats", getAlertStats);

/* NORMAL ROUTES */
router.get("/", getAlerts);
router.put("/:id/resolve", resolveAlert);
router.put("/:id/cancel", cancelAlert);

export default router;