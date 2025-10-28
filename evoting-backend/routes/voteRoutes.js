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
import Vote from "../models/Vote.js";
import Candidate from "../models/Candidate.js";
import Election from "../models/Election.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { enforceSecureVoting } from "../middleware/secureVoting.js";
import { syncToBlockchain } from "../middleware/blockchainSync.js";
import sharedBlockchainService from "../services/sharedBlockchain.js";

// Use shared blockchain service
const blockchainService = sharedBlockchainService;

const router = express.Router();

// ✅ Cast a vote - STRICT DUPLICATE PREVENTION
router.post(
  "/",
  authenticate,
  authorize(["voter", "admin"]),
  syncToBlockchain,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { electionId, candidateId } = req.body;

      console.log(`🗳️ Vote attempt: User ${userId}, Election ${electionId}, Candidate ${candidateId}`);

      // Validate required fields
      if (!electionId || !candidateId) {
        return res.status(400).json({ message: "Election ID and Candidate ID are required" });
      }

      // Ensure election exists and is active
      const election = await Election.findByPk(electionId);
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }

      // Check if election is active
      const now = new Date();
      if (now < new Date(election.startDate) || now > new Date(election.endDate)) {
        return res.status(400).json({ message: "Election is not currently active" });
      }

      // Ensure candidate belongs to this election
      const candidate = await Candidate.findOne({
        where: { id: candidateId, electionId },
      });
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found in this election" });
      }

      // CRITICAL: Prevent double voting with database constraint
      const existingVote = await Vote.findOne({
        where: { userId, electionId },
      });
      if (existingVote) {
        console.log(`❌ Duplicate vote attempt blocked: User ${userId} already voted in election ${electionId}`);
        return res.status(400).json({ 
          message: "You have already voted in this election",
          voteId: existingVote.id,
          votedAt: existingVote.createdAt
        });
      }

      // Create vote in database
      const vote = await Vote.create({
        electionId,
        candidateId,
        userId,
        isSecureVote: false, // Regular voting
        verificationHash: `vote-${userId}-${electionId}-${Date.now()}`,
      });

      console.log(`✅ Vote created: ID ${vote.id} for User ${userId}`);

      res.status(201).json({
        message: "Vote cast successfully",
        vote: {
          id: vote.id,
          electionId: vote.electionId,
          candidateId: vote.candidateId,
          createdAt: vote.createdAt
        },
        candidate: {
          id: candidate.id,
          name: candidate.name,
          party: candidate.party
        },
        security: {
          blockchainVerified: false, // Will be updated by middleware
          blockchainTxHash: vote.blockchainTxHash,
          verificationHash: vote.verificationHash,
          immutableRecord: true
        }
      });
    } catch (err) {
      console.error("Vote error:", err);
      res.status(500).json({ message: "Failed to cast vote" });
    }
  }
);

// ✅ Get election results (public route)
router.get("/results/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;

    const candidates = await Candidate.findAll({
      where: { electionId },
      include: [{ model: Vote, attributes: ["id"] }],
    });

    const results = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      votes: c.Votes.length,
    }));

    res.status(200).json(results);
  } catch (err) {
    console.error("Get results error:", err);
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

export default router;
