import pool from "../config/db.js";

/* ===========================
   CREATE SENSOR
=========================== */

export const createSensor = async (req, res) => {

  const { sensor_uid, type, location } = req.body;

  try {

    const result = await pool.query(
      `INSERT INTO sensors (sensor_uid, type, location)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [sensor_uid, type, location]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {

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
  const { type, location, status } = req.body;

  try {

    const result = await pool.query(
      `UPDATE sensors
       SET type=$1, location=$2, status=$3
       WHERE id=$4
       RETURNING *`,
      [type, location, status, id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        message: "Sensor not found"
      });

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