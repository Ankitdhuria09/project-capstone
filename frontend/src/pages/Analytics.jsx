import React, { useEffect, useState, useMemo } from "react";
import api from "../lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedRange, setSelectedRange] = useState("month"); // today, week, month, year
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [transRes, budgetRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/budgets")
      ]);
      setTransactions(transRes.data || []);
      setBudgets(budgetRes.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load analytics data");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions by selected range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      if (!t.date) return false;
      const date = new Date(t.date);
      switch (selectedRange) {
        case "today":
          return date.toDateString() === now.toDateString();
        case "week": {
          const firstDay = new Date(now);
          firstDay.setDate(now.getDate() - now.getDay());
          firstDay.setHours(0, 0, 0, 0);
          const lastDay = new Date(firstDay);
          lastDay.setDate(firstDay.getDate() + 6);
          lastDay.setHours(23, 59, 59, 999);
          return date >= firstDay && date <= lastDay;
        }
        case "month":
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case "year":
          return date.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }, [transactions, selectedRange]);

  // Income vs Expense Data
  const incomeExpenseData = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      labels: ["Income", "Expense"],
      datasets: [
        {
          label: "Amount (₹)",
          data: [income, expense],
          backgroundColor: ["#10B981", "#EF4444"],
          borderColor: ["#059669", "#DC2626"],
          borderWidth: 1,
        },
      ],
    };
  }, [filteredTransactions]);

  // Category-wise Pie Data
  const categoryData = useMemo(() => {
    const categories = {};
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category || "Other";
        categories[cat] = (categories[cat] || 0) + (Number(t.amount) || 0);
      });

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
            "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    };
  }, [filteredTransactions]);

  // Monthly Trend Line Data
  const trendData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const incomeByMonth = Array(12).fill(0);
    const expenseByMonth = Array(12).fill(0);

    transactions.forEach((t) => {
      if (!t.date) return;
      const m = new Date(t.date).getMonth();
      if (t.type === "income") incomeByMonth[m] += Number(t.amount) || 0;
      else if (t.type === "expense") expenseByMonth[m] += Number(t.amount) || 0;
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeByMonth,
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Expense",
          data: expenseByMonth,
          borderColor: "#EF4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [transactions]);

  // Key metrics
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Detailed insights into your financial patterns</p>
      </div>

      {/* Smart Tip */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
        <div className="flex items-start">
          <span className="text-2xl">💡</span>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-cyan-900">Smart Financial Tip</h3>
            <p className="text-cyan-800 mt-1">
              Track expenses daily to avoid overspending. Aim to save at least 20% of your income.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard title="Income" value={totalIncome} color="green" icon="💰" />
          <MetricCard title="Expenses" value={totalExpense} color="red" icon="💸" />
          <MetricCard title="Net Savings" value={savings} color={savings >= 0 ? "blue" : "yellow"} icon={savings >= 0 ? "💙" : "⚠️"} />
          <MetricCard title="Savings Rate" value={`${savingsRate.toFixed(1)}%`} color="purple" icon="📊" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Income vs Expenses">
          <Bar data={incomeExpenseData} options={chartOptions} />
        </ChartCard>

        <ChartCard title="Expenses by Category">
          {categoryData.labels.length > 0 ? (
            <Pie data={categoryData} options={pieChartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No expense data available
            </div>
          )}
        </ChartCard>
      </div>

      {/* Monthly Trend */}
      <ChartCard title="Monthly Trend (Full Year)">
        <Line data={trendData} options={lineChartOptions} />
      </ChartCard>

      {/* Budget Performance */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const spent = budget.spent || 0;
              const progress = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
              return (
                <div key={budget._id || budget.category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{budget.category}</h4>
                    <span className={`text-sm ${progress > 100 ? 'text-red-600' : progress > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${progress > 100 ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    ₹{spent.toLocaleString()} / ₹{budget.limit.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
const MetricCard = ({ title, value, color, icon }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center">
      <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center`}>
        <span className={`text-${color}-600 text-lg`}>{icon}</span>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-xl font-bold text-${color}-600`}>{typeof value === "number" ? `₹${value.toLocaleString()}` : value}</p>
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="h-80">{children}</div>
  </div>
);

// Chart Options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `₹${context.parsed.y.toLocaleString()}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return '₹' + value.toLocaleString();
        }
      }
    }
  }
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return '₹' + value.toLocaleString();
        }
      }
    }
  }
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context) {
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((context.parsed / total) * 100).toFixed(1);
          return `${context.label}: ₹${context.parsed.toLocaleString()} (${percentage}%)`;
        }
      }
    }
  }
};
