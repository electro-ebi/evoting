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
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../models/User.js"; // Sequelize user model
import Vote from "../models/Vote.js";
import VotingKey from "../models/VotingKey.js";
import Election from "../models/Election.js";

// Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await UserModel.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    // For now, store plain-text password (can hash later)
    const user = await UserModel.create({
      name,
      email,
      password,
      role: role || "user",
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Failed to register user" });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ where: { email } });
    if (!user || user.password !== password)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .status(200)
      .json({
        message: "Login successful",
        token,
        userId: user.id,
        role: user.role,
        name: user.name,
      });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

// Get all users with their voting status for a specific election (Admin only)
export const getUsersWithVotingStatus = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Verify election exists
    const election = await Election.findByPk(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Get all users (using separate queries approach due to Sequelize association issues)
    const users = await UserModel.findAll({
      where: { 
        role: 'voter' // Only get voters, not admins
      },
      attributes: ['id', 'name', 'email', 'aadhaarNumber', 'voterId', 'phoneNumber', 'isVerified', 'createdAt']
    });

    // Format the response with voting status (using separate queries for reliability)
    const usersWithStatus = [];
    
    for (const user of users) {
      // Get votes for this user and election
      const votes = await Vote.findAll({
        where: { userId: user.id, electionId },
        attributes: ['id', 'createdAt', 'isSecureVote']
      });
      
      // Get voting keys for this user and election
      const keys = await VotingKey.findAll({
        where: { userId: user.id, electionId },
        attributes: ['id', 'status', 'keyGeneratedAt', 'voteSubmittedAt']
      });
      
      const hasVoted = votes.length > 0;
      const votingKey = keys.length > 0 ? keys[0] : null;
      
      // Debug logging
      console.log(`User ${user.name}: hasVoted=${hasVoted}, votingKey=${votingKey ? votingKey.status : 'none'}, votes=${votes.length}, keys=${keys.length}`);
      
      usersWithStatus.push({
        id: user.id,
        name: user.name,
        email: user.email,
        aadhaarNumber: user.aadhaarNumber,
        voterId: user.voterId,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        registeredAt: user.createdAt,
        votingStatus: {
          hasVoted,
          voteDate: hasVoted ? votes[0].createdAt : null,
          isSecureVote: hasVoted ? votes[0].isSecureVote : false,
          keyStatus: votingKey ? votingKey.status : 'not_generated',
          keyGeneratedAt: votingKey ? votingKey.keyGeneratedAt : null,
          voteSubmittedAt: votingKey ? votingKey.voteSubmittedAt : null
        }
      });
    }

    res.json({
      success: true,
      election: {
        id: election.id,
        title: election.title,
        description: election.description
      },
      totalUsers: usersWithStatus.length,
      votedUsers: usersWithStatus.filter(u => u.votingStatus.hasVoted).length,
      pendingUsers: usersWithStatus.filter(u => !u.votingStatus.hasVoted).length,
      users: usersWithStatus
    });

  } catch (err) {
    console.error("Get users with voting status error:", err);
    console.error("Error details:", {
      message: err.message,
      sql: err.sql,
      original: err.original
    });
    res.status(500).json({ 
      message: "Failed to fetch users with voting status",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get vote count for an election (without revealing results)
export const getElectionVoteCount = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Verify election exists
    const election = await Election.findByPk(electionId);
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Get total vote count
    const totalVotes = await Vote.count({
      where: { electionId }
    });

    // Get total registered users (voters only)
    const totalVoters = await UserModel.count({
      where: { role: 'voter' }
    });

    // Calculate participation percentage
    const participationRate = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        startDate: election.startDate,
        endDate: election.endDate,
        resultsPublished: election.resultsPublished
      },
      voteCount: {
        totalVotes,
        totalVoters,
        participationRate: parseFloat(participationRate),
        remainingVoters: totalVoters - totalVotes
      }
    });

  } catch (err) {
    console.error("Get election vote count error:", err);
    res.status(500).json({ message: "Failed to fetch vote count" });
  }
};
