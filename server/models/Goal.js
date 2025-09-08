import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: String,
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Goal", goalSchema);