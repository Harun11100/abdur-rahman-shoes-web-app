import { NextResponse } from "next/server";
import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";
import Sale from "@/model/Sale";


export async function GET(request) {

  try {

    await connectDb();


    const { searchParams } = new URL(request.url);

    const userRole = searchParams.get("role") || "manager";



    // 1. Total products count
    const productsAvailable = await Product.countDocuments();



    // 2. Calculate total stock
    const stockAggregation = await Product.aggregate([
      {
        $unwind: "$sizes",
      },
      {
        $group: {
          _id: null,
          totalStock: {
            $sum: "$sizes.quantity",
          },
        },
      },
    ]);


    const totalStockCount =
      stockAggregation[0]?.totalStock || 0;




    // 3. Recent sales
    const rawRecentSales = await Sale.find()
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean();



    const recentSales = rawRecentSales.map((sale) => ({
      id:
        sale.id ||
        sale._id.toString(),

      items: sale.items,

      amount: sale.amount,

      time:
        sale.createdAt ||
        "Just now",

      status:
        sale.status ||
        "Paid",
    }));







    let adminStats = null;



    if (userRole === "admin") {



      // 4. Today's revenue

      const startOfToday = new Date();

      startOfToday.setHours(
        0,
        0,
        0,
        0
      );


      const endOfToday = new Date();

      endOfToday.setHours(
        23,
        59,
        59,
        999
      );



      const todayRevenueData =
        await Sale.aggregate([

          {
            $match: {

              status: "Paid",

              createdAt: {
                $gte: startOfToday,
                $lte: endOfToday,
              },

            },
          },


          {
            $group: {

              _id: null,

              total: {
                $sum: "$amount",
              },

            },
          },

        ]);




      // 5. Low stock products

      const lowStockCount =
        await Product.countDocuments({

          "sizes.quantity": {
            $lte: 5,
          },

        });





      const todayRevenue =
        todayRevenueData[0]?.total || 0;




      adminStats = {

        todayRevenue:
          `৳${todayRevenue.toLocaleString("en-BD")}`,


        lowStockCount,

      };


    }







    // 6. Current month sales statistics


    const now = new Date();



    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );


    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );




    const currentMonthSalesData =
      await Sale.aggregate([

        {
          $match: {

            status: "Paid",

            createdAt: {

              $gte: startOfMonth,

              $lte: endOfMonth,

            },

          },

        },


        {
          $group: {

            _id: null,


            totalRevenue: {

              $sum: "$amount",

            },


            totalQuantity: {

              $sum: "$quantitySold",

            },


            totalOrders: {

              $sum: 1,

            },


            totalProfit: {

              $sum: {

                $subtract: [

                  "$amount",

                  {

                    $multiply: [

                      "$costPrice",

                      "$quantitySold",

                    ],

                  },

                ],

              },

            },


          },

        },

      ]);





    const currentMonthSales = {

      revenue:
        currentMonthSalesData[0]?.totalRevenue || 0,


      quantity:
        currentMonthSalesData[0]?.totalQuantity || 0,


      orders:
        currentMonthSalesData[0]?.totalOrders || 0,


      profit:
        currentMonthSalesData[0]?.totalProfit || 0,

    };







    return NextResponse.json(

      {

        success: true,

        data: {

          totalStockCount,

          productsAvailable,

          recentSales,

          adminStats,

          currentMonthSales,

        },

      },

      {
        status: 200,
      }

    );



  } catch (error) {


    console.error(
      "Dashboard Endpoint Error:",
      error
    );



    return NextResponse.json(

      {

        success: false,

        message:
          "Internal Server Error",

        error:
          error.message,

      },

      {
        status: 500,
      }

    );

  }

}