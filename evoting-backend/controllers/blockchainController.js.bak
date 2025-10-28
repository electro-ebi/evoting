import sharedBlockchainService from "../services/sharedBlockchain.js";

// Use shared blockchain service
const blockchainService = sharedBlockchainService;

// Initialize blockchain
export const initializeBlockchain = async (req, res) => {
  try {
    const result = blockchainService.initializeBlockchain();
    res.json(result);
  } catch (error) {
    console.error("Initialize blockchain error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize blockchain",
      error: error.message,
    });
  }
};

// Deploy election contract
export const deployElectionContract = async (req, res) => {
  try {
    const { id, title, description, startDate, endDate, candidates } = req.body;

    if (!id || !title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: id, title, startDate, endDate",
      });
    }

    const result = blockchainService.deployElectionContract({
      id,
      title,
      description,
      startDate,
      endDate,
      candidates: candidates || [],
    });

    res.json(result);
  } catch (error) {
    console.error("Deploy election contract error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deploy election contract",
      error: error.message,
    });
  }
};

// Add candidate to election
export const addCandidateToElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { id, name, party } = req.body;

    if (!id || !name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: id, name",
      });
    }

    const result = blockchainService.addCandidateToElection(electionId, {
      id,
      name,
      party,
    });

    res.json(result);
  } catch (error) {
    console.error("Add candidate to election error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add candidate to election",
      error: error.message,
    });
  }
};

// Cast vote on blockchain
export const castVoteOnBlockchain = async (req, res) => {
  try {
    const { electionId, candidateId, userId } = req.body;
    const voterAddress = req.user?.id || `voter-${userId}`;

    if (!electionId || !candidateId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: electionId, candidateId, userId",
      });
    }

    const result = blockchainService.castVoteOnBlockchain({
      electionId,
      candidateId,
      userId,
      voterAddress,
    });

    res.json(result);
  } catch (error) {
    console.error("Cast vote on blockchain error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cast vote on blockchain",
      error: error.message,
    });
  }
};

// Get election results from blockchain
export const getElectionResultsFromBlockchain = async (req, res) => {
  try {
    const { electionId } = req.params;

    const result = blockchainService.getElectionResultsFromBlockchain(electionId);
    
    // Add timestamp for fresh data
    if (result.success) {
      result.lastUpdated = new Date().toISOString();
      result.timestamp = Date.now();
    }
    
    // Set headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    console.log(`📊 Election ${electionId} results requested - ${result.results?.length || 0} candidates`);
    res.json(result);
  } catch (error) {
    console.error("Get election results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get election results from blockchain",
      error: error.message,
    });
  }
};

// Get blockchain statistics
export const getBlockchainStatistics = async (req, res) => {
  try {
    // Force fresh calculation - no caching
    const result = blockchainService.getBlockchainStatistics();
    
    // Add timestamp to ensure fresh data
    if (result.success) {
      result.statistics.lastUpdated = new Date().toISOString();
      result.statistics.timestamp = Date.now();
    }
    
    // Set headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    console.log(`📊 Blockchain stats requested - Total votes: ${result.statistics?.totalVotes || 'N/A'}`);
    res.json(result);
  } catch (error) {
    console.error("Get blockchain statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get blockchain statistics",
      error: error.message,
    });
  }
};

// Get all elections from blockchain
export const getAllElectionsFromBlockchain = async (req, res) => {
  try {
    const result = blockchainService.getAllElectionsFromBlockchain();
    res.json(result);
  } catch (error) {
    console.error("Get all elections error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get elections from blockchain",
      error: error.message,
    });
  }
};

// End election on blockchain
export const endElectionOnBlockchain = async (req, res) => {
  try {
    const { electionId } = req.params;

    const result = blockchainService.endElectionOnBlockchain(electionId);
    res.json(result);
  } catch (error) {
    console.error("End election error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end election on blockchain",
      error: error.message,
    });
  }
};

// Verify vote on blockchain
export const verifyVoteOnBlockchain = async (req, res) => {
  try {
    const { electionId, userId } = req.params;

    const result = blockchainService.verifyVoteOnBlockchain(electionId, userId);
    res.json(result);
  } catch (error) {
    console.error("Verify vote error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify vote on blockchain",
      error: error.message,
    });
  }
};

// Get blockchain health
export const getBlockchainHealth = async (req, res) => {
  try {
    const result = blockchainService.getBlockchainHealth();
    res.json(result);
  } catch (error) {
    console.error("Get blockchain health error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get blockchain health",
      error: error.message,
    });
  }
};
