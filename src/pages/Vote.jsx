import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Vote() {
  const { id } = useParams(); // electionId
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not logged in");

        const res = await axios.get(
          `http://localhost:5000/api/elections/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const election = res.data;

        // Use lowercase 'candidates' as returned by backend
        if (election.candidates) {
          setCandidates(election.candidates);
        } else {
          setCandidates([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [id]);

  const handleVote = async () => {
    if (!selected) {
      alert("Please select a candidate");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not logged in");

      const userId = JSON.parse(atob(token.split(".")[1])).id;

      await axios.post(
        "http://localhost:5000/api/votes",
        {
          userId,
          electionId: id,
          candidateId: selected,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Vote cast successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to cast vote.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen pt-28 bg-gradient-to-r from-purple-600 to-purple-400
 p-6"
    >
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-700 text-center">
          Election #{id} - Cast Your Vote
        </h2>

        {loading && <p className="text-center">Loading candidates...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {success && <p className="text-center text-green-600">{success}</p>}

        {!loading && candidates.length === 0 && (
          <p className="text-center text-gray-500">No candidates available.</p>
        )}

        <div className="space-y-4">
          {candidates.map((c) => (
            <div
              key={c.id}
              className={`p-4 border rounded cursor-pointer transition ${
                selected === c.id
                  ? "border-purple-600 bg-purple-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelected(c.id)}
            >
              {c.name} {c.party && `(${c.party})`}
            </div>
          ))}
        </div>

        <button
          onClick={handleVote}
          disabled={!selected || submitting}
          className={`mt-6 w-full py-2 rounded font-semibold transition ${
            selected && !submitting
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Vote"}
        </button>
      </div>
    </div>
  );
}

export default Vote;
