import express from "express";
import {
  createMeasurement,
  getMeasurements,
  getLatestMeasurements,
  getMeasurementsBySensor
} from "../controllers/measurementController.js";

const router = express.Router();

router.post("/", createMeasurement);
router.get("/latest", getLatestMeasurements);
router.get("/", getMeasurements);
router.get("/:sensorId", getMeasurementsBySensor);

export default router;