// models/BankDetail.js
import mongoose from "mongoose";

const BankDetailSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    accountHolderName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifscCode: { type: String, required: true, trim: true, uppercase: true },
    bankName: { type: String, required: true, trim: true },
    upiId: { type: String, default: "", trim: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.BankDetail ||
  mongoose.model("BankDetail", BankDetailSchema);