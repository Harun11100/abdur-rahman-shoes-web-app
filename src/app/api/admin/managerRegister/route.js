import { NextResponse } from "next/server";
import User from "@/model/User";
import { connectDb } from "@/app/utils/db";


export async function POST(request) {
  try {
    // 1. Establish database connection
    await connectDb();

    // 2. Parse incoming body data
    const { name, email, password, image } = await request.json();

    // 3. Simple check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered." },
        { status: 400 }
      );
    }

    // 4. Create the new user document
    const newUser = await User.create({
      name,
      email,
      password, // Note: In production, hash this first using bcryptjs!
      image
    });

    return NextResponse.json(
      { success: true, data: { id: newUser._id, name: newUser.name, email: newUser.email, image: newUser.image } },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}