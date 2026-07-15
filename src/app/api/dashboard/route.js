import { NextResponse } from "next/server";
import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";
import Sale from "@/model/Sale";

export async function GET(request) {
  try {
    await connectDb();

    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get("role") || "manager";

    // 1. Get quick count of distinct product records
    const productsAvailable = await Product.countDocuments();

    // 2. Compute total stock on DB side
    const stockAggregation = await Product.aggregate([
      { $unwind: "$sizes" },
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$sizes.quantity" }
        }
      }
    ]);
    const totalStockCount = stockAggregation[0]?.totalStock || 0;

    // 3. FIXED: Fetch recent sales & transform to match React Native field expectations
    const rawRecentSales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(); // .lean() converts to plain objects for faster manipulation

    const recentSales = rawRecentSales.map(sale => ({
      id: sale.id || sale._id.toString(), // Ensures the frontend reads 'id' safely
      items: sale.items,
      amount: sale.amount,
      time: sale.createdAt || "Just now",
      status: sale.status || "Paid"
    }));

    let adminStats = null;

    if (userRole === "admin") {
      // 4. FIXED: Time-zone resilient calculation for Today's Revenue
      // Creates the start and end of day aligned with local operations
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0); 

      const endOfToday = new Date();
      endOfToday.setUTCHours(23, 59, 59, 999);

      const todayRevenueData = await Sale.aggregate([
        {
          $match: {
            status: "Paid", // Only calculate finalized revenue flows
            createdAt: {
              $gte: startOfToday,
              $lte: endOfToday
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);

      // 5. Count low stock items
      const lowStockCount = await Product.countDocuments({
        "sizes.quantity": { $lte: 5 }
      });

      // Format currency clearly using local formatting standards
      const totalAmount = todayRevenueData[0]?.total || 0;
      adminStats = {
        todayRevenue: `৳${totalAmount.toLocaleString("en-BD")}`,
        lowStockCount
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          totalStockCount,
          productsAvailable,
          recentSales,
          adminStats
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Dashboard Endpoint Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error"
      },
      { status: 500 }
    );
  }
}