import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Invoice unique identifier string is required"],
      unique: true,
      trim: true,
      index: true,
    },

    items: {
      type: String,
      required: [true, "Description string of products sold is required"],
    },


    // Final selling amount
    amount: {
      type: Number,
      required: [
        true,
        "Numeric amount field is required for monetary calculations",
      ],
      min: [0, "Transaction revenue amount cannot be negative"],
    },


    // Single product selling price
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Unit price cannot be negative"],
    },


    // Product cost price for profit calculation
    costPrice: {
      type: Number,
      required: true,
      min: [0, "Cost price cannot be negative"],
    },


    // Automatically stored sale date
    saleDate: {
      type: Date,
      default: Date.now,
      index: true,
    },


    time: {
      type: String,
      default: "Just now",
    },


    status: {
      type: String,
      required: true,
      enum: ["Paid", "Pending", "Refunded"],
      default: "Paid",
      index: true,
    },


    productSku: {
      type: String,
      required: [
        true,
        "The model SKU linking back to the catalog item is required",
      ],
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


    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Card",
        "Bkash",
        "Nagad",
        "Bank",
      ],
      default: "Cash",
    },


    // Optional customer information
    customerName: {
      type: String,
      trim: true,
      default: "",
    },


    customerPhone: {
      type: String,
      trim: true,
      default: "",
    },


  },
  {
    timestamps: true,
  }
);


// Compound index for dashboard analytics
SaleSchema.index({
  saleDate: 1,
  status: 1,
});


const Sale =
  mongoose.models.Sale ||
  mongoose.model("Sale", SaleSchema);


export default Sale;