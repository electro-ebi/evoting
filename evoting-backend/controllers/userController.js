import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../models/User.js"; // Sequelize user model

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
