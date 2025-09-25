// controllers/electionController.js
import Election from "../models/Election.js";
import Candidate from "../models/Candidate.js";
import Vote from "../models/Vote.js";

// Create election
export const createElection = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
    });

    res.status(201).json(election);
  } catch (err) {
    console.error("Create election error:", err);
    res.status(500).json({ message: "Failed to create election" });
  }
};

// Get all elections
export const getElections = async (req, res) => {
  try {
    const elections = await Election.findAll({ include: Candidate });
    res.json(elections);
  } catch (err) {
    console.error("Get elections error:", err);
    res.status(500).json({ message: "Failed to fetch elections" });
  }
};

// Get single election (with votes, fixed earlier)
export const getElectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findByPk(id, {
      include: [
        {
          model: Candidate,
          include: [{ model: Vote, attributes: ["id"], required: false }],
        },
      ],
    });

    if (!election)
      return res.status(404).json({ message: "Election not found" });

    const candidatesWithVotes = election.candidates.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      votes: c.Votes ? c.Votes.length : 0,
    }));

    res.json({
      id: election.id,
      title: election.title,
      description: election.description,
      startDate: election.startDate,
      endDate: election.endDate,
      candidates: candidatesWithVotes,
    });
  } catch (err) {
    console.error("Get election by ID error:", err);
    res.status(500).json({ message: "Failed to fetch election" });
  }
};
