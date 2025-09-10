// routes/groups.js
import express from "express";
import Group from "../models/Group.js";

const router = express.Router();

// GET /api/groups - Fetch all groups
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });

    groups.forEach((g) => g.recalculateBalances());
    res.json(groups);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/groups - Create new group
router.post("/", async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name || !members || !members.length) {
      return res.status(400).json({ message: "name and members are required" });
    }

    const group = new Group({ name, members, expenses: [] });
    await group.save();

    res.status(201).json(group);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/groups/:id - Fetch group with recalculated balances
router.get("/:id", async (req, res) => {
  try {
    const g = await Group.findById(req.params.id);
    if (!g) return res.status(404).json({ message: "Group not found" });

    g.recalculateBalances();
    await g.save();

    res.json(g);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/groups/:id/expenses - Add expense
router.post("/:id/expenses", async (req, res) => {
  try {
    const g = await Group.findById(req.params.id);
    if (!g) return res.status(404).json({ message: "Group not found" });

    const { description, amount, paidBy, splitBetween = [], date } = req.body;
    if (!description || !amount || !paidBy || !splitBetween.length) {
      return res.status(400).json({
        message: "description, amount, paidBy, splitBetween are required",
      });
    }

    // Validate members
    const invalid = [paidBy, ...splitBetween].filter(
      (m) => !g.members.includes(m)
    );
    if (invalid.length) {
      return res
        .status(400)
        .json({ message: `Unknown member(s): ${invalid.join(", ")}` });
    }

    const exp = {
      description: String(description).trim(),
      amount: Number(amount),
      paidBy,
      splitBetween,
      date: date ? new Date(date) : new Date(),
      isSettlement: false,
    };

    g.expenses.unshift(exp);
    g.recalculateBalances();
    await g.save();

    res.status(201).json(g);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/groups/:id/settle - Record settlement
router.post("/:id/settle", async (req, res) => {
  try {
    const g = await Group.findById(req.params.id);
    if (!g) return res.status(404).json({ message: "Group not found" });

    const { payer, receiver, amount } = req.body;
    if (!payer || !receiver || !amount) {
      return res
        .status(400)
        .json({ message: "payer, receiver, amount are required" });
    }
    if (payer === receiver) {
      return res
        .status(400)
        .json({ message: "payer and receiver must be different" });
    }
    if (!g.members.includes(payer) || !g.members.includes(receiver)) {
      return res.status(400).json({ message: "Unknown member(s)" });
    }

    const settlement = {
      description: `Settlement: ${payer} → ${receiver}`,
      amount: Number(amount),
      paidBy: payer,
      splitBetween: [],
      date: new Date(),
      isSettlement: true,
      payer,
      receiver,
    };

    g.expenses.unshift(settlement);
    g.recalculateBalances();
    await g.save();

    res.status(201).json(g);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
