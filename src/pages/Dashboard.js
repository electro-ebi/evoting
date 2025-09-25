import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, BarChart2, CheckSquare } from "lucide-react";

function Dashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

 useEffect(() => {
   const fetchElections = async () => {
     try {
       const token = localStorage.getItem("token"); // get JWT
       const res = await fetch("http://localhost:5000/api/elections", {
         headers: { Authorization: `Bearer ${token}` },
       });
       const data = await res.json();
       if (res.ok) setElections(data);
       else throw new Error(data.message || "Failed to fetch elections");
     } catch (err) {
       console.error(err);
       alert("Failed to load elections. Try again later.");
     } finally {
       setLoading(false);
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
        No ongoing elections right now.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-28  bg-gradient-to-b from-purple-700 to-indigo-500
 p-6"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-purple-700 text-center flex items-center justify-center gap-2">
          <CheckSquare className="w-8 h-8" /> Ongoing Elections
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {elections.map((election) => (
            <div
              key={election.id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition cursor-pointer border border-purple-100"
            >
              <h3 className="text-xl font-semibold mb-2 text-purple-800">
                {election.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {election.startDate && election.endDate
                  ? `From ${new Date(
                      election.startDate
                    ).toLocaleDateString()} to ${new Date(
                      election.endDate
                    ).toLocaleDateString()}`
                  : "Ongoing"}
              </p>

              <div className="flex justify-between">
                <button
                  onClick={() => navigate(`/vote/${election.id}`)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  <CheckSquare className="w-4 h-4" /> Vote
                </button>
                <button
                  onClick={() => navigate(`/results/${election.id}`)}
                  className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
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
