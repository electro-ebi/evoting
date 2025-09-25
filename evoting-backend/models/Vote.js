import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import Candidate from "./Candidate.js";
import Election from "./Election.js";

const Vote = sequelize.define(
  "vote",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    candidateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "candidates", key: "id" },
      onDelete: "CASCADE",
    },
    electionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "elections", key: "id" },
      onDelete: "CASCADE",
    },
  },
  { tableName: "votes" }
);

// Associations
Vote.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Vote, { foreignKey: "userId" });

Vote.belongsTo(Candidate, { foreignKey: "candidateId" });
Candidate.hasMany(Vote, { foreignKey: "candidateId" });

Vote.belongsTo(Election, { foreignKey: "electionId" });
Election.hasMany(Vote, { foreignKey: "electionId" });

export default Vote;
