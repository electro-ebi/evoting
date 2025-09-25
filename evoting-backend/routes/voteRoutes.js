import express from "express";
import Vote from "../models/Vote.js";
import Candidate from "../models/Candidate.js";
import Election from "../models/Election.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// ✅ Cast a vote (only voters)
router.post("/", authenticate, authorize(["voter", "admin"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { electionId, candidateId } = req.body;

    // Ensure election exists
    const election = await Election.findByPk(electionId);
    if (!election)
      return res.status(404).json({ message: "Election not found" });

    // Ensure candidate belongs to this election
    const candidate = await Candidate.findOne({
      where: { id: candidateId, electionId },
    });
    if (!candidate)
      return res
        .status(404)
        .json({ message: "Candidate not found in this election" });

    // Prevent double voting
    const existingVote = await Vote.findOne({ where: { userId, electionId } });
    if (existingVote)
      return res.status(400).json({ message: "You have already voted" });

    // Create vote
    const vote = await Vote.create({ electionId, candidateId, userId });

    res.status(201).json({ message: "Vote cast successfully", vote });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({ message: "Failed to cast vote" });
  }
});

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
