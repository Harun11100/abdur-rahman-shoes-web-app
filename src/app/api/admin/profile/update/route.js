import { NextResponse } from "next/server";
import { connectDb } from "@/app/utils/db";
import Admin from "@/model/Admin";

export async function PUT(request) {
  try {
    await connectDb();

    const body = await request.json();

    const {
      userId,
      name,
      email,
      image,
    } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin ID is required.",
        },
        { status: 400 }
      );
    }

    const existingUser = await Admin.findById(userId);

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found.",
        },
        { status: 404 }
      );
    }

    // Prevent duplicate email
    if (
      email &&
      email !== existingUser.email
    ) {
      const emailExists = await Admin.findOne({
        email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists.",
          },
          { status: 409 }
        );
      }
    }

    existingUser.name = name ?? existingUser.name;
    existingUser.email = email ?? existingUser.email;
    existingUser.image = image ?? existingUser.image;

    await existingUser.save();

    const user = existingUser.toObject();
    delete user.password;

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        data: user,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Update Profile Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 }
    );
  }
}