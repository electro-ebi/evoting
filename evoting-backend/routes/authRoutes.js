/**
 * =====================================================
 * 🗳️ Secure E-Voting System
 * =====================================================
 * 
 * @project     Blockchain-Powered Electronic Voting System
 * @author      Ebi
 * @github      https://github.com/electro-ebi
 * @description A secure, transparent, and tamper-proof voting
 *              system with cryptographic authentication, face
 *              verification, and blockchain integration.
 * 
 * @features    - Multi-layer cryptographic security
 *              - Blockchain vote recording
 *              - Face verification
 *              - Real-time results
 *              - Admin dashboard
 * 
 * @license     MIT
 * @year        2025
 * =====================================================
 */


import express from "express";
import { registerUser, loginUser, verifyEmailOTP, resendOTP, requestLoginOTP, verifyLoginOTP } from "../controllers/authController.js";
import { sendOtp, verifyOtp } from "../controllers/otpController.js"; // phone-based OTP
import faceAuthRouter from './faceAuth.js';

const router = express.Router();

// Email-based authentication
router.post("/register", registerUser);
router.post("/login", loginUser);
// Passwordless login via email OTP
router.post("/login-otp/request", requestLoginOTP);
router.post("/login-otp/verify", verifyLoginOTP);
router.post("/verify-email-otp", verifyEmailOTP);
router.post("/resend-otp", resendOTP);

// Phone-based OTP (for additional verification)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Face authentication routes
router.use('/face', faceAuthRouter);

// Endpoint to check if face registration is required
router.get('/check-face-registration', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ requiresFaceRegistration: false });
    }

    const user = await User.findOne({ where: { token } });
    if (!user) {
      return res.status(401).json({ requiresFaceRegistration: false });
    }

    res.status(200).json({ 
      requiresFaceRegistration: !user.faceRegistered 
    });
  } catch (error) {
    console.error('Error checking face registration:', error);
    res.status(500).json({ 
      message: 'Error checking face registration status',
      error: error.message 
    });
  }
});

export default router;
