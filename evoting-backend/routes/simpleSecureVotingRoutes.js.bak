import express from "express";
import { simpleRequestVotingKey, simpleVerifyPrimaryKey } from "../controllers/simpleSecureVotingController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Simple secure voting routes for testing
router.post("/request-key", authenticate, simpleRequestVotingKey);
router.post("/verify-key", authenticate, simpleVerifyPrimaryKey);

export default router;
