import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
}, { timestamps: true });

// Ensure unique category per user
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;