import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AddCandidate = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Candidate name is required");
      return;
    }

    if (!electionId) {
      setError("Election ID is missing");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in as admin");

      // API call to add candidate
      await axios.post(
        "http://localhost:5000/api/candidates",
        { name: name.trim(), party: party.trim(), electionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Candidate added successfully!");

      // Navigate back to admin dashboard after successful addition
      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Failed to add candidate"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-300
 p-6 flex items-center justify-center"
    >
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-purple-700 mb-6">
          Add Candidate
        </h2>

        {error && <p className="text-red-600 mb-4 font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Candidate Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="text"
            placeholder="Party (optional)"
            value={party}
            onChange={(e) => setParty(e.target.value)}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className={`w-full py-2 rounded text-white transition ${
              loading || !name.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Adding..." : "Add Candidate"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCandidate;
