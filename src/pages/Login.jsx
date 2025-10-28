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


import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../utils/apiConfig";
import { RefreshCw, Clock } from "lucide-react";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: request, 2: verify
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Timer in seconds
  const otpInputRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const requestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiUrl = API_CONFIG.getAPIURL("/api/auth/login-otp/request");
      console.log("🔵 Requesting OTP from:", apiUrl);
      
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      console.log("🔵 Response status:", res.status);
      const data = await res.json();
      console.log("🔵 Response data:", data);
      
      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
      } else {
        setStep(2);
        setTimeLeft(120); // Start 2-minute timer
      }
    } catch (err) {
      console.error("❌ Request failed:", err);
      console.error("❌ Error details:", err.message);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(API_CONFIG.getAPIURL("/api/auth/login-otp/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        const loggedUser = {
          userId: data.userId,
          role: data.role,
          name: data.name || email,
          email: data.email || email,
        };
        localStorage.setItem("user", JSON.stringify(loggedUser));
        localStorage.setItem("token", data.token);
        setUser(loggedUser);
        // Redirect based on role
        if (data.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } else if (res.status === 403 && data.requiresVerification) {
        localStorage.setItem("pendingVerificationEmail", data.email);
        navigate("/verify-email", { state: { email: data.email } });
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 flex items-center justify-center bg-gradient-to-br from-purple-700 via-purple-500 to-pink-400 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-700 text-center">Login (OTP)</h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {step === 1 && (
          <form onSubmit={requestOtp} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {loading ? "Sending OTP..." : "Send Login OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP Code
              </label>
              <input
                ref={otpInputRef}
                type="text"
                name="otp"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onClick={() => otpInputRef.current?.select()}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-4 text-center text-3xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-gray-50 hover:bg-white transition select-all"
                maxLength={6}
                autoFocus
                required
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                💡 Click to select all • Enter 6-digit code from email
              </p>
            </div>
            
            {timeLeft > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Code expires in {formatTime(timeLeft)}</span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setTimeLeft(0);
                }}
                disabled={timeLeft > 0}
                className={`flex items-center justify-center gap-2 mx-auto ${
                  timeLeft > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-purple-600 hover:text-purple-700"
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : "Resend / Change Email"}
              </button>
            </div>
          </form>
        )}

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")} className="text-purple-600 cursor-pointer hover:underline">
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
