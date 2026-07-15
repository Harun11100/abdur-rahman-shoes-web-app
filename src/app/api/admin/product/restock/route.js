import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await connectDb();
    const { formType, prodCode, quantityChanges } = req.body;

    // Validate request structure safely
    if (formType !== "restock_existing" || !prodCode || !quantityChanges) {
      return res.status(400).json({ success: false, message: "Invalid payload parameters." });
    }

    // 1. Fetch current profile configuration to update details safely
    const product = await Product.findOne({ prodCode: prodCode.toUpperCase() });

    if (!product) {
      return res.status(404).json({ success: false, message: "Target shoe profile not found." });
    }

    // 2. Clone the existing size metrics to manipulate them
    const updatedSizeQuantities = { ...product.sizeQuantities };

    // 3. Process the delta modifier pairs (+/- adjustments) from client payload
    for (const [size, delta] of Object.entries(quantityChanges)) {
      const currentStock = parseInt(updatedSizeQuantities[size] || 0, 10);
      const modifier = parseInt(delta, 10) || 0;
      const finalCalculation = currentStock + modifier;

      // Business logic safeguard: Prevent inventory counts from sinking beneath zero
      if (finalCalculation < 0) {
        return res.status(400).json({
          success: false,
          message: `Operation aborted. Adjustments would cause Size ${size} inventory status to drop into negative volumes.`,
        });
      }

      // Convert back to string representation as managed by the front-end matrix inputs
      updatedSizeQuantities[size] = String(finalCalculation);
    }

    // 4. Update the storage counts directly inside MongoDB
    product.sizeQuantities = updatedSizeQuantities;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Inventory metrics successfully incremented inside data catalogs.",
    });
  } catch (error) {
    console.error("Database update error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
}