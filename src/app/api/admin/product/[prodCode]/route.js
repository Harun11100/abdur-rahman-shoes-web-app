import { connectDb } from "@/app/utils/db";
import Product from "@/model/Product";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await connectDb();
    const { prodCode } = req.query;

    if (!prodCode) {
      return res.status(400).json({ success: false, message: "Product SKU / Code is required." });
    }

    // Lookup product profile using the uppercase code structure matching client configuration
    const product = await Product.findOne({ prodCode: prodCode.toUpperCase() });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Model number "${prodCode}" could not be recognized inside inventory ledgers.`,
      });
    }

    // Map database properties to match what your front-end state expects,
    // including costPrice and sellingPrice cast explicitly as strings.
    return res.status(200).json({
      success: true,
      data: {
        prodName: product.prodName,
        prodCode: product.prodCode,
        selectedCategory: product.category, // maps to selectedCategory on client
        sizeQuantities: product.sizeQuantities, // object containing stringified numbers, e.g., {"39": "4"}
        costPrice: String(product.costPrice ?? "0"),
        sellingPrice: String(product.sellingPrice ?? "0"),
      },
    });
  } catch (error) {
    console.error("Database lookup error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}