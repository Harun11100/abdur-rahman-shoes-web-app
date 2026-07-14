import { NextResponse } from "next/server";
import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";

export async function GET(request) {
  try {
    await connectDb();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const cleaned = q.trim();

    const products = await Product.find({
      $or: [
        {
          prodCode: {
            $regex: cleaned,
            $options: "i",
          },
        },
        {
          prodName: {
            $regex: cleaned,
            $options: "i",
          },
        },
        {
          modelNumber: {
            $regex: cleaned,
            $options: "i",
          },
        },
      ],
    })
      .select(
        "prodCode prodName modelNumber sellingPrice sizeQuantities"
      )
      .limit(10)
      .lean();


    // Format response for React Native
    const formattedSuggestions = products.map((product) => ({
      _id: product._id,

      // Keep frontend compatibility
      model: product.prodCode,
      name: product.prodName,
      images:product.prodImage|| [], 
      price: product.sellingPrice,

      // Convert MongoDB Map into normal object
      sizes: product.sizeQuantities || {},

      // Original database fields if needed later
      prodCode: product.prodCode,
      prodName: product.prodName,
      modelNumber: product.modelNumber,
    }));


    return NextResponse.json({
      success: true,
      suggestions: formattedSuggestions,
    });

  } catch (error) {
    console.error("Search Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}