import React, { useState, useEffect } from "react";
import API_CONFIG from "../utils/apiConfig";
import { Shield, Link, CheckCircle, AlertCircle } from "lucide-react";

const BlockchainInfo = ({ electionId, showDetails = false }) => {
  const [blockchainData, setBlockchainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (electionId && showDetails) {
      fetchBlockchainData();
    }
  }, [electionId, showDetails]);

  const fetchBlockchainData = async () => {
    setLoading(true);
    setError("");

    try {
      // Add cache-busting timestamp to ensure fresh data
      const timestamp = Date.now();
      const response = await fetch(
        API_CONFIG.getAPIURL(`/api/blockchain/elections/${electionId}/results?t=${timestamp}`),
        {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      const data = await response.json();

      if (data.success) {
        setBlockchainData(data);
      } else {
        setError(data.message || "Failed to fetch blockchain data");
      }
    } catch (err) {
      setError("Failed to connect to blockchain");
      console.error("Blockchain fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBlockchainHealth = async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(
        API_CONFIG.getAPIURL(`/api/blockchain/health?t=${timestamp}`),
        {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Blockchain health check error:", err);
      return null;
    }
  };

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
        <Shield className="w-4 h-4" />
        <span>Blockchain Secured</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading blockchain data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-800">Blockchain Verification</h3>
      </div>

      {blockchainData && (
        <div className="space-y-4">
          {/* Blockchain Status */}
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Votes Secured on Blockchain</span>
          </div>

          {/* Blockchain Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Total Blockchain Votes</div>
              <div className="text-lg font-semibold text-blue-600">
                {blockchainData.blockchainVerification?.totalBlockchainVotes || 0}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Block Count</div>
              <div className="text-lg font-semibold text-blue-600">
                {blockchainData.blockchainVerification?.blockCount || 0}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600">Integrity Status</div>
              <div className={`text-lg font-semibold ${
                blockchainData.blockchainVerification?.integrityVerified 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {blockchainData.blockchainVerification?.integrityVerified 
                  ? 'Verified' 
                  : 'Failed'}
              </div>
            </div>
          </div>

          {/* Latest Block Hash */}
          {blockchainData.blockchainVerification?.latestBlockHash && (
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600 mb-2">Latest Block Hash</div>
              <div className="font-mono text-xs text-gray-800 break-all">
                {blockchainData.blockchainVerification.latestBlockHash}
              </div>
            </div>
          )}

          {/* Vote Transactions */}
          {blockchainData.votes && blockchainData.votes.length > 0 && (
            <div className="bg-white p-3 rounded-lg border">
              <div className="text-sm text-gray-600 mb-2">Recent Vote Transactions</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {blockchainData.votes.slice(0, 5).map((vote, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">
                      Vote for Candidate {vote.candidateId}
                    </span>
                    <span className="font-mono text-gray-500">
                      {new Date(vote.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Features */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Security Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-3 h-3" />
                <span>Immutable Vote Records</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-3 h-3" />
                <span>Cryptographic Verification</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-3 h-3" />
                <span>Transparent Audit Trail</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-3 h-3" />
                <span>Tamper-Proof Results</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainInfo;
