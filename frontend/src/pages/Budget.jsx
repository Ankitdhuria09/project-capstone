import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({ category: '', limit: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/budgets');
      setBudgets(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch budgets');
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Add new budget
  const addBudget = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = { 
      category: formData.category, 
      limit: Number(formData.limit) 
    };
    await api.post('/budgets', payload);
    setFormData({ category: '', limit: '' });
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add budget');
    } finally {
      setSaving(false);
    }
  };

  // Update budget
  const updateBudget = async (id, updatedLimit) => {
    try {
      await api.put(`/budgets/${id}`, { limit: updatedLimit });
      fetchBudgets();
    } catch (err) {
      setError('Failed to update budget');
    }
  };

  // Delete budget
  const deleteBudget = async (id) => {
    console.log("Deleting budget with id:", id);
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <p className="text-gray-600">Set spending limits for different categories</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Budget Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Budget</h2>
        
        <form onSubmit={addBudget} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              name="category"
              placeholder="e.g., Food, Transport, Entertainment"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Limit
            </label>
            <input
              type="number"
              name="limit"
              placeholder="Enter amount"
              value={formData.limit}
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
              {saving ? 'Adding...' : 'Add Budget'}
            </button>
          </div>
        </form>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Budgets</h3>
          {budgets.length > 0 && (
            <p className="text-sm text-gray-600">{budgets.length} categories tracked</p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : budgets.length > 0 ? (
          <div className="grid gap-6">
            {budgets.map((budget) => {
              const spent = budget.spent || 0;
              const limit = budget.limit || 0;
              const remaining = limit - spent;
              const percentage = limit > 0 ? (spent / limit) * 100 : 100;
              const isOverBudget = remaining < 0;
              const noBudget = limit === 0;

              return (
                <div key={budget._id || budget.category} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{budget.category}</h4>
                      <p className="text-sm text-gray-600">
                        Spent: ₹{spent.toLocaleString()} / {noBudget ? "No budget set" : `₹${limit.toLocaleString()}`}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!noBudget && (
                        <button
                          onClick={() => {
                            const newLimit = prompt('Enter new limit:', limit);
                            if (newLimit && !isNaN(newLimit)) {
                              updateBudget(budget._id, parseFloat(newLimit));
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                      )}
                      {budget._id && (
  <button
    onClick={() => deleteBudget(budget._id)}
    className="text-red-600 hover:text-red-800 text-sm"
  >
    Delete
  </button>
)}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {!noBudget && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{percentage.toFixed(1)}% used</span>
                        <span>₹{remaining.toLocaleString()} remaining</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            isOverBudget 
                              ? 'bg-red-500' 
                              : percentage > 80 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Messages */}
                  <div className={`${noBudget ? 'bg-red-50 border-red-200' : isOverBudget ? 'bg-red-50 border-red-200' : percentage > 80 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border rounded-md p-3`}>
                    <div className="flex items-center">
                      {noBudget ? (
                        <>
                          <span className="text-red-500 mr-2">⚠️</span>
                          <span className="text-red-800 text-sm font-medium">
                            No budget set for this category!
                          </span>
                        </>
                      ) : isOverBudget ? (
                        <>
                          <span className="text-red-500 mr-2">⚠️</span>
                          <span className="text-red-800 text-sm font-medium">
                            Over budget by ₹{(-remaining).toLocaleString()}!
                          </span>
                        </>
                      ) : percentage > 80 ? (
                        <>
                          <span className="text-yellow-500 mr-2">⚡</span>
                          <span className="text-yellow-800 text-sm font-medium">
                            Approaching budget limit
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-green-500 mr-2">✅</span>
                          <span className="text-green-800 text-sm font-medium">
                            On track with spending
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
            <p className="text-gray-600 mb-4">Start by creating your first budget to track spending limits.</p>
            <p className="text-sm text-gray-500">
              Tip: Set realistic budgets for categories like Food, Transport, and Entertainment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
