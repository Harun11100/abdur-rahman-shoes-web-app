import { connectDb } from "@/app/utils/db";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    // Connect database
    await connectDb();

    const { id } =await params;

    // Find manager first
    const manager = await User.findById(id);

    if (!manager) {
      return NextResponse.json(
        {
          success: false,
          message: "Manager not found.",
        },
        { status: 404 }
      );
    }

    // Check role
    if (manager.role !== "manager") {
      return NextResponse.json(
        {
          success: false,
          message: "This user is not a manager.",
        },
        { status: 400 }
      );
    }

    // Delete manager
    await User.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Manager deleted successfully.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete Manager Error:", error);

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