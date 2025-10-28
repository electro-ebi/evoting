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
import {
  initializeBlockchain,
  deployElectionContract,
  addCandidateToElection,
  castVoteOnBlockchain,
  getElectionResultsFromBlockchain,
  getBlockchainStatistics,
  getAllElectionsFromBlockchain,
  endElectionOnBlockchain,
  verifyVoteOnBlockchain,
  getBlockchainHealth,
} from "../controllers/blockchainController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Initialize blockchain (admin only)
router.post("/initialize", authenticate, authorize(["admin"]), initializeBlockchain);

// Deploy election contract (admin only)
router.post("/elections/deploy", authenticate, authorize(["admin"]), deployElectionContract);

// Add candidate to election (admin only)
router.post("/elections/:electionId/candidates", authenticate, authorize(["admin"]), addCandidateToElection);

// Cast vote on blockchain (authenticated users)
router.post("/vote", authenticate, castVoteOnBlockchain);

// Get election results from blockchain (public)
router.get("/elections/:electionId/results", getElectionResultsFromBlockchain);

// Get blockchain statistics (public)
router.get("/statistics", getBlockchainStatistics);

// Get all elections from blockchain (public)
router.get("/elections", getAllElectionsFromBlockchain);

// End election on blockchain (admin only)
router.post("/elections/:electionId/end", authenticate, authorize(["admin"]), endElectionOnBlockchain);

// Verify vote on blockchain (authenticated users)
router.get("/elections/:electionId/verify/:userId", authenticate, verifyVoteOnBlockchain);

// Get blockchain health (public)
router.get("/health", getBlockchainHealth);

export default router;
