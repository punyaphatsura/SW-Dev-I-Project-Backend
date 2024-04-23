import express from "express";
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurants.js"; // Ensure to add the file extension ".js" for ES module imports

// Include other resource routers
import appointmentRouter from "./appointments.js"; // Ensure to add the file extension ".js" for ES module imports
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

//re-route into other resourc routers
// router.use("/:restaurantId/appointments/", appointmentRouter);

router.route("/")
  .get(getRestaurants)
  .post(protect, authorize("admin"), createRestaurant);
router
  .route("/:id")
  .get(getRestaurant)
  .put(protect, authorize("admin"), updateRestaurant)
  .delete(protect, authorize("admin"), deleteRestaurant);

export { router };
