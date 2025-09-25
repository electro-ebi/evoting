// controllers/candidateController.js
import Candidate from "../models/Candidate.js";
import Election from "../models/Election.js";

// Add a candidate to an election
export const addCandidate = async (req, res) => {
  try {
    const { name, party, electionId } = req.body;

    // Validate input
    if (!name || !electionId) {
      return res
        .status(400)
        .json({ message: "Name and electionId are required" });
    }

    // Check if election exists
    const election = await Election.findByPk(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Create candidate
    const candidate = await Candidate.create({ name, party, electionId });

    return res.status(201).json({
      message: "Candidate added successfully",
      candidate,
    });
  } catch (err) {
    console.error("Add candidate error:", err);
    return res.status(500).json({ message: "Failed to add candidate" });
  }
};

// Get all candidates for a specific election
export const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    const election = await Election.findByPk(electionId, {
      include: Candidate,
    });

    if (!election)
      return res.status(404).json({ message: "Election not found" });

    return res.json({ candidates: election.Candidates });
  } catch (err) {
    console.error("Get candidates error:", err);
    return res.status(500).json({ message: "Failed to fetch candidates" });
  }
};
