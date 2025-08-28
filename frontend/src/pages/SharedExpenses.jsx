import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/shared";

export default function SharedExpenses() {
  const [groups, setGroups] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", membersCsv: "" });
  const [me, setMe] = useState("");

  const [settleForm, setSettleForm] = useState({ groupId: null, payerId: "", receiverId: "", amount: "" });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ groupId: "", description: "", amount: "", paidBy: "", splitType: "equal", split: [] });

  // Fetch groups
  useEffect(() => {
    fetchGroups();
  }, []);

  
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API}/groups`);
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const allMembers = useMemo(() => {
    const arr = [];
    groups.forEach((g) => g.group.members.forEach((m) => arr.push(m)));
    const map = new Map();
    arr.forEach((m) => map.set(m.name, m));
    return [...map.values()];
  }, [groups]);

  const { totalYouOwe, totalOwedToYou } = useMemo(() => {
    if (!me) return { totalYouOwe: 0, totalOwedToYou: 0 };
    let owe = 0, owed = 0;
    groups.forEach((g) => {
      const meBal = g.balances.find((b) => b.name === me)?.balance || 0;
      if (meBal < 0) owe += Math.abs(meBal);
      if (meBal > 0) owed += meBal;
    });
    return { totalYouOwe: owe, totalOwedToYou: owed };
  }, [groups, me]);

  // Create group
  const createGroup = async () => {
    if (!newGroup.name.trim()) return alert("Enter group name");
    const members = newGroup.membersCsv.split(",").map((x) => x.trim()).filter(Boolean).map((name) => ({ name }));
    await axios.post(`${API}/groups`, { name: newGroup.name, description: newGroup.description, members });
    setShowCreate(false);
    setNewGroup({ name: "", description: "", membersCsv: "" });
    fetchGroups();
  };

  // Add Expense Modal
  const handleAddExpense = (group) => {
    setNewExpense({
      groupId: group.group._id,
      description: "",
      amount: "",
      paidBy: "",
      splitType: "equal",
      split: group.group.members.map((m) => ({ memberId: m._id, amount: "" })),
    });
    setShowExpenseModal(true);
  };

  const handleSettle = async () => {
  const { groupId, payerId, receiverId, amount } = settleForm;
  if (!payerId || !receiverId || !amount || amount <= 0) return alert("Fill all fields correctly");

  try {
    await axios.post(`${API}/groups/${groupId}/settle`, {
      payerId,
      receiverId,
      amount: Number(amount),
    });
    setSettleForm({ groupId: null, payerId: "", receiverId: "", amount: "" });
    fetchGroups(); // refresh balances
  } catch (err) {
    console.error("Error settling up:", err);
  }
};
  const submitNewExpense = async () => {
    try {
      const payload = {
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        paidBy: newExpense.paidBy,
        splitType: newExpense.splitType,
        split: newExpense.splitType === "custom" ? newExpense.split.map((s) => ({ memberId: s.memberId, amount: Number(s.amount) })) : undefined,
      };
      await axios.post(`${API}/groups/${newExpense.groupId}/expense`, payload);
      setShowExpenseModal(false);
      fetchGroups();
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <h2>Shared Expenses</h2>
      <p>Manage expenses and settle debts with your groups</p>

      {/* Top summary */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div style={card}>
          <div style={label}>Active Groups</div>
          <div style={big}>{groups.length}</div>
        </div>
        <div style={card}>
          <div style={label}>Total You Owe</div>
          <div style={big}>₹{totalYouOwe.toFixed(2)}</div>
        </div>
        <div style={card}>
          <div style={label}>Total Owed to You</div>
          <div style={big}>₹{totalOwedToYou.toFixed(2)}</div>
        </div>
        <div style={{ ...card, minWidth: 220 }}>
          <div style={label}>Who are you?</div>
          <select value={me} onChange={(e) => setMe(e.target.value)} style={{ padding: 8, width: "100%" }}>
            <option value="">(optional) Select your name</option>
            {allMembers.map((m) => (
              <option key={m._id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Create group toggle */}
      <button onClick={() => setShowCreate((s) => !s)}>
        {showCreate ? "Cancel" : "Create Group"}
      </button>
      {showCreate && (
        <div style={{ ...card, marginTop: 12 }}>
          <input placeholder="Group name" style={input} value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />
          <input placeholder="Description" style={input} value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} />
          <input placeholder="Members (comma separated)" style={input} value={newGroup.membersCsv} onChange={(e) => setNewGroup({ ...newGroup, membersCsv: e.target.value })} />
          <button onClick={createGroup}>Create</button>
        </div>
      )}

      {/* Group cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 20 }}>
        {groups.map((g) => (
          <div key={g.group._id} style={{ ...groupCard }}>
            <h3>{g.group.name}</h3>
            <p>{g.membersCount} members • {g.expensesCount} expenses</p>

            <h4>Members & Balances</h4>
            <ul>
              {g.balances.map((m) => (
                <li key={m.memberId}>
                  {m.name} {m.balance >= 0 ? "is owed" : "owes"} ₹{Math.abs(m.balance)}
                </li>
              ))}
            </ul>

            <h4>Recent Expenses</h4>
            <ul>
              {g.recentExpenses.map((e) => (
                <li key={e._id}>
                  {e.description} • Paid by {e.paidByName || e.paidBy} • ₹{e.amount}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 10 }}>
              <button onClick={() => handleAddExpense(g)}>Add Expense</button>
              {settleForm.groupId === g.group._id ? (
  <div style={{ marginTop: 10 }}>
    <h4>Settle Up</h4>
    <select
      value={settleForm.payerId}
      onChange={(e) => setSettleForm({ ...settleForm, payerId: e.target.value })}
      style={input}
    >
      <option value="">Select Payer</option>
      {g.balances.filter(b => b.balance < 0).map(m => (
        <option key={m.memberId} value={m.memberId}>{m.name} (owes ₹{Math.abs(m.balance)})</option>
      ))}
    </select>

    <select
      value={settleForm.receiverId}
      onChange={(e) => setSettleForm({ ...settleForm, receiverId: e.target.value })}
      style={input}
    >
      <option value="">Select Receiver</option>
      {g.balances.filter(b => b.balance > 0).map(m => (
        <option key={m.memberId} value={m.memberId}>{m.name} (is owed ₹{m.balance})</option>
      ))}
    </select>

    <input
      type="number"
      placeholder="Amount"
      value={settleForm.amount}
      onChange={(e) => setSettleForm({ ...settleForm, amount: e.target.value })}
      style={input}
    />

    <div style={{ marginTop: 8 }}>
      <button onClick={handleSettle} style={{ marginRight: 8 }}>Confirm</button>
      <button onClick={() => setSettleForm({ groupId: null, payerId: "", receiverId: "", amount: "" })}>Cancel</button>
    </div>
  </div>
) : (
  <button style={{ marginTop: 10 }} onClick={() => setSettleForm({ ...settleForm, groupId: g.group._id })}>
    Settle Up
  </button>
)}
            </div>
          </div>
        ))}
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Add Expense</h3>
            <input placeholder="Description" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} style={input} />
            <input placeholder="Amount" type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} style={input} />

            <select value={newExpense.paidBy} onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })} style={input}>
              <option value="">Select Payer</option>
              {groups.find(g => g.group._id === newExpense.groupId)?.group.members.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>

            <div>
              <label>
                <input type="radio" checked={newExpense.splitType === "equal"} onChange={() => setNewExpense({ ...newExpense, splitType: "equal" })} />
                Split Equally
              </label>
              <label style={{ marginLeft: 10 }}>
                <input type="radio" checked={newExpense.splitType === "custom"} onChange={() => setNewExpense({ ...newExpense, splitType: "custom" })} />
                Split Custom
              </label>
            </div>

            {newExpense.splitType === "custom" && newExpense.split.map((s) => {
              const member = groups.find(g => g.group._id === newExpense.groupId)?.group.members.find(m => m._id === s.memberId);
              return <div key={s.memberId}>
                <label>{member?.name}</label>
                <input type="number" value={s.amount} onChange={(e) => setNewExpense({ ...newExpense, split: newExpense.split.map(sp => sp.memberId === s.memberId ? { ...sp, amount: e.target.value } : sp) })} style={input} />
              </div>;
            })}

            <div style={{ marginTop: 10 }}>
              <button onClick={submitNewExpense}>Add</button>
              <button onClick={() => setShowExpenseModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- styles ---
const card = { padding: 12, border: "1px solid #ddd", borderRadius: 10, background: "#6aa86dff" };
const groupCard = { ...card, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" };
const input = { padding: 8, marginBottom: 8, width: "100%" };
const label = { fontSize: 12, color: "#555" };
const big = { fontSize: 24, fontWeight: 800 };
const modalOverlay ={ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" };
const modalContent = { background: "#f36060ff", padding: 20, borderRadius: 10, width: 400, maxWidth: "90%" };