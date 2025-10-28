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


import React, { useState } from "react";
import axios from "axios";
import API_CONFIG from "../utils/apiConfig";

const OtpVerification = ({ phoneNumber, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    try {
      const res = await axios.post(API_CONFIG.getAPIURL("/api/otp/verify"), {
        phoneNumber,
        otp,
      });
      setMessage(res.data.message);
      if (res.data.message === "OTP verified successfully") {
        onSuccess();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold">Enter OTP</h2>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter 6-digit OTP"
        className="border p-2 rounded"
      />
      <button
        onClick={handleVerify}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Verify
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default OtpVerification;
