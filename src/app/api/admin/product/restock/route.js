import { NextResponse } from "next/server";
import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";

export async function PATCH(request) {
  try {
    await connectDb();

    const body = await request.json();

    const {
      formType,
      prodCode,
      quantityChanges,
      costPrice,
      sellingPrice,
    } = body;

    if (formType !== "restock_existing" || !prodCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload parameters.",
        },
        { status: 400 }
      );
    }

    const product = await Product.findOne({
      prodCode: {
        $regex: new RegExp(`^${prodCode}$`, "i"),
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Target shoe profile not found.",
        },
        { status: 404 }
      );
    }

    // Update Stock
    if (quantityChanges && Object.keys(quantityChanges).length > 0) {
      const updatedSizeQuantities = {
        ...product.sizeQuantities,
      };

      for (const [size, delta] of Object.entries(quantityChanges)) {
        const currentStock = Number(updatedSizeQuantities[size] || 0);
        const modifier = Number(delta || 0);
        const finalStock = currentStock + modifier;

        if (finalStock < 0) {
          return NextResponse.json(
            {
              success: false,
              message: `Size ${size} cannot have negative stock.`,
            },
            { status: 400 }
          );
        }

        updatedSizeQuantities[size] = String(finalStock);
      }

      product.sizeQuantities = updatedSizeQuantities;
    }

    // Update Cost Price
    if (costPrice !== undefined && costPrice !== "") {
      const parsedCost = Number(costPrice);

      if (isNaN(parsedCost) || parsedCost < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid cost price.",
          },
          { status: 400 }
        );
      }

      product.costPrice = parsedCost;
    }

    // Update Selling Price
    if (sellingPrice !== undefined && sellingPrice !== "") {
      const parsedSelling = Number(sellingPrice);

      if (isNaN(parsedSelling) || parsedSelling < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid selling price.",
          },
          { status: 400 }
        );
      }

      product.sellingPrice = parsedSelling;
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Inventory updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("PATCH Product Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}