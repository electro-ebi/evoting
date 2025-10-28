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
