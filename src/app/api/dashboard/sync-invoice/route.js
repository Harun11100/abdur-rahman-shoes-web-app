import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";
import Sale from "@/model/Sale";
import Admin from "@/model/Admin";

export async function POST(request) {
  await connectDb();

  try {
    const body = await request.json();

    const { freshInvoice, updatedModelSku, updatedStockQty } = body;

    const parsedSize =
      freshInvoice.items.split("(Size ")[1]?.split(")")[0] || "N/A";

    const parsedQty = parseInt(
      freshInvoice.items.split("x").pop() || "1",
      10
    );

    // Save Sale
    const newSale = await Sale.create({
      id: freshInvoice.id,
      items: freshInvoice.items,
      amount: freshInvoice.amount,
      time: freshInvoice.time,
      status: freshInvoice.status,
      productSku: updatedModelSku,
      quantitySold: parsedQty,
      sizeSold: parsedSize,
    });

    // Update Product Stock
    await Product.findOneAndUpdate(
      { prodCode: updatedModelSku },
      {
        $set: {
          sizeQuantities: updatedStockQty,
        },
      }
    );

    // Get all admins with Expo tokens
    const admins = await Admin.find({
      expoToken: {
        $exists: true,
        $ne: "",
      },
    }).select("expoToken name");

    // Send push notifications
    if (admins.length) {
      const messages = admins.map((admin) => ({
        to: admin.expoToken,
        sound: "default",
        title: "🛒 New Sale",
        body: `${updatedModelSku} | Size ${parsedSize} | Qty ${parsedQty} sold`,
        data: {
          saleId: newSale._id,
          sku: updatedModelSku,
        },
      }));

      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
      });
    }

    return Response.json({
      success: true,
      data: newSale,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 400,
      }
    );
  }
}