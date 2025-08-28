import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
});

export default mongoose.model("Goal", goalSchema);
