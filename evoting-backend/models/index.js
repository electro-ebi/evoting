import { sequelize } from "../config/db.js";
import User from "./User.js";
import Election from "./Election.js";
import Candidate from "./Candidate.js";
import Vote from "./Vote.js";

// ===== Associations =====
Election.hasMany(Candidate, { foreignKey: "electionId", onDelete: "CASCADE" });
Candidate.belongsTo(Election, { foreignKey: "electionId" });

Election.hasMany(Vote, { foreignKey: "electionId", onDelete: "CASCADE" });
Vote.belongsTo(Election, { foreignKey: "electionId" });

User.hasMany(Vote, { foreignKey: "userId", onDelete: "SET NULL" });
Vote.belongsTo(User, { foreignKey: "userId" });

Candidate.hasMany(Vote, { foreignKey: "candidateId", onDelete: "SET NULL" });
Vote.belongsTo(Candidate, { foreignKey: "candidateId" });

export { sequelize, User, Election, Candidate, Vote };
