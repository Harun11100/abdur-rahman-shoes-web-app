import { NextResponse } from "next/server";

import { connectDb } from "@/app/utils/db";
import bcrypt from "bcryptjs";
import Admin from "@/model/Admin";

export async function POST(request) {
  try {
    // Connect to database
    await connectDb();

    // Parse request body
    const { name, email, password, image } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required.",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await Admin.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is already registered.",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      image,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          image: newUser.image,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}