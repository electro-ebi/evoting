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


import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-400
 text-white p-6"
    >
      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold mb-4 text-center drop-shadow-lg"
      >
        Welcome to E-Voting System
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-lg mb-8 text-center max-w-lg"
      >
        Secure, transparent, and tamper-proof voting powered by blockchain.
      </motion.p>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-xl shadow hover:bg-gray-100 transition"
        >
          Enter Dashboard
        </button>

        <button
          onClick={() => navigate("/login")}
          className="bg-gradient-to-r from-purple-800 to-purple-900 text-white font-semibold px-6 py-3 rounded-xl shadow hover:opacity-90 transition"
        >
          Register / Login
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-gray-200">
        © {new Date().getFullYear()} E-Voting Project
      </footer>
    </div>
  );
}

export default Landing;
