import dotenv from "dotenv";
import { sequelize, User } from "../models/index.js";

dotenv.config();

const run = async () => {
  try {
    await sequelize.authenticate();

    const totalBefore = await User.count();
    const deleted = await User.destroy({ where: { role: ["voter"] } });

    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["id", "name", "email", "role", "isVerified"],
    });

    console.log(JSON.stringify({ totalBefore, deleted, admins }, null, 2));
  } catch (err) {
    console.error("Error deleting non-admin users:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

run();


