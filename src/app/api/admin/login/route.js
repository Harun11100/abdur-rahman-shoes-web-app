import { connectDb } from "@/app/utils/db";
import Admin from "@/model/Admin";
import User from "@/model/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // Connect to the database
    await connectDb();

    // Parse request body
    const body = await request.json();
    const { email, password, role, expoToken } = body;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, and role are required.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.trim().toLowerCase();

    let userRecord;

    // Find user based on role and explicitly include password
    if (cleanRole === "admin") {
      userRecord = await Admin.findOne({
        email: cleanEmail,
      }).select("+password");
    } else if (cleanRole === "manager") {
      userRecord = await User.findOne({
        email: cleanEmail,
      }).select("+password");
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role.",
        },
        { status: 400 }
      );
    }

    // User not found
    if (!userRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Safety check
    if (!userRecord.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password not found for this account.",
        },
        { status: 500 }
      );
    }

    // Compare hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      userRecord.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Optional: Update last login for admins
    if (cleanRole === "admin") {
        if (expoToken) {
      userRecord.expoToken = expoToken;
    }
      userRecord.lastLogin = new Date();
      await userRecord.save();
    }

    // Remove password before sending response
    const user = userRecord.toObject();
    delete user.password;

    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          image: user.image,
          isVerified: user.isVerified
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Authentication Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}