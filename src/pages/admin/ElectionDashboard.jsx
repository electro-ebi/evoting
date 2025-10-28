import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BarChart3, CheckCircle, XCircle, Clock, Eye, EyeOff } from 'lucide-react';
import API_CONFIG from '../../utils/apiConfig';

const ElectionDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [electionResults, setElectionResults] = useState({});

  useEffect(() => {
    fetchElections();
    fetchBlockchainStats();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await fetch(API_CONFIG.getAPIURL('/api/elections'));
      const data = await response.json();
      setElections(data);
      
      // Fetch live results for each election
      const resultsPromises = data.map(async (election) => {
        try {
          const resultsResponse = await fetch(API_CONFIG.getAPIURL(`/api/results/${election.id}`));
          const resultsData = await resultsResponse.json();
          return { electionId: election.id, results: resultsData };
        } catch (error) {
          console.error(`Error fetching results for election ${election.id}:`, error);
          return { electionId: election.id, results: [] };
        }
      });
      
      const allResults = await Promise.all(resultsPromises);
      const resultsMap = {};
      allResults.forEach(({ electionId, results }) => {
        resultsMap[electionId] = results;
      });
      setElectionResults(resultsMap);
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockchainStats = async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(
        API_CONFIG.getAPIURL(`/api/blockchain/statistics?t=${timestamp}`),
        {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      const data = await response.json();
      setBlockchainStats(data.statistics);
      console.log('📊 Fresh blockchain stats fetched:', data.statistics?.totalVotes || 'N/A', 'total votes');
    } catch (error) {
      console.error('Error fetching blockchain stats:', error);
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'blue' };
    if (now > endDate) return { status: 'ended', color: 'gray' };
    return { status: 'active', color: 'green' };
  };

  const getTotalVotes = (electionId) => {
    const results = electionResults[electionId];
    if (!results || !Array.isArray(results)) return 0;
    return results.reduce((total, result) => total + Number(result.votes || 0), 0);
  };

  const getCandidateResults = (electionId) => {
    return electionResults[electionId] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-700 to-indigo-500
 pt-28 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Election Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive election management and monitoring
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setLoading(true);
                  fetchElections();
                  fetchBlockchainStats();
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Refresh Data
              </button>
              <Link
                to="/admin/create-election"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Election
              </Link>
              <Link
                to="/admin/blockchain"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Blockchain Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Blockchain Stats */}
        {blockchainStats && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-4">
              🔗 Blockchain Security Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {blockchainStats.chainLength}
                </div>
                <div className="text-sm opacity-90">Blockchain Blocks</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {blockchainStats.totalVotes}
                </div>
                <div className="text-sm opacity-90">Total Votes Recorded</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {blockchainStats.difficulty}
                </div>
                <div className="text-sm opacity-90">Mining Difficulty</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {blockchainStats.isChainValid ? "✅" : "❌"}
                </div>
                <div className="text-sm opacity-90">Chain Integrity</div>
              </div>
            </div>
          </div>
        )}

        {/* Elections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {elections.map((election) => {
            const status = getElectionStatus(election);
            const totalVotes = getTotalVotes(election.id);
            const candidateResults = getCandidateResults(election.id);

            return (
              <div
                key={election.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                {/* Election Header */}
                <div
                  className={`p-6 ${
                    status.color === "green"
                      ? "bg-green-500"
                      : status.color === "blue"
                      ? "bg-blue-500"
                      : "bg-gray-500"
                  } text-white`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{election.title}</h3>
                      <p className="text-sm opacity-90 mt-1">
                        {election.description}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        status.color === "green"
                          ? "bg-green-600"
                          : status.color === "blue"
                          ? "bg-blue-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {status.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Election Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Start Date</div>
                      <div className="font-semibold">
                        {new Date(election.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">End Date</div>
                      <div className="font-semibold">
                        {new Date(election.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Vote Statistics */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Total Votes
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {totalVotes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Candidates
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {election.candidates?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Candidates */}
                  {candidateResults.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Candidates & Results
                      </h4>
                      <div className="space-y-2">
                        {candidateResults.map((result) => {
                          const votes = Number(result.votes || 0);
                          const percentage =
                            totalVotes > 0
                              ? ((votes / totalVotes) * 100).toFixed(1)
                              : 0;

                          return (
                            <div
                              key={result.id}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <div className="font-medium text-gray-800">
                                  {result.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {result.party}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-blue-600">
                                  {votes} votes
                                </div>
                                <div className="text-xs text-gray-500">
                                  {percentage}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mb-2">
                    <Link
                      to={`/results/${election.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Results
                    </Link>
                    <Link
                      to={`/admin/election/${election.id}/add-candidate`}
                      className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Add Candidate
                    </Link>
                  </div>

                  {/* Publish Results Button */}
                  {!election.resultsPublished && (
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          const response = await fetch(
                            API_CONFIG.getAPIURL(
                              `/api/elections/${election.id}/publish-results`
                            ),
                            {
                              method: "PUT",
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          if (response.ok) {
                            fetchElections(); // Refresh data
                          }
                        } catch (error) {
                          console.error("Error publishing results:", error);
                        }
                      }}
                      className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Publish Results
                    </button>
                  )}

                  {election.resultsPublished && (
                    <div className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg text-center text-sm font-medium">
                      ✅ Results Published
                    </div>
                  )}

                  {/* Security Features */}
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-600 font-semibold text-sm">
                        🔐 Security Features
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center">
                        <span className="text-green-600 mr-1">✅</span>
                        <span>3-Layer Security</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-600 mr-1">✅</span>
                        <span>Blockchain Verified</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-600 mr-1">✅</span>
                        <span>Cryptographic Keys</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-600 mr-1">✅</span>
                        <span>Immutable Records</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Elections Message */}
        {elections.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🗳️</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Elections Found
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first election to get started with secure voting.
            </p>
            <Link
              to="/admin/create-election"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Election
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionDashboard;
