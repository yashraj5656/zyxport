import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    mode: {
      type: String,
      required: true,
      enum: ["SQUAD TPP", "SOLO TPP", "DUO TPP", "SQUAD FPP", "SOLO FPP"],
    },
    map: {
      type: String,
      required: true,
      enum: ["Erangel", "Miramar", "Sanhok", "Vikendi", "Livik"],
    },
    entry: { type: Number, required: true, min: 0 },
    prize: { type: Number, required: true, min: 0 },
    slots: { type: Number, required: true, min: 1, default: 100 },
    filled: { type: Number, default: 0, min: 0 },
    date: { type: String, required: true },
    startTime: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Filling Fast", "Almost Full", "Full", "Completed", "Cancelled"],
      default: "Open",
    },
    color: {
      type: String,
      enum: ["green", "purple", "orange"],
      default: "green",
    },

    // 👇 NEW: room credentials
    roomId: { type: String, default: "", trim: true },
    roomPassword: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Tournament ||
  mongoose.model("Tournament", TournamentSchema);