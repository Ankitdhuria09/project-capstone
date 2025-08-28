// backend/routes/investments.js
import express from "express";
import Investment from "../models/Investment.js";

const router = express.Router();

// CREATE investment
router.post("/", async (req, res) => {
  try {
    const { name, type, amount, units, currentPrice } = req.body;

    if (!name || !type || !amount) {
      return res.status(400).json({ error: "Name, type, and amount are required" });
    }

    const investment = new Investment({
      name,
      type,
      amount,
      units: units || 0,
      currentPrice: currentPrice || 0,
    });

    await investment.save();
    res.json(investment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all investments
router.get("/", async (req, res) => {
  try {
    const investments = await Investment.find();
    res.json(investments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE investment (for updating price, etc.)
router.put("/:id", async (req, res) => {
  try {
    const investment = await Investment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(investment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE investment
router.delete("/:id", async (req, res) => {
  try {
    await Investment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
