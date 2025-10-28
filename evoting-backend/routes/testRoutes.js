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
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Test secure voting key generation
router.get("/test-key-generation", authenticate, async (req, res) => {
  try {
    const { generateVotingKey } = await import("../utils/cryptoKeys.js");
    const testKey = generateVotingKey();
    
    res.json({
      success: true,
      message: "Key generation test successful",
      testKey: testKey,
      keyLength: testKey.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Key generation test failed",
      error: error.message
    });
  }
});

// Test database connection
router.get("/test-db", async (req, res) => {
  try {
    const { sequelize } = await import("../models/index.js");
    await sequelize.authenticate();
    
    res.json({
      success: true,
      message: "Database connection successful"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

export default router;
