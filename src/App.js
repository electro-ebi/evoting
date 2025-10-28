/**
 * =====================================================
 * 🗳️ Secure E-Voting System
 * =====================================================
 * 
 * @project     Blockchain-Powered Electronic Voting System
 * @author      Ebi
 * @github      https://github.com/electro-ebi
 * @description A secure, transparent, and tamper-proof voting
 *              system with cryptographic authentication, face
 *              verification, and blockchain integration.
 * 
 * @features    - Multi-layer cryptographic security
 *              - Blockchain vote recording
 *              - Face verification
 *              - Real-time results
 *              - Admin dashboard
 * 
 * @license     MIT
 * @year        2025
 * =====================================================
 */

// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// User pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/EmailVerification";
import SecureVoting from "./pages/SecureVoting";
import VotingKeyDisplay from "./pages/VotingKeyDisplay";
import FaceRegistration from "./pages/FaceRegistration";
import WorkingFaceRegistration from "./pages/WorkingFaceRegistration";
import FaceVerificationSettings from "./pages/FaceVerificationSettings";
import FaceDiagnostic from "./pages/FaceDiagnostic";
import SimpleFaceTest from "./pages/SimpleFaceTest";
import SimpleFaceTest2 from "./pages/SimpleFaceTest2";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import SecurityDemonstration from "./pages/SecurityDemonstration";
import Info from "./pages/Info";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ElectionDashboard from "./pages/admin/ElectionDashboard";
import CreateElection from "./pages/admin/CreateElection";
import AddCandidate from "./pages/admin/AddCandidate";
import BlockchainDashboard from "./pages/admin/BlockchainDashboard";
import UserManagementSelector from "./pages/admin/UserManagementSelector";
import UserManagement from "./pages/admin/UserManagement";

// Components
import Header from "./components/Header";

// Protected route wrapper
const ProtectedRoute = ({ user, children, adminOnly = false }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin")
    return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  // Load user from localStorage once
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <Router>
      <Header user={user} setUser={setUser} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/secure-vote/:electionId" element={<SecureVoting />} />
        <Route path="/voting-key/:electionId" element={<VotingKeyDisplay />} />
        <Route path="/face-registration" element={<FaceRegistration />} />
        <Route path="/face-register-working" element={<WorkingFaceRegistration />} />
        <Route path="/face-settings" element={<FaceVerificationSettings />} />
        <Route path="/face-diagnostic" element={<FaceDiagnostic />} />
        <Route path="/face-test" element={<SimpleFaceTest />} />
        <Route path="/face-test2" element={<SimpleFaceTest2 />} />
        <Route path="/performance-dashboard" element={<PerformanceDashboard />} />
        <Route path="/security-demonstration" element={<SecurityDemonstration />} />
        <Route path="/info" element={<Info />} />

        {/* User protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vote/:id"
          element={
            <ProtectedRoute user={user}>
              <Vote />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results/:id"
          element={
            <ProtectedRoute user={user}>
              <Results />
            </ProtectedRoute>
          }
        />

        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/elections"
          element={
            <ProtectedRoute user={user} adminOnly>
              <ElectionDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-election"
          element={
            <ProtectedRoute user={user} adminOnly>
              <CreateElection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/election/:electionId/add-candidate"
          element={
            <ProtectedRoute user={user} adminOnly>
              <AddCandidate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blockchain"
          element={
            <ProtectedRoute user={user} adminOnly>
              <BlockchainDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute user={user} adminOnly>
              <UserManagementSelector />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:electionId"
          element={
            <ProtectedRoute user={user} adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;
