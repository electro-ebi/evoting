import bcrypt from "bcrypt";

// Replace these with your actual values
const inputPassword = "123"; // password you want to test
const storedHash =
  "$2b$10$Q75VaCVkTgmdarKgdVe4wO.9e0VHmrlQ1oPs1YiAPqTxe9WGjm1Ua"; // copy from DB

const checkPassword = async () => {
  try {
    const match = await bcrypt.compare(inputPassword, storedHash);

    if (match) {
      console.log("✅ Password matches the stored hash!");
    } else {
      console.log("❌ Password does NOT match the stored hash!");
    }
  } catch (err) {
    console.error("Error comparing password:", err);
  }
};

checkPassword();
