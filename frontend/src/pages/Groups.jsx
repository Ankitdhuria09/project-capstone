// src/pages/GroupsPage.jsx
import React, { use, useEffect, useMemo, useState } from "react";
import api from "../lib/api";

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Math.abs(Number(n) || 0)
  );
const formatDate = (s) =>
  new Date(s).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const currentUser =
    localStorage.getItem("userName") ;
  // Create Group modal
  const [showCreate, setShowCreate] = useState(false);
  const [cgName, setCgName] = useState("");
  const [cgMembers, setCgMembers] = useState("");
  // Add Expense modal
  const [showExpense, setShowExpense] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState("");
  const [exDesc, setExDesc] = useState("");
  const [exAmt, setExAmt] = useState("");
  const [exPaidBy, setExPaidBy] = useState("");
  const [exSplitBetween, setExSplitBetween] = useState([]);
  const [exDate, setExDate] = useState(() => new Date().toISOString().slice(0, 10));
  // Settle Up modal
  const [showSettle, setShowSettle] = useState(false);
  const [stlPayer, setStlPayer] = useState("");
  const [stlReceiver, setStlReceiver] = useState("");
  const [stlAmount, setStlAmount] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/groups");
        setGroups(res.data);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.message || e.message || "Failed to load groups");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalYouOwe = useMemo(() => {
    return groups.reduce((sum, g) => {
      const b = (g.balances && g.balances[currentUser]) || 0;
      return b > 0 ? sum + b : sum;
    }, 0);
  }, [groups, currentUser]);

  const totalOwedToYou = useMemo(() => {
    return groups.reduce((sum, g) => {
      const b = (g.balances && g.balances[currentUser]) || 0;
      return b < 0 ? sum + Math.abs(b) : sum;
    }, 0);
  }, [groups, currentUser]);

  const groupTotal = (g) =>
    (g.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const balanceStatus = (n) => {
    if (n > 0) return { label: "owes", className: "inline-block px-2 py-1 rounded-full border border-gray-200 text-xs text-red-800 bg-red-50" };
    if (n < 0) return { label: "is owed", className: "inline-block px-2 py-1 rounded-full border border-gray-200 text-xs text-green-800 bg-green-50" };
    return { label: "settled", className: "inline-block px-2 py-1 rounded-full border border-gray-200 text-xs" };
  };

  const openExpenseModal = (group) => {
    setActiveGroupId(group._id);
    setExDesc("");
    setExAmt("");
    setExPaidBy("");
    setExSplitBetween([]);
    setExDate(new Date().toISOString().slice(0, 10));
    setShowExpense(true);
  };

  const openSettleModal = (group) => {
    setActiveGroupId(group._id);
    const bs = group.balances || {};
    const receiver = Object.keys(bs)
      .filter((m) => m !== currentUser)
      .sort((a, b) => (bs[a] || 0) - (bs[b] || 0))[0] || "";
    setStlPayer("");
    setStlReceiver(receiver);
    const owed = Math.max(0, (bs[currentUser] || 0));
    setStlAmount(owed ? String(owed) : "");
    setShowSettle(true);
  };

  const createGroup = async (e) => {
    e.preventDefault();
    let members = cgMembers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!members.includes(currentUser)) {
      members.unshift(currentUser);
    }
    try {
      const res = await api.post("/groups", { name: cgName.trim(), members });
      setGroups((g) => [res.data, ...g]);
      setCgName("");
      setCgMembers("");
      setShowCreate(false);
    } catch (e2) {
      alert(e2?.response?.data?.message || e2.message);
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    const payload = {
      description: exDesc.trim(),
      amount: Number(exAmt),
      paidBy: exPaidBy,
      splitBetween: exSplitBetween,
      date: exDate,
    };
    try {
      const res = await api.post(`/groups/${activeGroupId}/expenses`, payload);
      setGroups((old) =>
        old.map((g) => (g._id === activeGroupId ? res.data : g))
      );
      setShowExpense(false);
    } catch (e2) {
      alert(e2?.response?.data?.message || e2.message);
    }
  };

  const settleUp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/groups/${activeGroupId}/settle`, {
        payer: stlPayer,
        receiver: stlReceiver,
        amount: Number(stlAmount),
      });
      setGroups((old) =>
        old.map((g) => (g._id === activeGroupId ? res.data : g))
      );
      setShowSettle(false);
    } catch (e2) {
      alert(e2?.response?.data?.message || e2.message);
    }
  };

  if (loading) return <div className="max-w-[1100px] mx-auto p-6"><div className="text-gray-500">Loading groups…</div></div>;
  if (err) return <div className="max-w-[1100px] mx-auto p-6"><div className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">{err}</div></div>;

  return (
    <div className="max-w-[1100px] mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shared Expenses</h1>
          <div className="text-gray-500">Manage expenses and settle debts with your groups</div>
        </div>
        <button
          className="px-3 py-2 bg-gray-900 text-white border border-gray-900 rounded-lg cursor-pointer hover:brightness-105"
          onClick={() => setShowCreate(true)}
        >
          ＋ Create Group
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-gray-500 text-sm">Active Groups</div>
          <div className="text-xl font-bold">{groups.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-gray-500 text-sm">Total You Owe</div>
          <div className="text-xl font-bold text-red-700">-{inr(totalYouOwe)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-gray-500 text-sm">Total Owed to You</div>
          <div className="text-xl font-bold text-green-700">{inr(totalOwedToYou)}</div>
        </div>
      </div>

      {/* Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {groups.map((g) => (
          <div key={g._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:scale-[1.01] transition-transform duration-120">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-bold">{g.name}</div>
                <div className="text-gray-500 text-sm">
                  {(g.members || []).length} members • {(g.expenses || []).length} expenses
                </div>
              </div>
              <div className="inline-block px-2 py-1 rounded-full border border-gray-200 text-xs">{inr(groupTotal(g))} total</div>
            </div>

            {/* Members & Balances */}
            <div className="mt-3">
              <div className="text-gray-500 text-sm">Members & Balances</div>
              <div className="grid gap-2">
                {(g.members || []).map((m) => {
                  const b = (g.balances && g.balances[m]) || 0;
                  const stat = balanceStatus(b);
                  return (
                    <div key={m} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-gray-900 text-white grid place-items-center text-xs mr-2">
                          {m.split(" ").map((x) => x[0]).join("").toUpperCase()}
                        </div>
                        <div className="font-semibold">{m}</div>
                      </div>
                      {b === 0 ? (
                        <span className="inline-block px-2 py-1 rounded-full border border-gray-200 text-xs">Settled</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={stat.className}>{stat.label}</span>
                          <span className={`inline-block px-2 py-1 rounded-full border text-xs ${b < 0 ? "text-green-800 bg-green-50 border-green-200" : "text-red-800 bg-red-50 border-red-200"}`}>
                            {b < 0 ? "" : "-"}
                            {inr(b)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="mt-3">
              <div className="text-gray-500 text-sm">Recent Expenses</div>
              <div className="grid gap-2">
                {(g.expenses || []).slice(0, 3).map((e) => (
                  <div key={e._id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-100">
                    <div>
                      <div className="font-semibold">{e.description}</div>
                      <div className="text-gray-500 text-xs">Paid by {e.paidBy} • {formatDate(e.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{inr(e.amount)}</div>
                      <div className="text-gray-500 text-xs">Split {e.splitBetween?.length || 0} ways</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-3 mt-3">
              <button
                className="px-3 py-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => openExpenseModal(g)}
              >
                ＋ Add Expense
              </button>
              <button
                className="px-3 py-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => openSettleModal(g)}
              >
                ⇄ Settle Up
              </button>
            </div>
          </div>
        ))}

        {/* Create New Group Card */}
        <div
          className="border-dashed border border-gray-200 grid place-items-center p-7 cursor-pointer rounded-xl bg-white hover:scale-[1.01] transition-transform duration-120"
          onClick={() => setShowCreate(true)}
        >
          <div className="text-base font-bold text-gray-500">＋ Create New Group</div>
          <div className="text-gray-500 text-sm">Start sharing expenses with friends or family</div>
        </div>
      </div>

      {/* CREATE GROUP MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/28 grid place-items-center z-50">
          <form
            className="w-full max-w-[460px] bg-white p-4 rounded-xl border border-gray-100"
            onSubmit={createGroup}
          >
            <div className="text-base font-bold">Create Group</div>
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Group Name</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={cgName}
              onChange={(e) => setCgName(e.target.value)}
              required
            />
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Members (comma separated)</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={cgMembers}
              onChange={(e) => setCgMembers(e.target.value)}
              placeholder="Alice, Bob, Charlie"
            />
            <div className="flex items-center gap-2 justify-end mt-4">
              <button
                type="button"
                className="px-3 py-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-gray-900 text-white border border-gray-900 rounded-lg cursor-pointer hover:brightness-105"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {showExpense && (
        <div className="fixed inset-0 bg-black/28 grid place-items-center z-50">
          <form
            className="w-full max-w-[460px] bg-white p-4 rounded-xl border border-gray-100"
            onSubmit={addExpense}
          >
            <div className="text-base font-bold">Add Expense</div>
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Description</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={exDesc}
              onChange={(e) => setExDesc(e.target.value)}
              required
            />
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Amount (INR)</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              type="number"
              min="0"
              step="0.01"
              value={exAmt}
              onChange={(e) => setExAmt(e.target.value)}
              required
            />
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Paid By</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={exPaidBy}
              onChange={(e) => setExPaidBy(e.target.value)}
              required
            >
              <option value="">Select a member</option>
              {(groups.find((g) => g._id === activeGroupId)?.members || []).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Split Between</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(groups.find((g) => g._id === activeGroupId)?.members || []).map((m) => {
                const on = exSplitBetween.includes(m);
                return (
                  <button
                    type="button"
                    key={m}
                    className={`px-2.5 py-1.5 rounded-full border cursor-pointer ${on ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200"}`}
                    onClick={() =>
                      setExSplitBetween((prev) =>
                        prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                      )
                    }
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Date</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              type="date"
              value={exDate}
              onChange={(e) => setExDate(e.target.value)}
            />
            <div className="flex items-center gap-2 justify-end mt-4">
              <button
                type="button"
                className="px-3 py-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => setShowExpense(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-gray-900 text-white border border-gray-900 rounded-lg cursor-pointer hover:brightness-105"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SETTLE UP MODAL */}
      {showSettle && (
        <div className="fixed inset-0 bg-black/28 grid place-items-center z-50">
          <form
            className="w-full max-w-[460px] bg-white p-4 rounded-xl border border-gray-100"
            onSubmit={settleUp}
          >
            <div className="text-base font-bold">Settle Up</div>
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Payer</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={stlPayer}
              onChange={(e) => setStlPayer(e.target.value)}
              required
            >
              <option value="">Select a payer</option>
              {(groups.find((g) => g._id === activeGroupId)?.members || []).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Receiver</label>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={stlReceiver}
              onChange={(e) => setStlReceiver(e.target.value)}
              required
            >
              <option value="">Select a receiver</option>
              {(groups.find((g) => g._id === activeGroupId)?.members || [])
                .filter((m) => m !== stlPayer)
                .map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
            </select>
            <label className="block mt-2.5 mb-1.5 text-sm text-gray-600">Amount</label>
            <input
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              type="number"
              min="0"
              step="0.01"
              value={stlAmount}
              onChange={(e) => setStlAmount(e.target.value)}
              required
            />
            <div className="flex items-center gap-2 justify-end mt-4">
              <button
                type="button"
                className="px-3 py-2 border border-gray-200 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => setShowSettle(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-gray-900 text-white border border-gray-900 rounded-lg cursor-pointer hover:brightness-105"
              >
                Settle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
