import { User } from '../models/index.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';

/**
 * Register face for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const registerFace = async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    const userId = req.userId;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid face descriptor format' 
      });
    }

    // Validate face descriptor length (should be 128 dimensions for face-api.js)
    if (faceDescriptor.length !== 128) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid face descriptor length. Expected 128 dimensions.' 
      });
    }

    // Get user from database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update user with face descriptor
    await user.update({
      faceDescriptor,
      faceRegistered: true,
      faceVerificationEnabled: true,
      faceRegistrationDate: new Date(),
      faceVerificationCount: 0
    });

    res.status(200).json({ 
      success: true,
      message: 'Face registered successfully',
      data: {
        faceRegistered: true,
        registrationDate: user.faceRegistrationDate
      }
    });
  } catch (error) {
    console.error('Error registering face:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error registering face', 
      error: error.message 
    });
  }
};

/**
 * Verify face for authentication
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const verifyFace = async (req, res) => {
  try {
    const { faceDescriptor, electionId } = req.body;
    const userId = req.userId;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid face descriptor format' 
      });
    }

    // Get user from database
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!user.faceRegistered || !user.faceDescriptor) {
      return res.status(400).json({ 
        success: false,
        message: 'Face not registered. Please register your face first.',
        requiresFaceRegistration: true 
      });
    }

    // Compare face descriptors
    const isMatch = compareFaceDescriptors(user.faceDescriptor, faceDescriptor);
    const similarity = calculateSimilarity(user.faceDescriptor, faceDescriptor);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Face verification failed. Please try again.',
        similarity: similarity
      });
    }

    // Update verification statistics
    await user.update({
      faceVerificationCount: user.faceVerificationCount + 1,
      lastFaceVerification: new Date()
    });

    // Generate a new token with face verification flag
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        faceVerified: true,
        faceVerificationTime: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      success: true,
      message: 'Face verified successfully',
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        faceVerification: {
          similarity: similarity,
          verificationCount: user.faceVerificationCount,
          lastVerification: user.lastFaceVerification
        }
      }
    });
  } catch (error) {
    console.error('Error verifying face:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error verifying face', 
      error: error.message 
    });
  }
};

/**
 * Get face registration status for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getFaceStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'name', 'email', 'faceRegistered', 
        'faceVerificationEnabled', 'faceRegistrationDate',
        'faceVerificationCount', 'lastFaceVerification'
      ]
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      data: {
        faceRegistered: user.faceRegistered,
        faceVerificationEnabled: user.faceVerificationEnabled,
        registrationDate: user.faceRegistrationDate,
        verificationCount: user.faceVerificationCount,
        lastVerification: user.lastFaceVerification
      }
    });
  } catch (error) {
    console.error('Error getting face status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting face status', 
      error: error.message 
    });
  }
};

/**
 * Disable face verification for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const disableFaceVerification = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    await user.update({
      faceVerificationEnabled: false
    });

    res.status(200).json({ 
      success: true,
      message: 'Face verification disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling face verification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error disabling face verification', 
      error: error.message 
    });
  }
};

/**
 * Enhanced face descriptor comparison with multiple algorithms
 * @param {Array} descriptor1 - First face descriptor
 * @param {Array} descriptor2 - Second face descriptor
 * @param {number} threshold - Similarity threshold (default: 0.6)
 * @returns {boolean} - Whether faces match
 */
