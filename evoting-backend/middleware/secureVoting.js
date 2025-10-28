import VotingKey from "../models/VotingKey.js";

/**
 * Middleware to enforce secure voting - no direct voting without keys
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export const enforceSecureVoting = async (req, res, next) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user?.id;

    if (!electionId || !candidateId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Election ID, candidate ID, and user authentication required"
      });
    }

    // Check if user has a valid voting key for this election
    const votingKey = await VotingKey.findOne({
      where: { 
        userId, 
        electionId,
        status: 'confirmed' // Must be in confirmed state
      }
    });

    if (!votingKey) {
      return res.status(403).json({
        success: false,
        message: "Secure voting key required. Please request a voting key first.",
        redirectTo: `/secure-vote/${electionId}`
      });
    }

    // Check if confirmation key is provided
    const { confirmationKey } = req.body;
    if (!confirmationKey || confirmationKey !== votingKey.confirmationKey) {
      return res.status(403).json({
        success: false,
        message: "Valid confirmation key required for secure voting"
      });
    }

    // Check if key is expired
    if (new Date() > votingKey.confirmationKeyExpiry) {
      return res.status(400).json({
        success: false,
        message: "Confirmation key has expired. Please request a new voting key."
      });
    }

    // Attach voting key to request for use in controller
    req.votingKey = votingKey;
    next();

  } catch (error) {
    console.error("Secure voting middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Secure voting verification failed"
    });
  }
};

/**
 * Middleware to check if secure voting is enabled for an election
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export const checkSecureVotingEnabled = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    
    // For now, assume all elections require secure voting
    // In the future, this could be a database field
    req.secureVotingRequired = true;
    next();

  } catch (error) {
    console.error("Check secure voting error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check secure voting status"
    });
  }
};
