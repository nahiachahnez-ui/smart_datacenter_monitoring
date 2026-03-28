import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

/* ===========================
   REGISTER
=========================== */

export const register = async (req, res) => {

  const { username, email, password, role } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const result = await pool.query(
      `INSERT INTO users
      (username, email, password_hash, role, verification_token, email_verified)
      VALUES ($1,$2,$3,$4,$5,false)
      RETURNING id, username`,
      [username, email, hashedPassword, role, verificationToken]
    );

    /* SEND EMAIL (OPTIONAL FEATURE) */

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const verificationLink =
      `http://localhost:5000/api/auth/verify/${verificationToken}`;

    await transporter.sendMail({
      to: email,
      subject: "Verify your Smart Datacenter account",
      html: `
        <h2>Smart Datacenter Monitoring</h2>
        <p>You can verify your email (optional):</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `
    });

    res.status(201).json({
      message: "User registered successfully",
      verificationToken
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};

/* ===========================
   LOGIN
=========================== */

export const login = async (req, res) => {

  const { username, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email_verified: user.email_verified
      }
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};

/* ===========================
   EMAIL VERIFICATION
=========================== */

export const verifyEmail = async (req, res) => {

  const { token } = req.params;

  try {

    const result = await pool.query(
      `UPDATE users
       SET email_verified = true,
           verification_token = NULL
       WHERE verification_token = $1
       RETURNING id`,
      [token]
    );

    if (result.rowCount === 0) {

      return res.redirect(
        "http://localhost:5173/verify-failed"
      );

    }

    return res.redirect(
      "http://localhost:5173/verify-success"
    );

  } catch (err) {

    res.redirect("http://localhost:5173/verify-failed");

  }

};