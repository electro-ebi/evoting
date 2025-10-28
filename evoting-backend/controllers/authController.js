import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { sendOTP, sendLoginOTP } from "../services/emailService.js";

let otpStore = {}; // you already have this, keep it shared

// Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, aadhaarNumber, voterId, phoneNumber } = req.body;

    // Basic required fields
    if (!name || !email || !password || !aadhaarNumber || !voterId) {
      return res.status(400).json({ message: "Name, email, password, Aadhaar and Voter ID are required" });
    }

    // Format validations
    const aadhaarRegex = /^[0-9]{12}$/;
    const epicRegex = /^[A-Z0-9]{6,12}$/i; // EPIC format tolerance
    if (!aadhaarRegex.test(aadhaarNumber)) {
      return res.status(400).json({ message: "Voter ID (Aadhaar) must be a 12-digit number" });
    }
    if (!epicRegex.test(voterId)) {
      return res.status(400).json({ message: "Voter ID (EPIC) must be 6-12 alphanumeric characters" });
    }

    // Uniqueness checks
    const existingByEmail = await User.findOne({ where: { email } });
    if (existingByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const existingByAadhaar = await User.findOne({ where: { aadhaarNumber } });
    if (existingByAadhaar) {
      return res.status(400).json({ message: "Aadhaar already registered" });
    }
    const existingByVoterId = await User.findOne({ where: { voterId } });
    if (existingByVoterId) {
      return res.status(400).json({ message: "Voter ID (EPIC) already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      aadhaarNumber,
      voterId,
      phoneNumber,
      isVerified: false,
    });

    // generate OTP
    const otp = generateOTP();
    otpStore[email] = { otp, expires: Date.now() + 2 * 60 * 1000 }; // 2 minutes
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

// Request login OTP (passwordless login)
export const requestLoginOTP = async (req, res) => {
  try {
    console.log("📧 Login OTP request received for:", req.body.email);
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found:", user.email);

    // Generate OTP and expiry
    const otp = generateOTP();
    const expires = Date.now() + 2 * 60 * 1000; // 2 minutes
    // Store in-memory for now (could also store on user)
    otpStore[email] = { otp, expires };
    console.log("🔑 OTP generated:", otp);

    try {
      await sendLoginOTP(email, otp);
      console.log("✅ Login OTP email sent successfully to:", email);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      throw emailError;
    }

    return res.json({ message: "Login OTP sent to email" });
  } catch (err) {
    console.error("❌ Request login OTP error:", err.message);
    console.error("❌ Full error:", err);
    return res.status(500).json({ 
      message: "Failed to send login OTP",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Verify login OTP and issue JWT
export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const entry = otpStore[email];
    if (!entry) return res.status(400).json({ message: "No OTP requested for this email" });
    if (Date.now() > entry.expires) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }
    if (String(entry.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear used OTP
    delete otpStore[email];

    // If you require verified email before login, enforce here
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email via OTP", requiresVerification: true, email });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login successful",
      token,
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Verify login OTP error:", err);
    return res.status(500).json({ message: "Failed to verify login OTP" });
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
    otpStore[email] = { otp, expires: Date.now() + 2 * 60 * 1000 }; // 2 minutes
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
