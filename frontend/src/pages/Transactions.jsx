import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { defaultCategories } from "../utlis/categories";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "",
  });
  const [categories, setCategories] = useState(defaultCategories);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, budgetRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/budgets"),
      ]);
      setTransactions(transRes.data);
      setBudgets(budgetRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCategoryChange = (e) => {
    if (e.target.value === "new") {
      const newCategory = prompt("Enter new category:");
      if (newCategory) {
        setCategories([...categories, newCategory]);
        setFormData({ ...formData, category: newCategory });
      }
    } else {
      setFormData({ ...formData, category: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, formData);
        setEditingId(null);
      } else {
        await api.post("/transactions", formData);
      }
      setFormData({ description: "", amount: "", type: "expense", category: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save transaction");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
    });
    setEditingId(transaction._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchData();
    } catch (err) {
      setError("Failed to delete transaction");
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ description: "", amount: "", type: "expense", category: "" });
  };

  // Filter & sort
  const filteredTransactions = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "amount") return b.amount - a.amount;
      return a.description.localeCompare(b.description);
    });

  // Calculate category summary
  const getCategorySummary = () => {
    const totals = transactions.reduce((acc, t) => {
      if (t.type === "expense") acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
    const budgetMap = {};
    budgets.forEach((b) => (budgetMap[b.category] = b.limit));
    return Object.entries(totals).map(([category, spent]) => ({
      category,
      spent,
      budget: budgetMap[category] || 0,
      remaining: (budgetMap[category] || 0) - spent,
    }));
  };

  const categorySummary = getCategorySummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600">Track your income and expenses</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Transaction Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? "Edit Transaction" : "Add New Transaction"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="col-span-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="Amount"
            className="col-span-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
            required
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="col-span-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select
            value={formData.category}
            onChange={handleCategoryChange}
            className="col-span-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="new">➕ Add New Category</option>
          </select>
          <div className="flex items-end space-x-2 col-span-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter & Sort */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Filter by Type</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="description">Description</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
            ) : filteredTransactions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8">No transactions found.</td></tr>
            ) : (
              filteredTransactions.map((t) => {
                const summary = categorySummary.find(c => c.category === t.category);
                return (
                  <tr key={t._id}>
                    <td className="px-6 py-4 text-sm font-medium">{t.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.category}</td>
                    <td className={`px-6 py-4 text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-sm ${summary?.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{summary?.remaining ?? 0}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button onClick={() => handleDelete(t._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
