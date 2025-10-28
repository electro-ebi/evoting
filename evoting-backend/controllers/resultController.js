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


// controllers/resultController.js
import { sequelize } from "../config/db.js"; // make sure path is correct

export const getResults = async (req, res) => {
  try {
    const electionId = req.params.id; // Get ID from URL
    if (!electionId) {
      return res.status(400).json({ error: "Election ID is required" });
    }

    // Check if results are published (unless admin)
    const election = await sequelize.query(
      `SELECT "resultsPublished" FROM elections WHERE id = :electionId`,
      {
        replacements: { electionId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!election.length) {
      return res.status(404).json({ error: "Election not found" });
    }

    // For non-admin users, check if results are published
    const token = req.headers.authorization?.replace('Bearer ', '');
    let isAdmin = false;
    
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id || decoded.userId; // support both token shapes
        if (userId) {
          const { default: User } = await import('../models/User.js');
          const user = await User.findByPk(userId);
          isAdmin = user?.role === 'admin';
        }
      } catch (err) {
        // Token invalid, treat as non-admin
      }
    }

    if (!isAdmin && !election[0].resultsPublished) {
      return res.status(403).json({ 
        error: "Results not yet published",
        published: false 
      });
    }

    const results = await sequelize.query(
      `SELECT c.id, c.name, c.party, COUNT(v.id) AS votes
       FROM candidates c
       LEFT JOIN votes v ON c.id = v."candidateId"
       WHERE c."electionId" = :electionId
       GROUP BY c.id
       ORDER BY votes DESC;`,
      {
        replacements: { electionId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching results:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};
