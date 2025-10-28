import { User } from '../models/index.js';

/**
 * Middleware to check if face verification is required and completed
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const requireFaceVerification = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user from database
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'faceRegistered', 'faceVerificationEnabled', 
        'faceDescriptor', 'faceVerificationCount'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if face verification is enabled for this user
    if (!user.faceVerificationEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Face verification is not enabled for this user',
        requiresFaceRegistration: true
      });
    }

    // Check if face is registered
    if (!user.faceRegistered || !user.faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'Face not registered. Please register your face first.',
        requiresFaceRegistration: true
      });
    }

    // Check if face verification was completed in the current session
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        
        if (!decoded.faceVerified) {
          return res.status(401).json({
            success: false,
            message: 'Face verification required',
            requiresFaceVerification: true
          });
        }

        // Check if face verification is recent (within last 10 minutes)
        const verificationTime = new Date(decoded.faceVerificationTime);
        const now = new Date();
        const timeDiff = (now - verificationTime) / (1000 * 60); // minutes

        if (timeDiff > 10) {
          return res.status(401).json({
            success: false,
            message: 'Face verification expired. Please verify again.',
            requiresFaceVerification: true
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token'
        });
      }
    }

    // Add face verification info to request
    req.faceVerification = {
      isEnabled: user.faceVerificationEnabled,
      isRegistered: user.faceRegistered,
      verificationCount: user.faceVerificationCount
    };

    next();
  } catch (error) {
    console.error('Error in face verification middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking face verification status'
    });
  }
};

/**
 * Middleware to check if face verification is optional (for backward compatibility)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const optionalFaceVerification = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    
    if (!userId) {
      return next(); // Skip if no user
    }

    // Get user from database
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'faceRegistered', 'faceVerificationEnabled', 
        'faceDescriptor', 'faceVerificationCount'
      ]
    });

    if (!user) {
      return next(); // Skip if user not found
    }

    // Add face verification info to request (optional)
    req.faceVerification = {
      isEnabled: user.faceVerificationEnabled,
      isRegistered: user.faceRegistered,
      verificationCount: user.faceVerificationCount,
      isOptional: true
    };

    next();
  } catch (error) {
    console.error('Error in optional face verification middleware:', error);
    // Continue even if there's an error
    next();
  }
};

/**
 * Middleware to enforce face verification for secure voting
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const enforceFaceVerificationForVoting = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user from database
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'faceRegistered', 'faceVerificationEnabled', 
        'faceDescriptor', 'faceVerificationCount'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For secure voting, face verification is mandatory
    if (!user.faceVerificationEnabled || !user.faceRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Face verification is required for secure voting. Please register and enable face verification.',
        requiresFaceRegistration: true,
        requiresFaceVerification: true
      });
    }

    // Check if face verification was completed in the current session
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        
        if (!decoded.faceVerified) {
          return res.status(401).json({
            success: false,
            message: 'Face verification required for secure voting',
            requiresFaceVerification: true
          });
        }

        // For secure voting, face verification must be very recent (within 5 minutes)
        const verificationTime = new Date(decoded.faceVerificationTime);
        const now = new Date();
        const timeDiff = (now - verificationTime) / (1000 * 60); // minutes

        if (timeDiff > 5) {
          return res.status(401).json({
            success: false,
            message: 'Face verification expired. Please verify again for secure voting.',
            requiresFaceVerification: true
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token'
        });
      }
    }

    // Add face verification info to request
    req.faceVerification = {
      isEnabled: user.faceVerificationEnabled,
      isRegistered: user.faceRegistered,
      verificationCount: user.faceVerificationCount,
      isSecureVoting: true
    };

    next();
  } catch (error) {
    console.error('Error in face verification middleware for voting:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking face verification status for voting'
    });
  }
};
