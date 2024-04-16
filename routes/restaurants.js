import express from "express";
import {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "../controllers/restaurants.js"; // Ensure to add the file extension ".js" for ES module imports

// Include other resource routers
// import appointmentRouter from "./appointments.js"; // Ensure to add the file extension ".js" for ES module imports

const router = express.Router();

// const { protect, authorize } = require("../middleware/auth");

//re-route into other resourc routers
// router.use("/:restaurantId/appointments/", appointmentRouter);

router
  .route("/")
  .get(getRestaurants)
  .post(createRestaurant);
//  .post(protect, authorize("admin"), createRestaurant);
router
  .route("/:id")
  .get(getRestaurant)
  .put(updateRestaurant)
  .delete(deleteRestaurant);
//  .put(protect, authorize("admin"), updateRestaurant)
// .delete(protect, authorize("admin"), deleteRestaurant);

export { router };
