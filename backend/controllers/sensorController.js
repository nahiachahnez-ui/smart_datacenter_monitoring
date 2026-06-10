import pool from "../config/db.js";

/* ===========================
   CREATE SENSOR
=========================== */

export const createSensor = async (req, res) => {

  const { sensor_uid, type, location, esp_id, gpio_pin } = req.body;

  try {

    const result = await pool.query(
      `INSERT INTO sensors (sensor_uid, type, location, esp_id, gpio_pin)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sensor_uid, type, location, esp_id, gpio_pin]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

    console.error(error); // 🔥 add this for debug

    res.status(500).json({
      error: error.message
    });

  }

};

/* ===========================
   GET ALL SENSORS
=========================== */

export const getSensors = async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM sensors ORDER BY id ASC"
    );

    res.json(result.rows);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


/* ===========================
   UPDATE SENSOR
=========================== */

export const updateSensor = async (req, res) => {

  const { id } = req.params;

  const {
    sensor_uid,
    type,
    location,
    esp_id,
    gpio_pin
  } = req.body;

  try {

    const result = await pool.query(
      `UPDATE sensors
       SET sensor_uid=$1,
           type=$2,
           location=$3,
           esp_id=$4,
           gpio_pin=$5
       WHERE id=$6
       RETURNING *`,
      [sensor_uid, type, location, esp_id, gpio_pin, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Sensor not found" });
    }

    res.json(result.rows[0]);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


/* ===========================
   DELETE SENSOR
=========================== */

export const deleteSensor = async (req, res) => {

  const { id } = req.params;

  try {

    const result = await pool.query(
      "DELETE FROM sensors WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "Sensor not found"
      });

    }

    res.json({
      message: "Sensor deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};