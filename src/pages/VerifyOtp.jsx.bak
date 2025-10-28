import React, { useState } from "react";
import axios from "axios";
import API_CONFIG from "../utils/apiConfig";

export default function VerifyOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        API_CONFIG.getAPIURL("/api/auth/verify-otp"),
        { email, otp }
      );
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error verifying OTP");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Verify OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Verify
        </button>
      </form>
      {msg && <p className="mt-4">{msg}</p>}
    </div>
  );
}
