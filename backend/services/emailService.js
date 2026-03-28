import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* SEND TECHNICIAN ACCOUNT */

export const sendTechnicianCredentials = async (email, username, password) => {

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Datacenter Technician Account",
    html: `
      <h2>Smart Datacenter Monitoring</h2>

      <p>Your technician account has been created.</p>

      <p><b>Username:</b> ${username}</p>
      <p><b>Password:</b> ${password}</p>

      <p>Please login and change your password.</p>
    `
  });

};

/* SEND ALERT EMAIL */

export const sendAlertEmail = async (email, subject, message) => {

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html: message
  });

};