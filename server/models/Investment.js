
import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['stocks', 'mutual funds', 'crypto'],
    required: true
  }, // Stock, Mutual Fund, Crypto, etc.
  amount: { type: Number, required: true }, // Total invested
  units: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
});

export default mongoose.model("Investment", investmentSchema);
