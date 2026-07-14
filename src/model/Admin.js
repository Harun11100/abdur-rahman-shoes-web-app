import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required."],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address.",
      ],
    },

    employeeId: {
      type: String,
      required: [true, "Employee ID is required."],
      unique: true,
      uppercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["admin", "manager"],
      default: "admin",
      lowercase: true,
      required: true,
    },

    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: 6,
      select: false, // Prevents password from being returned unless explicitly selected
    },

    expoToken: {
      type: String,
      default: "",
    },

    image: {
      public_id: {
            type: String,
            default: "",
      },
      url: {
            type: String,
            default: "",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Performance indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ employeeId: 1 });
AdminSchema.index({ role: 1 });

export default mongoose.models.Admin ||
  mongoose.model("Admin", AdminSchema);