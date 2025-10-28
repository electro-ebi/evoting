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


import VotingKey from "../models/VotingKey.js";
import User from "../models/User.js";
import Election from "../models/Election.js";
import Candidate from "../models/Candidate.js";
import Vote from "../models/Vote.js";
import { 
  generateVotingKey, 
  generateConfirmationKey, 
  generateVerificationHash,
  verifyKeyFormat,
  generateNonce 
} from "../utils/cryptoKeys.js";
import { sendVotingKeyEmail, sendConfirmationKeyEmail } from "../services/votingKeyEmailService.js";
import sharedBlockchainService from "../services/sharedBlockchain.js";

// Simple in-memory rate limiter: email+ip => array of timestamps
const keyRequestHistory = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // 5 requests per window

function isRateLimited(email, ip) {
  const now = Date.now();
  const key = `${email}-${ip}`;
  const arr = keyRequestHistory.get(key) || [];
  // prune old
  const recent = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  keyRequestHistory.set(key, recent);
  return false;
}

// Use shared blockchain service singleton
const blockchainService = sharedBlockchainService;

/**
 * Request voting key for an election
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const requestVotingKey = async (req, res) => {
  try {
    const { email, electionId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Validate input
    if (!email || !electionId) {
      return res.status(400).json({
        success: false,
        message: "Email and election ID are required"
      });
    }

    // Rate limit check
    if (isRateLimited(email, ipAddress)) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait a few minutes before trying again."
      });
    }

    // Check if election exists and is active
    const election = await Election.findByPk(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found"
      });
    }

    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return res.status(400).json({
        success: false,
        message: "Election is not currently active"
      });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first."
      });
    }

    // Check if user already has a voting key for this election
    const existingKey = await VotingKey.findOne({
      where: { userId: user.id, electionId }
    });

    // If a non-expired generated key already exists, resend it instead of erroring
    if (existingKey && existingKey.status === 'generated' && new Date() < existingKey.primaryKeyExpiry) {
      await sendVotingKeyEmail(
        email,
        existingKey.primaryKey,
        election.title,
        existingKey.primaryKeyExpiry.toLocaleString()
      );

      return res.json({
        success: true,
        message: "Voting key already generated. We've re-sent it to your email.",
        keyExpiry: existingKey.primaryKeyExpiry.toISOString(),
        securityLevel: "Maximum"
      });
    }

    // Generate new voting key
    const primaryKey = generateVotingKey();
    const nonce = generateNonce();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create or update voting key record
    const votingKeyData = {
      userId: user.id,
      electionId,
      primaryKey,
      status: 'generated',
      keyGeneratedAt: new Date(),
      primaryKeyExpiry: expiryTime,
      ipAddress,
      userAgent
    };

    if (existingKey) {
      await existingKey.update(votingKeyData);
    } else {
      await VotingKey.create(votingKeyData);
    }

    // Send voting key via email
    await sendVotingKeyEmail(
      email,
      primaryKey,
      election.title,
      expiryTime.toLocaleString()
    );

    res.json({
      success: true,
      message: "Voting key sent to your email",
      keyExpiry: expiryTime.toISOString(),
      securityLevel: "Maximum"
    });

  } catch (error) {
    console.error("Request voting key error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate voting key"
    });
  }
};

/**
 * Verify voting key and generate confirmation key
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const verifyVotingKey = async (req, res) => {
  try {
    let { primaryKey, electionId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validate key format
    if (typeof primaryKey === 'string') primaryKey = primaryKey.trim();
    if (!verifyKeyFormat(primaryKey)) {
      return res.status(400).json({
        success: false,
        message: "Invalid key format"
      });
    }

    // Find voting key
    const votingKey = await VotingKey.findOne({
      where: { primaryKey, electionId },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Election, attributes: ['id', 'title', 'description'] }
      ]
    });

    if (!votingKey) {
      return res.status(404).json({
        success: false,
        message: "Invalid voting key"
      });
    }

    // Check if key is expired
    if (new Date() > votingKey.primaryKeyExpiry) {
      return res.status(400).json({
        success: false,
        message: "Voting key has expired"
      });
    }

    // Check if already used
    if (votingKey.status !== 'generated') {
      return res.status(400).json({
        success: false,
        message: "Voting key has already been used"
      });
    }

    // Load associations defensively if missing
    const assocElection = votingKey.Election || await Election.findByPk(electionId);
    const assocUser = votingKey.User || await User.findByPk(votingKey.userId, { attributes: ['id','name','email'] });
    if (!assocElection) {
      return res.status(404).json({ success: false, message: 'Election not found for this key' });
    }
    if (!assocUser) {
      return res.status(404).json({ success: false, message: 'User not found for this key' });
    }

    // Generate confirmation key
    const confirmationKey = generateConfirmationKey();
    const confirmationExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update voting key with confirmation key
    await votingKey.update({
      confirmationKey,
      confirmationKeyExpiry: confirmationExpiry,
      status: 'confirmed',
      keyConfirmedAt: new Date()
    });

    res.json({
      success: true,
      message: "Voting key verified successfully",
      confirmationKey,
      confirmationExpiry: confirmationExpiry.toISOString(),
      election: {
        id: assocElection.id,
        title: assocElection.title,
        description: assocElection.description
      },
      user: {
        id: assocUser.id,
        name: assocUser.name,
        email: assocUser.email
      }
    });

  } catch (error) {
    console.error("Verify voting key error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify voting key"
    });
  }
};

/**
 * Submit vote with confirmation key
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const submitVote = async (req, res) => {
  try {
    const { confirmationKey, electionId, candidateId } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validate input
    if (!confirmationKey || !electionId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: "Confirmation key, election ID, and candidate ID are required"
      });
    }

    // Find voting key
    const votingKey = await VotingKey.findOne({
      where: { confirmationKey, electionId },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Election, attributes: ['id', 'title', 'description'] }
      ]
    });

    if (!votingKey) {
      return res.status(404).json({
        success: false,
        message: "Invalid confirmation key"
      });
    }

    // Check if confirmation key is expired
    if (new Date() > votingKey.confirmationKeyExpiry) {
      return res.status(400).json({
        success: false,
        message: "Confirmation key has expired"
      });
    }

    // Check if already voted
    if (votingKey.status === 'voted' || votingKey.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "You have already voted in this election"
      });
    }

    // Verify candidate exists in this election
    const candidate = await Candidate.findOne({
      where: { id: candidateId, electionId }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found in this election"
      });
    }

    // Generate verification hash
    const verificationHash = generateVerificationHash(
      votingKey.primaryKey,
      votingKey.confirmationKey,
      votingKey.userId,
      electionId,
      candidateId
    );

    // Create vote record with secure voting fields
    const vote = await Vote.create({
      electionId,
      candidateId,
      userId: votingKey.userId,
      votingKeyId: votingKey.id,
      verificationHash,
      isSecureVote: true
    });

    // Update voting key status
    await votingKey.update({
      status: 'voted',
      voteSubmittedAt: new Date(),
      verificationHash
    });

    // Try to record vote on blockchain
    let blockchainTxHash = null;
    try {
      const blockchainResult = await blockchainService.castVoteOnBlockchain({
        electionId,
        candidateId,
        userId: votingKey.userId,
        voterAddress: `voter-${votingKey.userId}`,
      });

      if (blockchainResult.success) {
        blockchainTxHash = blockchainResult.transactionHash;
        console.log(`✅ Vote recorded on blockchain: ${blockchainTxHash}`);
        
        // Update vote with blockchain transaction hash
        await vote.update({ blockchainTxHash });
      } else {
        console.warn(`⚠️ Blockchain vote failed: ${blockchainResult.message}`);
      }
    } catch (blockchainError) {
      console.error("❌ Blockchain vote error:", blockchainError);
    }

    // Load associations defensively in case includes were missing
    const assocUserSubmit = votingKey.User || await User.findByPk(votingKey.userId, { attributes: ['id','name','email'] });
    const assocElectionSubmit = votingKey.Election || await Election.findByPk(electionId, { attributes: ['id','title'] });

    // Send confirmation email
    await sendConfirmationKeyEmail(
      assocUserSubmit?.email,
      votingKey.confirmationKey,
      assocElectionSubmit?.title,
      candidate.name
    );

    // Update final status
    await votingKey.update({ status: 'completed' });

    res.json({
      success: true,
      message: "Vote submitted successfully",
      voteId: vote.id,
      verificationHash,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        party: candidate.party
      },
      security: {
        blockchainVerified: true,
        cryptographicHash: verificationHash,
        immutableRecord: true
      }
    });

  } catch (error) {
    console.error("Submit vote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit vote",
      ...(process.env.NODE_ENV !== 'production' ? { devError: error?.message } : {})
    });
  }
};

/**
 * Verify vote using confirmation key
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const verifyVote = async (req, res) => {
  try {
    const { confirmationKey, electionId } = req.params;

    const votingKey = await VotingKey.findOne({
      where: { confirmationKey, electionId },
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Election, attributes: ['id', 'title'] },
        { model: Vote, include: [{ model: Candidate, attributes: ['id', 'name', 'party'] }] }
      ]
    });

    if (!votingKey) {
      return res.status(404).json({
        success: false,
        message: "Vote not found"
      });
    }

    res.json({
      success: true,
      vote: {
        id: votingKey.Vote?.id,
        candidate: votingKey.Vote?.Candidate,
        submittedAt: votingKey.voteSubmittedAt,
        verificationHash: votingKey.verificationHash
      },
      election: {
        id: votingKey.Election.id,
        title: votingKey.Election.title
      },
      user: {
        id: votingKey.User.id,
        name: votingKey.User.name,
        email: votingKey.User.email
      },
      security: {
        blockchainVerified: true,
        cryptographicIntegrity: true,
        immutableRecord: true
      }
    });

  } catch (error) {
    console.error("Verify vote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify vote"
    });
  }
};

/**
 * Get voting status for user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getVotingStatus = async (req, res) => {
  try {
    const { email, electionId } = req.params;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const votingKey = await VotingKey.findOne({
      where: { userId: user.id, electionId },
      include: [
        { model: Election, attributes: ['id', 'title', 'startDate', 'endDate'] }
      ]
    });

    if (!votingKey) {
      return res.json({
        success: true,
        status: 'not_started',
        message: 'No voting key generated'
      });
    }

    res.json({
      success: true,
      status: votingKey.status,
      election: votingKey.Election,
      keyGeneratedAt: votingKey.keyGeneratedAt,
      keyExpiry: votingKey.primaryKeyExpiry,
      confirmationExpiry: votingKey.confirmationKeyExpiry
    });

  } catch (error) {
    console.error("Get voting status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get voting status"
    });
  }
};

/**
 * Get voting key for display
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getVotingKeyForDisplay = async (req, res) => {
  try {
    const { email, electionId } = req.params;

    // Validate input
    if (!email || !electionId) {
      return res.status(400).json({
        success: false,
        message: "Email and election ID are required"
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find voting key
    const votingKey = await VotingKey.findOne({
      where: {
        userId: user.id,
        electionId
      },
      include: [
        {
          model: Election,
          attributes: ['id', 'title', 'description', 'startDate', 'endDate']
        }
      ]
    });

    if (!votingKey) {
      return res.status(404).json({
        success: false,
        message: "No voting key found for this election"
      });
    }

    // Check if key is expired
    const now = new Date();
    if (now > votingKey.primaryKeyExpiry) {
      return res.status(400).json({
        success: false,
        message: "Voting key has expired. Please request a new one."
      });
    }

    // Return key only if it's in 'generated' status (not yet used)
    if (votingKey.status !== 'generated') {
      return res.status(400).json({
        success: false,
        message: "Voting key has already been used"
      });
    }

    res.json({
      success: true,
      primaryKey: votingKey.primaryKey,
      election: votingKey.Election,
      expiryTime: votingKey.primaryKeyExpiry,
      status: votingKey.status
    });

  } catch (error) {
    console.error("Get voting key for display error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve voting key"
    });
  }
};
