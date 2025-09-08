import express from "express";
import Investment from "../models/Investment.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// CREATE investment
router.post("/", async (req, res) => {
  try {
    const { name, type, amount, units, currentPrice } = req.body;

    if (!name || !type || !amount) {
      return res.status(400).json({ error: "Name, type, and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    const investment = new Investment({
      userId: req.user.id,
      name,
      type,
      amount,
      units: units || 0,
      currentPrice: currentPrice || 0,
    });

    await investment.save();
    res.status(201).json(investment);
  } catch (err) {
    console.error("Error creating investment:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET all investments for logged-in user
router.get("/", async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(investments);
  } catch (err) {
    console.error("Error fetching investments:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE investment (for updating price, etc.)
router.put("/:id", async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body, 
      { new: true }
    );
    
    if (!investment) {
      return res.status(404).json({ error: "Investment not found" });
    }
    
    res.json(investment);
  } catch (err) {
    console.error("Error updating investment:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE investment
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Investment.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!deleted) {
      return res.status(404).json({ error: "Investment not found" });
    }
    
    res.json({ success: true, message: "Investment deleted successfully" });
  } catch (err) {
    console.error("Error deleting investment:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;