function compareFaceDescriptors(descriptor1, descriptor2, threshold = 0.6) {
  if (!descriptor1 || !descriptor2 || 
      !Array.isArray(descriptor1) || !Array.isArray(descriptor2) ||
      descriptor1.length !== descriptor2.length) {
    return false;
  }

  // Calculate Euclidean distance
  const euclideanDistance = calculateEuclideanDistance(descriptor1, descriptor2);
  
  // Calculate cosine similarity
  const cosineSimilarity = calculateCosineSimilarity(descriptor1, descriptor2);
  
  // Calculate Manhattan distance
  const manhattanDistance = calculateManhattanDistance(descriptor1, descriptor2);
  
  // Calculate Pearson correlation
  const pearsonCorrelation = calculatePearsonCorrelation(descriptor1, descriptor2);
  
  // Normalize distances to 0-1 range (lower is more similar)
  const euclideanSimilarity = 1 / (1 + euclideanDistance);
  const manhattanSimilarity = 1 / (1 + manhattanDistance);
  const pearsonSimilarity = (pearsonCorrelation + 1) / 2;
  
  // Weighted combination optimized for face-api.js descriptors
  const combinedSimilarity = (
    euclideanSimilarity * 0.35 +    // Primary metric
    cosineSimilarity * 0.30 +        // Angular similarity
    manhattanSimilarity * 0.20 +     // Alternative distance
    pearsonSimilarity * 0.15         // Correlation
  );
  
  // More lenient thresholds for better mobile compatibility
  const adaptiveThreshold = threshold * 0.85; // More lenient (was 0.95)
  
  // Log detailed metrics for debugging
  console.log('🔍 Face Matching Backend:', {
    combinedSimilarity: (combinedSimilarity * 100).toFixed(1) + '%',
    euclideanDistance: euclideanDistance.toFixed(3),
    cosineSimilarity: cosineSimilarity.toFixed(3),
    euclideanPass: euclideanDistance <= 0.7,
    cosinePass: cosineSimilarity >= 0.60,
    combinedPass: combinedSimilarity >= adaptiveThreshold
  });
  
  return (
    combinedSimilarity >= adaptiveThreshold &&
    euclideanDistance <= 0.7 &&      // Relaxed from 0.6
    cosineSimilarity >= 0.60         // Relaxed from 0.65
  );
}

/**
 * Calculate similarity score for detailed feedback
 * @param {Array} descriptor1 - First face descriptor
 * @param {Array} descriptor2 - Second face descriptor
 * @returns {number} - Similarity score (0-1)
 */
function calculateSimilarity(descriptor1, descriptor2) {
  if (!descriptor1 || !descriptor2 || 
      !Array.isArray(descriptor1) || !Array.isArray(descriptor2) ||
      descriptor1.length !== descriptor2.length) {
    return 0;
  }

  const euclideanDistance = calculateEuclideanDistance(descriptor1, descriptor2);
  const cosineSimilarity = calculateCosineSimilarity(descriptor1, descriptor2);
  const manhattanDistance = calculateManhattanDistance(descriptor1, descriptor2);
  const pearsonCorrelation = calculatePearsonCorrelation(descriptor1, descriptor2);
  
  const euclideanSimilarity = 1 / (1 + euclideanDistance);
  const manhattanSimilarity = 1 / (1 + manhattanDistance);
  const pearsonSimilarity = (pearsonCorrelation + 1) / 2;
  
  // Same weights as comparison function for consistency
  return (
    euclideanSimilarity * 0.35 + 
    cosineSimilarity * 0.30 + 
    manhattanSimilarity * 0.20 +
    pearsonSimilarity * 0.15
  );
}

/**
 * Calculate Euclidean distance between two vectors
 * @param {Array} a - First vector
 * @param {Array} b - Second vector
 * @returns {number} - Euclidean distance
 */
function calculateEuclideanDistance(a, b) {
  let sumSquaredDiff = 0;
  for (let i = 0; i < a.length; i++) {
    sumSquaredDiff += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sumSquaredDiff);
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} a - First vector
 * @param {Array} b - Second vector
 * @returns {number} - Cosine similarity (0-1)
 */
function calculateCosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (normA * normB);
}

/**
 * Calculate Manhattan distance between two vectors
 * @param {Array} a - First vector
 * @param {Array} b - Second vector
 * @returns {number} - Manhattan distance
 */
function calculateManhattanDistance(a, b) {
  let sumAbsDiff = 0;
  for (let i = 0; i < a.length; i++) {
    sumAbsDiff += Math.abs(a[i] - b[i]);
  }
  return sumAbsDiff;
}

/**
 * Calculate Pearson correlation coefficient between two vectors
 * @param {Array} a - First vector
 * @param {Array} b - Second vector
 * @returns {number} - Pearson correlation (-1 to 1)
 */
function calculatePearsonCorrelation(a, b) {
  const n = a.length;
  const mean1 = a.reduce((sum, val) => sum + val, 0) / n;
  const mean2 = b.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = a[i] - mean1;
    const diff2 = b[i] - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }
  
  if (denom1 === 0 || denom2 === 0) return 0;
  
  return numerator / Math.sqrt(denom1 * denom2);
}
