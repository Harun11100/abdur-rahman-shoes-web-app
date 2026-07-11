import mongoose from "mongoose";

const connection = {};

async function connectDb() {
  if (connection.isConnected) {
    console.log("✅ Already connected to the database.");
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;
    if (connection.isConnected === 1) {
      console.log("✅ Using previous database connection.");
      return;
    }
  }

  try {
    // ⚠️ CRITICAL: Ensure this variable name matches your .env.local exactly!
    if (!process.env.MONGODB_URL) {
      throw new Error("❌ MONGODB_URL is not defined in environment variables.");
    }

    const db = await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ New connection to the database established.");
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error("❌ Database connection error:", error);
    
    // 🛑 REMOVED process.exit(1) from here!
    // Instead, re-throw the error so your API route can safely log it and show it to you.
    throw error; 
  }
}

export { connectDb };