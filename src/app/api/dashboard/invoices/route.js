import { NextResponse } from "next/server";
// Adjust this import to your database connection helper path
import Sale from "@/model/Sale"; // Adjust this import to your Sale model file path
import { connectDb } from "@/app/utils/db";

export async function GET(request) {
  try {
    // Ensure database connection is active
    await connectDb();


    // Extract query string search metrics from request context URL
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "Pending";
    const search = searchParams.get("search")?.trim() || "";

    // Base database filters targeting status type
    const queryConditions = { status: status };

    // If search text exists, check name, phone, or invoice id
    if (search) {
      queryConditions.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } }
      ];
    }

    // Sort by newest entries first
    const databaseSales = await Sale.find(queryConditions)
      .sort({ createdAt: -1 })
      .lean(); // .lean() returns plain JavaScript objects for faster execution

    // Map Mongoose schema properties cleanly onto React Native state identifiers
    const formattedInvoices = databaseSales.map((sale) => ({
      id: sale.id,
      customerName: sale.customerName || "Walking Customer",
      // Remapping customerPhone (DB) to phoneNumber (UI Expectation)
      phoneNumber: sale.customerPhone || "N/A", 
      items: sale.items,
      amount: sale.amount,
      time: sale.time,
      status: sale.status,
      productSku: sale.productSku,
      quantitySold: sale.quantitySold,
      sizeSold: sale.sizeSold
    }));

    return NextResponse.json({
      success: true,
      count: formattedInvoices.length,
      data: formattedInvoices
    }, { status: 200 });

  } catch (error) {
    console.error("Mongoose transaction query failure:", error);
    return NextResponse.json({
      success: false,
      message: "Ledger lookup error encountered."
    }, { status: 500 });
  }
}