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


import dotenv from "dotenv";
import { sequelize, User } from "../models/index.js";

dotenv.config();

const run = async () => {
  try {
    await sequelize.authenticate();

    const totalBefore = await User.count();
    const deleted = await User.destroy({ where: { role: ["voter"] } });

    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["id", "name", "email", "role", "isVerified"],
    });

    console.log(JSON.stringify({ totalBefore, deleted, admins }, null, 2));
  } catch (err) {
    console.error("Error deleting non-admin users:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

run();


