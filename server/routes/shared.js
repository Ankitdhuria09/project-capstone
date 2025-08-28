// server/routes/shared.js
import express from "express";
import SharedGroup from "../models/SharedGroup.js";
import SharedExpense from "../models/SharedExpense.js";

const router = express.Router();

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/**
 GET /api/shared/groups
 returns an array of group summaries:
 [
   {
     group: { _id, name, description, members: [{_id,name,email}, ...] },
     membersCount,
     expensesCount,
     totalAmount,
     balances: [{ memberId, name, balance }, ...],
     recentExpenses: [{ _id, description, amount, date, paidByName, splitLabel }, ...]
   },
   ...
 ]
*/
router.get("/groups", async (req, res) => {
  try {
    
    // 1) load all groups (lean for plain objects)
    const groups = await SharedGroup.find().lean();
    if (!groups || groups.length === 0) {
      return res.json([]);
    }

    // 2) aggregate expenses grouped by groupId to avoid N queries
    const groupIds = groups.map((g) => g._id);
    const agg = await SharedExpense.aggregate([
      { $match: { groupId: { $in: groupIds } } },
      {
        $group: {
          _id: "$groupId",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          expenses: { $push: { _id: "$_id", description: "$description", amount: "$amount", date: "$date", paidBy: "$paidBy", split: "$split" } },
        },
      },
    ]);

    const aggMap = new Map(agg.map((a) => [String(a._id), a]));

    // 3) build summary per group
    const results = groups.map((g) => {
      const a = aggMap.get(String(g._id)) || { totalAmount: 0, count: 0, expenses: [] };

      // prepare balances keyed by memberId (strings)
      const memberIds = (g.members || []).map((m) => String(m._id));
      const balancesMap = {};
      memberIds.forEach((id) => (balancesMap[id] = 0));

      // compute balances: paid adds, splits subtract
      for (const e of a.expenses) {
        const paidId = String(e.paidBy);
        // defensive: if paidBy is not in group, skip adding
        if (balancesMap[paidId] !== undefined) balancesMap[paidId] += Number(e.amount || 0);
        // subtract each split share
        (e.split || []).forEach((s) => {
          const sid = String(s.memberId ?? s.user ?? s.member); // support different field names
          if (balancesMap[sid] === undefined) {
            // if member not found, skip but log
            console.warn(`split member ${sid} not in group ${g._id}`);
          } else {
            balancesMap[sid] -= Number(s.amount || 0);
          }
        });
      }

      // convert balances to array and round
      const balances = (g.members || []).map((m) => ({
        memberId: String(m._id),
        name: m.name,
        balance: round2(balancesMap[String(m._id)] || 0),
      }));

      // recent expenses (sorted desc by date) and map paidBy name
      const memberById = new Map((g.members || []).map((m) => [String(m._id), m]));
      const recentExpenses = (a.expenses || [])
        .sort((x, y) => new Date(y.date) - new Date(x.date))
        .slice(0, 3)
        .map((e) => ({
          _id: String(e._id),
          description: e.description,
          amount: round2(e.amount || 0),
          date: e.date,
          paidByName: (memberById.get(String(e.paidBy)) || {}).name || "Unknown",
          splitLabel: `Split ${Array.isArray(e.split) ? e.split.length : 0} ways`,
        }));

      return {
        group: {
          _id: String(g._id),
          name: g.name,
          description: g.description || "",
          members: (g.members || []).map((m) => ({ _id: String(m._id), name: m.name, email: m.email || "" })),
        },
        membersCount: (g.members || []).length,
        expensesCount: a.count || 0,
        totalAmount: round2(a.totalAmount || 0),
        balances,
        recentExpenses,
      };
    });

    return res.json(results);
  } catch (err) {
    console.error("ERROR GET /api/shared/groups:", err);
    return res.status(500).json({ error: "Server error fetching shared groups", details: err.message });
  }
});

/* other routes (GET single group summary, create group, add member, add expense) */

