import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import {
  sequelize,
  User,
  Election,
  Candidate,
  Vote,
  VotingKey,
} from "./models/index.js";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routers (ESM imports)
import userRoutes from "./routes/userRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";
import voteRoutes from "./routes/voteRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import blockchainRoutes from "./routes/blockchainRoutes.js";
import secureVotingRoutes from "./routes/secureVotingRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import simpleSecureVotingRoutes from "./routes/simpleSecureVotingRoutes.js";
import faceAuthRoutes from "./routes/faceAuth.js";
import initializeBlockchain from "./initBlockchain.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize blockchain service
initializeBlockchain().then(initialized => {
  if (initialized) {
    console.log('🚀 Blockchain service ready');
  } else {
    console.error('❌ Blockchain service initialization failed');
  }
});

// -------------------
// Middleware
// -------------------
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://10.0.0.7:3000",
      "https://10.0.0.7:3001",
      "https://localhost:3001",
      "https://twenty-papayas-train.loca.lt", // Frontend tunnel (old)
      "https://utils-larger-manufactured-frozen.trycloudflare.com", // Cloudflare frontend tunnel (old)
      "https://contracting-factor-arrangement-shaped.trycloudflare.com", // Previous Cloudflare frontend
      "https://affects-told-arlington-carnival.trycloudflare.com", // Previous Cloudflare frontend tunnel
      "https://cement-wonderful-nursery-whilst.trycloudflare.com", // Previous Cloudflare frontend tunnel
      "https://dui-pix-ate-ment.trycloudflare.com", // Current Cloudflare frontend tunnel
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
    ],
  })
); // allow React frontend from localhost and network IP (both HTTP and HTTPS)
app.use(bodyParser.json());

// Serve static files for blockchain artifacts
app.use("/artifacts", express.static(path.join(__dirname, "artifacts")));
app.use(
  "/contract-info.json",
  express.static(path.join(__dirname, "contract-info.json"))
);
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
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/secure-voting", secureVotingRoutes);
app.use("/api/test", testRoutes);
app.use("/api/simple-secure-voting", simpleSecureVotingRoutes);
app.use("/api/face-auth", faceAuthRoutes);
// -------------------
// DB Sync & Server Start
// -------------------
(async () => {
  try {
    // Log model associations for debugging
    console.log("📋 Model associations loaded:");
    console.log(
      `- User associations: ${Object.keys(User.associations).join(", ")}`
    );
    console.log(
      `- Vote associations: ${Object.keys(Vote.associations).join(", ")}`
    );
    console.log(
      `- VotingKey associations: ${Object.keys(VotingKey.associations).join(
        ", "
      )}`
    );

    await sequelize.sync({ alter: true }); // Keep schema updated without dropping data
    console.log("✅ Database synced successfully!");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT} and accessible on network`)
    );
  } catch (err) {
    console.error("❌ Sequelize sync error:", err);
    process.exit(1); // exit if DB fails
  }
})();
