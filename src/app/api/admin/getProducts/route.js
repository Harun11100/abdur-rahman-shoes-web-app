import { NextResponse } from "next/server";
import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";

// Disable route response caching to ensure live inventory counts display instantly
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDb();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    let products = [];

    if (q && q.trim() !== "") {
      // --- Case A: Search query is active (Fetch filtered suggestions) ---
      const cleaned = q.trim();

      products = await Product.find({
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
          "prodImage prodCode prodName modelNumber costPrice sellingPrice sizeQuantities"
        )
        .limit(10)
        .lean();
    } else {
      // --- Case B: Initial catalog load (Fetch all/recent items) ---
      products = await Product.find({})
        .select(
          "prodImage prodCode prodName modelNumber costPrice sellingPrice sizeQuantities"
        )
        .sort({ updatedAt: -1 }) // Show recently updated products first
        .limit(50) // Adjust limit as needed for your page sizes
        .lean();
    }

    // Format response dynamically for React Native mapping structure
    const formattedProducts = products.map((product) => ({
      _id: product._id,
      id: product._id, // Add id as string for FlatList keyExtractors

      // Standardizing payload properties
      name: product.prodName,
      sku: product.prodCode,
      colorway: product.modelNumber || "Standard",
      costPrice: String(product.costPrice || "0"),
      sellingPrice: String(product.sellingPrice || "0"),
      images: product.prodImage || [],

      // Keeps original suggestions array fields intact
      model: product.prodCode,
      price: product.sellingPrice,

      // Convert Map schema values safely
      sizes: product.sizeQuantities || {},

      // Original database fields kept for backward compatibility
      prodCode: product.prodCode,
      prodName: product.prodName,
      modelNumber: product.modelNumber,
    }));

    return NextResponse.json({
      success: true,
      // Supporting both FlatList initialization and live UI query filtering
      data: formattedProducts,
      suggestions: formattedProducts, 
    });

  } catch (error) {
    console.error("Fetch Products Route Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}