import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendTechnicianCredentials } from "../services/emailService.js";
/* ===========================
   GET TECHNICIANS
=========================== */

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
       WHERE role = 'technician'
       ORDER BY id DESC`
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: error.message });

  }

};

/* ===========================
   CREATE TECHNICIAN
=========================== */

export const createTechnician = async (req, res) => {

  const { first_name, last_name, email, phone } = req.body;

  try {

    if (!first_name || !last_name || !email) {

      return res.status(400).json({
        message: "Missing required fields"
      });

    }

    /* generate username */

    const username = email.split("@")[0];

    /* generate random password */

    const password = crypto.randomBytes(4).toString("hex");

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (username,password_hash,role,email,active,first_name,last_name,phone)
      VALUES ($1,$2,'technician',$3,true,$4,$5,$6)
      RETURNING id,first_name,last_name,email,phone,role,active,created_at
      `,
      [username, hashed, email, first_name, last_name, phone]
    );

    /* send email */

    await sendTechnicianCredentials(email, username, password);

    res.json(result.rows[0]);

  } catch(error){

    console.error(error);

    res.status(500).json({
      error:"Failed to create technician"
    });

  }

};

/* ===========================
   TOGGLE TECHNICIAN STATUS
=========================== */

export const toggleTechnician = async (req,res)=>{

  const { id } = req.params;

  try{

    const result = await pool.query(
      `UPDATE users
       SET active = NOT active
       WHERE id=$1 AND role='technician'
       RETURNING active`,
      [id]
    );

    res.json(result.rows[0]);

  }catch(error){

    console.error(error);
    res.status(500).json({error:error.message});

  }

}

/* ===========================
   DELETE TECHNICIAN
=========================== */

export const deleteTechnician = async (req, res) => {

  const { id } = req.params;

  try {

    await pool.query(
      "DELETE FROM users WHERE id=$1 AND role='technician'",
      [id]
    );

    res.json({ message: "Technician removed" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: error.message });

  }

};

/* ===========================
   UPDATE TECHNICIAN
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
      [first_name,last_name,email,phone,role,id]
    );

    res.json(result.rows[0]);

  }catch(error){

    res.status(500).json({error:error.message});

  }

};