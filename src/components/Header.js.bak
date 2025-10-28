import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header
      className="fixed top-2 left-1/2 transform -translate-x-1/2 w-[95%] md:w-4/5 lg:w-3/5 flex justify-between items-center 
                 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-lg px-3 md:px-6 py-2 md:py-3 z-50 transition-all
                 hover:shadow-2xl hover:scale-105 duration-300"
    >
      {/* Logo / Title */}
      <h1
        className="text-lg md:text-2xl font-bold text-white cursor-pointer hover:text-purple-200 transition"
        onClick={() => navigate("/")}
      >
        <span className="hidden sm:inline">E-Voting System</span>
        <span className="sm:hidden">E-Vote</span>
      </h1>

      {/* Navigation */}
      <nav className="flex items-center space-x-1 md:space-x-4">
        {user ? (
          <>
            <span className="text-white font-medium px-3 py-1 rounded-full bg-purple-600/30 backdrop-blur-sm">
              Hi, {user.name}
            </span>

            {/* Admin links */}
            {user.role === "admin" && (
              <>
                <Link
                  to="/admin"
                  className="text-white px-3 py-1 rounded-xl font-semibold hover:text-purple-200 transition"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/create-election"
                  className="text-white px-3 py-1 rounded-xl font-semibold hover:text-purple-200 transition"
                >
                  Create Election
                </Link>
                <Link
                  to="/admin/elections"
                  className="text-white px-3 py-1 rounded-xl font-semibold hover:text-purple-200 transition"
                >
                  Elections
                </Link>
                <Link
                  to="/admin/blockchain"
                  className="text-white px-3 py-1 rounded-xl font-semibold hover:text-purple-200 transition"
                >
                  Blockchain
                </Link>
                <Link
                  to="/admin/users"
                  className="text-white px-3 py-1 rounded-xl font-semibold hover:text-purple-200 transition"
                >
                  Users
                </Link>
              </>
            )}

            {/* Normal user links (optional) */}
            {user.role !== "admin" && (
              <Link
                to="/dashboard"
                className="text-white px-3 py-1 rounded-xl font-semibold hover:text-purple-200 transition"
              >
                Dashboard
              </Link>
            )}

            {/* Info link - available to all users */}
            <Link
              to="/info"
              className="text-white px-3 py-1 rounded-xl font-semibold hover:text-purple-200 transition"
            >
              Info
            </Link>

            <button
              onClick={handleLogout}
              className="bg-white/80 text-purple-700 px-3 py-1 rounded-xl font-semibold hover:bg-white hover:text-purple-900 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-white/80 text-purple-700 px-3 py-1 rounded-xl font-semibold hover:bg-white hover:text-purple-900 transition"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
