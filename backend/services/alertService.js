import pool from "../config/db.js";

export const createAlert = async (
  message,
  level,
  sensorName,
  location,
  sensorId,
  type
) => {
  const result = await pool.query(
    `INSERT INTO alerts 
    (message, level, status, sensor_name, location, sensor_id, type, created_at)
    VALUES ($1,$2,'active',$3,$4,$5,$6,NOW())
    RETURNING *`,
    [message, level, sensorName, location, sensorId, type]
  );

  return result.rows[0];
};