import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import Election from "./Election.js";

const VotingKey = sequelize.define(
  "votingKey",
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
    electionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "elections", key: "id" },
      onDelete: "CASCADE",
    },
    // Primary voting key (sent via email)
    primaryKey: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    // Confirmation key (for vote validation)
    confirmationKey: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    // Status of the voting process
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "generated",
      validate: {
        isIn: [["generated", "confirmed", "voted", "completed"]]
      }
    },
    // Timestamps for each step
    keyGeneratedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    keyConfirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    voteSubmittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Expiry times
    primaryKeyExpiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    confirmationKeyExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Cryptographic hash for verification
    verificationHash: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    // IP address for audit
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    // User agent for audit
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  { 
    tableName: "voting_keys",
    indexes: [
      {
        unique: true,
        fields: ['userId', 'electionId']
      },
      {
        fields: ['primaryKey']
      },
      {
        fields: ['confirmationKey']
      }
    ]
  }
);

// Associations are defined in models/index.js

export default VotingKey;
