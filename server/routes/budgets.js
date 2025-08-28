import express from "express";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// GET all budgets with spent percentage
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find();

    // for each budget, calculate spent percentage
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        // sum of expenses in this category
        const totalSpent = await Transaction.aggregate([
          { $match: { category: budget.category, type: "expense" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const spent = totalSpent.length > 0 ? totalSpent[0].total : 0;
        const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

        return {
          ...budget.toObject(),
          spent,
          percentage: Math.min(percentage, 100), // cap at 100%
        };
      })
    );

    res.json(budgetsWithSpent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new budget
router.post("/", async (req, res) => {
  try {
    const { category, limit } = req.body;
    const budget = new Budget({ category, limit });
    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update budget
router.put("/:id", async (req, res) => {
  try {
    const updated = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE budget
router.delete("/:id", async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
