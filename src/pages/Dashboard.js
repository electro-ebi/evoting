import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_CONFIG from "../utils/apiConfig";
import { Calendar, BarChart2, CheckSquare } from "lucide-react";

function Dashboard() {
  const [elections, setElections] = useState([]);
  const [voteCounts, setVoteCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

 useEffect(() => {
   const fetchElections = async () => {
     try {
       const token = localStorage.getItem("token"); // get JWT
       const res = await fetch(API_CONFIG.getAPIURL("/api/elections"), {
        headers: { Authorization: `Bearer ${token}` },
      });
       const data = await res.json();
       if (res.ok) {
         setElections(data);
         // Fetch vote counts for each election
         await fetchVoteCounts(data);
       } else {
         throw new Error(data.message || "Failed to fetch elections");
       }
     } catch (err) {
       console.error(err);
       alert("Failed to load elections. Try again later.");
     } finally {
       setLoading(false);
     }
   };

   const fetchVoteCounts = async (electionsData) => {
     try {
       const counts = {};
       for (const election of electionsData) {
         try {
           const voteRes = await fetch(API_CONFIG.getAPIURL(`/api/users/election/${election.id}/vote-count`));
           if (voteRes.ok) {
             const voteData = await voteRes.json();
             counts[election.id] = voteData.voteCount;
           }
         } catch (voteErr) {
           console.error(`Failed to fetch vote count for election ${election.id}:`, voteErr);
           counts[election.id] = { totalVotes: 0, totalVoters: 0, participationRate: 0 };
         }
       }
       setVoteCounts(counts);
     } catch (err) {
       console.error("Failed to fetch vote counts:", err);
     }
   };

   fetchElections();
 }, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-purple-600 text-xl">
        Loading elections...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 text-xl">
        {error}
      </div>
    );
  }

  if (!elections || elections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-xl">
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-28 bg-gradient-to-br from-purple-700 via-purple-500 to-pink-400 p-3 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 text-center">
          Voter Dashboard
        </h1>

        <h2 className="text-3xl font-bold mb-8 text-white text-center flex items-center justify-center gap-2">
          <CheckSquare className="w-8 h-8" /> Ongoing Elections
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.map((election) => (
            <div
              key={election.id}
              className="bg-white p-4 md:p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition cursor-pointer border border-purple-100"
            >
              <h3 className="text-xl font-semibold mb-2 text-purple-800">
                {election.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {election.startDate && election.endDate
                  ? `From ${new Date(
                      election.startDate
                    ).toLocaleDateString()} to ${new Date(
                      election.endDate
                    ).toLocaleDateString()}`
                  : "Ongoing"}
              </p>

              {/* Vote Count Display */}
              {voteCounts[election.id] && (
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-800">Voting Progress</span>
                    <span className="text-sm font-bold text-purple-600">
                      {voteCounts[election.id].participationRate}%
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(voteCounts[election.id].participationRate, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-purple-700">
                    <span>{voteCounts[election.id].totalVotes} votes cast</span>
                    <span>{voteCounts[election.id].totalVoters} total voters</span>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                <button
                  onClick={async () => {
                    // Check if user already voted before navigating
                    try {
                      const storedUserRaw = localStorage.getItem("user");
                      const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
                      const userId = storedUser?.userId || storedUser?.id;
                      if (!userId) {
                        // Fallback: navigate to vote if userId isn't available
                        navigate(`/secure-vote/${election.id}`);
                        return;
                      }
                      const voteCheckRes = await fetch(
                        API_CONFIG.getAPIURL(`/api/elections/${election.id}/user/${userId}/voted`)
                      );
                      const voteData = await voteCheckRes.json();
                      if (voteData.hasVoted) {
                        alert("You have already voted in this election!");
                        return;
                      }
                      navigate(`/secure-vote/${election.id}`);
                    } catch (error) {
                      console.error("Error checking vote status:", error);
                      navigate(`/secure-vote/${election.id}`); // Navigate anyway if check fails
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm md:text-base"
                >
                  <CheckSquare className="w-4 h-4" /> Vote
                </button>
                <button
                  onClick={() => navigate(`/results/${election.id}`)}
                  className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm md:text-base"
                >
                  <BarChart2 className="w-4 h-4" /> Results
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
