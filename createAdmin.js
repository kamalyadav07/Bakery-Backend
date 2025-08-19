import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";  // yahan tumhara User model ka path lagana

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const admin = new User({
      name: "Admin",
      email: "admin@bakery.com",
      password: "admin123",   // ensure tumhare model me password hashing ho
      phone: "9876543210",    // 👈 yeh add karo
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    mongoose.connection.close();
  }
}

createAdmin();
