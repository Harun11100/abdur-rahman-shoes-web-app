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
        suggestions: []
      });
    }

    const cleaned = q.trim();

    // 1. Efficiently query only the matching records
    const products = await Product.find({
      $or: [
        { prodCode: { $regex: cleaned, $options: "i" } },
        { prodName: { $regex: cleaned, $options: "i" } }
      ]
    })
    .select("prodCode prodName price sizes") // Only fetch what's actually needed
    .limit(10)
    .lean(); // Converts to plain JS objects for faster processing and lower memory usage

    // 2. Map database fields to match React Native properties (model & name)
    const formattedSuggestions = products.map((product) => ({
      model: product.prodCode,
      name: product.prodName,
      price: product.price,
      sizes: product.sizes
    }));

    return NextResponse.json({
      success: true,
      suggestions: formattedSuggestions
    });

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error"
      },
      { status: 500 }
    );
  }
}