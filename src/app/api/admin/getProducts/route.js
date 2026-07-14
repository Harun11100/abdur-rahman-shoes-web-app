import { NextResponse } from "next/server";
import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDb();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    
    // Parse page and limit query params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    let products = [];
    let hasMore = false;

    if (q && q.trim() !== "") {
      const cleaned = q.trim();
      const queryFilter = {
        $or: [
          { prodCode: { $regex: cleaned, $options: "i" } },
          { prodName: { $regex: cleaned, $options: "i" } },
          { modelNumber: { $regex: cleaned, $options: "i" } },
        ],
      };

      // Get total count matching search to determine if there are more items
      const totalMatching = await Product.countDocuments(queryFilter);
      hasMore = skip + limit < totalMatching;

      products = await Product.find(queryFilter)
        .select("prodImage prodCode prodName modelNumber costPrice sellingPrice sizeQuantities")
        .skip(skip)
        .limit(limit)
        .lean();
    } else {
      // General catalog load (No active search query)
      const totalProducts = await Product.countDocuments({});
      hasMore = skip + limit < totalProducts;

      products = await Product.find({})
        .select("prodImage prodCode prodName modelNumber costPrice sellingPrice sizeQuantities")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    // Format response values safely
    const formattedProducts = products.map((product) => ({
      _id: product._id,
      id: product._id,
      name: product.prodName,
      sku: product.prodCode,
      colorway: product.modelNumber || "Standard",
      costPrice: String(product.costPrice || "0"),
      sellingPrice: String(product.sellingPrice || "0"),
      images: product.prodImage || [],
      model: product.prodCode,
      price: product.sellingPrice,
      sizes: product.sizeQuantities || {},
      prodCode: product.prodCode,
      prodName: product.prodName,
      modelNumber: product.modelNumber,
    }));

    return NextResponse.json({
      success: true,
      data: formattedProducts,
      suggestions: formattedProducts, 
      hasMore, // Mobile client uses this to stop scroll fetching
    });

  } catch (error) {
    console.error("Fetch Products Route Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}