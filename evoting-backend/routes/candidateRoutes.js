// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";

// const AddCandidate = () => {
//   const { electionId } = useParams();
//   const navigate = useNavigate();
//   const [name, setName] = useState("");
//   const [party, setParty] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       // get token from localStorage
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("You must be logged in as admin to add candidates");
//         setLoading(false);
//         return;
//       }

//       await axios.post(
//         "http://localhost:5000/api/candidates",
//         { name, party, electionId },
//         { headers: { Authorization: `Bearer ${token}` } } // pass token
//       );

//       alert("Candidate added successfully!");
//       navigate("/admin");
//     } catch (err) {
//       console.error(err);
//       setError(err.response?.data?.message || "Failed to add candidate");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-purple-50 p-6 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
//         <h2 className="text-2xl font-bold text-purple-700 mb-6">
//           Add Candidate
//         </h2>
//         {error && <p className="text-red-600 mb-4">{error}</p>}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             placeholder="Candidate Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
//             required
//           />
//           <input
//             type="text"
//             placeholder="Party (optional)"
//             value={party}
//             onChange={(e) => setParty(e.target.value)}
//             className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 rounded text-white transition ${
//               loading
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-purple-600 hover:bg-purple-700"
//             }`}
//           >
//             {loading ? "Adding..." : "Add Candidate"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

import express from "express";
import { addCandidate } from "../controllers/candidateController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Only admin can add candidates
router.post("/", authenticate, authorize(["admin"]), addCandidate);

export default router;
