import React, { useEffect, useState } from "react";
import api from "../api";
import { defaultCategories } from "../utlis/categories";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState(defaultCategories);

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTransaction = { description, amount, type, category };

    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, newTransaction);
        setEditingId(null);
      } else {
        await api.post("/transactions", newTransaction);
      }
      setDescription("");
      setAmount("");
      setCategory("");
      fetchTransactions();
    } catch (err) {
      console.error("Error saving transaction", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction", err);
    }
  };

  const handleEdit = (transaction) => {
    setDescription(transaction.description);
    setAmount(transaction.amount);
    setType(transaction.type);
    setCategory(transaction.category);
    setEditingId(transaction._id);
  };

  return (
    <div>
      <h2>Transactions</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        {/* Category dropdown with add new option */}
        <select
          value={category}
          onChange={(e) => {
            if (e.target.value === "new") {
              const userCat = prompt("Enter new category:");
              if (userCat) {
                setCategories([...categories, userCat]);
                setCategory(userCat);
              }
            } else {
              setCategory(e.target.value);
            }
          }}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="new">➕ Add New</option>
        </select>

        <button type="submit">
          {editingId ? "Update" : "Add"} Transaction
        </button>
      </form>

      <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t._id}>
              <td>{t.description}</td>
              <td>{t.amount}</td>
              <td>{t.type}</td>
              <td>{t.category}</td>
              <td>
                <button onClick={() => handleEdit(t)}>Edit</button>
                <button onClick={() => handleDelete(t._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