// Get single group summary (same shape as above for one group)
router.get("/groups/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const g = await SharedGroup.findById(groupId).lean();
    if (!g) return res.status(404).json({ error: "Group not found" });

    // get expenses for this group
    const a = await SharedExpense.aggregate([
      { $match: { groupId: g._id } },
      {
        $group: {
          _id: "$groupId",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          expenses: { $push: { _id: "$_id", description: "$description", amount: "$amount", date: "$date", paidBy: "$paidBy", split: "$split" } },
        },
      },
    ]);
    const data = a[0] || { totalAmount: 0, count: 0, expenses: [] };

    // compute balances
    const memberIds = (g.members || []).map((m) => String(m._id));
    const balancesMap = {}; memberIds.forEach((id) => (balancesMap[id] = 0));
    for (const e of data.expenses) {
      const paidId = String(e.paidBy);
      if (balancesMap[paidId] !== undefined) balancesMap[paidId] += Number(e.amount || 0);
      (e.split || []).forEach((s) => {
        const sid = String(s.memberId ?? s.user ?? s.member);
        if (balancesMap[sid] !== undefined) balancesMap[sid] -= Number(s.amount || 0);
      });
    }
    const balances = (g.members || []).map((m) => ({ memberId: String(m._id), name: m.name, balance: round2(balancesMap[String(m._id)] || 0) }));

    const memberById = new Map((g.members || []).map((m) => [String(m._id), m]));
    const recentExpenses = (data.expenses || [])
      .sort((x, y) => new Date(y.date) - new Date(x.date))
      .slice(0, 3)
      .map((e) => ({
        _id: String(e._id),
        description: e.description,
        amount: round2(e.amount || 0),
        date: e.date,
        paidByName: (memberById.get(String(e.paidBy)) || {}).name || "Unknown",
        splitLabel: `Split ${Array.isArray(e.split) ? e.split.length : 0} ways`,
      }));

    return res.json({
      group: { _id: String(g._id), name: g.name, description: g.description || "", members: (g.members || []).map(m => ({_id:String(m._id), name:m.name, email: m.email||""})) },
      membersCount: (g.members || []).length,
      expensesCount: data.count || 0,
      totalAmount: round2(data.totalAmount || 0),
      balances,
      recentExpenses,
    });
  } catch (err) {
    console.error("ERROR GET /api/shared/groups/:groupId", err);
    return res.status(500).json({ error: "Server error fetching group summary", details: err.message });
  }
});

// create group
router.post("/groups", async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const g = new SharedGroup({ name, description, members: members || [] });
    await g.save();
    return res.status(201).json(g);
  } catch (err) {
    console.error("ERROR POST /api/shared/groups", err);
    return res.status(400).json({ error: err.message });
  }
});

// add member
router.post("/groups/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, email } = req.body;
    const group = await SharedGroup.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });
    group.members.push({ name, email });
    await group.save();
    return res.status(201).json(group);
  } catch (err) {
    console.error("ERROR POST /api/shared/groups/:groupId/members", err);
    return res.status(400).json({ error: err.message });
  }
});

// add expense
router.post("/groups/:groupId/expenses", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description, amount, paidByMemberId, splitMode, splitMembers = [], splits = [] } = req.body;

    const group = await SharedGroup.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    // validate paidByMemberId is present
    const memberIds = (group.members || []).map((m) => String(m._id));
    if (!memberIds.includes(String(paidByMemberId))) return res.status(400).json({ error: "paidByMemberId not found in group" });

    // build split array
    let computedSplits = [];
    if (splitMode === "equal") {
      const targets = (splitMembers && splitMembers.length ? splitMembers.map(String) : memberIds);
      const per = round2(Number(amount) / targets.length);
      let running = 0;
      targets.forEach((mid, idx) => {
        const share = idx === targets.length - 1 ? round2(Number(amount) - running) : per;
        running = round2(running + share);
        computedSplits.push({ memberId: mid, amount: share });
      });
    } else if (splitMode === "custom") {
      const total = round2((splits || []).reduce((s, x) => s + Number(x.amount || 0), 0));
      if (total !== round2(Number(amount))) return res.status(400).json({ error: "custom splits must add up to amount" });
      computedSplits = (splits || []).map((s) => ({ memberId: String(s.memberId), amount: round2(Number(s.amount)) }));
    } else {
      return res.status(400).json({ error: "splitMode must be 'equal' or 'custom'" });
    }

    const expense = new SharedExpense({
      groupId,
      description,
      amount: round2(Number(amount)),
      paidBy: String(paidByMemberId),
      split: computedSplits,
    });
    await expense.save();
    return res.status(201).json(expense);
  } catch (err) {
    console.error("ERROR POST /api/shared/groups/:groupId/expenses", err);
    return res.status(400).json({ error: err.message });
  }
});

// Settle up debts inside a group
router.post('/groups/:groupId/settle', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { payerId, receiverId, amount } = req.body;

    const group = await SharedGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // record the settlement as a "settle-up expense"
    group.expenses.push({
      description: `Settle up: ${payerId} → ${receiverId}`,
      amount,
      paidBy: payerId,
      date: new Date(),
      splitAmong: [payerId, receiverId], // only between two people
      type: 'settle'
    });

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// POST /api/shared/groups/:groupId/expense
router.post("/groups/:groupId/expense", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description, amount, paidBy } = req.body;

    const group = await SharedGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.expenses.push({
      description,
      amount,
      paidBy,
      date: new Date(),
    });

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
