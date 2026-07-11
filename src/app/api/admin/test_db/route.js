import { NextResponse } from "next/server";
import mongoose from "mongoose"; // Replace with MongoClient if you are using raw mongodb driver

export async function GET() {
  try {
    // 1. Check the readyState of the connection
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          message: "MongoDB database............................... is not connected.", 
          readyState: mongoose.connection.readyState 
        },
        { status: 503 } // Service Unavailable
      );
    }

    // 2. Optional: Run a lightweight admin ping to ensure the server responds
    const dbAdmin = mongoose.connection.db.admin();
    const pingResult = await dbAdmin.ping();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully connected to MongoDB!",
        databaseName: mongoose.connection.name,
        ping: pingResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database test route failure:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while testing the database connection.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}