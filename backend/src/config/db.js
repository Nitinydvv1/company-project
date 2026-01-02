const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  // Try Atlas URI first, fallback to local MongoDB
  const atlasUri = process.env.MONGODB_URI;
  const localUri = "mongodb://localhost:27017/emergencyDB";
  
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log("✅ MongoDB Atlas Connected");
    isConnected = true;
  } catch (atlasError) {
    console.warn("⚠️ MongoDB Atlas connection failed:", atlasError.message);
    console.log("Attempting to connect to local MongoDB...");
    
    try {
      await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ Local MongoDB Connected");
      isConnected = true;
    } catch (localError) {
      console.error("❌ Local MongoDB Error:", localError.message);
      console.log("\n📋 To fix this, either:");
      console.log("   1. Update MONGODB_URI in .env with a valid MongoDB Atlas connection string");
      console.log("   2. Install and start local MongoDB: brew install mongodb-community && brew services start mongodb-community");
      console.log("\n⚠️ Running with in-memory data (changes won't persist)...\n");
      isConnected = false;
    }
  }
};

const isDBConnected = () => isConnected;

module.exports = { connectDB, isDBConnected };
