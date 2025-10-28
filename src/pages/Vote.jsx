import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import BlockchainInfo from "../components/BlockchainInfo";
import API_CONFIG from "../utils/apiConfig";

function Vote() {
  const { id } = useParams(); // electionId
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  
  // Get confirmationKey from navigation state or query param (fallback for refresh)
  const getConfirmationKey = () => {
    const stateKey = location.state?.confirmationKey;
    if (stateKey) return stateKey;
    
    const params = new URLSearchParams(location.search);
    return params.get('confirmationKey');
  };
  
  const confirmationKey = getConfirmationKey();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not logged in");

        // Check if user already voted - CRITICAL CHECK
        const userId = JSON.parse(atob(token.split(".")[1])).id;
        
        try {
          const voteCheckRes = await axios.get(
            API_CONFIG.getAPIURL(`/api/elections/${id}/user/${userId}/voted`)
          );
          
          if (voteCheckRes.data.hasVoted && !confirmationKey) {
            setHasVoted(true);
            setError("You have already voted in this election.");
            setLoading(false);
            return;
          }
        } catch (voteCheckError) {
          console.error("Error checking vote status:", voteCheckError);
          // Continue loading candidates even if vote check fails
        }

        const res = await axios.get(
          API_CONFIG.getAPIURL(`/api/elections/${id}`),
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
  }, [id, confirmationKey]);

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
      // If we are in secure-voting mode (coming from SecureVoting with confirmationKey),
      // call the secure endpoint. Otherwise, fall back to normal voting.
      if (confirmationKey) {
        await axios.post(
          API_CONFIG.getAPIURL("/api/secure-voting/submit-vote"),
          {
            confirmationKey,
            electionId: id,
            candidateId: selected,
          },
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        // Go back to SecureVoting confirmation step
        navigate(`/secure-vote/${id}?confirmed=1`);
      } else {
        if (!token) throw new Error("User not logged in");
        
        const response = await axios.post(
          API_CONFIG.getAPIURL("/api/votes"),
          {
            electionId: id,
            candidateId: selected,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.message === "You have already voted in this election") {
          setHasVoted(true);
          setError("You have already voted in this election.");
          return;
        }
        
        setSuccess("Vote cast successfully!");
        setHasVoted(true); // Prevent further voting
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      console.error(err);
      const apiMsg = err.response?.data?.message;
      const devMsg = err.response?.data?.devError;
      setError(devMsg || apiMsg || "Failed to cast vote.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen pt-20 md:pt-28 bg-gradient-to-r from-purple-600 to-purple-400 p-3 md:p-6"
    >
      <div className="max-w-md mx-auto bg-white p-4 md:p-8 rounded-xl shadow-md">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-purple-700 text-center">
          <span className="block md:inline">Election #{id}</span>
          <span className="block md:inline md:ml-2">- Cast Your Vote</span>
          {confirmationKey && <span className="block text-sm text-green-600 mt-1">Secure Voting Mode</span>}
        </h2>

        {/* Blockchain Status */}
        <div className="mb-6">
          <BlockchainInfo electionId={id} showDetails={false} />
        </div>

        {loading && <p className="text-center">Loading candidates...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {success && <p className="text-center text-green-600">{success}</p>}

        {hasVoted && !confirmationKey && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            <h3 className="font-semibold">✅ Vote Already Cast</h3>
            <p>You have successfully voted in this election. Thank you for participating!</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {!hasVoted && !loading && candidates.length === 0 && (
          <p className="text-center text-gray-500">No candidates available.</p>
        )}

        {!hasVoted && (
          <>
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
              disabled={!selected || submitting || hasVoted}
              className={`mt-6 w-full py-2 rounded font-semibold transition ${
                selected && !submitting && !hasVoted
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Vote"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Vote;
