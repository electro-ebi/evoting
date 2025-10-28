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
import { useNavigate, useLocation } from "react-router-dom";
import API_CONFIG from "../utils/apiConfig";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const otpInputRef = useRef(null);

  useEffect(() => {
    // Get email from location state or localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem("pendingVerificationEmail");
    
    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem("pendingVerificationEmail", emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // If no email found, redirect to register
      navigate("/register");
      return;
    }

    // Start countdown timer
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
  }, [location.state, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_CONFIG.getAPIURL("/api/auth/verify-email-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Email verified successfully! You can now login.");
        localStorage.removeItem("pendingVerificationEmail");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError("Server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setResendLoading(true);

    try {
      const res = await fetch(API_CONFIG.getAPIURL("/api/auth/resend-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("OTP resent successfully!");
        setTimeLeft(120); // Reset timer to 2 minutes
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Server error. Please try again.");
      console.error(err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-purple-500 to-pink-400 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-purple-700 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-purple-700">{email}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              ref={otpInputRef}
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onClick={() => otpInputRef.current?.select()}
              placeholder="000000"
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
            <p className="text-sm text-gray-500 text-center">
              Code expires in {formatTime(timeLeft)}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              loading || otp.length !== 6
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendOTP}
            disabled={resendLoading || timeLeft > 0} // Can only resend when timer expires
            className={`flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 transition ${
              resendLoading || timeLeft > 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`} />
            {resendLoading ? "Sending..." : timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : "Resend Code"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
