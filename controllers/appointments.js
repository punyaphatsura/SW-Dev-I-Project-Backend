import Restaurant from "../models/Restaurant.js";
import Appointment from "../models/Appointment.js";

export const getAppointments = async (req, res, next) => {
  let query;
  try {
    if (req.user.role !== "admin") {
      console.log("here");
      query = Appointment.find({ user: req.user._id }).populate({
        path: "restaurant",
        select: "name province tel opentime closetime",
      });
    } else {
      console.log();
      if (req.params.restaurantId) {
        query = Appointment.find({
          restaurant: req.params.restaurantId,
        }).populate({
          path: "restaurant",
          select: "name province tel opentime closetime",
        });
      } else {
        query = Appointment.find().populate({
          path: "restaurant",
          select: "name province tel opentime closetime",
        });
      }
    }

    const appointments = await query;
    console.log("--->", appointments);
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot find Appointment",
    });
  }
};

export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: "restaurant",
      select: "name description tel opentime closetime",
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Cannot find Appointment",
    });
  }
};

export const addAppointment = async (req, res, next) => {
  try {
    req.body.restaurant = req.params.restaurantId;

    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: `No restaurant with the id of ${req.params.restaurantId}`,
      });
    }

    req.body.user = req.user._id;

    const existedAppointments = await Appointment.find({ user: req.user.id });

    if (existedAppointments.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 appointments.`,
      });
    }

    const appointment = await Appointment.create(req.body);
    return res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Cannot create Appointment",
    });
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment.`,
      });
    }
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot update Appointment",
    });
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this appointment.`,
      });
    }

    await appointment.deleteOne();
    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Cannot delete Appointment",
    });
  }
};
