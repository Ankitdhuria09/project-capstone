import mongoose from "mongoose";
import express from "express";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all budgets including categories without budget
router.get("/", async (req, res) => {
  try {
    // 1️⃣ Get all transactions grouped by category for this user
    const transactionsByCategory = await Transaction.aggregate([
      { $match: { userId: req.user.id, type: "expense" } },
      { $group: { _id: "$category", spent: { $sum: "$amount" } } }
    ]);

    // Convert to a map for easy lookup
    const spentMap = {};
    transactionsByCategory.forEach(t => {
      spentMap[t._id.toLowerCase()] = t.spent;
    });

    // 2️⃣ Get all existing budgets for this user
    const budgets = await Budget.find({ userId: req.user.id });

    // Convert to a map for lookup
    const budgetMap = {};
    budgets.forEach(b => {
      budgetMap[b.category.toLowerCase()] = b;
    });

    // 3️⃣ Merge categories from transactions and budgets
    const allCategories = new Set([
      ...Object.keys(spentMap),
      ...budgets.map(b => b.category.toLowerCase())
    ]);

    const result = Array.from(allCategories).map(category => {
      const budget = budgetMap[category];
      const spent = spentMap[category] || 0;
      const limit = budget?.limit || 0;
      const percentage = limit > 0 ? (spent / limit) * 100 : spent > 0 ? 100 : 0;

      return {
        _id: budget?._id || null,   // 👈 include _id if budget exists
        category: budget?.category || category,  // preserve original name if budget exists
        limit,
        spent,
        percentage: Math.min(percentage, 100)
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ error: err.message });
  }
});


// POST new budget
router.post("/", async (req, res) => {
  try {
    const { category, limit } = req.body;

    if (!category || limit == null) {
      return res.status(400).json({ error: "Category and limit are required" });
    }

    if (limit < 0) {
      return res.status(400).json({ error: "Limit must be non-negative" });
    }

    // Check if budget already exists for this user and category
    const existingBudget = await Budget.findOne({ userId: req.user.id, category });
    if (existingBudget) {
      return res.status(200).json(existingBudget); // Return existing instead of error
    }

    const budget = new Budget({ userId: req.user.id, category, limit });
    await budget.save();
    res.status(201).json(budget);

  } catch (err) {
    console.error("Error creating budget:", err);
    res.status(500).json({ error: err.message });
  }
});


// PUT update budget
router.put("/:id", async (req, res) => {
  try {
    const updated = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, 
      req.body, 
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Budget not found" });
    }
    
    res.json(updated);
  } catch (err) {
    console.error("Error updating budget:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE budget

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid budget ID" });
    }

    const deleted = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;