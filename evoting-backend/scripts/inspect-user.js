import dotenv from "dotenv";
import { sequelize, User } from "../models/index.js";

dotenv.config();

const run = async () => {
  try {
    const emailArg = process.argv[2];
    if (!emailArg) {
      console.log("Usage: node scripts/inspect-user.js <email>");
      process.exit(1);
    }

    await sequelize.authenticate();

    const user = await User.findOne({ where: { email: emailArg } });
    if (!user) {
      console.log("User not found");
      return;
    }

    console.log(JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      password: user.password
    }, null, 2));
  } catch (err) {
    console.error("Error inspecting user:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

run();


