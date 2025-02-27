import express from "express";
import {
  registerWithEmail,
  verifyEmailOtp,
} from "../controllers/authEmailController.js";

const router = express.Router();

router.post("/sendotp", registerWithEmail);
router.post("/validate", verifyEmailOtp);

export default router;
