import { aiParseTransaction } from "../utils/aiparser";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";
import toast from "react-hot-toast";
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
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  LightBulbIcon,
  SparklesIcon,
  CreditCardIcon,
  PlusIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading2, setLoading2] = useState(true);
  const [currentTip, setCurrentTip] = useState("");
  const [quickText, setQuickText] = useState("");
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  const fetchDashboardData = async () => {
    const loadingToast = toast.loading("Loading your financial data...");
    try {
      const [transRes, budgetRes, goalRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/budgets"),
        api.get("/goals"),
      ]);

      setTransactions(transRes.data);
      setBudgets(budgetRes.data);
      setGoals(goalRes.data);
      toast.success("Dashboard loaded successfully!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to load dashboard data", { id: loadingToast });
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const onboardingComplete = localStorage.getItem("onboardingComplete");

    if (token && !onboardingComplete) {
      setShowOnboarding(true);
    }
    setLoading2(false);

    const randomIndex = Math.floor(Math.random() * wiseTips.length);
    setCurrentTip(wiseTips[randomIndex]);

    fetchDashboardData();
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading2) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600 animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = income - expenses;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

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

  const handleQuickAdd = async () => {
    if (!quickText.trim()) {
      toast.error("Please enter a transaction description");
      return;
    }

    if (!API_KEY) {
      toast.error("API key not configured. Please add VITE_OPENROUTER_API_KEY to your environment variables.");
      return;
    }

    const loadingToast = toast.loading("Processing your transaction...");
    setIsLoading(true);

    try {
      const parsed = await aiParseTransaction(quickText, API_KEY);
      if (!parsed) {
        toast.error("Could not parse transaction. Please try rephrasing your input.", { id: loadingToast });
        return;
      }

      await postTransaction(parsed);
      setParsedTransactions([parsed, ...parsedTransactions]);
      setQuickText("");

      fetchDashboardData();

      toast.success(`Transaction added: ${parsed.type === 'income' ? '+' : '-'}₹${parsed.amount}`, { id: loadingToast });
    } catch (err) {
      console.error("Error:", err);
      toast.error(err.message || "Failed to add transaction", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600 text-lg animate-pulse">Setting up your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-modern p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 rounded-full translate-y-10 -translate-x-10"></div>
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl lg:text-4xl font-bold text-slate-900 mb-2"
            >
              Welcome back, {localStorage.getItem("userName") || "User"}! 👋
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-600 text-base lg:text-lg"
            >
              Here's your financial overview for today
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="hidden lg:block"
          >
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
              <ChartBarIcon className="h-10 w-10 lg:h-12 lg:w-12 text-white" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Wise Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-modern p-6 bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200"
      >
        <div className="flex items-start space-x-4">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex-shrink-0"
          >
            <LightBulbIcon className="h-6 w-6 text-white" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 mb-2">💡 Daily Financial Wisdom</h3>
            <p className="text-amber-800 leading-relaxed">{currentTip}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Add Transaction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-modern p-6 lg:p-8"
      >
        <div className="flex items-center space-x-3 mb-6">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl"
          >
            <SparklesIcon className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI-Powered Quick Add</h2>
            <p className="text-slate-600">Simply describe what you did with your money</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder="E.g., 'Bought groceries for ₹500' or 'Received salary ₹50000'"
              className="input-modern text-base lg:text-lg"
              onKeyPress={(e) => e.key === "Enter" && handleQuickAdd()}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-gradient-success disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3"
            onClick={handleQuickAdd}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 spinner"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <PlusIcon className="h-5 w-5" />
                <span>Add Transaction</span>
              </div>
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {parsedTransactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-slate-50 rounded-xl overflow-hidden"
            >
              <h3 className="text-lg font-semibold mb-3 text-slate-900">
                Recently Added (Preview)
              </h3>
              <div className="space-y-2">
                {parsedTransactions.slice(0, 3).map((t, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                  >
                    <span className="font-medium text-slate-900">{t.description}</span>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-bold ${
                          t.type === "income" ? "text-emerald-600" : "text-red-500"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}₹{t.amount}
                      </span>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {t.category}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {[
          { 
            label: "Total Income", 
            value: income, 
            color: "emerald", 
            icon: ArrowTrendingUpIcon,
            gradient: "from-emerald-400 to-green-500"
          },
          {
            label: "Total Expenses",
            value: expenses,
            color: "red",
            icon: ArrowTrendingDownIcon,
            gradient: "from-red-400 to-rose-500"
          },
          {
            label: "Net Balance",
            value: balance,
            color: balance >= 0 ? "blue" : "amber",
            icon: CurrencyDollarIcon,
            gradient: balance >= 0 ? "from-blue-400 to-indigo-500" : "from-amber-400 to-orange-500"
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -5 }}
              className="card-modern p-6 hover-lift"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className={`text-2xl lg:text-3xl font-bold text-${card.color}-600 mt-2`}>
                    {balance < 0 && card.label === "Net Balance" ? "-" : ""}₹{Math.abs(card.value).toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 lg:p-4 bg-gradient-to-br ${card.gradient} rounded-2xl shadow-lg`}>
                  <Icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card-modern p-6 lg:p-8 hover-lift"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Income vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={40}
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

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card-modern p-6 lg:p-8 hover-lift"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Expenses by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-modern p-6 lg:p-8 hover-lift"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            Recent Transactions
          </h3>
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
            <span>View all</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  {["Description", "Category", "Amount", "Date", "Type"].map(
                    (head, i) => (
                      <th
                        key={i}
                        className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider"
                      >
                        {head}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 lg:px-6 py-4 font-medium text-slate-900">
                      {transaction.description}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 font-bold">
                      <span
                        className={
                          transaction.type === "income"
                            ? "text-emerald-600"
                            : "text-red-500"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}₹
                        {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-slate-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === "income"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg mb-4">
              No transactions yet. Start by adding your first transaction!
            </p>
            <button className="btn-gradient-primary">
              Add Your First Transaction
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Dashboard;