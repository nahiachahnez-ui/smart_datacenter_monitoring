import express from "express";
import {
  createSensor,
  getSensors,
  updateSensor,
  deleteSensor
} from "../controllers/sensorController.js";

const router = express.Router();

router.get("/", getSensors);
router.post("/", createSensor);
router.put("/:id", updateSensor);
router.delete("/:id", deleteSensor);

export default router;