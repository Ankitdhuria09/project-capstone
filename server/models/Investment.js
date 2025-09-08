import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['stocks', 'mutual funds', 'crypto'],
    required: true
  },
  amount: { type: Number, required: true },
  units: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Investment", investmentSchema);