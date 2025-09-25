import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ResultsPage() {
  const { id } = useParams(); // electionId
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/results/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };
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
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-700">
          Election #{id} Results
        </h2>

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

        <p className="text-center text-gray-500 mt-6 font-semibold">
          Total Votes: {totalVotes}
        </p>
      </div>
    </div>
  );
}

export default ResultsPage;
