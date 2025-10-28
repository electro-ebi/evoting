import React, { useState } from "react";
import axios from "axios";
import API_CONFIG from "../utils/apiConfig";

export default function RequestOtp() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_CONFIG.getAPIURL("/api/auth/send-otp"), {
        email,
      });
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error sending OTP");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Request OTP</h2>
      <form onSubmit={handleSend}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button className="bg-purple-600 text-white px-4 py-2 rounded">
          Send OTP
        </button>
      </form>
      {msg && <p className="mt-4">{msg}</p>}
    </div>
  );
}
