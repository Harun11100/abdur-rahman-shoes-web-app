import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await connectDb();
    const { formType, prodCode, quantityChanges, costPrice, sellingPrice } = req.body;

    // Validate request structure safely (quantityChanges is now optional if only updating price)
    if (formType !== "restock_existing" || !prodCode) {
      return res.status(400).json({ success: false, message: "Invalid payload parameters." });
    }

    // 1. Fetch current profile configuration to update details safely
    const product = await Product.findOne({ prodCode: prodCode.toUpperCase() });

    if (!product) {
      return res.status(404).json({ success: false, message: "Target shoe profile not found." });
    }

    // 2. Process the delta modifier pairs (+/- adjustments) from client payload if they exist
    if (quantityChanges && Object.keys(quantityChanges).length > 0) {
      const updatedSizeQuantities = { ...product.sizeQuantities };

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
      
      // Update the storage counts directly inside the product document
      product.sizeQuantities = updatedSizeQuantities;
    }

    // 3. Process and update cost pricing metrics if provided
    if (costPrice !== undefined && costPrice !== null && costPrice !== "") {
      const parsedCost = parseFloat(costPrice);
      if (!isNaN(parsedCost) && parsedCost >= 0) {
        product.costPrice = parsedCost;
      } else {
        return res.status(400).json({ success: false, message: "Invalid cost price format." });
      }
    }

    // 4. Process and update selling pricing metrics if provided
    if (sellingPrice !== undefined && sellingPrice !== null && sellingPrice !== "") {
      const parsedSelling = parseFloat(sellingPrice);
      if (!isNaN(parsedSelling) && parsedSelling >= 0) {
        product.sellingPrice = parsedSelling;
      } else {
        return res.status(400).json({ success: false, message: "Invalid selling price format." });
      }
    }

    // 5. Commit all structural changes securely to MongoDB
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Inventory metrics and pricing sheets successfully updated inside data catalogs.",
    });
  } catch (error) {
    console.error("Database update error:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
}