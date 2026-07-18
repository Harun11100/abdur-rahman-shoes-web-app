import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";
import Sale from "@/model/Sale";
import Admin from "@/model/Admin";

export async function POST(request) {
  await connectDb();

  try {
    const body = await request.json();

    const { 
      freshInvoice, 
      updatedModelSku, 
      updatedStockQty,
      productInfo 
    } = body;


    const parsedSize =
      freshInvoice.items.split("(Size ")[1]?.split(")")[0] || "N/A";


    const parsedQty = parseInt(
      freshInvoice.items.split("x").pop() || "1",
      10
    );


    /*
      Calculate pricing
      productInfo should contain:
      {
        sellingPrice,
        costPrice
      }
    */

    const unitPrice = productInfo?.sellingPrice || 0;

    const costPrice = productInfo?.costPrice || 0;


    // Save Sale
    const newSale = await Sale.create({

      id: freshInvoice.id,

      items: freshInvoice.items,

      amount: freshInvoice.amount,

      unitPrice,

      costPrice,

      saleDate: new Date(),

      time: freshInvoice.time,

      status: freshInvoice.status || "Paid",

      productSku: updatedModelSku,

      quantitySold: parsedQty,

      sizeSold: parsedSize,


      paymentMethod:
        freshInvoice.paymentMethod || "Cash",


      customerName:
        freshInvoice.customerName || "",


      customerPhone:
        freshInvoice.customerPhone || "",
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


      const response = await fetch(
        "https://exp.host/--/api/v2/push/send",
        {
          method: "POST",

          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },

          body: JSON.stringify(messages),
        }
      );


      const json = await response.json();

      console.log(
        "Expo Notification:",
        JSON.stringify(json, null, 2)
      );
    }



    return Response.json(
      {
        success: true,
        data: newSale,
      },
      {
        status: 201,
      }
    );


  } catch (error) {

    console.error("Sale API Error:", error);


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