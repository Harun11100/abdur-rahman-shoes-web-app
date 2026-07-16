import { NextResponse } from "next/server";
import Sale from "@/model/Sale";
import { connectDb } from "@/app/utils/db";

export async function PATCH(request) {
  try {
    await connectDb();

    // Parse data from incoming request body
    const body = await request.json();
    const { invoiceId, status = "Paid" } = body;

    if (!invoiceId) {
      return NextResponse.json({
        success: false,
        message: "Missing parameter details: invoiceId string required."
      }, { status: 400 });
    }

    // Mutate state ledger cleanly by custom unique ID path string
    const updatedSale = await Sale.findOneAndUpdate(
      { id: invoiceId },
      { $set: { status: status } },
      { new: true } // Return document state reflection post mutation
    );

    if (!updatedSale) {
      return NextResponse.json({
        success: false,
        message: `Target invoice row identifier ${invoiceId} could not be resolved inside MongoDB records.`
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoiceId} marked as successfully settled.`
    }, { status: 200 });

  } catch (error) {
    console.error("Mongoose balance mutation failure:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update target payment status."
    }, { status: 500 });
  }
}