import jwt from "jsonwebtoken";
import User from "../models/User.js";

import { initializeAdmin } from "../config/firebaseConfig.js";

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token || token === "null") {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const app = await initializeAdmin();
    const decoded = await app.auth().verifyIdToken(token);
    console.log(decoded);
    req.user = await User.findOne({ uid: decoded.uid });
    console.log("set req user", req.user);
    next();
  } catch (err) {
    console.error(err.stack);
    res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
