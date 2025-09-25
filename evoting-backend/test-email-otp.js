import { sendOTP } from "./services/emailService.js";
import dotenv from "dotenv";

dotenv.config();

// Test email OTP functionality
const testEmailOTP = async () => {
  try {
    console.log("🧪 Testing Email OTP Integration...");
    
    // Test email (replace with your test email)
    const testEmail = process.env.TEST_EMAIL || "goodplasma123@gmail.com";
    const testOTP = "123456";
    
    console.log(`📧 Sending test OTP to: ${testEmail}`);
    console.log(`🔢 Test OTP: ${testOTP}`);
    
    await sendOTP(testEmail, testOTP);
    
    console.log("✅ Email OTP test completed successfully!");
    console.log("📝 Check your email for the verification code.");
    
  } catch (error) {
    console.error("❌ Email OTP test failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure EMAIL_USER and EMAIL_PASS are set in .env");
    console.log("2. Use an App Password for Gmail (not your regular password)");
    console.log("3. Enable 2-factor authentication on your Gmail account");
    console.log("4. Check if 'Less secure app access' is enabled (if not using App Password)");
  }
};

// Run the test
testEmailOTP();
