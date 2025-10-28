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
  createElection,
  getElections,
  getElectionById,
  publishResults,
  checkUserVoted,
} from "../controllers/electionController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getElections);
router.get("/:id", getElectionById);
router.get("/:electionId/user/:userId/voted", checkUserVoted);

// Admin routes
router.post("/", authenticate, authorize(["admin"]), createElection);
router.put("/:id/publish-results", authenticate, authorize(["admin"]), publishResults);

export default router;
