import { connectDb } from "@/app/utils/db";
import Admin from "@/model/Admin";
import User from "@/model/User";
import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect"; // Ensure you import your DB connection function
import bcrypt from "bcryptjs"; // Use this if your passwords are encrypted/hashed

export async function POST(request) {
  try {
    // CRITICAL: Ensure database connection is active before running queries
     await connectDb(); 

    // 1. Extract body content safely
    const body = await request.json();
    const { email, password, role } = body;

    // 2. Validate input baseline constraints
    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Missing security credentials or missing target system role." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.trim().toLowerCase();

    // 3. Handle authorization verification branching depending on role
    let userRecord = null;

    if (cleanRole === "admin") {
      userRecord = await Admin.findOne({ email: cleanEmail });
    } else if (cleanRole === "manager") {
      userRecord = await User.findOne({ email: cleanEmail });
    } else {
      return NextResponse.json(
        { success: false, message: "Unauthorized authorization scope layout requested." },
        { status: 400 }
      );
    }

    // 4. Handle account mismatch/not found failures
    if (!userRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials. Please verify data and try again." },
        { status: 401 }
      );
    }

    // FIXED: Password Matching Logic
 
    // Option B: If you are using hashed passwords with bcrypt (Highly Recommended):
    const isPasswordCorrect = await bcrypt.compare(password, userRecord.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials. Please verify data and try again." },
        { status: 401 }
      );
    }

    // 5. Return sanitized data back to client application layouts
    return NextResponse.json(
      {
        success: true,
        message: "Authentication successful.",
        data: {
          id: userRecord._id || userRecord.id, // Mongoose defaults to _id
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.role || cleanRole, // fallback if role isn't explicitly saved in DB field
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Authentication router engine failure:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error occurred processing configuration profile." },
      { status: 500 }
    );
  }
}