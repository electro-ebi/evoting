import { sequelize } from "./config/db.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const fixAdminUser = async () => {
  try {
    console.log("🔍 Checking admin users...");
    
    // Find all users with admin role
    const adminUsers = await User.findAll({
      where: { role: "admin" },
      attributes: ['id', 'name', 'email', 'isVerified', 'role']
    });
    
    console.log(`Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Verified: ${user.isVerified}`);
    });
    
    if (adminUsers.length > 0) {
      // Update all admin users to be verified
      await User.update(
        { isVerified: true },
        { where: { role: "admin" } }
      );
      
      console.log("✅ All admin users have been verified!");
      
      // Show updated users
      const updatedAdmins = await User.findAll({
        where: { role: "admin" },
        attributes: ['id', 'name', 'email', 'isVerified', 'role']
      });
      
      console.log("Updated admin users:");
      updatedAdmins.forEach(user => {
        console.log(`- ${user.name} (${user.email}) - Verified: ${user.isVerified}`);
      });
    } else {
      console.log("No admin users found. Creating a new admin user...");
      
      // Create a new admin user
      const newAdmin = await User.create({
        name: "Admin User",
        email: "admin@evoting.com",
        password: "$2b$10$Q75VaCVkTgmdarKgdVe4wO.9e0VHmrlQ1oPs1YiAPqTxe9WGjm1Ua", // password: "admin123"
        role: "admin",
        aadhaarNumber: "123456789012",
        phoneNumber: "+1234567890",
        isVerified: true
      });
      
      console.log("✅ New admin user created:");
      console.log(`- Email: admin@evoting.com`);
      console.log(`- Password: admin123`);
      console.log(`- Verified: ${newAdmin.isVerified}`);
    }
    
  } catch (error) {
    console.error("❌ Error fixing admin user:", error);
  } finally {
    await sequelize.close();
  }
};

fixAdminUser();
