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


import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  registerFace,
  verifyFace,
  getFaceStatus,
  disableFaceVerification
} from '../controllers/faceVerificationController.js';

const router = express.Router();

// Register face for a user
router.post('/register', authenticateToken, registerFace);

// Verify face for authentication
router.post('/verify', authenticateToken, verifyFace);

// Get face registration status
router.get('/status', authenticateToken, getFaceStatus);

// Disable face verification
router.post('/disable', authenticateToken, disableFaceVerification);

export default router;
