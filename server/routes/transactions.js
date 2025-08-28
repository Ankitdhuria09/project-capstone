import express from "express";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

const router = express.Router();

// GET all
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new transaction (auto create budget category if missing)
router.post("/", async (req, res) => {
  try {
    const { description, amount, category, type } = req.body;
    const transaction = new Transaction({ description, amount, category, type });
    await transaction.save();

    const existingBudget = await Budget.findOne({ category });
    if (!existingBudget) {
      await new Budget({ category, limit: 0 }).save();
    }

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
