import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all transactions for logged-in user
router.get("/", async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const transactions = await Transaction.find({ userId: userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST new transaction (auto create budget category if missing)
router.post("/", async (req, res) => {
  try {
    const { description, amount, category, type } = req.body;
    
    // Validation
    if (!description || !amount || !category || !type) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const transaction = new Transaction({ 
      userId: userId,
      description, 
      amount, 
      category, 
      type 
    });
    await transaction.save();

    // Auto-create budget category if it doesn't exist
    const existingBudget = await Budget.findOne({ userId: userId, category });
    if (!existingBudget) {
      await new Budget({ userId: userId, category, limit: 0 }).save();
    }

    res.status(201).json(transaction);
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update transaction
router.put("/:id", async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body, 
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    res.json(updated);
  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE transaction
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Transaction.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!deleted) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;