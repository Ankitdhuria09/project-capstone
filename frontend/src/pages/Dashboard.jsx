import { aiParseTransaction } from "../utils/aiparser";
import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import Onboarding from "../components/Onboarding";

const wiseTips = [
  "Always pay yourself first—save at least 20% of your income before spending on anything else.",
  "Track every expense to uncover hidden leaks in your budget.",
  "Build an emergency fund that covers at least 6 months of living expenses.",
  "Avoid impulse purchases by waiting 24 hours before buying.",
  "Invest early—compound interest is your strongest ally.",
  "Review your subscriptions and cancel those you don't use.",
  "Don't borrow for depreciating assets; avoid bad debt.",
  "Set clear financial goals and review your progress each month.",
  "Diversify your investments to balance risk and reward.",
  "Shop with a list to avoid unnecessary spending.",
  "Automate your savings and investments to stay consistent.",
  "Negotiate bills and ask for better deals wherever possible.",
  "Monitor your credit score and work to improve it.",
  "Plan major expenses ahead to avoid straining your budget.",
  "Reinvest dividends and returns for faster growth.",
  "Distinguish between wants and needs before making purchases.",
  "Review your insurance coverage annually.",
  "Keep learning about personal finance—the rules keep evolving.",
  "Use cashback and reward points wisely, not as justification for spending.",
  "Avoid lifestyle inflation—raise your saving rate as your income grows.",
];

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading2, setLoading2] = useState(true);
  const [currentTip, setCurrentTip] = useState("");
  const [quickText, setQuickText] = useState("");
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [transRes, budgetRes, goalRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/budgets"),
        api.get("/goals"),
      ]);

      setTransactions(transRes.data);
      setBudgets(budgetRes.data);
      setGoals(goalRes.data);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    const token = localStorage.getItem("token");
    const onboardingComplete = localStorage.getItem("onboardingComplete");

    if (token && !onboardingComplete) {
      setShowOnboarding(true);
    }
    setLoading2(false);

    // Set random tip
    const randomIndex = Math.floor(Math.random() * wiseTips.length);
    setCurrentTip(wiseTips[randomIndex]);

    // Fetch data
    fetchDashboardData();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Early returns after hooks
  if (loading2) {
    return <div>Loading...</div>;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Calculations
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Chart data
  const chartData = [
    { name: "Income", value: income, color: "#10B981" },
    { name: "Expenses", value: expenses, color: "#EF4444" },
  ];

  const categoryTotals = transactions.reduce((acc, t) => {
    if (t.type === "expense") {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    }
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: key,
    value,
  }));

  const postTransaction = async (transaction) => {
  try {
    const response = await api.post("/transactions", transaction);
    return response.data;
  } catch (error) {
    console.error("Error saving transaction:", error.response?.data || error.message);
    throw error;
  }
};


  // Handle AI parsing

  const handleQuickAdd = async () => {
    if (!quickText.trim()) return;
    if (!API_KEY) {
      alert(
        "API key not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables."
      );
      return;
    }

    setIsLoading(true);
    try {
      const parsed = await aiParseTransaction(quickText, API_KEY);
      if (!parsed) {
        alert("Could not parse transaction. Please try rephrasing your input.");
        return;
      }
      await postTransaction(parsed);
      setParsedTransactions([parsed, ...parsedTransactions]);
      setQuickText("");
      alert("Transaction added successfully!");
    } catch (err) {
      console.error("Error:", err);
      alert(
        err.message || "Failed to add transaction. See console for details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="bg-white rounded-xl shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's your financial overview.
        </p>
      </motion.div>

      {/* Wise Tip */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-start">
          <span className="text-2xl">💡</span>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-blue-900">Wise Tip:-</h3>
            <p className="text-blue-700 mt-1">{currentTip}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Add Transaction */}
      <motion.div
        className="bg-white rounded-xl shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div>
          <p className="text-xl text-gray-600 mx-auto">
            {" "}
            Simply type what you did with your money, Let Wise money organise it
          </p>
        </div>
        <div>
          <div className="flex gap-2 mt-2">
            <div className="flex-1">
              <input
                type="text"
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                placeholder="E.g. Bought groceries for ₹500"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleQuickAdd()}
              />
              <button
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleQuickAdd}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Transaction"}
              </button>
            </div>
          </div>

          {/* Parsed Transactions Preview */}
          {parsedTransactions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">
                Quick Added Transactions (Preview)
              </h3>
              <div className="space-y-2">
                {parsedTransactions.slice(0, 5).map((t, index) => (
                  <div
                    key={index}
                    className="border-b py-2 flex justify-between"
                  >
                    <span>{t.description}</span>
                    <span
                      className={
                        t.type === "income" ? "text-green-600" : "text-red-600"
                      }
                    >
                      {t.type === "income" ? "+" : "-"}₹{t.amount} ({t.category}
                      )
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Income", value: income, color: "green", icon: "💰" },
          {
            label: "Total Expenses",
            value: expenses,
            color: "red",
            icon: "💸",
          },
          {
            label: "Net Balance",
            value: balance,
            color: balance >= 0 ? "blue" : "yellow",
            icon: balance >= 0 ? "📊" : "⚠️",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 bg-${card.color}-100 rounded-full flex items-center justify-center`}
              >
                <span className={`text-${card.color}-600 text-lg`}>
                  {card.icon}
                </span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {card.label}
                </p>
                <p className={`text-2xl font-bold text-${card.color}-600`}>
                  ₹{card.value.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Income vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) =>
                  `${name}: ₹${value.toLocaleString()}`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category-wise Expenses */}
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expenses by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h3>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Description", "Category", "Amount", "Date", "Type"].map(
                    (head, i) => (
                      <th
                        key={i}
                        className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {transaction.category}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      <span
                        className={
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}₹
                        {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">
            No transactions yet. Start by adding your first transaction!
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default Dashboard;
