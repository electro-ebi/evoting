import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import API_CONFIG from "../../utils/apiConfig";

const BlockchainDashboard = () => {
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [blockchainHealth, setBlockchainHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  // removed unused initialized state
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlockchainData();
    // Auto-refresh dashboard data every 5 seconds
    const intervalId = setInterval(() => {
      fetchBlockchainData();
    }, 5000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchBlockchainData = async () => {
    setLoading(true);
    setError("");

    try {
      // Add cache-busting timestamp for fresh data
      const timestamp = Date.now();
      const statsURL = API_CONFIG.getAPIURL(
        `/api/blockchain/statistics?t=${timestamp}`
      );
      const healthURL = API_CONFIG.getAPIURL(
        `/api/blockchain/health?t=${timestamp}`
      );

      console.log("🔍 Fetching blockchain data from:", statsURL);

      // Fetch blockchain statistics
      const statsResponse = await fetch(statsURL, {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      console.log("📊 Stats response status:", statsResponse.status);
      const statsData = await statsResponse.json();
      console.log("📊 Stats data:", statsData);

      // Fetch blockchain health
      const healthResponse = await fetch(healthURL, {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      console.log("🏥 Health response status:", healthResponse.status);
      const healthData = await healthResponse.json();
      console.log("🏥 Health data:", healthData);

      if (statsData.success) {
        setBlockchainStats(statsData.statistics);
        console.log("✅ Blockchain stats set:", statsData.statistics);
      } else {
        console.log("❌ Stats data not successful:", statsData);
      }

      if (healthData.success) {
        setBlockchainHealth(healthData.health);
        console.log("✅ Blockchain health set:", healthData.health);
      } else {
        console.log("❌ Health data not successful:", healthData);
      }
    } catch (err) {
      setError("Failed to connect to blockchain");
      console.error("❌ Blockchain dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const initializeBlockchain = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_CONFIG.getAPIURL("/api/blockchain/initialize"),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Blockchain initialized successfully!");
        fetchBlockchainData();
      } else {
        alert(`Failed to initialize blockchain: ${data.message}`);
      }
    } catch (err) {
      alert("Failed to initialize blockchain");
      console.error("Initialize blockchain error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">
              Blockchain Dashboard
            </h1>
          </div>
          <button
            onClick={fetchBlockchainData}
            className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
            <br />
            <small>Check browser console for detailed error information.</small>
          </div>
        )}

        {/* Initialize Blockchain Button */}
        {!blockchainStats && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Blockchain Not Initialized
              </h3>
              <p className="text-gray-600 mb-4">
                Initialize the blockchain to start recording votes securely.
              </p>
              <button
                onClick={initializeBlockchain}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Initialize Blockchain
              </button>
            </div>
          </div>
        )}

        {/* Blockchain Statistics */}
        {blockchainStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Link className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Chain Length
                </h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {blockchainStats.chainLength}
              </div>
              <div className="text-sm text-gray-500">Blocks</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Total Votes
                </h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {blockchainStats.totalVotes}
              </div>
              <div className="text-sm text-gray-500">Recorded</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Integrity
                </h3>
              </div>
              <div
                className={`text-3xl font-bold ${
                  blockchainStats.isChainValid
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {blockchainStats.isChainValid ? "Valid" : "Invalid"}
              </div>
              <div className="text-sm text-gray-500">Chain Status</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Difficulty
                </h3>
              </div>
              <div className="text-3xl font-bold text-indigo-600">
                {blockchainStats.difficulty}
              </div>
              <div className="text-sm text-gray-500">Mining Level</div>
            </div>
          </div>
        )}

        {/* Blockchain Health */}
        {blockchainHealth && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Blockchain Health
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Health Status</div>
                <div
                  className={`text-lg font-semibold ${
                    blockchainHealth.isHealthy
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {blockchainHealth.isHealthy ? "Healthy" : "Unhealthy"}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Latest Block Hash</div>
                <div className="font-mono text-xs text-gray-800 break-all">
                  {blockchainHealth.latestBlockHash}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Pending Votes</div>
                <div className="text-lg font-semibold text-blue-600">
                  {blockchainHealth.pendingVotes}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voter Statistics */}
        {blockchainStats && blockchainStats.voterStats && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Voter Statistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Voters</div>
                <div className="text-2xl font-bold text-green-600">
                  {blockchainStats.voterStats.totalVoters}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Votes</div>
                <div className="text-2xl font-bold text-blue-600">
                  {blockchainStats.voterStats.totalVotes}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Active Elections</div>
                <div className="text-2xl font-bold text-purple-600">
                  {blockchainStats.voterStats.activeElections}
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-sm text-gray-600">Ended Elections</div>
                <div className="text-2xl font-bold text-orange-600">
                  {blockchainStats.voterStats.endedElections}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Features */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
          <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Blockchain Security Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>Immutable Vote Records</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>Cryptographic Hash Verification</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>Transparent Audit Trail</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>Tamper-Proof Results</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>Decentralized Verification</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>Smart Contract Automation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainDashboard;
