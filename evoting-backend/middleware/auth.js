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


// middleware/auth.js
import jwt from "jsonwebtoken";

// Authenticate JWT token
export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token)
    return res.status(401).json({ message: "Authorization token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // should include role and userId
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Authorize user roles (e.g., admin, voter)
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: no user" });

    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden: insufficient role" });

    next();
  };
};

// Alias for authenticate (commonly used name)
export const authenticateToken = authenticate;

// Middleware specifically for admin-only routes
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: no user" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin access required" });
  }
  
  next();
};
