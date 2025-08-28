import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: '', limit: '' });

  // Fetch budgets
  const fetchBudgets = async () => {
    const res = await axios.get('http://localhost:5000/api/budgets');
    setBudgets(res.data);
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Add new budget
  const addBudget = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/budgets', form);
    setForm({ category: '', limit: '' });
    fetchBudgets();
  };

  // Update budget
  const updateBudget = async (id, updatedLimit) => {
    await axios.put(`http://localhost:5000/api/budgets/${id}`, { limit: updatedLimit });
    fetchBudgets();
  };

  // Delete budget
  const deleteBudget = async (id) => {
    await axios.delete(`http://localhost:5000/api/budgets/${id}`);
    fetchBudgets();
  };

  return (
    <div>
      <h2>Budgets</h2>

      {/* Budget Form */}
      <form onSubmit={addBudget}>
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Monthly Limit"
          value={form.limit}
          onChange={(e) => setForm({ ...form, limit: e.target.value })}
          required
        />
        <button type="submit">Add Budget</button>
      </form>

      {/* Budget List */}
      {/* Budget List */}
<ul>
  {budgets.map((budget) => {
    const progress = Math.min((budget.spent / budget.limit) * 100, 100);

    return (
      <li key={budget._id} style={{ marginBottom: '20px' }}>
        <strong>{budget.category}</strong>  
        <br />
        Spent: ₹{budget.spent} / ₹{budget.limit}
        <br />
        <progress value={budget.spent} max={budget.limit}></progress>
        <span> {progress.toFixed(0)}%</span>
        <br />
        {budget.spent > budget.limit && (
          <span style={{ color: 'red' }}>⚠ Overspending!</span>
        )}
        <br />
        <button
          onClick={() => {
            const newLimit = prompt('Enter new limit:', budget.limit);
            if (newLimit) updateBudget(budget._id, newLimit);
          }}
        >
          Edit
        </button>
        <button onClick={() => deleteBudget(budget._id)}>Delete</button>
      </li>
    );
  })}
</ul>

    </div>
  );
};

export default Budgets;
