import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, PlusCircle } from "lucide-react";

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/elections", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch elections");
        setElections(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchElections();
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-tr from-purple-600 via-purple-700 to-pink-600
 pt-28 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-200 mb-8 text-center">
          Admin Dashboard
        </h1>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {elections.length === 0 ? (
          <p className="text-gray-600 text-center text-lg">
            No elections found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div
                key={election.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-transform duration-300 border border-purple-100 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-semibold text-purple-800 mb-2">
                    {election.title}
                  </h2>
                  <p className="text-gray-600 mb-3">{election.description}</p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(election.startDate).toLocaleDateString()} -{" "}
                      {new Date(election.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/admin/election/${election.id}/add-candidate`}
                  className="mt-4 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition"
                >
                  <PlusCircle className="w-4 h-4" /> Add Candidate
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
