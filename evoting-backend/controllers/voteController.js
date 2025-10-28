// controllers/voteController.js
import Candidate from "../models/Candidate.js";
import Vote from "../models/Vote.js";
import BlockchainService from "../blockchain/BlockchainService.js";

// Initialize blockchain service
const blockchainService = new BlockchainService();

export const getResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Include votes properly with LEFT JOIN
    const candidates = await Candidate.findAll({
      where: { electionId },
      include: [
        {
          model: Vote,
          attributes: ["id"], // just need vote count
          required: false, // important! so candidates with 0 votes are included
        },
      ],
      order: [["name", "ASC"]],
    });

    // Calculate results
    const results = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      votes: c.Votes ? c.Votes.length : 0,
    }));

    // Total votes
    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

    res.status(200).json({ results, totalVotes });
  } catch (err) {
    console.error("Get results error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
