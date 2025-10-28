import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API_CONFIG from "../../utils/apiConfig";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  CreditCard,
  Calendar,
  ArrowLeft,
  Download,
  RefreshCw
} from "lucide-react";

const UserManagement = () => {
  const { electionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsersData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        API_CONFIG.getAPIURL(`/api/users/admin/election/${electionId}/users-status`),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (electionId) {
      fetchUsersData();
    }
  }, [electionId]);

  const getStatusBadge = (votingStatus) => {
    if (votingStatus.hasVoted) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Voted
        </span>
      );
    }
    
    switch (votingStatus.keyStatus) {
      case 'completed':
      case 'voted':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'confirmed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Key Confirmed
          </span>
        );
      case 'generated':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            <Mail className="w-3 h-3" />
            Key Sent
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Not Started
          </span>
        );
    }
  };

  const exportToCSV = () => {
    if (!data || !data.users) return;
    
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Aadhaar', 'Voter ID', 'Status', 'Vote Date', 'Registered Date'].join(','),
      ...data.users.map(user => [
        user.name,
        user.email,
        user.phoneNumber || 'N/A',
        user.aadhaarNumber || 'N/A',
        user.voterId || 'N/A',
        user.votingStatus.hasVoted ? 'Voted' : 'Pending',
        user.votingStatus.voteDate ? new Date(user.votingStatus.voteDate).toLocaleDateString() : 'N/A',
        new Date(user.registeredAt).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `election-${electionId}-users-report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-pink-400 pt-28 px-6">
        <div className="flex items-center justify-center">
          <div className="text-white text-xl">Loading user data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-pink-400 pt-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-pink-400 pt-28 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-white hover:text-purple-200 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchUsersData}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Election Info */}
        {data && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8" />
              User Management
            </h1>
            <h2 className="text-xl text-purple-100 mb-4">{data.election.title}</h2>
            
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{data.totalUsers}</div>
                <div className="text-purple-100 text-sm">Total Registered</div>
              </div>
              <div className="bg-green-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{data.votedUsers}</div>
                <div className="text-green-100 text-sm">Voted</div>
              </div>
              <div className="bg-yellow-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{data.pendingUsers}</div>
                <div className="text-yellow-100 text-sm">Pending</div>
              </div>
              <div className="bg-blue-500/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {data.totalUsers > 0 ? Math.round((data.votedUsers / data.totalUsers) * 100) : 0}%
                </div>
                <div className="text-blue-100 text-sm">Participation</div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {data && data.users && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">User Info</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">ID Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Voting Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Dates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.users.map((user, index) => (
                    <tr key={user.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.name}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {user.isVerified ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              {user.isVerified ? "Verified" : "Unverified"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{user.email}</span>
                          </div>
                          {user.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{user.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ID Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          {user.aadhaarNumber && (
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Aadhaar: ****{user.aadhaarNumber.slice(-4)}
                              </span>
                            </div>
                          )}
                          {user.voterId && (
                            <div className="text-gray-600">
                              Voter ID: {user.voterId}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Voting Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {getStatusBadge(user.votingStatus)}
                          {user.votingStatus.keyStatus !== 'not_generated' && (
                            <div className="text-xs text-gray-500">
                              Key: {user.votingStatus.keyStatus}
                            </div>
                          )}
                          {user.votingStatus.isSecureVote && (
                            <div className="text-xs text-green-600 font-medium">
                              Secure Vote ✓
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Reg: {new Date(user.registeredAt).toLocaleDateString()}</span>
                          </div>
                          {user.votingStatus.voteDate && (
                            <div className="text-green-600 font-medium">
                              Voted: {new Date(user.votingStatus.voteDate).toLocaleDateString()}
                            </div>
                          )}
                          {user.votingStatus.keyGeneratedAt && !user.votingStatus.voteDate && (
                            <div className="text-blue-600">
                              Key: {new Date(user.votingStatus.keyGeneratedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data && data.users && data.users.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Users Found</h3>
            <p className="text-gray-500">No registered voters found for this election.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
