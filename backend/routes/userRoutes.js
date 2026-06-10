import express from "express";
import {
  getMe,
  getTechnicians,
  createTechnician,
  deleteTechnician,
  toggleTechnician,
  updateTechnician
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMe);
router.get("/technicians", getTechnicians);
router.post("/technicians", createTechnician);
router.delete("/technicians/:id", deleteTechnician);
router.patch("/technicians/:id/toggle", toggleTechnician);
router.put("/technicians/:id", updateTechnician);

export default router;