import express from "express";
import {
  getLatestSensorData,
  getSensorDataHistory
} from "../controllers/sensorDataController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/latest", protect, getLatestSensorData);
router.get("/history", protect, getSensorDataHistory);

export default router;
