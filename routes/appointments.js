import express from "express";
import {
  addAppointment,
  deleteAppointment,
  getAppointment,
  getAppointments,
  updateAppointment,
} from "../controllers/appointments.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protect, getAppointments)
  .post(protect, authorize("admin", "user"), addAppointment);
router
  .route("/:id")
  .get(protect, getAppointment)
  .put(protect, authorize("admin", "user"), updateAppointment)
  .delete(protect, authorize("admin", "user"), deleteAppointment);

export { router };
