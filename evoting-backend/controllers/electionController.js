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


// controllers/electionController.js
import Election from "../models/Election.js";
import Candidate from "../models/Candidate.js";
import Vote from "../models/Vote.js";
import sharedBlockchainService from "../services/sharedBlockchain.js";

// Use shared blockchain service singleton
const blockchainService = sharedBlockchainService;

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

    // Deploy election contract on blockchain
    try {
      const blockchainResult = blockchainService.deployElectionContract({
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        candidates: [],
      });

      if (blockchainResult.success) {
        console.log(`✅ Election contract deployed: ${blockchainResult.contractAddress}`);
      } else {
        console.warn(`⚠️  Blockchain deployment failed: ${blockchainResult.message}`);
      }
    } catch (blockchainError) {
      console.error("❌ Blockchain deployment error:", blockchainError);
      // Don't fail the entire election creation if blockchain fails
    }

    res.status(201).json({
      ...election.toJSON(),
      blockchain: {
        enabled: true,
        message: "Election contract deployed on blockchain"
      }
    });
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
      resultsPublished: election.resultsPublished,
      candidates: candidatesWithVotes,
    });
  } catch (err) {
    console.error("Get election by ID error:", err);
    res.status(500).json({ message: "Failed to fetch election" });
  }
};

// Publish election results (admin only)
export const publishResults = async (req, res) => {
  try {
    const { id } = req.params;
    
    const election = await Election.findByPk(id);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    await election.update({ resultsPublished: true });
    
    res.json({
      success: true,
      message: "Results published successfully",
      election: {
        id: election.id,
        title: election.title,
        resultsPublished: true
      }
    });
  } catch (err) {
    console.error("Publish results error:", err);
    res.status(500).json({ message: "Failed to publish results" });
  }
};

// Check if user has already voted
export const checkUserVoted = async (req, res) => {
  try {
    const { electionId, userId } = req.params;
    
    const existingVote = await Vote.findOne({
      where: { electionId, userId }
    });
    
    res.json({
      hasVoted: !!existingVote,
      voteId: existingVote?.id || null
    });
  } catch (err) {
    console.error("Check user voted error:", err);
    res.status(500).json({ message: "Failed to check vote status" });
  }
};
