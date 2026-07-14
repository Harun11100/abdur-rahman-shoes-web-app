import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  { 
    prodImage:[{
      public_id: {
        type: String
      },
      url: {
        type: String
      }
    }],
    prodCode: {
      type: String,
      required: [true, "Please provide a unique base SKU or product code."],
      unique: true, // Prevents catastrophic overwrites of shoe SKU lines
      trim: true,
      uppercase: true, // Ensures "nke-airmax" matches "NKE-AIRMAX" safely
    },
    prodName: {
      type: String,
      required: [true, "Please provide the shoe model name."],
      trim: true,
      maxlength: [100, "Model name cannot exceed 100 characters."],
    },
    modelNumber: {
      type: String, // Tracks colorway / article code from form (e.g., Black-Crimson-004)
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Please select the target customer segment."],
      enum: ["Men", "Women", "Children"], // Extracted from form state
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, "Purchase cost price cannot be a negative number."],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Please provide the retail MRP selling price."],
      min: [0, "Selling price cannot be a negative number."],
    },
    // Matrix tracking inventory counts dynamically for EU Shoe sizes as strings
    sizeQuantities: {
      type: Map,
      of: Number,
      default: {},
      // Example saved format inside MongoDB:
      // "42": 12, "43": 5, "24": 2
    },
  },
  {
    timestamps: true, // Captures system-wide logistics transaction history logs
  }
);

// Next.js hot-reload persistence protection rule
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;