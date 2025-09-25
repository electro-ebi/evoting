import express from "express";
import { registerUser, loginUser, verifyEmailOTP, resendOTP } from "../controllers/authController.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js"; // phone-based OTP

const router = express.Router();

// Email-based authentication
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email-otp", verifyEmailOTP);
router.post("/resend-otp", resendOTP);

// Phone-based OTP (for additional verification)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
