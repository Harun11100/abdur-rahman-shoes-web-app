import { connectDb } from "@/app/utils/db";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Connect to database
    await connectDb();

    // Fetch only managers and exclude password
    const managers = await User.find(
      { role: "manager" },
      "-password"
    );

    return NextResponse.json(
      {
        success: true,
        message: "Managers retrieved successfully.",
        data: managers,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Get Managers Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}