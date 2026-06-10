import express from "express";
import {
  createSensor,
  getSensors,
  updateSensor,
  deleteSensor
} from "../controllers/sensorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",      protect, getSensors);
router.post("/",     protect, createSensor);
router.put("/:id",   protect, updateSensor);
router.delete("/:id",protect, deleteSensor);

export default router;
