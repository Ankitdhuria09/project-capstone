import React, { useState, useEffect } from "react";
import api from "../lib/api";
import { Button } from "./ui/button";

export default function GroupModal({ group, onClose }) {
  const [name, setName] = useState(group?.name || "");
  const [members, setMembers] = useState(group?.members?.map(m => m._id) || []);
  const [expense, setExpense] = useState({ description: "", amount: 0, paidBy: "", splitBetween: [] });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch all users for selection
    api.get("/users").then(res => setUsers(res.data));
  }, []);

  const handleCreateGroup = async () => {
    await api.post("/groups", { name, memberIds: members });
    onClose();
  };

  const handleAddExpense = async () => {
    await api.post(`/groups/${group._id}/expense`, {
      ...expense,
      splitBetweenIds: expense.splitBetween,
      paidById: expense.paidBy,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        {!group ? (
          <>
            <h3 className="text-lg font-semibold mb-4">Create Group</h3>
            <input type="text" placeholder="Group Name" value={name} onChange={e => setName(e.target.value)} className="w-full mb-2 p-2 border rounded"/>
            <select multiple value={members} onChange={e => setMembers([...e.target.selectedOptions].map(o => o.value))} className="w-full mb-2 border p-2 rounded">
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
            <Button onClick={handleCreateGroup}>Create</Button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">Add Expense</h3>
            <input type="text" placeholder="Description" value={expense.description} onChange={e => setExpense({...expense, description: e.target.value})} className="w-full mb-2 p-2 border rounded"/>
            <input type="number" placeholder="Amount" value={expense.amount} onChange={e => setExpense({...expense, amount: e.target.value})} className="w-full mb-2 p-2 border rounded"/>
            <select value={expense.paidBy} onChange={e => setExpense({...expense, paidBy: e.target.value})} className="w-full mb-2 border p-2 rounded">
              <option value="">Paid By</option>
              {group.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <select multiple value={expense.splitBetween} onChange={e => setExpense({...expense, splitBetween: [...e.target.selectedOptions].map(o => o.value)})} className="w-full mb-2 border p-2 rounded">
              {group.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </>
        )}
        <Button variant="outline" className="mt-2 w-full" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
