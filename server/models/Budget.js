import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  limit: { type: Number, required: true },
});

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;
