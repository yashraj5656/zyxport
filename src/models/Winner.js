// models/Winner.js
import mongoose from "mongoose";

const WinnerSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rank: { type: Number, required: true, min: 1 },  // 1st, 2nd, 3rd
    prizeAmount: { type: Number, required: true, min: 0 },
    kills: { type: Number, default: 0, min: 0 },

    // 👇 Payout tracking
    paidToBank: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    payoutReference: { type: String, default: "" }, // UTR / transaction id
  },
  { timestamps: true }
);

// One winner per (tournament, user)
WinnerSchema.index({ tournament: 1, user: 1 }, { unique: true });

export default mongoose.models.Winner ||
  mongoose.model("Winner", WinnerSchema);