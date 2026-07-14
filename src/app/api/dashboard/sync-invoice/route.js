
import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";
import Sale from "@/model/Sale";

export async function POST(request) {
  await connectDb();
  
  try {
    const body = await request.json();
    const { freshInvoice, updatedModelSku, updatedStockQty } = body;
    // Parse the data out of the text string structured by the mobile frontend
    // Example string format from React Native: "Nike Air Max (Size 42) x2"
    const parsedSize = freshInvoice.items.split("(Size ")[1]?.split(")")[0] || "N/A";
    const parsedQty = parseInt(freshInvoice.items.split("x")?.pop() || "1", 10);

    // 1. Create and save the new Invoice record
    const newSale = await Sale.create({
      id: freshInvoice.id,
      items: freshInvoice.items,
      amount: freshInvoice.amount, // Preserved as a pure numeric item
      time: freshInvoice.time,
      status: freshInvoice.status,
      productSku: updatedModelSku,
      quantitySold: parsedQty,
      sizeSold: parsedSize
    });

    // 2. Update the product catalog array quantities inside MongoDB
    await Product.findOneAndUpdate(
      { prodCode: updatedModelSku},
      { $set: { sizeQuantities: updatedStockQty } } // Syncs size structure directly
    );

    return Response.json({ success: true, data: newSale });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 400 });
  }
}