// models/Registration.js
import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    // Fake payment status — replace with real gateway later
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    // In-game identity provided by the player at registration time
    ign: { type: String, required: true, trim: true },
    uid: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    paidAt: { type: Date, default: null },
    paymentId: { type: String, default: "" },
  },
  { timestamps: true }
);

// One registration per user per tournament
RegistrationSchema.index({ user: 1, tournament: 1 }, { unique: true });

export default mongoose.models.Registration ||
  mongoose.model("Registration", RegistrationSchema);