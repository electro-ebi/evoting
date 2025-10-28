import { sequelize } from "../config/db.js";
import User from "./User.js";
import Election from "./Election.js";
import Candidate from "./Candidate.js";
import Vote from "./Vote.js";
import VotingKey from "./VotingKey.js";

// ===== Associations =====
Election.hasMany(Candidate, { foreignKey: "electionId", onDelete: "CASCADE" });
Candidate.belongsTo(Election, { foreignKey: "electionId" });

Election.hasMany(Vote, { foreignKey: "electionId", onDelete: "CASCADE" });
Vote.belongsTo(Election, { foreignKey: "electionId" });

User.hasMany(Vote, { foreignKey: "userId", onDelete: "SET NULL" });
Vote.belongsTo(User, { foreignKey: "userId" });

Candidate.hasMany(Vote, { foreignKey: "candidateId", onDelete: "SET NULL" });
Vote.belongsTo(Candidate, { foreignKey: "candidateId" });

// VotingKey associations
User.hasMany(VotingKey, { foreignKey: "userId", onDelete: "CASCADE" });
VotingKey.belongsTo(User, { foreignKey: "userId" });

Election.hasMany(VotingKey, { foreignKey: "electionId", onDelete: "CASCADE" });
VotingKey.belongsTo(Election, { foreignKey: "electionId" });

Vote.belongsTo(VotingKey, { foreignKey: "votingKeyId" });
VotingKey.hasOne(Vote, { foreignKey: "votingKeyId" });

export { sequelize, User, Election, Candidate, Vote, VotingKey };
