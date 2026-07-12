import { NextResponse } from "next/server";
import Admin from "@/model/Admin";
import User from "@/model/User";
import { connectDb } from "@/app/utils/db";
// import dbConnect from "@/lib/dbConnect"; // Ensure you import your DB connection function
import bcrypt from "bcryptjs"; // Recommended for hashing passwords

export async function POST(request) {
  try {
    // 1. CRITICAL: Ensure database connection is active in serverless context
    await connectDb(); 

    // 2. Parse incoming request parameters payload
    const body = await request.json();
    const { name, email, employeeId, role, password, image } = body;

    // 3. Baseline validation rules infrastructure checks
    if (!name || !email || !employeeId || !role || !password) {
      return NextResponse.json(
        { success: false, message: "Missing registration profile data fields." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.trim().toLowerCase();
    const cleanEmployeeId = employeeId.trim().toUpperCase();

    // 4. Determine targeted schema and verify that account registry doesn't exist yet
    let targetModel;
    if (cleanRole === "admin") {
      targetModel = Admin;
    } else if (cleanRole === "manager") {
      targetModel = User;
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid system clearance level target requested." },
        { status: 400 }
      );
    }

    // Ensure the email or employee registry ID is unique globally
    const structuralConflict = await targetModel.findOne({
      $or: [{ email: cleanEmail }, { employeeId: cleanEmployeeId }],
    });

    if (structuralConflict) {
      return NextResponse.json(
        { success: false, message: "An operational profile with this email or Employee ID already exists." },
        { status: 409 }
      );
    }



     const finalPassword = await bcrypt.hash(password, 10);

    // 6. Persist document payload onto matching database structure
    const newProfile = await targetModel.create({
      name: name.trim(),
      email: cleanEmail,
      employeeId: cleanEmployeeId,
      role: cleanRole,
      password: finalPassword,
      image: image || null, // Stores cloud image string link or fallback null reference
    });

    // 7. Dispatch success confirmation matrix back down onto application state
    return NextResponse.json(
      {
        success: true,
        message: "Profile deployed onto centralized live authorization nodes successfully.",
        data: {
          id: newProfile._id,
          name: newProfile.name,
          email: newProfile.email,
          employeeId: newProfile.employeeId,
          role: cleanRole,
          image: newProfile.image,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Centralized profile provision backend breakdown:", error);
    return NextResponse.json(
      { success: false, message: "Internal server compilation execution anomaly detected." },
      { status: 500 }
    );
  }
}