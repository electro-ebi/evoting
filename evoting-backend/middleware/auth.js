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
