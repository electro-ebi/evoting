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


import User from "../models/User.js";
import { generateOTP } from "../utils/otpGenerator.js";

// Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    // For now just log (later connect SMS service like Twilio or msg91)
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP after success
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: error.message });
  }
};
