import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { sequelize } from "./models/index.js";
import userRoutes from "./routes/userRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------
// Middleware
// -------------------
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // allow React frontend
app.use(bodyParser.json());
// -------------------
// Routes
// -------------------
app.use("/api/users", userRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
// -------------------
// DB Sync & Server Start
// -------------------
(async () => {
  try {
    await sequelize.sync({ alter: true }); // auto-updates tables safely
    console.log("✅ Database synced successfully!");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Sequelize sync error:", err);
    process.exit(1); // exit if DB fails
  }
})();
