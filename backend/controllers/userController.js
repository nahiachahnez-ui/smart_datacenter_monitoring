import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendTechnicianCredentials } from "../services/emailService.js";

/* ===========================
   GET CURRENT USER (ME)
=========================== */

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, first_name, last_name, email, phone, role, active, email_verified, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTechnicians = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        active,
        created_at
       FROM users
       WHERE role IN ('technician', 'admin')
       ORDER BY id DESC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ===========================
   CREATE USER (TECH / ADMIN)
=========================== */

export const createTechnician = async (req, res) => {

  const { first_name, last_name, email, phone, role } = req.body;

  try {

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const username = email.split("@")[0];

    const password = crypto.randomBytes(4).toString("hex");
    const hashed = await bcrypt.hash(password, 10);

    // 🔥 SAFE ROLE HANDLING
    const safeRole = role === "admin" ? "admin" : "technician";

    const result = await pool.query(
      `
      INSERT INTO users
      (username,password_hash,role,email,active,first_name,last_name,phone)
      VALUES ($1,$2,$3,$4,true,$5,$6,$7)
      RETURNING id,first_name,last_name,email,phone,role,active,created_at
      `,
      [
        username,
        hashed,
        safeRole,
        email,
        first_name,
        last_name,
        phone
      ]
    );

    // 🔥 SAFE EMAIL (NO CRASH)
    try {
      await sendTechnicianCredentials(email, username, password);
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    res.json(result.rows[0]);

  } catch(error){
    console.error(error);
    res.status(500).json({
      error:"Failed to create user"
    });
  }
};

/* ===========================
   TOGGLE USER STATUS
=========================== */

export const toggleTechnician = async (req,res)=>{
  const { id } = req.params;

  try{
    const result = await pool.query(
      `UPDATE users
       SET active = NOT active
       WHERE id=$1
       RETURNING active`,
      [id]
    );

    res.json(result.rows[0]);

  }catch(error){
    console.error(error);
    res.status(500).json({error:error.message});
  }
};

/* ===========================
   DELETE USER
=========================== */

export const deleteTechnician = async (req, res) => {

  const { id } = req.params;

  try {

    await pool.query(
      "DELETE FROM users WHERE id=$1",
      [id]
    );

    res.json({ message: "User removed" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: error.message });

  }

};

/* ===========================
   UPDATE USER
=========================== */

export const updateTechnician = async (req,res)=>{

  const { id } = req.params;

  const {
    first_name,
    last_name,
    email,
    phone,
    role
  } = req.body;

  try{

    const safeRole = role === "admin" ? "admin" : "technician";

    const result = await pool.query(
      `
      UPDATE users
      SET
        first_name=$1,
        last_name=$2,
        email=$3,
        phone=$4,
        role=$5
      WHERE id=$6
      RETURNING id,first_name,last_name,email,phone,role,active
      `,
      [first_name,last_name,email,phone,safeRole,id]
    );

    res.json(result.rows[0]);

  }catch(error){
    console.error(error);
    res.status(500).json({error:error.message});
  }

};