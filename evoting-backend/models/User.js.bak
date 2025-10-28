import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

  const User = sequelize.define(
    "user",
    {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "voter"), defaultValue: "voter" },
    // Government IDs
    aadhaarNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    voterId: { type: DataTypes.STRING, allowNull: true, unique: true },
    phoneNumber: { type: DataTypes.STRING },

    // ✅ New field for OTP/email verification
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // by default, user must verify
    },

    // OTP fields for phone verification
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    
    // Face recognition data
    faceDescriptor: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    faceRegistered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    faceVerificationEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    faceRegistrationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    faceVerificationCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastFaceVerification: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { tableName: "users" }
);

export default User;
