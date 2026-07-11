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
    if (!process.env.MONGODB_URL) {
      throw new Error("❌ MONGODB_URL is not defined in environment variables.");
    }

    const db = await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ New connection to the database established.");
    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1); // Exit the process if connection fails
  }
}

// async function disconnectDb() {
//   if (connection.isConnected) {
//     try {
//       await mongoose.disconnect();
//       connection.isConnected = false;
//       console.log("🔴 Database disconnected.");
//     } catch (error) {
//       console.error("❌ Error disconnecting database:", error);
//     }
//   }
// }

// Automatically disconnect the database when the process exits
process.on("SIGINT", async () => {
  // await disconnectDb();
  process.exit(0);
});

export { connectDb };

