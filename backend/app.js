import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";

import sensorRoutes from "./routes/sensorRoutes.js";
import measurementRoutes from "./routes/measurementRoutes.js";

import alertRoutes from "./routes/alertRoutes.js";
import userRoutes from "./routes/userRoutes.js";
const app = express();

/* ========================
   Middlewares globaux
======================== */
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/api/users", userRoutes);
/* ========================
   Routes publiques
======================== */
app.get("/", (req, res) => {
  res.json({ message: "Smart Datacenter API running 🚀" });
});
app.get("/test", (req, res) => {
  res.json({ message: "Test route works" });
});
/* Auth routes (login/register) */
app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/alerts", alertRoutes);
/* ========================
   Route protégée (TEST)
======================== */
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route ",
    user: req.user
  });
});

export default app;