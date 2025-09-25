import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { sendOTP } from "../services/emailService.js";

let otpStore = {}; // you already have this, keep it shared

// Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, aadhaarNumber, phoneNumber } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      aadhaarNumber,
      phoneNumber,
      isVerified: false, // 👈 new field
    });

    // generate OTP
    const otp = generateOTP();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    await sendOTP(email, otp);

    res.status(201).json({
      message: "User registered. Please verify OTP sent to email.",
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Failed to register" });
  }
};

// Verify email OTP
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists in store
    const storedOTP = otpStore[email];
    if (!storedOTP) {
      return res.status(400).json({ message: "No OTP found for this email" });
    }

    // Check if OTP is expired
    if (Date.now() > storedOTP.expires) {
      delete otpStore[email]; // Clean up expired OTP
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update user verification status
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    // Clean up OTP from store
    delete otpStore[email];

    res.json({
      message: "Email verified successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new OTP
    const otp = generateOTP();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    await sendOTP(email, otp);

    res.json({
      message: "OTP resent successfully",
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ 
          message: "Please verify your email via OTP",
          requiresVerification: true,
          email: user.email
        });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      userId: user.id,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Failed to login" });
  }
};
