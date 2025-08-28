import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
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

const API = "http://localhost:5000/api";

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedRange, setSelectedRange] = useState("month"); // today, week, month, year
  const [tip, setTip] = useState(
    "Track your expenses daily to avoid overspending and save smarter."
  );

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`${API}/transactions`);
        setTransactions(res.data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };
    fetchTransactions();
  }, []);

  // Filter transactions by selected range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const date = new Date(t.date);
      switch (selectedRange) {
        case "today":
          return (
            date.toDateString() === now.toDateString()
          );
        case "week": {
          const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
          return date >= firstDay;
        }
        case "month":
          return date.getMonth() === new Date().getMonth();
        case "year":
          return date.getFullYear() === new Date().getFullYear();
        default:
          return true;
      }
    });
  }, [transactions, selectedRange]);

  // Data for Income vs Expense Bar Chart
  const incomeExpenseData = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      labels: ["Income", "Expense"],
      datasets: [
        {
          label: "Amount",
          data: [income, expense],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    };
  }, [filteredTransactions]);

  // Data for Category-wise Pie Chart
  const categoryData = useMemo(() => {
    const categories = {};
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
          ],
        },
      ],
    };
  }, [filteredTransactions]);

  // Monthly Trend Line
  const trendData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const incomeByMonth = Array(12).fill(0);
    const expenseByMonth = Array(12).fill(0);

    filteredTransactions.forEach((t) => {
      const m = new Date(t.date).getMonth();
      if (t.type === "income") incomeByMonth[m] += t.amount;
      else if (t.type === "expense") expenseByMonth[m] += t.amount;
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeByMonth,
          borderColor: "#4caf50",
          backgroundColor: "#4caf5080",
          tension: 0.3,
        },
        {
          label: "Expense",
          data: expenseByMonth,
          borderColor: "#f44336",
          backgroundColor: "#f4433680",
          tension: 0.3,
        },
      ],
    };
  }, [filteredTransactions]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <h2>Analytics Dashboard</h2>

      {/* Wise Tip */}
      <div style={{ padding: 12, background: "#e0f7fa", borderRadius: 8, marginBottom: 20 }}>
        <strong>Wise Tip of the Day:</strong> {tip}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 20 }}>
        <label>Select Range: </label>
        <select value={selectedRange} onChange={(e) => setSelectedRange(e.target.value)}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gap: 40 }}>
        <div>
          <h4>Income vs Expense</h4>
          <Bar key={`bar-${selectedRange}`} data={incomeExpenseData} />
        </div>

        <div>
          <h4>Category-wise Spending</h4>
          <Pie key={`pie-${selectedRange}`} data={categoryData} />
        </div>

        <div>
          <h4>Monthly Trend</h4>
          <Line key={`line-${selectedRange}`} data={trendData} />
        </div>
      </div>
    </div>
  );
}
