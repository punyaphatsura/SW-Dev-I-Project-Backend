const express = require("express");
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurants");

//include other resource routers
const appointmentRouter = require("./appointments");

const router = express.Router();

// const { protect, authorize } = require("../middleware/auth");

//re-route into other resourc routers
router.use("/:restaurantId/appointments/", appointmentRouter);

router
  .route("/")
  .get(getRestaurants)
  .post(protect, authorize("admin"), createRestaurant);
router
  .route("/:id")
  .get(getRestaurant)
  .put(protect, authorize("admin"), updateRestaurant)
  .delete(protect, authorize("admin"), deleteRestaurant);

module.exports = router;
