import { useState, useEffect } from "react";
import api from "../lib/api";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    targetAmount: "", 
    currentAmount: 0 
  });
  const [payment, setPayment] = useState({ amount: "" });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch all goals
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get("/goals");
      setGoals(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch goals");
      console.error("Error fetching goals:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add new goal
  const addGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await api.post("/goals", formData);
      setGoals([...goals, res.data]);
      setFormData({ name: "", description: "", targetAmount: "", currentAmount: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add goal");
      console.error("Error adding goal:", err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add payment to a goal
  const addPayment = async (goalId) => {
    if (!payment.amount || payment.amount <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    try {
      const res = await api.put(`/goals/${goalId}/add`, {
        amount: Number(payment.amount),
      });
      setGoals(goals.map(g => g._id === goalId ? res.data : g));
      setPayment({ amount: "" });
      setSelectedGoal(null);
    } catch (err) {
      setError("Failed to add payment");
      console.error("Error adding payment:", err.response?.data || err.message);
    }
  };

  // Delete goal
  const deleteGoal = async (goalId) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      await api.delete(`/goals/${goalId}`);
      setGoals(goals.filter(g => g._id !== goalId));
    } catch (err) {
      setError("Failed to delete goal");
      console.error("Error deleting goal:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Summary calculations
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
        <p className="text-gray-600">Track your savings goals and monitor progress</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Goals Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100">Total Target</p>
            <p className="text-2xl font-bold">₹{totalTarget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-100">Total Saved</p>
            <p className="text-2xl font-bold">₹{totalSaved.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-100">Overall Progress</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold">{overallProgress.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-blue-400 bg-opacity-50 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goal Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Goal</h2>
        
        <form onSubmit={addGoal} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Emergency Fund"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              placeholder="Brief description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Amount
            </label>
            <input
              type="number"
              name="targetAmount"
              placeholder="Target amount"
              value={formData.targetAmount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
          {goals.length > 0 && (
            <p className="text-sm text-gray-600">{goals.length} goals tracked</p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const percentage = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
              const isCompleted = goal.currentAmount >= goal.targetAmount;
              
              return (
                <div key={goal._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{goal.name}</h4>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => deleteGoal(goal._id)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                      title="Delete goal"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Saved:</span>
                      <span className="font-medium">₹{goal.currentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium">₹{goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium text-blue-600">
                        ₹{Math.max(0, goal.targetAmount - goal.currentAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">🎉</span>
                        <span className="text-green-800 text-sm font-medium">Goal Completed!</span>
                      </div>
                    </div>
                  ) : (
                    selectedGoal === goal._id ? (
                      <div className="space-y-3">
                        <input
                          type="number"
                          placeholder="Payment amount"
                          value={payment.amount}
                          onChange={(e) => setPayment({ amount: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => addPayment(goal._id)}
                            className="flex-1 bg-blue-600 text-white py-2 px-3 text-sm rounded-md hover:bg-blue-700"
                          >
                            Add Payment
                          </button>
                          <button
                            onClick={() => {
                              setSelectedGoal(null);
                              setPayment({ amount: "" });
                            }}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 text-sm rounded-md hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedGoal(goal._id)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add Payment
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first financial goal.</p>
            <p className="text-sm text-gray-500">
              Examples: Emergency Fund, Vacation, New Car, Home Down Payment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}