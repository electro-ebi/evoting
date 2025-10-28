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


import { generateVotingKey, generateConfirmationKey } from "../utils/cryptoKeys.js";
import VotingKey from "../models/VotingKey.js";
import User from "../models/User.js";
import Election from "../models/Election.js";

// Simple secure voting controller for testing
export const simpleRequestVotingKey = async (req, res) => {
  try {
    const { email, electionId } = req.body;
    const userId = req.user.id;

    console.log("🔍 Request voting key:", { email, electionId, userId });

    // 1. Validate user and election
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const election = await Election.findByPk(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    // 2. Generate Primary Key
    const primaryKey = generateVotingKey();
    const keyExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log("🔑 Generated primary key:", primaryKey);

    // 3. Store Key in DB
    const votingKeyRecord = await VotingKey.create({
      userId,
      electionId,
      primaryKey,
      keyExpiry,
      status: "generated",
    });

    console.log("💾 Voting key stored:", votingKeyRecord.id);

    res.status(200).json({
      success: true,
      message: "Primary voting key generated successfully",
      primaryKey: primaryKey, // For testing - in production, this would be sent via email
      status: votingKeyRecord.status,
      keyExpiry: votingKeyRecord.keyExpiry,
    });
  } catch (error) {
    console.error("❌ Simple Request Voting Key Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate voting key", 
      error: error.message 
    });
  }
};

export const simpleVerifyPrimaryKey = async (req, res) => {
  try {
    const { primaryKey, electionId } = req.body;
    const userId = req.user.id;

    console.log("🔍 Verify primary key:", { primaryKey, electionId, userId });

    // 1. Find the voting key record
    const votingKeyRecord = await VotingKey.findOne({ 
      where: { userId, electionId } 
    });

    if (!votingKeyRecord) {
      return res.status(404).json({ 
        success: false, 
        message: "No voting key request found for this election." 
      });
    }

    // 2. Validate Primary Key and Expiry
    if (votingKeyRecord.primaryKey !== primaryKey) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid primary key." 
      });
    }

    if (Date.now() > votingKeyRecord.keyExpiry) {
      votingKeyRecord.status = "expired";
      await votingKeyRecord.save();
      return res.status(400).json({ 
        success: false, 
        message: "Primary key has expired. Please request a new one." 
      });
    }

    // 3. Generate Confirmation Key
    const confirmationKey = generateConfirmationKey();
    const confirmationExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 4. Update record with Confirmation Key
    votingKeyRecord.confirmationKey = confirmationKey;
    votingKeyRecord.confirmationKeyExpiry = confirmationExpiry;
    votingKeyRecord.status = "confirmed";
    await votingKeyRecord.save();

    console.log("✅ Primary key verified, confirmation key generated");

    res.status(200).json({
      success: true,
      message: "Primary key verified. Confirmation key generated.",
      confirmationKey: confirmationKey, // For testing - in production, this would be sent via email
      status: votingKeyRecord.status,
      confirmationExpiry: votingKeyRecord.confirmationKeyExpiry,
    });
  } catch (error) {
    console.error("❌ Simple Verify Primary Key Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify primary key", 
      error: error.message 
    });
  }
};
