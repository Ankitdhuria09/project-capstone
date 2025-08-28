import { useState, useEffect } from "react";
import axios from "axios";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", targetAmount: "", currentAmount: 0 });
  const [payment, setPayment] = useState({ amount: "" });
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Fetch all goals
  useEffect(() => {
    axios.get("http://localhost:5000/api/goals")
      .then(res => setGoals(res.data))
      .catch(err => console.error(err));
  }, []);

  // Add new goal
  const addGoal = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/goals", form);
      setGoals([...goals, res.data]);
      setForm({ name: "", description: "", targetAmount: "", currentAmount: 0 });
    } catch (err) {
      console.error("Error adding:", err.response?.data || err.message);
    }
  };

  // Add payment to a goal
  const addPayment = async (goalId) => {
    if (!payment.amount) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/goals/${goalId}/add`, {
        amount: Number(payment.amount),
      });
      setGoals(goals.map(g => g._id === goalId ? res.data : g));
      setPayment({ amount: "" });
      setSelectedGoal(null);
    } catch (err) {
      console.error("Error adding payment:", err.response?.data || err.message);
    }
  };

  // Summary calculations
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="goals-page">
      <h2>My Goals</h2>

      {/* Summary */}
      <div className="goals-summary">
        <h3>Summary</h3>
        <p>Total Target: ₹{totalTarget}</p>
        <p>Total Saved: ₹{totalSaved}</p>
        <p>Overall Progress: {overallProgress.toFixed(1)}%</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
        </div>
      </div>

      {/* Goal Form */}
      <form onSubmit={addGoal} className="goal-form">
        <input
          type="text"
          placeholder="Goal Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Target Amount"
          value={form.targetAmount}
          onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
          required
        />
        <button type="submit">Add Goal</button>
      </form>

      {/* Goal Cards */}
      <div className="goal-cards">
        {goals.map((g) => {
          const percentage = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
          return (
            <div key={g._id} className="goal-card">
              <h3>{g.name}</h3>
              <p>{g.description || "No description provided"}</p>
              <p>Target: ₹{g.targetAmount}</p>
              <p>Saved: ₹{g.currentAmount}</p>
              <p>Progress: {percentage.toFixed(1)}%</p>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
              </div>

              {selectedGoal === g._id ? (
                <div className="payment-form">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={payment.amount}
                    onChange={(e) => setPayment({ amount: e.target.value })}
                  />
                  <button onClick={() => addPayment(g._id)}>Add</button>
                  <button onClick={() => setSelectedGoal(null)}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setSelectedGoal(g._id)}>Add Payment</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
