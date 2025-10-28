import express from "express";
import {
  requestVotingKey,
  verifyVotingKey,
  submitVote,
  verifyVote,
  getVotingStatus,
  getVotingKeyForDisplay
} from "../controllers/secureVotingController.js";

const router = express.Router();

// Request voting key (Step 1)
router.post("/request-key", requestVotingKey);

// Verify voting key and get confirmation key (Step 2)
router.post("/verify-key", verifyVotingKey);

// Submit vote with confirmation key (Step 3) - No face verification required
router.post("/submit-vote", submitVote);

// Verify vote using confirmation key
router.get("/verify-vote/:confirmationKey/:electionId", verifyVote);

// Get voting status for user
router.get("/status/:email/:electionId", getVotingStatus);

// Get voting key for display page
router.get("/get-key/:email/:electionId", getVotingKeyForDisplay);

export default router;
