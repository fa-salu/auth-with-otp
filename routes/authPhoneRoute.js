import express from "express";
import {
  login,
  sendOtpController,
  validateOtpController,
} from "../controllers/authPhoneController.js";

const router = express.Router();

router.post("/sendotp", sendOtpController);
router.post("/validateOtp", validateOtpController);
router.post("/login", login);

export default router;
