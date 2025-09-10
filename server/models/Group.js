// models/Group.js
import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paidBy: { type: String, required: true },
    splitBetween: [{ type: String, required: true }],
    date: { type: Date, default: Date.now },
    isSettlement: { type: Boolean, default: false },

    // ✅ structured settlement fields (no need to parse description)
    payer: { type: String },
    receiver: { type: String },
  },
  { _id: true, timestamps: true }
);

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: String, required: true }],
    balances: { type: Map, of: Number, default: {} }, // member -> balance
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

// Apply normal expense
GroupSchema.methods.applyExpenseToBalances = function (expense) {
  const { amount, paidBy, splitBetween } = expense;
  if (!amount || !splitBetween?.length) return;
  this.ensureMemberBalances();

  const share = amount / splitBetween.length;

  // Everyone owes their share
  splitBetween.forEach((m) => {
    this.balances.set(m, (this.balances.get(m) || 0) + share);
  });

  // Payer paid full amount
  this.balances.set(paidBy, (this.balances.get(paidBy) || 0) - amount);
};

// Apply settlement (payer → receiver)
GroupSchema.methods.applySettlement = function ({ payer, receiver, amount }) {
  this.ensureMemberBalances();

  const amt = Math.max(0, Number(amount) || 0);
  if (!amt || !payer || !receiver) return;

  this.balances.set(payer, (this.balances.get(payer) || 0) - amt);
  this.balances.set(receiver, (this.balances.get(receiver) || 0) + amt);
};

// ✅ Recalculate balances from scratch
GroupSchema.methods.recalculateBalances = function () {
  this.members.forEach((m) => this.balances.set(m, 0));

  this.expenses.forEach((exp) => {
    if (exp.isSettlement) {
      this.applySettlement({
        payer: exp.payer || exp.paidBy,
        receiver: exp.receiver,
        amount: exp.amount,
      });
    } else {
      this.applyExpenseToBalances(exp);
    }
  });
};

export default mongoose.model("Group", GroupSchema);
