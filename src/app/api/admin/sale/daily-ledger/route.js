import { NextResponse } from "next/server";
import Sale from "@/model/Sale";       // Adjust this path to your Sale model
import { connectDb } from "@/app/utils/db";

export async function GET() {
  try {
    await connectDb();

    // 1. Set boundaries for today (Midnight to 11:59:59 PM local server time)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 2. Fetch all sales recorded today
    const salesToday = await Sale.find({
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    }).sort({ createdAt: -1 }); // Newest transactions first

    // 3. Calculate gross revenue for today
    const grossToday = salesToday.reduce((acc, sale) => {
      // Only include paid transactions in gross revenue if desired, or remove condition for absolute gross
      if (sale.status === "Paid") {
        return acc + sale.amount;
      }
      return acc;
    }, 0);

    // 4. Map the flat database document structures to match the frontend array blueprint
    const formattedSales = salesToday.map((sale) => ({
      id: sale.id,
      time: sale.time || "Just now",
      operator: "System POS", // Fallback placeholder since schema doesn't track operator yet
      status: sale.status,
      total: sale.amount,
      items: [
        {
          name: `${sale.items} (${sale.productSku}) [Size: ${sale.sizeSold}]`,
          qty: sale.quantitySold,
          price: sale.amount / sale.quantitySold, // Approximates unit price
        },
      ],
    }));

    return NextResponse.json({
      success: true,
      data: {
        grossToday,
        sales: formattedSales,
      },
    });

  } catch (error) {
    console.error("Ledger pipeline error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to compile the daily transaction matrix logs.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}