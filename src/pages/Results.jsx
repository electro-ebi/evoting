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


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BlockchainInfo from "../components/BlockchainInfo";
import API_CONFIG from "../utils/apiConfig";

function ResultsPage() {
  const { id } = useParams(); // electionId
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [aggregate, setAggregate] = useState(null); // total-only view when results aren't published

  const fetchResults = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_CONFIG.getAPIURL(`/api/results/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data);
      setAggregate(null);
    } catch (err) {
      console.error("Failed to fetch results", err);
      if (err.response?.status === 403) {
        setResults([]);
        setError("Results not yet published by admin. Showing participation only.");
        // Fetch aggregate vote counts (public endpoint)
        try {
          const aggRes = await axios.get(
            API_CONFIG.getAPIURL(`/api/users/election/${id}/vote-count`)
          );
          setAggregate(aggRes.data.voteCount);
        } catch (aggErr) {
          console.error("Failed to fetch aggregate vote counts", aggErr);
        }
      }
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 animate-pulse text-lg">
          Loading results...
        </p>
      </div>
    );

  const totalVotes = results.reduce((sum, r) => sum + Number(r.votes), 0);

  return (
    <div
      className="min-h-screen pt-28 bg-gradient-to-tr from-purple-900 via-purple-700 to-pink-600
 p-6"
    >
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-700">
            Election #{id} Results
          </h2>
          <button
            onClick={() => fetchResults(true)}
            disabled={refreshing}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Results'}
          </button>
        </div>

        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {aggregate ? (
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Voting Participation</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-800">Participation Rate</span>
              <span className="text-sm font-bold text-purple-700">{aggregate.participationRate}%</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-3 mb-3">
              <div
                className="bg-purple-600 h-3 rounded-full"
                style={{ width: `${Math.min(aggregate.participationRate, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-purple-900">
              <span>{aggregate.totalVotes} votes cast</span>
              <span>{aggregate.totalVoters} total voters</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((r) => {
              const percent = totalVotes
                ? ((r.votes / totalVotes) * 100).toFixed(1)
                : 0;
              return (
                <div
                  key={r.id}
                  className="p-4 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-800">{r.name}</span>
                    <span className="font-bold text-gray-900">
                      {r.votes} votes ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-purple-600 h-4 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-gray-500 mt-6 font-semibold">
          Total Votes: {aggregate ? aggregate.totalVotes : totalVotes}
        </p>

        {/* Blockchain Verification */}
        <div className="mt-8">
          {/* Blockchain info removed for voters - admin only feature */}
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
