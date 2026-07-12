import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your full name."],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters."],
    },
    email: {
      type: String,
      required: [true, "Please provide an email address."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address.",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
      minlength: [6, "Password must be at least 6 characters long."],
      select: false, // Prevents password from being returned in API queries by default
    },
    role: {
      type: String,
      default: "admin",
    },

    image: {
      url: {
        type: String,
        default: "",
      },

      public_id: {
        type: String,
        default: "",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically creates 'createdAt' and 'updatedAt' fields
    timestamps: true, 
  }
);

// ⚠️ Next.js Hot-Reload Protection:
// Check if the model already exists before compiling a new one.
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default Admin;