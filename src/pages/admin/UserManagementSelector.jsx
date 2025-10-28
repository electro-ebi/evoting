import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_CONFIG from "../../utils/apiConfig";
import { Users, Calendar, ArrowRight, ArrowLeft } from "lucide-react";

const UserManagementSelector = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(API_CONFIG.getAPIURL("/api/elections"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch elections");
        }
        
        const data = await response.json();
        setElections(data);
      } catch (err) {
        console.error("Error fetching elections:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-pink-400 pt-28 px-6">
        <div className="flex items-center justify-center">
          <div className="text-white text-xl">Loading elections...</div>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-white hover:text-purple-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Users className="w-10 h-10" />
            User Management
          </h1>
          <p className="text-purple-100 text-lg">
            Select an election to view and manage user voting status
          </p>
        </div>

        {/* Elections Grid */}
        {elections.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center border border-white/20">
            <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Elections Found</h3>
            <p className="text-purple-100 mb-6">
              Create an election first to manage user voting status.
            </p>
            <Link
              to="/admin/create-election"
              className="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition"
            >
              Create Election
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div
                key={election.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/admin/users/${election.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-100 transition">
                      {election.title}
                    </h3>
                    <p className="text-purple-100 text-sm line-clamp-2">
                      {election.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                <div className="flex items-center gap-2 text-purple-100 text-sm mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {election.startDate && election.endDate
                      ? `${new Date(election.startDate).toLocaleDateString()} - ${new Date(election.endDate).toLocaleDateString()}`
                      : "Ongoing"}
                  </span>
                </div>

                {/* Election Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {election.candidates && election.candidates.length > 0 ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-100 rounded-full text-xs font-medium">
                        {election.candidates.length} Candidates
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-100 rounded-full text-xs font-medium">
                        No Candidates
                      </span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-semibold text-sm">
                      Manage Users
                    </div>
                    <div className="text-purple-200 text-xs">
                      View voting status
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementSelector;
