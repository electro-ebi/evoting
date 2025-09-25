// controllers/resultController.js
import { sequelize } from "../config/db.js"; // make sure path is correct

export const getResults = async (req, res) => {
  try {
    const electionId = req.params.id; // Get ID from URL
    if (!electionId) {
      return res.status(400).json({ error: "Election ID is required" });
    }

    const results = await sequelize.query(
      `SELECT c.id, c.name, c.party, COUNT(v.id) AS votes
       FROM candidates c
       LEFT JOIN votes v ON c.id = v."candidateId"
       WHERE c."electionId" = :electionId
       GROUP BY c.id
       ORDER BY votes DESC;`,
      {
        replacements: { electionId }, // ⚠️ THIS WAS MISSING BEFORE
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching results:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};
