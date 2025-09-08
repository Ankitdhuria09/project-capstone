import express from "express";
import Goal from "../models/Goal.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all goals for logged-in user
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ message: err.message });
  }
});

// Add goal
router.post("/", async (req, res) => {
  try {
    const { name, description, targetAmount, currentAmount = 0 } = req.body;
    
    if (!name || !targetAmount) {
      return res.status(400).json({ message: "Name and target amount are required" });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({ message: "Target amount must be positive" });
    }

    const goal = new Goal({ 
      userId: req.user.id, 
      name, 
      description, 
      targetAmount, 
      currentAmount 
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(400).json({ message: err.message });
  }
});

// Add payment to goal
router.put("/:id/add", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user.id });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.currentAmount += amount;
    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error("Error adding payment to goal:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update goal
router.put("/:id", async (req, res) => {
  try {
    const updated = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    res.json(updated);
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete goal
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Goal.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!deleted) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;