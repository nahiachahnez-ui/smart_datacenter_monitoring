import express from "express";
import {
  getLatestPrediction,
  getRecentPredictions
} from "../controllers/aiPredictionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/latest", protect, getLatestPrediction);
router.get("/", protect, getRecentPredictions);

export default router;
