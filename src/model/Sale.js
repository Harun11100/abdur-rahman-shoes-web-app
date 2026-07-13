import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Invoice unique identifier string is required"],
      unique: true,
      trim: true,
      index: true, // Speeds up single lookup matches
    },
    items: {
      type: String,
      required: [true, "Description string of products sold is required"],
    },
    amount: {
      type: Number,
      required: [true, "Numeric amount field is required for monetary calculations"],
      min: [0, "Transaction revenue amount cannot be negative"],
    },
    time: {
      type: String,
      default: "Just now", // Preserves custom string labels passed down by mobile client
    },
    status: {
      type: String,
      required: true,
      enum: ["Paid", "Pending", "Refunded"],
      default: "Paid",
    },
    productSku: {
      type: String,
      required: [true, "The model SKU linking back to the catalog item is required"],
      trim: true,
      uppercase: true,
      index: true,
    },
    quantitySold: {
      type: Number,
      required: true,
      min: [1, "Must sell at least 1 unit to file an invoice log"],
    },
    sizeSold: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt native MongoDB dates
  }
);

// Prevent mongoose model re-compilation issues during Next.js Hot Module Replacement (HMR)
const Sale = mongoose.models.Sale || mongoose.model("Sale", SaleSchema);

export default Sale;