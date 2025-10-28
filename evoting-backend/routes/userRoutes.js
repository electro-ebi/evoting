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
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getUsersWithVotingStatus, getElectionVoteCount } from "../controllers/userController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ---- REGISTER ----
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      aadhaarNumber,
      phoneNumber,
      faceHash,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password, // TODO: hash in production
      aadhaarNumber: aadhaarNumber || null,
      phoneNumber: phoneNumber || null,
      faceHash: faceHash || null,
      role: role || "voter",
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      userId: user.id,
      name: user.name,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- LOGIN ----
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ where: { email } });
    if (!user || user.password !== password)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      userId: user.id,
      name: user.name,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---- ADMIN: GET USERS WITH VOTING STATUS ----
router.get("/admin/election/:electionId/users-status", authenticateToken, requireAdmin, getUsersWithVotingStatus);

// ---- GET ELECTION VOTE COUNT (PUBLIC) ----
router.get("/election/:electionId/vote-count", getElectionVoteCount);

export default router;
