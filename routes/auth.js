import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  createUserWithToken,
  checkIsTokenValid,
  checkEmail,
  checkPhoneNumber,
} from "../controllers/auth.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", logout);
router.post("/checkToken", checkIsTokenValid);
router.post("/createUserWithToken", createUserWithToken);
router.post("/check-phone", checkPhoneNumber);
router.post("/check-email", checkEmail);

export { router };
