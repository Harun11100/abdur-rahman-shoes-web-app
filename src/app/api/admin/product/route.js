import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";
import { NextResponse } from "next/server";


export async function POST(request) {
  try {
    // 1. Force state verification to avoid early pipeline disconnection drops
    await connectDb();

    // 2. Parse the body structure matching your React Native dynamic payload
    const body = await request.json();
    const { 
      formType, 
      prodCode, 
      prodName, 
      modelNumber, 
      selectedCategory, 
      selectedSize, 
      sizeQuantities, 
      costPrice, 
      sellingPrice 
    } = body;

    // Format the SKU safely to prevent lowercase token fragmentation
    const formattedSKU = prodCode ? prodCode.trim().toUpperCase() : "";

    if (!formattedSKU) {
      return NextResponse.json(
        { success: false, message: "A valid unique Base SKU/Model code is required." },
        { status: 400 }
      );
    }

    // ========================================================
    // ENGINE PIPELINE A: INITIALIZE FRESH CATALOG ENTRY
    // ========================================================
    if (formType === "new") {
      // Guard clause check to avoid overlapping database writes
      const duplicatedItem = await Product.findOne({ prodCode: formattedSKU });
      if (duplicatedItem) {
        return NextResponse.json(
          { success: false, message: `SKU "${formattedSKU}" already exists. Did you mean to toggle "Restock Existing"?` },
          { status: 400 }
        );
      }

      if (!prodName?.trim() || !sellingPrice) {
        return NextResponse.json(
          { success: false, message: "Shoe model name and selling price are mandatory fields." },
          { status: 400 }
        );
      }

      // Create the record directly with the client-provided size allocation map
      const createdShoe = await Product.create({
        prodCode: formattedSKU,
        prodName: prodName.trim(),
        modelNumber: modelNumber ? modelNumber.trim() : "",
        category: selectedCategory,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice),
        sizeQuantities: sizeQuantities || {}, // Saves the initial key-value dictionary object
      });

      return NextResponse.json(
        { success: true, message: "Catalog model initialized successfully.", data: createdShoe },
        { status: 201 }
      );
    }

    // ========================================================
    // ENGINE PIPELINE B: ATOMIC INCREMENTAL INBOUND RESTOCK
    // ========================================================
    if (formType === "restock") {
      if (!selectedSize) {
        return NextResponse.json(
          { success: false, message: "Target variant size must be highlighted to adjust storage allocations." },
          { status: 400 }
        );
      }

      // Isolate the batch size change input value from the submitted dictionary entry payload
      const batchIncrementCount = Number(sizeQuantities?.[selectedSize]) || 0;

      if (batchIncrementCount <= 0) {
        return NextResponse.json(
          { success: false, message: "Intake restock increment value must be greater than zero." },
          { status: 400 }
        );
      }

      // MongoDB atomic $inc operator natively targets specific map fields by dot notation
      const updatedShoeRegistry = await Product.findOneAndUpdate(
        { prodCode: formattedSKU },
        { $inc: { [`sizeQuantities.${selectedSize}`]: batchIncrementCount } },
        { new: true, runValidators: true } // Return modified fields and execute validation schemas
      );

      if (!updatedShoeRegistry) {
        return NextResponse.json(
          { success: false, message: `Shoe SKU profile line "${formattedSKU}" was not found in active records.` },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: `Successfully added ${batchIncrementCount} pairs to size ${selectedSize}.`, 
          data: updatedShoeRegistry 
        },
        { status: 200 }
      );
    }

    // Catch-all fallthrough error branch logic
    return NextResponse.json(
      { success: false, message: "Malformed pipeline transaction parameter configuration type." },
      { status: 400 }
    );

  } catch (error) {
    console.error("⛔ [API Route Exception Error Log]:", error);
    return NextResponse.json(
      { success: false, error: "Database transaction execution rejected.", details: error.message },
      { status: 500 }
    );
  }
}