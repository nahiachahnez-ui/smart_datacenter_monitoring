import express from "express";
import {
  getEspDevices,
  getLatestSensorData,
  getSensorDataHistory
} from "../controllers/sensorDataController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/devices", protect, getEspDevices);
router.get("/latest",  protect, getLatestSensorData);
router.get("/history", protect, getSensorDataHistory);

export default router;
