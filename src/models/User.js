// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
        // 👇 Admin flag
        isAdmin: { type: Boolean, default: false },

    // 👇 Optional profile fields
    ign: {
      type: String,
      trim: true,
      default: "",
      maxlength: 32,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: 280,
    },
    avatar: {
      type: String,
      default: "", // could be a URL or emoji
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);