import express from "express";
import Goal from "../models/Goal.js";

const router = express.Router();

// Get all goals
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add goal
router.post("/", async (req, res) => {
  try {
    const goal = new Goal(req.body);
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add payment
router.put("/:id/add", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.currentAmount += amount;
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
