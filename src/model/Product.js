import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";
import Sale from "@/model/Sale";
import { NextResponse } from "next/server";

// Forces the route to be evaluated dynamically on every single incoming request
export const dynamic = "force-dynamic";

export async function POST(request) {
  await connectDb();
  
  try {
    const body = await request.json();
    const { freshInvoice, updatedModelSku, updatedStockQty } = body;
    
    // String parsing optimization via RegEx matching
    const itemsString = freshInvoice.items || "";
    const sizeMatch = itemsString.match(/\(Size\s([^)]+)\)/);
    const parsedSize = sizeMatch ? sizeMatch[1] : "N/A";
    
    const qtyMatch = itemsString.match(/x(\d+)$/);
    const parsedQty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

    // 1. Create and save the log entry record
    const newSale = await Sale.create({
      id: freshInvoice.id,
      items: freshInvoice.items,
      amount: freshInvoice.amount, 
      time: freshInvoice.time,
      status: freshInvoice.status,
      productSku: updatedModelSku,
      quantitySold: parsedQty,
      sizeSold: parsedSize
    });

    // 2. Safely structure dynamic field mutations
    let updateOperation;

    if (parsedSize !== "N/A") {
      updateOperation = { 
        $set: { [`sizeQuantities.${parsedSize}`]: updatedStockQty[parsedSize] } 
      };
    } else {
      updateOperation = { $set: { sizeQuantities: updatedStockQty } };
    }

    await Product.findOneAndUpdate(
      { prodCode: updatedModelSku.toUpperCase() },
      updateOperation,
      { new: true }
    );

    return NextResponse.json({ success: true, data: newSale });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}