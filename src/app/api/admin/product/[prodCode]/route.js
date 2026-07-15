import { NextResponse } from "next/server";
import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";

export async function GET(request, { params }) {
  try {
    await connectDb();

    const { prodCode } = await params;

    if (!prodCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Product SKU / Code is required.",
        },
        { status: 400 }
      );
    }

    const product = await Product.findOne({
      prodCode: prodCode.toUpperCase(),
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: `Product "${prodCode}" not found.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        prodName: product.prodName,
        prodCode: product.prodCode,
        selectedCategory: product.category,
        sizeQuantities: product.sizeQuantities,
        costPrice: String(product.costPrice ?? "0"),
        sellingPrice: String(product.sellingPrice ?? "0"),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}