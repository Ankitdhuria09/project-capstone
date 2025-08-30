import React, { useState, useEffect } from "react";
import api from "../lib/api";

const InvestmentModal = ({ isOpen, onClose, onSubmit, investment }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "stocks",
    amount: "",
    units: "",
    currentPrice: ""
  });

  useEffect(() => {
    if (investment) {
      setFormData({
        name: investment.name || "",
        type: investment.type || "stocks",
        amount: investment.amount || "",
        units: investment.units || "",
        currentPrice: investment.currentPrice || ""
      });
    } else {
      setFormData({
        name: "",
        type: "stocks",
        amount: "",
        units: "",
        currentPrice: ""
      });
    }
  }, [investment, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {investment ? 'Edit Investment' : 'Add New Investment'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Apple Inc, Bitcoin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stocks">Stocks</option>
                <option value="mutual funds">Mutual Funds</option>
                <option value="crypto">Cryptocurrency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Invested Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Amount invested"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Units/Shares
              </label>
              <input
                type="number"
                value={formData.units}
                onChange={(e) => setFormData({...formData, units: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of units"
                min="0"
                step="0.001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Price per Unit
              </label>
              <input
                type="number"
                value={formData.currentPrice}
                onChange={(e) => setFormData({...formData, currentPrice: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Current market price"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {investment ? 'Update' : 'Add'} Investment
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/investments");
      setInvestments(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch investments");
      console.error("Error fetching investments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = async (formData) => {
    try {
      if (editingInvestment) {
        await api.put(`/investments/${editingInvestment._id}`, formData);
      } else {
        await api.post("/investments", formData);
      }
      
      setIsModalOpen(false);
      setEditingInvestment(null);
      fetchInvestments();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save investment");
    }
  };

  const handleEditInvestment = (investment) => {
    setEditingInvestment(investment);
    setIsModalOpen(true);
  };

  const handleDeleteInvestment = async (id) => {
    if (!confirm("Are you sure you want to delete this investment?")) return;

    try {
      await api.delete(`/investments/${id}`);
      fetchInvestments();
    } catch (err) {
      setError("Failed to delete investment");
    }
  };

  // Calculate portfolio summary
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const totalCurrentValue = investments.reduce((sum, inv) => {
    const currentValue = Number(inv.units || 0) * Number(inv.currentPrice || 0);
    return sum + currentValue;
  }, 0);
  const totalGainLoss = totalCurrentValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Investment Portfolio</h1>
            <p className="text-gray-600">Track your investments and monitor performance</p>
          </div>
          <button
            onClick={() => {
              setEditingInvestment(null);
              setIsModalOpen(true);
              setError("");
            }}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Investment
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">💼</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalInvested.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalCurrentValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${totalGainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                <span className={`${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'} text-lg`}>
                  {totalGainLoss >= 0 ? '📈' : '📉'}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gain/Loss</p>
              <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? '+' : ''}₹{totalGainLoss.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${gainLossPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                <span className={`${gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'} text-lg`}>%</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Return %</p>
              <p className={`text-2xl font-bold ${gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Investments ({investments.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : investments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units/Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invested Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {investments.map((investment) => {
                  const currentValue = Number(investment.units || 0) * Number(investment.currentPrice || 0);
                  const gainLoss = currentValue - Number(investment.amount || 0);
                  const gainLossPercent = investment.amount > 0 ? (gainLoss / investment.amount) * 100 : 0;

                  return (
                    <tr key={investment._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {investment.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {investment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(investment.units || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{Number(investment.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{Number(investment.currentPrice || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{currentValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}₹{gainLoss.toLocaleString()}
                          <div className="text-xs">
                            ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditInvestment(investment)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteInvestment(investment._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No investments tracked</h3>
            <p className="text-gray-600 mb-4">Start building your investment portfolio today.</p>
            <button
              onClick={() => {
                setEditingInvestment(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Add Your First Investment
            </button>
          </div>
        )}
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvestment(null);
        }}
        onSubmit={handleAddInvestment}
        investment={editingInvestment}
      />
    </div>
  );
}