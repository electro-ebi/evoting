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
    // Secure voting fields
    votingKeyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "voting_keys", key: "id" },
      onDelete: "SET NULL",
    },
    verificationHash: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    blockchainTxHash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
    blockchainBlockHash: {
      type: DataTypes.STRING(66),
      allowNull: true,
    },
    blockchainBlockNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isSecureVote: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { 
    tableName: "votes",
    indexes: [
      {
        unique: true,
        fields: ['userId', 'electionId'],
        name: 'unique_user_election_vote'
      }
    ]
  }
);

// Associations are defined in models/index.js

export default Vote;
