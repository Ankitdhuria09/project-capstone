import mongoose from "mongoose";

const splitSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, required: true }, // points to group.members._id
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const sharedExpenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "SharedGroup", required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, required: true }, // group.members._id
    split: { type: [splitSchema], default: [] },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("SharedExpense", sharedExpenseSchema);
