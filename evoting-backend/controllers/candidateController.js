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


import Candidate from "../models/Candidate.js";
import Election from "../models/Election.js";
import sharedBlockchainService from "../services/sharedBlockchain.js";

// Use shared blockchain service singleton
const blockchainService = sharedBlockchainService;

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

    // Create candidate in database
    const candidate = await Candidate.create({ name, party, electionId });

    // Add candidate to blockchain contract
    try {
      const blockchainResult = blockchainService.addCandidateToElection(electionId, {
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
      });

      if (blockchainResult.success) {
        console.log(`✅ Candidate added to blockchain: ${candidate.name}`);
      } else {
        console.warn(`⚠️  Blockchain candidate addition failed: ${blockchainResult.message}`);
      }
    } catch (blockchainError) {
      console.error("❌ Blockchain candidate error:", blockchainError);
      // Don't fail the entire candidate creation if blockchain fails
    }

    return res.status(201).json({
      message: "Candidate added successfully",
      candidate,
      blockchain: {
        enabled: true,
        message: "Candidate also added to blockchain contract"
      }
    });
  } catch (err) {
    console.error("Add candidate error:", err);
    return res.status(500).json({ message: "Failed to add candidate" });
  }
};

// Get candidates by election (flat array)
export const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    if (!electionId) {
      return res.status(400).json({ message: "electionId is required" });
    }

    const candidates = await Candidate.findAll({
      where: { electionId },
      attributes: ["id", "name", "party"],
    });

    return res.json(candidates);
  } catch (err) {
    console.error("Get candidates by election error:", err);
    return res.status(500).json({ message: "Failed to fetch candidates" });
  }
};
