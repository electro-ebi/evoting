import { sequelize } from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    console.log("🔍 Checking existing admin users...");
    
    // Find existing admin users
    const existingAdmins = await User.findAll({
      where: { role: "admin" },
      attributes: ['id', 'name', 'email', 'isVerified', 'role']
    });
    
    console.log(`Found ${existingAdmins.length} admin user(s):`);
    existingAdmins.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Verified: ${user.isVerified}`);
    });
    
    // Delete existing admin users
    if (existingAdmins.length > 0) {
      await User.destroy({ where: { role: "admin" } });
      console.log("🗑️ Deleted existing admin users");
    }
    
    // Create new admin user with proper password hashing
    const plainPassword = "admin123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    const admin = await User.create({
      name: "Admin User",
      email: "admin@evoting.com",
      password: hashedPassword,
      role: "admin",
      aadhaarNumber: "123456789012",
      voterId: "ADMIN0001",
      phoneNumber: "+1234567890",
      isVerified: true
    });
    
    console.log("✅ New admin user created successfully!");
    console.log(`📧 Email: admin@evoting.com`);
    console.log(`🔑 Password: admin123`);
    console.log(`✅ Verified: ${admin.isVerified}`);
    console.log(`👤 Role: ${admin.role}`);
    
    // Test login
    console.log("\n🧪 Testing login...");
    const testUser = await User.findOne({ where: { email: "admin@evoting.com" } });
    const isPasswordValid = await bcrypt.compare(plainPassword, testUser.password);
    console.log(`🔐 Password validation: ${isPasswordValid ? "✅ Valid" : "❌ Invalid"}`);
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await sequelize.close();
  }
};

createAdmin();
