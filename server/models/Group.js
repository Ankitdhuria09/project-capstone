// models/Group.js
import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paidBy: { type: String, required: true },
    splitBetween: [{ type: String, required: true }],
    date: { type: Date, default: Date.now },
    isSettlement: { type: Boolean, default: false }, // true for settleUp entries
  },
  { _id: true, timestamps: true }
);

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: String, required: true }],
    balances: { type: Map, of: Number, default: {} }, // member -> number
    expenses: [ExpenseSchema],
  },
  { timestamps: true }
);

// Ensure balances have all members
GroupSchema.methods.ensureMemberBalances = function () {
  this.members.forEach((m) => {
    if (typeof this.balances.get(m) !== "number") this.balances.set(m, 0);
  });
};

// Apply expense to balances using convention:
// +ve balance => member owes; -ve => member is owed
GroupSchema.methods.applyExpenseToBalances = function (expense) {
  const { amount, paidBy, splitBetween } = expense;
  if (!amount || !splitBetween?.length) return;
  this.ensureMemberBalances();

  const share = amount / splitBetween.length;

  // Everyone in splitBetween owes their share:
  splitBetween.forEach((m) => {
    this.balances.set(m, (this.balances.get(m) || 0) + share);
  });

  // Payer paid full amount, so reduce their balance by the total paid:
  this.balances.set(paidBy, (this.balances.get(paidBy) || 0) - amount);
};

// Apply settlement (direct transfer from payer -> receiver)
GroupSchema.methods.applySettlement = function ({ payer, receiver, amount }) {
  this.ensureMemberBalances();
  const p = this.balances.get(payer) || 0;     // should be positive (owes)
  const r = this.balances.get(receiver) || 0;  // should be negative (is owed)

  const amt = Math.max(0, Number(amount) || 0);
  if (!amt) return;

  this.balances.set(payer, p - amt);
  this.balances.set(receiver, r + amt);
};

export default mongoose.model("Group", GroupSchema);
