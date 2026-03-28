import pool from "../config/db.js";
import thresholds from "../config/thresholds.js";
import { createAlert } from "../services/alertService.js";
import { sendAlertEmail } from "../services/emailService.js";
import { detectAnomaly } from "../utils/anomalyDetector.js";

/* ===========================
   CREATE MEASUREMENT + AI
=========================== */
export const createMeasurement = async (req, res) => {
  console.log("📥 Incoming:", req.body);

  const { sensor_id, type, value } = req.body;

  try {
    /* 🔹 VALIDATION */
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      return res.status(400).json({ error: "Invalid value" });
    }

    /* 🔹 1. GET SENSOR INFO */
    const sensorResult = await pool.query(
      `SELECT sensor_uid, location, is_muted, esp_id, gpio_pin 
       FROM sensors WHERE id=$1`,
      [sensor_id]
    );

    if (sensorResult.rows.length === 0) {
      return res.status(404).json({ error: "Sensor not found" });
    }

    const sensor = sensorResult.rows[0];

    /* 🔹 2. GET HISTORY */
    const historyResult = await pool.query(
      `SELECT value FROM measurements
       WHERE sensor_id = $1 AND type = $2
       ORDER BY recorded_at DESC
       LIMIT 30`,
      [sensor_id, type]
    );

    const historyValues = historyResult.rows.map(r =>
      parseFloat(r.value)
    );

    /* 🔹 3. AI DETECTION */
    const aiResult = detectAnomaly(historyValues, numericValue);

    /* 🔹 4. INSERT MEASUREMENT */
    const insertResult = await pool.query(
      `INSERT INTO measurements(sensor_id, type, value, recorded_at)
       VALUES ($1,$2,$3,NOW())
       RETURNING *`,
      [sensor_id, type, numericValue]
    );

    const newMeasurement = insertResult.rows[0];

    let alert = null;

    /* ===========================
       🔇 MUTE SYSTEM
    =========================== */
    if (sensor.is_muted) {
      console.log(`🔇 Sensor ${sensor.sensor_uid} muted → skip alerts`);
    } else {

      /* ===========================
         🔁 PREVENT DUPLICATE ALERTS 🔥
      =========================== */
      const recentAlert = await pool.query(
        `SELECT id FROM alerts
         WHERE sensor_id=$1 AND type=$2 AND status='active'
         ORDER BY created_at DESC
         LIMIT 1`,
        [sensor_id, type]
      );

      const hasActiveAlert = recentAlert.rows.length > 0;

      /* ===========================
         🟡 THRESHOLD ALERT
      =========================== */
      const threshold = thresholds[type];

      if (!hasActiveAlert && threshold && numericValue > threshold) {
        alert = await createAlert(
          `⚠️ Threshold exceeded (${type}) on ${sensor.sensor_uid} (ESP: ${sensor.esp_id}, GPIO: ${sensor.gpio_pin})`,
          "warning",
          sensor.sensor_uid,
          sensor.location,
          sensor_id,
          type
        );
      }

      if (!hasActiveAlert && aiResult.isAnomaly) {
        console.log("AI ANOMALY DETECTED");

        alert = await createAlert(
          `🚨 AI Anomaly (${type}) on ${sensor.sensor_uid} (ESP: ${sensor.esp_id}, GPIO: ${sensor.gpio_pin}) z=${aiResult.zScore.toFixed(2)}`,
          "critical",
          sensor.sensor_uid,
          sensor.location,
          sensor_id,
          type
        );

        await sendAlertEmail(
          `🚨 AI Alert: ${type}`,
          `Sensor: ${sensor.sensor_uid}
ESP: ${sensor.esp_id}
GPIO: ${sensor.gpio_pin}
Value: ${numericValue}
Z-score: ${aiResult.zScore.toFixed(2)}`
        );
      }
    }

    /* ===========================
       📡 WEBSOCKET
    =========================== */
    const io = req.app.get("io");

    io.emit("new-measurement", {
      ...newMeasurement,
      isAnomaly: aiResult.isAnomaly,
      zScore: aiResult.zScore
    });

    if (alert) {
      io.emit("new-alert", alert);
    }

    /* ===========================
       ✅ RESPONSE
    =========================== */
    res.status(201).json({
      measurement: newMeasurement,
      ai: aiResult,
      alert
    });

  } catch (error) {
    console.error(" Measurement Error FULL:", error);
    res.status(500).json({ error: "Failed to create measurement" });
  }
};

/* ===========================
   GET ALL MEASUREMENTS
=========================== */
export const getMeasurements = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM measurements ORDER BY recorded_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   GET BY SENSOR
=========================== */
export const getMeasurementsBySensor = async (req, res) => {
  const { sensorId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM measurements
       WHERE sensor_id = $1
       ORDER BY recorded_at DESC`,
      [sensorId]
    );

    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};